from __future__ import annotations

import asyncio
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from config import settings
from services.data_repo import (
    MOCK_REVIEWS,
    fetch_all_properties,
    fetch_builders_map,
    fetch_pois,
    fetch_sentiment_map,
    fetch_trends_map,
)
from services.deduplicator import deduplicate_properties
from services.geo_utils import calculate_location_scores
from services.normalizer import clean_properties_list, normalize_locality, normalize_parsed_requirement
from services.openai_service import (
    analyze_sentiment,
    check_if_duplicate,
    generate_ai_explanation,
    mock_parse_query,
    parse_query_with_ai,
)


def _calculate_match_score(prop: dict[str, Any], req: dict[str, Any]) -> int:
    score = 100
    prop_loc = str(prop.get("locality") or "").strip().lower()
    req_loc = str(req.get("locality") or "").strip().lower()
    if prop_loc != req_loc:
        score -= 30
    req_bhk = req.get("bhk")
    if req_bhk is not None:
        try:
            req_bhk_val = int(req_bhk)
            prop_bhk_val = int(prop.get("bhk") or 0)
            if prop_bhk_val != req_bhk_val:
                score -= 20 * abs(prop_bhk_val - req_bhk_val)
        except (ValueError, TypeError):
            pass
    budget = req.get("budget_max")
    price = prop.get("price", 0)
    if budget and price > budget:
        excess = (price - budget) / budget
        score -= min(40, round(excess * 100))
    elif budget and price <= budget:
        savings = (budget - price) / budget
        score += min(5, round(savings * 10))
    status_pref = req.get("status_preference")
    if status_pref:
        is_ready = "ready" in str(prop.get("status") or "").lower()
        wants_ready = status_pref == "Ready to Move"
        if is_ready != wants_ready:
            score -= 15
    return max(0, min(100, score))


def _generate_explanation(
    prop: dict[str, Any],
    req: dict[str, Any],
    builder: dict[str, Any] | None,
    sentiment: dict[str, Any] | None,
) -> str:
    builder_rating = (
        f"developed by {builder['builder_name']} ({builder['reputation_score']}★)"
        if builder
        else "independent property"
    )
    budget_status = (
        "fits well within your budget limits"
        if req.get("budget_max") and prop.get("price", 0) <= req["budget_max"]
        else "is slightly above your specified budget"
        if req.get("budget_max")
        else "is a solid choice"
    )
    summary = ""
    if sentiment:
        summary = sentiment.get("sentiment_summary", "")[:120]
    return (
        f"This {prop.get('bhk')} BHK property {budget_status} and is {builder_rating}. "
        f"It matches your preference for '{prop.get('locality')}'. {summary}"
    ).strip()


async def execute_search(
    db: AsyncIOMotorDatabase,
    query: str,
    overrides: dict[str, Any] | None = None,
) -> dict[str, Any]:
    overrides = overrides or {}

    # If overrides are provided (e.g. from chat assistant or UI filters), bypass the expensive LLM query parsing
    if overrides and len(overrides) > 0:
        base = overrides
    else:
        base = await parse_query_with_ai(query)
        if not base:
            base = mock_parse_query(query)
    parsed = normalize_parsed_requirement({**base, **overrides})

    raw_props = await fetch_all_properties(db)
    cleaned = clean_properties_list(raw_props)

    async def dup_checker(a: dict[str, Any], b: dict[str, Any]) -> bool:
        return await check_if_duplicate(a, b)

    deduped = await deduplicate_properties(cleaned, dup_checker if settings.openai_configured else None)

    builders_map = await fetch_builders_map(db)
    sentiment_map = await fetch_sentiment_map(db)
    trends_map = await fetch_trends_map(db)
    pois = await fetch_pois(db)

    filtered = [
        p
        for p in deduped
        if str(p.get("city") or "").lower() == str(parsed.get("city") or "Pune").lower()
        and str(p.get("transaction_type") or "").lower() == str(parsed.get("transaction_type") or "Buy").lower()
        and (not parsed.get("vastu_compliant_only") or (p.get("vastu_score") or 0) >= 80)
    ]

    parsed_locality = parsed.get("locality")
    if parsed_locality:
        parsed_loc_lower = str(parsed_locality).lower()
        if any(str(p.get("locality") or "").lower() == parsed_loc_lower for p in filtered):
            filtered = [p for p in filtered if str(p.get("locality") or "").lower() == parsed_loc_lower]

    scored: list[dict[str, Any]] = []
    for prop in filtered:
        match_score = _calculate_match_score(prop, parsed)
        builder = builders_map.get(prop.get("builder_or_owner", ""))
        location_scores = calculate_location_scores(
            prop.get("latitude"), prop.get("longitude"), prop.get("locality", ""), pois
        )
        trend = trends_map.get(prop.get("locality", ""))
        trend_score = trend.get("trend_score", 75) if trend else 75
        builder_rep = builder.get("reputation_score", 4) * 20 if builder else 80

        price_factor = 80
        if trend and trend.get("quarterly_price_history"):
            q1 = trend["quarterly_price_history"][-1]["avg_price_per_sqft"]
            if q1 > 0 and prop.get("price_per_sqft"):
                pct = (q1 - prop["price_per_sqft"]) / q1
                price_factor = max(40, min(100, round(80 + pct * 100)))

        investment_score = round(trend_score * 0.4 + builder_rep * 0.4 + price_factor * 0.2)
        if investment_score >= 90:
            grade = "A+"
        elif investment_score >= 82:
            grade = "A"
        elif investment_score >= 75:
            grade = "B+"
        elif investment_score >= 68:
            grade = "B"
        else:
            grade = "C"

        scored.append(
            {
                **prop,
                "match_score": match_score,
                "investment_score": investment_score,
                "investment_grade": grade,
                "location_scores": location_scores,
            }
        )

    scored.sort(key=lambda p: p.get("match_score", 0), reverse=True)

    # Prepare explanation tasks for the top 3 recommendations in parallel to save time.
    explanation_tasks = []
    for idx, prop in enumerate(scored):
        if settings.openai_configured and idx < 3:
            explanation_tasks.append(generate_ai_explanation(prop, parsed))
        else:
            explanation_tasks.append(None)

    explanations = []
    if any(task is not None for task in explanation_tasks):
        active_tasks = [t for t in explanation_tasks if t is not None]
        results = await asyncio.gather(*active_tasks)
        res_idx = 0
        for task in explanation_tasks:
            if task is not None:
                explanations.append(results[res_idx])
                res_idx += 1
            else:
                explanations.append(None)
    else:
        explanations = [None] * len(scored)

    final: list[dict[str, Any]] = []
    for idx, prop in enumerate(scored):
        builder = builders_map.get(prop.get("builder_or_owner", ""))
        sentiment = sentiment_map.get(prop.get("locality", ""))
        explanation = explanations[idx]
        if not explanation:
            explanation = _generate_explanation(prop, parsed, builder, sentiment)
        final.append({**prop, "recommendation_explanation": explanation})

    builders: dict[str, Any] = {}
    sentiments: dict[str, Any] = {}
    trends: dict[str, Any] = {}

    for prop in final:
        bname = prop.get("builder_or_owner")
        if bname and bname in builders_map:
            builders[bname] = builders_map[bname]
        loc = prop.get("locality")
        if loc and loc in sentiment_map:
            sentiments[loc] = sentiment_map[loc]
        if loc and loc in trends_map:
            trends[loc] = trends_map[loc]

    loc = parsed.get("locality", "")
    if loc in sentiment_map:
        sentiments[loc] = sentiment_map[loc]
    if loc in trends_map:
        trends[loc] = trends_map[loc]

    reviews = MOCK_REVIEWS.get(loc) or [
        f"Nice residential area in {loc}.",
        f"Road infrastructure in {loc} has improved.",
    ]
    dynamic = await analyze_sentiment(reviews)
    if dynamic:
        sentiments[loc] = {
            "locality_name": loc,
            "sentiment_score": dynamic.get("sentiment_score", 75) / 100,
            "positive_themes": dynamic.get("positive_themes", []),
            "negative_themes": dynamic.get("negative_themes", []),
            "comment_count": len(reviews),
            "sentiment_summary": dynamic.get("sentiment_summary", ""),
        }

    return {
        "parsedRequirement": parsed,
        "properties": final,
        "builders": builders,
        "sentiments": sentiments,
        "trends": trends,
        "total_raw": len(raw_props),
        "total_unique": len({p["property_id"] for p in deduped}),
        "ai_mode": "openai" if settings.openai_configured else "fallback",
    }

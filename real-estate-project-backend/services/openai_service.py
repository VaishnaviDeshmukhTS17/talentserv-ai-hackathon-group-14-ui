from __future__ import annotations

import json
import re
from typing import Any

from openai import AsyncOpenAI

from config import settings
from services.normalizer import normalize_locality, normalize_parsed_requirement

_client: AsyncOpenAI | None = None


def get_openai_client() -> AsyncOpenAI | None:
    global _client
    if not settings.openai_configured:
        return None
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.openai_api_key)
    return _client


async def _chat_json(system: str, user: str) -> dict[str, Any] | None:
    client = get_openai_client()
    if not client:
        return None
    try:
        response = await client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        content = response.choices[0].message.content
        if not content:
            return None
        return json.loads(content)
    except Exception:
        return None


async def _chat_text(system: str, user: str) -> str | None:
    client = get_openai_client()
    if not client:
        return None
    try:
        response = await client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0.4,
        )
        return response.choices[0].message.content
    except Exception:
        return None


def mock_parse_query(query: str) -> dict[str, Any]:
    lowercase = query.lower()
    city = "Pune"
    locality = "Hinjewadi"
    transaction_type = "Buy"
    bhk = None
    budget_max = None
    property_type = "Apartment"
    status_preference = None
    preference_notes = ""

    if any(x in lowercase for x in ("bangalore", "bengaluru", "whitefield", "indiranagar")):
        city = "Bangalore"

    locality_map = [
        (("hinje", "hinja"), "Hinjewadi"),
        (("wakad",), "Wakad"),
        (("baner",), "Baner"),
        (("hadapsar", "hadaps"), "Hadapsar"),
        (("kharadi", "khara"), "Kharadi"),
        (("viman",), "Viman Nagar"),
        (("kothrud",), "Kothrud"),
        (("kalyani",), "Kalyani Nagar"),
        (("whitefield",), "Whitefield"),
        (("indiranagar",), "Indiranagar"),
        (("koramangala",), "Koramangala"),
    ]
    for keys, loc in locality_map:
        if any(k in lowercase for k in keys):
            locality = loc
            break

    if any(x in lowercase for x in ("rent", "rental", "pg", "lease", "monthly")):
        transaction_type = "Rent"

    for n, label in [(1, "1 bhk"), (2, "2 bhk"), (3, "3 bhk"), (4, "4 bhk")]:
        if label in lowercase or f"{n}bhk" in lowercase:
            bhk = n
            break

    lakh_match = re.search(r"under\s+(\d+(?:\.\d+)?)\s*(?:lakh|l|lac)", lowercase)
    cr_match = re.search(r"under\s+(\d+(?:\.\d+)?)\s*(?:cr|crore)", lowercase)
    k_match = re.search(r"under\s+(\d+)\s*(?:k|thousand)", lowercase)
    if lakh_match:
        budget_max = int(round(float(lakh_match.group(1)) * 100_000))
    elif cr_match:
        budget_max = int(round(float(cr_match.group(1)) * 10_000_000))
    elif k_match:
        budget_max = int(k_match.group(1)) * 1000

    if any(x in lowercase for x in ("villa", "house", "bungalow")):
        property_type = "Villa"
    if any(x in lowercase for x in ("ready", "move-in", "immediate")):
        status_preference = "Ready to Move"
    elif any(x in lowercase for x in ("construction", "new launch", "project")):
        status_preference = "Under Construction"

    if "metro" in lowercase:
        preference_notes += "Proximity to Metro. "
    if any(x in lowercase for x in ("it park", "office")):
        preference_notes += "Near IT corridors. "
    if not preference_notes:
        preference_notes = "Standard residential search."

    return {
        "city": city,
        "locality": normalize_locality(locality),
        "transaction_type": transaction_type,
        "bhk": bhk,
        "budget_max": budget_max,
        "property_type": property_type,
        "status_preference": status_preference,
        "preference_notes": preference_notes.strip(),
        "vastu_compliant_only": any(x in lowercase for x in ("vastu", "vasthu", "facing")),
    }


async def parse_query_with_ai(query: str) -> dict[str, Any] | None:
    system = """Extract property search parameters from natural language.
Return JSON with keys: city, locality, transaction_type ("Buy" or "Rent"),
bhk (number or null), budget_max (number in INR or null), property_type,
status_preference ("Ready to Move", "Under Construction", or null), preference_notes,
vastu_compliant_only (boolean)."""
    result = await _chat_json(system, query)
    if not result:
        return None
    return normalize_parsed_requirement(result)


async def parse_natural_language_requirement(query: str) -> dict[str, Any]:
    """Parse natural-language requirement into structured search filters."""
    if not query.strip():
        return normalize_parsed_requirement(mock_parse_query(""))
    parsed = await parse_query_with_ai(query)
    if not parsed:
        parsed = mock_parse_query(query)
    return normalize_parsed_requirement(parsed)


def format_parsed_filters_summary(parsed: dict[str, Any]) -> str:
    parts: list[str] = []
    if parsed.get("bhk"):
        parts.append(f"{parsed['bhk']} BHK")
    if parsed.get("locality"):
        parts.append(str(parsed["locality"]))
    if parsed.get("city"):
        parts.append(str(parsed["city"]))
    if parsed.get("transaction_type"):
        parts.append(str(parsed["transaction_type"]))
    budget = parsed.get("budget_max")
    if budget:
        if parsed.get("transaction_type") == "Rent":
            parts.append(f"≤ ₹{int(budget):,}/mo")
        else:
            parts.append(f"≤ ₹{int(budget) // 100_000} Lakh")
    if parsed.get("status_preference"):
        parts.append(str(parsed["status_preference"]))
    return " · ".join(parts) if parts else "general residential search"


async def check_if_duplicate(prop_a: dict[str, Any], prop_b: dict[str, Any]) -> bool:
    if not settings.openai_configured:
        return True
    system = "Decide if two property listings are duplicates. Return JSON: {\"is_duplicate\": boolean, \"reasoning\": string}"
    user = json.dumps({"listing_a": prop_a, "listing_b": prop_b})
    result = await _chat_json(system, user)
    if result is None:
        return True
    return bool(result.get("is_duplicate", True))


async def generate_ai_explanation(prop: dict[str, Any], requirement: dict[str, Any]) -> str | None:
    system = "Write a 2-3 sentence property recommendation explanation for a real estate buyer."
    user = json.dumps({"property": prop, "requirement": requirement})
    return await _chat_text(system, user)


async def analyze_sentiment(reviews: list[str]) -> dict[str, Any] | None:
    system = """Analyze property locality reviews. Return JSON:
{"sentiment_score": 0-100, "positive_themes": [], "negative_themes": [], "sentiment_summary": ""}"""
    user = "\n".join(reviews)
    return await _chat_json(system, user)


async def chat_with_agent(messages: list[dict[str, str]]) -> dict[str, Any]:
    fallback_reply = "I can help refine your property search. Try mentioning city, locality, BHK, and budget."
    user_messages = [m["content"] for m in messages if m.get("role") == "user"]
    full_context = " ".join(user_messages).strip()
    last_user = user_messages[-1] if user_messages else ""

    async def _fallback_parsed() -> dict[str, Any]:
        parsed = await parse_query_with_ai(full_context or last_user)
        if not parsed:
            parsed = mock_parse_query(full_context or last_user)
        return normalize_parsed_requirement(parsed)

    if not settings.openai_configured:
        parsed = normalize_parsed_requirement(mock_parse_query(full_context or last_user))
        summary = format_parsed_filters_summary(parsed)
        return {
            "reply": f"Parsed your requirement into structured filters: {summary}.",
            "parsedRequirement": parsed,
        }

    system = """You are a real estate search assistant. Reply helpfully and return JSON:
{"reply": "string", "parsedRequirement": {"city","locality","transaction_type","bhk","budget_max","property_type","status_preference","preference_notes","vastu_compliant_only"}}
Always include parsedRequirement reflecting the user's latest criteria from the full conversation."""
    transcript = "\n".join(f"{m['role']}: {m['content']}" for m in messages[-8:])
    result = await _chat_json(system, transcript)
    if not result:
        parsed = await _fallback_parsed()
        return {"reply": fallback_reply, "parsedRequirement": parsed}

    parsed = result.get("parsedRequirement") or result.get("parsed_requirement")
    if not isinstance(parsed, dict):
        parsed = await _fallback_parsed()
    else:
        parsed = normalize_parsed_requirement(parsed)

    reply = result.get("reply") or result.get("message") or fallback_reply
    summary = format_parsed_filters_summary(parsed)
    if "structured filter" not in reply.lower():
        reply = f"{reply}\n\nStructured filters: {summary}."
    return {"reply": reply, "parsedRequirement": parsed}

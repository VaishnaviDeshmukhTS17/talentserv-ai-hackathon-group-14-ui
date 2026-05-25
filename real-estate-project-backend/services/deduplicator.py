from __future__ import annotations

from typing import Any, Awaitable, Callable


def string_similarity(str1: str, str2: str) -> float:
    s1 = str1.lower().strip()
    s2 = str2.lower().strip()
    if s1 == s2:
        return 1.0
    if not s1 or not s2:
        return 0.0

    track = [[0] * (len(s1) + 1) for _ in range(len(s2) + 1)]
    for i in range(len(s1) + 1):
        track[0][i] = i
    for j in range(len(s2) + 1):
        track[j][0] = j

    for j in range(1, len(s2) + 1):
        for i in range(1, len(s1) + 1):
            indicator = 0 if s1[i - 1] == s2[j - 1] else 1
            track[j][i] = min(
                track[j][i - 1] + 1,
                track[j - 1][i] + 1,
                track[j - 1][i - 1] + indicator,
            )

    distance = track[len(s2)][len(s1)]
    max_len = max(len(s1), len(s2))
    return (max_len - distance) / max_len


async def deduplicate_properties(
    properties: list[dict[str, Any]],
    duplicate_checker: Callable[[dict[str, Any], dict[str, Any]], Awaitable[bool]] | None = None,
) -> list[dict[str, Any]]:
    cleaned = [dict(p) for p in properties]
    group_counter = 1
    groups_map: dict[str, str] = {}

    for i, prop_a in enumerate(cleaned):
        if prop_a.get("is_incomplete"):
            continue
        for j in range(i + 1, len(cleaned)):
            prop_b = cleaned[j]
            if prop_b.get("is_incomplete"):
                continue

            if (
                prop_a.get("city", "").lower() != prop_b.get("city", "").lower()
                or prop_a.get("locality", "").lower() != prop_b.get("locality", "").lower()
                or prop_a.get("transaction_type") != prop_b.get("transaction_type")
                or prop_a.get("bhk") != prop_b.get("bhk")
            ):
                continue

            price_a, price_b = prop_a.get("price", 0), prop_b.get("price", 0)
            area_a, area_b = prop_a.get("area_sqft", 0), prop_b.get("area_sqft", 0)
            if not price_a or not price_b or not area_a or not area_b:
                continue

            price_diff = abs(price_a - price_b) / min(price_a, price_b)
            area_diff = abs(area_a - area_b) / min(area_a, area_b)
            if price_diff > 0.05 or area_diff > 0.08:
                continue

            title_sim = string_similarity(prop_a.get("title", ""), prop_b.get("title", ""))
            project_a = prop_a.get("project_name", "").lower()
            project_b = prop_b.get("project_name", "").lower()
            project_match = project_a == project_b and len(project_a) > 0

            if title_sim > 0.6 or project_match:
                is_dup = True
                if duplicate_checker:
                    is_dup = await duplicate_checker(prop_a, prop_b)
                if is_dup:
                    group_id = groups_map.get(prop_a["property_id"]) or groups_map.get(prop_b["property_id"])
                    if not group_id:
                        group_id = f"DUP_{group_counter:03d}"
                        group_counter += 1
                    groups_map[prop_a["property_id"]] = group_id
                    groups_map[prop_b["property_id"]] = group_id

    result = []
    for prop in cleaned:
        pid = prop["property_id"]
        if pid in groups_map:
            prop = {**prop, "duplicate_group_id": groups_map[pid]}
        result.append(prop)
    return result

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from config import settings

SEED_DIR = Path(__file__).resolve().parent.parent / "seed"

COLLECTIONS = {
    "properties": "properties",
    "builders": "builders",
    "sentiment": "locality_sentiment",
    "trends": "locality_trends",
    "pois": "points_of_interest",
}


class AtlasConnectionError(RuntimeError):
    """Raised when MongoDB Atlas is unreachable."""

    @staticmethod
    def hint() -> str:
        return (
            "Cannot connect to MongoDB Atlas. Check: (1) Atlas → Network Access → "
            "add your current IP (or 0.0.0.0/0 for demo), (2) Database Access user/password "
            "matches MONGODB_URI, (3) cluster is running."
        )


def _load_seed_json(filename: str) -> list[dict[str, Any]]:
    path = SEED_DIR / filename
    if not path.exists():
        return []
    with path.open(encoding="utf-8") as handle:
        data = json.load(handle)
    return data if isinstance(data, list) else []


async def _query_or_fail(label: str, query):
    if settings.prefer_local_seed:
        return None
    try:
        return await query()
    except Exception as exc:
        raise AtlasConnectionError(f"{label} failed: {exc}\n{AtlasConnectionError.hint()}") from exc


async def fetch_all_properties(db: AsyncIOMotorDatabase) -> list[dict[str, Any]]:
    if settings.prefer_local_seed:
        return _load_seed_json("properties.json")

    result = await _query_or_fail(
        "properties.find",
        lambda: db[COLLECTIONS["properties"]].find({}, {"_id": 0}).to_list(length=500),
    )
    if not result:
        raise AtlasConnectionError(
            f"No properties in Atlas database '{settings.mongodb_db_name}'. "
            f"Run: python -m db.seed_cli\n{AtlasConnectionError.hint()}"
        )
    return result


async def insert_properties(db: AsyncIOMotorDatabase, props: list[dict[str, Any]]) -> int:
    if not props:
        return 0
    await db[COLLECTIONS["properties"]].insert_many(props)
    return len(props)


async def fetch_builders_map(db: AsyncIOMotorDatabase) -> dict[str, dict[str, Any]]:
    if settings.prefer_local_seed:
        return {d["builder_name"]: d for d in _load_seed_json("builders.json")}

    docs = await _query_or_fail(
        "builders.find",
        lambda: db[COLLECTIONS["builders"]].find({}, {"_id": 0}).to_list(length=200),
    )
    return {d["builder_name"]: d for d in (docs or [])}


async def fetch_sentiment_map(db: AsyncIOMotorDatabase) -> dict[str, dict[str, Any]]:
    if settings.prefer_local_seed:
        return {d["locality_name"]: d for d in _load_seed_json("locality_sentiment.json")}

    docs = await _query_or_fail(
        "sentiment.find",
        lambda: db[COLLECTIONS["sentiment"]].find({}, {"_id": 0}).to_list(length=100),
    )
    return {d["locality_name"]: d for d in (docs or [])}


async def fetch_trends_map(db: AsyncIOMotorDatabase) -> dict[str, dict[str, Any]]:
    if settings.prefer_local_seed:
        return {d["locality_name"]: d for d in _load_seed_json("locality_trends.json")}

    docs = await _query_or_fail(
        "trends.find",
        lambda: db[COLLECTIONS["trends"]].find({}, {"_id": 0}).to_list(length=100),
    )
    return {d["locality_name"]: d for d in (docs or [])}


async def fetch_pois(db: AsyncIOMotorDatabase) -> list[dict[str, Any]]:
    if settings.prefer_local_seed:
        return _load_seed_json("points_of_interest.json")

    docs = await _query_or_fail(
        "pois.find",
        lambda: db[COLLECTIONS["pois"]].find({}, {"_id": 0}).to_list(length=200),
    )
    return docs or []


async def count_properties(db: AsyncIOMotorDatabase) -> int:
    if settings.prefer_local_seed:
        return len(_load_seed_json("properties.json"))

    count = await _query_or_fail(
        "properties.count",
        lambda: db[COLLECTIONS["properties"]].count_documents({}),
    )
    return int(count or 0)


MOCK_REVIEWS: dict[str, list[str]] = {
    "Hinjewadi": [
        "Rajiv Gandhi IT park is extremely close by.",
        "Shivaji Chowk traffic is a nightmare during peak hours.",
        "High rental yield makes it a great investment choice.",
    ],
    "Wakad": [
        "Excellent road connectivity to the Expressway.",
        "High density construction everywhere.",
        "Great family neighborhood with plenty of supermarkets.",
    ],
    "Whitefield": [
        "Tech parks like ITPL are within walking distance.",
        "Water logging is a major concern during heavy rains.",
        "Great society environment, family friendly gated communities.",
    ],
    "Baner": [
        "Amazing premium lifestyle and top high street restaurants.",
        "Extremely high property prices and cost of living here.",
        "Very close to Balewadi High Street hotspots.",
    ],
    "Hadapsar": [
        "Very convenient commute for SP Infocity and Magarpatta tech parks.",
        "Traffic congestion near the Hadapsar flyover is a daily bottleneck.",
        "Amanora and Nanded townships have top-tier family amenities.",
    ],
    "Kharadi": [
        "Super close to EON IT Park and World Trade Center.",
        "Heavy dust and air pollution due to ongoing highrise construction.",
        "Excellent rental yields for investments.",
    ],
    "Viman Nagar": [
        "Vibrant premium lifestyle with Phoenix Marketcity and airport close by.",
        "Aircraft landing decibel noise is a nuisance in select lanes.",
        "Mature residential avenues with high demand.",
    ],
    "Kothrud": [
        "Extremely safe, green, and traditional neighborhood.",
        "Older buildings and narrow inner lanes make parking difficult.",
        "Top-class educational facilities and parks.",
    ],
    "Kalyani Nagar": [
        "Quiet and elite tree-lined residential community.",
        "High property price thresholds make it unaffordable for many.",
        "Immediate access to Koregaon Park clubs and restaurants.",
    ],
    "Indiranagar": [
        "Elite high street commercial shopping and nightlife hub.",
        "Excessive noise levels and weekend traffic congestion on 100 feet road.",
        "Mature residential canopy with very high lease prices.",
    ],
    "Koramangala": [
        "Major startup workspace ecosystem and popular eateries.",
        "Prone to temporary water logging in low-lying blocks during monsoon.",
        "Central location with excellent connectivity.",
    ],
}

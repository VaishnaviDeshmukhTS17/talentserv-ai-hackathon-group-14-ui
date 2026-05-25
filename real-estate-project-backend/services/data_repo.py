from __future__ import annotations

from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

COLLECTIONS = {
    "properties": "properties",
    "builders": "builders",
    "sentiment": "locality_sentiment",
    "trends": "locality_trends",
    "pois": "points_of_interest",
}


async def fetch_all_properties(db: AsyncIOMotorDatabase) -> list[dict[str, Any]]:
    cursor = db[COLLECTIONS["properties"]].find({}, {"_id": 0})
    return await cursor.to_list(length=500)


async def insert_properties(db: AsyncIOMotorDatabase, props: list[dict[str, Any]]) -> int:
    if not props:
        return 0
    await db[COLLECTIONS["properties"]].insert_many(props)
    return len(props)


async def fetch_builders_map(db: AsyncIOMotorDatabase) -> dict[str, dict[str, Any]]:
    cursor = db[COLLECTIONS["builders"]].find({}, {"_id": 0})
    docs = await cursor.to_list(length=200)
    return {d["builder_name"]: d for d in docs}


async def fetch_sentiment_map(db: AsyncIOMotorDatabase) -> dict[str, dict[str, Any]]:
    cursor = db[COLLECTIONS["sentiment"]].find({}, {"_id": 0})
    docs = await cursor.to_list(length=100)
    return {d["locality_name"]: d for d in docs}


async def fetch_trends_map(db: AsyncIOMotorDatabase) -> dict[str, dict[str, Any]]:
    cursor = db[COLLECTIONS["trends"]].find({}, {"_id": 0})
    docs = await cursor.to_list(length=100)
    return {d["locality_name"]: d for d in docs}


async def fetch_pois(db: AsyncIOMotorDatabase) -> list[dict[str, Any]]:
    cursor = db[COLLECTIONS["pois"]].find({}, {"_id": 0})
    return await cursor.to_list(length=200)


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
}

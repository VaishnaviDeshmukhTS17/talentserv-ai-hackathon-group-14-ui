from __future__ import annotations

import json
from pathlib import Path

from db.mongo import get_db

SEED_DIR = Path(__file__).resolve().parent.parent / "seed"

COLLECTIONS = [
    ("properties.json", "properties", "property_id"),
    ("builders.json", "builders", "builder_name"),
    ("locality_sentiment.json", "locality_sentiment", "locality_name"),
    ("locality_trends.json", "locality_trends", "locality_name"),
    ("points_of_interest.json", "points_of_interest", "poi_id"),
]


async def seed_database(force: bool = False) -> dict[str, int]:
    db = get_db()
    counts: dict[str, int] = {}

    for filename, collection, _id_field in COLLECTIONS:
        path = SEED_DIR / filename
        if not path.exists():
            counts[collection] = 0
            continue

        existing = await db[collection].count_documents({})
        if existing > 0 and not force:
            counts[collection] = existing
            continue

        if force and existing > 0:
            await db[collection].delete_many({})

        with path.open(encoding="utf-8") as f:
            data = json.load(f)

        if isinstance(data, list) and data:
            await db[collection].insert_many(data)
            counts[collection] = len(data)
        else:
            counts[collection] = 0

    return counts


async def get_seed_status() -> dict[str, int]:
    db = get_db()
    status = {}
    for _, collection, _ in COLLECTIONS:
        status[collection] = await db[collection].count_documents({})
    return status

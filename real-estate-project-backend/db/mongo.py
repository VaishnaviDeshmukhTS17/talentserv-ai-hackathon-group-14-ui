from __future__ import annotations

import certifi
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from config import settings

_client: AsyncIOMotorClient | None = None

# Fail fast when Atlas is unreachable — avoids 30s UI hangs.
_MONGO_TIMEOUT_MS = 8000


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        kwargs: dict = {
            "serverSelectionTimeoutMS": _MONGO_TIMEOUT_MS,
            "connectTimeoutMS": _MONGO_TIMEOUT_MS,
            "socketTimeoutMS": _MONGO_TIMEOUT_MS,
        }
        if settings.mongodb_uri.startswith("mongodb+srv://"):
            kwargs["tlsCAFile"] = certifi.where()
        _client = AsyncIOMotorClient(settings.mongodb_uri, **kwargs)
    return _client


def get_db() -> AsyncIOMotorDatabase:
    return get_client()[settings.mongodb_db_name]


def reset_client() -> None:
    """Drop cached client so .env / password changes take effect after reload."""
    global _client
    if _client is not None:
        _client.close()
        _client = None


async def close_client() -> None:
    reset_client()

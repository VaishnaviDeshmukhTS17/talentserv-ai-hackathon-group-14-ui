from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db.mongo import get_db
from db.seed import seed_database
from config import settings
from services.data_repo import AtlasConnectionError, count_properties, fetch_builders_map, fetch_sentiment_map, fetch_trends_map, insert_properties
from services.openai_service import chat_with_agent, parse_natural_language_requirement
from services.search_pipeline import execute_search

router = APIRouter(prefix="/api", tags=["search"])


class SearchRequest(BaseModel):
    query: str
    overrides: Optional[Dict[str, Any]] = None


class ParseRequest(BaseModel):
    query: str


class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]


class IngestRequest(BaseModel):
    properties: List[Dict[str, Any]]


@router.post("/search")
async def search_properties(body: SearchRequest):
    db = get_db()
    try:
        count = await count_properties(db)
        if count == 0:
            raise HTTPException(
                status_code=503,
                detail="Database not seeded. Run: python -m db.seed_cli",
            )
        return await execute_search(db, body.query, body.overrides)
    except AtlasConnectionError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/parse")
async def parse_requirement(body: ParseRequest):
    """Parse natural-language requirement into structured filters."""
    parsed = await parse_natural_language_requirement(body.query)
    return {"parsedRequirement": parsed}


@router.post("/chat")
async def chat(body: ChatRequest):
    return await chat_with_agent(body.messages)


@router.get("/health")
async def health():
    db = get_db()
    try:
        props = await count_properties(db)
        return {
            "status": "ok",
            "properties_in_db": props,
            "database": "local_seed" if settings.prefer_local_seed else "atlas",
            "openai_active": settings.openai_configured,
            "openai_model": settings.openai_model if settings.openai_configured else None,
        }
    except AtlasConnectionError as exc:
        return {"status": "error", "detail": str(exc)}
    except Exception as exc:
        return {"status": "error", "detail": str(exc)}


@router.post("/seed")
async def seed(force: bool = False):
    try:
        counts = await seed_database(force=force)
        return {"status": "seeded", "counts": counts}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/builders")
async def get_builders():
    db = get_db()
    return await fetch_builders_map(db)


@router.get("/sentiment/{locality}")
async def get_sentiment(locality: str):
    db = get_db()
    data = await fetch_sentiment_map(db)
    if locality not in data:
        raise HTTPException(status_code=404, detail="Locality not found")
    return data[locality]


@router.get("/trends/{locality}")
async def get_trends(locality: str):
    db = get_db()
    data = await fetch_trends_map(db)
    if locality not in data:
        raise HTTPException(status_code=404, detail="Locality not found")
    return data[locality]


@router.post("/properties/ingest")
async def ingest_properties(body: IngestRequest):
    db = get_db()
    inserted = await insert_properties(db, body.properties)
    return {"inserted": inserted}

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from db.mongo import close_client, reset_client
from routes.api import router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    reset_client()
    yield
    await close_client()


app = FastAPI(
    title="PropIntel API",
    description="Real Estate Property Intelligence Backend — FastAPI + MongoDB + OpenAI",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
async def root():
    return {
        "name": "PropIntel Backend",
        "docs": "/docs",
        "health": "/api/health",
    }

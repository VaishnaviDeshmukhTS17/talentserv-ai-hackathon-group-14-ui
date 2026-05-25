# Agentic Programming Evidence — PropIntel

This document describes how **AI-assisted (agentic) programming tools** were used across the full lifecycle of the Real Estate Property Intelligence Dashboard, per hackathon requirements.

---

## Tools used

| Tool | Role |
|------|------|
| **Cursor IDE (AI Agent)** | Primary development environment — planning, coding, refactoring, testing, documentation |
| **Claude / GPT models (via Cursor)** | Architecture decisions, Python port, API design, README generation |
| **OpenAI API (gpt-4o-mini)** | Runtime AI in production backend — query parsing, chat, recommendations |

Development was agentic; runtime AI is optional with rule-based fallback when OpenAI is unavailable.

---

## 1. Requirement breakdown

**Evidence:** `real-estate-project-frontend/project-requirement.md` (hackathon brief) + iterative scoping in Cursor chat.

AI-assisted outputs:

- Mapped MVP pillars → auth, NL input, ingestion, cleanup, dedup, enrichment, dashboard, tests, deployment.
- Identified end-to-end flow: `requirement → parsing → ingestion → cleanup → dedup → enrichment → dashboard → recommendations`.
- Defined MongoDB collections mirroring `mockData.ts` structure.

---

## 2. Data-source planning & compliance

**Evidence:** `COMPLIANCE.md`, in-app **Data & Compliance** tab (`DataComplianceTab.tsx`).

AI-assisted checklist:

- No live scraping of MagicBricks / Housing / NoBroker without permission.
- Fallback dataset required → `mockData.ts` → exported JSON → MongoDB seed.
- robots.txt / login-wall / PII rules documented and simulated in UI.
- Source tracking: every listing includes `source` + `source_url`.

---

## 3. Architecture & design

**Evidence:** Root `README.md` architecture diagram; backend `services/search_pipeline.py`.

AI-assisted design decisions:

| Decision | Rationale |
|----------|-----------|
| React frontend + FastAPI backend + MongoDB | Clear separation; meets full-stack requirement |
| OpenAI on server only | API key security; no client-side LLM keys |
| MongoDB Atlas M0 | Free tier sufficient for 56 sample listings |
| Vite proxy `/api` → `:8000` | Simple local dev without CORS friction |
| Seed via `export-seed.ts` | Same JSON shape as TypeScript mock data |

**Agent pipeline (backend):**

```
User query
  → OpenAI parse (or regex fallback)
  → MongoDB fetch properties
  → normalizer.py (price, BHK, locality, status)
  → deduplicator.py (fuzzy + optional OpenAI confirm)
  → geo_utils.py (POI scores)
  → enrichment (builders, sentiment, trends from MongoDB)
  → OpenAI recommendation explanations (top 3)
  → JSON response to React dashboard
```

---

## 4. AI-assisted implementation

**Evidence:** Git history, dual codebases (`real-estate-project-frontend/` + `real-estate-project-backend/`).

| Area | AI contribution |
|------|-----------------|
| Port TS normalizer/dedup to Python | `services/normalizer.py`, `deduplicator.py` |
| OpenAI service replacing Groq | `services/openai_service.py` |
| FastAPI routes & pipeline | `routes/api.py`, `search_pipeline.py` |
| Frontend API client | `src/services/apiClient.ts` |
| Remove Groq from UI | Settings, Overview, DeveloperConsole refactors |
| MongoDB seed script | `db/seed.py`, `scripts/export-seed.ts` |

**Developer Console** (`DeveloperConsole.tsx`) exposes agent trace logs for demo/evaluation.

---

## 5. Data cleanup & deduplication logic

**Evidence:** `backend/services/normalizer.py`, `backend/tests/test_normalizer.py`, `frontend/src/tests/pipeline.test.ts`.

AI-generated / AI-refined logic:

- Price: `Rs 80 L`, `78 Lac`, `1.15 Cr`, `60k / mo` → integer INR
- Area: `850 sq.ft.` → `850`
- BHK: `2 BHK Flat` → `2`
- Locality: `Hinjawadi` → `Hinjewadi`
- Dedup: same city/locality/BHK, ±5% price, ±8% area, title similarity > 0.6

---

## 6. AI-generated test cases

**Evidence:** 33 automated tests total.

| Project | Count | Runner |
|---------|-------|--------|
| Frontend | 28 | Jest (`npm test`) |
| Backend | 5 | pytest |

Tests updated with AI help to mock `/api/*` instead of deprecated Groq client calls.

---

## 7. Review & iteration (AI feedback loop)

Documented improvements from AI/tool review:

1. **Groq → OpenAI** — Unified on server-side OpenAI per team preference.
2. **In-browser logic → Python API** — Moved search pipeline off the client for security and hackathon full-stack scoring.
3. **mockData.ts → MongoDB** — Persistent database instead of in-memory-only demo.
4. **Permission fix on Vite binary** — Diagnosed `chmod` issue on `node_modules/.bin/vite`.
5. **Test suite migration** — Replaced Groq mocks with FastAPI backend mocks.
6. **Documentation gap fill** — This file, `COMPLIANCE.md`, and root README.

---

## 8. Runtime AI (optional bonus)

When `OPENAI_API_KEY` is set in backend `.env`:

| Feature | Model | Endpoint |
|---------|-------|----------|
| Requirement parsing | gpt-4o-mini | `POST /api/search` |
| Chat refinement | gpt-4o-mini | `POST /api/chat` |
| Top-3 recommendation text | gpt-4o-mini | `POST /api/search` |
| Dynamic sentiment (reviews) | gpt-4o-mini | `POST /api/search` |

Fallback: deterministic regex parser in `openai_service.py` — dashboard still works without OpenAI.

---

## 9. How to demonstrate agentic usage in demo

1. Show **Developer Console** (agent trace panel) during a search.
2. Show **Settings → Backend & AI** — OpenAI runs on server, not in browser.
3. Run tests live: `npm test` and `pytest tests/ -v`.
4. Point reviewers to this file and `COMPLIANCE.md`.
5. Show Cursor chat / commit history if oral presentation allows.

---

## 10. File index (agentic artifacts)

| Artifact | Path |
|----------|------|
| Hackathon requirements | `real-estate-project-frontend/project-requirement.md` |
| Sample dataset | `real-estate-project-frontend/src/assets/mockData.ts` |
| Seed JSON | `real-estate-project-backend/seed/*.json` |
| Search pipeline | `real-estate-project-backend/services/search_pipeline.py` |
| OpenAI integration | `real-estate-project-backend/services/openai_service.py` |
| API client | `real-estate-project-frontend/src/services/apiClient.ts` |
| Compliance UI | `real-estate-project-frontend/src/components/dashboard/DataComplianceTab.tsx` |
| Agent console | `real-estate-project-frontend/src/components/DeveloperConsole.tsx` |
| Frontend tests | `real-estate-project-frontend/src/tests/` |
| Backend tests | `real-estate-project-backend/tests/` |

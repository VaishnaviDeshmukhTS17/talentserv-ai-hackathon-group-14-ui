# PropIntel — Real Estate Property Intelligence Dashboard

Full-stack hackathon project: natural-language property search, comparative analytics, and AI-powered recommendations.

| Layer | Tech | Folder |
|-------|------|--------|
| Frontend | React 19, Vite, Tailwind, Firebase Auth | [`real-estate-project-frontend/`](./real-estate-project-frontend/) |
| Backend | Python FastAPI, OpenAI, MongoDB | [`real-estate-project-backend/`](./real-estate-project-backend/) |
| Database | MongoDB Atlas (M0 free tier) | Database name: `propintel` |

---

## Architecture

```
User (browser)
    │
    ▼
React Dashboard (port 3000)  ──Firebase──▶  Google / Email Auth
    │
    │  REST /api/*
    ▼
FastAPI Backend (port 8000)
    │
    ├──▶ MongoDB Atlas  (properties, builders, sentiment, trends, POIs)
    └──▶ OpenAI API     (gpt-4o-mini — parsing, chat, recommendations)
```

**End-to-end flow:** Login → enter requirement in plain English → backend parses criteria → loads listings from MongoDB → normalizes & deduplicates → enriches with builder/sentiment/trend data → returns ranked recommendations on the dashboard.

---

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **MongoDB Atlas** account (free M0 cluster)
- **OpenAI API key**
- **Firebase project** with Google sign-in (or use sandbox auth mode in the app)

---

## Quick start (local demo)

### 1. Clone and enter the repo

```bash
cd real-estate-project
```

### 2. Backend setup

```bash
cd real-estate-project-backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` — set your **MongoDB password** and **OpenAI API key** (see [Backend README](./real-estate-project-backend/README.md)).

### 3. Export & seed data

From the frontend folder, export `mockData.ts` to JSON:

```bash
cd ../real-estate-project-frontend
npx tsx scripts/export-seed.ts
```

Seed MongoDB Atlas:

```bash
cd ../real-estate-project-backend
source .venv/bin/activate
python -m db.seed_cli
```

Expected output includes ~56 properties, 20 builders, 11 sentiment localities, 11 trend localities, 23 POIs.

### 4. Start backend

```bash
uvicorn main:app --reload --port 8000
```

Verify: http://localhost:8000/api/health → `"properties_in_db": 56`

### 5. Frontend setup

```bash
cd ../real-estate-project-frontend
npm install
cp .env.example .env    # add Firebase keys if using real auth
npm run dev
```

Open http://localhost:3000

In development, Vite proxies `/api/*` to `http://localhost:8000` (no `VITE_API_BASE_URL` needed).

### 6. Demo flow

1. Sign in (Firebase or sandbox mode in Settings).
2. Enter: `Looking for 2 BHK in Hinjewadi, Pune under 80 lakh, ready to move`.
3. View parsed requirement, matching properties, charts, builder/sentiment/trend tabs.
4. Use the conversational assistant to refine criteria.
5. Open **Data & Compliance** tab for source policy details.

---

## Project structure

```
real-estate-project/                    ← you are here (repo root)
├── README.md                           ← this file
├── AGENTIC_EVIDENCE.md                 ← AI tooling used in development
├── COMPLIANCE.md                       ← data source & ethics note
├── real-estate-project-frontend/         ← React frontend
│   ├── src/
│   │   ├── components/dashboard/       ← Overview, Properties, Trends, etc.
│   │   ├── services/apiClient.ts       ← calls Python API
│   │   └── assets/mockData.ts          ← source dataset (exported to seed/)
│   └── scripts/export-seed.ts          ← mockData.ts → backend/seed/*.json
└── real-estate-project-backend/        ← Python API
    ├── main.py
    ├── services/                       ← normalizer, dedup, OpenAI, pipeline
    ├── seed/                           ← JSON loaded into MongoDB
    └── tests/
```

---

## Environment variables

### Backend (`real-estate-project-backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | Atlas connection string with `/propintel` database |
| `MONGODB_DB_NAME` | `propintel` |
| `OPENAI_API_KEY` | Server-side only — never expose in frontend |
| `OPENAI_MODEL` | Default: `gpt-4o-mini` |
| `CORS_ORIGINS` | Frontend URL(s), e.g. `http://localhost:3000` |

### Frontend (`real-estate-project-frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_*` | Firebase config for auth |
| `VITE_API_BASE_URL` | Optional; leave empty in dev (uses Vite proxy) |

---

## Tests

**Frontend** (28 tests):

```bash
cd real-estate-project-frontend
npm test
```

**Backend** (5 tests):

```bash
cd real-estate-project-backend
source .venv/bin/activate
pytest tests/ -v
```

---

## API reference

Interactive docs: http://localhost:8000/docs

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | DB connection & property count |
| POST | `/api/search` | Full search pipeline |
| POST | `/api/chat` | Conversational refinement |
| GET | `/api/builders` | Builder reputation data |
| GET | `/api/sentiment/{locality}` | Locality sentiment |
| GET | `/api/trends/{locality}` | Price trend context |
| POST | `/api/properties/ingest` | Upload CSV/JSON listings |
| POST | `/api/seed?force=true` | Re-seed MongoDB |

---

## Deployment (recommended)

| Component | Platform | Notes |
|-----------|----------|-------|
| Frontend | Vercel / Netlify | Set `VITE_API_BASE_URL` to backend URL |
| Backend | Render / Railway | Set env vars; `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Database | MongoDB Atlas M0 | Free tier; allow backend IP in Network Access |

After deploy, add production frontend URL to backend `CORS_ORIGINS`.

---

## Documentation

- [Final submission index](./SUBMISSION_INDEX.md)
- [Groomed requirements](./GROOMED_REQUIREMENTS.md)
- [Implementation plan](./IMPLEMENTATION_PLAN.md)
- [Architecture](./ARCHITECTURE.md)
- [Test plan](./TEST_PLAN.md)
- [Critical review](./CRITICAL_REVIEW.md)
- [Deployment details](./DEPLOYMENT_DETAILS.md)
- [Demo video guide](./DEMO_VIDEO_GUIDE.md)
- [Frontend README](./real-estate-project-frontend/README.md)
- [Backend README](./real-estate-project-backend/README.md)
- [Agentic programming evidence](./AGENTIC_EVIDENCE.md)
- [Data compliance note](./COMPLIANCE.md)
- [Hackathon requirements](./real-estate-project-frontend/project-requirement.md)

---

## Known limitations

- All listing data is **sample/mock** data exported from `mockData.ts` — not live scraped portals.
- OpenAI parsing falls back to rule-based logic if the API key is missing or the call fails.
- Firebase sandbox mode stores session in `localStorage` for demo without Firebase credentials.
- Multi-locality compare queries (e.g. “Wakad and Baner”) parse a single primary locality.
- Builder/sentiment/trend enrichment uses curated sample datasets, not live social media scraping.

---

## Team / submission checklist

- [ ] Backend `.env` configured (MongoDB + OpenAI)
- [ ] MongoDB seeded (`python -m db.seed_cli`)
- [ ] Both servers running locally
- [ ] Firebase auth configured (or sandbox mode documented)
- [ ] Tests passing (`npm test` + `pytest`)
- [ ] Git repository pushed
- [ ] Demo URL or local run instructions (this README)
- [ ] AGENTIC_EVIDENCE.md and COMPLIANCE.md included
- [ ] Screenshots or short demo video

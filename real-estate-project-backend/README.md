# PropIntel Backend

Python **FastAPI** API for the Real Estate Property Intelligence Dashboard.

- **FastAPI** — REST API
- **MongoDB Atlas** — property, builder, sentiment, trend data
- **OpenAI (gpt-4o-mini)** — requirement parsing, recommendations, chat

## Project structure

```
real-estate-project-backend/
├── main.py                 # FastAPI entry point
├── config.py               # Environment settings
├── db/
│   ├── mongo.py            # MongoDB connection
│   ├── seed.py             # Seed logic
│   └── seed_cli.py         # CLI seeder
├── routes/
│   └── api.py              # API endpoints
├── services/
│   ├── normalizer.py       # Price/BHK/locality cleanup
│   ├── deduplicator.py     # Fuzzy dedup
│   ├── geo_utils.py        # POI / location scores
│   ├── openai_service.py   # OpenAI integration
│   ├── search_pipeline.py  # Full search orchestration
│   └── data_repo.py        # MongoDB queries
├── seed/                   # JSON exported from frontend mockData.ts
└── tests/
```

## Setup

### 1. Create virtual environment

```bash
cd real-estate-project-backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
MONGODB_URI=mongodb+srv://db_user:YOUR_PASSWORD@talentservaihackathon.gmdw6zs.mongodb.net/propintel?retryWrites=true&w=majority&appName=TalentServAIHackathon
MONGODB_DB_NAME=propintel
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGINS=http://localhost:3000
```

### 3. Export seed JSON from frontend mockData.ts

```bash
cd ../real-estate-project-frontend
npx tsx scripts/export-seed.ts
```

This writes JSON files to `real-estate-project-backend/seed/`.

### 4. Seed MongoDB Atlas

```bash
cd ../real-estate-project-frontend-backend
python -m db.seed_cli
```

Use `--force` to re-seed:

```bash
python -m db.seed_cli --force
```

### 5. Run API server

```bash
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health + DB status |
| POST | `/api/search` | Parse query, search, rank properties |
| POST | `/api/chat` | Conversational search refinement |
| GET | `/api/builders` | All builder reputation data |
| GET | `/api/sentiment/{locality}` | Locality sentiment |
| GET | `/api/trends/{locality}` | Locality trends |
| POST | `/api/properties/ingest` | Upload new raw listings |
| POST | `/api/seed?force=true` | Seed via HTTP |

## Tests

```bash
pytest tests/ -v
```

## Connect React frontend

Set in frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

The frontend calls `/api/search` and `/api/chat` instead of local in-browser logic.

## Related docs

- [Root setup guide](../README.md)
- [Frontend README](../real-estate-project-frontend/README.md)
- [Agentic programming evidence](../AGENTIC_EVIDENCE.md)
- [Data compliance note](../COMPLIANCE.md)

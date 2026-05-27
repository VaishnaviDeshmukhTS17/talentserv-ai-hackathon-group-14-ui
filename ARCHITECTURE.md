# Product / Technical Architecture - PropIntel

## 1. Product Overview

PropIntel is a full-stack real estate intelligence dashboard. A user signs in, enters a natural-language property requirement, and receives ranked recommendations enriched with builder reputation, locality sentiment, price trends, and location quality signals.

## 2. High-Level Architecture

```text
Browser User
  |
  v
React + Vite Frontend
  |-- Firebase Auth
  |-- Dashboard Tabs
  |-- REST API Client
  |
  v
FastAPI Backend
  |-- Search Pipeline
  |-- OpenAI Service
  |-- MongoDB Data Repository
  |
  +--> MongoDB Atlas
  |     |-- properties
  |     |-- builders
  |     |-- locality_sentiment
  |     |-- locality_trends
  |     +-- points_of_interest
  |
  +--> OpenAI API
        |-- parsing
        |-- chat refinement
        |-- recommendation explanation
        +-- sentiment summarization
```

## 3. Frontend Architecture

Technology:

- React 19
- Vite
- Tailwind CSS v4
- Firebase Authentication
- Recharts
- Lucide React icons
- Jest and React Testing Library

Main responsibilities:

- Authentication UI and route protection.
- Dashboard tab navigation.
- Natural-language search input.
- API calls to backend.
- Result visualization and comparison.
- Data compliance and developer trace views.
- Responsive layouts for phone, tablet, and desktop.

Key files:

- `real-estate-project-frontend/src/App.tsx`
- `real-estate-project-frontend/src/components/Login.tsx`
- `real-estate-project-frontend/src/components/Dashboard.tsx`
- `real-estate-project-frontend/src/components/dashboard/OverviewTab.tsx`
- `real-estate-project-frontend/src/components/dashboard/PropertiesTab.tsx`
- `real-estate-project-frontend/src/components/dashboard/ComparisonsTab.tsx`
- `real-estate-project-frontend/src/components/dashboard/DataComplianceTab.tsx`
- `real-estate-project-frontend/src/services/apiClient.ts`

## 4. Backend Architecture

Technology:

- Python
- FastAPI
- Motor async MongoDB client
- Pydantic settings
- OpenAI Python SDK
- pytest

Main responsibilities:

- Expose REST API endpoints.
- Connect to MongoDB Atlas.
- Seed and ingest property data.
- Parse natural-language requirements.
- Normalize and deduplicate records.
- Rank and enrich property results.
- Keep OpenAI secrets server-side.
- Return structured JSON for the dashboard.

Key files:

- `real-estate-project-backend/main.py`
- `real-estate-project-backend/routes/api.py`
- `real-estate-project-backend/config.py`
- `real-estate-project-backend/db/mongo.py`
- `real-estate-project-backend/services/search_pipeline.py`
- `real-estate-project-backend/services/openai_service.py`
- `real-estate-project-backend/services/data_repo.py`
- `real-estate-project-backend/services/normalizer.py`
- `real-estate-project-backend/services/deduplicator.py`

## 5. Database Architecture

Database: MongoDB Atlas, database name `propintel`.

Collections:

- `properties`: property listing records.
- `builders`: builder reputation data.
- `locality_sentiment`: locality-level sentiment summaries.
- `locality_trends`: quarterly price and demand trend data.
- `points_of_interest`: nearby schools, hospitals, metro stations, and business hubs.

Seed flow:

```text
mockData.ts
  -> scripts/export-seed.ts
  -> backend/seed/*.json
  -> python -m db.seed_cli
  -> MongoDB Atlas
```

## 6. Authentication Architecture

Authentication is handled by Firebase on the frontend:

- Google sign-in.
- Email/password sign-in.
- Password reset.
- Protected dashboard route.
- Sandbox/local session mode for demo convenience.

The backend does not store passwords. Firebase credentials are supplied through frontend environment variables.

## 7. AI Agent Usage

Runtime AI is optional and server-side only.

OpenAI is used for:

- Natural-language requirement parsing.
- Conversational search refinement.
- Recommendation explanations.
- Dynamic sentiment summarization.

Fallback behavior:

- If OpenAI is unavailable or not configured, `mock_parse_query()` provides deterministic parsing.
- Recommendation explanations fall back to local template-based text.
- The dashboard can still search database records without OpenAI.

Important limitation:

- If MongoDB Atlas is unreachable and `USE_LOCAL_SEED=false`, search returns an error instead of automatically falling back to local seed data.

## 8. API Architecture

Base path: `/api`

Key endpoints:

- `GET /api/health`: backend, database, and AI status.
- `POST /api/search`: parse, search, rank, enrich, and return results.
- `POST /api/chat`: conversational requirement refinement.
- `GET /api/builders`: builder data.
- `GET /api/sentiment/{locality}`: locality sentiment.
- `GET /api/trends/{locality}`: locality trend data.
- `POST /api/properties/ingest`: CSV/JSON ingestion flow.
- `POST /api/seed?force=true`: seed MongoDB.

## 9. Search Pipeline

```text
Input query
  -> OpenAI parse or fallback parser
  -> merge manual overrides
  -> fetch properties from MongoDB
  -> normalize fields
  -> deduplicate similar records
  -> fetch builders/sentiment/trends/POIs
  -> filter by city, transaction type, locality, and Vastu preference
  -> calculate match score
  -> calculate investment and location scores
  -> generate recommendation explanation
  -> return dashboard response
```

## 10. Deployment Architecture

Recommended deployment split:

- Frontend: Vercel or Netlify.
- Backend: Render, Railway, or Fly.io.
- Database: MongoDB Atlas M0.
- Auth: Firebase.
- AI: OpenAI API.

Deployment communication:

```text
Vercel frontend
  -> VITE_API_BASE_URL
  -> Render/Railway/Fly FastAPI backend
  -> MongoDB Atlas + OpenAI
```

## 11. Security Design Decisions

- OpenAI API key is never exposed to the browser.
- MongoDB URI is backend-only.
- Firebase keys are frontend public configuration; sensitive auth is handled by Firebase.
- No live scraping or private contact data is collected.
- Environment files are excluded from source control.
- CORS is configured through backend `CORS_ORIGINS`.

## 12. Performance Design Notes

Current search behavior prioritizes correctness and enriched output. Known performance bottlenecks:

- Multiple Atlas reads per search.
- OpenAI calls in the search pipeline.
- Optional AI duplicate checking.
- No in-memory cache for static enrichment collections.

Recommended future improvements:

- Cache properties and enrichment collections.
- Remove redundant count query before search.
- Move AI enrichments to background or optional mode.
- Add automatic local seed fallback when Atlas is slow or unavailable.


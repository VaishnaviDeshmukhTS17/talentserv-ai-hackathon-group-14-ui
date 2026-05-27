# Solution / Implementation Plan - PropIntel

## 1. Approach Overview

The implementation followed the required end-to-end flow:

```text
User requirement
  -> requirement parsing
  -> permitted data ingestion
  -> cleanup and normalization
  -> duplicate detection
  -> enrichment
  -> comparative dashboard
  -> recommendation summary
```

The team built the project as a full-stack application with a React/Vite frontend, FastAPI backend, MongoDB Atlas data store, Firebase authentication, and optional OpenAI runtime AI.

## 2. Implementation Phases

### Phase 1 - Requirement Grooming

- Reviewed the hackathon brief and extracted MVP pillars.
- Converted the broad problem into user stories and acceptance criteria.
- Identified ethical data sourcing constraints.
- Defined sample-data strategy instead of live scraping.

Outputs:

- `GROOMED_REQUIREMENTS.md`
- `COMPLIANCE.md`
- `real-estate-project-frontend/project-requirement.md`

### Phase 2 - Frontend Foundation

- Built React/Vite dashboard structure.
- Added protected dashboard route and login flow.
- Created modular dashboard tabs:
  - Overview
  - Requirements
  - Properties
  - Comparisons
  - Builders
  - Trends
  - Saved Searches
  - Data & Compliance
  - Settings
- Added responsive layouts across mobile, tablet, and desktop widths.

Key files:

- `real-estate-project-frontend/src/components/Dashboard.tsx`
- `real-estate-project-frontend/src/components/Login.tsx`
- `real-estate-project-frontend/src/components/dashboard/*`
- `real-estate-project-frontend/src/index.css`

### Phase 3 - Data Model and Seed Dataset

- Used curated sample data instead of live scraping.
- Exported frontend `mockData.ts` into backend seed JSON files.
- Defined MongoDB collections:
  - `properties`
  - `builders`
  - `locality_sentiment`
  - `locality_trends`
  - `points_of_interest`

Key files:

- `real-estate-project-frontend/src/assets/mockData.ts`
- `real-estate-project-frontend/scripts/export-seed.ts`
- `real-estate-project-backend/seed/*.json`
- `real-estate-project-backend/db/seed.py`
- `real-estate-project-backend/db/seed_cli.py`

### Phase 4 - Backend API

- Implemented FastAPI server.
- Added MongoDB Atlas connection.
- Added search, chat, health, seed, builders, sentiment, trends, and ingestion endpoints.
- Added fast timeout behavior and clear Atlas error handling.

Key files:

- `real-estate-project-backend/main.py`
- `real-estate-project-backend/routes/api.py`
- `real-estate-project-backend/db/mongo.py`
- `real-estate-project-backend/services/data_repo.py`
- `real-estate-project-backend/config.py`

### Phase 5 - Search Pipeline

- Parsed natural-language input into structured filters.
- Normalized raw property fields.
- Deduplicated similar records.
- Scored properties against user criteria.
- Enriched results with builders, sentiment, trends, and POI proximity.
- Generated recommendation explanations.

Key files:

- `real-estate-project-backend/services/search_pipeline.py`
- `real-estate-project-backend/services/normalizer.py`
- `real-estate-project-backend/services/deduplicator.py`
- `real-estate-project-backend/services/geo_utils.py`
- `real-estate-project-backend/services/openai_service.py`

### Phase 6 - Runtime AI Integration

- Added OpenAI server-side integration.
- Used OpenAI for:
  - requirement parsing
  - conversational refinement
  - recommendation explanations
  - dynamic sentiment summaries
- Added deterministic fallback parser when OpenAI is unavailable.

Key files:

- `real-estate-project-backend/services/openai_service.py`
- `real-estate-project-frontend/src/services/apiClient.ts`
- `real-estate-project-frontend/src/services/mockApi.ts`

### Phase 7 - Testing

- Added frontend Jest tests for parsing, pipeline behavior, dashboard logic, and API client behavior.
- Added backend pytest tests for normalization and core processing logic.
- Verified frontend production build.

Commands:

```bash
cd real-estate-project-frontend
npm test
npm run build
```

```bash
cd real-estate-project-backend
pytest tests/ -v
```

### Phase 8 - Documentation and Submission

- Added root README, backend README, compliance note, agentic evidence, and final submission docs.
- Documented setup, environment variables, local run, deployment plan, known limitations, and demo flow.

## 3. Module Responsibilities

### Frontend

- `Dashboard.tsx`: top-level dashboard state, tab routing, search orchestration.
- `OverviewTab.tsx`: conversational search, parsed filters, top results, charts, recommendations.
- `PropertiesTab.tsx`: property list, ingestion, filters, selection.
- `ComparisonsTab.tsx` and `CompareModal.tsx`: side-by-side comparison.
- `DataComplianceTab.tsx`: data source and responsible collection explanation.
- `SettingsTab.tsx`: profile, theme, backend/AI status, sandbox controls.
- `apiClient.ts`: REST calls to FastAPI backend.

### Backend

- `main.py`: FastAPI application setup.
- `routes/api.py`: REST endpoints.
- `config.py`: environment settings.
- `db/mongo.py`: MongoDB client.
- `db/seed.py`: seed data loading.
- `services/data_repo.py`: data access layer.
- `services/search_pipeline.py`: search orchestration.
- `services/openai_service.py`: runtime AI and fallback parser.
- `services/normalizer.py`: cleanup and standardization.
- `services/deduplicator.py`: duplicate detection.
- `services/geo_utils.py`: POI proximity scoring.

## 4. Implementation Sequence

1. Establish React dashboard and mock data UI.
2. Add authentication and protected dashboard.
3. Create FastAPI backend and API routes.
4. Export mock data to backend seed JSON.
5. Connect MongoDB Atlas and seed database.
6. Move search pipeline from frontend-style logic to backend services.
7. Wire frontend to backend `/api/search` and `/api/chat`.
8. Add OpenAI parsing/chat/recommendation logic with fallback parser.
9. Add ingestion, compliance, and developer console features.
10. Add responsive UI fixes across key breakpoints.
11. Add tests and documentation.
12. Prepare final submission pack and demo script.

## 5. Responsibilities

The project responsibilities were organized by workstream:

- Requirements and documentation: groomed requirement, acceptance criteria, compliance, final submission pack.
- Frontend: dashboard UI, tabs, responsiveness, auth flow, API integration.
- Backend: FastAPI routes, search pipeline, MongoDB integration, seed scripts.
- Data engineering: sample data curation, JSON export, normalization, deduplication.
- AI integration: OpenAI parsing, chat, explanations, fallback parser.
- Testing and review: Jest, pytest, manual QA, performance/security review.
- Deployment: Vercel frontend settings, backend deployment plan, environment documentation.

## 6. Key Design Decisions

- Use sample data instead of live scraping to avoid legal and compliance risks.
- Keep OpenAI calls on the backend to protect API keys.
- Keep deterministic fallback parser so the app works without OpenAI.
- Use MongoDB Atlas to demonstrate persistent database integration.
- Use Vite proxy locally to simplify frontend-backend communication.
- Keep frontend API client thin and move business logic to the backend.


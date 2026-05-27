# Demo Video Guide - PropIntel

Target duration: 10 to 12 minutes.

Do not mention individual team member names. Use only the group number and challenge name. Do not expose credentials, tokens, client data, internal-sensitive data, `.env` files, Firebase secrets, MongoDB URI, or OpenAI keys.

## 1. Introduction and Methodology - 2 to 4 minutes

### Suggested Script

Introduce the project:

```text
We are Group 14. Our challenge is the Real Estate Property Intelligence Dashboard using Agentic Programming. Our solution is called PropIntel.
```

Summarize the requirement:

```text
The goal is to help authenticated users enter a natural-language property requirement and receive cleaned, deduplicated, enriched, and ranked real estate recommendations in a comparative dashboard.
```

Explain agentic workflow:

```text
We used Cursor and AI agents across requirement grooming, architecture planning, implementation, testing, debugging, code review, and documentation. Runtime AI is also used in the backend through OpenAI for query parsing, chat refinement, recommendation explanations, and sentiment support.
```

Show documents briefly:

- `GROOMED_REQUIREMENTS.md`
- `IMPLEMENTATION_PLAN.md`
- `ARCHITECTURE.md`
- `AGENTIC_EVIDENCE.md`
- `COMPLIANCE.md`

Requirement grooming points:

- Converted challenge brief into user stories.
- Defined scope and assumptions.
- Chose permitted sample data instead of live scraping.
- Defined acceptance criteria for auth, search, enrichment, testing, and deployment.

Architecture overview:

```text
React/Vite frontend -> FastAPI backend -> MongoDB Atlas and OpenAI API. Firebase handles authentication.
```

Prompting examples to mention:

- Asked AI to break down the hackathon requirement into MVP user stories.
- Asked AI to plan the backend service boundaries.
- Asked AI to review security and fallback behavior.
- Asked AI to help debug Atlas, API, and responsive UI issues.

## 2. Application Demo - 4 to 6 minutes

### Demo Flow

1. Show the app home/login screen.
2. Demonstrate login or sandbox/demo sign-in.
3. Open the dashboard.
4. Enter a search query:

```text
Looking for 2 BHK in Hinjewadi, Pune under 80 lakh, ready to move near IT park
```

5. Show parsed filters:
   - City
   - Locality
   - BHK
   - Budget
   - Status
   - Transaction type

6. Show recommended properties:
   - Match score
   - Price
   - Builder/project
   - Recommendation explanation

7. Show comparison:
   - Select two or three properties.
   - Open comparison view.
   - Explain side-by-side evaluation.

8. Show enrichment tabs:
   - Builders
   - Trends
   - Data & Compliance
   - Properties ingestion

9. Show AI-assisted review evidence:
   - Developer Console if relevant.
   - Agentic evidence document.
   - Mention OpenAI fallback parser.

10. Show test evidence:

```bash
cd real-estate-project-frontend
npm test
```

If backend tests are available in the recording:

```bash
cd real-estate-project-backend
pytest tests/ -v
```

11. Show local run or deployment evidence:
   - Frontend URL or `localhost:3000`.
   - Backend health endpoint `/api/health`.
   - Avoid showing raw `.env` values.

### Known Limitations to Mention

- Uses curated sample data, not live scraped portal data.
- Atlas/network failure currently requires seed/local mode or backend availability.
- Multi-locality queries are simplified to one primary locality.
- Production deployment needs final environment variables and CORS settings.

## 3. Wrap-up - 1 to 2 minutes

### Suggested Time Estimate

Use approximate effort categories, not individual names:

```text
Requirement grooming and planning: about 2 to 3 hours.
Architecture and setup: about 2 to 3 hours.
Frontend and dashboard implementation: about 8 to 10 hours.
Backend, MongoDB, and AI integration: about 6 to 8 hours.
Testing and debugging: about 3 to 4 hours.
Documentation and deployment preparation: about 2 to 3 hours.
```

### Key Learnings

Mention:

- Agentic coding helped convert a broad requirement into a working full-stack plan.
- AI was useful for debugging backend/API issues and improving documentation.
- Runtime AI should be treated as optional enhancement with deterministic fallback.
- Compliance and data ethics need to be designed early, not added at the end.

### Future Improvements

Mention:

- Add automatic Atlas-to-local-seed fallback.
- Add backend caching to improve search speed.
- Add Playwright end-to-end tests.
- Add CI pipeline.
- Add production monitoring and stronger upload validation.
- Add licensed/live data sources if permitted.

## 4. Recording Safety Checklist

Before recording:

- Close `.env` files.
- Hide terminal commands that include tokens.
- Do not show MongoDB Atlas password.
- Do not show OpenAI key.
- Do not show Firebase private settings beyond public config if avoidable.
- Do not mention individual team member names.
- Use "Group 14" and "Real Estate Property Intelligence Dashboard".
- Keep browser zoom readable.
- Keep terminal font readable.

## 5. Recommended Demo Order

1. `SUBMISSION_INDEX.md`
2. `GROOMED_REQUIREMENTS.md`
3. `ARCHITECTURE.md`
4. App login
5. Dashboard search
6. Comparison and tabs
7. Data compliance
8. Test result
9. `AGENTIC_EVIDENCE.md`
10. Wrap-up and limitations


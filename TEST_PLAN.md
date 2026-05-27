# Test Plan and Test Cases - PropIntel

## 1. Test Strategy

Testing covers the core hackathon flow:

```text
login -> natural-language requirement -> parsing -> data search -> cleanup -> enrichment -> dashboard -> comparison
```

The test strategy combines automated tests and manual validation:

- Frontend automated tests with Jest and React Testing Library.
- Backend automated tests with pytest.
- Manual end-to-end testing in the browser.
- Manual API testing through FastAPI docs and health/search endpoints.

## 2. Automated Test Commands

### Frontend

```bash
cd real-estate-project-frontend
npm test
```

Expected result:

- 3 test suites passing.
- 28 frontend tests passing.

### Frontend Build

```bash
cd real-estate-project-frontend
npm run build
```

Expected result:

- Vite production build completes successfully.
- Output folder: `dist/`.

### Backend

```bash
cd real-estate-project-backend
source .venv/bin/activate
pytest tests/ -v
```

Expected result:

- Backend pytest suite passes.
- Normalization and pipeline utility behavior is validated.

## 3. Test Coverage Areas

### Authentication

| ID | Scenario | Steps | Expected result |
|----|----------|-------|-----------------|
| AUTH-01 | Email login | Enter valid credentials and submit | User reaches dashboard |
| AUTH-02 | Google login | Click Google sign-in | User reaches dashboard if Firebase is configured |
| AUTH-03 | Invalid login | Enter invalid credentials | Error message is shown |
| AUTH-04 | Password reset | Enter email and request reset | Reset flow message is shown |
| AUTH-05 | Logout | Click logout | User returns to login screen |
| AUTH-06 | Protected route | Open dashboard without session | User is redirected or prevented from accessing dashboard |

### Natural-Language Search

| ID | Scenario | Input | Expected result |
|----|----------|-------|-----------------|
| SEARCH-01 | Standard buy query | `2 BHK in Hinjewadi under 80 lakh ready to move` | Parsed filters and matching properties appear |
| SEARCH-02 | Rental query | `1 BHK rent in Wakad under 30000` | Transaction type is Rent and rental listings are searched |
| SEARCH-03 | Bangalore query | `3 BHK in Whitefield under 1.5 crore` | City/locality are parsed as Bangalore/Whitefield |
| SEARCH-04 | Missing budget | `2 BHK in Kharadi` | Search still runs without budget filter |
| SEARCH-05 | Unknown locality | `2 BHK in unknown area` | System falls back to available locality behavior or shows no matching records gracefully |
| SEARCH-06 | Vastu query | `vastu compliant flat in Hinjewadi` | Vastu preference is applied when available |

### Dashboard and UI

| ID | Scenario | Steps | Expected result |
|----|----------|-------|-----------------|
| UI-01 | Overview cards | Run search | Match count, average price, builder score, and trend cards update |
| UI-02 | Property table | Run search | Table shows property rows with price, area, status, and match score |
| UI-03 | Compare selection | Select up to 3 properties | Compare modal/tab shows selected properties |
| UI-04 | Saved search | Save a query | Query appears in Saved Searches |
| UI-05 | Theme switch | Select Light Violet/Sapphire/Emerald | UI theme changes consistently |
| UI-06 | Responsive layout | Resize to phone/tablet/desktop widths | Cards stack or expand correctly without horizontal UI breakage |

### Data Ingestion

| ID | Scenario | Steps | Expected result |
|----|----------|-------|-----------------|
| INGEST-01 | Upload valid CSV | Upload sample listing CSV | Records are accepted and API returns inserted count |
| INGEST-02 | Upload valid JSON | Upload listing JSON | Records are accepted and available after refresh |
| INGEST-03 | Bad file format | Upload unsupported file | Error state is shown |
| INGEST-04 | Reset seed | Click reset database | Backend seed endpoint re-seeds sample data |

### Backend API

| ID | Endpoint | Scenario | Expected result |
|----|----------|----------|-----------------|
| API-01 | `GET /api/health` | Backend running and DB reachable | Status is `ok`, property count is returned |
| API-02 | `POST /api/search` | Valid query | Response includes parsed requirement and properties |
| API-03 | `POST /api/chat` | Chat message | Response includes reply and parsed requirement |
| API-04 | `GET /api/builders` | Builder request | Builder map is returned |
| API-05 | `GET /api/sentiment/{locality}` | Known locality | Sentiment object is returned |
| API-06 | `GET /api/trends/{locality}` | Known locality | Trend object is returned |
| API-07 | `POST /api/properties/ingest` | Valid records | Inserted count is returned |

### Negative and Edge Cases

| ID | Scenario | Expected result |
|----|----------|-----------------|
| NEG-01 | MongoDB Atlas unavailable | Backend returns clear 503 and frontend shows generic user-friendly error |
| NEG-02 | OpenAI unavailable | Fallback parser keeps parsing/search usable |
| NEG-03 | Empty query | UI prevents or handles empty search gracefully |
| NEG-04 | Large budget query | Search still scores and ranks results |
| NEG-05 | Query with typo locality | Normalizer handles known typo patterns like Hinjawadi/Hinjewadi |
| NEG-06 | Duplicate-like listings | Deduplication reduces duplicate results |
| NEG-07 | No properties match filters | Empty state is shown without crash |
| NEG-08 | Browser refresh | Last tab/query/session behavior remains stable |

### Security and Compliance Checks

| ID | Check | Expected result |
|----|-------|-----------------|
| SEC-01 | OpenAI key exposure | API key exists only in backend `.env`, never frontend |
| SEC-02 | MongoDB URI exposure | URI exists only in backend `.env`, not committed |
| SEC-03 | Frontend env safety | Only `VITE_*` public config is used client-side |
| SEC-04 | Data compliance | No live scraping; sample data usage documented |
| SEC-05 | Secrets in git | `.env` files are ignored and not committed |

## 4. Manual Demo Test Script

1. Start backend.
2. Start frontend.
3. Login using Firebase or sandbox mode.
4. Run search:

```text
Looking for 2 BHK in Hinjewadi, Pune under 80 lakh, ready to move near IT park
```

5. Confirm parsed filters show:
   - City: Pune
   - Locality: Hinjewadi
   - BHK: 2
   - Transaction: Buy
   - Budget: 80 lakh
   - Status: Ready to Move
6. Confirm matching property rows appear.
7. Select properties and open comparison.
8. Open Builders tab and Trends tab.
9. Open Data & Compliance tab.
10. Switch theme and resize browser.
11. Show tests passing in terminal.

## 5. Current Known Test Results

Latest verified frontend results:

```text
Test Suites: 3 passed, 3 total
Tests: 28 passed, 28 total
```

Latest verified frontend build:

```text
vite build completed successfully
```

Backend tests are documented in `real-estate-project-backend/tests/` and should be run before final submission with:

```bash
pytest tests/ -v
```

## 6. Remaining Test Gaps

- End-to-end browser automation is not included.
- Deployed environment tests depend on final backend hosting URL.
- Offline/Atlas-failure behavior currently shows an error unless local seed mode is enabled.
- Load/performance tests are not included.
- Firebase production auth should be validated with final project credentials before deployment.


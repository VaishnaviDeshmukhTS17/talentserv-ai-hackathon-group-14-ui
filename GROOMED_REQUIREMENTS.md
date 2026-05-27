# Groomed Requirements Document - PropIntel

## 1. Challenge Summary

Build a real estate property intelligence dashboard where an authenticated user can enter a natural-language property requirement and receive cleaned, deduplicated, enriched, and ranked property recommendations.

The solution should demonstrate agentic programming practices across requirement analysis, design, implementation, testing, debugging, and review.

## 2. Refined Problem Statement

Property buyers and real estate professionals often compare listings across multiple platforms, builder pages, locality reviews, and pricing signals. This creates duplicated data, inconsistent fields, and incomplete context. Users need a single dashboard that converts a plain-English property requirement into structured filters and presents ranked recommendations with builder reputation, locality sentiment, trend context, and comparison tools.

## 3. Primary Users

- Home buyer evaluating residential properties.
- Investor evaluating price trend, builder reputation, and locality quality.
- Real estate professional comparing shortlisted options for a client.

## 4. Assumptions

- The submitted demo uses permitted sample data rather than live scraping.
- Listing, builder, sentiment, trend, and POI data is seeded into MongoDB Atlas from curated JSON.
- Runtime AI is optional and has deterministic fallback logic when OpenAI is unavailable.
- Firebase authentication is used for production-style authentication; sandbox mode is available for demos.
- The dashboard targets desktop, tablet, and mobile screen widths.
- Secrets are supplied through environment variables and are not committed.

## 5. In Scope

- Protected login and logout flow.
- Natural-language property requirement input.
- Parsing of city, locality, BHK, budget, buy/rent, status preference, and notes.
- Backend search API using FastAPI.
- MongoDB-backed property, builder, trend, sentiment, and POI data.
- Property cleanup and normalization.
- Duplicate/similar listing detection.
- Location quality scoring with POI context.
- Builder reputation and locality sentiment/trend enrichment.
- Ranked recommendations with explanation text.
- Property comparison workflow.
- CSV/JSON ingestion for additional demo listings.
- Compliance tab explaining data usage rules.
- Automated frontend and backend tests.
- Responsive UI across phone, tablet, and desktop widths.

## 6. Out of Scope

- Live scraping from MagicBricks, Housing.com, NoBroker, YouTube, or social platforms.
- Collection of real phone numbers, emails, private owner profiles, or client data.
- Payment, booking, lead routing, or CRM workflows.
- Production-grade observability, audit logging, and rate limiting.
- Multi-user saved searches in a shared server-side database.
- Fully offline production mode.

## 7. User Stories

### Authentication

- As a user, I want to sign in before accessing the dashboard so that property search data is shown in a protected workspace.
- As a demo evaluator, I want a sandbox login path so that I can validate the app even without Firebase credentials.

### Natural-Language Search

- As a buyer, I want to type "2 BHK in Hinjewadi under 80 lakh, ready to move" so that the system can extract useful filters automatically.
- As an investor, I want to refine my query conversationally so that I can compare options without filling long forms.

### Recommendations

- As a user, I want ranked property cards with match scores so that I can quickly shortlist the best options.
- As a user, I want explanation text so that I understand why a property was recommended.

### Comparison

- As a user, I want to select multiple properties and compare them side-by-side so that trade-offs are easier to evaluate.

### Enrichment

- As an investor, I want builder reputation, trend direction, sentiment, and location scores so that I can evaluate risk beyond price.

### Data Ingestion

- As an admin/demo user, I want to upload CSV/JSON listings so that new records can be added to the search dataset.

### Compliance

- As an evaluator, I want to see how data was sourced and what was not scraped so that the project is ethically and legally clear.

## 8. Acceptance Criteria

### Functional Criteria

- User can log in and reach the dashboard.
- User can enter a natural-language property requirement.
- Backend returns parsed filters and ranked property results.
- Results include property details, match score, explanation, builder data, sentiment data, trend data, and location context where available.
- User can compare selected properties.
- User can upload CSV/JSON records through the Properties tab.
- User can view Data & Compliance details.
- Dashboard remains usable on mobile, tablet, and desktop breakpoints.

### AI Criteria

- OpenAI, when configured, supports parsing, chat refinement, recommendation explanation, and sentiment analysis.
- If OpenAI is unavailable, rule-based parsing keeps the dashboard usable.
- OpenAI API key is stored only in backend environment variables.

### Data Criteria

- Seeded MongoDB contains sample property data and enrichment datasets.
- No private credentials or real client data is committed.
- Source attribution fields exist for listing records.

### Testing Criteria

- Frontend test suite passes with Jest.
- Backend test suite passes with pytest.
- Manual testing covers login, search, refinement, comparison, ingestion, and failure scenarios.

### Deployment Criteria

- Frontend can be deployed as a Vite app on Vercel or Netlify.
- Backend can be deployed as a FastAPI service on Render, Railway, or Fly.io.
- Required environment variables are documented without exposing secrets.


# Data Source & Compliance Note — PropIntel

This document satisfies the hackathon requirement to disclose **which data sources were used** and **how data was collected**, and confirms adherence to ethical collection rules.

---

## Summary

PropIntel uses **permitted sample datasets only**. There is **no live web scraping** of listing portals in this submission. All property, builder, sentiment, and trend data is **manually curated mock data** stored in MongoDB for demo reliability.

---

## Data sources used

| Source type | Name / origin | How collected | Used in app? |
|-------------|---------------|---------------|--------------|
| Sample listings | `mockData.ts` (56 properties) | Hand-authored mock records styled after public portal formats (MagicBricks, Housing.com, NoBroker) | ✅ Primary data |
| Builder reputation | `buildersData` in mockData | Curated sample summaries | ✅ Enrichment tab |
| Locality sentiment | `localitySentimentData` | Sample themes/summaries (not scraped comments) | ✅ Trends tab |
| Price trends | `localityTrendsData` | Sample quarterly price history | ✅ Trends tab |
| Points of interest | `pointsOfInterest` | Publicly known landmark coordinates (metro, schools, hospitals) | ✅ Location scores |
| Live portal scraping | MagicBricks, Housing, NoBroker | **Not performed** | ❌ |
| Social media / YouTube | — | **Not performed** | ❌ |
| Private contact data | Owner phone, email, profiles | **Not collected** | ❌ |

**Storage:** MongoDB Atlas database `propintel`, seeded from `real-estate-project-backend/seed/*.json` exported via `scripts/export-seed.ts`.

---

## Compliance rules followed

### 1. Respect restrictions

- We reviewed that major Indian listing portals restrict automated crawling in `robots.txt` and terms of use.
- The app **does not fetch live HTML** from MagicBricks, Housing.com, or NoBroker.
- The in-app **Data & Compliance** tab includes a robots.txt policy simulator for education/demo purposes only.

### 2. No bypassing

- No circumvention of login walls, CAPTCHAs, rate limits, or anti-bot controls.
- The compliance simulator explicitly **blocks** simulated URLs containing `/login`, `/api/`, or owner contact patterns.

### 3. No private data

- Sample listings contain **no real phone numbers, emails, or private owner profiles**.
- `source_url` fields are placeholder URLs for demo attribution only.

### 4. Responsible crawling

- Not applicable for live collection (no crawler deployed).
- If live integration were added in production, we would implement: ≤1 req/2s throttle, robots.txt check, and user-agent identification.

### 5. Source tracking

Every property record includes:

```json
{
  "property_id": "PROP001",
  "source": "MagicBricks",
  "source_url": "https://www.magicbricks.com/prop001"
}
```

Sources in the sample set: **MagicBricks**, **Housing.com**, **NoBroker**, **CSV/JSON Upload** (user ingest demo).

### 6. Fallback data engine

- Primary demo path: MongoDB seeded from JSON.
- If MongoDB is empty, API returns `503` with instruction to run `python -m db.seed_cli`.
- Frontend can upload additional CSV/JSON via Properties tab → `POST /api/properties/ingest`.

---

## Intended portal references (format only)

Sample data **mimics the field layout** of these portals for realism. We do **not** claim live data from them:

| Portal | robots.txt (public) | Our usage |
|--------|---------------------|-----------|
| [MagicBricks](https://www.magicbricks.com) | Restricts many paths | Mock records only |
| [Housing.com](https://www.housing.com) | Restricts automated access | Mock records only |
| [NoBroker](https://www.nobroker.in) | Restricts `/api/`, admin paths | Mock records only |

---

## AI / OpenAI data handling

- User search queries are sent to **OpenAI API** (gpt-4o-mini) for parsing and chat when configured.
- API key is stored **server-side only** (`real-estate-project-backend/.env`).
- No user passwords or Firebase credentials are sent to OpenAI.
- Review [OpenAI Usage Policies](https://openai.com/policies) for production deployments.

---

## Authentication data

- User authentication is delegated to **Firebase** (Google / email).
- This application does **not** store raw passwords.
- Sandbox demo mode stores only display name + email in browser `localStorage`.

---

## User-uploaded data

The Properties tab allows CSV/JSON upload for demo ingestion. Users should only upload data they have rights to use. Uploaded records are tagged:

```json
{ "source": "CSV/JSON Upload", "source_url": "#" }
```

---

## Production recommendations

If extending beyond this hackathon demo:

1. Use **licensed APIs** or **official builder/RERA feeds** instead of scraping.
2. Add a data retention and deletion policy for user queries.
3. Log and audit all external API calls.
4. Obtain legal review before any live portal integration.

---

## Contact & attribution

- **Project:** PropIntel — Real Estate Property Intelligence Dashboard
- **Dataset author:** Team curated sample data in `mockData.ts`
- **Last updated:** May 2026
- **Related UI:** Dashboard → **Data & Compliance** tab
- **Related docs:** [Root README](./README.md), [Agentic evidence](./AGENTIC_EVIDENCE.md)

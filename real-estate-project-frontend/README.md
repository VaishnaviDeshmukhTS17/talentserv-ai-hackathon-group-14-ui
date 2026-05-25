# PropIntel Frontend

React dashboard for the Real Estate Property Intelligence platform. Authenticates users, accepts natural-language property requirements, and displays comparative insights powered by the [Python FastAPI backend](../real-estate-project-backend/).

---

## Stack

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS v4** — themed dashboard UI
- **Recharts** — price, locality, sentiment charts
- **Firebase Auth** — Google sign-in / email (with sandbox fallback)
- **React Router** — `/login`, `/dashboard`

---

## Features

| Tab | Description |
|-----|-------------|
| Dashboard | Search, parsed requirement, top matches, chat assistant |
| Requirements | View/edit parsed criteria and overrides |
| Properties | Filterable listing ledger + CSV/JSON upload |
| Comparisons | Side-by-side property compare + export |
| Builders | Builder reputation dossiers |
| Trends | Sentiment & price trend analytics |
| Data & Compliance | Ethical data policy UI |
| Settings | Profile, theme, backend status |

---

## Prerequisites

- Node.js 18+
- Backend running at `http://localhost:8000` (see [root README](../README.md))
- Firebase project (optional — sandbox auth available)

---

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

App runs at **http://localhost:3000**

### Environment variables (`.env`)

```env
# Leave empty in local dev — Vite proxies /api to localhost:8000
VITE_API_BASE_URL=

# Firebase (required for production auth)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Firebase setup

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication** → Google (and/or Email/Password).
3. Copy web app config into `.env` variables above.
4. Add `localhost` to authorized domains.

**Sandbox mode:** If Firebase keys are missing, the app runs in simulated auth (Settings → Developer → Sandbox Sim). No passwords are stored — only email/name in `localStorage`.

---

## How the frontend talks to the backend

In development, `vite.config.js` proxies all `/api/*` requests to the FastAPI server:

```js
proxy: {
  '/api': { target: 'http://localhost:8000', changeOrigin: true }
}
```

Key client module: `src/services/apiClient.ts`

| Function | Backend endpoint |
|----------|------------------|
| `executeSearch()` | `POST /api/search` |
| `chatWithAgent()` | `POST /api/chat` |
| `fetchBackendHealth()` | `GET /api/health` |
| `ingestProperties()` | `POST /api/properties/ingest` |
| `seedDatabase()` | `POST /api/seed` |

For production, set `VITE_API_BASE_URL=https://your-backend.onrender.com`.

---

## Seed data export

Property sample data lives in `src/assets/mockData.ts`. To refresh MongoDB seed files:

```bash
npx tsx scripts/export-seed.ts
```

This writes JSON to `../real-estate-project-backend/seed/`. Then re-seed:

```bash
cd ../real-estate-project-backend
python -m db.seed_cli --force
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Jest tests (28 cases) |
| `npm run lint` | ESLint |

---

## Tests

Tests mock the FastAPI backend (no live server required):

```bash
npm test
```

| Suite | Coverage |
|-------|----------|
| `pipeline.test.ts` | Normalizer, dedup, parser, API search/ingest, geo, Vastu |
| `apiClient.test.ts` | Health, search, chat, ingest, seed, offline fallback |
| `components.test.tsx` | Login UI |

Shared mock: `src/tests/mockBackendFetch.ts`

---

## Project layout

```
src/
├── App.tsx                    # Auth provider + routes
├── components/
│   ├── Login.tsx
│   ├── Dashboard.tsx          # Main shell
│   ├── DeveloperConsole.tsx   # Agent trace panel
│   └── dashboard/             # Tab components
├── services/
│   ├── apiClient.ts           # Backend HTTP client
│   └── mockApi.ts             # Types + executeSearch wrapper
├── assets/mockData.ts         # Sample dataset (56 listings)
└── utils/                     # Client-side normalizer (used in tests)
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Search returns error / 503 | Start backend; run `python -m db.seed_cli` |
| CORS error in production | Add frontend URL to backend `CORS_ORIGINS` |
| Auth not working | Check Firebase `.env` or enable Sandbox Sim in Settings |
| `Permission denied` on vite | Run `chmod +x node_modules/.bin/*` or reinstall `node_modules` |

---

## Related docs

- [Root setup guide](../README.md)
- [Backend README](../real-estate-project-backend/README.md)
- [Compliance note](../COMPLIANCE.md)
- [Agentic evidence](../AGENTIC_EVIDENCE.md)

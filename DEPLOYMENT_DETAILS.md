# Source Code and Deployment Details - PropIntel

## 1. Repository

Project root:

```text
real-estate-project/
```

Main source folders:

```text
real-estate-project-frontend/    React + Vite frontend
real-estate-project-backend/     FastAPI backend
```

Supporting documentation:

```text
README.md
GROOMED_REQUIREMENTS.md
IMPLEMENTATION_PLAN.md
ARCHITECTURE.md
TEST_PLAN.md
CRITICAL_REVIEW.md
AGENTIC_EVIDENCE.md
COMPLIANCE.md
DEPLOYMENT_DETAILS.md
DEMO_VIDEO_GUIDE.md
```

## 2. Technology Stack

Frontend:

- React 19
- Vite
- Tailwind CSS v4
- Firebase Authentication
- Recharts
- Jest and React Testing Library

Backend:

- Python
- FastAPI
- Motor async MongoDB client
- MongoDB Atlas
- OpenAI API
- pytest

Database:

- MongoDB Atlas M0
- Database: `propintel`

Runtime AI:

- OpenAI `gpt-4o-mini`
- Rule-based fallback parser when OpenAI is unavailable

## 3. Local Run Instructions

### Backend

```bash
cd real-estate-project-backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Update `.env` with backend values, then seed data:

```bash
python -m db.seed_cli
```

Start backend:

```bash
uvicorn main:app --reload --port 8000
```

Or use:

```bash
./run.sh
```

Verify backend:

```text
http://localhost:8000/api/health
```

API docs:

```text
http://localhost:8000/docs
```

### Frontend

```bash
cd real-estate-project-frontend
npm install
cp .env.example .env
npm run dev
```

Open:

```text
http://localhost:3000
```

In local development, Vite proxies `/api/*` requests to `http://localhost:8000`.

## 4. Required Environment Variables

### Backend `.env`

```env
MONGODB_URI=mongodb+srv://db_user:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/propintel?retryWrites=true&w=majority
MONGODB_DB_NAME=propintel
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGINS=http://localhost:3000
USE_LOCAL_SEED=false
```

Notes:

- `MONGODB_URI` is backend-only.
- `OPENAI_API_KEY` is backend-only.
- Do not commit `.env`.
- For local seed-only mode, set `USE_LOCAL_SEED=true`.

### Frontend `.env`

```env
VITE_API_BASE_URL=
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Notes:

- `VITE_API_BASE_URL` can be empty locally because Vite proxy handles `/api`.
- In production, set `VITE_API_BASE_URL` to the backend deployment URL.
- Do not put OpenAI or MongoDB secrets in frontend env variables.

## 5. Seed Data Setup

If seed JSON needs to be regenerated from frontend mock data:

```bash
cd real-estate-project-frontend
npx tsx scripts/export-seed.ts
```

Then seed MongoDB:

```bash
cd ../real-estate-project-backend
source .venv/bin/activate
python -m db.seed_cli --force
```

Expected seeded data:

- Approximately 56 properties.
- 20 builders.
- 11 sentiment localities.
- 11 trend localities.
- 23 points of interest.

## 6. Frontend Deployment - Vercel

Recommended Vercel settings:

```text
Framework Preset: Vite
Root Directory: real-estate-project-frontend
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

Required Vercel environment variables:

```env
VITE_API_BASE_URL=https://your-backend-domain
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Do not add backend secrets to Vercel frontend environment variables.

## 7. Backend Deployment - Render / Railway / Fly.io

Recommended backend command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Backend root directory:

```text
real-estate-project-backend
```

Required backend environment variables:

```env
MONGODB_URI=...
MONGODB_DB_NAME=propintel
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGINS=https://your-frontend-domain
USE_LOCAL_SEED=false
```

After backend deploy:

1. Add backend IP/domain to MongoDB Atlas Network Access as needed.
2. Add frontend production URL to `CORS_ORIGINS`.
3. Set frontend `VITE_API_BASE_URL` to backend URL.
4. Verify `/api/health`.
5. Seed Atlas if required.

## 8. Production Verification Checklist

- Frontend deploy builds successfully.
- Backend deploy starts successfully.
- `/api/health` returns status `ok`.
- MongoDB Atlas contains seeded records.
- Login works with Firebase.
- Natural-language search returns properties.
- Compare flow works.
- Data & Compliance tab is visible.
- No credentials are visible in browser dev tools.
- No `.env` files are committed.

## 9. Test Commands Before Submission

Frontend:

```bash
cd real-estate-project-frontend
npm test
npm run build
```

Backend:

```bash
cd real-estate-project-backend
source .venv/bin/activate
pytest tests/ -v
```

## 10. Known Deployment Notes

- Vercel should host only the frontend.
- FastAPI backend should be hosted on a Python-capable platform such as Render, Railway, or Fly.io.
- MongoDB Atlas access must allow the backend deployment environment.
- If Atlas is unreachable and `USE_LOCAL_SEED=false`, `/api/search` returns an error.
- For demo reliability without Atlas, use `USE_LOCAL_SEED=true` in backend.


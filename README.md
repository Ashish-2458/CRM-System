# Support CRM

A full-stack Customer Support CRM built with FastAPI + SQLite backend and React + Vite frontend.

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Full Stack (production build)

```bash
# Build frontend
cd frontend
npm run build

# Serve everything via FastAPI
cd ..
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

Then open http://localhost:8000.

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

- `DATABASE_URL` — SQLite connection string (default: `sqlite:///./data/crm.db`)
- `FRONTEND_ORIGIN` — Frontend origin for CORS (default: `http://localhost:5173`)

## Deployed URL

https://crm-system-production-7b64.up.railway.app

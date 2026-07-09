# Resume Agent

Resume Agent is a full-stack MVP for resume-based job matching. Users sign up, upload a PDF resume, extract skills and job preferences with local Ollama, fetch LinkedIn jobs through Apify, store them in PostgreSQL, and review stored match scores in a React dashboard.

## Tech Stack

- Backend: FastAPI, SQLAlchemy, Alembic, APScheduler
- Frontend: React, React Router, Axios, Tailwind CSS
- Database: PostgreSQL with JSONB fields
- Auth: JWT with bcrypt/passlib password hashing
- Resume parsing: pypdf
- LLM: Ollama `llama3.2:1b`
- Job source: Apify LinkedIn Jobs actor/API
- Runtime: Docker Compose

## Environment

Copy the example file and fill in secrets:

```bash
cp .env.example .env
```

Important variables:

- `DATABASE_URL`: SQLAlchemy PostgreSQL URL.
- `SECRET_KEY`: JWT signing key.
- `APIFY_TOKEN`: Apify API token. If empty, scheduled fetches no-op safely.
- `APIFY_ACTOR_ID`: Actor ID used for LinkedIn jobs, usually in Apify's URL-safe `owner~actor-name` format.
- `OLLAMA_BASE_URL`: Ollama service URL.
- `OLLAMA_MODEL`: Defaults to `llama3.2:1b`.
- `UPLOAD_DIR`: Local folder for uploaded PDFs.
- `INTERNAL_FETCH_TOKEN`: Optional token for `/api/jobs/fetch-now`.

## Run With Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Open:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

Pull the Ollama model after the Ollama container is running:

```bash
docker compose exec ollama ollama pull llama3.2:1b
```

## Run Backend Locally

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

For local backend development, point `DATABASE_URL` and `OLLAMA_BASE_URL` at your local or Docker services.

## Run Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

The frontend uses `VITE_API_URL` when provided, otherwise it calls `http://localhost:8000/api`.

## Scheduler

APScheduler starts with the FastAPI app. It runs daily at 9:00 UTC. On startup, it checks the latest fetched job; if there is no recent history, it fetches the last 7 days, otherwise the last 24 hours. Expired jobs are marked inactive before each fetch.

## Matching

Matches are stored in `user_job_matches`; the dashboard reads from that table instead of recalculating on every page load.

The MVP score is:

- 40% skill and keyword match against job title/description
- 30% job title similarity
- 30% location match, kept flexible for United States-wide jobs

Matching runs when jobs are fetched, when a resume finishes processing, and when users edit extracted skills, keywords, titles, or location.

## API Overview

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

Resume:

- `POST /api/resumes/upload`
- `GET /api/resumes/me`
- `GET /api/resumes/status`

User settings:

- `GET /api/users/me`
- `PATCH /api/users/me`
- `PATCH /api/users/me/skills`

Jobs:

- `GET /api/jobs`
- `GET /api/jobs/{job_id}`
- `POST /api/jobs/fetch-now`

Matches:

- `GET /api/matches`
- `GET /api/matches/{match_id}`
- `PATCH /api/matches/{match_id}/status`
- `POST /api/matches/recalculate`

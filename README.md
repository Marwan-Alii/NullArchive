# NullArchive

**An open repository for negative scientific results, failed experiments, and research paths that didn't work.**

Successful experiments get published. Failed ones disappear — filed away in
lab notebooks, private channels, and abandoned branches nobody outside the
original team ever sees. NullArchive exists to preserve that hidden
knowledge, so the next researcher doesn't spend six months rediscovering a
dead end.

This repository contains both the frontend and backend for the platform.

```
nullarchive/
├── frontend/          React + TypeScript + Tailwind CSS (Vite)
├── backend/            FastAPI + PostgreSQL
└── README.md           You are here
```

## Tech stack

| Layer          | Technology                                   |
|-----------------|-----------------------------------------------|
| Frontend        | React 18, TypeScript, Tailwind CSS, React Router |
| Backend         | FastAPI (Python), SQLAlchemy, Pydantic       |
| Database        | PostgreSQL                                    |
| Auth            | Email/password, JWT access tokens             |
| File storage    | Storage abstraction — local disk in dev, Supabase Storage (or any S3-compatible bucket) in production |

## Getting started

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 14+ (running locally, or a connection string to a hosted instance)

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env             # then edit DATABASE_URL / SECRET_KEY
python -m app.db.seed            # creates tables + seeds categories and a demo account
uvicorn app.main:app --reload --port 8000
```

The API is now running at `http://localhost:8000`. Interactive docs are at
`http://localhost:8000/docs`.

Demo account created by the seed script: `demo@nullarchive.org` / `changeme123`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app is now running at `http://localhost:5173`, and it talks to the real
backend at the URL set in `VITE_API_URL` (see `frontend/.env.example`) —
defaulting to `http://localhost:8000` if unset. Start the backend first (see
above) or you'll see empty states and "couldn't reach the archive" messages.

### 3. Environment variables

See `backend/.env.example` for the full list. The important ones:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | Signs JWT access tokens — set a long random value in production |
| `STORAGE_BACKEND` | `local` (default) or `supabase` |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | Required only if `STORAGE_BACKEND=supabase` |
| `FRONTEND_ORIGIN` | Allowed CORS origin for the API |

## Database schema

Defined as SQLAlchemy models in `backend/app/models/models.py`. A plain-SQL
mirror for reference is in `backend/schema.sql`.

**Entities:** `User`, `ResearchEntry`, `ResearchCategory`, `Attachment`,
`Comment`, `Review`, `ViewHistory`.

**Key relationships:**
- `User` 1—N `ResearchEntry` (a researcher authors many entries)
- `ResearchEntry` 1—N `Comment`
- `ResearchEntry` 1—N `Attachment`
- `ResearchEntry` 1—N `Review` (reviewer sign-off before publication)
- `ResearchEntry` 1—N `ViewHistory` (view analytics)

## Storage abstraction

File uploads (papers, images, code, data) go through
`backend/app/core/storage.py`, which defines a `StorageBackend` interface
with two implementations:

- **`LocalStorageBackend`** — writes to disk, used by default for local development.
- **`SupabaseStorageBackend`** — uploads to a Supabase Storage bucket (or swap in any S3-compatible client). Activate it by setting `STORAGE_BACKEND=supabase` plus the Supabase env vars, and `pip install supabase`.

No application code changes are needed to switch between them.

## Project structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/       Header, Footer
│   │   ├── ui/           ResultStamp and other small UI primitives
│   │   └── research/     ResearchCard
│   ├── pages/             One file per route (Landing, Explore, ResearchDetail, Submit, Profile, Login, Register, About...)
│   ├── data/               Mock data powering the UI before the API is wired up
│   ├── types/              Shared TypeScript types
│   └── App.tsx             Route definitions

backend/
├── app/
│   ├── core/               Settings, security (JWT/hashing), storage abstraction
│   ├── db/                  SQLAlchemy session + seed script
│   ├── models/              ORM models (the schema)
│   ├── schemas/             Pydantic request/response models
│   ├── routers/             auth, research, comments, users
│   └── main.py               FastAPI app + router registration
├── schema.sql               Reference raw SQL schema
├── requirements.txt
└── .env.example
```

## Contributing

This project is intended to be open source and community-maintained.

1. Fork the repository and branch off `main`.
2. Keep the frontend and backend decoupled — they should only ever agree on the API contract (see `backend/app/schemas/schemas.py` and `frontend/src/types/index.ts`).
3. Add tests for new backend endpoints (`pytest` recommended; not yet included in this scaffold).
4. Open an issue before large structural changes so maintainers can weigh in early.
5. Write clear, specific PR descriptions — the same standard the platform asks of research submissions.

## Roadmap / known gaps in this scaffold

This is the foundation of a real platform, not a finished product. Not yet implemented:

- A reviewer/admin UI to approve submissions (new entries are created with `is_published=False` and need a `Review` row to go live — right now that only happens by editing the database directly)
- File attachment uploads wired into the Submit form (the endpoint exists at `POST /api/research/{slug}/attachments`, but the form doesn't call it yet)
- Alembic migration files (the seed script creates tables directly via SQLAlchemy for now)
- Role-based authorization enforcement in the reviewer/admin workflows
- Email delivery for password resets
- Automated tests
- Rate limiting and abuse protection on submission/comment endpoints

## License

Choose and add a license (e.g. MIT or Apache-2.0) appropriate for an open-source science project before publishing.

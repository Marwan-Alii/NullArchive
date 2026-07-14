-- Reference schema for NullArchive (PostgreSQL).
-- The SQLAlchemy models in app/models/models.py are the source of truth;
-- this file mirrors them for quick reference or manual DB inspection.
-- Prefer running the app (which creates tables via SQLAlchemy) or Alembic
-- migrations over applying this file directly in production.

CREATE TYPE user_role AS ENUM ('researcher', 'reviewer', 'administrator');
CREATE TYPE research_type AS ENUM (
  'Failed Experiment', 'Negative Result', 'Null Result',
  'Failed Replication', 'Unexpected Outcome'
);
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'changes_requested', 'rejected');
CREATE TYPE attachment_kind AS ENUM ('paper', 'image', 'code', 'data');

CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  institution VARCHAR(255),
  bio TEXT,
  role user_role NOT NULL DEFAULT 'researcher',
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  reputation INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE research_categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE research_entries (
  id UUID PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(300) NOT NULL,
  research_type research_type NOT NULL,
  abstract TEXT NOT NULL,
  research_question TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  methodology TEXT NOT NULL,
  expected_outcome TEXT NOT NULL,
  actual_outcome TEXT NOT NULL,
  why_it_failed TEXT NOT NULL,
  lessons_learned TEXT NOT NULL,
  references TEXT,
  author_id UUID NOT NULL REFERENCES users(id),
  category_id UUID NOT NULL REFERENCES research_categories(id),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  view_count INTEGER NOT NULL DEFAULT 0,
  citation_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE TABLE attachments (
  id UUID PRIMARY KEY,
  research_entry_id UUID NOT NULL REFERENCES research_entries(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  kind attachment_kind NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE comments (
  id UUID PRIMARY KEY,
  research_entry_id UUID NOT NULL REFERENCES research_entries(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  research_entry_id UUID NOT NULL REFERENCES research_entries(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id),
  status review_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE view_history (
  id UUID PRIMARY KEY,
  research_entry_id UUID NOT NULL REFERENCES research_entries(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES users(id),
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_research_entries_slug ON research_entries(slug);
CREATE INDEX idx_research_entries_category ON research_entries(category_id);
CREATE INDEX idx_research_entries_author ON research_entries(author_id);
CREATE INDEX idx_comments_entry ON comments(research_entry_id);
CREATE INDEX idx_view_history_entry ON view_history(research_entry_id);

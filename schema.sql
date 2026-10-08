-- CertiForge Cloudflare D1 Database Schema
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT,
  organization_name TEXT NOT NULL,
  role TEXT DEFAULT 'owner',
  plan TEXT DEFAULT 'pro',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  template_id TEXT NOT NULL,
  prefix TEXT NOT NULL,
  recipients_count INTEGER DEFAULT 0,
  generated_count INTEGER DEFAULT 0,
  emailed_count INTEGER DEFAULT 0,
  verified_count INTEGER DEFAULT 0,
  data_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS certificates (
  certificate_id TEXT PRIMARY KEY,
  project_id TEXT,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT,
  course_name TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  status TEXT DEFAULT 'VERIFIED',
  metadata_json TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_used_at TEXT
);

-- Seed initial test certificate
INSERT OR IGNORE INTO certificates (certificate_id, project_id, recipient_name, recipient_email, course_name, organization_name, issue_date, status, created_at)
VALUES ('CERT-2026-00001', 'proj-python-2026', 'Aarav Patel', 'aarav.patel@example.com', 'Full-Stack Web Development Bootcamp', 'DevStudio Global Academy', 'October 15, 2026', 'VERIFIED', '2026-10-01T00:00:00Z');

-- Migration 030: Session Notes
-- Add a notes field to sessions for "thoughts from the throne"

alter table sessions
  add column if not exists notes text;

comment on column sessions.notes is 'Optional user notes/ideas captured during the session';

-- Index for future full-text search (optional, lightweight)
create index if not exists idx_sessions_notes on sessions using gin(to_tsvector('english', coalesce(notes, '')));

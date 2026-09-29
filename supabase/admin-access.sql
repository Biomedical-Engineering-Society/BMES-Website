-- Access list for the website's /admin tool.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to run again; it only creates what is missing.

create table if not exists public.admin_users (
  email        text primary key check (email = lower(email)),
  name         text,
  role         text not null default 'editor' check (role in ('owner', 'editor')),
  added_by     text,
  added_at     timestamptz not null default now(),
  last_sign_in timestamptz
);

create table if not exists public.admin_access_requests (
  id          uuid primary key default gen_random_uuid(),
  email       text not null check (email = lower(email)),
  name        text,
  note        text,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at  timestamptz not null default now(),
  decided_by  text,
  decided_at  timestamptz
);

-- One open request per person; they can ask again after a decision.
create unique index if not exists admin_access_requests_one_pending
  on public.admin_access_requests (email) where status = 'pending';

-- Row level security on, with no policies: the public anon key (used by the
-- chatbot) cannot see or touch these tables. Only the website's server, which
-- holds the service role key, can.
alter table public.admin_users enable row level security;
alter table public.admin_access_requests enable row level security;

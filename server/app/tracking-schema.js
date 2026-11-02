// Additive schema for admin tracking (scan runs, durations, alert and welcome
// emails, snippet errors). Same SQL as supabase/migrations/0015_admin_tracking.sql
// (a test keeps them in sync). Safe to run any number of times: it only adds
// nullable columns and new tables, and never drops or changes existing data.
export const TRACKING_SCHEMA_SQL = `
select pg_advisory_xact_lock(815015);

alter table app.scans add column if not exists duration_ms integer;

create table if not exists app.scan_runs (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references app.accounts (id) on delete cascade,
  domain_id   uuid references app.domains (id) on delete cascade,
  page_id     uuid references app.pages (id) on delete cascade,
  kind        text not null default 'page' check (kind in ('page', 'domain')),
  trigger     text not null default 'manual',
  pages       integer not null default 1,
  status      text not null default 'running' check (status in ('running', 'done', 'failed')),
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  duration_ms integer
);
create index if not exists scan_runs_account_started_idx on app.scan_runs (account_id, started_at desc);
alter table app.scan_runs enable row level security;

create table if not exists app.alert_emails (
  id          bigint generated always as identity primary key,
  account_id  uuid not null references app.accounts (id) on delete cascade,
  kind        text not null default 'regression',
  page_url    text check (char_length(page_url) <= 2048),
  recipients  integer,
  status      text not null check (status in ('sent', 'failed', 'skipped')),
  resend_id   text,
  error       text check (char_length(error) <= 300),
  created_at  timestamptz not null default now()
);
create index if not exists alert_emails_account_created_idx on app.alert_emails (account_id, created_at desc);
alter table app.alert_emails enable row level security;

create table if not exists app.welcome_emails (
  account_id  uuid primary key references app.accounts (id) on delete cascade,
  status      text not null check (status in ('sent', 'failed')),
  resend_id   text,
  error       text check (char_length(error) <= 300),
  sent_at     timestamptz,
  updated_at  timestamptz not null default now()
);
alter table app.welcome_emails enable row level security;

create table if not exists app.snippet_errors (
  domain_id   uuid not null references app.domains (id) on delete cascade,
  day         date not null default current_date,
  code        text not null check (char_length(code) <= 40),
  count       integer not null default 1,
  last_at     timestamptz not null default now(),
  primary key (domain_id, day, code)
);
alter table app.snippet_errors enable row level security;
`;

-- Compliance records: documentation of accessibility work, for audits and legal defense.
--
-- app.activity_log       Changes people make in AccessBell (fixes, statement, settings,
--                        monitored pages) and remediation notes they write themselves.
-- app.compliance_records Every compliance record generated, stored exactly as issued
--                        with its SHA-256 fingerprint, so it can be re-downloaded and
--                        verified later.
--
-- Run once in Supabase: Dashboard -> SQL Editor -> paste this file -> Run.
-- Safe to re-run. Until it runs, the dashboard explains that this update is needed
-- and every other feature keeps working.

create table if not exists app.activity_log (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references app.accounts (id) on delete cascade,
  domain_id   uuid not null references app.domains (id) on delete cascade,
  user_id     uuid references auth.users (id) on delete set null,
  user_email  text,
  action      text not null check (char_length(action) between 1 and 60),
  detail      jsonb not null default '{}'::jsonb,
  happened_on date,
  created_at  timestamptz not null default now()
);
create index if not exists activity_log_domain_idx on app.activity_log (domain_id, created_at desc);
alter table app.activity_log enable row level security;

create table if not exists app.compliance_records (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references app.accounts (id) on delete cascade,
  -- Records outlive the domain: removing a domain from the dashboard keeps them.
  domain_id   uuid references app.domains (id) on delete set null,
  hostname    text not null,
  user_id     uuid references auth.users (id) on delete set null,
  user_email  text,
  period_from date not null,
  period_to   date not null,
  body        text not null,
  sha256      text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  created_at  timestamptz not null default now()
);
create index if not exists compliance_records_domain_idx on app.compliance_records (domain_id, created_at desc);
alter table app.compliance_records enable row level security;

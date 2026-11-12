-- One regression alert email per account and site per monitoring run.
-- Additive only: one new table. Safe to re-run. The app also applies this SQL
-- by itself on first use (server/app/alert-digest.js).

select pg_advisory_xact_lock(815017);

create table if not exists app.alert_digests (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references app.accounts (id) on delete cascade,
  hostname    text not null check (char_length(hostname) <= 253),
  regressions jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  sent_at     timestamptz
);
create unique index if not exists alert_digests_one_open_idx on app.alert_digests (account_id, hostname) where sent_at is null;
alter table app.alert_digests enable row level security;

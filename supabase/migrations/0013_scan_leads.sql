-- Scan leads: emails visitors leave after a free scan, for follow-up.
--
-- Run once in Supabase: Dashboard -> SQL Editor -> paste this file -> Run.
-- Safe to re-run. The free_scans log itself keeps no email addresses by
-- design; this table is the only place a scan visitor's email is stored, and
-- only when the visitor types it in after seeing their results. Results are
-- never gated on leaving an email.
--
-- Follow-up sequences (scan follow-up, abandoned checkout, audit upsell)
-- read this table and one_time_purchases; every sequence email carries an
-- opt-out line.

create table if not exists app.scan_leads (
  id          bigint generated always as identity primary key,
  email       text not null check (char_length(email) <= 254),
  hostname    text check (char_length(hostname) <= 253),
  url         text check (char_length(url) <= 2048),
  created_at  timestamptz not null default now()
);
create index if not exists scan_leads_email_idx on app.scan_leads (lower(email));
create index if not exists scan_leads_hostname_idx on app.scan_leads (hostname);
alter table app.scan_leads enable row level security;

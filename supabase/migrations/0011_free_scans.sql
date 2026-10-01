-- Free scans: every scan run from the public checkers, so the site owner can
-- see which domains people check and from which checker page.
--
-- Run once in Supabase: Dashboard -> SQL Editor -> paste this file -> Run.
-- Safe to re-run. Until it runs, free scans keep working and are not logged.
-- No IP addresses are stored. Rows older than 12 months are deleted.

create table if not exists app.free_scans (
  id          bigint generated always as identity primary key,
  url         text not null check (char_length(url) <= 2048),
  final_url   text check (char_length(final_url) <= 2048),
  hostname    text not null check (char_length(hostname) <= 253),
  standard    text not null check (char_length(standard) <= 20),
  source      text check (char_length(source) <= 300),
  country     text check (char_length(country) <= 2),
  status      text not null check (status in ('done', 'failed')),
  engine      text check (char_length(engine) <= 20),
  issues      integer,
  critical    integer,
  serious     integer,
  error       text check (char_length(error) <= 300),
  created_at  timestamptz not null default now()
);
create index if not exists free_scans_created_idx on app.free_scans (created_at desc);
create index if not exists free_scans_hostname_idx on app.free_scans (hostname);
alter table app.free_scans enable row level security;

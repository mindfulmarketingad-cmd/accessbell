-- Issues your team marks as resolved by hand, for the whole domain or one page.
--
-- Run once in Supabase: Dashboard -> SQL Editor -> paste this file -> Run.
-- Safe to re-run. Until it runs, marking issues as resolved explains that this
-- update is needed and every other feature keeps working.

create table if not exists app.issue_resolutions (
  id           uuid primary key default gen_random_uuid(),
  domain_id    uuid not null references app.domains (id) on delete cascade,
  rule_id      text not null check (rule_id ~ '^[A-Za-z0-9-]{1,80}$'),
  page_id      uuid references app.pages (id) on delete cascade,
  note         text check (char_length(note) <= 500),
  resolved_by  uuid,
  resolved_email text,
  created_at   timestamptz not null default now()
);
-- One resolution per issue for the whole domain (page_id null) and per page.
create unique index if not exists issue_resolutions_unique_idx
  on app.issue_resolutions (domain_id, rule_id, coalesce(page_id, '00000000-0000-0000-0000-000000000000'::uuid));
alter table app.issue_resolutions enable row level security;

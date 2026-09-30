-- PDF accessibility scanning: PDFs found on a domain's pages and their results.
--
-- Run once in Supabase: Dashboard -> SQL Editor -> paste this file -> Run.
-- Safe to re-run. Until it runs, the Documents tab explains that this update is
-- needed and every other feature keeps working.

create table if not exists app.documents (
  id            uuid primary key default gen_random_uuid(),
  domain_id     uuid not null references app.domains (id) on delete cascade,
  url           text not null check (char_length(url) <= 2048),
  found_on      text check (char_length(found_on) <= 2048),
  status        text not null default 'pending' check (status in ('pending', 'done', 'failed')),
  bytes         integer,
  pages         integer,
  title         text,
  lang          text,
  tagged        boolean,
  issues        jsonb,
  issues_count  integer,
  passes        jsonb,
  error         text,
  checked_at    timestamptz,
  created_at    timestamptz not null default now(),
  unique (domain_id, url)
);
create index if not exists documents_domain_idx on app.documents (domain_id);
alter table app.documents enable row level security;

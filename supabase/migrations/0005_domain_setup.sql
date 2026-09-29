-- AccessBellFix and hosted accessibility statements.
--
-- Run once in Supabase: Dashboard -> SQL Editor -> paste this file -> Run.
-- Additive and safe on a live database: it never drops data, and running it
-- again changes nothing.
--
-- app.domains.site_key      Public key in the AccessBellFix snippet and the hosted statement link.
-- app.domains.fix_seen_at   When the AccessBellFix script last loaded on the site.
-- app.domains.statement     The accessibility statement answers from the setup flow.
-- app.fixes                 Fixes the customer reviewed and approved for AccessBellFix to apply.

alter table app.domains add column if not exists site_key text;
alter table app.domains add column if not exists fix_seen_at timestamptz;
alter table app.domains add column if not exists statement jsonb;
create unique index if not exists domains_site_key_key on app.domains (site_key);

create table if not exists app.fixes (
  id          uuid primary key default gen_random_uuid(),
  domain_id   uuid not null references app.domains (id) on delete cascade,
  kind        text not null check (kind in ('alt', 'name', 'lang')),
  selector    text not null check (char_length(selector) between 1 and 300),
  value       text not null check (char_length(value) between 1 and 300),
  enabled     boolean not null default true,
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists fixes_domain_idx on app.fixes (domain_id);
alter table app.fixes enable row level security;

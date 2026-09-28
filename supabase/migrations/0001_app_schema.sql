-- AccessBell application schema.
--
-- Run once in Supabase: Dashboard -> SQL Editor -> paste this file -> Run.
-- Safe to re-run: it drops and recreates the private "app" schema, which
-- deletes all AccessBell app data (it does not touch Supabase Auth users).
--
-- Tables live in the "app" schema, which Supabase's public REST API does not
-- expose. Only the server (connecting with DATABASE_URL) can read or write it.

drop schema if exists app cascade;
create schema app;

revoke all on schema app from public;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on schema app from anon, authenticated';
  end if;
end $$;

-- ---------- Users and accounts ----------

create table app.profiles (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  created_at  timestamptz not null default now()
);
create unique index profiles_email_key on app.profiles (lower(email));

create table app.accounts (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null check (char_length(name) between 1 and 120),
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  subscription_status     text not null default 'none' check (subscription_status in
                            ('none', 'trialing', 'active', 'past_due', 'canceled', 'unpaid',
                             'incomplete', 'incomplete_expired', 'paused')),
  domain_quota            integer not null default 0 check (domain_quota >= 0),
  trial_ends_at           timestamptz,
  current_period_end      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create table app.account_members (
  account_id  uuid not null references app.accounts (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        text not null check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at  timestamptz not null default now(),
  primary key (account_id, user_id)
);
create index account_members_user_idx on app.account_members (user_id);

-- ---------- Domains, pages and scans ----------

create table app.domains (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references app.accounts (id) on delete cascade,
  hostname    text not null,
  base_url    text not null,
  settings    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  unique (account_id, hostname)
);
create index domains_account_idx on app.domains (account_id);

create table app.pages (
  id               uuid primary key default gen_random_uuid(),
  domain_id        uuid not null references app.domains (id) on delete cascade,
  url              text not null check (char_length(url) <= 2048),
  monitored        boolean not null default false,
  source           text not null default 'manual' check (source in ('manual', 'crawl', 'sitemap')),
  last_scan_id     uuid,
  last_score       integer,
  last_issues      integer,
  last_scanned_at  timestamptz,
  created_at       timestamptz not null default now(),
  unique (domain_id, url)
);
create index pages_domain_idx on app.pages (domain_id);

create table app.scans (
  id            uuid primary key default gen_random_uuid(),
  account_id    uuid not null references app.accounts (id) on delete cascade,
  domain_id     uuid not null references app.domains (id) on delete cascade,
  page_id       uuid not null references app.pages (id) on delete cascade,
  device        text not null default 'desktop' check (device in ('desktop', 'mobile')),
  status        text not null check (status in ('done', 'failed')),
  engine        text,
  standard      text,
  score         integer,
  issues_count  integer,
  summary       jsonb,
  issues        jsonb,
  passes        jsonb,
  review        jsonb,
  notes         jsonb,
  final_url     text,
  error         text,
  trigger       text not null default 'manual' check (trigger in ('manual', 'scheduled')),
  created_by    uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now()
);
create index scans_page_created_idx on app.scans (page_id, created_at desc);
create index scans_domain_created_idx on app.scans (domain_id, created_at desc);

-- ---------- Billing ----------

create table app.stripe_events (
  id          text primary key,
  type        text not null,
  created_at  timestamptz not null default now()
);

-- ---------- Rules enforced by the database ----------

-- Lite includes up to 25 monitored URLs per domain. The domain row is locked
-- so two concurrent requests cannot both slip past the limit.
create function app.enforce_monitored_page_limit() returns trigger
language plpgsql as $$
declare
  monitored_count integer;
begin
  if new.monitored and (tg_op = 'INSERT' or not old.monitored) then
    perform 1 from app.domains where id = new.domain_id for update;
    select count(*) into monitored_count
      from app.pages
     where domain_id = new.domain_id and monitored and id <> new.id;
    if monitored_count >= 25 then
      raise exception 'monitored_page_limit' using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;

create trigger pages_monitored_limit
  before insert or update of monitored on app.pages
  for each row execute function app.enforce_monitored_page_limit();

create function app.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger accounts_touch_updated_at
  before update on app.accounts
  for each row execute function app.touch_updated_at();

-- Defense in depth: even if this schema were ever exposed, row level
-- security with no policies denies every API role.
alter table app.profiles        enable row level security;
alter table app.accounts        enable row level security;
alter table app.account_members enable row level security;
alter table app.domains         enable row level security;
alter table app.pages           enable row level security;
alter table app.scans           enable row level security;
alter table app.stripe_events   enable row level security;

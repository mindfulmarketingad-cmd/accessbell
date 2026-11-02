-- Shopify App Store version of AccessBell (branch shopify-app).
--
-- NOT APPLIED. Additive only: two new tables, nothing existing is changed.
-- Run it in Supabase only when the Shopify app is approved to go live.
--
-- - app.shopify_shops: one row per store that installed the app. Tokens are
--   encrypted by the app (AES-256-GCM, server/shopify/crypto-box.js) before
--   they are written. account_id/domain_id link the store to the AccessBell
--   account and domain created for it on first open.
-- - app.shopify_webhook_events: webhook ids already handled, so Shopify's
--   retries are processed once.

select pg_advisory_xact_lock(815016);

create table if not exists app.shopify_shops (
  shop                      text primary key check (shop ~ '^[a-z0-9][a-z0-9-]*\.myshopify\.com$'),
  account_id                uuid references app.accounts (id) on delete set null,
  domain_id                 uuid references app.domains (id) on delete set null,
  account_created           boolean not null default false,
  access_token              text,
  access_token_expires_at   timestamptz,
  refresh_token             text,
  refresh_token_expires_at  timestamptz,
  scope                     text,
  shop_name                 text,
  shop_email                text,
  primary_host              text,
  -- TODO(pricing approval): Shopify plan state, set from app_subscriptions/update.
  billing_status            text not null default 'pending',
  billing_plan              text,
  installed_at              timestamptz not null default now(),
  uninstalled_at            timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);
create index if not exists shopify_shops_account_idx on app.shopify_shops (account_id);
alter table app.shopify_shops enable row level security;

create table if not exists app.shopify_webhook_events (
  id           text primary key,
  topic        text not null,
  shop         text not null,
  received_at  timestamptz not null default now()
);
create index if not exists shopify_webhook_events_received_idx on app.shopify_webhook_events (received_at);
alter table app.shopify_webhook_events enable row level security;

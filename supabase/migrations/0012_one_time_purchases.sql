-- One-time purchases: Page Report ($19) and Domain Audit ($79).
--
-- Run once in Supabase: Dashboard -> SQL Editor -> paste this file -> Run.
-- Safe to re-run. The buyer needs no account: the emailed token link is the
-- access control, so the token must stay unguessable (32 hex characters).
-- Rows are written by the server only (DATABASE_URL); the app schema is not
-- exposed through the public REST API.
--
-- Flow: /api/one-time-checkout inserts a pending row, Stripe calls
-- /api/stripe-webhook with checkout.session.completed, the payment-mode
-- branch marks the row paid, and the report is built on first view (page
-- report) or by the Inngest crawl (domain audit).

create table if not exists app.one_time_purchases (
  id                      uuid primary key default gen_random_uuid(),
  token                   text not null unique check (char_length(token) = 32),
  email                   text not null check (char_length(email) <= 254),
  product                 text not null check (product in ('page_report', 'domain_audit')),
  url                     text not null check (char_length(url) <= 2048),
  hostname                text check (char_length(hostname) <= 253),
  amount_cents            integer not null check (amount_cents > 0),
  stripe_session_id       text unique,
  stripe_payment_intent_id text,
  status                  text not null default 'pending' check (status in ('pending', 'paid', 'refunded')),
  delivery                text not null default 'pending' check (delivery in ('pending', 'building', 'ready', 'failed')),
  reminder_sent_at        timestamptz,
  report                  jsonb,
  created_at              timestamptz not null default now(),
  paid_at                 timestamptz
);
create index if not exists one_time_purchases_email_idx on app.one_time_purchases (lower(email));
create index if not exists one_time_purchases_created_idx on app.one_time_purchases (created_at desc);
alter table app.one_time_purchases enable row level security;

-- Funnel agent tracking: one-send-per-trigger markers and suppression list.
--
-- Run once in Supabase: Dashboard -> SQL Editor -> paste this file -> Run.
-- Safe to re-run. NEVER apply from an agent run: a human runs this file.
--
-- The funnel agent (server/app/funnel.js + server/inngest/functions.js) runs
-- DRY-RUN by default (FUNNEL_EMAIL_LIVE is unset): it logs every would-be
-- send and writes no markers. Only live sends write markers, and only after
-- the send succeeds, so a lead, a pending purchase, or a buyer is never
-- messaged twice. Bounces and opt-outs go in app.funnel_suppressions; every
-- funnel run skips suppressed emails.
--
-- Columns:
-- - app.scan_leads.followup_sent_at: set when the scan follow-up sends.
-- - app.one_time_purchases.upsell_sent_at: set when the post-purchase upsell
--   sends. (Abandoned-checkout reminders already use reminder_sent_at.)

alter table app.scan_leads
  add column if not exists followup_sent_at timestamptz;

alter table app.one_time_purchases
  add column if not exists upsell_sent_at timestamptz;

create table if not exists app.funnel_suppressions (
  id         bigint generated always as identity primary key,
  email      text not null check (char_length(email) <= 254),
  reason     text check (char_length(reason) <= 200),
  created_at timestamptz not null default now()
);
create unique index if not exists funnel_suppressions_email_idx
  on app.funnel_suppressions (lower(email));
alter table app.funnel_suppressions enable row level security;

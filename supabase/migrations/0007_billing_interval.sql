-- Annual plan: remember whether each subscription bills monthly or yearly.
--
-- Run once in Supabase: Dashboard -> SQL Editor -> paste this file -> Run.
-- Safe to re-run. Until it runs, checkout and webhooks keep working and the
-- dashboard treats every subscription as monthly.

alter table app.accounts
  add column if not exists billing_interval text
    check (billing_interval is null or billing_interval in ('month', 'year'));

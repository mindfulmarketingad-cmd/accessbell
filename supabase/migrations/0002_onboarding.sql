-- Product tour progress for each user.
--
-- Run once in Supabase: Dashboard -> SQL Editor -> paste this file -> Run.
-- Additive and safe on a live database: it never drops data, and running it
-- again changes nothing.
--
-- "onboarding" maps a tour name ("dashboard", "domain") to when the user
-- finished or dismissed it. People who already used the dashboard before the
-- tour existed are marked as done, so only new users see it automatically.

do $$
begin
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'app' and table_name = 'profiles' and column_name = 'onboarding'
  ) then
    alter table app.profiles add column onboarding jsonb not null default '{}'::jsonb;
    update app.profiles set onboarding = jsonb_build_object('dashboard', now(), 'domain', now());
  end if;
end $$;

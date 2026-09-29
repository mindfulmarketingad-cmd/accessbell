-- Pro now monitors up to 500 URLs per domain (was 25).
--
-- Run once in Supabase: Dashboard -> SQL Editor -> paste this file -> Run.
-- Safe to re-run. Keep the number in sync with LIMITS.monitoredPagesPerDomain
-- in server/app/config.js.

create or replace function app.enforce_monitored_page_limit() returns trigger
language plpgsql as $$
declare
  monitored_count integer;
begin
  if new.monitored and (tg_op = 'INSERT' or not old.monitored) then
    -- Lock the domain row so two concurrent requests cannot both slip past the limit.
    perform 1 from app.domains where id = new.domain_id for update;
    select count(*) into monitored_count
      from app.pages
     where domain_id = new.domain_id and monitored and id <> new.id;
    if monitored_count >= 500 then
      raise exception 'monitored_page_limit' using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;

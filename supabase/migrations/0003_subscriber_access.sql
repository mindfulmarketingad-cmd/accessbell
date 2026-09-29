-- Manual dashboard access.
--
-- Run once in Supabase: Dashboard -> SQL Editor -> paste this file -> Run.
-- Additive and safe on a live database: it never drops data, and running it
-- again changes nothing.
--
-- New users can sign up, but the dashboard stays locked until you give them
-- access: open Table Editor -> schema "app" -> table "profiles", find the
-- user by email, and set "status" to Subscriber. People on the same account
-- (invited teammates) get access through the account owner. Set it back to
-- Pending to remove access.

alter table app.profiles add column if not exists status text not null default 'Pending';

comment on column app.profiles.status is
  'Type Subscriber to unlock the dashboard for this user and their team. Pending means no access.';

-- Owners whose Stripe subscription is already live keep their access.
update app.profiles p
   set status = 'Subscriber'
  from app.account_members m
  join app.accounts a on a.id = m.account_id
 where m.user_id = p.user_id
   and m.role = 'owner'
   and a.subscription_status in ('trialing', 'active')
   and p.status = 'Pending';

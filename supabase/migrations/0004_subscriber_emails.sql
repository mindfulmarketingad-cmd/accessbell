-- Emails that always have dashboard access.
--
-- Run once in Supabase: Dashboard -> SQL Editor -> paste this file -> Run.
-- Additive and safe on a live database: it never drops data, and running it
-- again changes nothing.
--
-- Anyone whose email is listed here gets the dashboard without you setting
-- "Subscriber" on their profile. Use it for yourself and for accounts you
-- manage by hand. To add someone: insert into app.subscriber_emails (email)
-- values ('name@example.com');  To remove: delete from app.subscriber_emails
-- where email = 'name@example.com';
--
-- No password is stored or set here. Set yours in Supabase: Authentication ->
-- Users -> your user -> Send password recovery, or use "Forgot password" on
-- the sign-in page.

create table if not exists app.subscriber_emails (
  email      text primary key check (email = lower(btrim(email))),
  note       text,
  created_at timestamptz not null default now()
);
alter table app.subscriber_emails enable row level security;

insert into app.subscriber_emails (email, note)
values ('mindfulmarketingad@gmail.com', 'Site owner')
on conflict (email) do nothing;

-- Mark the owner's email as confirmed, so a confirmation email is not needed to sign in.
update auth.users
   set email_confirmed_at = coalesce(email_confirmed_at, now())
 where lower(email) = 'mindfulmarketingad@gmail.com';

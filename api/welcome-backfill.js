// POST /api/welcome-backfill { email } -> one-off: send the subscriber welcome
// email to an existing subscriber who signed up before it existed.
//
// Guarded three ways: the x-backfill-token header must match the
// WELCOME_BACKFILL_TOKEN env var (unset = endpoint disabled); the email must
// belong to the owner of an account with a trialing or active subscription
// (or a profile marked Subscriber by hand);
// and Resend's idempotency key (welcome-subscriber/<accountId>) drops a repeat
// within 24 hours. Delete WELCOME_BACKFILL_TOKEN once the backfill is done.
import crypto from 'node:crypto';
import { one } from '../server/app/db.js';
import { sendWelcomeSubscriberEmail } from '../server/app/email-sequences.js';
import { json, readJson, methodNotAllowed } from '../server/http.js';

function tokenOk(given, expected) {
  if (!given || !expected) return false;
  const a = crypto.createHash('sha256').update(String(given)).digest();
  const b = crypto.createHash('sha256').update(String(expected)).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function POST(request) {
  const expected = process.env.WELCOME_BACKFILL_TOKEN;
  if (!expected) return json(404, { error: 'Not found.' });
  if (!tokenOk(request.headers.get('x-backfill-token'), expected)) return json(403, { error: 'Forbidden.' });
  const body = await readJson(request, 2048);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email) return json(400, { error: 'email required' });
  const row = await one(
    `select a.id, a.subscription_status, p.status as profile_status
       from app.profiles p
       join app.account_members m on m.user_id = p.user_id and m.role = 'owner'
       join app.accounts a on a.id = m.account_id
      where lower(p.email) = $1
      order by (a.subscription_status in ('trialing', 'active')) desc, m.created_at asc
      limit 1`,
    [email],
  );
  if (!row) return json(404, { error: 'no account for that email' });
  const subscribed = ['trialing', 'active'].includes(row.subscription_status) || row.profile_status === 'Subscriber';
  if (!subscribed) {
    return json(409, { error: 'account is not subscribed', status: row.subscription_status });
  }
  const res = await sendWelcomeSubscriberEmail({ to: email, key: row.id });
  return json(res.ok ? 200 : 502, { ok: res.ok, id: res.id || null, reason: res.reason || null, status: row.subscription_status });
}

export function GET() {
  return methodNotAllowed('POST');
}

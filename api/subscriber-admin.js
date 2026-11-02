// POST /api/subscriber-admin { email, action } -> owner-only support tool.
//
// Disabled unless SUBSCRIBER_ADMIN_TOKEN is set; every call needs the
// matching x-admin-token header. Actions:
// - "status": does the email have a login/profile, an account, a linked
//   Stripe subscription, and dashboard access? Read-only.
// - "repair" (David only; he vouches for the address): no profile yet -> create the login with Supabase's invite (the
//   person gets a set-password email); login exists but never used -> send a
//   password-reset email only when sendReset is true. Then link a trialing or
//   active Stripe subscription found by email. Sends the welcome once linked.
// - "funnel-preview": read-only list of who each drip email would go to
//   if FUNNEL_EMAIL_LIVE were on today, plus free-scan counts. Sends nothing.
// - "unsuppress": remove one address from app.funnel_suppressions.
// - "welcome": send the subscriber welcome email (Resend dedupes per account
//   for 24h). Only to an account that has dashboard access.
// Responses never include secrets.
import crypto from 'node:crypto';
import { one } from '../server/app/db.js';
import { config } from '../server/app/config.js';
import { auth } from '../server/app/auth-client.js';
import { withAccessRule } from '../server/app/access.js';
import { isAdminUser } from '../server/app/accounts.js';
import { accountFromInvite, claimSubscriptionForUser, stripe, isAccessBellSubscription } from '../server/app/billing.js';
import { sendWelcomeSubscriberEmail } from '../server/app/email-sequences.js';
import { json, readJson, methodNotAllowed } from '../server/http.js';
import { funnelPreview, removeFunnelSuppression } from '../server/app/funnel.js';

function tokenOk(given, expected) {
  if (!given || !expected) return false;
  const a = crypto.createHash('sha256').update(String(given)).digest();
  const b = crypto.createHash('sha256').update(String(expected)).digest();
  return crypto.timingSafeEqual(a, b);
}

async function status(email) {
  const row = await one(
    `select p.user_id, p.status as profile_status, a.id as account_id, a.subscription_status,
            a.stripe_subscription_id is not null as stripe_linked, a.stripe_subscription_id, a.trial_ends_at
       from app.profiles p
       left join app.account_members m on m.user_id = p.user_id and m.role = 'owner'
       left join app.accounts a on a.id = m.account_id
      where lower(p.email) = $1
      order by m.created_at asc nulls last
      limit 1`,
    [email],
  );
  const admin = isAdminUser({ email });
  if (!row) return { profile: false, admin };
  let access = false;
  if (row.account_id) {
    const r = await withAccessRule((rule) => one(`select ${rule} as ok from app.accounts a where a.id = $1`, [row.account_id]));
    access = Boolean(r?.ok);
  }
  let accessBellProduct = null;
  if (row.stripe_subscription_id) {
    try {
      accessBellProduct = await isAccessBellSubscription(await stripe('GET', `/subscriptions/${encodeURIComponent(row.stripe_subscription_id)}`));
    } catch {
      accessBellProduct = 'unknown';
    }
  }
  return {
    profile: true,
    userId: row.user_id,
    accountId: row.account_id,
    profileStatus: row.profile_status,
    subscriptionStatus: row.subscription_status,
    stripeLinked: row.stripe_linked,
    accessBellProduct,
    admin,
    trialEndsAt: row.trial_ends_at,
    access,
  };
}

export async function POST(request) {
  const expected = process.env.SUBSCRIBER_ADMIN_TOKEN;
  if (!expected) return json(404, { error: 'Not found.' });
  if (!tokenOk(request.headers.get('x-admin-token'), expected)) return json(403, { error: 'Forbidden.' });
  const body = await readJson(request, 2048);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const action = String(body?.action || 'status');
  // Read-only: who the drip would email if it were live today. Sends nothing.
  if (action === 'funnel-preview') {
    try {
      return json(200, await funnelPreview());
    } catch (err) {
      console.error('funnel-preview failed', err?.code || err?.message);
      return json(500, { error: 'failed', code: err?.code || null });
    }
  }
  if (!email) return json(400, { error: 'email required' });

  try {
    if (action === 'unsuppress') return json(200, { removed: await removeFunnelSuppression(email) });
    if (action === 'status') return json(200, await status(email));

    if (action === 'repair') {
      const steps = [];
      let s = await status(email);
      if (!s.profile) {
        const accountId = await accountFromInvite(email);
        steps.push(accountId ? 'invited (set-password email sent by Supabase)' : 'invite not possible (login may already exist)');
        if (!accountId && body?.sendReset) {
          await auth.recover(email, `${config().appUrl}/app/auth/callback`);
          steps.push('password reset email sent');
        }
        s = await status(email);
      } else if (body?.sendReset) {
        await auth.recover(email, `${config().appUrl}/app/auth/callback`);
        steps.push('password reset email sent');
      }
      if (s.profile && s.userId) {
        steps.push(`stripe claim: ${await claimSubscriptionForUser({ id: s.userId, email })}`);
        s = await status(email);
      }
      return json(200, { steps, ...s });
    }

    if (action === 'welcome') {
      const s = await status(email);
      if (!s.access) return json(409, { error: 'no dashboard access yet', ...s });
      const res = await sendWelcomeSubscriberEmail({ to: email, key: s.accountId });
      return json(res.ok ? 200 : 502, { ok: res.ok, id: res.id || null, reason: res.reason || null });
    }

    return json(400, { error: 'unknown action' });
  } catch (err) {
    console.error('subscriber-admin failed', action, err?.code || err?.message);
    return json(500, { error: 'failed', code: err?.code || null });
  }
}

export function GET() {
  return methodNotAllowed('POST');
}

// Stripe billing through a Payment Link.
//
// Flow: a signed-in owner clicks "Start free trial" and is sent to the
// Payment Link with client_reference_id = their account id. Stripe then calls
// /api/stripe-webhook, and we link the subscription to that account. The
// number of domains the account may monitor equals the subscription quantity.
import crypto from 'node:crypto';
import { config, ACTIVE_STATUSES, ADMIN_DOMAIN_QUOTA, SUBSCRIBER_MIN_DOMAINS } from './config.js';
import { one } from './db.js';
import { AppError } from './errors.js';
import { requireRole, isAdminUser } from './accounts.js';

const UNDEFINED_COLUMN = '42703';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---------- Stripe API ----------

function formEncode(obj, prefix = '') {
  const parts = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v && typeof v === 'object') parts.push(formEncode(v, key));
    else if (v !== undefined && v !== null) parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return parts.filter(Boolean).join('&');
}

export async function stripe(method, path, body) {
  const key = config().stripeSecretKey;
  if (!key) throw new AppError(503, 'Billing is not configured yet. Please contact support.', 'billing_not_configured');
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body ? formEncode(body) : undefined,
    signal: AbortSignal.timeout(10_000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`Stripe ${method} ${path} failed: ${res.status} ${data?.error?.code || ''}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// ---------- Customer-facing links ----------

/** Payment Link URL that ties the checkout to this account. `plan` is 'monthly' or 'annual'. */
export function checkoutUrl(ctx, plan = 'monthly') {
  requireRole(ctx, 'owner');
  const url = new URL(plan === 'annual' ? config().stripePaymentLinkAnnual : config().stripePaymentLink);
  url.searchParams.set('client_reference_id', ctx.account.id);
  if (ctx.user.email) url.searchParams.set('prefilled_email', ctx.user.email);
  return url.toString();
}

/** Stripe Customer Portal session for managing card, domains (quantity) and cancellation. */
export async function portalUrl(ctx, returnUrl) {
  requireRole(ctx, 'owner');
  if (!ctx.account.stripe_customer_id) throw new AppError(400, 'There is no subscription to manage yet.', 'no_customer');
  const session = await stripe('POST', '/billing_portal/sessions', {
    customer: ctx.account.stripe_customer_id,
    return_url: returnUrl,
  });
  return session.url;
}

// ---------- Webhook ----------

/**
 * Verify the Stripe-Signature header (HMAC-SHA256 over "timestamp.body").
 * Returns true only for a valid signature within the tolerance window.
 */
export function verifyStripeSignature(rawBody, header, secret, { toleranceSec = 300, now = Date.now() } = {}) {
  if (!header || !secret) return false;
  const parts = Object.create(null);
  const v1 = [];
  for (const item of header.split(',')) {
    const [k, v] = item.split('=');
    if (k === 'v1' && v) v1.push(v);
    else if (k && v) parts[k] = v;
  }
  const t = Number(parts.t);
  if (!Number.isFinite(t) || !v1.length) return false;
  if (Math.abs(now / 1000 - t) > toleranceSec) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`, 'utf8').digest();
  return v1.some((sig) => {
    const given = Buffer.from(sig, 'hex');
    return given.length === expected.length && crypto.timingSafeEqual(given, expected);
  });
}

const toDate = (sec) => (sec ? new Date(sec * 1000).toISOString() : null);

/** Write a Stripe subscription's current state onto an account. */
export async function applySubscription(accountId, sub) {
  const items = sub.items?.data || [];
  const quantity = items.reduce((n, i) => n + (Number(i.quantity) || 0), 0) || Number(sub.quantity) || 1;
  const periodEnd = sub.current_period_end || items[0]?.current_period_end || null;
  const customer = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
  const row = await one(
    `update app.accounts
        set stripe_customer_id = $2,
            stripe_subscription_id = $3,
            subscription_status = $4,
            domain_quota = $5,
            trial_ends_at = $6,
            current_period_end = $7
      where id = $1
      returning id, subscription_status, domain_quota`,
    [accountId, customer, sub.id, sub.status, quantity, toDate(sub.trial_end), toDate(periodEnd)],
  );
  const interval = items[0]?.price?.recurring?.interval || items[0]?.plan?.interval;
  if (interval === 'month' || interval === 'year') {
    try {
      await one('update app.accounts set billing_interval = $2 where id = $1', [accountId, interval]);
    } catch (err) {
      // Migration 0007 not run yet: the subscription itself is already saved.
      if (err.code !== UNDEFINED_COLUMN) throw err;
    }
  }
  return row;
}

async function accountForCheckout(session) {
  const ref = session.client_reference_id;
  if (ref && UUID.test(ref)) {
    const row = await one('select id from app.accounts where id = $1', [ref]);
    if (row) return row.id;
  }
  // Paid through the link without signing in first: match the owner by email.
  const email = session.customer_details?.email || session.customer_email;
  if (email) {
    const row = await one(
      `select m.account_id as id
         from app.profiles p
         join app.account_members m on m.user_id = p.user_id and m.role = 'owner'
        where lower(p.email) = lower($1)
        order by m.created_at asc
        limit 1`,
      [email],
    );
    if (row) return row.id;
  }
  return null;
}

async function accountForSubscription(sub) {
  const customer = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
  const row = await one(
    'select id from app.accounts where stripe_subscription_id = $1 or stripe_customer_id = $2 limit 1',
    [sub.id, customer],
  );
  return row?.id || null;
}

/**
 * Handle one verified Stripe event. Always re-reads the subscription from
 * Stripe, so events arriving out of order cannot leave stale state behind.
 * Returns a short description for logging.
 */
export async function handleStripeEvent(event, { fetchSubscription = (id) => stripe('GET', `/subscriptions/${encodeURIComponent(id)}`) } = {}) {
  const seen = await one('select 1 from app.stripe_events where id = $1', [event.id]);
  if (seen) return 'duplicate';
  const result = await processStripeEvent(event, fetchSubscription);
  // Recorded only after success, so a failed attempt is retried by Stripe.
  // Processing is idempotent, so a rare concurrent duplicate is harmless.
  await one('insert into app.stripe_events (id, type) values ($1, $2) on conflict do nothing', [event.id, event.type]);
  return result;
}

async function processStripeEvent(event, fetchSubscription) {
  const obj = event.data?.object || {};

  if (event.type === 'checkout.session.completed') {
    if (obj.mode !== 'subscription' || !obj.subscription) return 'ignored: not a subscription checkout';
    const accountId = await accountForCheckout(obj);
    if (!accountId) return 'unmatched checkout';
    const subId = typeof obj.subscription === 'string' ? obj.subscription : obj.subscription.id;
    await applySubscription(accountId, await fetchSubscription(subId));
    return 'linked';
  }

  if (event.type.startsWith('customer.subscription.')) {
    const accountId = await accountForSubscription(obj);
    if (!accountId) return 'unmatched subscription';
    let sub = obj;
    try {
      sub = await fetchSubscription(obj.id);
    } catch (err) {
      if (err.status !== 404) throw err;
    }
    await applySubscription(accountId, sub);
    return 'updated';
  }

  return 'ignored';
}

/** Domains used vs. allowed, for the dashboard. Admins (ADMIN_EMAILS) see a
 *  quota without ever needing a real subscription. */
export async function billingSummary(ctx) {
  const row = await one('select count(*)::int as used from app.domains where account_id = $1', [ctx.account.id]);
  const admin = isAdminUser(ctx.user);
  const alreadyActive = ACTIVE_STATUSES.has(ctx.account.subscription_status);
  return {
    status: admin && !alreadyActive ? 'active' : ctx.account.subscription_status,
    domainQuota: admin ? Math.max(ctx.account.domain_quota, ADMIN_DOMAIN_QUOTA) : Math.max(ctx.account.domain_quota, ctx.subscriber ? SUBSCRIBER_MIN_DOMAINS : 0),
    domainsUsed: row.used,
    trialEndsAt: ctx.account.trial_ends_at,
    currentPeriodEnd: ctx.account.current_period_end,
    interval: ctx.account.billing_interval === 'year' ? 'year' : 'month',
    hasCustomer: Boolean(ctx.account.stripe_customer_id),
  };
}


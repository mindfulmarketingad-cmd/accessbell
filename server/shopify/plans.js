// AccessBell plans on Shopify (approved 2 Nov 2026, Option B).
// Prices and the 3-day trial are set in the Partner Dashboard (Managed
// Pricing); this file is what the app enforces for each plan.
//
// Plan names in the Partner Dashboard must be exactly "Free", "Starter" and
// "Pro" (Pro has a monthly and a yearly price): planFromSubscriptions maps
// Shopify's subscription name back to these keys.

// Shopify app handle. Must match `handle` in shopify/shopify.app.toml.
// Managed Pricing plan pages are /charges/<APP_HANDLE>/pricing_plans.
// The metafield namespace `accessbell` and the theme block `accessbell-fix`
// are not this handle.
export const APP_HANDLE = 'accessbell-co';

export const PLANS = {
  free: {
    key: 'free', name: 'Free', monthly: 0, yearly: null,
    monitoredPages: 1, // the home page only
    rescanEveryDays: 30, manualScanEveryHours: 24 * 30,
    fixes: false, toolbar: true, discovery: false,
  },
  starter: {
    key: 'starter', name: 'Starter', monthly: 12, yearly: null,
    monitoredPages: 25,
    rescanEveryDays: 7, manualScanEveryHours: 24,
    fixes: true, toolbar: true, discovery: true,
  },
  pro: {
    key: 'pro', name: 'Pro', monthly: 29, yearly: 290,
    monitoredPages: 500, // same as web Pro (LIMITS.monitoredPagesPerDomain)
    rescanEveryDays: 1, manualScanEveryHours: 0, // fair use only, like web Pro
    fixes: true, toolbar: true, discovery: true,
  },
};

export const TRIAL_DAYS = 3;
export const PAID_STATUSES = new Set(['active', 'trialing']);

/** The plan key from a Shopify subscription name ("Pro", "AccessBell Pro (yearly)"...). */
export function tierFromName(name) {
  const n = String(name || '').toLowerCase();
  if (/\bpro\b/.test(n)) return 'pro';
  if (/\bstarter\b/.test(n)) return 'starter';
  return null;
}

/**
 * The store's plan from currentAppInstallation.activeSubscriptions.
 * No active paid subscription means Free (Managed Pricing creates no
 * subscription for a free plan).
 */
export function planFromSubscriptions(subs, now = Date.now()) {
  const list = (Array.isArray(subs) ? subs : []).filter((s) => ['ACTIVE', 'ACCEPTED', 'FROZEN', 'PENDING'].includes(String(s?.status).toUpperCase()));
  const ranked = list.map((s) => ({ s, tier: tierFromName(s.name) })).filter((x) => x.tier);
  const top = ranked.find((x) => x.tier === 'pro') || ranked[0];
  if (!top) return { tier: 'free', status: 'free', interval: null, trialEndsAt: null, currentPeriodEnd: null, subscriptionId: null };
  const { s, tier } = top;
  const trialEndsAt = s.trialDays && s.createdAt ? new Date(new Date(s.createdAt).getTime() + s.trialDays * 86_400_000) : null;
  const raw = String(s.status).toUpperCase();
  let status;
  if (raw === 'FROZEN') status = 'paused';
  else if (raw === 'PENDING') status = 'incomplete';
  else status = trialEndsAt && trialEndsAt.getTime() > now ? 'trialing' : 'active';
  const interval = s.lineItems?.map((li) => li?.plan?.pricingDetails?.interval).find(Boolean) || null;
  return {
    tier: PAID_STATUSES.has(status) ? tier : 'free',
    paidTier: tier,
    status,
    interval: interval === 'ANNUAL' ? 'yearly' : interval === 'EVERY_30_DAYS' ? 'monthly' : null,
    trialEndsAt,
    currentPeriodEnd: s.currentPeriodEnd ? new Date(s.currentPeriodEnd) : null,
    subscriptionId: s.id || null,
  };
}

/** From an app_subscriptions/update webhook payload when the API can't be reached. */
export function planFromWebhook(payload) {
  const sub = payload?.app_subscription || {};
  return planFromSubscriptions([{ id: sub.admin_graphql_api_id, name: sub.name, status: sub.status, createdAt: sub.created_at }]);
}

/** app.accounts.subscription_status for a plan (drives the existing access rule). */
export const accountStatusFor = (plan) => (plan.status === 'free' ? 'none' : plan.status);

/**
 * SQL for the daily scheduler (server/app/monitoring.js). Accounts with no
 * Shopify plan (every web account) are unaffected. Starter pages are due once
 * a week and only the first 25 monitored pages count. Read through to_jsonb
 * so the query works before migration 0016 adds accounts.plan_tier.
 */
export function scheduleFilterSql(a = 'a', p = 'p') {
  const s = PLANS.starter;
  return `(coalesce(to_jsonb(${a})->>'plan_tier', '') <> 'starter' or (
     (${p}.last_scanned_at is null or ${p}.last_scanned_at < now() - interval '${s.rescanEveryDays * 24 - 12} hours')
     and ${p}.id in (select p2.id from app.pages p2 join app.domains d2 on d2.id = p2.domain_id
                      where p2.domain_id = ${p}.domain_id and p2.monitored
                      order by (p2.url = d2.base_url || '/') desc, p2.created_at, p2.id limit ${s.monitoredPages})))`;
}

/** Free-plan home pages due for their monthly score (scanned outside the paid scheduler). */
export const FREE_DUE_SQL = `
  select p.id from app.pages p
    join app.domains d on d.id = p.domain_id
    join app.accounts a on a.id = d.account_id
   where coalesce(to_jsonb(a)->>'plan_tier', '') = 'free'
     and p.monitored and p.url = d.base_url || '/'
     and (p.last_scanned_at is null or p.last_scanned_at < now() - interval '${PLANS.free.rescanEveryDays * 24 - 12} hours')
   order by p.last_scanned_at asc nulls first
   limit 5000`;

/** When the next manual "Scan now" is allowed, or null if now. */
export function nextManualScan(tier, lastScannedAt, now = Date.now()) {
  // At least 10 minutes between manual scans on every plan, so a busy button can't queue repeats.
  const hours = Math.max(PLANS[tier]?.manualScanEveryHours ?? PLANS.free.manualScanEveryHours, 1 / 6);
  if (!lastScannedAt) return null;
  const next = new Date(lastScannedAt).getTime() + hours * 3_600_000;
  return next > now ? new Date(next) : null;
}

/** Managed Pricing: Shopify's hosted plan page for this store. */
export function pricingPageUrl(shop, appHandle = APP_HANDLE) {
  const store = String(shop).replace(/\.myshopify\.com$/, '');
  return `https://admin.shopify.com/store/${encodeURIComponent(store)}/charges/${encodeURIComponent(appHandle)}/pricing_plans`;
}

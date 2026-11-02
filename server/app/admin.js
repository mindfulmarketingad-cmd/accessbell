// Site admin analytics (ADMIN_EMAILS only): every account's usage plus
// business totals. Read-only. Non-admins get 403 before any query runs.
import { query } from './db.js';
import { isAdminUser } from './accounts.js';
import { forbidden } from './errors.js';
import { stripe, accessBellProductIds, subscriptionMatchesProducts } from './billing.js';
import { config } from './config.js';

const MISSING = new Set(['42P01', '42703']);

/** Run a query, returning [] when an optional table is not migrated yet. */
async function safe(sql, params) {
  try {
    return await query(sql, params);
  } catch (err) {
    if (MISSING.has(err?.code)) return [];
    throw err;
  }
}

/** Monthly value in cents of one Stripe subscription (annual prices / 12). */
export function monthlyCents(sub) {
  let total = 0;
  for (const item of sub?.items?.data || []) {
    const price = item.price || item.plan || {};
    const amount = Number(price.unit_amount ?? price.amount ?? 0) * Number(item.quantity || 1);
    const rec = price.recurring || { interval: price.interval, interval_count: price.interval_count };
    const count = Number(rec.interval_count || 1);
    const perMonth = { month: 1, year: 1 / 12, week: 52 / 12, day: 365 / 12 }[rec.interval] ?? 0;
    total += (amount * perMonth) / count;
  }
  return Math.round(total);
}

let mrrCache = null;

/** MRR from active (paid, not trialing) AccessBell subscriptions linked to accounts. */
export async function computeMrr(subscriptionIds, { stripeApi = stripe, now = Date.now() } = {}) {
  const key = subscriptionIds.slice().sort().join(',');
  if (mrrCache && mrrCache.key === key && now - mrrCache.at < 5 * 60 * 1000) return mrrCache.value;
  if (!subscriptionIds.length) return { cents: 0, subscriptions: 0, error: null };
  if (!config().stripeSecretKey && stripeApi === stripe) return { cents: null, subscriptions: 0, error: 'Stripe not configured' };
  try {
    const products = await accessBellProductIds({ stripeApi });
    let cents = 0;
    let n = 0;
    for (const id of subscriptionIds.slice(0, 200)) {
      const sub = await stripeApi('GET', `/subscriptions/${encodeURIComponent(id)}`);
      if (sub?.status !== 'active' || !subscriptionMatchesProducts(sub, products)) continue;
      const discount = sub.discount?.coupon?.percent_off ? 1 - sub.discount.coupon.percent_off / 100 : 1;
      cents += Math.round(monthlyCents(sub) * discount);
      n++;
    }
    const value = { cents, subscriptions: n, error: null };
    mrrCache = { key, at: now, value };
    return value;
  } catch (err) {
    console.error('admin mrr failed', err?.message);
    return { cents: null, subscriptions: 0, error: 'Could not read Stripe' };
  }
}

const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : null);

/** Admins only: per-account usage and summary metrics. */
export async function adminOverview(ctx, { stripeApi } = {}) {
  if (!isAdminUser(ctx?.user)) throw forbidden();

  const accounts = await query(
    `select a.id, a.name, a.subscription_status as status, a.billing_interval as interval,
            a.trial_ends_at, a.current_period_end, a.domain_quota, a.created_at,
            a.stripe_subscription_id is not null as stripe_linked, a.stripe_subscription_id,
            o.email, o.signed_up_at,
            (select count(*)::int from app.account_members m where m.account_id = a.id) as members,
            (select count(*)::int from app.domains d where d.account_id = a.id) as domains,
            (select count(*)::int from app.pages p join app.domains d on d.id = p.domain_id
              where d.account_id = a.id and p.monitored) as monitored_pages,
            s.scans, s.scans_30d, s.rescans, s.last_scan_at
       from app.accounts a
       left join lateral (
         select p.email, p.created_at as signed_up_at
           from app.account_members m join app.profiles p on p.user_id = m.user_id
          where m.account_id = a.id and m.role = 'owner'
          order by m.created_at asc limit 1
       ) o on true
       left join lateral (
         select count(*)::int as scans,
                count(*) filter (where sc.created_at > now() - interval '30 days')::int as scans_30d,
                count(*) filter (where sc.trigger = 'manual')::int as rescans,
                max(sc.created_at) as last_scan_at
           from app.scans sc where sc.account_id = a.id
       ) s on true
      order by a.created_at desc
      limit 1000`,
  );

  const byId = (rows, k = 'account_id') => Object.fromEntries(rows.map((r) => [r[k], r]));
  const vault = byId(await safe('select account_id, count(*)::int as n from app.compliance_records group by account_id'));
  const fixes = byId(await safe('select d.account_id, count(*)::int as n from app.fixes f join app.domains d on d.id = f.domain_id group by d.account_id'));
  const activity = byId(await safe('select account_id, max(created_at) as last_at from app.activity_log group by account_id'));

  const rows = accounts.map((a) => {
    const lastActivity = activity[a.id]?.last_at || null;
    const times = [a.last_scan_at, lastActivity].filter(Boolean).map((t) => new Date(t).getTime());
    return {
      id: a.id,
      name: a.name,
      email: a.email || null,
      signedUpAt: a.signed_up_at || a.created_at,
      status: a.status,
      interval: a.interval,
      stripeLinked: a.stripe_linked,
      trialEndsAt: a.trial_ends_at,
      currentPeriodEnd: a.current_period_end,
      domainQuota: a.domain_quota,
      members: a.members,
      domains: a.domains,
      monitoredPages: a.monitored_pages,
      scans: a.scans || 0,
      scans30d: a.scans_30d || 0,
      rescans: a.rescans || 0,
      lastScanAt: a.last_scan_at,
      lastActiveAt: times.length ? new Date(Math.max(...times)).toISOString() : null,
      vaultRecords: vault[a.id]?.n || 0,
      fixes: fixes[a.id]?.n || 0,
    };
  });

  const count = (s) => accounts.filter((a) => a.status === s).length;
  const linkedActive = accounts.filter((a) => a.status === 'active' && a.stripe_subscription_id).map((a) => a.stripe_subscription_id);
  const mrr = await computeMrr(linkedActive, stripeApi ? { stripeApi } : undefined);

  const freePerDay = await safe(
    `select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day, count(*)::int as scans,
            count(distinct hostname)::int as domains
       from app.free_scans where created_at > now() - interval '30 days'
      group by 1 order by 1 desc`,
  );
  const [leads] = await safe(
    `select count(*)::int as total,
            count(*) filter (where created_at > now() - interval '30 days')::int as last_30d,
            count(distinct lower(email)) filter (where created_at > now() - interval '30 days')::int as people_30d
       from app.scan_leads`,
  );
  const [funnel] = await safe(
    `select (select count(*)::int from app.free_scans where created_at > now() - interval '30 days') as free_scans,
            (select count(distinct hostname)::int from app.free_scans where created_at > now() - interval '30 days') as free_domains,
            (select count(*)::int from app.profiles where created_at > now() - interval '30 days') as signups,
            (select count(*)::int from app.accounts where created_at > now() - interval '30 days'
                and stripe_subscription_id is not null) as paid_or_trial,
            (select count(*)::int from app.accounts where created_at > now() - interval '30 days'
                and subscription_status = 'active') as paid`,
  );
  const [oneTime] = await safe(
    `select count(*)::int as paid, coalesce(sum(amount_cents), 0)::int as cents
       from app.one_time_purchases where status = 'paid' and created_at > now() - interval '30 days'`,
  );
  const f = funnel || { free_scans: 0, free_domains: 0, signups: 0, paid_or_trial: 0, paid: 0 };
  const leads30 = leads?.last_30d || 0;

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalAccounts: accounts.length,
      trialing: count('trialing'),
      activePaid: count('active'),
      pastDue: count('past_due'),
      canceled: count('canceled'),
      noSubscription: count('none'),
      mrrCents: mrr.cents,
      mrrSubscriptions: mrr.subscriptions,
      mrrError: mrr.error,
      oneTime30d: { purchases: oneTime?.paid || 0, cents: oneTime?.cents || 0 },
    },
    freeScansPerDay: freePerDay,
    scanLeads: { total: leads?.total || 0, last30d: leads30, people30d: leads?.people_30d || 0 },
    funnel30d: {
      freeScans: f.free_scans,
      freeDomains: f.free_domains,
      leads: leads30,
      signups: f.signups,
      trialsOrPaid: f.paid_or_trial,
      paid: f.paid,
      scanToSignupPct: pct(f.signups, f.free_domains),
      signupToTrialPct: pct(f.paid_or_trial, f.signups),
      trialToPaidPct: pct(f.paid, f.paid_or_trial),
    },
    accounts: rows,
  };
}

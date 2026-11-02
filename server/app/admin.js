// Site admin analytics (ADMIN_EMAILS only): every account's usage plus
// business totals. Read-only. Non-admins get 403 before any query runs.
import { query } from './db.js';
import { isAdminUser } from './accounts.js';
import { forbidden, badRequest, notFound } from './errors.js';
import { publicSettings } from './domains.js';
import { stripe, accessBellProductIds, subscriptionMatchesProducts } from './billing.js';
import { config } from './config.js';
import { ensureTrackingSchema, HUNG_AFTER_MS } from './tracking.js';

// Missing table/column, or no permission (e.g. the auth schema): treat as not tracked.
const MISSING = new Set(['42P01', '42703', '42501', '3F000']);

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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DAY = 24 * 60 * 60 * 1000;
const NOT_TRACKED = 'not tracked';
/** Tracking (scan runs, alert/welcome emails, snippet errors) started with this release. */
export const TRACKING_SINCE = '2026-11-02T03:00:00Z';
const within = (t, ms, now) => t && now - new Date(t).getTime() < ms;
const utc = (t) => `${new Date(t).toISOString().slice(0, 16).replace('T', ' ')} UTC`;

/** Flag likely problems for one account from its recorded data. Pure, for tests. */
export function accountFlags(d, now = Date.now()) {
  const flags = [];
  const add = (level, text) => flags.push({ level, text });
  const a = d.profile;
  const paying = ['trialing', 'active'].includes(a.status);
  const failed7 = d.scans.filter((x) => x.status === 'failed' && now - new Date(x.createdAt).getTime() < 7 * DAY);
  if (failed7.length) add('error', `${failed7.length} failed scan${failed7.length === 1 ? '' : 's'} in the last 7 days (latest: ${failed7[0].error || 'no message'})`);
  for (const dm of d.domains) {
    if (!dm.lastScanAt) add('warn', `${dm.hostname}: never scanned`);
    if (paying && dm.overduePages) add('warn', `${dm.hostname}: ${dm.overduePages} monitored page${dm.overduePages === 1 ? '' : 's'} not scanned in 36+ hours (daily rescan may not be completing)`);
    if (dm.fixes && !dm.snippetSeenAt) add('warn', `${dm.hostname}: has fixes but the AccessBellFix snippet has never called in`);
    else if (dm.fixes && now - new Date(dm.snippetSeenAt).getTime() > 3 * DAY) add('warn', `${dm.hostname}: AccessBellFix snippet has not called in for 3+ days`);
  }
  if (a.status !== 'none' && !a.stripeLinked) add('error', 'Subscription status set but no Stripe subscription linked');
  if (['past_due', 'unpaid', 'incomplete'].includes(a.status)) add('error', `Payment problem: subscription is ${a.status}`);
  if (a.lastSignInAt === null && a.signedUpAt) add('warn', 'No sign-in recorded since sign-up');
  if (a.status === 'trialing' && a.trialEndsAt) {
    const left = new Date(a.trialEndsAt).getTime() - now;
    const scans7 = d.scans.filter((x) => now - new Date(x.createdAt).getTime() < 7 * DAY).length;
    if (left > 0 && left < 2 * DAY && (d.domains.length === 0 || scans7 < 3)) add('warn', `Trial ends within 48 hours with low usage (${d.domains.length} domains, ${scans7} scans in 7 days)`);
  }
  if (paying && !d.domains.length) add('warn', 'Has access but no domains added');

  const runs = d.scanRuns || [];
  const hung = runs.filter((r) => r.hung && within(r.startedAt, 7 * DAY, now));
  if (hung.length) add('error', `${hung.length} scan${hung.length === 1 ? '' : 's'} started but never finished in the last 7 days (latest started ${utc(hung[0].startedAt)}${hung[0].url ? `, ${hung[0].url}` : ''})`);
  const stalled = runs.filter((r) => r.kind === 'domain' && r.pagesScanned < r.pages && within(r.startedAt, 7 * DAY, now) && now - new Date(r.startedAt).getTime() > 2 * 60 * 60 * 1000);
  if (stalled.length) add('warn', `${stalled.length} domain scan${stalled.length === 1 ? '' : 's'} did not finish every page (latest: ${stalled[0].hostname || 'domain'}, ${stalled[0].pagesScanned} of ${stalled[0].pages} pages)`);

  const alerts = (d.alertEmails || []).filter((e) => within(e.createdAt, 30 * DAY, now));
  const failedAlerts = alerts.filter((e) => e.status === 'failed');
  if (failedAlerts.length) add('error', `${failedAlerts.length} regression alert email${failedAlerts.length === 1 ? '' : 's'} failed to send in the last 30 days (latest: ${failedAlerts[0].error || 'unknown error'})`);
  const skipped = alerts.filter((e) => e.status === 'skipped');
  if (skipped.length) add('warn', `${skipped.length} regression alert${skipped.length === 1 ? '' : 's'} not sent in the last 30 days (${skipped[0].error || 'skipped'})`);

  const w = d.welcomeEmail;
  if (w && w.status === 'failed') add('error', `Welcome email failed to send (${w.error || 'unknown error'})`);
  else if (!w && paying && a.stripeLinked && a.accountCreatedAt && new Date(a.accountCreatedAt).getTime() >= new Date(TRACKING_SINCE).getTime()) {
    add('warn', 'No welcome email recorded for this subscriber');
  }

  const snip = (d.snippetErrors || []).filter((e) => within(e.lastAt, 7 * DAY, now));
  if (snip.length) {
    const total = snip.reduce((n, e) => n + e.count, 0);
    const kinds = [...new Set(snip.map((e) => `${e.hostname}: ${e.code}`))].slice(0, 4).join(', ');
    add('warn', `AccessBellFix reported ${total} error${total === 1 ? '' : 's'} in the last 7 days (${kinds})`);
  }
  return flags;
}

/** Admins only: one account's analytics, for spotting problems. Read-only. */
export async function adminAccountDetail(ctx, id) {
  if (!isAdminUser(ctx?.user)) throw forbidden();
  if (!UUID.test(String(id || ''))) throw badRequest('Invalid account id.');
  const [acct] = await query(
    `select a.*, o.user_id as owner_id, o.email, o.signed_up_at
       from app.accounts a
       left join lateral (
         select p.user_id, p.email, p.created_at as signed_up_at
           from app.account_members m join app.profiles p on p.user_id = m.user_id
          where m.account_id = a.id and m.role = 'owner' order by m.created_at asc limit 1
       ) o on true
      where a.id = $1`,
    [id],
  );
  if (!acct) throw notFound('Account not found.');

  const [signIn] = acct.owner_id ? await safe('select last_sign_in_at from auth.users where id = $1', [acct.owner_id]) : [];
  const [lastActivity] = await safe('select max(created_at) as at from app.activity_log where account_id = $1', [id]);

  const members = await query(
    `select p.email, m.role, m.created_at from app.account_members m join app.profiles p on p.user_id = m.user_id
      where m.account_id = $1 order by m.created_at`,
    [id],
  );
  const domainRows = await query(
    `select d.id, d.hostname, d.base_url, d.settings, d.created_at, d.site_key is not null as has_site_key, d.fix_seen_at,
            (select count(*)::int from app.pages p where p.domain_id = d.id) as pages,
            (select count(*)::int from app.pages p where p.domain_id = d.id and p.monitored) as monitored_pages,
            (select count(*)::int from app.pages p where p.domain_id = d.id and p.monitored
               and (p.last_scanned_at is null or p.last_scanned_at < now() - interval '36 hours')) as overdue_pages,
            (select max(created_at) from app.scans s where s.domain_id = d.id) as last_scan_at,
            (select status from app.scans s where s.domain_id = d.id order by created_at desc limit 1) as last_scan_status
       from app.domains d where d.account_id = $1 order by d.created_at`,
    [id],
  );
  const fixRows = await safe(
    `select d.hostname, f.domain_id, f.kind, f.enabled, f.created_at from app.fixes f join app.domains d on d.id = f.domain_id
      where d.account_id = $1 order by f.created_at desc limit 200`,
    [id],
  );
  const scans = await query(
    `select s.id, s.created_at, s.status, s.device, s.trigger, s.score, s.issues_count, s.error, s.engine,
            p.url, d.hostname
       from app.scans s join app.pages p on p.id = s.page_id join app.domains d on d.id = s.domain_id
      where s.account_id = $1 order by s.created_at desc limit 100`,
    [id],
  );
  const daily = await query(
    `select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day,
            count(distinct page_id)::int as pages, count(*)::int as scans,
            count(*) filter (where status = 'done')::int as done,
            count(*) filter (where status = 'failed')::int as failed,
            coalesce(sum(issues_count) filter (where status = 'done'), 0)::int as issues
       from app.scans where account_id = $1 and trigger = 'scheduled' and created_at > now() - interval '30 days'
      group by 1 order by 1 desc`,
    [id],
  );
  // Tracking tables (0015). Applied automatically if missing; empty until data arrives.
  await ensureTrackingSchema();
  const durations = await safe(
    `select id, duration_ms from app.scans where account_id = $1 and duration_ms is not null order by created_at desc limit 100`,
    [id],
  );
  const runRows = await safe(
    `select r.id, r.kind, r.trigger, r.pages, r.status, r.started_at, r.finished_at, r.duration_ms,
            p.url, d.hostname,
            r.status = 'running' and r.kind = 'page' and r.started_at < now() - make_interval(secs => $2) as hung,
            case when r.kind = 'domain' then (
              select count(distinct s.page_id)::int from app.scans s
               where s.domain_id = r.domain_id and s.created_at >= r.started_at and s.created_at < r.started_at + interval '6 hours'
            ) end as pages_scanned
       from app.scan_runs r left join app.pages p on p.id = r.page_id left join app.domains d on d.id = r.domain_id
      where r.account_id = $1 order by r.started_at desc limit 100`,
    [id, HUNG_AFTER_MS / 1000],
  );
  const alertRows = await safe(
    `select page_url, recipients, status, resend_id, error, created_at from app.alert_emails
      where account_id = $1 order by created_at desc limit 50`,
    [id],
  );
  const [welcome] = await safe('select status, resend_id, error, sent_at, updated_at from app.welcome_emails where account_id = $1', [id]);
  const snippetRows = await safe(
    `select d.hostname, e.code, sum(e.count)::int as count, max(e.last_at) as last_at
       from app.snippet_errors e join app.domains d on d.id = e.domain_id
      where d.account_id = $1 and e.day > current_date - 30
      group by d.hostname, e.code order by max(e.last_at) desc limit 50`,
    [id],
  );

  const vault = await safe(
    `select hostname, period_from, period_to, user_email, created_at from app.compliance_records
      where account_id = $1 order by created_at desc limit 50`,
    [id],
  );
  const activity = await safe(
    `select l.action, l.user_email, l.created_at, d.hostname from app.activity_log l left join app.domains d on d.id = l.domain_id
      where l.account_id = $1 order by l.created_at desc limit 50`,
    [id],
  );

  const durationById = Object.fromEntries(durations.map((r) => [r.id, r.duration_ms]));
  const fixesByDomain = {};
  for (const f of fixRows) fixesByDomain[f.domain_id] = (fixesByDomain[f.domain_id] || 0) + 1;
  const domains = domainRows.map((d) => {
    const s = publicSettings(d.settings || {});
    return {
      id: d.id,
      hostname: d.hostname,
      baseUrl: d.base_url,
      addedAt: d.created_at,
      settings: { wcagVersion: s.wcagVersion, wcagLevel: s.wcagLevel, devices: s.devices, includeSubdomains: s.includeSubdomains, customHeaders: (s.headers || []).length },
      pages: d.pages,
      monitoredPages: d.monitored_pages,
      overduePages: d.overdue_pages,
      lastScanAt: d.last_scan_at,
      lastScanStatus: d.last_scan_status,
      fixes: fixesByDomain[d.id] || 0,
      snippetSeenAt: d.fix_seen_at,
    };
  });

  const out = {
    profile: {
      accountId: acct.id,
      name: acct.name,
      email: acct.email || null,
      signedUpAt: acct.signed_up_at || acct.created_at,
      lastSignInAt: signIn ? signIn.last_sign_in_at || null : NOT_TRACKED,
      lastActivityAt: lastActivity?.at || null,
      status: acct.subscription_status,
      interval: acct.billing_interval || null,
      stripeLinked: Boolean(acct.stripe_subscription_id),
      trialEndsAt: acct.trial_ends_at,
      currentPeriodEnd: acct.current_period_end,
      domainQuota: acct.domain_quota,
      accountCreatedAt: acct.created_at,
    },
    welcomeEmail: welcome
      ? { status: welcome.status, resendId: welcome.resend_id, error: welcome.error, sentAt: welcome.sent_at, updatedAt: welcome.updated_at }
      : null,
    members: members.map((m) => ({ email: m.email, role: m.role, addedAt: m.created_at })),
    domains,
    scans: scans.map((x) => ({
      id: x.id, createdAt: x.created_at, status: x.status, device: x.device, trigger: x.trigger, score: x.score,
      issues: x.issues_count, error: x.error, engine: x.engine, url: x.url, hostname: x.hostname, durationMs: durationById[x.id] ?? null,
    })),
    dailyRescans: daily,
    scanRuns: runRows.map((r) => ({
      kind: r.kind, trigger: r.trigger, pages: r.pages, status: r.hung ? 'hung' : r.status, hung: Boolean(r.hung),
      startedAt: r.started_at, finishedAt: r.finished_at, durationMs: r.duration_ms, url: r.url || null, hostname: r.hostname || null,
      pagesScanned: r.pages_scanned ?? null,
    })),
    alertEmails: alertRows.map((e) => ({ pageUrl: e.page_url, recipients: e.recipients, status: e.status, resendId: e.resend_id, error: e.error, createdAt: e.created_at })),
    snippetErrors: snippetRows.map((e) => ({ hostname: e.hostname, code: e.code, count: e.count, lastAt: e.last_at })),
    vault: vault.map((v) => ({ hostname: v.hostname, from: v.period_from, to: v.period_to, by: v.user_email, createdAt: v.created_at })),
    fixes: fixRows.map((f) => ({ hostname: f.hostname, kind: f.kind, enabled: f.enabled, createdAt: f.created_at })),
    activity: activity.map((a) => ({ action: a.action, by: a.user_email, hostname: a.hostname, at: a.created_at })),
  };
  // A sign-in time we could not read is unknown, not "never".
  out.flags = accountFlags({ ...out, profile: { ...out.profile, lastSignInAt: out.profile.lastSignInAt === NOT_TRACKED ? undefined : out.profile.lastSignInAt } });
  return out;
}

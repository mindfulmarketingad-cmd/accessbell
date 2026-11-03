// Funnel agent: scheduled follow-up, recovery and upsell sequences for the
// one-time funnel (free scan -> Page Report -> Domain Audit -> Pro).
//
// DRY-RUN FIRST, ALWAYS BY DEFAULT. Nothing in this module sends a real
// email unless FUNNEL_EMAIL_LIVE=1 is set in the environment. In dry-run
// mode every would-be send is recorded in the run log (to, template,
// trigger row id) and no sent-marker is written, so a dry-run can never
// consume a lead's one-time follow-up, a purchase's one reminder, or a
// buyer's one upsell. David reviews the dry-run log and approves the
// templates before anything goes live.
//
// Gating rules (checked on every run, live or dry-run):
// - Never email a row with no email address.
// - Never email David's own properties (ramenearyou.com) or his employer's
//   store (shopsigvaris.com), whatever the trigger row says.
// - A suppressed email (bounce / opt-out, recorded in
//   app.funnel_suppressions, including one-click unsubscribes via
//   /api/unsubscribe) is skipped on every later run.
// - Live sends also need FUNNEL_MAILING_ADDRESS and an unsubscribe signing
//   key (see unsubscribe.js); without them FUNNEL_EMAIL_LIVE=1 stays dry-run.
// - One send per trigger, tracked in the database: scan_leads.followup_sent_at,
//   one_time_purchases.reminder_sent_at (existing), one_time_purchases.upsell_sent_at.
//   Markers are written only after a live send succeeds.
//
// The senders live in email-sequences.js and are never changed here. The
// Page Report -> Domain Audit upsell template (pageReportUpsellEmail) is NEW
// in this change and needs David's approval before live sends, like every
// other template in the funnel.
import { query } from './db.js';
import { funnelSendBlockers } from './unsubscribe.js';
import { OUTREACH_ALREADY_SENT } from './outreach-sent.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Hostnames that must never receive funnel email, whatever the trigger. */
export const FUNNEL_EXCLUDED_HOSTNAMES = ['ramenearyou.com', 'shopsigvaris.com', 'foxwoodengraving.com', 'jonathangross.law'];

/**
 * Free-scan follow-up sequence (day 0 is the requested results email sent by
 * /api/scan-lead): day 1 "your top critical issue and how to fix it", then
 * day 3 "still failing?" with a fresh re-check. Only leads from the last
 * SCAN_LEAD_MAX_AGE_DAYS are ever emailed, so going live never mails old leads.
 */
export const SCAN_FOLLOWUP_MIN_AGE_HOURS = 20;
export const SCAN_LEAD_MAX_AGE_DAYS = 7;
/** Day-3 rescan email: sent once, on the daily run that falls 47-71h after the day-1 email. */
export const SCAN_RESCAN_AFTER_HOURS = 47;
export const SCAN_RESCAN_BEFORE_HOURS = 71;
/** Per-run cap: each lead gets its own step, so the backlog drains over a few runs. */
export const SCAN_SEQUENCE_BATCH = 25;

/** Days after payment before a Page Report buyer gets the Domain Audit upsell. */
export const PAGE_REPORT_UPSELL_DELAY_DAYS = 3;
/** Days after payment before a Domain Audit buyer gets the Pro upsell. */
export const DOMAIN_AUDIT_UPSELL_DELAY_DAYS = 7;
/** Hours a checkout must sit pending before the one reminder goes out. */
export const ABANDONED_MIN_AGE_HOURS = 24;

/** Live sending is opt-in: FUNNEL_EMAIL_LIVE=1. Anything else is dry-run. */
export function funnelLive(env = process.env) {
  return env.FUNNEL_EMAIL_LIVE === '1';
}

/**
 * Live only when requested AND ready: a CAN-SPAM mailing address
 * (FUNNEL_MAILING_ADDRESS) and an unsubscribe signing key must be configured.
 * Requested-but-not-ready logs an error and runs as dry-run.
 */
export function funnelLiveStatus(env = process.env) {
  const requested = funnelLive(env);
  const blockers = funnelSendBlockers(env);
  if (requested && blockers.length) {
    console.error('[funnel] FUNNEL_EMAIL_LIVE=1 but not ready, staying dry-run:', blockers.join('; '));
  }
  return { requested, live: requested && blockers.length === 0, blockers };
}

export function normalizeHostname(hostname) {
  return String(hostname || '')
    .trim()
    .toLowerCase()
    .replace(/^www\./, '');
}

export function isExcludedHostname(hostname) {
  return FUNNEL_EXCLUDED_HOSTNAMES.includes(normalizeHostname(hostname));
}

/** A lead is excluded when its scanned site OR its email domain is on the exclusion list. */
export function isExcludedLead(lead) {
  const emailDomain = String(lead?.email || '').split('@')[1] || '';
  return isExcludedHostname(lead?.hostname) || isExcludedHostname(emailDomain);
}

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const hasEmail = (email) => normalizeEmail(email).length > 0;

// ---------------------------------------------------------------------------
// Pure selectors (no I/O; these are what the tests pin down)
// ---------------------------------------------------------------------------

/**
 * Scan-lead follow-up candidates (day 1): emailed leads with no follow-up
 * sent yet, no paid purchase or AccessBell account under the same email, a
 * site that is not already a customer's domain, and no suppression. When a
 * lead carries created_at it must be 20h to 7 days old.
 */
export function scanFollowupCandidates({ leads, paidEmails, suppressedEmails, customerEmails = [], customerHostnames = [], now = new Date() }) {
  const keep = leadFilter({ paidEmails, suppressedEmails, customerEmails, customerHostnames });
  const hour = 60 * 60 * 1000;
  return leads.filter((lead) => {
    if (lead.followup_sent_at) return false;
    if (lead.created_at) {
      const age = now - new Date(lead.created_at);
      if (age < SCAN_FOLLOWUP_MIN_AGE_HOURS * hour || age > SCAN_LEAD_MAX_AGE_DAYS * 24 * hour) return false;
    }
    return keep(lead);
  });
}

/**
 * Day-3 "still failing?" candidates: the day-1 email went out 47-71 hours ago
 * (exactly one daily run lands in that window), and every day-1 exclusion
 * still holds, so anyone who subscribed, bought or unsubscribed since is skipped.
 */
export function scanRescanCandidates({ leads, paidEmails, suppressedEmails, customerEmails = [], customerHostnames = [], now = new Date() }) {
  const keep = leadFilter({ paidEmails, suppressedEmails, customerEmails, customerHostnames });
  const hour = 60 * 60 * 1000;
  return leads.filter((lead) => {
    if (!lead.followup_sent_at) return false;
    const age = now - new Date(lead.followup_sent_at);
    if (age < SCAN_RESCAN_AFTER_HOURS * hour || age >= SCAN_RESCAN_BEFORE_HOURS * hour) return false;
    return keep(lead);
  });
}

function leadFilter({ paidEmails, suppressedEmails, customerEmails, customerHostnames }) {
  const paid = new Set((paidEmails || []).map(normalizeEmail));
  const suppressed = new Set((suppressedEmails || []).map(normalizeEmail));
  const customers = new Set((customerEmails || []).map(normalizeEmail));
  const customerSites = new Set((customerHostnames || []).map(normalizeHostname));
  return (lead) => {
    if (!hasEmail(lead.email)) return false;
    if (isExcludedLead(lead)) return false;
    const email = normalizeEmail(lead.email);
    if (paid.has(email) || suppressed.has(email) || customers.has(email)) return false;
    if (lead.hostname && customerSites.has(normalizeHostname(lead.hostname))) return false;
    return true;
  };
}

/** Abandoned-checkout predicate: pending, never reminded, older than 24h. */
export function isAbandonedCheckout(row, now = new Date()) {
  if (row.status !== 'pending') return false;
  if (row.reminder_sent_at) return false;
  if (!row.created_at) return false;
  const ageMs = now - new Date(row.created_at);
  return ageMs >= ABANDONED_MIN_AGE_HOURS * 60 * 60 * 1000;
}

/**
 * Post-purchase upsell candidates: paid purchases with no upsell sent yet
 * whose payment is older than the per-product delay. Page Report buyers get
 * the Domain Audit upsell; Domain Audit buyers get the Pro upsell.
 */
export function upsellCandidates({ purchases, suppressedEmails = [], now = new Date() }) {
  const suppressed = new Set((suppressedEmails || []).map(normalizeEmail));
  return purchases
    .filter((row) => {
      if (row.status !== 'paid') return false;
      if (suppressed.has(normalizeEmail(row.email))) return false;
      if (isExcludedHostname(row.hostname)) return false;
      if (row.upsell_sent_at) return false;
      if (!row.paid_at) return false;
      const delay = row.product === 'page_report' ? PAGE_REPORT_UPSELL_DELAY_DAYS : DOMAIN_AUDIT_UPSELL_DELAY_DAYS;
      return now - new Date(row.paid_at) >= delay * 24 * 60 * 60 * 1000;
    })
    .map((row) => ({
      ...row,
      upsellKind: row.product === 'page_report' ? 'page_report_upsell' : 'domain_audit_upsell',
    }));
}

// ---------------------------------------------------------------------------
// Runners (dependencies injected, so tests never touch the DB or Resend)
// ---------------------------------------------------------------------------

/**
 * Scan-lead sequence run (day 1 follow-up, or day 3 rescan with
 * template 'scanRescanEmail'). In dry-run mode the log records every
 * would-be send and nothing is sent or marked. In live mode a successful
 * send calls markFollowupSent (day 1 only) so a lead is never messaged twice;
 * day 3 is keyed by its send window plus a Resend idempotency key.
 */
export async function runScanFollowups({
  candidates,
  sendScanFollowup,
  markFollowupSent,
  live = false,
  template = 'scanFollowupEmail',
}) {
  const log = [];
  let sent = 0;
  for (const lead of candidates) {
    const entry = {
      to: normalizeEmail(lead.email),
      template,
      trigger: `scan_leads:${lead.id}`,
      hostname: lead.hostname || null,
    };
    if (!live) {
      log.push({ ...entry, action: 'dry-run' });
      continue;
    }
    const res = await sendScanFollowup({
      to: entry.to,
      hostname: lead.hostname,
      url: lead.url,
      issues: lead.issues ?? null,
      critical: lead.critical ?? null,
      serious: lead.serious ?? null,
      idempotencyKey: `${template}/${lead.id}`,
    });
    if (res?.ok) {
      if (markFollowupSent) await markFollowupSent(lead.id, entry.to);
      sent++;
      log.push({ ...entry, action: 'sent' });
    } else {
      log.push({ ...entry, action: 'failed', reason: res?.reason || 'send-failed' });
    }
  }
  return { live, checked: candidates.length, sent, log };
}

/**
 * Build the abandoned-checkout sender used by sendAbandonedCheckoutReminders.
 * The wrapper enforces the gating rules and dry-run mode around the real
 * sender: excluded hostnames and suppressed emails never send (and are never
 * marked reminded, so they are skipped again on the next run); in dry-run
 * mode every eligible reminder is logged with its purchase id and nothing
 * is sent or marked.
 */
export function abandonedReminderSender({ live, realSend, suppressedEmails, log }) {
  const suppressed = new Set((suppressedEmails || []).map(normalizeEmail));
  return async ({ to, product, hostname, checkoutUrl, purchaseId }) => {
    const entry = {
      to: normalizeEmail(to),
      template: 'abandonedCheckoutEmail',
      trigger: `one_time_purchases:${purchaseId}`,
      hostname: hostname || null,
    };
    if (isExcludedHostname(hostname) || suppressed.has(normalizeEmail(to))) {
      log.push({ ...entry, action: 'skipped', reason: isExcludedHostname(hostname) ? 'excluded-hostname' : 'suppressed' });
      // ok:false so the caller does not mark this purchase reminded.
      return { ok: false, reason: 'skipped' };
    }
    if (!live) {
      log.push({ ...entry, action: 'dry-run' });
      return { ok: false, reason: 'dry-run' };
    }
    return realSend({ to, product, hostname, checkoutUrl });
  };
}

/**
 * Post-purchase upsell run. Same contract as runScanFollowups: dry-run logs
 * only, live sends once per purchase and marks upsell_sent_at on success.
 */
export async function runUpsells({ candidates, sendPageUpsell, sendAuditUpsell, markUpsellSent, live = false }) {
  const log = [];
  let sent = 0;
  for (const row of candidates) {
    const isPage = row.product === 'page_report';
    const entry = {
      to: normalizeEmail(row.email),
      template: isPage ? 'pageReportUpsellEmail' : 'auditUpsellEmail',
      trigger: `one_time_purchases:${row.id}`,
      hostname: row.hostname || null,
    };
    if (!hasEmail(row.email)) {
      log.push({ ...entry, action: 'skipped', reason: 'no-email' });
      continue;
    }
    if (!live) {
      log.push({ ...entry, action: 'dry-run' });
      continue;
    }
    const res = isPage
      ? await sendPageUpsell({
          to: entry.to,
          hostname: row.hostname,
          reportUrl: `https://www.accessbell.co/report?token=${row.token}`,
        })
      : await sendAuditUpsell({
          to: entry.to,
          hostname: row.hostname,
          reportUrl: `https://www.accessbell.co/report?token=${row.token}`,
        });
    if (res?.ok) {
      await markUpsellSent(row.id);
      sent++;
      log.push({ ...entry, action: 'sent' });
    } else {
      log.push({ ...entry, action: 'failed', reason: res?.reason || 'send-failed' });
    }
  }
  return { live, checked: candidates.length, sent, log };
}

/** Record a bounce / opt-out stop so later runs skip this email everywhere. */
export async function recordFunnelSuppression(email, reason) {
  if (!hasEmail(email)) return null;
  const rows = await query(
    `insert into app.funnel_suppressions (email, reason) values ($1, $2)
     on conflict do nothing returning *`,
    [normalizeEmail(email), String(reason || '').slice(0, 200)],
  );
  return rows[0] || null;
}

export async function fetchSuppressedEmails() {
  const rows = await query('select lower(email) as email from app.funnel_suppressions');
  return rows.map((r) => r.email);
}

/** Owner tool: remove one address from the suppression list (e.g. a test row). */
export async function removeFunnelSuppression(email) {
  if (!hasEmail(email)) return 0;
  const rows = await query('delete from app.funnel_suppressions where lower(email) = $1 returning id', [normalizeEmail(email)]);
  return rows.length;
}

/**
 * Read-only preview: who each funnel email would go to if live today, using
 * the same queries and selectors as the scheduled runs. Sends and marks nothing.
 */
export async function funnelPreview({ now = new Date() } = {}) {
  const { oneTimeCheckoutUrl } = await import('./one-time.js');
  const suppressedEmails = await fetchSuppressedEmails();
  const suppressed = new Set(suppressedEmails);
  const { followups, rescans } = await scanSequenceCandidates({ now });
  const pending = await query(
    `select * from app.one_time_purchases
      where status = 'pending' and reminder_sent_at is null and created_at < now() - interval '24 hours'
      order by created_at asc limit 100`,
  );
  const abandoned = pending.filter(
    (r) => hasEmail(r.email) && oneTimeCheckoutUrl(r.product, r) && !isExcludedHostname(r.hostname) && !suppressed.has(normalizeEmail(r.email)),
  );
  const purchases = await query(
    `select * from app.one_time_purchases where status = 'paid' and upsell_sent_at is null
      order by paid_at asc nulls last limit 100`,
  );
  const upsells = upsellCandidates({ purchases, suppressedEmails, now }).filter((r) => hasEmail(r.email));
  const counts = await query(
    `select (select count(*) from app.free_scans)::int as free_scans,
            (select count(distinct hostname) from app.free_scans)::int as free_scan_hostnames,
            (select count(*) from app.scan_leads)::int as scan_leads,
            (select count(*) from app.funnel_suppressions)::int as suppressions`,
  );
  const row = (email, hostname, type) => ({ email: normalizeEmail(email), hostname: hostname || null, type });
  return {
    wouldSend: [
      ...followups.map((l) => row(l.email, l.hostname, 'scanFollowupEmail')),
      ...rescans.map((l) => row(l.email, l.hostname, 'scanRescanEmail')),
      ...abandoned.map((r) => row(r.email, r.hostname, `abandonedCheckoutEmail:${r.product}`)),
      ...upsells.map((r) => row(r.email, r.hostname, r.product === 'page_report' ? 'pageReportUpsellEmail' : 'auditUpsellEmail')),
    ],
    counts: counts[0] || {},
  };
}

/**
 * Read-only: the day-1 and day-3 scan-lead candidates right now, with the
 * same queries and exclusions the scheduled run uses. Leads older than
 * SCAN_LEAD_MAX_AGE_DAYS are never selected.
 */
export async function scanSequenceCandidates({ now = new Date() } = {}) {
  const leads = await query(
    `select l.id, l.email, l.hostname, l.url, l.created_at, l.followup_sent_at,
            fs.issues, fs.critical, fs.serious
       from app.scan_leads l
       left join lateral (
         select issues, critical, serious from app.free_scans
          where hostname = l.hostname and issues is not null order by created_at desc limit 1
       ) fs on true
      where l.email is not null and l.email <> ''
        and l.created_at > now() - make_interval(days => $1)
      order by l.created_at asc limit 500`,
    [SCAN_LEAD_MAX_AGE_DAYS + 4],
  );
  const paidRows = await query(`select distinct lower(email) as email from app.one_time_purchases where status = 'paid'`);
  // Anyone with an AccessBell account, and every site already monitored by a customer.
  const customerRows = await query(`select lower(email) as email from app.profiles`);
  const siteRows = await query(`select distinct lower(hostname) as hostname from app.domains`);
  const ctx = {
    leads,
    paidEmails: paidRows.map((r) => r.email),
    suppressedEmails: await fetchSuppressedEmails(),
    customerEmails: customerRows.map((r) => r.email),
    customerHostnames: siteRows.map((r) => r.hostname),
    now,
  };
  // One email per address per run: keep the newest lead per email (the day-1
  // marker is written for every lead under that email, see markFollowupSent).
  const followups = newestPerEmail(scanFollowupCandidates(ctx));
  const day1 = new Set(followups.map((l) => normalizeEmail(l.email)));
  const rescans = newestPerEmail(scanRescanCandidates(ctx)).filter((l) => !day1.has(normalizeEmail(l.email)));
  return { followups, rescans };
}

function newestPerEmail(leads) {
  const seen = new Set();
  return [...leads]
    .reverse()
    .filter((l) => {
      const e = normalizeEmail(l.email);
      if (seen.has(e)) return false;
      seen.add(e);
      return true;
    })
    .reverse()
    .slice(0, SCAN_SEQUENCE_BATCH);
}

/** Day-1 marker for every lead under this email, so older duplicate leads never get their own day 1. */
export async function markScanFollowupSent(email) {
  await query(`update app.scan_leads set followup_sent_at = now() where lower(email) = $1 and followup_sent_at is null`, [normalizeEmail(email)]);
}

/** Read-only: every site in the free scan log with its latest completed scan. */
export async function freeScanSites() {
  return query(
    `select distinct on (hostname) hostname, url, final_url, issues, critical, serious, created_at
       from app.free_scans
      where hostname is not null and issues is not null
      order by hostname, created_at desc`,
  );
}

const OUTREACH_EMAIL = /^[^\s@<>()[\]\\,;:"]{1,64}@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

/**
 * Owner-approved outreach batch. Never runs on a schedule: only the explicit
 * admin action calls it, with confirm === 'SEND'. Skips suppressed addresses,
 * excluded hostnames and invalid rows; one send per address+site (Resend
 * idempotency key) so a retried batch does not double-send within 24h.
 */
export async function runOutreach({ items, confirm, send, suppressedEmails, dryRun = false, alreadySent = OUTREACH_ALREADY_SENT, pauseMs = 600 }) {
  if (confirm !== 'SEND' && !dryRun) return { error: 'confirm must be "SEND"' };
  const suppressed = new Set((suppressedEmails || []).map(normalizeEmail));
  const log = [];
  let sent = 0;
  for (const it of (items || []).slice(0, 200)) {
    const to = normalizeEmail(it?.email);
    const hostname = normalizeHostname(it?.hostname);
    const entry = { to, hostname };
    if (!OUTREACH_EMAIL.test(to) || !it?.subject || !it?.body) { log.push({ ...entry, action: 'skipped', reason: 'invalid' }); continue; }
    if (isExcludedHostname(hostname)) { log.push({ ...entry, action: 'skipped', reason: 'excluded-hostname' }); continue; }
    if (suppressed.has(to)) { log.push({ ...entry, action: 'skipped', reason: 'suppressed' }); continue; }
    if (alreadySent.has(to)) { log.push({ ...entry, action: 'skipped', reason: 'already-sent' }); continue; }
    if (dryRun) { log.push({ ...entry, action: 'dry-run' }); continue; }
    if (sent > 0 && pauseMs) await new Promise((r) => setTimeout(r, pauseMs)); // Resend rate limit (~2/s)
    const res = await send({ to, subject: String(it.subject).slice(0, 150), body: String(it.body).slice(0, 5000), key: `${to}/${hostname}`, hostname });
    if (res?.ok) { sent++; log.push({ ...entry, action: 'sent', id: res.id || null }); }
    else log.push({ ...entry, action: 'failed', reason: res?.reason || 'send-failed' });
  }
  return { sent, checked: log.length, log };
}

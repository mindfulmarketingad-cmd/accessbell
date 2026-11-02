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

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Hostnames that must never receive funnel email, whatever the trigger. */
export const FUNNEL_EXCLUDED_HOSTNAMES = ['ramenearyou.com', 'shopsigvaris.com'];

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

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const hasEmail = (email) => normalizeEmail(email).length > 0;

// ---------------------------------------------------------------------------
// Pure selectors (no I/O; these are what the tests pin down)
// ---------------------------------------------------------------------------

/**
 * Scan-lead follow-up candidates: emailed leads with no follow-up sent yet,
 * no paid purchase under the same email, and no suppression. Issue counts
 * arrive on the row from the latest free_scans entry for the hostname.
 */
export function scanFollowupCandidates({ leads, paidEmails, suppressedEmails }) {
  const paid = new Set((paidEmails || []).map(normalizeEmail));
  const suppressed = new Set((suppressedEmails || []).map(normalizeEmail));
  return leads.filter((lead) => {
    if (!hasEmail(lead.email)) return false;
    if (lead.followup_sent_at) return false;
    if (isExcludedHostname(lead.hostname)) return false;
    if (paid.has(normalizeEmail(lead.email))) return false;
    if (suppressed.has(normalizeEmail(lead.email))) return false;
    return true;
  });
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
 * Scan-lead follow-up run. In dry-run mode the log records every would-be
 * send and nothing is sent or marked. In live mode a successful send marks
 * the lead so it is never messaged twice.
 */
export async function runScanFollowups({
  candidates,
  sendScanFollowup,
  markFollowupSent,
  live = false,
}) {
  const log = [];
  let sent = 0;
  for (const lead of candidates) {
    const entry = {
      to: normalizeEmail(lead.email),
      template: 'scanFollowupEmail',
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
    });
    if (res?.ok) {
      await markFollowupSent(lead.id);
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
  const leads = await query(
    `select l.id, l.email, l.hostname, l.url, l.followup_sent_at
       from app.scan_leads l
      where l.email is not null and l.email <> '' and l.followup_sent_at is null
      order by l.created_at asc limit 100`,
  );
  const paidRows = await query(`select distinct lower(email) as email from app.one_time_purchases where status = 'paid'`);
  const followups = scanFollowupCandidates({ leads, paidEmails: paidRows.map((r) => r.email), suppressedEmails });
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
      ...abandoned.map((r) => row(r.email, r.hostname, `abandonedCheckoutEmail:${r.product}`)),
      ...upsells.map((r) => row(r.email, r.hostname, r.product === 'page_report' ? 'pageReportUpsellEmail' : 'auditUpsellEmail')),
    ],
    counts: counts[0] || {},
  };
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
export async function runOutreach({ items, confirm, send, suppressedEmails, dryRun = false }) {
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
    if (dryRun) { log.push({ ...entry, action: 'dry-run' }); continue; }
    const res = await send({ to, subject: String(it.subject).slice(0, 150), body: String(it.body).slice(0, 5000), key: `${to}/${hostname}` });
    if (res?.ok) { sent++; log.push({ ...entry, action: 'sent', id: res.id || null }); }
    else log.push({ ...entry, action: 'failed', reason: res?.reason || 'send-failed' });
  }
  return { sent, checked: log.length, log };
}

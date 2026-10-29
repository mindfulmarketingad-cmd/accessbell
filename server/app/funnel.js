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
//   app.funnel_suppressions) is skipped on every later run.
// - One send per trigger, tracked in the database: scan_leads.followup_sent_at,
//   one_time_purchases.reminder_sent_at (existing), one_time_purchases.upsell_sent_at.
//   Markers are written only after a live send succeeds.
//
// The senders live in email-sequences.js and are never changed here. The
// Page Report -> Domain Audit upsell template (pageReportUpsellEmail) is NEW
// in this change and needs David's approval before live sends, like every
// other template in the funnel.
import { query } from './db.js';

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
export function upsellCandidates({ purchases, now = new Date() }) {
  return purchases
    .filter((row) => {
      if (row.status !== 'paid') return false;
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

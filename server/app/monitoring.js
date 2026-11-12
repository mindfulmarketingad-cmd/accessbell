// Continuous monitoring: rescan monitored pages and alert on regressions.
import { query, one } from './db.js';
import { config } from './config.js';
import { scanPage } from './scanning.js';
import { withAccessRule } from './access.js';
import { recordAlertEmail } from './tracking.js';
import { scheduleFilterSql } from '../shopify/plans.js';
import { addToDigest, claimReadyDigests, reopenDigest } from './alert-digest.js';

const SEVERE = new Set(['critical', 'serious']);

/** Monitored pages for every account that has dashboard access. */
export async function pagesDueForMonitoring() {
  return withAccessRule((rule) =>
    query(
      `select p.id
         from app.pages p
         join app.domains d on d.id = p.domain_id
         join app.accounts a on a.id = d.account_id
        where p.monitored and ${rule}
          -- Shopify Starter: weekly, first 25 pages. No effect on other accounts.
          and ${scheduleFilterSql('a', 'p')}
        order by p.last_scanned_at asc nulls first
        limit 50000`,
    ),
  );
}

const severeRules = (issues) => new Set((issues || []).filter((i) => SEVERE.has(i.impact)).map((i) => i.id));

/**
 * Rescan one page (scheduled). Returns the new severe rule ids compared with
 * the previous scan on the same device, so the caller can alert.
 */
export async function monitorPage(pageId, { deps, trigger = 'scheduled', userId = null } = {}) {
  const page = await withAccessRule((rule) =>
    one(
      `select p.*, d.settings, d.hostname, d.account_id, ${rule} as has_access
         from app.pages p
         join app.domains d on d.id = p.domain_id
         join app.accounts a on a.id = d.account_id
        where p.id = $1`,
      [pageId],
    ),
  );
  if (!page || !page.monitored || !page.has_access) return { skipped: true };

  const previous = await query(
    `select distinct on (device) device, issues from app.scans
      where page_id = $1 and status = 'done' order by device, created_at desc`,
    [page.id],
  );
  const stored = await scanPage(page, { accountId: page.account_id, trigger, userId, deps });

  const regressions = [];
  for (const scan of stored.filter((s) => s.status === 'done')) {
    const full = await one('select issues from app.scans where id = $1', [scan.id]);
    const before = severeRules(previous.find((p) => p.device === scan.device)?.issues);
    const hadBaseline = previous.some((p) => p.device === scan.device);
    for (const issue of full.issues || []) {
      if (hadBaseline && SEVERE.has(issue.impact) && !before.has(issue.id)) {
        regressions.push({ device: scan.device, rule: issue.id, title: issue.title, impact: issue.impact, count: issue.count, scanId: scan.id });
      }
    }
  }
  return { skipped: false, accountId: page.account_id, pageId: page.id, url: page.url, hostname: page.hostname, regressions };
}

/**
 * Record a page's new serious issues for the account's alert digest. This never
 * emails: the digest sweep (sendReadyDigests) sends one email per account and
 * site, so a site with many monitored pages gets a single alert per run.
 */
export async function sendRegressionAlert(result, { addImpl = addToDigest } = {}) {
  if (!result.regressions?.length) return { sent: false, queued: false };
  const digestId = await addImpl(result);
  return { sent: false, queued: Boolean(digestId), digestId };
}

/** Build the single digest email text for one site. */
export function digestText(digest, appUrl) {
  const regs = digest.regressions || [];
  const pages = [...new Set(regs.map((r) => r.url).filter(Boolean))];
  const lines = regs
    .slice(0, 15)
    .map((r) => `- ${r.title} (${r.impact}, ${r.count} element${r.count === 1 ? '' : 's'}, ${r.device})${pages.length > 1 && r.url ? `\n  ${r.url}` : ''}`);
  return [
    `AccessBell found new accessibility issues on ${digest.hostname}${pages.length > 1 ? ` (${pages.length} pages)` : pages[0] ? `: ${pages[0]}` : ''}`,
    '',
    ...lines,
    ...(regs.length > 15 ? [`...and ${regs.length - 15} more`] : []),
    '',
    `Review the report: ${appUrl}/app/scan?id=${regs[0]?.scanId}`,
    '',
    'You receive this because you are an owner or admin of this AccessBell account.',
  ].join('\n');
}

/** Email owners and admins one digest. A Resend idempotency key makes a repeat send a no-op. */
export async function sendDigestEmail(digest, { fetchImpl = fetch } = {}) {
  const c = config();
  const accountId = digest.account_id;
  const pageUrl = digest.regressions?.[0]?.url;
  if (!c.resendApiKey) {
    await recordAlertEmail({ accountId, pageUrl, status: 'skipped', error: 'RESEND_API_KEY not set' });
    return { sent: false };
  }
  const recipients = await query(
    `select p.email from app.account_members m join app.profiles p on p.user_id = m.user_id
      where m.account_id = $1 and m.role in ('owner', 'admin')`,
    [accountId],
  );
  if (!recipients.length) {
    await recordAlertEmail({ accountId, pageUrl, recipients: 0, status: 'skipped', error: 'no owner or admin email' });
    return { sent: false };
  }
  const to = recipients.map((r) => r.email).slice(0, 20);
  let res;
  try {
    res = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${c.resendApiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `regression-digest-${digest.id}`,
      },
      body: JSON.stringify({
        from: c.emailFrom,
        to,
        subject: `New accessibility issues on ${digest.hostname}`.slice(0, 150),
        text: digestText(digest, c.appUrl),
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    await recordAlertEmail({ accountId, pageUrl, recipients: to.length, status: 'failed', error: err?.name || 'network error' });
    throw err;
  }
  const data = res.ok && typeof res.json === 'function' ? await res.json().catch(() => null) : null;
  await recordAlertEmail({
    accountId,
    pageUrl,
    recipients: to.length,
    status: res.ok ? 'sent' : 'failed',
    resendId: data?.id,
    error: res.ok ? null : `resend-${res.status}`,
  });
  // Retry later only for transient failures; a permanent 4xx would loop forever.
  if (!res.ok && (res.status >= 500 || res.status === 429)) throw new Error(`resend-${res.status}`);
  return { sent: res.ok };
}

/**
 * Send every digest that is ready (see claimReadyDigests). A digest whose email
 * fails is reopened so the next sweep retries it; the idempotency key stops a
 * retry from double sending.
 */
export async function sendReadyDigests({ claimImpl = claimReadyDigests, sendImpl = sendDigestEmail, reopenImpl = reopenDigest } = {}) {
  const digests = await claimImpl();
  let sent = 0;
  let failed = 0;
  for (const d of digests) {
    try {
      const out = await sendImpl(d);
      if (out?.sent) sent += 1;
    } catch {
      failed += 1;
      await reopenImpl(d.id).catch(() => {});
    }
  }
  return { digests: digests.length, sent, failed };
}

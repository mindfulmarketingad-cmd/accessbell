// Continuous monitoring: rescan monitored pages and alert on regressions.
import { query, one } from './db.js';
import { config } from './config.js';
import { scanPage } from './scanning.js';
import { withAccessRule } from './access.js';

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

/** Email owners and admins about new serious or critical issues. */
export async function sendRegressionAlert(result, { fetchImpl = fetch } = {}) {
  const c = config();
  if (!c.resendApiKey || !result.regressions?.length) return { sent: false };
  const recipients = await query(
    `select p.email from app.account_members m join app.profiles p on p.user_id = m.user_id
      where m.account_id = $1 and m.role in ('owner', 'admin')`,
    [result.accountId],
  );
  if (!recipients.length) return { sent: false };

  const lines = result.regressions
    .slice(0, 10)
    .map((r) => `- ${r.title} (${r.impact}, ${r.count} element${r.count === 1 ? '' : 's'}, ${r.device})`);
  const text = [
    `AccessBell found new accessibility issues on ${result.url}`,
    '',
    ...lines,
    '',
    `Review the report: ${c.appUrl}/app/scan?id=${result.regressions[0].scanId}`,
    '',
    'You receive this because you are an owner or admin of this AccessBell account.',
  ].join('\n');

  const res = await fetchImpl('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: c.emailFrom,
      to: recipients.map((r) => r.email).slice(0, 20),
      subject: `New accessibility issues on ${result.hostname}`.slice(0, 150),
      text,
    }),
    signal: AbortSignal.timeout(8000),
  });
  return { sent: res.ok };
}

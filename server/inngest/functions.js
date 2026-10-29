// Inngest background functions: scheduled monitoring with fan-out.
import { Inngest } from 'inngest';
import { pagesDueForMonitoring, monitorPage, sendRegressionAlert } from '../app/monitoring.js';
import { startOneTimeAudit, finishOneTimeAudit, failOneTimeAudit } from '../app/one-time.js';
import { discoverOneTimeUrls, scanOneTimeUrls, aggregateOneTimeReport } from '../one-time-audit.js';
import { sendReportReadyEmail } from '../app/email-sequences.js';
import { query } from '../app/db.js';
import {
  funnelLive,
  scanFollowupCandidates,
  upsellCandidates,
  runScanFollowups,
  runUpsells,
  abandonedReminderSender,
  fetchSuppressedEmails,
} from '../app/funnel.js';
import { sendAbandonedCheckoutReminders } from '../app/one-time.js';
import {
  sendScanFollowup,
  sendAbandonedCheckoutReminder,
  sendAuditUpsell,
  sendPageReportUpsell,
} from '../app/email-sequences.js';

export const inngest = new Inngest({ id: 'accessbell' });

/**
 * Funnel agent, dry-run by default (FUNNEL_EMAIL_LIVE=1 to send for real).
 * Every function returns its full log so the run output in the Inngest
 * dashboard IS the review log David approves before go-live. No function
 * sends, marks, or mutates anything while dry-run is on.
 */
function noDatabase() {
  return !process.env.DATABASE_URL;
}

function logDryRun(entries) {
  for (const e of entries) console.log('[funnel dry-run]', JSON.stringify(e));
}

/** Daily: one scan follow-up per emailed lead with no paid purchase yet. */
export const funnelScanFollowupFn = inngest.createFunction(
  { id: 'funnel-scan-followup', triggers: [{ cron: 'TZ=UTC 0 7 * * *' }] },
  async ({ step }) => {
    if (noDatabase()) return { skipped: 'DATABASE_URL is not set' };
    const live = funnelLive();
    const result = await step.run('followups', async () => {
      const leads = await query(
        `select l.id, l.email, l.hostname, l.url, l.followup_sent_at,
                fs.issues, fs.critical, fs.serious
           from app.scan_leads l
           left join lateral (
             select issues, critical, serious from app.free_scans
              where hostname = l.hostname order by created_at desc limit 1
           ) fs on true
          where l.email is not null and l.email <> '' and l.followup_sent_at is null
          order by l.created_at asc limit 100`,
      );
      const paidRows = await query(`select distinct lower(email) as email from app.one_time_purchases where status = 'paid'`);
      const candidates = scanFollowupCandidates({
        leads,
        paidEmails: paidRows.map((r) => r.email),
        suppressedEmails: await fetchSuppressedEmails(),
      });
      return runScanFollowups({
        candidates,
        sendScanFollowup,
        markFollowupSent: (id) => query('update app.scan_leads set followup_sent_at = now() where id = $1', [id]),
        live,
      });
    });
    if (!live) logDryRun(result.log);
    return result;
  },
);

/** Daily: one abandoned-checkout reminder per stale pending purchase. */
export const funnelAbandonedCheckoutFn = inngest.createFunction(
  { id: 'funnel-abandoned-checkout', triggers: [{ cron: 'TZ=UTC 0 8 * * *' }] },
  async ({ step }) => {
    if (noDatabase()) return { skipped: 'DATABASE_URL is not set' };
    const live = funnelLive();
    const log = [];
    const result = await step.run('reminders', async () => {
      const sender = abandonedReminderSender({
        live,
        realSend: sendAbandonedCheckoutReminder,
        suppressedEmails: await fetchSuppressedEmails(),
        log,
      });
      const out = await sendAbandonedCheckoutReminders({ sendReminder: sender });
      return { live, checked: out.checked, sent: out.sent, log };
    });
    if (!live) logDryRun(result.log);
    return result;
  },
);

/** Daily: one post-purchase upsell per buyer (Page Report -> Audit, Audit -> Pro). */
export const funnelUpsellFn = inngest.createFunction(
  { id: 'funnel-upsell', triggers: [{ cron: 'TZ=UTC 0 9 * * *' }] },
  async ({ step }) => {
    if (noDatabase()) return { skipped: 'DATABASE_URL is not set' };
    const live = funnelLive();
    const result = await step.run('upsells', async () => {
      const purchases = await query(
        `select * from app.one_time_purchases
          where status = 'paid' and upsell_sent_at is null
          order by paid_at asc nulls last limit 100`,
      );
      const candidates = upsellCandidates({ purchases });
      return runUpsells({
        candidates,
        sendPageUpsell: sendPageReportUpsell,
        sendAuditUpsell,
        markUpsellSent: (id) => query('update app.one_time_purchases set upsell_sent_at = now() where id = $1', [id]),
        live,
      });
    });
    if (!live) logDryRun(result.log);
    return result;
  },
);

/** Every day, queue a rescan for every monitored page of paying accounts. */
export const scheduleMonitoring = inngest.createFunction(
  { id: 'schedule-monitoring', triggers: [{ cron: 'TZ=UTC 0 6 * * *' }] },
  async ({ step }) => {
    const pages = await step.run('list-monitored-pages', () => pagesDueForMonitoring());
    for (let i = 0; i < pages.length; i += 500) {
      await step.sendEvent(
        `queue-scans-${i}`,
        pages.slice(i, i + 500).map((p) => ({ name: 'app/page.monitor', data: { pageId: p.id } })),
      );
    }
    return { queued: pages.length };
  },
);

/** Rescan one page. Concurrency is capped to respect the browser provider's limits. */
export const monitorPageFn = inngest.createFunction(
  { id: 'monitor-page', triggers: [{ event: 'app/page.monitor' }], concurrency: { limit: 3 }, retries: 2 },
  async ({ event, step }) => {
    const result = await step.run('scan', () => monitorPage(event.data.pageId));
    if (!result.skipped && result.regressions.length) {
      await step.run('alert', () => sendRegressionAlert(result));
    }
    return { skipped: result.skipped, regressions: result.regressions?.length || 0 };
  },
);

/** A scan someone started from the dashboard ("Start Scan" or "Re-scan domain") for many pages. */
export const scanPageFn = inngest.createFunction(
  { id: 'scan-page', triggers: [{ event: 'app/page.scan' }], concurrency: { limit: 3 }, retries: 1 },
  async ({ event, step }) => {
    const result = await step.run('scan', () => monitorPage(event.data.pageId, { trigger: 'manual', userId: event.data.userId || null }));
    if (!result.skipped && result.regressions.length) {
      await step.run('alert', () => sendRegressionAlert(result));
    }
    return { skipped: result.skipped };
  },
);

/**
 * Build a one-time Domain Audit: discover up to 500 pages, scan them in
 * batches, store the aggregated report and email the buyer the report link.
 * Only the run that moves the purchase from pending to building proceeds, so
 * a duplicate event (webhook retry plus report-page nudge) cannot double-run
 * the crawl or double-send the ready email.
 */
export const oneTimeAuditFn = inngest.createFunction(
  { id: 'one-time-domain-audit', triggers: [{ event: 'app/one-time.audit' }], concurrency: { limit: 2 }, retries: 1 },
  async ({ event, step }) => {
    const started = await step.run('start', () => startOneTimeAudit(event.data.token));
    if (started.skipped) return started;
    const purchase = started.purchase;
    try {
      const urls = await step.run('discover', () => discoverOneTimeUrls(purchase.url));
      let pageResults = [];
      for (let i = 0; i < urls.length; i += 25) {
        const batch = await step.run(`scan-batch-${i}`, () => scanOneTimeUrls(urls.slice(i, i + 25)));
        pageResults = pageResults.concat(batch);
      }
      const report = await step.run('aggregate', () =>
        aggregateOneTimeReport({ hostname: purchase.hostname, url: purchase.url, pageResults }),
      );
      const stored = await step.run('store', () => finishOneTimeAudit(purchase.token, report));
      if (stored.ready) {
        await step.run('email', () =>
          sendReportReadyEmail({
            to: purchase.email,
            hostname: purchase.hostname,
            reportUrl: `https://www.accessbell.co/report?token=${purchase.token}`,
            summary: report.summary && { ...report.summary, pagesScanned: report.pagesScanned },
          }),
        );
      }
      return { pages: report.pagesScanned, issues: report.summary.issues };
    } catch (err) {
      await step.run('fail', () => failOneTimeAudit(purchase.token));
      throw err;
    }
  },
);

export const functions = [
  scheduleMonitoring,
  monitorPageFn,
  scanPageFn,
  oneTimeAuditFn,
  funnelScanFollowupFn,
  funnelAbandonedCheckoutFn,
  funnelUpsellFn,
];

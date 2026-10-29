// Inngest background functions: scheduled monitoring with fan-out.
import { Inngest } from 'inngest';
import { pagesDueForMonitoring, monitorPage, sendRegressionAlert } from '../app/monitoring.js';
import { startOneTimeAudit, finishOneTimeAudit, failOneTimeAudit } from '../app/one-time.js';
import { discoverOneTimeUrls, scanOneTimeUrls, aggregateOneTimeReport } from '../one-time-audit.js';
import { sendReportReadyEmail } from '../app/email-sequences.js';

export const inngest = new Inngest({ id: 'accessbell' });

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

export const functions = [scheduleMonitoring, monitorPageFn, scanPageFn, oneTimeAuditFn];

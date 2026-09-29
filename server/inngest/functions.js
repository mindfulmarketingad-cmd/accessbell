// Inngest background functions: scheduled monitoring with fan-out.
import { Inngest } from 'inngest';
import { pagesDueForMonitoring, monitorPage, sendRegressionAlert } from '../app/monitoring.js';

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

export const functions = [scheduleMonitoring, monitorPageFn, scanPageFn];

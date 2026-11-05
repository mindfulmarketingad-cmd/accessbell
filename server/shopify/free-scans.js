// Shopify Free plan: a monthly home-page score, outside the paid scheduler
// (Free accounts have no dashboard access, so monitorPage would skip them).
import { query, one } from '../app/db.js';
import { scanPage } from '../app/scanning.js';
import { FREE_DUE_SQL } from './plans.js';

export const freePagesDue = () => query(FREE_DUE_SQL);

export async function scanFreePage(pageId) {
  const page = await one(
    `select p.*, d.settings, d.hostname, d.account_id, to_jsonb(a)->>'plan_tier' as plan_tier
       from app.pages p join app.domains d on d.id = p.domain_id join app.accounts a on a.id = d.account_id
      where p.id = $1 and p.url = d.base_url || '/'`,
    [pageId],
  );
  if (!page || page.plan_tier !== 'free' || !page.monitored) return { skipped: true };
  const stored = await scanPage(page, { accountId: page.account_id, trigger: 'scheduled' });
  return { skipped: false, scans: stored.length };
}

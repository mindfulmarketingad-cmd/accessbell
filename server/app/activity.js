// Activity log: the changes people make to a domain in AccessBell, kept as
// documentation for compliance records. Writes are best effort: a logging
// failure never blocks the change itself, and before migration 0008 runs
// nothing is logged.
import { query } from './db.js';

const MISSING = new Set(['42P01', '42703']);

export const ACTIVITY_ACTIONS = new Set([
  'note', 'fix.added', 'fix.enabled', 'fix.disabled', 'fix.removed', 'statement.saved', 'settings.updated', 'pages.selected',
  'page.added', 'page.monitored', 'page.unmonitored', 'page.removed', 'domain.added', 'toolbar.updated', 'issue.resolved', 'issue.reopened',
]);

export async function logActivity(ctx, domainId, action, detail = {}, happenedOn = null) {
  if (!ACTIVITY_ACTIONS.has(action)) throw new Error(`unknown activity ${action}`);
  try {
    await query(
      `insert into app.activity_log (account_id, domain_id, user_id, user_email, action, detail, happened_on)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [ctx.account.id, domainId, ctx.user?.id || null, ctx.user?.email || null, action, JSON.stringify(detail), happenedOn],
    );
  } catch (err) {
    if (!MISSING.has(err?.code)) console.error('activity log write failed:', err.message);
  }
}

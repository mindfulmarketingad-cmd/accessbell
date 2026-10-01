// Issues marked as resolved by hand: for the whole domain or for one page.
// They stay in the scan data (automated tests still report them) but leave the
// active issue list, and every change goes in the Compliance Vault activity log.
import { query, one } from './db.js';
import { requireRole } from './accounts.js';
import { getDomain } from './domains.js';
import { AppError, badRequest, notFound } from './errors.js';
import { logActivity } from './activity.js';

const MISSING = new Set(['42P01', '42703']);
const RULE = /^[A-Za-z0-9-]{1,80}$/;
const UUID = /^[0-9a-f-]{36}$/i;

async function needsMigration(run) {
  try {
    return await run();
  } catch (err) {
    if (MISSING.has(err?.code)) {
      throw new AppError(503, 'Marking issues as resolved needs a database update. Run supabase/migrations/0010_issue_resolutions.sql in Supabase.', 'migration_needed');
    }
    throw err;
  }
}

/** Every resolution for a domain. Empty before migration 0010 runs. */
export async function listResolutions(domainId) {
  try {
    return await query(
      `select rule_id as rule, page_id as "pageId", note, resolved_email as "resolvedBy", created_at as "resolvedAt"
         from app.issue_resolutions where domain_id = $1 order by created_at desc`,
      [domainId],
    );
  } catch (err) {
    if (MISSING.has(err?.code)) return [];
    throw err;
  }
}

async function target(ctx, domainId, input) {
  const domain = await getDomain(ctx, domainId);
  const rule = String(input?.rule || '');
  if (!RULE.test(rule)) throw badRequest('Unknown issue.');
  let page = null;
  if (input?.pageId) {
    if (!UUID.test(String(input.pageId))) throw notFound('Page not found.');
    page = await one('select id, url from app.pages where id = $1 and domain_id = $2', [input.pageId, domain.id]);
    if (!page) throw notFound('Page not found.');
  }
  return { domain, rule, page };
}

export async function resolveIssue(ctx, domainId, input) {
  requireRole(ctx, 'member');
  return needsMigration(async () => {
    const { domain, rule, page } = await target(ctx, domainId, input);
    const note = String(input?.note || '').trim().slice(0, 500) || null;
    const title = String(input?.title || '').trim().slice(0, 200) || rule;
    await query(
      `insert into app.issue_resolutions (domain_id, rule_id, page_id, note, resolved_by, resolved_email)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (domain_id, rule_id, coalesce(page_id, '00000000-0000-0000-0000-000000000000'::uuid))
       do update set note = excluded.note, resolved_by = excluded.resolved_by, resolved_email = excluded.resolved_email, created_at = now()`,
      [domain.id, rule, page?.id || null, note, ctx.user?.id || null, ctx.user?.email || null],
    );
    await logActivity(ctx, domain.id, 'issue.resolved', { rule, title, page: page?.url || null, note });
    return { status: 'resolved' };
  });
}

export async function reopenIssue(ctx, domainId, input) {
  requireRole(ctx, 'member');
  return needsMigration(async () => {
    const { domain, rule, page } = await target(ctx, domainId, input);
    const rows = page
      ? await query('delete from app.issue_resolutions where domain_id = $1 and rule_id = $2 and page_id = $3 returning id', [domain.id, rule, page.id])
      : await query('delete from app.issue_resolutions where domain_id = $1 and rule_id = $2 returning id', [domain.id, rule]);
    if (!rows.length) throw notFound('This issue is not marked as resolved.');
    const title = String(input?.title || '').trim().slice(0, 200) || rule;
    await logActivity(ctx, domain.id, 'issue.reopened', { rule, title, page: page?.url || null });
    return { status: 'reopened' };
  });
}

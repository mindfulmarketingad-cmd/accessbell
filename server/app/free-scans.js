// Free scans from the public checkers: logged by /api/scan, listed for the
// site's own admins (ADMIN_EMAILS) in the dashboard. Logging is best effort:
// a database problem never breaks a visitor's scan.
import { query } from './db.js';
import { isAdminUser } from './accounts.js';
import { AppError, forbidden } from './errors.js';

const MISSING = new Set(['42P01', '42703']);
const PAGE_SIZE = 100;

const hostOf = (u) => {
  try {
    return new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
};
const cap = (v, n) => (v == null ? null : String(v).slice(0, n));
const int = (v) => (Number.isFinite(v) ? Math.max(0, Math.round(v)) : null);

/** The checker page the scan came from: a same-site path only. */
export function cleanSource(v) {
  const s = String(v || '');
  return /^\/[A-Za-z0-9/_.-]{0,299}$/.test(s) ? s : null;
}

export async function recordFreeScan({ url, standard, source, country, report = null, error = null }) {
  if (!process.env.DATABASE_URL) return;
  const hostname = hostOf(report?.finalUrl || url);
  if (!hostname) return;
  const s = report?.summary || {};
  try {
    await query(
      `insert into app.free_scans (url, final_url, hostname, standard, source, country, status, engine, issues, critical, serious, error)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        cap(url, 2048),
        cap(report?.finalUrl, 2048),
        cap(hostname, 253),
        cap(standard, 20),
        cleanSource(source),
        /^[A-Z]{2}$/.test(country || '') ? country : null,
        report ? 'done' : 'failed',
        cap(report?.engine, 20),
        report ? int(s.issues) : null,
        report ? int(s.critical) : null,
        report ? int(s.serious) : null,
        cap(error, 300),
      ],
    );
  } catch (err) {
    if (!MISSING.has(err?.code)) console.error('free scan log failed:', err.message);
  }
}

/** Admins only: totals, the most checked domains and the latest scans. */
export async function listFreeScans(ctx, { q = '', before = null, days = 30 } = {}) {
  if (!isAdminUser(ctx.user)) throw forbidden();
  const range = [1, 7, 30, 90, 365].includes(Number(days)) ? Number(days) : 30;
  const search = String(q || '').trim().toLowerCase().slice(0, 100);
  const cursor = /^\d{1,18}$/.test(String(before || '')) ? String(before) : null;
  try {
    // Keep 12 months.
    await query(`delete from app.free_scans where created_at < now() - interval '12 months'`);
    const [totals] = await query(
      `select count(*) filter (where created_at > now() - interval '1 day')::int as day,
              count(*) filter (where created_at > now() - interval '7 days')::int as week,
              count(*) filter (where created_at > now() - interval '30 days')::int as month,
              count(distinct hostname) filter (where created_at > now() - interval '30 days')::int as domains,
              count(*)::int as all_time
         from app.free_scans`,
    );
    const where = [`created_at > now() - make_interval(days => $1)`];
    const params = [range];
    if (search) {
      params.push(`%${search.replace(/[\\%_]/g, '\\$&')}%`);
      where.push(`(hostname like $${params.length} or lower(url) like $${params.length} or coalesce(source, '') like $${params.length})`);
    }
    const top = await query(
      `select hostname, count(*)::int as scans, max(created_at) as last_at
         from app.free_scans where ${where.join(' and ')}
        group by hostname order by scans desc, last_at desc limit 15`,
      params,
    );
    const pages = await query(
      `select coalesce(source, '(unknown)') as source, count(*)::int as scans
         from app.free_scans where ${where.join(' and ')}
        group by 1 order by scans desc limit 15`,
      params,
    );
    if (cursor) {
      params.push(cursor);
      where.push(`id < $${params.length}`);
    }
    const rows = await query(
      `select id::text, url, final_url as "finalUrl", hostname, standard, source, country, status, engine, issues, critical, serious, error, created_at as "createdAt"
         from app.free_scans where ${where.join(' and ')}
        order by id desc limit ${PAGE_SIZE + 1}`,
      params,
    );
    const more = rows.length > PAGE_SIZE;
    return { totals, top, pages, scans: rows.slice(0, PAGE_SIZE), next: more ? rows[PAGE_SIZE - 1].id : null, days: range };
  } catch (err) {
    if (MISSING.has(err?.code)) {
      throw new AppError(503, 'Free scan logging needs a database update. Run supabase/migrations/0011_free_scans.sql in Supabase.', 'migration_needed');
    }
    throw err;
  }
}

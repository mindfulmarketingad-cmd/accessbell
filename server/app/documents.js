// PDF documents: found on a domain's pages, checked for accessibility, and
// prepared for remediation in the dashboard.
import { query, one } from './db.js';
import { requireRole, requireSubscription } from './accounts.js';
import { getDomain } from './domains.js';
import { AppError, badRequest, notFound } from './errors.js';
import { fetchPage } from '../fetch-page.js';
import { assertSafeUrl } from '../net-guard.js';
import { auditPdf } from '../pdf-audit.js';

export const MAX_DOCUMENTS = 500;
// The file is returned to the dashboard for remediation; responses must stay under 4.5 MB.
const MAX_INLINE_BYTES = 3 * 1024 * 1024;
const MISSING = new Set(['42P01', '42703']);

export const isPdfUrl = (u) => {
  try {
    return /\.pdf$/i.test(new URL(u).pathname);
  } catch {
    return false;
  }
};

async function needsMigration(run) {
  try {
    return await run();
  } catch (err) {
    if (MISSING.has(err?.code)) throw new AppError(503, 'PDF scanning needs a database update. Run supabase/migrations/0009_documents.sql in Supabase.', 'migration_needed');
    throw err;
  }
}

const sameSite = (a, b) => a.replace(/^www\./, '') === b.replace(/^www\./, '') || a.endsWith(`.${b.replace(/^www\./, '')}`);

/**
 * Save PDF links found on a page. Only PDFs on the domain (or its subdomains)
 * are kept, up to MAX_DOCUMENTS per domain. Best effort: never fails a scan.
 */
export async function recordDocuments(domain, foundOn, urls) {
  const clean = [];
  for (const u of new Set(urls || [])) {
    try {
      const url = new URL(u);
      if (!['http:', 'https:'].includes(url.protocol) || !isPdfUrl(url.toString())) continue;
      if (!sameSite(url.hostname, domain.hostname)) continue;
      url.hash = '';
      clean.push(url.toString());
    } catch {}
  }
  if (!clean.length) return 0;
  try {
    const rows = await query(
      `insert into app.documents (domain_id, url, found_on)
       select $1, u, $3 from unnest($2::text[]) as u
        where (select count(*) from app.documents where domain_id = $1) < ${MAX_DOCUMENTS}
       on conflict (domain_id, url) do nothing returning id`,
      [domain.id, clean.slice(0, 100), foundOn ? String(foundOn).slice(0, 2048) : null],
    );
    return rows.length;
  } catch (err) {
    if (!MISSING.has(err?.code)) console.error('saving documents failed:', err.message);
    return 0;
  }
}

const summary = (d) => ({
  id: d.id,
  url: d.url,
  foundOn: d.found_on,
  status: d.status,
  bytes: d.bytes,
  pages: d.pages,
  title: d.title,
  lang: d.lang,
  tagged: d.tagged,
  issuesCount: d.issues_count,
  worst: (d.issues || [])[0]?.impact || null,
  error: d.error,
  checkedAt: d.checked_at,
});

export async function listDocuments(ctx, domainId) {
  const domain = await getDomain(ctx, domainId);
  return needsMigration(async () => {
    const rows = await query(
      `select id, url, found_on, status, bytes, pages, title, lang, tagged, issues, issues_count, error, checked_at
         from app.documents where domain_id = $1 order by coalesce(issues_count, -1) desc, url asc`,
      [domain.id],
    );
    return { documents: rows.map(summary), limit: MAX_DOCUMENTS };
  });
}

async function getDoc(ctx, docId) {
  if (!/^[0-9a-f-]{36}$/i.test(String(docId || ''))) throw notFound('Document not found.');
  const row = await needsMigration(() =>
    one(
      `select doc.*, d.hostname from app.documents doc join app.domains d on d.id = doc.domain_id
        where doc.id = $1 and d.account_id = $2`,
      [docId, ctx.account.id],
    ),
  );
  if (!row) throw notFound('Document not found.');
  return row;
}

export async function getDocument(ctx, docId) {
  const d = await getDoc(ctx, docId);
  return { document: { ...summary(d), issues: d.issues || [], passes: d.passes || [] } };
}

/** Add a PDF by address, for files that are not linked from a scanned page. */
export async function addDocument(ctx, domainId, url) {
  requireRole(ctx, 'member');
  requireSubscription(ctx);
  const domain = await getDomain(ctx, domainId);
  let u;
  try {
    u = assertSafeUrl(/^https?:\/\//i.test(String(url || '').trim()) ? String(url).trim() : `https://${String(url || '').trim()}`);
  } catch {
    throw badRequest('Enter the full address of the PDF, such as https://example.com/files/menu.pdf.');
  }
  if (!sameSite(u.hostname, domain.hostname)) throw badRequest(`The PDF must be on ${domain.hostname}.`);
  return needsMigration(async () => {
    const [{ n }] = await query('select count(*)::int as n from app.documents where domain_id = $1', [domain.id]);
    if (n >= MAX_DOCUMENTS) throw badRequest(`A domain can track up to ${MAX_DOCUMENTS} PDFs.`);
    u.hash = '';
    const row = await one(
      `insert into app.documents (domain_id, url) values ($1, $2)
       on conflict (domain_id, url) do update set url = excluded.url returning *`,
      [domain.id, u.toString()],
    );
    return { document: summary(row) };
  });
}

/** Download a PDF and check it. Failures are stored so the list can show them. */
export async function scanDocument(ctx, docId, { fetcher = fetchPage } = {}) {
  requireRole(ctx, 'member');
  requireSubscription(ctx);
  const d = await getDoc(ctx, docId);
  let result;
  let bytes = null;
  try {
    const file = await fetcher(d.url, { kind: 'pdf' });
    bytes = file.body.length;
    result = await auditPdf(file.body);
  } catch (err) {
    const message = err?.expose ? err.message : 'The PDF could not be downloaded or read.';
    const row = await one(
      `update app.documents set status = 'failed', error = $2, bytes = coalesce($3, bytes), checked_at = now() where id = $1 returning *`,
      [d.id, message.slice(0, 300), bytes],
    );
    return { document: { ...summary(row), issues: [], passes: [] } };
  }
  const row = await one(
    `update app.documents
        set status = 'done', error = null, bytes = $2, pages = $3, title = $4, lang = $5, tagged = $6,
            issues = $7, issues_count = $8, passes = $9, checked_at = now()
      where id = $1 returning *`,
    [d.id, bytes, result.pages, result.title, result.lang, result.tagged, JSON.stringify(result.issues), result.issues.length, JSON.stringify(result.passes)],
  );
  return { document: { ...summary(row), issues: result.issues, passes: result.passes } };
}

/** The PDF's bytes (base64), so the dashboard can prepare a fixed copy. Small files only. */
export async function documentFile(ctx, docId, { fetcher = fetchPage } = {}) {
  requireRole(ctx, 'member');
  requireSubscription(ctx);
  const d = await getDoc(ctx, docId);
  const file = await fetcher(d.url, { kind: 'pdf' });
  if (file.body.length > MAX_INLINE_BYTES) {
    throw new AppError(413, 'This PDF is larger than 3 MB. Choose the file from your computer to fix it.', 'too_large');
  }
  const name = decodeURIComponent(new URL(d.url).pathname.split('/').pop() || 'document.pdf');
  return { name, base64: Buffer.from(file.body).toString('base64') };
}

export async function removeDocument(ctx, docId) {
  requireRole(ctx, 'member');
  const d = await getDoc(ctx, docId);
  await query('delete from app.documents where id = $1', [d.id]);
  return { status: 'removed' };
}

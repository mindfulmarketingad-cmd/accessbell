// Running and storing scans for monitored pages.
import { query, one } from './db.js';
import { LIMITS } from './config.js';
import { AppError, notFound } from './errors.js';
import { requireRole, requireSubscription } from './accounts.js';
import { getPage, DEFAULT_SETTINGS } from './domains.js';
import { browserAudit, sanitizeHeaders } from '../browser-audit.js';
import { audit } from '../audit.js';
import { fetchPage } from '../fetch-page.js';
import { UnsafeUrlError } from '../net-guard.js';
import { tagsFor, standardFor } from '../wcag.js';

/** Run one device scan. Browser first; HTML audit if the browser is unavailable. */
export async function runAudit(url, settings, device, { browser = browserAudit, fetcher = fetchPage } = {}) {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  const standard = standardFor(s.wcagVersion, s.wcagLevel);
  const headerMap = sanitizeHeaders(s.headers);
  if (process.env.BROWSER_WS_ENDPOINT) {
    try {
      return await browser(url, {
        standard,
        tags: tagsFor(s.wcagVersion, s.wcagLevel),
        device,
        headers: headerMap,
        delayMs: s.delayMs,
        scroll: s.scroll,
      });
    } catch (err) {
      if (err instanceof UnsafeUrlError) throw err;
      console.warn('browser scan failed, using HTML audit:', String(err?.message || err).split('\n')[0].replace(/(token|apiKey|key)=[^&\s]+/gi, '$1=***'));
    }
  }
  const page = await fetcher(url);
  const report = audit(page.html, { standard: 'wcag22' });
  return { ...report, finalUrl: page.finalUrl, device, engine: 'html', standard };
}

/**
 * Scan a page on every configured device, store the results as audit
 * evidence, and update the page's latest score. Returns the stored scans.
 */
export async function scanPage(page, { accountId, trigger = 'manual', userId = null, deps } = {}) {
  const settings = { ...DEFAULT_SETTINGS, ...page.settings };
  const stored = [];
  for (const device of settings.devices) {
    let row;
    try {
      const r = await runAudit(page.url, settings, device, deps);
      row = await one(
        `insert into app.scans (account_id, domain_id, page_id, device, status, engine, standard, score, issues_count,
                                summary, issues, passes, review, notes, final_url, trigger, created_by)
         values ($1, $2, $3, $4, 'done', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         returning id, device, status, score, issues_count, created_at`,
        [
          accountId, page.domain_id, page.id, device, r.engine, r.standard?.label || null, r.score, r.summary.issues,
          JSON.stringify(r.summary), JSON.stringify(r.issues), JSON.stringify(r.passes),
          JSON.stringify(r.review || []), JSON.stringify(r.notes || []), r.finalUrl, trigger, userId,
        ],
      );
    } catch (err) {
      const message = err?.expose ? err.message : 'The page could not be scanned.';
      row = await one(
        `insert into app.scans (account_id, domain_id, page_id, device, status, error, trigger, created_by)
         values ($1, $2, $3, $4, 'failed', $5, $6, $7)
         returning id, device, status, error, created_at`,
        [accountId, page.domain_id, page.id, device, message, trigger, userId],
      );
    }
    stored.push(row);
  }

  const done = stored.filter((s) => s.status === 'done');
  if (done.length) {
    // The page's headline numbers use its worst device result.
    const worst = done.reduce((a, b) => (b.score < a.score ? b : a));
    await query(
      `update app.pages set last_scan_id = $2, last_score = $3, last_issues = $4, last_scanned_at = now() where id = $1`,
      [page.id, worst.id, worst.score, Math.max(...done.map((d) => d.issues_count))],
    );
  }
  return stored;
}

/** Dashboard "Rescan" for one page. */
export async function rescanPage(ctx, pageId) {
  requireRole(ctx, 'member');
  requireSubscription(ctx);
  const page = await getPage(ctx, pageId);
  if (!page.monitored) throw new AppError(400, 'Start monitoring this page before scanning it.', 'not_monitored');
  const recent = await one(
    `select count(*)::int as n from app.scans where account_id = $1 and created_at > now() - interval '1 hour'`,
    [ctx.account.id],
  );
  if (recent.n >= LIMITS.scansPerAccountPerHour) {
    throw new AppError(429, 'You have run a very large number of scans in the last hour. Please wait a little and try again.', 'fair_use');
  }
  return scanPage(page, { accountId: ctx.account.id, trigger: 'manual', userId: ctx.user.id });
}

/** Full report for one stored scan. */
export async function getScan(ctx, scanId) {
  if (!/^[0-9a-f-]{36}$/i.test(String(scanId || ''))) throw notFound('Scan not found.');
  const scan = await one(
    `select s.*, p.url, d.hostname, d.id as domain_id
       from app.scans s
       join app.pages p on p.id = s.page_id
       join app.domains d on d.id = s.domain_id
      where s.id = $1 and s.account_id = $2`,
    [scanId, ctx.account.id],
  );
  if (!scan) throw notFound('Scan not found.');
  return scan;
}

/** Scan history for a page (audit evidence). */
export async function pageHistory(ctx, pageId) {
  const page = await getPage(ctx, pageId);
  const scans = await query(
    `select id, device, status, engine, standard, score, issues_count, error, trigger, created_at
       from app.scans where page_id = $1
      order by created_at desc limit 100`,
    [page.id],
  );
  return { page: { id: page.id, url: page.url, monitored: page.monitored, domainId: page.domain_id, hostname: page.hostname }, scans };
}

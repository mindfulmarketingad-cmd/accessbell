// Domain-audit crawl for one-time purchases: discover up to 500 same-host
// pages from the sitemap and the home page's links, scan each one with the
// same engine as the free scan (real browser when configured, HTML audit as
// fallback), and aggregate the findings by rule. Pages that fail to load are
// recorded and skipped; they never fail the whole audit.
import { readSitemaps, linksFromHtml } from './app/domains.js';
import { browserAudit } from './browser-audit.js';
import { audit, scoreFrom } from './audit.js';
import { fetchPage } from './fetch-page.js';

const MAX_PAGES = 500;
const SKIP_EXT = /\.(pdf|jpe?g|png|gif|webp|svg|ico|zip|gz|mp4|mp3|webm|css|js|json|xml|txt|docx?|xlsx?|pptx?)$/i;
const CONCURRENCY = 3;

async function htmlAudit(url, standard) {
  const page = await fetchPage(url);
  return { finalUrl: page.finalUrl, engine: 'html', ...audit(page.html, { standard }) };
}

async function scanPage(url) {
  if (process.env.BROWSER_WS_ENDPOINT) {
    try {
      return await browserAudit(url, { standard: 'wcag22' });
    } catch {
      return htmlAudit(url, 'wcag22');
    }
  }
  return htmlAudit(url, 'wcag22');
}

/** Same-host pages for the audit: the base URL first, then sitemap, then home-page links. */
export async function discoverOneTimeUrls(baseUrl) {
  const base = new URL(baseUrl);
  const origin = base.origin;
  const seen = new Set();
  const out = [];
  const consider = (u) => {
    let url;
    try {
      url = new URL(u);
    } catch {
      return;
    }
    if (!['http:', 'https:'].includes(url.protocol)) return;
    if (url.hostname !== base.hostname) return;
    if (SKIP_EXT.test(url.pathname)) return;
    url.hash = '';
    const key = url.toString();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(key);
  };
  consider(base.toString());
  try {
    const fromSitemap = await readSitemaps(origin, fetchPage, []);
    fromSitemap.forEach(consider);
  } catch {}
  try {
    const home = await fetchPage(`${origin}/`);
    linksFromHtml(home.html, home.finalUrl).forEach(consider);
  } catch {}
  return out.slice(0, MAX_PAGES);
}

/** Scan a list of URLs with a small worker pool. Returns per-page results in input order. */
export async function scanOneTimeUrls(urls) {
  const results = new Array(urls.length);
  let next = 0;
  const worker = async () => {
    while (next < urls.length) {
      const i = next++;
      const url = urls[i];
      try {
        const report = await scanPage(url);
        const s = report.summary || {};
        results[i] = {
          url,
          ok: true,
          issues: s.issues || 0,
          critical: s.critical || 0,
          serious: s.serious || 0,
          moderate: s.moderate || 0,
          minor: s.minor || 0,
          score: report.score ?? scoreFrom(report.issues || []),
          issuesDetail: report.issues || [],
        };
      } catch (err) {
        results[i] = { url, ok: false, error: String((err && err.message) || err).slice(0, 200) };
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, urls.length) }, worker));
  return results;
}

/** Aggregate per-page findings into one domain report. Samples stay bounded. */
export function aggregateOneTimeReport({ hostname, url, pageResults }) {
  const byRule = new Map();
  const pages = [];
  const summary = { issues: 0, critical: 0, serious: 0, moderate: 0, minor: 0, rulesFailed: 0 };
  let failed = 0;
  for (const p of pageResults) {
    if (!p.ok) {
      failed++;
      pages.push({ url: p.url, error: p.error });
      continue;
    }
    summary.issues += p.issues;
    summary.critical += p.critical;
    summary.serious += p.serious;
    summary.moderate += p.moderate;
    summary.minor += p.minor;
    pages.push({ url: p.url, issues: p.issues, critical: p.critical, serious: p.serious, score: p.score });
    for (const issue of p.issuesDetail) {
      const key = issue.id || issue.title;
      let agg = byRule.get(key);
      if (!agg) {
        agg = {
          id: issue.id || null,
          title: issue.title,
          impact: issue.impact,
          wcag: issue.wcag || [],
          fix: issue.fix || '',
          helpUrl: issue.helpUrl || null,
          pagesAffected: 0,
          elementsAffected: 0,
          samples: [],
        };
        byRule.set(key, agg);
      }
      agg.pagesAffected++;
      agg.elementsAffected += issue.count || 0;
      for (const s of issue.samples || []) {
        if (agg.samples.length < 3 && !agg.samples.includes(s)) agg.samples.push(s);
      }
    }
  }
  const IMPACT_ORDER = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  const issues = [...byRule.values()].sort(
    (a, b) => (IMPACT_ORDER[a.impact] ?? 9) - (IMPACT_ORDER[b.impact] ?? 9) || b.elementsAffected - a.elementsAffected,
  );
  summary.rulesFailed = issues.length;
  return {
    product: 'domain_audit',
    hostname,
    url,
    standard: 'WCAG 2.2 AA',
    scannedAt: new Date().toISOString(),
    pagesScanned: pageResults.length - failed,
    pagesFailed: failed,
    summary,
    pages,
    issues,
  };
}

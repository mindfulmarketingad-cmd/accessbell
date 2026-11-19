// Domain-audit crawl for one-time purchases: discover up to 500 same-host
// pages from the sitemap, the home page's HTML, and (when Browserless is
// configured) links rendered in a real browser. Scan each one with the same
// engine as the free scan. Pages that fail to load are recorded and skipped.
//
// Pages are scanned one at a time on a single Browserless connection. The free
// plan allows two concurrent browsers; opening one per page (previously three
// at a time) returned 429 from connectOverCDP, and the worker that failed
// fastest then drained the rest of the queue into the HTML checker.
//
// A paid audit that falls back to the HTML checker because the browser failed
// is marked degraded. The caller stores it as failed and alerts the owner
// instead of emailing the buyer that a finished browser audit is ready.
import { readSitemaps, linksFromHtml } from './app/domains.js';
import { browserAudit, collectRenderedHrefs, createBrowserLease } from './browser-audit.js';
import { audit, scoreFrom } from './audit.js';
import { fetchPage } from './fetch-page.js';
import { redactSecrets } from './redact.js';

const MAX_PAGES = 500;
const SKIP_EXT = /\.(pdf|jpe?g|png|gif|webp|svg|ico|zip|gz|mp4|mp3|webm|css|js|json|xml|txt|docx?|xlsx?|pptx?)$/i;

/**
 * Pages per Inngest step. Two serial browser scans, plus one 429 backoff
 * (5s + 15s + 30s) and at most one extra connect, stay under the 300s
 * function limit and under Browserless's two-minute session.
 */
export const ONE_TIME_SCAN_BATCH = 2;

/** Our own "HTTP 404" means the target site responded. Browserless errors do not use this prefix. */
export function isTargetHttpError(message) {
  return /^HTTP \d{3}\b/.test(String(message || ''));
}

/**
 * Browserless auth (401), rate limit (429) and connection failures.
 * A normal target-site status such as HTTP 404 is not one of these.
 * 401 and 429 count even when they are written as "HTTP 401", because that
 * is how a rejected browser session shows up.
 */
export function isBrowserServiceFailure(message) {
  const s = String(message || '');
  if (!s) return false;
  if (/(?:^|[^\d])(401|429)(?:[^\d]|$)/.test(s)) return true;
  if (isTargetHttpError(s)) return false;
  return /wss?:\/\/\[redacted\]|browserless|connectOverCDP|websocket|ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND|Unexpected server response/i.test(s);
}

async function htmlAudit(url, standard, fetchImpl = fetchPage) {
  const page = await fetchImpl(url);
  return { finalUrl: page.finalUrl, engine: 'html', ...audit(page.html, { standard }) };
}

/**
 * One page of a paid check. Uses the browser when BROWSER_WS_ENDPOINT is set.
 * A browser failure falls back to the HTML checker and returns a redacted reason.
 * deps.browserAudit and deps.fetchPage are test seams.
 */
export async function runPaidCheck(url, deps = {}) {
  const browser = deps.browserAudit || browserAudit;
  const fetchImpl = deps.fetchPage || fetchPage;
  if (deps.browserError) {
    const browserFallback = redactSecrets(deps.browserError?.message || deps.browserError);
    try {
      const report = await htmlAudit(url, 'wcag22', fetchImpl);
      return { report, browserFallback };
    } catch (htmlErr) {
      const error = new Error(redactSecrets(htmlErr?.message || htmlErr));
      error.browserFallback = browserFallback;
      throw error;
    }
  }
  if (process.env.BROWSER_WS_ENDPOINT || deps.session || deps.endpoint) {
    try {
      const report = await browser(url, {
        standard: 'wcag22',
        session: deps.session,
        endpoint: deps.endpoint,
        connect: deps.connect,
        sleep: deps.sleep,
        delays: deps.delays,
      });
      return { report, browserFallback: null };
    } catch (err) {
      const browserFallback = redactSecrets(err?.message || err);
      try {
        const report = await htmlAudit(url, 'wcag22', fetchImpl);
        return { report, browserFallback };
      } catch (htmlErr) {
        const error = new Error(redactSecrets(htmlErr?.message || htmlErr));
        error.browserFallback = browserFallback;
        throw error;
      }
    }
  }
  return { report: await htmlAudit(url, 'wcag22', fetchImpl), browserFallback: null };
}

/** Same-host pages for the audit: the base URL first, then sitemap, home-page links, then rendered links. */
export async function discoverOneTimeUrls(baseUrl, deps = {}) {
  const fetchImpl = deps.fetchPage || fetchPage;
  const readMaps = deps.readSitemaps || readSitemaps;
  const links = deps.linksFromHtml || linksFromHtml;
  const rendered = deps.renderedLinks || collectRenderedHrefs;
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
    const fromSitemap = await readMaps(origin, fetchImpl, []);
    fromSitemap.forEach(consider);
  } catch {}
  try {
    const home = await fetchImpl(`${origin}/`);
    links(home.html, home.finalUrl).forEach(consider);
  } catch {}
  let browserDiscoveryError = null;
  // SPAs such as Base44 ship an empty shell. Read anchors after the browser has loaded the page.
  if (process.env.BROWSER_WS_ENDPOINT) {
    try {
      const hrefs = await rendered(base.toString());
      for (const href of (Array.isArray(hrefs) ? hrefs : []).slice(0, 1000)) consider(href);
    } catch (err) {
      browserDiscoveryError = redactSecrets(err?.message || err);
    }
  }
  return { urls: out.slice(0, MAX_PAGES), browserDiscoveryError };
}

/**
 * Scan URLs one at a time, in input order, on one Browserless connection.
 * A 429 while opening that connection is retried (5s, 15s, 30s). If it still
 * fails, every page in this batch uses the HTML checker and records the
 * redacted reason. No further connections are opened.
 * deps.browserAudit skips the shared connection so tests can replace the scan.
 * deps.connect replaces connectOverCDP for tests.
 */
export async function scanOneTimeUrls(urls, deps = {}) {
  const results = new Array(urls.length);
  if (!urls.length) return results;
  const endpoint = deps.endpoint ?? process.env.BROWSER_WS_ENDPOINT;
  const customAudit = typeof deps.browserAudit === 'function';
  const manageSession = typeof deps.connect === 'function' || (Boolean(endpoint) && !customAudit);
  const lease = manageSession
    ? createBrowserLease({
        endpoint,
        connect: deps.connect,
        sleep: deps.sleep,
        delays: deps.delays,
        budgetMs: deps.budgetMs,
        now: deps.now,
      })
    : null;
  try {
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      let session = null;
      let browserError = null;
      if (lease) {
        const held = await lease.current();
        session = held.session;
        browserError = held.error;
      }
      try {
        const { report, browserFallback } = await runPaidCheck(url, { ...deps, session, browserError });
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
          ...(browserFallback ? { browserFallback } : {}),
        };
      } catch (err) {
        results[i] = {
          url,
          ok: false,
          error: redactSecrets(err?.message || err).slice(0, 200),
          ...(err?.browserFallback ? { browserFallback: err.browserFallback } : {}),
        };
      }
    }
  } finally {
    if (lease) await lease.close();
  }
  return results;
}

/** Aggregate per-page findings into one domain report. Samples stay bounded. */
export function aggregateOneTimeReport({ hostname, url, pageResults, browserDiscoveryError = null }) {
  const byRule = new Map();
  const pages = [];
  const summary = { issues: 0, critical: 0, serious: 0, moderate: 0, minor: 0, rulesFailed: 0 };
  let failed = 0;
  for (const p of pageResults) {
    if (!p.ok) {
      failed++;
      pages.push({ url: p.url, error: p.error, ...(p.browserFallback ? { browserFallback: p.browserFallback } : {}) });
      continue;
    }
    summary.issues += p.issues;
    summary.critical += p.critical;
    summary.serious += p.serious;
    summary.moderate += p.moderate;
    summary.minor += p.minor;
    pages.push({
      url: p.url,
      issues: p.issues,
      critical: p.critical,
      serious: p.serious,
      score: p.score,
      ...(p.browserFallback ? { browserFallback: p.browserFallback } : {}),
    });
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
  const fallbacks = pageResults.filter((p) => p.browserFallback);
  const serviceFailure = fallbacks.some((p) => isBrowserServiceFailure(p.browserFallback));
  // Every page used the HTML checker, or the browser could not find any other pages.
  const browserNeverRan = pageResults.length > 0 && fallbacks.length > 0 && pageResults.every((p) => !p.ok || p.browserFallback);
  const discoveryCollapsed = Boolean(browserDiscoveryError) && pageResults.length <= 1;
  const degraded = serviceFailure || browserNeverRan || discoveryCollapsed;
  const browserFallback =
    fallbacks.length || browserDiscoveryError
      ? {
          reason:
            fallbacks.find((p) => isBrowserServiceFailure(p.browserFallback))?.browserFallback ||
            fallbacks[0]?.browserFallback ||
            browserDiscoveryError,
          pages: fallbacks.length,
          discovery: browserDiscoveryError,
        }
      : null;
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
    degraded,
    ...(browserFallback ? { browserFallback } : {}),
  };
}

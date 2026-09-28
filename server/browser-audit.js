// Real-browser accessibility audit: axe-core running in remote Chromium.
//
// The browser is hosted (for example Browserless) and reached through the
// BROWSER_WS_ENDPOINT environment variable. Because pages render in a real
// browser, this catches issues the HTML-only audit cannot: color contrast,
// ARIA state and content rendered by JavaScript.
import axe from 'axe-core';
import { chromium } from 'playwright-core';
import { assertSafeUrl } from './net-guard.js';
import { STANDARDS, scoreFrom } from './audit.js';
import { criterion } from './wcag-criteria.js';

const LIMITS = {
  connectMs: 10_000,
  navigationMs: 20_000,
  settleMs: 5_000,
  maxSamples: 3,
};

// Which axe tags to run for each standard the visitor can pick.
const TAGS = {
  wcag20: ['wcag2a', 'wcag2aa'],
  wcag21: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  wcag22: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
};
const TAGS_FOR_STANDARD = {
  wcag22: TAGS.wcag22,
  wcag21: TAGS.wcag21,
  ada: TAGS.wcag21,
  en301549: TAGS.wcag21,
  section508: TAGS.wcag20,
};

const IMPACT_ORDER = { critical: 0, serious: 1, moderate: 2, minor: 3 };

/** "wcag143" -> "1.4.3", "wcag1410" -> "1.4.10", "wcag2411" -> "2.4.11" */
export function scFromTag(tag) {
  const m = /^wcag(\d)(\d)(\d{1,2})$/.exec(tag);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : null;
}

function wcagRefs(tags) {
  const tagLevel = tags.some((t) => /^wcag2\d*aaa$/.test(t)) ? 'AAA' : tags.some((t) => /^wcag2\d*aa$/.test(t)) ? 'AA' : 'A';
  const refs = tags
    .map(scFromTag)
    .filter(Boolean)
    .map((sc) => criterion(sc) || { sc, name: '', level: tagLevel, version: null, principle: null });
  return refs.length ? refs : [{ sc: 'Best practice', name: '', level: '-', version: null, principle: null }];
}

const clip = (s, n) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 3) + '...' : t;
};

// Only link to axe's documentation site.
const safeHelpUrl = (u) => (/^https:\/\/dequeuniversity\.com\//.test(u || '') ? u : undefined);

function fixText(node) {
  // failureSummary looks like "Fix any of the following:\n  Element has no alt attribute\n  ..."
  const lines = String(node?.failureSummary || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !/^Fix (any|all) of the following:?$/i.test(l));
  return lines.length ? lines.slice(0, 3).map((l) => l.replace(/\.+$/, '')).join('. ') + '.' : '';
}

/**
 * Convert raw axe results into the report shape the website renders.
 * `standard` is a free-scan standard id or a { id, label } object.
 */
export function mapAxeResults(results, standard = 'wcag22') {
  const std = typeof standard === 'object' ? standard : STANDARDS[standard] || STANDARDS.wcag22;

  const issues = results.violations
    .map((v) => ({
      id: v.id,
      title: v.help,
      description: v.description,
      fix: fixText(v.nodes[0]) || 'See the linked guidance for how to fix this issue.',
      impact: v.impact || 'moderate',
      wcag: wcagRefs(v.tags),
      count: v.nodes.length,
      samples: v.nodes.slice(0, LIMITS.maxSamples).map((n) => clip(n.html, 220)),
      helpUrl: safeHelpUrl(v.helpUrl),
    }))
    .sort((a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact] || b.count - a.count);

  const passes = results.passes.map((p) => ({ id: p.id, title: p.help, wcag: wcagRefs(p.tags) }));

  // "Incomplete" = axe found something it cannot decide automatically.
  const review = results.incomplete.map((r) => ({
    id: r.id,
    title: r.help,
    wcag: wcagRefs(r.tags),
    count: r.nodes.length,
    helpUrl: safeHelpUrl(r.helpUrl),
  }));

  const summary = { critical: 0, serious: 0, moderate: 0, minor: 0, issues: 0, rulesFailed: issues.length, rulesPassed: passes.length };
  for (const i of issues) {
    summary[i.impact] += i.count;
    summary.issues += i.count;
  }

  const notes = [
    `Tested in a real browser with axe-core ${results.testEngine?.version || axe.version}. Automated testing finds many, but not all, WCAG failures.`,
  ];
  if (std.id === 'section508') notes.push('Section 508 incorporates WCAG 2.0 Level AA, so only WCAG 2.0 rules were run.');

  if (std.id.endsWith('-AAA')) {
    notes.push('Few Level AAA criteria can be tested automatically. Use the assisted manual testing procedures for the rest.');
  }
  return { engine: 'browser', standard: std, score: scoreFrom(issues), summary, issues, passes, review, notes };
}

export const DEVICES = {
  desktop: { viewport: { width: 1280, height: 900 } },
  mobile: {
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  },
};

const BLOCKED_HEADERS = new Set([
  'host', 'content-length', 'connection', 'transfer-encoding', 'upgrade', 'te', 'trailer',
  'keep-alive', 'expect', 'origin', 'referer',
]);

/** Keep only safe, well-formed custom headers (max 10). */
export function sanitizeHeaders(list) {
  const out = {};
  for (const h of Array.isArray(list) ? list.slice(0, 10) : []) {
    const name = String(h?.name || '').trim().toLowerCase();
    const value = String(h?.value ?? '');
    if (!/^[a-z0-9-]{1,64}$/.test(name) || BLOCKED_HEADERS.has(name) || name.startsWith('proxy-') || name.startsWith('sec-')) continue;
    if (value.length > 2048 || /[\r\n\0]/.test(value)) continue;
    out[name] = value;
  }
  return out;
}

const sameSite = (host, target) => host === target || host.endsWith('.' + target);

/**
 * Load the page in remote Chromium and run axe-core.
 * Throws UnsafeUrlError for disallowed targets; any other error means the
 * browser path failed and the caller should fall back to the HTML audit.
 *
 * Options: standard (free-scan id or { id, label }), tags, device,
 * headers (sent only to the scanned site's own host), delayMs, scroll.
 */
export async function browserAudit(
  input,
  { standard = 'wcag22', tags, device = 'desktop', headers = {}, delayMs = 0, scroll = false, endpoint = process.env.BROWSER_WS_ENDPOINT } = {},
) {
  if (!endpoint) throw new Error('BROWSER_WS_ENDPOINT is not set');
  const url = assertSafeUrl(input);
  const siteHost = url.hostname.replace(/^www\./, '');
  const extraHeaders = Object.keys(headers).length ? headers : null;

  const browser = await chromium.connectOverCDP(endpoint, { timeout: LIMITS.connectMs });
  try {
    // bypassCSP lets axe run on sites whose own Content-Security-Policy would block it.
    const context = await browser.newContext({
      ...(DEVICES[device] || DEVICES.desktop),
      bypassCSP: true,
      userAgent: `Mozilla/5.0 (compatible; AccessBellBot/1.0; +https://accessbell.co/about)${device === 'mobile' ? ' Mobile' : ''}`,
    });
    const page = await context.newPage();

    await page.route('**/*', (route) => {
      const req = route.request();
      // Skip heavy assets that do not affect the audit.
      if (['image', 'media', 'font'].includes(req.resourceType())) return route.abort();
      // Never let the page navigate a frame to a private or internal address.
      if (req.isNavigationRequest()) {
        try {
          assertSafeUrl(req.url());
        } catch {
          return route.abort('blockedbyclient');
        }
      }
      // Custom headers (for example staging credentials) never go to third parties.
      if (extraHeaders) {
        let host = '';
        try {
          host = new URL(req.url()).hostname.replace(/^www\./, '');
        } catch {}
        if (sameSite(host, siteHost)) return route.continue({ headers: { ...req.headers(), ...extraHeaders } });
      }
      return route.continue();
    });

    const response = await page.goto(url.toString(), { waitUntil: 'domcontentloaded', timeout: LIMITS.navigationMs });
    if (response && response.status() >= 400) throw new Error(`HTTP ${response.status()}`);
    await page.waitForLoadState('load', { timeout: LIMITS.settleMs }).catch(() => {});

    if (scroll) {
      // Scroll through the page so lazy-loaded content renders, then return to the top.
      await page
        .evaluate(async () => {
          const step = Math.max(200, window.innerHeight * 0.8);
          for (let y = 0, i = 0; y < document.body.scrollHeight && i < 40; y += step, i++) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 120));
          }
          window.scrollTo(0, 0);
        })
        .catch(() => {});
    }
    const delay = Math.min(Math.max(Number(delayMs) || 0, 0), 10_000);
    if (delay) await page.waitForTimeout(delay);

    const finalUrl = page.url();
    assertSafeUrl(finalUrl);

    await page.evaluate(axe.source);
    const results = await page.evaluate(
      (t) => window.axe.run(document, { runOnly: { type: 'tag', values: t }, resultTypes: ['violations', 'incomplete'] }),
      tags || TAGS_FOR_STANDARD[standard] || TAGS.wcag22,
    );
    return { finalUrl, device, ...mapAxeResults(results, standard) };
  } finally {
    await browser.close().catch(() => {});
  }
}

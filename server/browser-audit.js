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
  const level = tags.some((t) => /^wcag2\d*aaa$/.test(t)) ? 'AAA' : tags.some((t) => /^wcag2\d*aa$/.test(t)) ? 'AA' : 'A';
  const refs = tags.map(scFromTag).filter(Boolean).map((sc) => ({ sc, name: '', level }));
  return refs.length ? refs : [{ sc: 'Best practice', name: '', level: '-' }];
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

/** Convert raw axe results into the report shape the website renders. */
export function mapAxeResults(results, standard = 'wcag22') {
  const std = STANDARDS[standard] || STANDARDS.wcag22;

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
  if (standard === 'section508') notes.push('Section 508 incorporates WCAG 2.0 Level AA, so only WCAG 2.0 rules were run.');

  return { engine: 'browser', standard: std, score: scoreFrom(issues), summary, issues, passes, review, notes };
}

/**
 * Load the page in remote Chromium and run axe-core.
 * Throws UnsafeUrlError for disallowed targets; any other error means the
 * browser path failed and the caller should fall back to the HTML audit.
 */
export async function browserAudit(input, { standard = 'wcag22', endpoint = process.env.BROWSER_WS_ENDPOINT } = {}) {
  if (!endpoint) throw new Error('BROWSER_WS_ENDPOINT is not set');
  const url = assertSafeUrl(input);

  const browser = await chromium.connectOverCDP(endpoint, { timeout: LIMITS.connectMs });
  try {
    // bypassCSP lets axe run on sites whose own Content-Security-Policy would block it.
    const context = await browser.newContext({
      bypassCSP: true,
      viewport: { width: 1280, height: 900 },
      userAgent: 'Mozilla/5.0 (compatible; AccessBellBot/1.0; +https://accessbell.co/about)',
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
      return route.continue();
    });

    const response = await page.goto(url.toString(), { waitUntil: 'domcontentloaded', timeout: LIMITS.navigationMs });
    if (response && response.status() >= 400) throw new Error(`HTTP ${response.status()}`);
    await page.waitForLoadState('load', { timeout: LIMITS.settleMs }).catch(() => {});

    const finalUrl = page.url();
    assertSafeUrl(finalUrl);

    await page.evaluate(axe.source);
    const results = await page.evaluate(
      (tags) => window.axe.run(document, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations', 'incomplete'] }),
      TAGS_FOR_STANDARD[standard] || TAGS.wcag22,
    );
    return { finalUrl, ...mapAxeResults(results, standard) };
  } finally {
    await browser.close().catch(() => {});
  }
}

// POST /api/scan  { url, standard } -> the issues found on one public page
//
// The free scan lists what is wrong: each issue's name, severity, WCAG
// criteria and how many elements are affected. The top 5 most severe issues
// are also shown in full (the failing code samples and the fix) as a teaser:
// seeing the exact problem and its fix is what turns a free scan into a
// one-time report purchase. Everything beyond the teaser, plus daily
// monitoring, is what a report or a subscription adds.
//
// Uses a real browser with axe-core when BROWSER_WS_ENDPOINT is configured,
// and falls back to the HTML-only audit if the browser is unavailable.
import { audit, STANDARDS } from '../server/audit.js';
import { browserAudit } from '../server/browser-audit.js';
import { fetchPage } from '../server/fetch-page.js';
import { UnsafeUrlError } from '../server/net-guard.js';
import { createRateLimiter } from '../server/rate-limit.js';
import { json, checkOrigin, clientIp, readJson, methodNotAllowed } from '../server/http.js';
import { recordFreeScan } from '../server/app/free-scans.js';

const perMinute = createRateLimiter({ limit: 5, windowMs: 60_000 });
const perHour = createRateLimiter({ limit: 30, windowMs: 60 * 60_000 });

async function htmlAudit(url, standard) {
  const page = await fetchPage(url);
  return { finalUrl: page.finalUrl, engine: 'html', ...audit(page.html, { standard }) };
}

const MAX_ISSUES = 30;
const MAX_TEASER = 5;

/** Issue names, severities and counts only: nothing that shows an element, its code or a fix. */
export function preview(report) {
  const s = report.summary || {};
  const n = (v) => (Number.isFinite(v) ? v : 0);
  return {
    preview: true,
    finalUrl: report.finalUrl,
    engine: report.engine,
    standard: report.standard ? { id: report.standard.id, label: report.standard.label } : undefined,
    summary: {
      issues: n(s.issues),
      critical: n(s.critical),
      serious: n(s.serious),
      moderate: n(s.moderate),
      minor: n(s.minor),
      rulesFailed: n(s.rulesFailed),
      rulesPassed: n(s.rulesPassed),
    },
    issues: (report.issues || []).slice(0, MAX_ISSUES).map((i) => ({
      title: String(i.title || '').slice(0, 200),
      impact: i.impact,
      count: n(i.count),
      wcag: (i.wcag || []).filter((c) => c && c.sc).map((c) => ({ sc: c.sc, name: c.name, level: c.level })),
    })),
    teaser: teaser(report),
  };
}

/**
 * The most severe issues in full: failing code samples and the fix. Issues
 * arrive sorted by severity then affected elements from both audit engines,
 * so the first entries are the ones that block users most. The rest of the
 * list stays names-only; the full detail for every issue is what the
 * one-time reports sell.
 */
export function teaser(report) {
  const n = (v) => (Number.isFinite(v) ? v : 0);
  return (report.issues || []).slice(0, MAX_TEASER).map((i) => ({
    title: String(i.title || '').slice(0, 200),
    impact: i.impact,
    count: n(i.count),
    wcag: (i.wcag || []).filter((c) => c && c.sc).map((c) => ({ sc: c.sc, name: c.name, level: c.level })),
    fix: String(i.fix || '').slice(0, 500),
    samples: (i.samples || []).slice(0, 2).map((s) => String(s).slice(0, 300)),
    helpUrl: typeof i.helpUrl === 'string' ? i.helpUrl : undefined,
  }));
}

export async function POST(request) {
  if (!checkOrigin(request)) return json(403, { error: 'Requests from this origin are not allowed.' });

  const ip = clientIp(request);
  for (const limiter of [perMinute, perHour]) {
    const rl = limiter(ip);
    if (!rl.allowed) {
      return json(429, { error: 'You have run too many scans. Please wait a few minutes and try again.' }, { 'Retry-After': String(rl.retryAfter) });
    }
  }

  const body = await readJson(request, 4096);
  if (!body || typeof body.url !== 'string' || body.url.length > 2048) {
    return json(400, { error: 'Enter a valid web address, such as https://example.com.' });
  }
  const url = body.url.trim();
  const standard = typeof body.standard === 'string' && Object.hasOwn(STANDARDS, body.standard) ? body.standard : 'wcag22';
  // Logged for the site owner: the domain, the checker page and the result. No IP address.
  const log = { url, standard, source: body.source, country: request.headers.get('x-vercel-ip-country') };

  try {
    let report;
    if (process.env.BROWSER_WS_ENDPOINT) {
      try {
        report = await browserAudit(url, { standard });
      } catch (err) {
        if (err instanceof UnsafeUrlError) throw err;
        // Browser unreachable, page failed to load, etc. The HTML audit
        // either succeeds or produces a clear, user-facing error.
        // Error text can contain the endpoint URL; never log its token.
        const reason = String((err && err.message) || err).split('\n')[0].replace(/(token|apiKey|key)=[^&\s]+/gi, '$1=***');
        console.warn('browser scan failed, using HTML audit:', reason);
        report = await htmlAudit(url, standard);
      }
    } else {
      report = await htmlAudit(url, standard);
    }
    await recordFreeScan({ ...log, report });
    return json(200, { url: body.url, scannedAt: new Date().toISOString(), ...preview(report) });
  } catch (err) {
    await recordFreeScan({ ...log, error: err && err.expose ? err.message : 'The scan could not be completed.' });
    if (err && err.expose) return json(err.status || 422, { error: err.message });
    console.error('scan failed', err);
    return json(500, { error: 'The scan could not be completed. Please try again.' });
  }
}

export function GET() {
  return methodNotAllowed('POST');
}

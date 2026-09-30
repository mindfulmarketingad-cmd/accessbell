// POST /api/scan  { url, standard } -> issue counts for one public page
//
// The free scan is a preview: it returns how many issues were found and how
// severe they are, never which ones. Subscribers see every issue, the failing
// code and the fix in the dashboard.
//
// Uses a real browser with axe-core when BROWSER_WS_ENDPOINT is configured,
// and falls back to the HTML-only audit if the browser is unavailable.
import { audit, STANDARDS } from '../server/audit.js';
import { browserAudit } from '../server/browser-audit.js';
import { fetchPage } from '../server/fetch-page.js';
import { UnsafeUrlError } from '../server/net-guard.js';
import { createRateLimiter } from '../server/rate-limit.js';
import { json, checkOrigin, clientIp, readJson, methodNotAllowed } from '../server/http.js';

const perMinute = createRateLimiter({ limit: 5, windowMs: 60_000 });
const perHour = createRateLimiter({ limit: 30, windowMs: 60 * 60_000 });

async function htmlAudit(url, standard) {
  const page = await fetchPage(url);
  return { finalUrl: page.finalUrl, engine: 'html', ...audit(page.html, { standard }) };
}

/** Counts only: nothing that names an issue, an element or a fix. */
export function preview(report) {
  const s = report.summary || {};
  const n = (v) => (Number.isFinite(v) ? v : 0);
  return {
    locked: true,
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
  };
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
    return json(200, { url: body.url, scannedAt: new Date().toISOString(), ...preview(report) });
  } catch (err) {
    if (err && err.expose) return json(err.status || 422, { error: err.message });
    console.error('scan failed', err);
    return json(500, { error: 'The scan could not be completed. Please try again.' });
  }
}

export function GET() {
  return methodNotAllowed('POST');
}

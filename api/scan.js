// POST /api/scan  { url, standard } -> accessibility report for one public page
import { audit, STANDARDS } from '../server/audit.js';
import { fetchPage } from '../server/fetch-page.js';
import { createRateLimiter } from '../server/rate-limit.js';
import { json, checkOrigin, clientIp, readJson, methodNotAllowed } from '../server/http.js';

const perMinute = createRateLimiter({ limit: 5, windowMs: 60_000 });
const perHour = createRateLimiter({ limit: 30, windowMs: 60 * 60_000 });

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
  const standard = typeof body.standard === 'string' && Object.hasOwn(STANDARDS, body.standard) ? body.standard : 'wcag22';

  try {
    const page = await fetchPage(body.url.trim());
    const report = audit(page.html, { standard });
    return json(200, { url: body.url, finalUrl: page.finalUrl, scannedAt: new Date().toISOString(), ...report });
  } catch (err) {
    if (err && err.expose) return json(err.status || 422, { error: err.message });
    console.error('scan failed', err);
    return json(500, { error: 'The scan could not be completed. Please try again.' });
  }
}

export function GET() {
  return methodNotAllowed('POST');
}

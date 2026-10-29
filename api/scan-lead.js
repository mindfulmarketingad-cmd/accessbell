// POST /api/scan-lead { email, url } -> stores a scan lead for follow-up.
//
// Results are never gated on this: the visitor has already seen them. The
// lead stores the email next to the scanned hostname (app.scan_leads); the
// free_scans log itself keeps no email addresses by design. Follow-up emails
// are sent by the ops sequence, not by this endpoint.
import { query } from '../server/app/db.js';
import { hostOf } from '../server/app/one-time.js';
import { createRateLimiter } from '../server/rate-limit.js';
import { json, checkOrigin, clientIp, readJson, methodNotAllowed } from '../server/http.js';

const perMinute = createRateLimiter({ limit: 5, windowMs: 60_000 });
const perHour = createRateLimiter({ limit: 30, windowMs: 60 * 60_000 });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  if (!checkOrigin(request)) return json(403, { error: 'Requests from this origin are not allowed.' });
  const ip = clientIp(request);
  for (const limiter of [perMinute, perHour]) {
    const rl = limiter(ip);
    if (!rl.allowed) {
      return json(429, { error: 'Too many requests. Please wait a few minutes and try again.' }, { 'Retry-After': String(rl.retryAfter) });
    }
  }
  const body = await readJson(request, 4096);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email) || email.length > 254) return json(400, { error: 'Enter a valid email address.' });
  if (typeof body?.url !== 'string' || body.url.length > 2048) return json(400, { error: 'Enter a valid web address.' });
  if (!process.env.DATABASE_URL) return json(503, { error: 'Could not save your email. Please try again.' });
  try {
    await query('insert into app.scan_leads (email, hostname, url) values ($1, $2, $3)', [email, hostOf(body.url), body.url.slice(0, 2048)]);
    return json(200, { ok: true });
  } catch (err) {
    if (err?.code === '42P01' || err?.code === '42703') {
      return json(503, { error: 'Could not save your email. Please try again.' });
    }
    console.error('scan lead failed', err);
    return json(500, { error: 'Could not save your email. Please try again.' });
  }
}

export function GET() {
  return methodNotAllowed('POST');
}

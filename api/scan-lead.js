// POST /api/scan-lead { email, url } -> stores a scan lead for follow-up.
//
// Results are never gated on this: the visitor has already seen them. The
// lead stores the email next to the scanned hostname (app.scan_leads); the
// free_scans log itself keeps no email addresses by design. Follow-up emails
// are sent by the ops sequence. The visitor asked for their results, so a
// one-off results email (transactional) is sent right away, once per
// address and site per 24 hours, never to a suppressed address.
import { query } from '../server/app/db.js';
import { hostOf } from '../server/app/one-time.js';
import { createRateLimiter } from '../server/rate-limit.js';
import { sendScanResultsEmail } from '../server/app/email-sequences.js';
import { fetchSuppressedEmails } from '../server/app/funnel.js';
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
    const hostname = hostOf(body.url);
    // Same address + site in the last 24h: already stored and emailed, do not repeat.
    const recent = await query(
      `select 1 from app.scan_leads where lower(email) = $1 and hostname is not distinct from $2 and created_at > now() - interval '24 hours' limit 1`,
      [email, hostname],
    );
    if (recent.length) return json(200, { ok: true, emailed: true });
    await query('insert into app.scan_leads (email, hostname, url) values ($1, $2, $3)', [email, hostname, body.url.slice(0, 2048)]);
    let emailed = false;
    try {
      const suppressed = new Set(await fetchSuppressedEmails());
      if (!suppressed.has(email)) {
        const scan = (await query(
          `select issues, critical, serious from app.free_scans
            where hostname = $1 and issues is not null and created_at > now() - interval '2 hours'
            order by created_at desc limit 1`,
          [hostname],
        ))[0] || {};
        const res = await sendScanResultsEmail({ to: email, hostname: hostname || body.url, url: body.url.slice(0, 2048), issues: scan.issues, critical: scan.critical, serious: scan.serious });
        emailed = !!res?.ok;
        if (!emailed) console.error('scan results email not sent', res?.reason);
      }
    } catch (err) {
      console.error('scan results email failed', err?.name);
    }
    return json(200, { ok: true, emailed });
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

// POST /api/one-time-rerun { token } -> rebuild a paid one-time report.
//
// Disabled unless SUBSCRIBER_ADMIN_TOKEN or ADMIN_TOKEN is set. Every call
// needs that value in the x-admin-token header. The secret is never logged
// and never returned.
//
// The paid row is set back to delivery 'pending' with report null. A domain
// audit then gets a fresh app/one-time.audit event, so the crawl runs again
// and the ready email is sent again. A page report is not queued: opening
// /report?token=... builds it again.
import crypto from 'node:crypto';
import { validToken, rerunPaidAudit } from '../server/app/one-time.js';
import { json, readJson, methodNotAllowed } from '../server/http.js';

function tokenOk(given, expected) {
  if (!given || !expected) return false;
  const a = crypto.createHash('sha256').update(String(given)).digest();
  const b = crypto.createHash('sha256').update(String(expected)).digest();
  return crypto.timingSafeEqual(a, b);
}

function adminSecrets() {
  return [process.env.SUBSCRIBER_ADMIN_TOKEN, process.env.ADMIN_TOKEN].filter((v) => typeof v === 'string' && v.length > 0);
}

export async function POST(request) {
  const secrets = adminSecrets();
  if (!secrets.length) return json(404, { error: 'Not found.' });
  if (!secrets.some((secret) => tokenOk(request.headers.get('x-admin-token'), secret))) return json(403, { error: 'Forbidden.' });
  const body = await readJson(request, 4096);
  const token = typeof body?.token === 'string' ? body.token.trim().toLowerCase() : '';
  if (!validToken(token)) return json(400, { error: 'A 32-character report token is required.' });
  try {
    const result = await rerunPaidAudit(token);
    return json(result.status, result.body);
  } catch (err) {
    // Code only. The message can contain the purchase token or a browser URL.
    console.error('one-time rerun failed', err?.code || 'error');
    return json(502, { error: 'The re-run could not be finished. Call this again.' });
  }
}

export function GET() {
  return methodNotAllowed('POST');
}

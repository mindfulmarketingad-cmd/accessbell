// POST /api/contact -> validates the contact form and emails it to the team
import { validateContact, sendViaResend } from '../server/contact.js';
import { createRateLimiter } from '../server/rate-limit.js';
import { json, checkOrigin, clientIp, readJson, methodNotAllowed } from '../server/http.js';

const limiter = createRateLimiter({ limit: 5, windowMs: 60 * 60_000 });

export async function POST(request) {
  if (!checkOrigin(request)) return json(403, { error: 'Requests from this origin are not allowed.' });

  const rl = limiter(clientIp(request));
  if (!rl.allowed) {
    return json(429, { error: 'Too many messages. Please try again later.' }, { 'Retry-After': String(rl.retryAfter) });
  }

  const body = await readJson(request, 16_384);
  const result = validateContact(body);
  if (result.spam) return json(200, { ok: true });
  if (!result.ok) return json(400, { error: result.error });

  try {
    const sent = await sendViaResend(result.data);
    if (!sent.ok) {
      if (sent.reason !== 'not-configured') console.error('contact delivery failed', sent.reason);
      return json(503, { error: 'Our message service is temporarily unavailable.' });
    }
    return json(200, { ok: true });
  } catch (err) {
    console.error('contact delivery error', err && err.name);
    return json(503, { error: 'Our message service is temporarily unavailable.' });
  }
}

export function GET() {
  return methodNotAllowed('POST');
}

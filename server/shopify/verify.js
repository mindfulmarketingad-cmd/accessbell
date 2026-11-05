// Signature and token checks for requests that claim to come from Shopify.
import crypto from 'node:crypto';

const SHOP_RE = /^[a-z0-9][a-z0-9-]{0,60}\.myshopify\.com$/;

/** "Foo.myshopify.com" / "https://foo.myshopify.com/" -> "foo.myshopify.com", else null. */
export function normalizeShop(input) {
  const s = String(input || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  return SHOP_RE.test(s) ? s : null;
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/** Webhooks: X-Shopify-Hmac-Sha256 is base64 HMAC-SHA256 of the raw body. */
export function verifyWebhookHmac(rawBody, header, secret) {
  if (!secret || !header) return false;
  const digest = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
  return safeEqual(digest, header);
}

/** Admin launch URLs (?shop=&host=&hmac=...): hex HMAC of the other params, sorted. */
export function verifyQueryHmac(searchParams, secret) {
  const params = new URLSearchParams(searchParams);
  const hmac = params.get('hmac');
  if (!secret || !hmac) return false;
  params.delete('hmac');
  params.delete('signature');
  const message = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  const digest = crypto.createHmac('sha256', secret).update(message).digest('hex');
  return safeEqual(digest, hmac);
}

const b64url = (buf) => Buffer.from(buf).toString('base64url');

/** Test helper and the inverse of verifyIdToken. */
export function signIdToken(claims, secret) {
  const head = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(claims));
  const sig = crypto.createHmac('sha256', secret).update(`${head}.${body}`).digest('base64url');
  return `${head}.${body}.${sig}`;
}

/**
 * App Bridge ID token (session token): an HS256 JWT signed with the app
 * secret. Returns { shop, userId, sessionId } or null. Checks signature,
 * algorithm, audience (our client ID), time window and that iss and dest name
 * the same *.myshopify.com store.
 */
export function verifyIdToken(token, { apiKey, apiSecret, now = Date.now(), skewSec = 5 } = {}) {
  if (!token || !apiKey || !apiSecret) return null;
  const parts = String(token).split('.');
  if (parts.length !== 3) return null;
  const [head, body, sig] = parts;
  let header;
  let claims;
  try {
    header = JSON.parse(Buffer.from(head, 'base64url').toString('utf8'));
    claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (header?.alg !== 'HS256') return null;
  const expected = crypto.createHmac('sha256', apiSecret).update(`${head}.${body}`).digest('base64url');
  if (!safeEqual(expected, sig)) return null;
  const t = Math.floor(now / 1000);
  if (typeof claims.exp !== 'number' || claims.exp + skewSec < t) return null;
  if (typeof claims.nbf === 'number' && claims.nbf - skewSec > t) return null;
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!aud.includes(apiKey)) return null;
  const dest = normalizeShop(claims.dest);
  const iss = normalizeShop(String(claims.iss || '').replace(/\/admin\/?$/, ''));
  if (!dest || dest !== iss) return null;
  return { shop: dest, userId: claims.sub ? String(claims.sub) : null, sessionId: claims.sid || null };
}

/** The bearer token App Bridge adds to fetch() calls from the embedded app. */
export const bearer = (request) => {
  const m = /^Bearer\s+(.+)$/i.exec(request.headers.get('authorization') || '');
  return m ? m[1].trim() : null;
};

// Shared helpers for the /api functions.
const SITE_ORIGINS = ['https://accessbell.co', 'https://www.accessbell.co'];

const SECURITY_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
};

export function json(status, body, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...SECURITY_HEADERS, ...extra } });
}

export function allowedOrigins(env = process.env) {
  const list = [...SITE_ORIGINS];
  if (env.VERCEL_URL) list.push(`https://${env.VERCEL_URL}`);
  if (env.VERCEL_BRANCH_URL) list.push(`https://${env.VERCEL_BRANCH_URL}`);
  if (env.ALLOWED_ORIGINS) {
    for (const o of env.ALLOWED_ORIGINS.split(',')) if (o.trim()) list.push(o.trim().replace(/\/$/, ''));
  }
  if (env.NODE_ENV !== 'production' && !env.VERCEL) list.push('http://localhost:4321', 'http://localhost:3000', 'http://127.0.0.1:4321');
  return list;
}

/**
 * Only same-site browser requests may call the API. Browsers always send
 * Origin on cross-origin and on POST requests, so a missing or foreign
 * Origin is rejected. This stops other sites from using the endpoints.
 */
export function checkOrigin(request, env = process.env) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'same-site') return false;
  return allowedOrigins(env).includes(origin);
}

export function clientIp(request) {
  // Vercel sets x-real-ip and overwrites x-forwarded-for, so these cannot be spoofed by the client.
  return (
    request.headers.get('x-real-ip') ||
    (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown'
  );
}

/** Read a JSON body with a hard size cap. Returns null on any problem. */
export async function readJson(request, maxBytes) {
  const type = request.headers.get('content-type') || '';
  if (!type.toLowerCase().startsWith('application/json')) return null;
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) return null;
  let text;
  try {
    text = await request.text();
  } catch {
    return null;
  }
  if (text.length > maxBytes) return null;
  try {
    const data = JSON.parse(text);
    return data && typeof data === 'object' && !Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export function methodNotAllowed(allow) {
  return json(405, { error: 'Method not allowed.' }, { Allow: allow });
}

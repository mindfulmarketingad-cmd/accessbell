// Session cookies. Tokens live only in httpOnly cookies scoped to /api, so
// page JavaScript can never read them and they are not sent with page loads.
import { auth } from './auth-client.js';

const ACCESS = 'ab_at';
const REFRESH = 'ab_rt';
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function parseCookies(header) {
  const out = {};
  for (const part of String(header || '').split(';')) {
    const i = part.indexOf('=');
    if (i < 1) continue;
    const name = part.slice(0, i).trim();
    const value = part.slice(i + 1).trim();
    try {
      out[name] = decodeURIComponent(value);
    } catch {
      out[name] = value;
    }
  }
  return out;
}

function cookie(name, value, maxAge, secure) {
  return [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/api',
    `Max-Age=${maxAge}`,
    'HttpOnly',
    'SameSite=Lax',
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

const isSecure = (request) => new URL(request.url).protocol === 'https:' || process.env.VERCEL === '1';

export function sessionCookies(request, session) {
  const secure = isSecure(request);
  return [
    cookie(ACCESS, session.accessToken, Math.max(60, session.expiresIn), secure),
    cookie(REFRESH, session.refreshToken, REFRESH_MAX_AGE, secure),
  ];
}

export function clearSessionCookies(request) {
  const secure = isSecure(request);
  return [cookie(ACCESS, '', 0, secure), cookie(REFRESH, '', 0, secure)];
}

/**
 * Resolve the signed-in user from cookies, refreshing an expired access token.
 * Returns { user, accessToken, setCookies } or { user: null, setCookies }.
 */
export async function readSession(request) {
  const cookies = parseCookies(request.headers.get('cookie'));
  const at = cookies[ACCESS];
  const rt = cookies[REFRESH];

  if (at) {
    try {
      const user = await auth.getUser(at);
      if (user && user.id) return { user, accessToken: at, setCookies: [] };
    } catch (err) {
      if (err.status && err.status !== 401) throw err;
    }
  }
  if (rt) {
    try {
      const session = await auth.refresh(rt);
      if (session) {
        const user = session.user || (await auth.getUser(session.accessToken));
        return { user, accessToken: session.accessToken, setCookies: sessionCookies(request, session) };
      }
    } catch (err) {
      if (err.status && err.status !== 401 && err.status !== 400) throw err;
    }
    return { user: null, setCookies: clearSessionCookies(request) };
  }
  return { user: null, setCookies: [] };
}

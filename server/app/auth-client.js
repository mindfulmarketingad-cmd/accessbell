// Minimal Supabase Auth (GoTrue) REST client. All calls run on the server,
// so the browser never holds Supabase tokens in JavaScript.
import { config } from './config.js';
import { AppError } from './errors.js';

const TIMEOUT_MS = 8000;

// Map Supabase error codes to messages that do not reveal whether an account exists.
const FRIENDLY = {
  invalid_credentials: 'Email or password is incorrect.',
  weak_password: 'Choose a stronger password: at least 8 characters.',
  over_email_send_rate_limit: 'Too many emails sent. Please wait a few minutes and try again.',
  over_request_rate_limit: 'Too many attempts. Please wait a few minutes and try again.',
  otp_expired: 'That link has expired. Please request a new one.',
  same_password: 'Choose a password different from your current one.',
  signup_disabled: 'Sign-ups are currently closed.',
  user_already_exists: 'An account already exists for that email. Sign in, or reset your password if you have forgotten it.',
  email_exists: 'An account already exists for that email. Sign in, or reset your password if you have forgotten it.',
  email_not_confirmed: 'Please confirm your email address first, using the link we sent you.',
  // Supabase's built-in test mailer only delivers to members of the Supabase organization.
  email_address_not_authorized: 'We could not send email to that address. Please contact support.',
  email_send_failed: 'We could not send the email right now. Please try again in a few minutes or contact support.',
};

// Endpoints that send an email; a 5xx from these almost always means delivery failed.
const SENDS_EMAIL = new Set(['/signup', '/resend', '/recover', '/invite']);

async function call(path, { method = 'POST', body, token, admin = false, query } = {}) {
  const c = config();
  const key = admin ? c.supabaseServiceKey : c.supabaseAnonKey;
  if (!key) throw new AppError(503, 'Sign-in is not configured yet. Please contact support.', 'auth_not_configured');

  const url = new URL(`${c.supabaseUrl}/auth/v1${path}`);
  for (const [k, v] of Object.entries(query || {})) if (v) url.searchParams.set(k, v);

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        apikey: key,
        Authorization: `Bearer ${token || key}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new AppError(503, 'The sign-in service is not responding. Please try again.', 'auth_unavailable');
  }

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!res.ok) {
    let code = data.error_code || data.code || data.error || '';
    if (res.status >= 500 && SENDS_EMAIL.has(path)) code = 'email_send_failed';
    // Log the reason for Vercel logs. Status and code only: messages can contain the address.
    console.warn(`auth ${path} failed: ${res.status} ${code || 'unknown'}${res.status >= 500 ? ` (${String(data.msg || data.message || '').slice(0, 120)})` : ''}`);
    const status = res.status === 429 ? 429 : res.status >= 500 ? 503 : res.status === 401 || res.status === 403 ? 401 : 400;
    throw new AppError(status, FRIENDLY[code] || 'That did not work. Please check your details and try again.', String(code || 'auth_error'));
  }
  return data;
}

/** Normalize a token response into { accessToken, refreshToken, expiresIn, user }. */
function toSession(data) {
  if (!data || !data.access_token) return null;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: Number(data.expires_in) || 3600,
    user: data.user || null,
  };
}

export const auth = {
  async signUp(email, password, redirectTo) {
    const data = await call('/signup', { body: { email, password }, query: { redirect_to: redirectTo } });
    return { session: toSession(data), user: data.user || (data.id ? data : null) };
  },
  async signIn(email, password) {
    return toSession(await call('/token', { query: { grant_type: 'password' }, body: { email, password } }));
  },
  async refresh(refreshToken) {
    return toSession(await call('/token', { query: { grant_type: 'refresh_token' }, body: { refresh_token: refreshToken } }));
  },
  async getUser(accessToken) {
    return call('/user', { method: 'GET', token: accessToken });
  },
  async signOut(accessToken) {
    await call('/logout', { token: accessToken, query: { scope: 'local' } }).catch(() => {});
  },
  async resendConfirmation(email, redirectTo) {
    await call('/resend', { body: { type: 'signup', email }, query: { redirect_to: redirectTo } });
  },
  async recover(email, redirectTo) {
    await call('/recover', { body: { email }, query: { redirect_to: redirectTo } });
  },
  async updatePassword(accessToken, password) {
    return call('/user', { method: 'PUT', token: accessToken, body: { password } });
  },
  async verifyTokenHash(tokenHash, type) {
    return toSession(await call('/verify', { body: { token_hash: tokenHash, type } }));
  },
  /** Admin: create a user whose email is already confirmed, so no confirmation email is sent. */
  async createConfirmedUser(email, password) {
    return call('/admin/users', { admin: true, body: { email, password, email_confirm: true } });
  },
  /** Admin: mark an existing user's email as confirmed. */
  async confirmUser(userId) {
    return call(`/admin/users/${encodeURIComponent(userId)}`, { method: 'PUT', admin: true, body: { email_confirm: true } });
  },
  /** Admin: send an invitation email and create the user. Returns the user. */
  async invite(email, redirectTo) {
    return call('/invite', { admin: true, body: { email }, query: { redirect_to: redirectTo } });
  },
};

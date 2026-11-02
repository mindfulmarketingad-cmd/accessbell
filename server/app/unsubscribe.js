// One-click unsubscribe and CAN-SPAM footer for funnel (marketing) email.
//
// Every sequence email carries a signed unsubscribe link and the
// List-Unsubscribe / List-Unsubscribe-Post headers (RFC 2369 / RFC 8058).
// The link token is an HMAC-SHA256 of the address, so nobody can unsubscribe
// an address they cannot already receive mail for, and no database row is
// needed to issue a link. Tokens do not expire: an unsubscribe link must keep
// working for as long as the email exists.
//
// Signing key: FUNNEL_UNSUBSCRIBE_SECRET when set, otherwise a key derived from
// SUPABASE_SERVICE_ROLE_KEY with a fixed label (domain separation, so the
// derived key is useless for anything else). Rotating either secret
// invalidates old links, so set FUNNEL_UNSUBSCRIBE_SECRET before go-live if
// the service key may ever be rotated.
//
// The physical mailing address comes from FUNNEL_MAILING_ADDRESS. It is never
// invented: with no address (or no signing key) the funnel refuses to send
// live, even when FUNNEL_EMAIL_LIVE=1.
import crypto from 'node:crypto';
import { config } from './config.js';

const LABEL = 'accessbell/funnel-unsubscribe/v1';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

function signingKey(env = process.env) {
  if (env.FUNNEL_UNSUBSCRIBE_SECRET) return String(env.FUNNEL_UNSUBSCRIBE_SECRET);
  if (env.SUPABASE_SERVICE_ROLE_KEY) {
    return crypto.createHmac('sha256', String(env.SUPABASE_SERVICE_ROLE_KEY)).update(LABEL).digest('hex');
  }
  return '';
}

export function mailingAddress(env = process.env) {
  return String(env.FUNNEL_MAILING_ADDRESS || '').trim();
}

/** What stops live funnel sends. Empty list = ready. */
export function funnelSendBlockers(env = process.env) {
  const out = [];
  if (!mailingAddress(env)) out.push('FUNNEL_MAILING_ADDRESS is not set (CAN-SPAM physical address)');
  if (!signingKey(env)) out.push('No unsubscribe signing key (set FUNNEL_UNSUBSCRIBE_SECRET)');
  return out;
}

const b64url = (buf) => Buffer.from(buf).toString('base64url');

function mac(email, env) {
  return crypto.createHmac('sha256', signingKey(env)).update(`${LABEL}:${email}`).digest().subarray(0, 18);
}

/** Token = base64url(email) "." base64url(truncated HMAC). */
export function unsubscribeToken(email, env = process.env) {
  const e = normalizeEmail(email);
  if (!e || !signingKey(env)) return null;
  return `${b64url(e)}.${b64url(mac(e, env))}`;
}

/** Returns the email for a valid token, else null. Constant-time compare. */
export function verifyUnsubscribeToken(token, env = process.env) {
  if (!signingKey(env)) return null;
  const parts = String(token || '').split('.');
  if (parts.length !== 2 || parts[0].length > 400) return null;
  let email;
  try {
    email = normalizeEmail(Buffer.from(parts[0], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!email || email.length > 254 || !email.includes('@')) return null;
  const given = Buffer.from(parts[1], 'base64url');
  const expected = mac(email, env);
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  return email;
}

export function unsubscribeUrl(email, env = process.env) {
  const t = unsubscribeToken(email, env);
  if (!t) return null;
  return `${config(env).appUrl}/api/unsubscribe?t=${encodeURIComponent(t)}`;
}

/** Headers for one-click unsubscribe in Gmail / Yahoo / Apple Mail. */
export function unsubscribeHeaders(email, env = process.env) {
  const url = unsubscribeUrl(email, env);
  if (!url) return {};
  return {
    'List-Unsubscribe': `<${url}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}

/**
 * Footer for every sequence email: unsubscribe link, reply opt-out, and the
 * physical address. Placeholders appear only when config is missing, and in
 * that state the funnel refuses to send live, so they never reach a person.
 */
export function marketingFooter(email, env = process.env) {
  const url = unsubscribeUrl(email, env) || '[unsubscribe link: signing key missing]';
  const address = mailingAddress(env) || '[mailing address: FUNNEL_MAILING_ADDRESS not set]';
  return [
    '',
    '',
    '--',
    `Unsubscribe with one click: ${url}`,
    'Or reply to this email with "opt out" and we will not follow up.',
    'You are getting this because you used AccessBell at accessbell.co and gave us this email address.',
    `AccessBell, ${address}`,
  ].join('\n');
}

// Router for every /api/app/* endpoint (one serverless function).
import { checkOrigin, clientIp, readJson } from '../http.js';
import { createRateLimiter } from '../rate-limit.js';
import { auth } from './auth-client.js';
import { readSession, sessionCookies, clearSessionCookies } from './session.js';
import { ensureUserSetup, getContext, renameAccount, requireRole, isSubscribed, getOnboarding, completeTour } from './accounts.js';
import { checkoutUrl, portalUrl, billingSummary } from './billing.js';
import {
  listDomains, createDomain, updateDomainSettings, deleteDomain, addPage, setMonitored, deletePage, discoverPages, domainOverview, selectPages, addPages,
} from './domains.js';
import { rescanPage, getScan, pageHistory, startDomainScan, scanStatus } from './scanning.js';
import { domainIssue } from './issues.js';
import { one } from './db.js';
import { listMembers, inviteMember, changeRole, removeMember } from './team.js';
import { config, missingConfig } from './config.js';
import { getFixSetup, verifyFix, addFix, updateFix, publicFixRules, getStatement, saveStatement, publicStatement } from './site-setup.js';
import { AppError, badRequest, unauthorized } from './errors.js';
import { addNote, vault, certificate, createRecord, getRecord, verifyRecord } from './records.js';

const limits = {
  login: createRateLimiter({ limit: 10, windowMs: 10 * 60_000 }),
  signup: createRateLimiter({ limit: 5, windowMs: 60 * 60_000 }),
  email: createRateLimiter({ limit: 5, windowMs: 60 * 60_000 }),
  api: createRateLimiter({ limit: 300, windowMs: 60_000 }),
};

const SECURITY_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
};

function respond(status, body, cookies = [], extraHeaders = {}) {
  const headers = new Headers(SECURITY_HEADERS);
  for (const [k, v] of Object.entries(extraHeaders)) headers.set(k, v);
  for (const c of cookies) headers.append('Set-Cookie', c);
  return new Response(JSON.stringify(body), { status, headers });
}

function limit(name, key) {
  const rl = limits[name](key);
  if (!rl.allowed) throw new AppError(429, 'Too many attempts. Please wait a few minutes and try again.', 'rate_limited');
}

const EMAIL = /^[^\s@<>()[\]\\,;:"]{1,64}@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

function credentials(body) {
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');
  if (!EMAIL.test(email) || email.length > 254) throw badRequest('Enter a valid email address.');
  if (password.length < 8 || password.length > 72) throw badRequest('Passwords must be 8 to 72 characters.');
  return { email, password };
}

/** Where Supabase email links should land. Uses the caller's own (allow-listed) origin. */
const appOrigin = (request) => request.headers.get('origin') || config().appUrl;

// ---------- Public auth routes (no session required) ----------

const publicRoutes = {
  async 'POST auth/signup'({ request, body, ip }) {
    limit('signup', ip);
    const { email, password } = credentials(body);
    const result = await auth.signUp(email, password, `${appOrigin(request)}/app/auth/callback`);
    // With "Confirm email" on in Supabase, sign-up returns a user but no session until the
    // link in the email is clicked. Supabase also answers this way for an address that is
    // already registered, so the response does not reveal whether an account exists.
    if (!result.session && result.user) return { body: { status: 'confirm_email' } };
    if (!result.session) throw new AppError(503, 'We could not create your account right now. Please try again in a moment.', 'signup_failed');
    const user = result.session.user || (await auth.getUser(result.session.accessToken));
    await ensureUserSetup(user);
    return { body: { status: 'signed_in' }, cookies: sessionCookies(request, result.session) };
  },

  async 'POST auth/login'({ request, body, ip }) {
    limit('login', ip);
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    if (!EMAIL.test(email) || !password || password.length > 72) throw unauthorized('Email or password is incorrect.');
    const session = await auth.signIn(email, password);
    if (!session) throw unauthorized('Email or password is incorrect.');
    const user = session.user || (await auth.getUser(session.accessToken));
    await ensureUserSetup(user);
    return { body: { status: 'signed_in' }, cookies: sessionCookies(request, session) };
  },

  /** Send the sign-up confirmation email again. Same response whether or not the account exists. */
  async 'POST auth/resend'({ request, body, ip }) {
    limit('email', ip);
    const email = String(body?.email || '').trim().toLowerCase();
    if (!EMAIL.test(email)) throw badRequest('Enter a valid email address.');
    await auth.resendConfirmation(email, `${appOrigin(request)}/app/auth/callback`).catch((err) => {
      if (err.status === 429 || err.code === 'email_send_failed') throw err;
    });
    return { body: { status: 'sent' } };
  },

  async 'POST auth/forgot'({ request, body, ip }) {
    limit('email', ip);
    const email = String(body?.email || '').trim().toLowerCase();
    if (!EMAIL.test(email)) throw badRequest('Enter a valid email address.');
    // Same response whether or not the account exists.
    await auth.recover(email, `${appOrigin(request)}/app/auth/callback`).catch((err) => {
      if (err.status === 429 || err.code === 'email_send_failed') throw err;
    });
    return { body: { status: 'sent' } };
  },

  /** Exchange tokens from an email link (URL fragment) for httpOnly cookies. */
  async 'POST auth/session'({ request, body, ip }) {
    limit('login', ip);
    const accessToken = String(body?.access_token || '');
    const refreshToken = String(body?.refresh_token || '');
    if (!accessToken || !refreshToken || accessToken.length > 4096 || refreshToken.length > 512) throw badRequest('That link is not valid.');
    const user = await auth.getUser(accessToken).catch(() => null);
    if (!user?.id) throw unauthorized('That link has expired. Please request a new one.');
    await ensureUserSetup(user);
    const expiresIn = Math.min(Math.max(Number(body?.expires_in) || 3600, 60), 3600);
    return { body: { status: 'signed_in' }, cookies: sessionCookies(request, { accessToken, refreshToken, expiresIn }) };
  },

  /** Email links using token_hash (custom Supabase email templates). */
  async 'POST auth/verify'({ request, body, ip }) {
    limit('login', ip);
    const tokenHash = String(body?.token_hash || '');
    const type = String(body?.type || '');
    if (!/^[A-Za-z0-9_-]{8,512}$/.test(tokenHash) || !['signup', 'email', 'recovery', 'invite', 'magiclink', 'email_change'].includes(type)) {
      throw badRequest('That link is not valid.');
    }
    const session = await auth.verifyTokenHash(tokenHash, type);
    if (!session) throw unauthorized('That link has expired. Please request a new one.');
    const user = session.user || (await auth.getUser(session.accessToken));
    await ensureUserSetup(user);
    return { body: { status: 'signed_in' }, cookies: sessionCookies(request, session) };
  },

  /** AccessBellFix: the approved fixes for a site. Called by the script on the customer's website. */
  async 'GET fix'({ url }) {
    const out = await publicFixRules(url.searchParams.get('k'));
    return { body: out, headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=60' } };
  },

  /** Check that a compliance record ID and fingerprint match a record AccessBell issued. */
  async 'GET record/verify'({ url }) {
    return { body: await verifyRecord(url.searchParams.get('id'), url.searchParams.get('sha256')) };
  },

  /** The hosted accessibility statement for a site. */
  async 'GET statement'({ url }) {
    return { body: await publicStatement(url.searchParams.get('k')), headers: { 'Cache-Control': 'public, max-age=300' } };
  },

  async 'POST auth/logout'({ request }) {
    const s = await readSession(request).catch(() => ({ user: null }));
    if (s.accessToken) await auth.signOut(s.accessToken);
    return { body: { status: 'signed_out' }, cookies: clearSessionCookies(request) };
  },
};

// ---------- Signed-in routes ----------

/** Signed-in routes open to people whose access has not been switched on yet. */
const PENDING_ROUTES = new Set(['GET me', 'GET billing/checkout', 'POST billing/portal', 'POST auth/password', 'POST onboarding']);

const routes = {
  async 'GET me'({ ctx }) {
    return {
      user: { id: ctx.user.id, email: ctx.user.email },
      account: { id: ctx.account.id, name: ctx.account.name, members: (await one('select count(*)::int as n from app.account_members where account_id = $1', [ctx.account.id])).n },
      role: ctx.role,
      subscribed: isSubscribed(ctx),
      billing: await billingSummary(ctx),
      onboarding: await getOnboarding(ctx.user.id),
    };
  },
  async 'POST onboarding'({ ctx, body }) {
    await completeTour(ctx.user.id, body?.tour);
    return { status: 'completed' };
  },
  async 'POST auth/password'({ ctx, body, accessToken }) {
    const password = String(body?.password || '');
    if (password.length < 8 || password.length > 72) throw badRequest('Passwords must be 8 to 72 characters.');
    await auth.updatePassword(accessToken, password);
    return { status: 'updated', userId: ctx.user.id };
  },
  async 'POST account'({ ctx, body }) {
    const a = await renameAccount(ctx, body?.name);
    return { account: { id: a.id, name: a.name } };
  },

  async 'GET billing/checkout'({ ctx, url }) {
    return { url: checkoutUrl(ctx, url.searchParams.get('plan') === 'annual' ? 'annual' : 'monthly') };
  },
  async 'POST billing/portal'({ ctx, request }) {
    return { url: await portalUrl(ctx, `${appOrigin(request)}/app/billing`) };
  },

  async 'GET domains'({ ctx }) {
    return { domains: await listDomains(ctx), billing: await billingSummary(ctx) };
  },
  async 'POST domains'({ ctx, body }) {
    const d = await createDomain(ctx, body?.url);
    return { domain: { id: d.id, hostname: d.hostname } };
  },
  async 'GET domain'({ ctx, url }) {
    return domainOverview(ctx, url.searchParams.get('id'));
  },
  async 'GET domain/issue'({ ctx, url }) {
    return domainIssue(ctx, url.searchParams.get('id'), url.searchParams.get('rule'));
  },
  async 'POST domain/settings'({ ctx, body }) {
    return { settings: await updateDomainSettings(ctx, body?.id, body?.settings) };
  },
  async 'POST domain/delete'({ ctx, body }) {
    await deleteDomain(ctx, body?.id);
    return { status: 'deleted' };
  },
  async 'POST domain/discover'({ ctx, body }) {
    return discoverPages(ctx, body?.id);
  },

  async 'POST domain/pages/select'({ ctx, body }) {
    return { pages: await selectPages(ctx, body?.id, body?.pageIds) };
  },
  async 'POST domain/pages/add'({ ctx, body }) {
    return { pages: await addPages(ctx, body?.id, body?.urls) };
  },

  async 'POST pages'({ ctx, body }) {
    const p = await addPage(ctx, body?.domainId, body?.url);
    return { page: { id: p.id, url: p.url } };
  },
  async 'POST pages/monitor'({ ctx, body }) {
    const p = await setMonitored(ctx, body?.id, body?.monitored === true);
    return { page: { id: p.id, monitored: p.monitored } };
  },
  async 'POST pages/delete'({ ctx, body }) {
    await deletePage(ctx, body?.id);
    return { status: 'deleted' };
  },
  async 'GET page'({ ctx, url }) {
    return pageHistory(ctx, url.searchParams.get('id'));
  },

  async 'POST scan'({ ctx, body }) {
    return { scans: await rescanPage(ctx, body?.pageId) };
  },
  async 'POST domain/scan'({ ctx, body }) {
    return startDomainScan(ctx, body?.id);
  },
  async 'GET domain/scan-status'({ ctx, url }) {
    return scanStatus(ctx, url.searchParams.get('id'), url.searchParams.get('since'));
  },
  async 'GET scan'({ ctx, url }) {
    return { scan: await getScan(ctx, url.searchParams.get('id')) };
  },

  async 'GET domain/fix'({ ctx, url }) {
    return getFixSetup(ctx, url.searchParams.get('id'));
  },
  async 'POST domain/fix/verify'({ ctx, body }) {
    return verifyFix(ctx, body?.id);
  },
  async 'POST domain/fix/add'({ ctx, body }) {
    return addFix(ctx, body?.id, body);
  },
  async 'POST domain/fix/update'({ ctx, body }) {
    return updateFix(ctx, body?.id, body?.fixId, { enabled: body?.enabled, remove: body?.remove === true });
  },
  async 'GET domain/statement'({ ctx, url }) {
    return getStatement(ctx, url.searchParams.get('id'));
  },
  async 'POST domain/statement'({ ctx, body }) {
    return saveStatement(ctx, body?.id, body?.statement);
  },
  async 'GET domain/vault'({ ctx, url }) {
    return vault(ctx, url.searchParams.get('id'));
  },
  async 'GET domain/certificate'({ ctx, url }) {
    return certificate(ctx, url.searchParams.get('id'));
  },
  async 'POST domain/note'({ ctx, body }) {
    return addNote(ctx, body?.id, body);
  },
  async 'POST domain/record'({ ctx, body }) {
    const { id, sha256 } = await createRecord(ctx, body?.id, { from: body?.from, to: body?.to });
    return { id, sha256 };
  },
  async 'GET record'({ ctx, url }) {
    return getRecord(ctx, url.searchParams.get('id'));
  },
  async 'GET team'({ ctx }) {
    return { members: await listMembers(ctx), role: ctx.role, userId: ctx.user.id };
  },
  async 'POST team/invite'({ ctx, body, request, ip }) {
    requireRole(ctx, 'admin');
    limit('email', `invite:${ip}`);
    return inviteMember(ctx, body?.email, body?.role, `${appOrigin(request)}/app/auth/callback`);
  },
  async 'POST team/role'({ ctx, body }) {
    await changeRole(ctx, body?.userId, body?.role);
    return { status: 'updated' };
  },
  async 'POST team/remove'({ ctx, body }) {
    await removeMember(ctx, body?.userId);
    return { status: 'removed' };
  },
};

/** Route name from /api/app/<route> or a rewrite's ?route= parameter. */
export function routeName(url) {
  const fromQuery = url.searchParams.get('route');
  const path = fromQuery ?? url.pathname.replace(/^\/api\/app\/?/, '');
  return path.replace(/^\/+|\/+$/g, '');
}

export async function handle(request) {
  const url = new URL(request.url);
  const key = `${request.method} ${routeName(url)}`;
  const ip = clientIp(request);
  let cookies = [];

  try {
    const publicHandler = publicRoutes[key];
    const handler = routes[key];
    if (!publicHandler && !handler) return respond(404, { error: 'Not found.' });

    if (request.method !== 'GET' && !checkOrigin(request)) throw new AppError(403, 'Requests from this origin are not allowed.', 'origin');
    limit('api', ip);

    const needs = ['supabaseAnonKey', 'supabaseServiceKey', 'databaseUrl'];
    const missing = missingConfig(needs);
    if (missing.length) {
      console.error('app not configured, missing:', missing.join(', '));
      throw new AppError(503, 'The dashboard is not configured yet. Please contact support.', 'not_configured');
    }

    let body = request.method === 'GET' ? {} : await readJson(request, 32_768);
    // Signing out must always work, even with an empty or malformed body.
    if (body === null && key === 'POST auth/logout') body = {};
    if (body === null) throw badRequest('Invalid request.');

    if (publicHandler) {
      const out = await publicHandler({ request, body, ip, url });
      return respond(200, out.body, out.cookies, out.headers);
    }

    const session = await readSession(request);
    cookies = session.setCookies;
    if (!session.user) throw unauthorized();
    let ctx = await getContext(session.user);
    if (!ctx) {
      await ensureUserSetup(session.user);
      ctx = await getContext(session.user);
    }
    // Until the site owner marks the account as a Subscriber in Supabase, only
    // the routes needed to pay and to check status are open.
    if (!isSubscribed(ctx) && !PENDING_ROUTES.has(key)) {
      throw new AppError(403, 'Your account is waiting for activation. Start your free trial, and your dashboard unlocks once your payment is confirmed.', 'access_pending');
    }
    const out = await handler({ ctx, request, body, url, ip, accessToken: session.accessToken });
    return respond(200, out, cookies);
  } catch (err) {
    if (err && err.expose) return respond(err.status || 400, { error: err.message, code: err.code }, cookies);
    console.error('app api error', key, err);
    return respond(500, { error: 'Something went wrong. Please try again.' }, cookies);
  }
}

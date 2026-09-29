// Accounts, membership and role checks.
import { one, tx } from './db.js';
import { ROLE_RANK, config } from './config.js';
import { badRequest, forbidden, paymentRequired } from './errors.js';
import { withAccessRule } from './access.js';

const defaultAccountName = (email) => {
  const domain = String(email || '').split('@')[1] || '';
  const base = domain.split('.')[0] || 'My';
  return `${base.charAt(0).toUpperCase()}${base.slice(1)} team`.slice(0, 120);
};

/**
 * Make sure the signed-in user has a profile and at least one account.
 * A brand-new user becomes the owner of a new account.
 */
export async function ensureUserSetup(user) {
  return tx(async (q) => {
    await q(
      `insert into app.profiles (user_id, email) values ($1, $2)
       on conflict (user_id) do update set email = excluded.email`,
      [user.id, user.email],
    );
    const memberships = await q('select 1 from app.account_members where user_id = $1 limit 1', [user.id]);
    if (!memberships.length) {
      const [account] = await q('insert into app.accounts (name) values ($1) returning id', [defaultAccountName(user.email)]);
      await q(`insert into app.account_members (account_id, user_id, role) values ($1, $2, 'owner')`, [account.id, user.id]);
    }
  });
}

/** The user's current account (their first membership) with their role. */
export async function getContext(user) {
  const row = await one(
    `select a.*, m.role
       from app.account_members m
       join app.accounts a on a.id = m.account_id
      where m.user_id = $1
      order by m.created_at asc
      limit 1`,
    [user.id],
  );
  if (!row) return null;
  const { role, ...account } = row;
  return { user, account, role, subscriber: await accountIsSubscriber(account) };
}

/**
 * Dashboard access is granted by hand: the site owner sets an account owner's
 * profile status to "Subscriber" in Supabase after they pay, or lists their
 * email in app.subscriber_emails. Teammates get access through their account's owner.
 */
async function accountIsSubscriber(account) {
  const row = await withAccessRule((rule) => one(`select ${rule} as ok from app.accounts a where a.id = $1`, [account.id]));
  return Boolean(row?.ok);
}

export function requireRole(ctx, minimum) {
  if (!ctx || ROLE_RANK[ctx.role] < ROLE_RANK[minimum]) throw forbidden();
}

/** True for the site's own admins (ADMIN_EMAILS), who get the dashboard free. */
export const isAdminUser = (user) => {
  const emails = config().adminEmails;
  return emails.length > 0 && emails.includes(String(user?.email || '').trim().toLowerCase());
};

/** Whether this user may use the dashboard: marked Subscriber in Supabase, or a site admin. */
export const isSubscribed = (ctx) => Boolean(ctx.subscriber) || isAdminUser(ctx.user);

export function requireSubscription(ctx) {
  if (!isSubscribed(ctx)) {
    throw paymentRequired(
      ctx.account.subscription_status === 'past_due'
        ? 'Your last payment failed. Update your payment method to continue.'
        : 'Start your 3-day free trial to use this feature.',
    );
  }
}

export const TOURS = ['dashboard', 'domain'];

// Postgres "undefined_column": the code is deployed but migration 0002 has
// not been run yet. The dashboard must keep working in that window.
const UNDEFINED_COLUMN = '42703';

/** Which product tours the user has finished, or null when that is not stored yet. */
export async function getOnboarding(userId) {
  try {
    const row = await one('select onboarding from app.profiles where user_id = $1', [userId]);
    const done = row?.onboarding || {};
    return Object.fromEntries(TOURS.map((t) => [t, Boolean(done[t])]));
  } catch (err) {
    if (err.code === UNDEFINED_COLUMN) return null;
    throw err;
  }
}

/** Record that the user finished or dismissed a tour, so it is not shown again. */
export async function completeTour(userId, tour) {
  if (!TOURS.includes(tour)) throw badRequest('Unknown tour.');
  try {
    await one(`update app.profiles set onboarding = onboarding || jsonb_build_object($2::text, now()) where user_id = $1`, [userId, tour]);
  } catch (err) {
    if (err.code !== UNDEFINED_COLUMN) throw err;
  }
}

export async function domainCount(accountId) {
  const row = await one('select count(*)::int as n from app.domains where account_id = $1', [accountId]);
  return row.n;
}

export async function renameAccount(ctx, name) {
  requireRole(ctx, 'admin');
  const clean = String(name || '').trim().slice(0, 120);
  if (!clean) return ctx.account;
  return one('update app.accounts set name = $2 where id = $1 returning *', [ctx.account.id, clean]);
}


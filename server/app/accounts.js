// Accounts, membership and role checks.
import { one, tx } from './db.js';
import { ROLE_RANK, ACTIVE_STATUSES } from './config.js';
import { forbidden, paymentRequired } from './errors.js';

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
  return { user, account, role };
}

export function requireRole(ctx, minimum) {
  if (!ctx || ROLE_RANK[ctx.role] < ROLE_RANK[minimum]) throw forbidden();
}

export const isSubscribed = (account) => ACTIVE_STATUSES.has(account.subscription_status);

export function requireSubscription(ctx) {
  if (!isSubscribed(ctx.account)) {
    throw paymentRequired(
      ctx.account.subscription_status === 'past_due'
        ? 'Your last payment failed. Update your payment method to continue.'
        : 'Start your 3-day free trial to use this feature.',
    );
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


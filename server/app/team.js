// User management and role-based permissions.
//
// Roles: owner (billing, everything) > admin (team, domains, settings)
//        > member (pages and scans) > viewer (read only).
import { query, one } from './db.js';
import { ROLE_RANK } from './config.js';
import { auth } from './auth-client.js';
import { badRequest, forbidden, notFound } from './errors.js';
import { requireRole } from './accounts.js';

const ASSIGNABLE = ['admin', 'member', 'viewer'];
const EMAIL = /^[^\s@<>()[\]\\,;:"]{1,64}@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

export async function listMembers(ctx) {
  return query(
    `select m.user_id, m.role, m.created_at, p.email
       from app.account_members m
       join app.profiles p on p.user_id = m.user_id
      where m.account_id = $1
      order by array_position(array['owner','admin','member','viewer'], m.role), p.email`,
    [ctx.account.id],
  );
}

/** Only owners may grant admin; admins manage members and viewers. */
function assertCanAssign(ctx, role) {
  if (!ASSIGNABLE.includes(role)) throw badRequest('Choose admin, member or viewer.');
  if (role === 'admin' && ctx.role !== 'owner') throw forbidden('Only the account owner can add admins.');
}

export async function inviteMember(ctx, emailInput, role, redirectTo) {
  requireRole(ctx, 'admin');
  assertCanAssign(ctx, role);
  const email = String(emailInput || '').trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) throw badRequest('Enter a valid email address.');

  let profile = await one('select user_id from app.profiles where lower(email) = $1', [email]);
  if (!profile) {
    // New person: Supabase creates the user and emails an invitation link.
    const user = await auth.invite(email, redirectTo);
    if (!user?.id) throw badRequest('The invitation could not be sent. Please try again.');
    profile = await one(
      `insert into app.profiles (user_id, email) values ($1, $2)
       on conflict (user_id) do update set email = excluded.email returning user_id`,
      [user.id, email],
    );
  }
  const existing = await one('select role from app.account_members where account_id = $1 and user_id = $2', [ctx.account.id, profile.user_id]);
  if (existing) throw badRequest('That person is already on your team.');
  await query('insert into app.account_members (account_id, user_id, role) values ($1, $2, $3)', [ctx.account.id, profile.user_id, role]);
  return { email, role };
}

async function targetMember(ctx, userId) {
  if (!/^[0-9a-f-]{36}$/i.test(String(userId || ''))) throw notFound('Team member not found.');
  const m = await one('select user_id, role from app.account_members where account_id = $1 and user_id = $2', [ctx.account.id, userId]);
  if (!m) throw notFound('Team member not found.');
  return m;
}

export async function changeRole(ctx, userId, role) {
  requireRole(ctx, 'admin');
  assertCanAssign(ctx, role);
  const m = await targetMember(ctx, userId);
  if (m.role === 'owner') throw forbidden('The owner role cannot be changed here.');
  if (ROLE_RANK[m.role] >= ROLE_RANK[ctx.role]) throw forbidden('You cannot change the role of someone at your level or above.');
  await query('update app.account_members set role = $3 where account_id = $1 and user_id = $2', [ctx.account.id, userId, role]);
}

export async function removeMember(ctx, userId) {
  const self = userId === ctx.user.id;
  if (!self) requireRole(ctx, 'admin');
  const m = await targetMember(ctx, userId);
  if (m.role === 'owner') throw forbidden('The account owner cannot be removed.');
  if (!self && ROLE_RANK[m.role] >= ROLE_RANK[ctx.role]) throw forbidden('You cannot remove someone at your level or above.');
  await query('delete from app.account_members where account_id = $1 and user_id = $2', [ctx.account.id, userId]);
}

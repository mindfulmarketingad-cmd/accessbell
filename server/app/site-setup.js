// AccessBellFix (a script that applies fixes the customer has approved) and
// the hosted accessibility statement. Both use the domain's public site key.
import crypto from 'node:crypto';
import { query, one } from './db.js';
import { requireRole } from './accounts.js';
import { getDomain } from './domains.js';
import { withAccessRule } from './access.js';
import { fetchPage } from '../fetch-page.js';
import { AppError, badRequest, notFound } from './errors.js';
import { logActivity } from './activity.js';

const UNDEFINED_TABLE = '42P01';
const UNDEFINED_COLUMN = '42703';
const MAX_FIXES = 200;
const SEEN_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export const FIX_KINDS = {
  alt: 'Image alt text',
  name: 'Accessible name (aria-label)',
  lang: 'Page language',
};

/** Before migration 0005 runs, these features explain what is needed instead of failing. */
async function needsMigration(run) {
  try {
    return await run();
  } catch (err) {
    if (err?.code === UNDEFINED_TABLE || err?.code === UNDEFINED_COLUMN) {
      throw new AppError(503, 'This feature needs a database update. Run supabase/migrations/0005_domain_setup.sql in Supabase.', 'migration_needed');
    }
    throw err;
  }
}

const newKey = () => crypto.randomBytes(18).toString('base64url');
const validKey = (k) => /^[A-Za-z0-9_-]{16,40}$/.test(String(k || ''));

async function siteKeyFor(domain) {
  if (domain.site_key) return domain.site_key;
  const row = await one(`update app.domains set site_key = coalesce(site_key, $2) where id = $1 returning site_key`, [domain.id, newKey()]);
  return row.site_key;
}

// ---------- AccessBellFix (signed in) ----------

export async function getFixSetup(ctx, domainId) {
  return needsMigration(async () => {
    const domain = await getDomain(ctx, domainId);
    const siteKey = await siteKeyFor(domain);
    const fixes = await query(
      'select id, kind, selector, value, enabled, created_at from app.fixes where domain_id = $1 order by created_at asc',
      [domain.id],
    );
    return { siteKey, seenAt: domain.fix_seen_at, fixes, kinds: FIX_KINDS };
  });
}

/**
 * Is the snippet installed? Checks the live home page for the site key, and
 * whether the script has loaded recently (it reports in when it fetches fixes).
 */
export async function verifyFix(ctx, domainId, { fetcher = fetchPage } = {}) {
  return needsMigration(async () => {
    const domain = await getDomain(ctx, domainId);
    const siteKey = await siteKeyFor(domain);
    const fresh = await one('select fix_seen_at from app.domains where id = $1', [domain.id]);
    const seenRecently = fresh.fix_seen_at && Date.now() - new Date(fresh.fix_seen_at).getTime() < SEEN_WINDOW_MS;
    let foundInPage = false;
    let otherKey = null;
    let error = null;
    try {
      const page = await fetcher(domain.base_url + '/');
      const html = String(page.html || '');
      foundInPage = html.includes(siteKey);
      // A snippet copied from another domain (or an old key) loads but never matches this domain.
      if (!foundInPage) otherKey = installedKey(html);
    } catch (err) {
      error = err?.message || 'We could not load your home page.';
    }
    // Finding the snippet on the live site counts as validated, so the setup banner goes away.
    let seenAt = fresh.fix_seen_at;
    if (foundInPage) seenAt = (await one('update app.domains set fix_seen_at = now() where id = $1 returning fix_seen_at', [domain.id])).fix_seen_at;
    return { connected: foundInPage || Boolean(seenRecently), foundInPage, otherKey, seenAt, error };
  });
}

/** The data-site key of an AccessBellFix script tag in the page, if there is one. */
export function installedKey(html) {
  for (const tag of String(html).match(/<script\b[^>]*>/gi) || []) {
    if (!/\/fix\.js\b/i.test(tag)) continue;
    const m = tag.match(/data-site\s*=\s*["']?([A-Za-z0-9_-]{16,40})/i);
    if (m) return m[1];
  }
  return null;
}

function validateFix(input) {
  const kind = String(input?.kind || '');
  if (!FIX_KINDS[kind]) throw badRequest('Choose what to fix.');
  const value = String(input?.value || '').trim();
  let selector = String(input?.selector || '').trim();
  if (kind === 'lang') {
    selector = 'html';
    if (!/^[a-zA-Z]{2,3}(-[A-Za-z0-9]{2,8}){0,2}$/.test(value)) throw badRequest('Enter a language code, such as en or en-US.');
  } else {
    if (!selector || selector.length > 300) throw badRequest('Enter a CSS selector for the element, such as img.hero or #search-button.');
    if (!value || value.length > 300) throw badRequest('Enter the text to use, up to 300 characters.');
  }
  return { kind, selector, value };
}

export async function addFix(ctx, domainId, input) {
  requireRole(ctx, 'member');
  return needsMigration(async () => {
    const domain = await getDomain(ctx, domainId);
    const fix = validateFix(input);
    const [{ n }] = await query('select count(*)::int as n from app.fixes where domain_id = $1', [domain.id]);
    if (n >= MAX_FIXES) throw badRequest(`A domain can have up to ${MAX_FIXES} fixes.`);
    const row = await one(
      `insert into app.fixes (domain_id, kind, selector, value, created_by) values ($1, $2, $3, $4, $5)
       returning id, kind, selector, value, enabled, created_at`,
      [domain.id, fix.kind, fix.selector, fix.value, ctx.user.id],
    );
    await logActivity(ctx, domain.id, 'fix.added', { kind: fix.kind, selector: fix.selector, value: fix.value });
    return { fix: row };
  });
}

export async function updateFix(ctx, domainId, fixId, { enabled, remove }) {
  requireRole(ctx, 'member');
  return needsMigration(async () => {
    const domain = await getDomain(ctx, domainId);
    if (!/^[0-9a-f-]{36}$/i.test(String(fixId || ''))) throw notFound('Fix not found.');
    const rows = remove
      ? await query('delete from app.fixes where id = $1 and domain_id = $2 returning kind, selector, value', [fixId, domain.id])
      : await query('update app.fixes set enabled = $3 where id = $1 and domain_id = $2 returning kind, selector, value', [fixId, domain.id, enabled === true]);
    if (!rows.length) throw notFound('Fix not found.');
    const { kind, selector, value } = rows[0];
    await logActivity(ctx, domain.id, remove ? 'fix.removed' : enabled === true ? 'fix.enabled' : 'fix.disabled', { kind, selector, value });
    return { status: 'ok' };
  });
}

// ---------- PageAssist toolbar ----------

/** Turn the visitor toolbar on or off, and choose which corner it sits in. */
export async function setToolbar(ctx, domainId, input) {
  requireRole(ctx, 'admin');
  const domain = await getDomain(ctx, domainId);
  const toolbar = { enabled: input?.enabled === true, position: input?.position === 'left' ? 'left' : 'right' };
  await query(`update app.domains set settings = jsonb_set(settings, '{toolbar}', $2::jsonb) where id = $1`, [domain.id, JSON.stringify(toolbar)]);
  await logActivity(ctx, domain.id, 'toolbar.updated', toolbar);
  return { toolbar };
}

export async function getToolbar(ctx, domainId) {
  const domain = await getDomain(ctx, domainId);
  const t = domain.settings?.toolbar || {};
  return { toolbar: { enabled: t.enabled === true, position: t.position === 'left' ? 'left' : 'right' } };
}

// ---------- AccessBellFix (public, called by the script on the customer's site) ----------

/** The approved fixes for a site key. Only served while the account has dashboard access. */
export async function publicFixRules(key) {
  if (!validKey(key)) throw notFound('Unknown site.');
  return needsMigration(async () => {
    const domain = await withAccessRule((rule) =>
      one(
        `select d.id, d.fix_seen_at, d.settings->'toolbar' as toolbar, ${rule} as has_access
           from app.domains d join app.accounts a on a.id = d.account_id where d.site_key = $1`,
        [key],
      ),
    );
    if (!domain) throw notFound('Unknown site.');
    if (!domain.fix_seen_at || Date.now() - new Date(domain.fix_seen_at).getTime() > 10 * 60 * 1000) {
      await query('update app.domains set fix_seen_at = now() where id = $1', [domain.id]);
    }
    if (!domain.has_access) return { fixes: [] };
    const fixes = await query('select kind, selector, value from app.fixes where domain_id = $1 and enabled order by created_at asc', [domain.id]);
    const toolbar = domain.toolbar?.enabled ? { position: domain.toolbar.position === 'left' ? 'left' : 'right' } : null;
    return toolbar ? { fixes, toolbar } : { fixes };
  });
}

// ---------- Accessibility statement ----------

const ORG_TYPES = ['business', 'nonprofit', 'government', 'education', 'other'];
const EMAIL = /^[^\s@<>()[\]\\,;:"]{1,64}@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
const text = (v, max) => String(v ?? '').trim().slice(0, max);

export function validateStatement(input) {
  const s = {
    orgType: ORG_TYPES.includes(input?.orgType) ? input.orgType : 'business',
    org: text(input?.org, 120),
    email: text(input?.email, 254).toLowerCase(),
    phone: text(input?.phone, 40),
    status: input?.status === 'conformant' ? 'conformant' : 'partial',
    notes: text(input?.notes, 2000),
    links: [],
  };
  if (!s.org) throw badRequest('Enter your organization or company name.');
  if (!EMAIL.test(s.email)) throw badRequest('Enter a valid contact email address.');
  if (s.phone && !/^[0-9+().\s-]{5,40}$/.test(s.phone)) throw badRequest('Enter a valid phone number, or leave it empty.');
  for (const l of (Array.isArray(input?.links) ? input.links : []).slice(0, 5)) {
    const label = text(l?.label, 60);
    const url = text(l?.url, 500);
    if (!label && !url) continue;
    if (!label || !/^https?:\/\/[^\s]+$/i.test(url)) throw badRequest('Each related link needs a name and a full web address starting with https://.');
    s.links.push({ label, url });
  }
  return s;
}

export async function getStatement(ctx, domainId) {
  return needsMigration(async () => {
    const domain = await getDomain(ctx, domainId);
    const siteKey = await siteKeyFor(domain);
    // No settings here: they can hold secret header values.
    return { statement: domain.statement, siteKey, hostname: domain.hostname };
  });
}

export async function saveStatement(ctx, domainId, input) {
  requireRole(ctx, 'admin');
  return needsMigration(async () => {
    const domain = await getDomain(ctx, domainId);
    const statement = { ...validateStatement(input), updatedAt: new Date().toISOString() };
    await query('update app.domains set statement = $2 where id = $1', [domain.id, JSON.stringify(statement)]);
    await logActivity(ctx, domain.id, 'statement.saved', { organization: statement.org, status: statement.status });
    return { statement, siteKey: await siteKeyFor(domain) };
  });
}

/** The hosted statement: the saved answers plus when the site was last checked. */
export async function publicStatement(key) {
  if (!validKey(key)) throw notFound('Statement not found.');
  return needsMigration(async () => {
    const domain = await one('select id, hostname, settings, statement from app.domains where site_key = $1', [key]);
    if (!domain?.statement) throw notFound('Statement not found.');
    const last = await one(
      `select max(created_at) as checked_at from app.scans where domain_id = $1 and status = 'done'`,
      [domain.id],
    );
    const settings = domain.settings || {};
    return {
      hostname: domain.hostname,
      statement: domain.statement,
      standard: { version: settings.wcagVersion || '2.2', level: settings.wcagLevel || 'AA' },
      lastCheckedAt: last?.checked_at || null,
    };
  });
}

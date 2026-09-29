// Integration tests for the customer app API against a real Postgres.
// Supabase Auth is replaced by a small fake GoTrue server.
//
// Run with a disposable database, for example:
//   TEST_DATABASE_URL=postgres://postgres@127.0.0.1:54329/postgres npm test
// Skipped when TEST_DATABASE_URL is not set.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { startFakeAuth } from './fixtures/fake-auth.js';

const ADMIN_URL = process.env.TEST_DATABASE_URL;
const skip = !ADMIN_URL && 'TEST_DATABASE_URL not set';
const DB_NAME = `ab_app_test_${process.pid}`;
const ORIGIN = 'http://localhost:4321';

let fake;
let handle;
let db;
let dbModule;
let billing;
let domainsModule;
let scanning;
let monitoring;

// ---------- Helpers ----------

class Client {
  constructor(ip) {
    this.ip = ip;
    this.jar = {};
  }
  async call(method, route, body) {
    const headers = { 'x-real-ip': this.ip, host: 'localhost:4321' };
    const cookie = Object.entries(this.jar).map(([k, v]) => `${k}=${v}`).join('; ');
    if (cookie) headers.cookie = cookie;
    if (method !== 'GET') {
      headers.origin = ORIGIN;
      headers['content-type'] = 'application/json';
    }
    const [path, qs] = route.split('?');
    const url = `${ORIGIN}/api/app?route=${encodeURIComponent(path)}${qs ? '&' + qs : ''}`;
    const res = await handle(new Request(url, { method, headers, body: method === 'GET' ? undefined : JSON.stringify(body || {}) }));
    for (const c of res.headers.getSetCookie()) {
      const [pair, ...attrs] = c.split(';');
      const [k, v] = pair.split('=');
      if (attrs.some((a) => a.trim() === 'Max-Age=0')) delete this.jar[k];
      else this.jar[k] = v;
    }
    return { status: res.status, body: await res.json(), headers: res.headers };
  }
  get(route) {
    return this.call('GET', route);
  }
  post(route, body) {
    return this.call('POST', route, body);
  }
}

/** What the site owner does by hand in Supabase after a customer pays. */
async function markSubscriber(accountId, status = 'Subscriber') {
  await db.query(
    `update app.profiles set status = $2
      where user_id in (select user_id from app.account_members where account_id = $1 and role = 'owner')`,
    [accountId, status],
  );
}

async function activate(accountId, quantity = 2, { subscriber = true } = {}) {
  const sub = {
    id: `sub_${crypto.randomUUID().slice(0, 8)}`,
    customer: `cus_${crypto.randomUUID().slice(0, 8)}`,
    status: 'trialing',
    trial_end: Math.floor(Date.now() / 1000) + 3 * 86400,
    items: { data: [{ quantity, current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400 }] },
  };
  const event = {
    id: `evt_${crypto.randomUUID()}`,
    type: 'checkout.session.completed',
    data: { object: { mode: 'subscription', client_reference_id: accountId, customer: sub.customer, subscription: sub.id } },
  };
  const result = await billing.handleStripeEvent(event, { fetchSubscription: async () => sub });
  if (subscriber) await markSubscriber(accountId);
  return { result, sub, event };
}

const fakeReport = (issues) => ({
  engine: 'browser',
  standard: { id: 'wcag22-AA', label: 'WCAG 2.2 Level AA' },
  score: 80,
  summary: { critical: 0, serious: issues.reduce((n, i) => n + i.count, 0), moderate: 0, minor: 0, issues: issues.reduce((n, i) => n + i.count, 0), rulesFailed: issues.length, rulesPassed: 10 },
  issues,
  passes: [],
  review: [],
  notes: [],
  finalUrl: 'https://example.com/',
});

// ---------- Setup ----------

before(async () => {
  if (skip) return;
  const admin = new pg.Client({ connectionString: ADMIN_URL });
  await admin.connect();
  await admin.query(`drop database if exists ${DB_NAME}`);
  await admin.query(`create database ${DB_NAME}`);
  await admin.end();

  const dbUrl = ADMIN_URL.replace(/\/[^/]*$/, `/${DB_NAME}`);
  db = new pg.Pool({ connectionString: dbUrl });
  await db.query(readFileSync(new URL('./fixtures/supabase-stub.sql', import.meta.url), 'utf8'));
  await db.query(readFileSync(new URL('../supabase/migrations/0001_app_schema.sql', import.meta.url), 'utf8'));
  await db.query(readFileSync(new URL('../supabase/migrations/0002_onboarding.sql', import.meta.url), 'utf8'));
  await db.query(readFileSync(new URL('../supabase/migrations/0003_subscriber_access.sql', import.meta.url), 'utf8'));
  await db.query(readFileSync(new URL('../supabase/migrations/0004_subscriber_emails.sql', import.meta.url), 'utf8'));
  await db.query(readFileSync(new URL('../supabase/migrations/0005_domain_setup.sql', import.meta.url), 'utf8'));

  fake = await startFakeAuth(db);
  const { port } = fake.server.address();
  Object.assign(process.env, {
    DATABASE_URL: dbUrl,
    SUPABASE_URL: `http://127.0.0.1:${port}`,
    SUPABASE_ANON_KEY: 'anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'service-key',
    STRIPE_PAYMENT_LINK: 'https://buy.stripe.com/test_link',
  });
  delete process.env.BROWSER_WS_ENDPOINT;

  ({ handle } = await import('../server/app/router.js'));
  dbModule = await import('../server/app/db.js');
  billing = await import('../server/app/billing.js');
  domainsModule = await import('../server/app/domains.js');
  scanning = await import('../server/app/scanning.js');
  monitoring = await import('../server/app/monitoring.js');
});

after(async () => {
  if (skip) return;
  await dbModule?.resetPool();
  await db?.end();
  fake?.server.close();
  const admin = new pg.Client({ connectionString: ADMIN_URL });
  await admin.connect();
  await admin.query(`drop database if exists ${DB_NAME} with (force)`);
  await admin.end();
});

// ---------- Tests ----------

test('signup creates an owner account and a secure session', { skip }, async () => {
  const owner = new Client('10.0.0.1');
  const signup = await owner.post('auth/signup', { email: 'owner@acme.test', password: 'correct horse' });
  assert.equal(signup.status, 200);
  assert.equal(signup.body.status, 'signed_in');
  const setCookie = signup.headers.getSetCookie();
  assert.ok(setCookie.every((c) => /HttpOnly/.test(c) && /Path=\/api/.test(c) && /SameSite=Lax/.test(c)));

  const me = await owner.get('me');
  assert.equal(me.status, 200);
  assert.equal(me.body.role, 'owner');
  assert.equal(me.body.subscribed, false);
  assert.equal(me.body.billing.domainQuota, 0);
});

test('with email confirmation on, sign-up asks the person to confirm instead of failing', { skip }, async () => {
  fake.state.confirmEmail = true;
  try {
    const c = new Client('10.0.0.5');
    const signup = await c.post('auth/signup', { email: 'confirm-me@acme.test', password: 'correct horse' });
    assert.equal(signup.status, 200);
    assert.equal(signup.body.status, 'confirm_email');
    assert.equal(signup.headers.getSetCookie().length, 0, 'no session until the email is confirmed');

    // An address that already has an account gets the same answer.
    const again = await c.post('auth/signup', { email: 'owner@acme.test', password: 'another pass' });
    assert.equal(again.status, 200);
    assert.equal(again.body.status, 'confirm_email');

    const login = await c.post('auth/login', { email: 'confirm-me@acme.test', password: 'correct horse' });
    assert.equal(login.status, 400);
    assert.equal(login.body.code, 'email_not_confirmed');

    const resend = await c.post('auth/resend', { email: 'confirm-me@acme.test' });
    assert.equal(resend.status, 200);
    assert.equal((await c.post('auth/resend', { email: 'mailer-down@example.com' })).body.code, 'email_send_failed');
  } finally {
    fake.state.confirmEmail = false;
  }
});

test('signing up with a registered email points to sign in', { skip }, async () => {
  const c = new Client('10.0.0.6');
  const r = await c.post('auth/signup', { email: 'owner@acme.test', password: 'another pass' });
  assert.equal(r.status, 400);
  assert.match(r.body.error, /already exists/);
});

test('requests without a session or from another origin are rejected', { skip }, async () => {
  const anon = new Client('10.0.0.2');
  assert.equal((await anon.get('me')).status, 401);
  const res = await handle(
    new Request(`${ORIGIN}/api/app?route=domains`, {
      method: 'POST',
      headers: { origin: 'https://evil.example', 'content-type': 'application/json' },
      body: '{}',
    }),
  );
  assert.equal(res.status, 403);
});

test('wrong password gives a generic error', { skip }, async () => {
  const c = new Client('10.0.0.3');
  const r = await c.post('auth/login', { email: 'owner@acme.test', password: 'wrong password' });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, 'Email or password is incorrect.');
});

test('expired access token is refreshed from the refresh cookie', { skip }, async () => {
  const c = new Client('10.0.0.4');
  await c.post('auth/login', { email: 'owner@acme.test', password: 'correct horse' });
  const oldAt = c.jar.ab_at;
  fake.expire(decodeURIComponent(oldAt));
  const me = await c.get('me');
  assert.equal(me.status, 200);
  assert.notEqual(c.jar.ab_at, oldAt, 'a new access token cookie was set');
});

test('paid features require a subscription; checkout link carries the account id', { skip }, async () => {
  const owner = new Client('10.0.1.1');
  await owner.post('auth/login', { email: 'owner@acme.test', password: 'correct horse' });
  const blocked = await owner.post('domains', { url: 'example.com' });
  assert.equal(blocked.status, 403);
  assert.equal(blocked.body.code, 'access_pending');

  const me = await owner.get('me');
  const checkout = await owner.get('billing/checkout');
  const link = new URL(checkout.body.url);
  assert.equal(link.origin + link.pathname, 'https://buy.stripe.com/test_link');
  assert.equal(link.searchParams.get('client_reference_id'), me.body.account.id);
  assert.equal(link.searchParams.get('prefilled_email'), 'owner@acme.test');
});

test('an admin (ADMIN_EMAILS) gets a dashboard and can add a domain without subscribing', { skip }, async () => {
  process.env.ADMIN_EMAILS = 'Site-Admin@ops.test, other@example.com';
  try {
    const admin = new Client('10.0.1.9');
    await admin.post('auth/signup', { email: 'site-admin@ops.test', password: 'correct horse' });
    const me = await admin.get('me');
    assert.equal(me.body.subscribed, true);
    assert.equal(me.body.billing.status, 'active');
    assert.ok(me.body.billing.domainQuota > 0);

    const created = await admin.post('domains', { url: 'admin-example.com' });
    assert.equal(created.status, 200);
  } finally {
    delete process.env.ADMIN_EMAILS;
  }
});

test('a non-admin still needs to subscribe', { skip }, async () => {
  const someone = new Client('10.0.1.10');
  await someone.post('auth/signup', { email: 'not-admin@acme.test', password: 'correct horse' });
  const me = await someone.get('me');
  assert.equal(me.body.subscribed, false);
  assert.equal(me.body.billing.domainQuota, 0);
});

test('a new account stays pending until marked Subscriber, then teammates share access', { skip }, async () => {
  const c = new Client('10.0.1.11');
  await c.post('auth/signup', { email: 'pending-owner@acme.test', password: 'correct horse' });
  const me = await c.get('me');
  assert.equal(me.status, 200);
  assert.equal(me.body.subscribed, false);
  assert.equal((await c.get('billing/checkout')).status, 200, 'the payment link stays available');
  for (const route of ['domains', 'team']) {
    const r = await c.get(route);
    assert.equal(r.status, 403, route);
    assert.equal(r.body.code, 'access_pending');
  }

  await markSubscriber(me.body.account.id, '  subscriber ');
  const on = await c.get('me');
  assert.equal(on.body.subscribed, true, 'case and spaces do not matter');
  assert.equal(on.body.billing.domainQuota, 1, 'a manual Subscriber can add one domain without a Stripe quota');
  assert.equal((await c.post('domains', { url: 'pending-owner-site.com' })).status, 200);

  await markSubscriber(me.body.account.id, 'Pending');
  assert.equal((await c.get('domains')).status, 403, 'setting it back removes access');
});

test('an email in app.subscriber_emails has dashboard access without a Subscriber status', { skip }, async () => {
  const c = new Client('10.0.1.12');
  await c.post('auth/signup', { email: 'listed-owner@acme.test', password: 'correct horse' });
  const me = await c.get('me');
  assert.equal(me.body.subscribed, false);

  await db.query(`insert into app.subscriber_emails (email, note) values (' Listed-Owner@Acme.test '::text, 'test') on conflict do nothing`).catch(() => {});
  await db.query(`insert into app.subscriber_emails (email) values ('listed-owner@acme.test') on conflict do nothing`);
  assert.equal((await c.get('me')).body.subscribed, true);
  assert.equal((await c.get('domains')).status, 200);

  await db.query(`delete from app.subscriber_emails where email = 'listed-owner@acme.test'`);
  assert.equal((await c.get('me')).body.subscribed, false);
});

test('the site owner is in the seeded allowlist and the migration is repeatable', { skip }, async () => {
  const { rows } = await db.query(`select email from app.subscriber_emails where email = 'mindfulmarketingad@gmail.com'`);
  assert.equal(rows.length, 1);
  await db.query(readFileSync(new URL('../supabase/migrations/0004_subscriber_emails.sql', import.meta.url), 'utf8'));
  assert.equal((await db.query('select count(*)::int as n from app.subscriber_emails where email = $1', ['mindfulmarketingad@gmail.com'])).rows[0].n, 1);
});

test('access falls back cleanly while migrations 0003 and 0004 are not run yet', { skip }, async () => {
  const c = new Client('10.0.1.13');
  await c.post('auth/signup', { email: 'fallback-owner@acme.test', password: 'correct horse' });
  const id = (await c.get('me')).body.account.id;
  await markSubscriber(id);
  await db.query('alter table app.subscriber_emails rename to subscriber_emails_off');
  try {
    assert.equal((await c.get('me')).body.subscribed, true, 'without 0004, the Subscriber status still works');
    await db.query('alter table app.profiles rename column status to status_off');
    try {
      assert.equal((await c.get('me')).body.subscribed, false, 'without 0003, only an active Stripe subscription counts');
    } finally {
      await db.query('alter table app.profiles rename column status_off to status');
    }
  } finally {
    await db.query('alter table app.subscriber_emails_off rename to subscriber_emails');
  }
});

test('Stripe webhook signatures are verified', { skip }, () => {
  const secret = 'whsec_test';
  const body = '{"id":"evt_1"}';
  const t = Math.floor(Date.now() / 1000);
  const sig = crypto.createHmac('sha256', secret).update(`${t}.${body}`).digest('hex');
  assert.equal(billing.verifyStripeSignature(body, `t=${t},v1=${sig}`, secret), true);
  assert.equal(billing.verifyStripeSignature(body + ' ', `t=${t},v1=${sig}`, secret), false);
  assert.equal(billing.verifyStripeSignature(body, `t=${t},v1=${sig}`, 'whsec_other'), false);
  assert.equal(billing.verifyStripeSignature(body, `t=${t - 3600},v1=${sig}`, secret), false, 'old timestamps are rejected');
  assert.equal(billing.verifyStripeSignature(body, '', secret), false);
});

test('checkout completion activates the account with a domain quota; duplicates are ignored', { skip }, async () => {
  const owner = new Client('10.0.1.2');
  await owner.post('auth/login', { email: 'owner@acme.test', password: 'correct horse' });
  const me = await owner.get('me');
  const { result, event } = await activate(me.body.account.id, 2, { subscriber: false });
  assert.equal(result, 'linked');
  assert.equal(await billing.handleStripeEvent(event, { fetchSubscription: async () => ({}) }), 'duplicate');

  // Paying alone does not open the dashboard: the site owner switches it on in Supabase.
  const paid = await owner.get('me');
  assert.equal(paid.body.subscribed, false);
  assert.equal(paid.body.billing.status, 'trialing');
  assert.equal((await owner.get('domains')).body.code, 'access_pending');
  await markSubscriber(me.body.account.id);

  const after = await owner.get('me');
  assert.equal(after.body.subscribed, true);
  assert.equal(after.body.billing.status, 'trialing');
  assert.equal(after.body.billing.domainQuota, 2);
});

test('domains respect the quota and monitor the home page', { skip }, async () => {
  const owner = new Client('10.0.1.3');
  await owner.post('auth/login', { email: 'owner@acme.test', password: 'correct horse' });
  const a = await owner.post('domains', { url: 'https://www.example.com/some/path' });
  assert.equal(a.status, 200);
  assert.equal(a.body.domain.hostname, 'example.com');
  const dup = await owner.post('domains', { url: 'example.com' });
  assert.equal(dup.status, 400);
  assert.equal((await owner.post('domains', { url: 'staging.example.org' })).status, 200);
  const over = await owner.post('domains', { url: 'third.example.net' });
  assert.equal(over.status, 402);
  assert.match(over.body.error, /covers 2 domains/);
  assert.equal((await owner.post('domains', { url: 'http://127.0.0.1' })).status, 400, 'private targets are refused');

  const list = await owner.get('domains');
  assert.equal(list.body.domains.length, 2);
  assert.equal(list.body.domains[0].monitored, 1);
});

test('a domain monitors at most 25 URLs, and pages must be on the domain', { skip }, async () => {
  const owner = new Client('10.0.1.4');
  await owner.post('auth/login', { email: 'owner@acme.test', password: 'correct horse' });
  const { body } = await owner.get('domains');
  const domain = body.domains.find((d) => d.hostname === 'example.com');
  for (let i = 1; i <= 24; i++) {
    const r = await owner.post('pages', { domainId: domain.id, url: `/page-${i}` });
    assert.equal(r.status, 200, `page ${i}`);
  }
  const over = await owner.post('pages', { domainId: domain.id, url: '/page-25' });
  assert.equal(over.status, 400);
  assert.equal(over.body.code, 'page_limit');
  const offsite = await owner.post('pages', { domainId: domain.id, url: 'https://other.test/' });
  assert.equal(offsite.status, 400);

  const overview = await owner.get(`domain?id=${domain.id}`);
  assert.equal(overview.body.monitoredCount, 25);
  const first = overview.body.pages.find((p) => p.url.endsWith('/page-1'));
  assert.equal((await owner.post('pages/monitor', { id: first.id, monitored: false })).status, 200);
  assert.equal((await owner.post('pages', { domainId: domain.id, url: '/page-25' })).status, 200);
});

test('settings are validated and header values are never returned', { skip }, async () => {
  const owner = new Client('10.0.1.5');
  await owner.post('auth/login', { email: 'owner@acme.test', password: 'correct horse' });
  const { body } = await owner.get('domains');
  const id = body.domains[0].id;
  const bad = await owner.post('domain/settings', { id, settings: { wcagLevel: 'AAAA' } });
  assert.equal(bad.status, 400);
  const ok = await owner.post('domain/settings', {
    id,
    settings: { wcagVersion: '2.1', wcagLevel: 'AAA', devices: ['desktop', 'mobile'], delayMs: 1500, scroll: true, headers: [{ name: 'Authorization', value: 'Basic c2VjcmV0' }], exclude: '/blog/*\n/tag' },
  });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.settings.headers[0].value, '********');
  const overview = await owner.get(`domain?id=${id}`);
  assert.equal(overview.body.domain.settings.wcagLevel, 'AAA');
  assert.ok(!JSON.stringify(overview.body).includes('c2VjcmV0'), 'secret header value not exposed');

  // Saving the masked value keeps the stored secret.
  await owner.post('domain/settings', { id, settings: { headers: [{ name: 'Authorization', value: '********' }] } });
  const row = await db.query('select settings from app.domains where id = $1', [id]);
  assert.equal(row.rows[0].settings.headers[0].value, 'Basic c2VjcmV0');
  await owner.post('domain/settings', { id, settings: { wcagVersion: '2.2', wcagLevel: 'AA', devices: ['desktop'], headers: [], exclude: [] } });
});

test('roles: invite, permissions and removal', { skip }, async () => {
  const owner = new Client('10.0.2.1');
  await owner.post('auth/login', { email: 'owner@acme.test', password: 'correct horse' });
  assert.equal((await owner.post('team/invite', { email: 'viewer@acme.test', role: 'viewer' })).status, 200);
  assert.equal((await owner.post('team/invite', { email: 'admin@acme.test', role: 'admin' })).status, 200);
  assert.equal((await owner.post('team/invite', { email: 'viewer@acme.test', role: 'viewer' })).status, 400, 'no duplicates');

  const viewer = new Client('10.0.2.2');
  const login = await viewer.post('auth/login', { email: 'viewer@acme.test', password: 'invited-password' });
  assert.equal(login.status, 200);
  const vme = await viewer.get('me');
  assert.equal(vme.body.role, 'viewer');
  assert.equal((await viewer.get('domains')).status, 200, 'viewers can read');
  assert.equal((await viewer.post('domains', { url: 'new.example' })).status, 403, 'viewers cannot add domains');
  assert.equal((await viewer.post('team/invite', { email: 'x@acme.test', role: 'member' })).status, 403);
  assert.equal((await viewer.get('billing/checkout')).status, 403, 'only owners handle billing');

  const admin = new Client('10.0.2.3');
  await admin.post('auth/login', { email: 'admin@acme.test', password: 'invited-password' });
  assert.equal((await admin.post('team/invite', { email: 'other-admin@acme.test', role: 'admin' })).status, 403, 'only owners add admins');
  const team = await admin.get('team');
  const viewerRow = team.body.members.find((m) => m.email === 'viewer@acme.test');
  const ownerRow = team.body.members.find((m) => m.role === 'owner');
  assert.equal((await admin.post('team/role', { userId: viewerRow.user_id, role: 'member' })).status, 200);
  assert.equal((await admin.post('team/remove', { userId: ownerRow.user_id })).status, 403);
  assert.equal((await admin.post('team/remove', { userId: viewerRow.user_id })).status, 200);
  const fallback = await viewer.get('me');
  assert.equal(fallback.status, 200, 'removed user falls back to their own new account');
  assert.notEqual(fallback.body.account.id, vme.body.account.id);
  assert.equal(fallback.body.subscribed, false, 'which is not activated');
  assert.equal((await viewer.get('domains')).body.code, 'access_pending');
});

test('scans are stored per device, update the page, and feed the overview with component grouping', { skip }, async () => {
  const owner = new Client('10.0.3.1');
  await owner.post('auth/login', { email: 'owner@acme.test', password: 'correct horse' });
  const { body } = await owner.get('domains');
  const domain = body.domains.find((d) => d.hostname === 'example.com');
  await owner.post('domain/settings', { id: domain.id, settings: { devices: ['desktop', 'mobile'] } });
  const overview = await owner.get(`domain?id=${domain.id}`);
  const pages = overview.body.pages.filter((p) => p.monitored).slice(0, 3);

  const navButton = '<button class="nav__toggle" aria-expanded="false"></button>';
  const issue = { id: 'button-name', title: 'Buttons must have discernible text', impact: 'critical', wcag: [{ sc: '4.1.2', level: 'A' }], count: 1, samples: [navButton] };
  const extras = {
    passes: [{ id: 'image-alt', title: 'Images have alternative text', wcag: [{ sc: '1.1.1', level: 'A' }] }],
    review: [{ id: 'color-contrast', title: 'Check text contrast', wcag: [{ sc: '1.4.3', level: 'AA' }], count: 2 }],
  };
  const browser = async (url, opts) => ({ ...fakeReport([issue]), ...extras, device: opts.device, finalUrl: url });
  process.env.BROWSER_WS_ENDPOINT = 'ws://fake';
  try {
    for (const p of pages) {
      const page = await db.query('select p.*, d.settings from app.pages p join app.domains d on d.id = p.domain_id where p.id = $1', [p.id]);
      const stored = await scanning.scanPage(page.rows[0], { accountId: page.rows[0].account_id || (await owner.get('me')).body.account.id, deps: { browser } });
      assert.equal(stored.length, 2, 'desktop and mobile');
    }
  } finally {
    delete process.env.BROWSER_WS_ENDPOINT;
  }

  const after = await owner.get(`domain?id=${domain.id}`);
  assert.equal(after.body.score, 80);
  assert.equal(after.body.rules[0].id, 'button-name');
  assert.equal(after.body.rules[0].pages, 3);
  assert.equal(after.body.components[0].component, 'button.nav__toggle');
  assert.equal(after.body.components[0].pages, 3);
  assert.equal(after.body.criteria[0].sc, '4.1.2');
  // Coverage by success criterion, review items, history and rule details for the dashboard.
  assert.deepEqual(after.body.coverage['4.1.2'], { issues: 6, passed: false, review: 0 });
  assert.equal(after.body.coverage['1.1.1'].passed, true);
  assert.equal(after.body.coverage['1.4.3'].review, 12);
  assert.equal(after.body.review[0].id, 'color-contrast');
  assert.equal(after.body.history.length, 1);
  assert.equal(after.body.history[0].pages, 3);
  assert.equal(after.body.rules[0].samples[0].code, navButton);
  assert.ok(pages.some((p) => p.url === after.body.rules[0].samples[0].url));
  assert.equal(after.body.resolved, 0);
  assert.ok(after.body.lastScanAt);
  assert.ok((await owner.get('me')).body.account.members >= 1);

  // Fixing the issue on one page counts as resolved (desktop and mobile), then restore it.
  const rescan = async (pageId, issues) => {
    const page = (await db.query('select p.*, d.settings from app.pages p join app.domains d on d.id = p.domain_id where p.id = $1', [pageId])).rows[0];
    const fake = async (url, opts) => ({ ...fakeReport(issues), device: opts.device, finalUrl: url });
    process.env.BROWSER_WS_ENDPOINT = 'ws://fake';
    try {
      await scanning.scanPage(page, { accountId: (await owner.get('me')).body.account.id, deps: { browser: fake } });
    } finally {
      delete process.env.BROWSER_WS_ENDPOINT;
    }
  };
  await rescan(pages[2].id, []);
  assert.equal((await owner.get(`domain?id=${domain.id}`)).body.resolved, 2);
  const listed = (await owner.get('domains')).body.domains.find((d) => d.id === domain.id);
  assert.equal(listed.resolved, 2, 'the domain list shows resolved issues');
  assert.equal(listed.worstImpact, 'critical');
  assert.equal(listed.failedPages, 0);
  assert.ok(listed.pages >= listed.monitored);
  await rescan(pages[2].id, [issue]);

  const history = await owner.get(`page?id=${pages[0].id}`);
  assert.equal(history.body.scans.length, 2);
  const scan = await owner.get(`scan?id=${history.body.scans[0].id}`);
  assert.equal(scan.status, 200);
  assert.equal(scan.body.scan.issues[0].id, 'button-name');

  const outsider = new Client('10.0.3.2');
  await outsider.post('auth/signup', { email: 'mallory@evil.test', password: 'correct horse' });
  await markSubscriber((await outsider.get('me')).body.account.id);
  assert.equal((await outsider.get(`scan?id=${history.body.scans[0].id}`)).status, 404, 'other accounts cannot read scans');
  assert.equal((await outsider.get(`domain?id=${domain.id}`)).status, 404);
});

test('monitoring flags only new serious issues', { skip }, async () => {
  const page = (await db.query(`select p.id from app.pages p join app.domains d on d.id = p.domain_id where d.hostname = 'example.com' and p.monitored and p.last_scan_id is not null limit 1`)).rows[0];
  const newIssue = { id: 'image-alt', title: 'Images must have alternative text', impact: 'critical', wcag: [{ sc: '1.1.1', level: 'A' }], count: 2, samples: ['<img src="a">'] };
  const oldIssue = { id: 'button-name', title: 'Buttons must have discernible text', impact: 'critical', wcag: [{ sc: '4.1.2', level: 'A' }], count: 1, samples: ['<button></button>'] };
  const browser = async (url, opts) => ({ ...fakeReport([oldIssue, newIssue]), device: opts.device });
  process.env.BROWSER_WS_ENDPOINT = 'ws://fake';
  try {
    const result = await monitoring.monitorPage(page.id, { deps: { browser } });
    assert.equal(result.skipped, false);
    assert.deepEqual([...new Set(result.regressions.map((r) => r.rule))], ['image-alt']);
    const due = await monitoring.pagesDueForMonitoring();
    assert.ok(due.length >= 25);
  } finally {
    delete process.env.BROWSER_WS_ENDPOINT;
  }
});

test('discovery reads sitemaps and home page links, and applies URL rules', { skip }, async () => {
  const owner = new Client('10.0.4.1');
  await owner.post('auth/login', { email: 'owner@acme.test', password: 'correct horse' });
  const me = await owner.get('me');
  const { body } = await owner.get('domains');
  const domain = body.domains.find((d) => d.hostname === 'staging.example.org');
  await owner.post('domain/settings', { id: domain.id, settings: { exclude: ['/private/*'], includeSubdomains: true } });

  const files = {
    'https://staging.example.org/robots.txt': 'User-agent: *\nSitemap: https://staging.example.org/sitemap-index.xml',
    'https://staging.example.org/sitemap-index.xml': '<sitemapindex><sitemap><loc>https://staging.example.org/pages.xml</loc></sitemap></sitemapindex>',
    'https://staging.example.org/pages.xml': '<urlset><url><loc>https://staging.example.org/about</loc></url><url><loc>https://staging.example.org/private/x</loc></url><url><loc>https://evil.test/x</loc></url></urlset>',
    'https://staging.example.org/': '<a href="/contact">c</a><a href="https://docs.staging.example.org/start">d</a><a href="/file.pdf">f</a><a href="mailto:x@y">m</a>',
  };
  const fetcher = async (url) => {
    if (!(url in files)) throw new Error('404');
    return { html: files[url], text: files[url], finalUrl: url };
  };
  const ctx = { user: { id: me.body.user.id }, account: (await db.query('select * from app.accounts where id = $1', [me.body.account.id])).rows[0], role: 'owner', subscriber: true };
  const result = await domainsModule.discoverPages(ctx, domain.id, { fetcher });
  const urls = (await db.query('select url, source, monitored from app.pages where domain_id = $1 order by url', [domain.id])).rows;
  const found = urls.map((u) => u.url);
  assert.ok(found.includes('https://staging.example.org/about'));
  assert.ok(found.includes('https://staging.example.org/contact'));
  assert.ok(found.includes('https://docs.staging.example.org/start'), 'subdomains included when enabled');
  assert.ok(!found.some((u) => u.includes('/private/')), 'exclude rule applied');
  assert.ok(!found.some((u) => u.includes('evil.test') || u.endsWith('.pdf')));
  assert.ok(result.added >= 3);
  assert.equal(urls.filter((u) => u.monitored).length, 1, 'discovered pages are not monitored automatically');
});

test('product tours start unfinished for new users and are remembered per user', { skip }, async () => {
  const newcomer = new Client('10.0.3.1');
  await newcomer.post('auth/signup', { email: 'newcomer@tour.test', password: 'correct horse' });
  let me = await newcomer.get('me');
  assert.deepEqual(me.body.onboarding, { dashboard: false, domain: false });

  const done = await newcomer.post('onboarding', { tour: 'dashboard' });
  assert.equal(done.status, 200);
  me = await newcomer.get('me');
  assert.deepEqual(me.body.onboarding, { dashboard: true, domain: false });

  const bad = await newcomer.post('onboarding', { tour: 'everything' });
  assert.equal(bad.status, 400);

  const other = new Client('10.0.3.2');
  await other.post('auth/signup', { email: 'other-newcomer@tour.test', password: 'correct horse' });
  assert.deepEqual((await other.get('me')).body.onboarding, { dashboard: false, domain: false });
});

test('the dashboard keeps working before the onboarding migration, which then marks existing users done', { skip }, async () => {
  const early = new Client('10.0.3.3');
  await early.post('auth/signup', { email: 'early-user@tour.test', password: 'correct horse' });
  await db.query('alter table app.profiles drop column onboarding');
  try {
    const me = await early.get('me');
    assert.equal(me.status, 200);
    assert.equal(me.body.onboarding, null);
    assert.equal((await early.post('onboarding', { tour: 'domain' })).status, 200);
  } finally {
    await db.query(readFileSync(new URL('../supabase/migrations/0002_onboarding.sql', import.meta.url), 'utf8'));
  }
  assert.deepEqual((await early.get('me')).body.onboarding, { dashboard: true, domain: true });

  // Running the migration again changes nothing for people who joined since.
  const later = new Client('10.0.3.4');
  await later.post('auth/signup', { email: 'later-user@tour.test', password: 'correct horse' });
  await db.query(readFileSync(new URL('../supabase/migrations/0002_onboarding.sql', import.meta.url), 'utf8'));
  assert.deepEqual((await later.get('me')).body.onboarding, { dashboard: false, domain: false });
});

test('logout clears the session', { skip }, async () => {
  const c = new Client('10.0.5.1');
  await c.post('auth/login', { email: 'owner@acme.test', password: 'correct horse' });
  assert.equal((await c.post('auth/logout')).status, 200);
  assert.equal((await c.get('me')).status, 401);

  // A body-less sign-out request still clears the session.
  await c.post('auth/login', { email: 'owner@acme.test', password: 'correct horse' });
  const cookie = Object.entries(c.jar).map(([k, v]) => `${k}=${v}`).join('; ');
  const res = await handle(new Request(`${ORIGIN}/api/app?route=auth/logout`, { method: 'POST', headers: { origin: ORIGIN, cookie, 'x-real-ip': c.ip } }));
  assert.equal(res.status, 200);
  assert.ok(res.headers.getSetCookie().every((x) => /Max-Age=0/.test(x)));
});

// ---------- Domain setup: sitemap, AccessBellFix and the hosted statement ----------

test('a sitemap address is validated, stored in full and read first during discovery', { skip }, async () => {
  const owner = new Client('10.0.6.1');
  await owner.post('auth/login', { email: 'owner@acme.test', password: 'correct horse' });
  const domain = (await owner.get('domains')).body.domains.find((d) => d.hostname === 'example.com');

  const offsite = await owner.post('domain/settings', { id: domain.id, settings: { sitemapUrl: 'https://other.test/sitemap.xml' } });
  assert.equal(offsite.status, 400);
  const saved = await owner.post('domain/settings', { id: domain.id, settings: { sitemapUrl: '/custom-map.xml' } });
  assert.equal(saved.status, 200);
  assert.match(saved.body.settings.sitemapUrl, /^https:\/\/(www\.)?example\.com\/custom-map\.xml$/);

  const asked = [];
  const fetcher = async (url, opts = {}) => {
    asked.push(url);
    if (url.endsWith('/custom-map.xml')) return { text: '<urlset><url><loc>https://example.com/from-custom-map</loc></url></urlset>' };
    if (opts.kind === 'text' || opts.kind === 'xml') throw new Error('not found');
    return { html: '<html><body></body></html>', finalUrl: 'https://example.com/' };
  };
  const me = await owner.get('me');
  const ctx = { user: { id: me.body.user.id }, account: (await db.query('select * from app.accounts where id = $1', [me.body.account.id])).rows[0], role: 'owner', subscriber: true };
  const result = await domainsModule.discoverPages(ctx, domain.id, { fetcher });
  assert.ok(asked.find((u) => u.endsWith('.xml')).endsWith('/custom-map.xml'), 'the given sitemap is read before the usual places');
  assert.ok(result.fromSitemap >= 1);
  await owner.post('domain/settings', { id: domain.id, settings: { sitemapUrl: '' } });
});

test('AccessBellFix: site key, approved fixes, public rules with CORS, and connection check', { skip }, async () => {
  const owner = new Client('10.0.6.2');
  await owner.post('auth/login', { email: 'owner@acme.test', password: 'correct horse' });
  const domain = (await owner.get('domains')).body.domains.find((d) => d.hostname === 'example.com');

  const setup = await owner.get(`domain/fix?id=${domain.id}`);
  assert.equal(setup.status, 200);
  assert.match(setup.body.siteKey, /^[A-Za-z0-9_-]{16,40}$/);
  assert.equal((await owner.get(`domain/fix?id=${domain.id}`)).body.siteKey, setup.body.siteKey, 'the key is stable');

  assert.equal((await owner.post('domain/fix/add', { id: domain.id, kind: 'alt', selector: '', value: 'x' })).status, 400);
  assert.equal((await owner.post('domain/fix/add', { id: domain.id, kind: 'lang', value: 'not a language' })).status, 400);
  const alt = await owner.post('domain/fix/add', { id: domain.id, kind: 'alt', selector: 'img.hero', value: 'Tent by a lake' });
  assert.equal(alt.status, 200);
  const lang = await owner.post('domain/fix/add', { id: domain.id, kind: 'lang', value: 'en-US' });
  assert.equal(lang.body.fix.selector, 'html');
  const off = await owner.post('domain/fix/add', { id: domain.id, kind: 'name', selector: '#search', value: 'Search' });
  await owner.post('domain/fix/update', { id: domain.id, fixId: off.body.fix.id, enabled: false });

  const res = await handle(new Request(`${ORIGIN}/api/app?route=fix&k=${setup.body.siteKey}`));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
  const rules = await res.json();
  assert.deepEqual(rules.fixes.map((f) => f.kind).sort(), ['alt', 'lang'], 'disabled fixes are not served');
  assert.equal((await handle(new Request(`${ORIGIN}/api/app?route=fix&k=unknown-key-0000000000`))).status, 404);

  const me = await owner.get('me');
  const ctx = { user: { id: me.body.user.id }, account: (await db.query('select * from app.accounts where id = $1', [me.body.account.id])).rows[0], role: 'owner', subscriber: true };
  const siteModule = await import('../server/app/site-setup.js');
  const installed = await siteModule.verifyFix(ctx, domain.id, { fetcher: async () => ({ html: `<script src="https://www.accessbell.co/fix.js" data-site="${setup.body.siteKey}" async></script>` }) });
  assert.equal(installed.foundInPage, true);
  assert.equal(installed.connected, true);
  const missing = await siteModule.verifyFix(ctx, domain.id, { fetcher: async () => ({ html: '<html></html>' }) });
  assert.equal(missing.foundInPage, false);
  assert.ok(missing.seenAt, 'the script loading the rules above counts as a recent connection');

  await owner.post('domain/fix/update', { id: domain.id, fixId: off.body.fix.id, remove: true });
  assert.equal((await owner.get(`domain/fix?id=${domain.id}`)).body.fixes.length, 2);
});

test('the accessibility statement is validated, saved and published at a public link', { skip }, async () => {
  const owner = new Client('10.0.6.3');
  await owner.post('auth/login', { email: 'owner@acme.test', password: 'correct horse' });
  const domain = (await owner.get('domains')).body.domains.find((d) => d.hostname === 'example.com');

  assert.equal((await owner.post('domain/statement', { id: domain.id, statement: { org: 'Acme', email: 'nope' } })).status, 400);
  assert.equal((await owner.post('domain/statement', { id: domain.id, statement: { org: 'Acme', email: 'a11y@acme.test', links: [{ label: 'Privacy', url: 'javascript:alert(1)' }] } })).status, 400);
  const saved = await owner.post('domain/statement', {
    id: domain.id,
    statement: { orgType: 'nonprofit', org: 'Acme Trails', email: 'A11y@Acme.test', phone: '+1 555 0100', links: [{ label: 'Privacy policy', url: 'https://example.com/privacy' }], notes: 'PDF menus are being replaced.' },
  });
  assert.equal(saved.status, 200);
  assert.equal(saved.body.statement.email, 'a11y@acme.test');
  assert.equal(saved.body.statement.status, 'partial', 'partially conformant is the default');

  const pub = await handle(new Request(`${ORIGIN}/api/app?route=statement&k=${saved.body.siteKey}`));
  assert.equal(pub.status, 200);
  const body = await pub.json();
  assert.equal(body.hostname, 'example.com');
  assert.equal(body.statement.org, 'Acme Trails');
  assert.ok(body.lastCheckedAt, 'shows when the site was last scanned');

  const viewer = new Client('10.0.6.4');
  await viewer.post('auth/login', { email: 'viewer@acme.test', password: 'invited-password' });
  const v = await viewer.post('domain/statement', { id: domain.id, statement: { org: 'X', email: 'x@acme.test' } });
  assert.ok([403, 404].includes(v.status), 'viewers cannot change the statement');
});

test('found pages: add pages by hand, select up to 25 to scan, and failed scans mark a partial scan', { skip }, async () => {
  const owner = new Client('10.0.7.1');
  await owner.post('auth/login', { email: 'owner@acme.test', password: 'correct horse' });
  const { body } = await owner.get('domains');
  const domain = body.domains.find((d) => d.hostname === 'example.com');

  const added = await owner.post('domain/pages/add', { id: domain.id, urls: ['/found-a', 'https://example.com/found-b', '/found-a'] });
  assert.equal(added.status, 200);
  assert.equal(added.body.pages.length, 2);
  assert.ok(added.body.pages.every((p) => !p.monitored), 'pages added by hand wait to be selected');
  assert.equal((await owner.post('domain/pages/add', { id: domain.id, urls: ['https://other.test/x'] })).status, 400);

  let overview = (await owner.get(`domain?id=${domain.id}`)).body;
  const ids = overview.pages.slice(0, 26).map((p) => p.id);
  const tooMany = await owner.post('domain/pages/select', { id: domain.id, pageIds: ids });
  assert.equal(tooMany.status, 400);
  assert.equal((await owner.post('domain/pages/select', { id: domain.id, pageIds: [] })).status, 400);

  const chosen = added.body.pages.map((p) => p.id);
  const sel = await owner.post('domain/pages/select', { id: domain.id, pageIds: chosen });
  assert.equal(sel.status, 200);
  assert.equal(sel.body.pages.length, 2);
  overview = (await owner.get(`domain?id=${domain.id}`)).body;
  assert.equal(overview.monitoredCount, 2, 'only the selected pages are monitored');

  // Pages from another account cannot be selected.
  const outsider = new Client('10.0.7.2');
  await outsider.post('auth/signup', { email: 'eve@evil.test', password: 'correct horse' });
  await markSubscriber((await outsider.get('me')).body.account.id);
  assert.equal((await outsider.post('domain/pages/select', { id: domain.id, pageIds: chosen })).status, 404);

  // A failed scan of a selected page shows as a partial scan.
  const fetcher = async () => {
    throw new Error('offline');
  };
  const page = (await db.query('select p.*, d.settings from app.pages p join app.domains d on d.id = p.domain_id where p.id = $1', [chosen[0]])).rows[0];
  await scanning.scanPage(page, { accountId: (await owner.get('me')).body.account.id, deps: { fetcher } });
  overview = (await owner.get(`domain?id=${domain.id}`)).body;
  assert.equal(overview.failedPages.length, 1);
  const listed = (await owner.get('domains')).body.domains.find((d) => d.id === domain.id);
  assert.equal(listed.failedPages, 1);
  assert.equal(listed.scannedPages, 1);
});

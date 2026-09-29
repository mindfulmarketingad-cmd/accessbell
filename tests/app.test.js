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

async function activate(accountId, quantity = 2) {
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
  assert.equal(blocked.status, 402);

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
  const { result, event } = await activate(me.body.account.id, 2);
  assert.equal(result, 'linked');
  assert.equal(await billing.handleStripeEvent(event, { fetchSubscription: async () => ({}) }), 'duplicate');

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
  assert.equal((await viewer.get('domains')).status, 200, 'removed user falls back to their own new account');
  assert.notEqual((await viewer.get('me')).body.account.id, vme.body.account.id);
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
  await rescan(pages[2].id, [issue]);

  const history = await owner.get(`page?id=${pages[0].id}`);
  assert.equal(history.body.scans.length, 2);
  const scan = await owner.get(`scan?id=${history.body.scans[0].id}`);
  assert.equal(scan.status, 200);
  assert.equal(scan.body.scan.issues[0].id, 'button-name');

  const outsider = new Client('10.0.3.2');
  await outsider.post('auth/signup', { email: 'mallory@evil.test', password: 'correct horse' });
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
  const ctx = { user: { id: me.body.user.id }, account: (await db.query('select * from app.accounts where id = $1', [me.body.account.id])).rows[0], role: 'owner' };
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

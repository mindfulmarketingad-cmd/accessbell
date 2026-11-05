// Shopify app scaffolding: signatures, ID tokens, webhooks, embedded page,
// billing stub and the theme app embed. No network, no database.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';

import { normalizeShop, verifyWebhookHmac, verifyQueryHmac, verifyIdToken, signIdToken } from '../server/shopify/verify.js';
import { seal, open } from '../server/shopify/crypto-box.js';
import { handleWebhook } from '../server/shopify/webhooks.js';
import { appPage, frameAncestors } from '../server/shopify/app-page.js';
import { createShopifyHandler, summarize } from '../server/shopify/handler.js';
import { exchangeIdToken } from '../server/shopify/admin-api.js';
import { PLANS, TRIAL_DAYS, planFromSubscriptions, planFromWebhook, accountStatusFor, nextManualScan, scheduleFilterSql, FREE_DUE_SQL } from '../server/shopify/plans.js';
import { embedEnabledInSettings, fixSeenRecently } from '../server/shopify/embed.js';

const API_KEY = 'test-client-id';
const SECRET = 'test-client-secret';
const ENV = { SHOPIFY_API_KEY: API_KEY, SHOPIFY_API_SECRET: SECRET };
const SHOP = 'foxwood-test.myshopify.com';
const now = Date.now();
const claims = (over = {}) => ({
  iss: `https://${SHOP}/admin`, dest: `https://${SHOP}`, aud: API_KEY, sub: '42',
  exp: Math.floor(now / 1000) + 60, nbf: Math.floor(now / 1000) - 5, iat: Math.floor(now / 1000) - 5, sid: 'abc', ...over,
});

test('shop domains are normalised and anything else is rejected', () => {
  assert.equal(normalizeShop('https://Foxwood-Test.myshopify.com/admin'), SHOP);
  for (const bad of ['', 'evil.com', 'foo.myshopify.com.evil.com', 'a b.myshopify.com', '-x.myshopify.com']) assert.equal(normalizeShop(bad), null);
});

test('webhook HMAC: base64 over the raw body', () => {
  const body = '{"shop_domain":"x"}';
  const good = crypto.createHmac('sha256', SECRET).update(body).digest('base64');
  assert.equal(verifyWebhookHmac(body, good, SECRET), true);
  assert.equal(verifyWebhookHmac(body + ' ', good, SECRET), false);
  assert.equal(verifyWebhookHmac(body, good, 'other'), false);
  assert.equal(verifyWebhookHmac(body, '', SECRET), false);
});

test('launch URL HMAC: hex over sorted params without hmac', () => {
  const msg = `host=abc&shop=${SHOP}&timestamp=1`;
  const hmac = crypto.createHmac('sha256', SECRET).update(msg).digest('hex');
  assert.equal(verifyQueryHmac(`shop=${SHOP}&timestamp=1&host=abc&hmac=${hmac}`, SECRET), true);
  assert.equal(verifyQueryHmac(`shop=${SHOP}&timestamp=2&host=abc&hmac=${hmac}`, SECRET), false);
});

test('ID tokens: valid, wrong audience, expired, tampered, mismatched store, wrong alg', () => {
  const cfg = { apiKey: API_KEY, apiSecret: SECRET, now };
  assert.deepEqual(verifyIdToken(signIdToken(claims(), SECRET), cfg), { shop: SHOP, userId: '42', sessionId: 'abc' });
  assert.equal(verifyIdToken(signIdToken(claims({ aud: 'other' }), SECRET), cfg), null);
  assert.equal(verifyIdToken(signIdToken(claims({ exp: Math.floor(now / 1000) - 60 }), SECRET), cfg), null);
  assert.equal(verifyIdToken(signIdToken(claims({ nbf: Math.floor(now / 1000) + 60 }), SECRET), cfg), null);
  assert.equal(verifyIdToken(signIdToken(claims(), 'wrong-secret'), cfg), null);
  assert.equal(verifyIdToken(signIdToken(claims({ dest: 'https://other.myshopify.com' }), SECRET), cfg), null);
  const t = signIdToken(claims(), SECRET).split('.');
  const forged = Buffer.from(JSON.stringify(claims({ dest: 'https://victim.myshopify.com', iss: 'https://victim.myshopify.com/admin' }))).toString('base64url');
  assert.equal(verifyIdToken(`${t[0]}.${forged}.${t[2]}`, cfg), null);
  const none = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
  assert.equal(verifyIdToken(`${none}.${t[1]}.${t[2]}`, cfg), null);
  assert.equal(verifyIdToken('not-a-jwt', cfg), null);
});

test('tokens are sealed at rest and only open with the same secret', () => {
  const s = seal('shpat_secret', SECRET);
  assert.ok(!s.includes('shpat_secret'));
  assert.equal(open(s, SECRET), 'shpat_secret');
  assert.equal(open(s, 'other'), null);
  assert.equal(seal(null, SECRET), null);
});

function fakeStore() {
  const calls = [];
  const seen = new Set();
  return {
    calls,
    async recordWebhook(id) { if (seen.has(id)) return false; seen.add(id); return true; },
    async markUninstalled(shop) { calls.push(['uninstalled', shop]); },
    async redactShop(shop) { calls.push(['redact', shop]); },
  };
}

function webhook(topic, body, { secret = SECRET, id = crypto.randomUUID() } = {}) {
  const raw = JSON.stringify(body);
  return new Request('https://www.accessbell.co/api/shopify/webhooks', {
    method: 'POST',
    body: raw,
    headers: {
      'x-shopify-hmac-sha256': crypto.createHmac('sha256', secret).update(raw).digest('base64'),
      'x-shopify-topic': topic, 'x-shopify-shop-domain': SHOP, 'x-shopify-webhook-id': id,
    },
  });
}

test('webhooks: bad HMAC is 401; each topic is handled once', async () => {
  const store = fakeStore();
  const log = { log() {} };
  assert.equal((await handleWebhook(webhook('shop/redact', {}, { secret: 'bad' }), { apiSecret: SECRET, store, log })).status, 401);
  for (const topic of ['customers/data_request', 'customers/redact', 'shop/redact', 'app/uninstalled']) {
    const r = await handleWebhook(webhook(topic, { shop_domain: SHOP, customer: { id: 1 } }), { apiSecret: SECRET, store, log });
    assert.equal(r.status, 200, topic);
  }
  assert.deepEqual(store.calls, [['redact', SHOP], ['uninstalled', SHOP]]);
  const dup = webhook('app/uninstalled', {}, { id: 'same' });
  await handleWebhook(dup, { apiSecret: SECRET, store, log });
  const r2 = await handleWebhook(webhook('app/uninstalled', {}, { id: 'same' }), { apiSecret: SECRET, store, log });
  assert.equal(r2.body.duplicate, true);
});

test('embedded page: framable only by the store and Shopify admin, App Bridge loaded', () => {
  const { html, csp } = appPage({ apiKey: API_KEY, shop: SHOP });
  assert.match(csp, new RegExp(`frame-ancestors https://${SHOP.replace(/\./g, '\\.')} https://admin\\.shopify\\.com`));
  assert.equal(frameAncestors('evil.com'), 'https://admin.shopify.com');
  assert.match(html, /cdn\.shopify\.com\/shopifycloud\/app-bridge\.js/);
  assert.match(html, new RegExp(`name="shopify-api-key" content="${API_KEY}"`));
  assert.match(html, /Guided fix suggestion/);
  const nonce = /'nonce-([^']+)'/.exec(csp)[1];
  assert.match(html, new RegExp(`<script nonce="${nonce.replace(/[+/=]/g, '\\$&')}">`));
});

test('handler: not configured -> 503, no session -> 401', async () => {
  const off = createShopifyHandler({ env: {}, store: fakeStore() });
  assert.equal((await off(new Request('https://x/api/shopify/session', { method: 'POST' }))).status, 503);
  const h = createShopifyHandler({ env: ENV, store: fakeStore() });
  assert.equal((await h(new Request('https://x/api/shopify/session', { method: 'POST' }))).status, 401);
});

const AUTH = () => ({ Authorization: 'Bearer ' + signIdToken(claims(), SECRET) });
const post = (h, route) => h(new Request(`https://x/api/shopify/${route}`, { method: 'POST', headers: AUTH() }));

function shopifyApi({ subs = [], settings = null } = {}) {
  const fetched = [];
  const fetchImpl = async (url, init) => {
    fetched.push([url, init.body]);
    if (url.endsWith('/admin/oauth/access_token')) return Response.json({ access_token: 'shpat_x', scope: 'read_themes', expires_in: 3600, refresh_token: 'shprt_x', refresh_token_expires_in: 7776000 });
    const q = JSON.parse(init.body).query;
    if (q.includes('AccessBellShop')) return Response.json({ data: { shop: { name: 'Foxwood', email: 'a@b.co', primaryDomain: { host: 'foxwood.example' } }, currentAppInstallation: { id: 'gid://shopify/AppInstallation/1' } } });
    if (q.includes('AccessBellPlan')) return Response.json({ data: { currentAppInstallation: { activeSubscriptions: subs } } });
    if (q.includes('AccessBellEmbed')) return Response.json({ data: { themes: { nodes: [{ files: { nodes: settings ? [{ body: { content: settings } }] : [] } }] } } });
    return Response.json({ data: { metafieldsSet: { userErrors: [] } } });
  };
  return { fetched, fetchImpl };
}

function memoryStore(row = null) {
  const applied = [];
  const saved = [];
  let shopRow = row;
  return {
    ...fakeStore(),
    applied, saved,
    async getShop() { return shopRow; },
    async saveTokens(shop, t) { saved.push([shop, t]); },
    async provision(shop, info) { assert.equal(info.host, 'foxwood.example'); return { accountId: 'acc', domainId: 'dom' }; },
    async siteKey() { return 'k'.repeat(24); },
    async getAccount(id) { return { id }; },
    async getDomain() { return { hostname: 'foxwood.example', fix_seen_at: null }; },
    async monitoredPages() { return shopRow?.pages || [{ id: 'home', url: 'https://foxwood.example/', last_scanned_at: null }]; },
    async monitorUpTo(_d, limit) { return Array.from({ length: Math.min(limit, 40) }, (_, i) => ({ id: String(i) })); },
    async applyPlan(shop, plan) { applied.push(plan); if (shopRow) Object.assign(shopRow, { billing_plan: plan.tier, billing_status: plan.status }); return { applied: true }; },
  };
}

const OVERVIEW = async () => ({
  domain: { hostname: 'foxwood.example' },
  pages: [{ monitored: true, last_score: 80, last_issues: 3 }],
  rules: [{ id: 'image-alt', title: 'Images need alt text', impact: 'critical', elements: 3, pages: 1, fix: 'Add alt text.' }],
});

test('session: first open exchanges an expiring token, provisions, syncs the Free plan and reads the embed', async () => {
  const { fetched, fetchImpl } = shopifyApi({ settings: '/* x */ {"current":{"blocks":{"1":{"type":"shopify://apps/accessbell/blocks/accessbell-fix/abc","disabled":false}}}}' });
  const store = memoryStore();
  const h = createShopifyHandler({ env: ENV, store, fetchImpl, overview: OVERVIEW, now: () => now });
  const res = await post(h, 'session');
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.overview.score, 80);
  assert.equal(body.overview.topIssues[0].fix, 'Add alt text.');
  assert.equal(body.plan.tier, 'free');
  assert.equal(body.plan.monitoredPages, 1);
  assert.equal(body.embed.enabled, true);
  assert.match(body.embed.activateUrl, /activateAppId=test-client-id%2Faccessbell-fix|activateAppId=test-client-id\/accessbell-fix/);
  assert.equal(body.pricingUrl, 'https://admin.shopify.com/store/foxwood-test/charges/accessbell/pricing_plans');
  assert.deepEqual(body.plans.map((p) => [p.key, p.monthly, p.yearly, p.trialDays]), [['free', 0, null, 0], ['starter', 12, null, 3], ['pro', 29, 290, 3]]);
  assert.equal(store.applied[0].tier, 'free');
  assert.equal(store.saved[0][1].refreshToken, 'shprt_x');
  const exchange = new URLSearchParams(fetched[0][1]);
  assert.equal(exchange.get('expiring'), '1');
  assert.ok(fetched.some(([, b]) => String(b).includes('metafieldsSet')));
});

test('session: a Pro trial from Shopify is applied and reported', async () => {
  const created = new Date(now - 86_400_000).toISOString();
  const subs = [{ id: 'gid://shopify/AppSubscription/9', name: 'Pro', status: 'ACTIVE', trialDays: 3, createdAt: created, lineItems: [{ plan: { pricingDetails: { interval: 'ANNUAL' } } }] }];
  const { fetchImpl } = shopifyApi({ subs });
  const store = memoryStore({ shop: SHOP, domain_id: 'dom', account_id: 'acc', access_token: 'shpat_old', access_token_expires_at: new Date(now + 3_600_000) });
  const h = createShopifyHandler({ env: ENV, store, fetchImpl, overview: OVERVIEW, now: () => now });
  const body = await (await post(h, 'session')).json();
  assert.equal(body.plan.tier, 'pro');
  assert.equal(body.plan.status, 'trialing');
  assert.equal(body.plan.interval, 'yearly');
  assert.equal(body.plan.monitoredPages, 500);
  assert.equal(store.saved.length, 0, 'a fresh stored token is reused');
});

test('scan now: Free scans the home page once a month', async () => {
  const scanned = [];
  const row = { shop: SHOP, domain_id: 'dom', account_id: 'acc', billing_plan: 'free', billing_status: 'free', pages: [{ id: 'home', last_scanned_at: null }, { id: 'p2', last_scanned_at: null }] };
  const h = createShopifyHandler({ env: ENV, store: memoryStore(row), now: () => now, scanNow: async (id) => scanned.push(id), sendEvents: async () => { throw new Error('free never queues'); } });
  const r = await post(h, 'scan');
  assert.equal(r.status, 200);
  assert.deepEqual(scanned, ['home']);
  row.pages[0].last_scanned_at = new Date(now - 10 * 86_400_000);
  const again = await post(h, 'scan');
  assert.equal(again.status, 429);
  assert.equal((await again.json()).code, 'plan_scan_limit');
});

test('scan now: Starter queues at most 25 pages, once a day; Pro queues all', async () => {
  const pages = Array.from({ length: 40 }, (_, i) => ({ id: 'p' + i, last_scanned_at: null }));
  const queued = [];
  const row = { shop: SHOP, domain_id: 'dom', account_id: 'acc', billing_plan: 'starter', billing_status: 'active', pages };
  const deps = { env: ENV, store: memoryStore(row), now: () => now, sendEvents: async (e) => { queued.push(e); return true; }, scanNow: async () => {} };
  const h = createShopifyHandler(deps);
  const r = await post(h, 'scan');
  assert.equal(r.status, 202);
  assert.equal(queued[0].length, 25);
  pages[0].last_scanned_at = new Date(now - 2 * 3_600_000);
  assert.equal((await post(h, 'scan')).status, 429);
  row.billing_plan = 'pro';
  assert.equal((await post(h, 'scan')).status, 202);
  assert.equal(queued[1].length, 40);
});

test('scan now: a cancelled or frozen paid plan is treated as Free', async () => {
  const scanned = [];
  const row = { shop: SHOP, domain_id: 'dom', account_id: 'acc', billing_plan: 'pro', billing_status: 'paused', pages: [{ id: 'home' }, { id: 'p2' }] };
  const h = createShopifyHandler({ env: ENV, store: memoryStore(row), now: () => now, scanNow: async (id) => scanned.push(id), sendEvents: async () => true });
  assert.equal((await post(h, 'scan')).status, 200);
  assert.deepEqual(scanned, ['home']);
  assert.equal((await post(h, 'pages')).status, 402);
});

test('find pages: paid plans monitor up to their limit', async () => {
  const row = { shop: SHOP, domain_id: 'dom', account_id: 'acc', billing_plan: 'starter', billing_status: 'trialing' };
  let ctxSeen;
  const h = createShopifyHandler({ env: ENV, store: memoryStore(row), now: () => now, discover: async (ctx) => { ctxSeen = ctx; return { found: 60 }; } });
  const body = await (await post(h, 'pages')).json();
  assert.deepEqual(body, { found: 60, monitored: 25, limit: 25 });
  assert.equal(ctxSeen.subscriber, true);
  const free = createShopifyHandler({ env: ENV, store: memoryStore({ ...row, billing_plan: 'free', billing_status: 'free' }), now: () => now });
  const r = await post(free, 'pages');
  assert.equal(r.status, 402);
  assert.match((await r.json()).pricingUrl, /pricing_plans$/);
});

test('app_subscriptions/update: refreshes an expired token, reads the plan from Shopify, applies it', async () => {
  const { fetched, fetchImpl } = shopifyApi({ subs: [{ id: 'g', name: 'Starter', status: 'ACTIVE', trialDays: 0, createdAt: new Date(now).toISOString() }] });
  const store = memoryStore({ shop: SHOP, domain_id: 'dom', account_id: 'acc', access_token: 'old', access_token_expires_at: new Date(now - 1000), refresh_token: 'shprt_old' });
  const h = createShopifyHandler({ env: ENV, store, fetchImpl, now: () => now });
  const r = await h(webhook('app_subscriptions/update', { app_subscription: { name: 'Starter', status: 'ACTIVE' } }));
  assert.equal(r.status, 200);
  assert.equal(new URLSearchParams(fetched[0][1]).get('grant_type'), 'refresh_token');
  assert.equal(store.saved.length, 1);
  assert.equal(store.applied[0].tier, 'starter');
  assert.equal(store.applied[0].status, 'active');
});

test('app_subscriptions/update: falls back to the payload when Shopify cannot be reached', async () => {
  const store = memoryStore({ shop: SHOP, domain_id: 'dom', account_id: 'acc', uninstalled_at: new Date() });
  const h = createShopifyHandler({ env: ENV, store, fetchImpl: async () => { throw new Error('offline'); }, now: () => now });
  await h(webhook('app_subscriptions/update', { app_subscription: { name: 'Pro', status: 'CANCELLED' } }));
  assert.equal(store.applied[0].tier, 'free');
});

test('plans: Shopify subscriptions map to tiers, trials and account statuses', () => {
  assert.equal(PLANS.starter.monitoredPages, 25);
  assert.equal(PLANS.starter.rescanEveryDays, 7);
  assert.equal(PLANS.pro.monitoredPages, 500);
  assert.equal(TRIAL_DAYS, 3);
  assert.equal(planFromSubscriptions([]).tier, 'free');
  assert.equal(accountStatusFor(planFromSubscriptions([])), 'none');
  const t0 = new Date(now - 2 * 86_400_000).toISOString();
  const trial = planFromSubscriptions([{ name: 'Starter', status: 'ACTIVE', trialDays: 3, createdAt: t0 }], now);
  assert.deepEqual([trial.tier, trial.status, accountStatusFor(trial)], ['starter', 'trialing', 'trialing']);
  const after = planFromSubscriptions([{ name: 'Starter', status: 'ACTIVE', trialDays: 3, createdAt: t0 }], now + 2 * 86_400_000);
  assert.equal(after.status, 'active');
  assert.equal(planFromSubscriptions([{ name: 'Starter', status: 'ACTIVE' }, { name: 'Pro', status: 'ACTIVE' }]).tier, 'pro');
  const frozen = planFromSubscriptions([{ name: 'Pro', status: 'FROZEN' }]);
  assert.deepEqual([frozen.tier, accountStatusFor(frozen)], ['free', 'paused']);
  assert.equal(planFromSubscriptions([{ name: 'Pro', status: 'CANCELLED' }]).tier, 'free');
  assert.equal(planFromSubscriptions([{ name: 'Mystery', status: 'ACTIVE' }]).tier, 'free');
  assert.equal(planFromWebhook({ app_subscription: { name: 'Pro', status: 'ACTIVE' } }).tier, 'pro');
});

test('plans: manual scan spacing per plan', () => {
  const hourAgo = new Date(now - 3_600_000);
  assert.ok(nextManualScan('free', hourAgo, now));
  assert.ok(nextManualScan('starter', hourAgo, now));
  assert.equal(nextManualScan('pro', hourAgo, now), null);
  assert.ok(nextManualScan('pro', new Date(now - 60_000), now), 'at least 10 minutes on every plan');
  assert.equal(nextManualScan('starter', null, now), null);
});

test('scheduler SQL: only Starter accounts are limited, read safely before the migration', () => {
  const sql = scheduleFilterSql('a', 'p');
  assert.match(sql, /to_jsonb\(a\)->>'plan_tier'/);
  assert.match(sql, /<> 'starter'/);
  assert.match(sql, /limit 25/);
  assert.match(sql, /interval '156 hours'/);
  assert.match(FREE_DUE_SQL, /= 'free'/);
  const mon = readFileSync(new URL('../server/app/monitoring.js', import.meta.url), 'utf8');
  assert.match(mon, /scheduleFilterSql\('a', 'p'\)/);
  const fix = readFileSync(new URL('../server/app/site-setup.js', import.meta.url), 'utf8');
  assert.match(fix, /plan_tier === 'free' && toolbar \? \{ fixes: \[\], toolbar \}/);
});

test('embed detection from theme settings', () => {
  const on = '{"current":{"blocks":{"a":{"type":"shopify://apps/accessbell/blocks/accessbell-fix/123","disabled":false}}}}';
  assert.equal(embedEnabledInSettings(on), true);
  assert.equal(embedEnabledInSettings(on.replace('false', 'true')), false);
  assert.equal(embedEnabledInSettings('/*\n * comment\n */\n' + on), true);
  assert.equal(embedEnabledInSettings('{"current":"Default","presets":{"Default":{"blocks":{"a":{"type":"shopify://apps/accessbell/blocks/accessbell-fix/1"}}}}}'), true);
  assert.equal(embedEnabledInSettings('{"current":{}}'), false);
  assert.equal(embedEnabledInSettings('not json'), null);
  assert.equal(fixSeenRecently(new Date(now - 86_400_000), now), true);
  assert.equal(fixSeenRecently(new Date(now - 8 * 86_400_000), now), false);
});

test('summarize: no scans yet', () => {
  assert.deepEqual(summarize({ pages: [{ monitored: true, last_score: null }] }), { scanned: false, pages: 1 });
  assert.deepEqual(summarize(null), { scanned: false });
});

test('token exchange failure surfaces the status', async () => {
  await assert.rejects(exchangeIdToken(SHOP, 't', { apiKey: API_KEY, apiSecret: SECRET }, { fetchImpl: async () => new Response('', { status: 400 }) }), (e) => e.status === 400);
});

test('theme app embed targets head and loads fix.js with the site key', () => {
  const liquid = readFileSync(new URL('../shopify/extensions/accessbell-fix/blocks/accessbell-fix.liquid', import.meta.url), 'utf8');
  const schema = JSON.parse(/{% schema %}([\s\S]*){% endschema %}/.exec(liquid)[1]);
  assert.equal(schema.target, 'head');
  assert.match(liquid, /src="https:\/\/www\.accessbell\.co\/fix\.js" data-site="{{ key \| escape }}"/);
  assert.match(liquid, /app\.metafields\.accessbell\.site_key/);
});

test('app config declares the mandatory compliance webhooks', () => {
  const toml = readFileSync(new URL('../shopify/shopify.app.toml', import.meta.url), 'utf8');
  assert.match(toml, /compliance_topics = \["customers\/data_request", "customers\/redact", "shop\/redact"\]/);
  assert.match(toml, /topics = \["app\/uninstalled"\]/);
  assert.match(toml, /topics = \["app_subscriptions\/update"\]/);
  assert.match(toml, /embedded = true/);
});

test('vercel: /shopify is framable (not under the global frame-ancestors none rule) and routed', () => {
  const v = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const re = new RegExp('^' + v.headers[0].source + '$');
  assert.ok(re.test('/pricing') && re.test('/') && re.test('/shopify-accessibility') && re.test('/api/shopify/session'));
  assert.ok(!re.test('/shopify'));
  assert.ok(v.rewrites.some((r) => r.source === '/shopify' && r.destination === '/api/shopify?route=app'));
});

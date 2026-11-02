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

test('webhooks: bad HMAC is 401; each mandatory topic is handled once', async () => {
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

test('handler: not configured -> 503, no session -> 401, billing stub -> 501', async () => {
  const off = createShopifyHandler({ env: {}, store: fakeStore() });
  assert.equal((await off(new Request('https://x/api/shopify/session', { method: 'POST' }))).status, 503);
  const h = createShopifyHandler({ env: ENV, store: fakeStore() });
  assert.equal((await h(new Request('https://x/api/shopify/session', { method: 'POST' }))).status, 401);
  const auth = { Authorization: 'Bearer ' + signIdToken(claims(), SECRET) };
  const b = await h(new Request('https://x/api/shopify/billing', { method: 'POST', headers: auth }));
  assert.equal(b.status, 501);
  assert.equal((await b.json()).code, 'billing_pending');
});

test('handler: first open exchanges the token, provisions, sets the site key, returns results', async () => {
  const fetched = [];
  const fetchImpl = async (url, init) => {
    fetched.push([url, init.body]);
    if (url.endsWith('/admin/oauth/access_token')) return Response.json({ access_token: 'shpat_x', scope: 'read_themes', expires_in: 3600, refresh_token: 'shprt_x', refresh_token_expires_in: 7776000 });
    const q = JSON.parse(init.body).query;
    if (q.includes('AccessBellShop')) return Response.json({ data: { shop: { name: 'Foxwood', email: 'a@b.co', primaryDomain: { host: 'foxwood.example' } }, currentAppInstallation: { id: 'gid://shopify/AppInstallation/1' } } });
    return Response.json({ data: { metafieldsSet: { userErrors: [] } } });
  };
  const saved = [];
  const store = {
    ...fakeStore(),
    async getShop() { return null; },
    async saveTokens(shop, t) { saved.push([shop, t]); },
    async provision(shop, info) { assert.equal(info.host, 'foxwood.example'); return { accountId: 'acc', domainId: 'dom' }; },
    async siteKey() { return 'k'.repeat(24); },
    async getAccount(id) { return { id }; },
  };
  const overview = async () => ({
    domain: { hostname: 'foxwood.example' },
    pages: [{ monitored: true, last_score: 80, last_issues: 3 }],
    rules: [{ id: 'image-alt', title: 'Images need alt text', impact: 'critical', elements: 3, pages: 1, fix: 'Add alt text.' }],
  });
  const h = createShopifyHandler({ env: ENV, store, fetchImpl, overview });
  const res = await h(new Request('https://x/api/shopify/session', { method: 'POST', headers: { Authorization: 'Bearer ' + signIdToken(claims(), SECRET) } }));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.overview.score, 80);
  assert.equal(body.overview.topIssues[0].fix, 'Add alt text.');
  assert.equal(body.billing.status, 'pending');
  assert.equal(saved[0][1].refreshToken, 'shprt_x');
  const exchange = new URLSearchParams(fetched[0][1]);
  assert.equal(exchange.get('expiring'), '1');
  assert.equal(exchange.get('grant_type'), 'urn:ietf:params:oauth:grant-type:token-exchange');
  assert.ok(fetched.some(([, b]) => String(b).includes('metafieldsSet')));
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
  assert.match(toml, /embedded = true/);
});

test('vercel: /shopify is framable (not under the global frame-ancestors none rule) and routed', () => {
  const v = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const re = new RegExp('^' + v.headers[0].source + '$');
  assert.ok(re.test('/pricing') && re.test('/') && re.test('/shopify-accessibility') && re.test('/api/shopify/session'));
  assert.ok(!re.test('/shopify'));
  assert.ok(v.rewrites.some((r) => r.source === '/shopify' && r.destination === '/api/shopify?route=app'));
});

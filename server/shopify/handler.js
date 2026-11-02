// /api/shopify/* routes for the Shopify App Store version of AccessBell.
//   GET  /shopify (rewritten to route=app)  embedded admin page
//   POST /api/shopify/session                 ID token -> install/refresh + results
//   POST /api/shopify/webhooks                app/uninstalled + privacy topics
//   POST /api/shopify/billing                 501 until pricing is approved
import { shopifyConfig } from './config.js';
import { verifyIdToken, bearer, normalizeShop } from './verify.js';
import { exchangeIdToken, graphql, SHOP_QUERY, SET_SITE_KEY } from './admin-api.js';
import { handleWebhook } from './webhooks.js';
import { appPage } from './app-page.js';
import { billingNotImplemented } from './billing.js';
import { domainOverview } from '../app/domains.js';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

/** Trim the dashboard overview down to what the embedded page shows. */
export function summarize(ov) {
  if (!ov) return { scanned: false };
  const monitored = (ov.pages || []).filter((p) => p.monitored);
  const scanned = monitored.filter((p) => p.last_score != null);
  if (!scanned.length) return { scanned: false, pages: monitored.length };
  const score = Math.round(scanned.reduce((a, p) => a + p.last_score, 0) / scanned.length);
  const issues = scanned.reduce((a, p) => a + (p.last_issues || 0), 0);
  const rank = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  const topIssues = (ov.rules || ov.issues || [])
    .slice()
    .sort((a, b) => (rank[a.impact] ?? 9) - (rank[b.impact] ?? 9) || (b.elements || 0) - (a.elements || 0))
    .slice(0, 10)
    .map((r) => ({ id: r.id, title: r.title, impact: r.impact, elements: r.elements, pages: Array.isArray(r.pages) ? r.pages.length : r.pages, fix: typeof r.fix === 'string' ? r.fix : r.fix?.summary || '' }));
  return { scanned: true, score, issues, pages: monitored.length, topIssues };
}

/** First load after install: token exchange, account + domain, site key metafield. */
async function ensureInstalled(shop, idToken, cfg, deps) {
  const existing = await deps.store.getShop(shop);
  const fresh = existing?.access_token && !existing.uninstalled_at && (!existing.access_token_expires_at || new Date(existing.access_token_expires_at) > new Date(Date.now() + 60_000));
  if (fresh && existing.domain_id) return existing;

  // Re-running token exchange is how an embedded app renews during a session.
  const tokens = await exchangeIdToken(shop, idToken, cfg, { fetchImpl: deps.fetchImpl });
  await deps.store.saveTokens(shop, tokens);
  if (existing?.domain_id) return { ...existing, access_token: tokens.accessToken };

  const data = await graphql(shop, tokens.accessToken, SHOP_QUERY, {}, { fetchImpl: deps.fetchImpl });
  const { accountId, domainId } = await deps.store.provision(shop, {
    name: data?.shop?.name,
    email: data?.shop?.email,
    host: data?.shop?.primaryDomain?.host,
  });
  const siteKey = await deps.store.siteKey(domainId);
  const ownerId = data?.currentAppInstallation?.id;
  if (siteKey && ownerId) {
    await graphql(shop, tokens.accessToken, SET_SITE_KEY, { ownerId, value: siteKey }, { fetchImpl: deps.fetchImpl }).catch((err) => {
      // The merchant can still paste the key into the app embed setting.
      console.error('shopify site key metafield failed', shop, err?.message);
    });
  }
  return { shop, account_id: accountId, domain_id: domainId, access_token: tokens.accessToken };
}

export function createShopifyHandler(deps = {}) {
  return async function handle(request) {
    const cfg = shopifyConfig(deps.env);
    if (!cfg.apiKey || !cfg.apiSecret) return json(503, { error: 'Shopify app is not configured.' });
    const url = new URL(request.url);
    const route = (url.searchParams.get('route') || url.pathname.replace(/^\/api\/shopify\/?/, '')).replace(/\/$/, '');
    const store = deps.store || (await import('./store.js')).createStore(cfg);
    const d = { ...deps, store, fetchImpl: deps.fetchImpl || fetch };

    try {
      if (route === 'webhooks' && request.method === 'POST') {
        const r = await handleWebhook(request, { apiSecret: cfg.apiSecret, store });
        return json(r.status, r.body);
      }

      if ((route === 'app' || route === '') && request.method === 'GET') {
        const { html, csp } = appPage({ apiKey: cfg.apiKey, shop: normalizeShop(url.searchParams.get('shop')) });
        return new Response(html, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Security-Policy': csp, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload', 'X-Robots-Tag': 'noindex, nofollow' },
        });
      }

      // Everything below needs a valid App Bridge ID token.
      const idToken = bearer(request);
      const session = verifyIdToken(idToken, cfg);
      if (!session) return json(401, { error: 'Invalid or expired Shopify session.' });

      if (route === 'session' && request.method === 'POST') {
        const install = await ensureInstalled(session.shop, idToken, cfg, d);
        const account = await store.getAccount(install.account_id);
        const ctx = { user: null, account, role: 'owner', subscriber: false };
        const overview = await (d.overview || domainOverview)(ctx, install.domain_id).catch(() => null);
        return json(200, {
          shop: session.shop,
          hostname: overview?.domain?.hostname || install.primary_host || session.shop,
          overview: summarize(overview),
          billing: { status: 'pending' }, // TODO(pricing approval)
        });
      }

      if (route === 'billing') {
        const r = billingNotImplemented();
        return json(r.status, r.body);
      }

      return json(404, { error: 'Not found.' });
    } catch (err) {
      console.error('shopify route failed', route, err?.message);
      return json(err?.status === 400 ? 401 : 500, { error: err?.status === 400 ? 'Shopify session expired. Reload the app.' : 'Something went wrong.' });
    }
  };
}

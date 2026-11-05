// /api/shopify/* routes for the Shopify App Store version of AccessBell.
//   GET  /shopify (rewritten to route=app)  embedded admin page
//   POST /api/shopify/session                 ID token -> install, plan sync, results
//   POST /api/shopify/scan                    "Scan now" (limited by plan)
//   POST /api/shopify/pages                   find store pages and monitor up to the plan limit (paid)
//   POST /api/shopify/webhooks                app/uninstalled, app_subscriptions/update, privacy topics
import { shopifyConfig } from './config.js';
import { verifyIdToken, bearer, normalizeShop } from './verify.js';
import { exchangeIdToken, refreshOfflineToken, graphql, SHOP_QUERY, SET_SITE_KEY } from './admin-api.js';
import { handleWebhook } from './webhooks.js';
import { appPage } from './app-page.js';
import { fetchPlan } from './billing.js';
import { PLANS, PAID_STATUSES, TRIAL_DAYS, planFromWebhook, nextManualScan, pricingPageUrl } from './plans.js';
import { EMBED_QUERY, embedFromTheme, fixSeenRecently, activateEmbedUrl } from './embed.js';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
const fresh = (row, now = Date.now()) => row?.access_token && !row.uninstalled_at && (!row.access_token_expires_at || new Date(row.access_token_expires_at).getTime() > now + 60_000);

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

const publicPlans = () => Object.values(PLANS).map((p) => ({ key: p.key, name: p.name, monthly: p.monthly, yearly: p.yearly, monitoredPages: p.monitoredPages, rescanEveryDays: p.rescanEveryDays, fixes: p.fixes, trialDays: p.monthly ? TRIAL_DAYS : 0 }));

/** The AccessBell context the existing domain/scan code expects, for a store. */
const contextFor = (account, tier, status) => ({ user: null, account, role: 'owner', subscriber: tier !== 'free' && PAID_STATUSES.has(status) });

async function defaultDeps() {
  const [{ domainOverview, discoverPages }, { scanPage }, { one }] = await Promise.all([
    import('../app/domains.js'), import('../app/scanning.js'), import('../app/db.js'),
  ]);
  return {
    overview: domainOverview,
    discover: discoverPages,
    async scanNow(pageId, accountId) {
      const page = await one('select p.*, d.settings, d.hostname from app.pages p join app.domains d on d.id = p.domain_id where p.id = $1', [pageId]);
      return scanPage(page, { accountId, trigger: 'manual' });
    },
    async sendEvents(events) {
      if (!process.env.INNGEST_EVENT_KEY) return false;
      const { inngest } = await import('../inngest/functions.js');
      for (let i = 0; i < events.length; i += 500) await inngest.send(events.slice(i, i + 500));
      return true;
    },
  };
}

export function createShopifyHandler(deps = {}) {
  return async function handle(request) {
    const cfg = shopifyConfig(deps.env);
    if (!cfg.apiKey || !cfg.apiSecret) return json(503, { error: 'Shopify app is not configured.' });
    const url = new URL(request.url);
    const route = (url.searchParams.get('route') || url.pathname.replace(/^\/api\/shopify\/?/, '')).replace(/\/$/, '');
    const store = deps.store || (await import('./store.js')).createStore(cfg);
    const d = { ...(await defaultDeps()), ...deps, store, fetchImpl: deps.fetchImpl || fetch };
    const now = d.now ? d.now() : Date.now();

    /** A working offline token for background calls: refresh it if it has expired. */
    async function tokenFor(shop) {
      const row = await store.getShop(shop);
      if (fresh(row, now)) return row.access_token;
      if (!row?.refresh_token || row.uninstalled_at) return null;
      const t = await refreshOfflineToken(shop, row.refresh_token, cfg, { fetchImpl: d.fetchImpl, now });
      await store.saveTokens(shop, t);
      return t.accessToken;
    }

    async function syncPlan(shop, payload) {
      let plan;
      try {
        const token = await tokenFor(shop);
        if (token) plan = await fetchPlan(shop, token, { fetchImpl: d.fetchImpl, now });
      } catch (err) {
        console.error('shopify plan fetch failed, using webhook payload', shop, err?.message);
      }
      return store.applyPlan(shop, plan || planFromWebhook(payload));
    }

    /** First open: token exchange, account + domain, site key metafield. Later opens: renew the token if needed. */
    async function ensureInstalled(shop, idToken) {
      const existing = await store.getShop(shop);
      if (fresh(existing, now) && existing.domain_id) return existing;
      // Re-running token exchange is how an embedded app renews during a session.
      const tokens = await exchangeIdToken(shop, idToken, cfg, { fetchImpl: d.fetchImpl, now });
      await store.saveTokens(shop, tokens);
      if (existing?.domain_id) return { ...existing, access_token: tokens.accessToken, uninstalled_at: null };

      const data = await graphql(shop, tokens.accessToken, SHOP_QUERY, {}, { fetchImpl: d.fetchImpl });
      const { accountId, domainId } = await store.provision(shop, { name: data?.shop?.name, email: data?.shop?.email, host: data?.shop?.primaryDomain?.host });
      const siteKey = await store.siteKey(domainId);
      const ownerId = data?.currentAppInstallation?.id;
      if (siteKey && ownerId) {
        await graphql(shop, tokens.accessToken, SET_SITE_KEY, { ownerId, value: siteKey }, { fetchImpl: d.fetchImpl }).catch((err) => {
          // The merchant can still paste the key into the app embed setting.
          console.error('shopify site key metafield failed', shop, err?.message);
        });
      }
      return { shop, account_id: accountId, domain_id: domainId, access_token: tokens.accessToken, billing_plan: 'free', billing_status: 'free' };
    }

    try {
      if (route === 'webhooks' && request.method === 'POST') {
        const r = await handleWebhook(request, { apiSecret: cfg.apiSecret, store, syncPlan });
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
      const { shop } = session;
      if (request.method !== 'POST') return json(405, { error: 'Method not allowed.' });

      if (route === 'session') {
        const install = await ensureInstalled(shop, idToken);
        // Shopify is the source of truth for the plan: read it on every open.
        let plan = null;
        try {
          plan = await fetchPlan(shop, install.access_token, { fetchImpl: d.fetchImpl, now });
          await store.applyPlan(shop, plan);
        } catch (err) {
          console.error('shopify plan sync failed', shop, err?.message);
        }
        const tier = plan?.tier || install.billing_plan || 'free';
        const status = plan?.status || install.billing_status || 'free';
        const account = await store.getAccount(install.account_id);
        const domain = await store.getDomain(install.domain_id);
        let embed = null;
        try {
          embed = embedFromTheme(await graphql(shop, install.access_token, EMBED_QUERY, {}, { fetchImpl: d.fetchImpl }));
        } catch {}
        const pages = await store.monitoredPages(install.domain_id);
        const last = pages.reduce((m, p) => (p.last_scanned_at && (!m || p.last_scanned_at > m) ? p.last_scanned_at : m), null);
        const overview = await d.overview(contextFor(account, tier, status), install.domain_id).catch(() => null);
        return json(200, {
          shop,
          hostname: domain?.hostname || shop,
          plan: { tier, name: PLANS[tier].name, status, interval: plan?.interval || null, trialEndsAt: plan?.trialEndsAt || null, monitoredPages: PLANS[tier].monitoredPages, rescanEveryDays: PLANS[tier].rescanEveryDays, fixes: PLANS[tier].fixes, discovery: PLANS[tier].discovery },
          plans: publicPlans(),
          pricingUrl: pricingPageUrl(shop),
          embed: { enabled: embed === true || fixSeenRecently(domain?.fix_seen_at, now), themeSetting: embed, activateUrl: activateEmbedUrl(shop, cfg.apiKey) },
          scan: { monitored: pages.length, nextAllowedAt: nextManualScan(tier, last, now) },
          overview: summarize(overview),
        });
      }

      // Scan and page routes act on the stored plan (synced on open and by webhook).
      const row = await store.getShop(shop);
      if (!row?.domain_id || row.uninstalled_at) return json(409, { error: 'Open AccessBell from your Shopify admin first.' });
      const tier = PLANS[row.billing_plan] ? row.billing_plan : 'free';
      const paid = tier !== 'free' && PAID_STATUSES.has(row.billing_status);
      const effective = paid ? tier : 'free';
      const plan = PLANS[effective];

      if (route === 'scan') {
        const pages = (await store.monitoredPages(row.domain_id)).slice(0, plan.monitoredPages);
        if (!pages.length) return json(400, { error: 'No pages to scan yet.' });
        const last = pages.reduce((m, p) => (p.last_scanned_at && (!m || p.last_scanned_at > m) ? p.last_scanned_at : m), null);
        const next = nextManualScan(effective, last, now);
        if (next) return json(429, { error: `Your ${plan.name} plan can scan again on ${next.toISOString().slice(0, 10)}.`, code: 'plan_scan_limit', nextAllowedAt: next });
        if (pages.length > 1 && (await d.sendEvents(pages.map((p) => ({ name: 'app/page.scan', data: { pageId: p.id, userId: null } }))))) {
          return json(202, { mode: 'background', pages: pages.length });
        }
        // No background queue (or Free: home page only): scan the first page now.
        await d.scanNow(pages[0].id, row.account_id);
        return json(200, { mode: 'now', pages: 1 });
      }

      if (route === 'pages') {
        if (!plan.discovery) return json(402, { error: 'Upgrade to Starter or Pro to monitor more pages.', code: 'plan_required', pricingUrl: pricingPageUrl(shop) });
        const account = await store.getAccount(row.account_id);
        const found = await d.discover(contextFor(account, effective, row.billing_status), row.domain_id);
        const monitored = await store.monitorUpTo(row.domain_id, plan.monitoredPages);
        return json(200, { found: found?.found ?? 0, monitored: monitored.length, limit: plan.monitoredPages });
      }

      return json(404, { error: 'Not found.' });
    } catch (err) {
      console.error('shopify route failed', route, err?.message);
      if (err?.expose) return json(err.status, { error: err.message, code: err.code });
      return json(err?.status === 400 ? 401 : 500, { error: err?.status === 400 ? 'Shopify session expired. Reload the app.' : 'Something went wrong.' });
    }
  };
}

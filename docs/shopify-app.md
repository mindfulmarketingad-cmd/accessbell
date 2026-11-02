# AccessBell for Shopify (branch `shopify-app`)

Status: scaffolding only. Not merged, not deployed, migration not applied.
Billing is a stub until David approves Shopify pricing.

## How it fits the existing app

The Shopify version is a thin layer over the existing backend. A store that
installs the app gets an ordinary AccessBell account and domain (its primary
domain, home page monitored), so scanning, issues, guided fix suggestions,
AccessBellFix and the Compliance Vault all work the same way. Nothing in
Stripe billing, Supabase auth or the existing dashboard changes.

| Piece | Where |
| --- | --- |
| App config (scopes, webhooks, embedded URL) | `shopify/shopify.app.toml` |
| Theme app embed that loads `fix.js` | `shopify/extensions/accessbell-fix/` |
| Routes (`/shopify`, `/api/shopify/*`) | `api/shopify.js` -> `server/shopify/handler.js` |
| ID token + webhook HMAC checks | `server/shopify/verify.js` |
| Token exchange, refresh, GraphQL | `server/shopify/admin-api.js` |
| Install records in Supabase | `server/shopify/store.js`, `supabase/migrations/0016_shopify.sql` |
| Privacy + uninstall webhooks | `server/shopify/webhooks.js` |
| Embedded admin page (App Bridge) | `server/shopify/app-page.js` |
| Billing (TODO) | `server/shopify/billing.js` |
| Tests | `tests/shopify.test.js` |

## Install and auth flow

1. Merchant installs from the App Store. Shopify-managed install grants the
   scopes in `shopify.app.toml` (no OAuth redirect).
2. Shopify opens `https://www.accessbell.co/shopify` in the admin iframe. The
   page loads App Bridge, gets an ID token and POSTs it to
   `/api/shopify/session`.
3. The server verifies the ID token (HS256 with the app secret, audience,
   expiry, matching `iss`/`dest` store), exchanges it for an **expiring offline
   token** (`expiring=1`, required for new public apps), stores it encrypted,
   and on first open creates the account, domain and home page, then writes the
   domain's site key to an app-data metafield (`accessbell.site_key`).
4. The theme app embed reads that metafield and loads
   `https://www.accessbell.co/fix.js` with `data-site`. Merchant turns it on in
   Theme editor > App embeds.

`vercel.json`: the global security headers rule now skips `/shopify` (the
embedded page must be framable by `https://{shop}` and
`https://admin.shopify.com`; the function sets its own CSP with a nonce and
`frame-ancestors`). Rewrites added for `/shopify` and `/api/shopify/*`.

## Webhooks

All go to `/api/shopify/webhooks` (HMAC checked, 401 on mismatch, deduplicated
by webhook id):

- `app/uninstalled`: tokens deleted, install marked uninstalled.
- `customers/data_request`, `customers/redact`: AccessBell stores no shopper
  data, so there is nothing to export or delete; the request is logged.
- `shop/redact` (48 h after uninstall): install record deleted, and the
  account created for the store too if it has no Stripe customer and no members.

## Still to do before submission

- **Billing (blocked on pricing approval):** Managed Pricing or Billing API,
  `app_subscriptions/update` webhook, gate scans/fixes on the Shopify plan.
  Until then a Shopify account has `subscription_status = 'none'` and daily
  rescans do not run for it.
- Manual "Scan now" button in the embedded page (reuse `rescanPage`).
- Background token refresh (`refreshOfflineToken`) for scheduled work that
  calls the Admin API (not needed yet: scans hit the public storefront).
- Polaris web components for the admin UI (for "Built for Shopify").
- Check whether the app embed is on (`read_themes`) and show it in the page.
- Password-protected dev stores: the storefront scanner cannot see pages
  behind the store password.
- Apply `0016_shopify.sql`, set `SHOPIFY_API_KEY` / `SHOPIFY_API_SECRET` in
  Vercel, `shopify app deploy`, then submit for review.

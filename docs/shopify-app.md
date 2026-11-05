# AccessBell for Shopify (branch `shopify-app`)

Status: draft. Not merged, not deployed, migration not applied.
Billing uses Shopify Managed Pricing (plans approved by David: Option B).

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
| Plans and limits | `server/shopify/plans.js` |
| Billing (Managed Pricing sync) | `server/shopify/billing.js` |
| App embed check | `server/shopify/embed.js` |
| Free monthly scan | `server/shopify/free-scans.js` + `server/inngest/functions.js` |
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

## Billing: Shopify Managed Pricing

| Plan | Price | Pages | Automatic rescans | Manual "Scan now" | Fixes + page discovery |
| --- | --- | --- | --- | --- | --- |
| Free | $0 | home page | monthly | once a month | no (toolbar only) |
| Starter | $12/mo | 25 | weekly | once a day | yes |
| Pro | $29/mo or $290/yr | 500 (same as web Pro) | daily | any time (10 min gap) | yes |

3-day free trial on Starter and Pro. One store per plan (each install is its own account, domain quota 1).

**Why Managed Pricing, not the Billing API.** App Store rules require apps sold
there to charge through Shopify, not Stripe. Both options satisfy that.
Managed Pricing was chosen because Shopify hosts the plan picker, runs the
trial, upgrades, downgrades and proration, and Shopify recommends it for
simple, fixed-tier plans like these. That means no charge-creation or
approval-redirect code to get wrong in review. The Billing API would only be
needed for usage charges or custom discounts, which we don't have.

How it works:

- The "See plans" / "Change plan" button opens Shopify's hosted page
  `https://admin.shopify.com/store/{handle}/charges/accessbell/pricing_plans`.
- The plan is read from `currentAppInstallation.activeSubscriptions`
  (`billing.js`) on every app open and on the `app_subscriptions/update`
  webhook, then written to `app.shopify_shops` and mirrored to
  `app.accounts` (`plan_tier`, `subscription_status`, trial and period
  dates, `domain_quota = 1`). Accounts with a Stripe subscription are never
  touched.
- Because `subscription_status` follows Shopify, the existing access rule,
  daily scheduler and `fix.js` gate paid features with no new code paths.
  `FROZEN` maps to `paused` and pending approval to `incomplete`, both
  without access. A cancelled plan falls back to Free.
- Limits: pages above the plan limit are unmonitored whenever a plan is
  applied (home page kept first); the scheduler adds a Starter filter
  (weekly, first 25 pages); a separate daily cron scans Free home pages
  older than ~30 days; manual scans are rate-limited per plan (429
  `plan_scan_limit`); "Find pages" is paid only (402 `plan_required`).
  Free stores get the visitor toolbar from `fix.js`, but no fixes.
- `plan_tier` is read through `to_jsonb(a)->>'plan_tier'`, so the changed
  queries work before and after the migration, and web accounts (null tier)
  behave exactly as today.

**Partner Dashboard setup (David):** in the app's Pricing section choose
Managed Pricing and create plans named exactly **Free**, **Starter** ($12
every 30 days, 3-day trial) and **Pro** ($29 every 30 days and $290 annual,
3-day trial). The code maps plan names to tiers; an unknown name is treated
as Free.

## Embedded page

Shows the score and top issues, the current plan and trial end, a Scan now
button (Free and Starter show when the next scan is allowed; more than one
page runs in the background through Inngest), Find pages on paid plans, and
whether the AccessBell app embed is on (read from the live theme's
`config/settings_data.json` with `read_themes`, falling back to "fix.js was
seen in the last 7 days"), with a deep link that opens App embeds.

## Still to do before submission

- Create the Managed Pricing plans in the Partner Dashboard (names above).
- Regression alert emails: Shopify accounts have no members, so alerts are
  not emailed yet (could go to the shop email).
- Compliance Vault and CSV export are not exposed in the embedded page yet.
- Polaris web components for the admin UI (for "Built for Shopify").
- Password-protected dev stores: the storefront scanner cannot see pages
  behind the store password.
- Apply `0016_shopify.sql`, set `SHOPIFY_API_KEY` / `SHOPIFY_API_SECRET` in
  Vercel, `shopify app deploy`, then submit for review.

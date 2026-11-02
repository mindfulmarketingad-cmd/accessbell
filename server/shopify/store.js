// Shopify install records in Supabase (app.shopify_shops, migration 0016).
// Tokens are sealed with the app secret before they are written.
import crypto from 'node:crypto';
import { one, query, tx } from '../app/db.js';
import { DEFAULT_SETTINGS, normalizeSiteUrl } from '../app/domains.js';
import { seal, open } from './crypto-box.js';

export function createStore({ apiSecret }) {
  const unseal = (row) => row && {
    ...row,
    access_token: open(row.access_token, apiSecret),
    refresh_token: open(row.refresh_token, apiSecret),
  };

  return {
    async getShop(shop) {
      return unseal(await one('select * from app.shopify_shops where shop = $1', [shop]));
    },

    async saveTokens(shop, t) {
      await query(
        `insert into app.shopify_shops (shop, access_token, access_token_expires_at, refresh_token, refresh_token_expires_at, scope, installed_at, uninstalled_at)
         values ($1, $2, $3, $4, $5, $6, now(), null)
         on conflict (shop) do update set
           access_token = excluded.access_token, access_token_expires_at = excluded.access_token_expires_at,
           refresh_token = excluded.refresh_token, refresh_token_expires_at = excluded.refresh_token_expires_at,
           scope = excluded.scope, uninstalled_at = null,
           installed_at = case when app.shopify_shops.uninstalled_at is null then app.shopify_shops.installed_at else now() end,
           updated_at = now()`,
        [shop, seal(t.accessToken, apiSecret), t.expiresAt, seal(t.refreshToken, apiSecret), t.refreshExpiresAt, t.scope],
      );
    },

    /**
     * First install: a new AccessBell account (no Stripe link, no members)
     * with the store's primary domain and its home page monitored.
     * Re-installs keep the existing account and domain.
     */
    async provision(shop, { name, email, host }) {
      return tx(async (q) => {
        const [row] = await q('select account_id, domain_id from app.shopify_shops where shop = $1 for update', [shop]);
        if (row?.account_id && row?.domain_id) return { accountId: row.account_id, domainId: row.domain_id };
        const { hostname, baseUrl } = normalizeSiteUrl(host || shop);
        const [account] = await q(`insert into app.accounts (name, domain_quota) values ($1, 1) returning id`, [String(name || shop).slice(0, 120)]);
        const [domain] = await q(
          `insert into app.domains (account_id, hostname, base_url, settings, site_key) values ($1, $2, $3, $4, $5) returning id, site_key`,
          [account.id, hostname, baseUrl, DEFAULT_SETTINGS, crypto.randomBytes(18).toString('base64url')],
        );
        await q(`insert into app.pages (domain_id, url, monitored, source) values ($1, $2, true, 'manual')`, [domain.id, baseUrl + '/']);
        await q(
          `update app.shopify_shops set account_id = $2, domain_id = $3, account_created = true, shop_name = $4, shop_email = $5, primary_host = $6, updated_at = now() where shop = $1`,
          [shop, account.id, domain.id, name || null, email || null, hostname],
        );
        return { accountId: account.id, domainId: domain.id };
      });
    },

    async siteKey(domainId) {
      return (await one('select site_key from app.domains where id = $1', [domainId]))?.site_key || null;
    },

    async getAccount(accountId) {
      return one('select * from app.accounts where id = $1', [accountId]);
    },

    /** Returns false when this webhook id was already handled (Shopify retries). */
    async recordWebhook(id, topic, shop) {
      const rows = await query(
        `insert into app.shopify_webhook_events (id, topic, shop) values ($1, $2, $3) on conflict (id) do nothing returning id`,
        [id, topic, shop],
      );
      return rows.length > 0;
    },

    async markUninstalled(shop) {
      await query(
        `update app.shopify_shops set uninstalled_at = now(), access_token = null, refresh_token = null, access_token_expires_at = null, refresh_token_expires_at = null, updated_at = now() where shop = $1`,
        [shop],
      );
    },

    /**
     * shop/redact (48 hours after uninstall): delete the install record and,
     * if the account was created for this store and nobody has joined it,
     * the account too (its domains, pages and scans cascade).
     */
    async redactShop(shop) {
      await tx(async (q) => {
        const [row] = await q('select account_id, account_created from app.shopify_shops where shop = $1 for update', [shop]);
        await q('delete from app.shopify_shops where shop = $1', [shop]);
        if (row?.account_id && row.account_created) {
          await q(
            `delete from app.accounts a where a.id = $1 and a.stripe_customer_id is null
               and not exists (select 1 from app.account_members m where m.account_id = a.id)`,
            [row.account_id],
          );
        }
      });
    },
  };
}

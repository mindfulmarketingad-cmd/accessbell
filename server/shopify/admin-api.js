// Calls to Shopify: token exchange, token refresh and the GraphQL Admin API.
// `fetchImpl` is injectable so tests never reach the network.
import { SHOPIFY_API_VERSION } from './config.js';

const TOKEN_EXCHANGE = 'urn:ietf:params:oauth:grant-type:token-exchange';
const ID_TOKEN = 'urn:ietf:params:oauth:token-type:id_token';
const OFFLINE = 'urn:shopify:params:oauth:token-type:offline-access-token';

function tokensFrom(body, now) {
  if (!body?.access_token) throw new Error('shopify token response had no access_token');
  return {
    accessToken: body.access_token,
    scope: body.scope || '',
    expiresAt: body.expires_in ? new Date(now + body.expires_in * 1000) : null,
    refreshToken: body.refresh_token || null,
    refreshExpiresAt: body.refresh_token_expires_in ? new Date(now + body.refresh_token_expires_in * 1000) : null,
  };
}

async function postToken(shop, params, fetchImpl) {
  const res = await fetchImpl(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams(params).toString(),
  });
  if (!res.ok) {
    const err = new Error(`shopify token request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/** Embedded app: swap the App Bridge ID token for an expiring offline token. */
export async function exchangeIdToken(shop, idToken, { apiKey, apiSecret }, { fetchImpl = fetch, now = Date.now() } = {}) {
  const body = await postToken(shop, {
    client_id: apiKey,
    client_secret: apiSecret,
    grant_type: TOKEN_EXCHANGE,
    subject_token: idToken,
    subject_token_type: ID_TOKEN,
    requested_token_type: OFFLINE,
    expiring: '1',
  }, fetchImpl);
  return tokensFrom(body, now);
}

/** Background work (no merchant session): renew an expiring offline token. */
export async function refreshOfflineToken(shop, refreshToken, { apiKey, apiSecret }, { fetchImpl = fetch, now = Date.now() } = {}) {
  const body = await postToken(shop, {
    client_id: apiKey,
    client_secret: apiSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  }, fetchImpl);
  return tokensFrom(body, now);
}

export async function graphql(shop, accessToken, queryText, variables = {}, { fetchImpl = fetch } = {}) {
  const res = await fetchImpl(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': accessToken },
    body: JSON.stringify({ query: queryText, variables }),
  });
  if (!res.ok) throw new Error(`shopify graphql failed (${res.status})`);
  const body = await res.json();
  if (body.errors?.length) throw new Error(`shopify graphql error: ${body.errors[0]?.message || 'unknown'}`);
  return body.data;
}

export const SHOP_QUERY = `query AccessBellShop {
  shop { name email primaryDomain { host url } }
  currentAppInstallation { id }
}`;

// The theme app embed reads this as app.metafields.accessbell.site_key.
export const SET_SITE_KEY = `mutation AccessBellSiteKey($ownerId: ID!, $value: String!) {
  metafieldsSet(metafields: [{ ownerId: $ownerId, namespace: "accessbell", key: "site_key", type: "single_line_text_field", value: $value }]) {
    userErrors { field message }
  }
}`;

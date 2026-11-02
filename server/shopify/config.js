// Shopify app settings. Read lazily so tests can pass their own env.
// None of these are set in production yet: the Shopify app is not live.
export const SHOPIFY_API_VERSION = '2026-10';

export function shopifyConfig(env = process.env) {
  return {
    apiKey: env.SHOPIFY_API_KEY || '', // the app's client ID
    apiSecret: env.SHOPIFY_API_SECRET || '', // the app's client secret
    appUrl: (env.SHOPIFY_APP_URL || env.APP_URL || 'https://www.accessbell.co').replace(/\/$/, ''),
    // Where the theme app embed loads the fix script from.
    fixScriptUrl: env.SHOPIFY_FIX_SCRIPT_URL || 'https://www.accessbell.co/fix.js',
  };
}

export const shopifyConfigured = (env = process.env) => {
  const c = shopifyConfig(env);
  return Boolean(c.apiKey && c.apiSecret);
};

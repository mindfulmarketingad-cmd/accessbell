// Environment configuration for the customer app. Read lazily so tests can
// set process.env before first use.
export const ROLES = ['viewer', 'member', 'admin', 'owner'];
export const ROLE_RANK = { viewer: 1, member: 2, admin: 3, owner: 4 };

/** Pro plan limits. */
export const LIMITS = {
  // Also enforced by the database (supabase/migrations/0006_page_limit_500.sql).
  monitoredPagesPerDomain: 500,
  discoveredPagesPerDomain: 2000,
  // Fair use for "unlimited rescans": enough for a full scan of 500 pages on
  // desktop and mobile across a few domains in one hour.
  scansPerAccountPerHour: 5000,
};

/** Subscription states that unlock the paid features. */
export const ACTIVE_STATUSES = new Set(['trialing', 'active']);

/** Domains an admin account (see ADMIN_EMAILS) may monitor without paying. */
export const ADMIN_DOMAIN_QUOTA = 25;
/** Domains a manually activated Subscriber may add when Stripe has not set a quota. */
export const SUBSCRIBER_MIN_DOMAINS = 1;

export function config(env = process.env) {
  return {
    supabaseUrl: (env.SUPABASE_URL || 'https://ucqlkhhjoriakjyeogbx.supabase.co').replace(/\/$/, ''),
    supabaseAnonKey: env.SUPABASE_ANON_KEY || '',
    supabaseServiceKey: env.SUPABASE_SERVICE_ROLE_KEY || '',
    databaseUrl: env.DATABASE_URL || '',
    stripeSecretKey: env.STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET || '',
    stripePaymentLink: env.STRIPE_PAYMENT_LINK || 'https://buy.stripe.com/8x2bJ2gyKdFe7My31kfrW0o',
    stripePaymentLinkAnnual: env.STRIPE_PAYMENT_LINK_ANNUAL || 'https://buy.stripe.com/3cI14ogyK44EaYKeK2frW0p',
    resendApiKey: env.RESEND_API_KEY || '',
    emailFrom: env.EMAIL_FROM || 'AccessBell <alerts@accessbell.co>',
    appUrl: (env.APP_URL || 'https://www.accessbell.co').replace(/\/$/, ''),
    // Comma-separated emails (e.g. "you@example.com,co-founder@example.com")
    // that get full dashboard access without a Stripe subscription.
    adminEmails: (env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  };
}

/** Which required settings are missing, for a clear error instead of a crash. */
export function missingConfig(keys, env = process.env) {
  const c = config(env);
  const names = {
    supabaseAnonKey: 'SUPABASE_ANON_KEY',
    supabaseServiceKey: 'SUPABASE_SERVICE_ROLE_KEY',
    databaseUrl: 'DATABASE_URL',
    stripeSecretKey: 'STRIPE_SECRET_KEY',
    stripeWebhookSecret: 'STRIPE_WEBHOOK_SECRET',
  };
  return keys.filter((k) => !c[k]).map((k) => names[k] || k);
}

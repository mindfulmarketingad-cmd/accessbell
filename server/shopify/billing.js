// Shopify billing uses Managed Pricing (see docs/shopify-app.md for why).
// Shopify hosts the plan page, runs the 3-day trial, charges the merchant and
// handles upgrades, downgrades and proration. The app only:
//   1. sends the merchant to the hosted plan page (pricingPageUrl),
//   2. reads the active subscription (currentAppInstallation) on every open
//      and on the app_subscriptions/update webhook,
//   3. stores the plan and mirrors it onto the AccessBell account so the
//      existing access rule, scheduler and fix script follow it.
// Nothing here touches Stripe.
import { graphql } from './admin-api.js';
import { planFromSubscriptions } from './plans.js';

export const SUBSCRIPTION_QUERY = `query AccessBellPlan {
  currentAppInstallation {
    activeSubscriptions {
      id name status trialDays createdAt currentPeriodEnd
      lineItems { plan { pricingDetails { __typename ... on AppRecurringPricing { interval price { amount currencyCode } } } } }
    }
  }
}`;

export async function fetchPlan(shop, accessToken, { fetchImpl = fetch, now = Date.now() } = {}) {
  const data = await graphql(shop, accessToken, SUBSCRIPTION_QUERY, {}, { fetchImpl });
  return planFromSubscriptions(data?.currentAppInstallation?.activeSubscriptions, now);
}

// Shopify billing: NOT BUILT YET, waiting for David to approve pricing
// (see the shopify-app PR). Shopify App Store apps must charge through
// Shopify (Managed Pricing or the Billing API), not Stripe, so nothing here
// touches the existing Stripe billing.
//
// TODO(pricing approval):
// 1. Pick Managed Pricing (plans set in the Partner Dashboard, Shopify hosts
//    the plan page) or the GraphQL Billing API (appSubscriptionCreate).
// 2. Handle the app_subscriptions/update webhook and set the linked
//    app.accounts row's subscription_status/trial_ends_at from it.
// 3. Gate scans and fixes on that status, the same way Stripe does today.

export const BILLING_TODO = 'Shopify billing is not set up yet: pricing is waiting for approval.';

/** Whether the store has an active Shopify plan. Always false until billing ships. */
export async function shopHasActivePlan() {
  return false;
}

export function billingNotImplemented() {
  return { status: 501, body: { error: BILLING_TODO, code: 'billing_pending' } };
}

# One-time Stripe products (created 2026-10-29, live mode)

One-time purchases are sold through Stripe Payment Links. The buyer needs no
account: `/api/one-time-checkout` creates a pending purchase row and returns
the link with `client_reference_id` set to the purchase token, and the
verified `checkout.session.completed` webhook matches the payment back to
that row. The same webhook already handled subscription checkouts; the
payment-mode branch for one-time purchases was added without changing any
subscription handling.

## Products (live)

| Product | Price | Product ID | Price ID | Payment link |
|---|---|---|---|---|
| AccessBell Page Report | $19 one-time | prod_VWp2zN7pEvDbhc | price_1UVlOZLlgxXvIOfebnrO67pw | https://buy.stripe.com/bJe8wQ2HU9oY7MyeK2frW0q |
| AccessBell Domain Audit | $79 one-time | prod_VWp2J7Wd3ZbjnK | price_1UVlOuLlgxXvIOfepP9ZEj1j | https://buy.stripe.com/fZu28sciueJi8QC1XgfrW0r |

Payment link IDs: Page Report `plink_1UVlOeLlgxXvIOfezVShDoOM`, Domain Audit
`plink_1UVlOyLlgxXvIOfeXATuXUD9`. Both links are active, one-time
(`recurring` is empty on both prices), and redirect after completion to
`https://accessbell.co/report`, where the buyer pastes the token from the
emailed report link. Each link also carries `metadata.product`
(`page_report` / `domain_audit`) as a backup identifier; the webhook matches
on `client_reference_id` first.

The links were created on the Stripe account that already holds the
AccessBell Pro payment links (the monthly and annual links in
`server/app/config.js`), so payouts go to the same account. No test charges
were run.

## Wiring

`server/app/config.js` already defaults to these two links:

- `STRIPE_PAYMENT_LINK_PAGE_REPORT` (default: the Page Report link above)
- `STRIPE_PAYMENT_LINK_DOMAIN_AUDIT` (default: the Domain Audit link above)

Set the env vars in the Vercel project only to override the defaults. The
webhook endpoint and signing secret are unchanged. If a link is ever
replaced, update the default (or the env var) and keep the
`client_reference_id` mechanism: the checkout URL builder in
`server/app/one-time.js` appends the purchase token and the buyer's email
(`prefilled_email`) to whatever link is configured.

## What is not handled yet

- Refunds: a refunded one-time purchase is not revoked automatically.
  Refund handling (`charge.refunded` / `payment_intent` status) is an open
  item; until then, revoke report access manually if a purchase is refunded.
- Taxes: the links use Stripe's defaults, same as the existing Pro links.
  If tax collection is enabled later, enable it on these links too.

---
title: 'Failed Payments'
description: 'What happens in AccessBell when a card payment fails, why monitoring pauses, and how the Owner updates the card to restore full access.'
order: 5
updatedDate: 2026-09-28
---

If a renewal payment fails, for example because a card has expired, Stripe retries it automatically over the following days.

## What You See

- The Billing page status shows **Payment failed**.
- Everyone on the team sees a banner at the top of the dashboard.
- Monitoring, new scans and adding domains are paused until the payment goes through. Your data is kept.

## Fix It

1. The Owner selects **Update payment method** in the banner, or **Manage billing** on the Billing page.
2. In the Stripe portal, add or update the card.
3. Stripe retries the payment. Once it succeeds, everything is unlocked automatically.

If the payment keeps failing, check with your bank that online and international payments are allowed, then try again. Still stuck? [Contact support](/contact?topic=billing).

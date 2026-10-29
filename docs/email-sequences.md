# Email sequences (one-time purchases and follow-up)

Templates and senders live in `server/app/email-sequences.js`. All mail is
plain text. No email claims a scan makes a site compliant or safe from legal
action. Transactional mail (report links, payment receipts) is sent by the
webhook and the audit function. Sequence mail is sent by the ops agent on
its schedule; every sequence email carries an opt-out line
("Reply to this email with 'opt out' and we will not follow up").

## Transactional (sent by the product)

| Email | Trigger | Sender |
|---|---|---|
| Page Report link | One-time Page Report payment completes | `handleOneTimePayment` (webhook) |
| Domain Audit payment received | One-time Domain Audit payment completes | `handleOneTimePayment` (webhook) |
| Domain Audit ready | Inngest crawl finishes and the report is stored | `one-time-domain-audit` function |

## Sequences (sent by the ops agent, Phase 2)

| Sequence | Audience | Trigger | Cadence |
|---|---|---|---|
| Scan follow-up | `app.scan_leads` rows | Visitor left an email after a free scan | Once per lead, on the ops schedule |
| Abandoned checkout | `app.one_time_purchases` rows stuck pending | 24 hours after checkout started | Once per purchase (`reminder_sent_at` is set after sending; see `sendAbandonedCheckoutReminders` in `server/app/one-time.js`) |
| Audit-to-Pro upsell | Buyers of a delivered Domain Audit | After the audit report is delivered | Once per buyer, on the ops schedule |

Open items for the ops job: scan follow-up and upsell sends are not yet
tracked in Supabase (the abandoned-checkout sweep is, via
`reminder_sent_at`). Until tracking columns are added, the ops job must
record which follow-ups and upsells it sent in its own run log so no lead
or buyer is emailed twice.

## What is never sent

- No bulk cold outreach in Phase 1. Outreach to past free scanners waits on
  a Supabase export and its own approval (Phase 2).
- No email is sent when a scan lead is captured (`/api/scan-lead` only
  stores the lead). The follow-up goes out with the sequence, not at capture.
- No paid ads are used anywhere in this funnel.

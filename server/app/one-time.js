// One-time purchases: Page Report ($19) and Domain Audit ($79).
//
// Flow: a buyer (no account required) submits an email and a URL to
// /api/one-time-checkout. We create a pending purchase row with a token and
// return the Stripe Payment Link with client_reference_id set to that token.
// Stripe calls /api/stripe-webhook with checkout.session.completed; the
// payment-mode branch in billing.js hands the session to handleOneTimePayment
// here, which marks the row paid and, for a domain audit, queues the crawl.
// The buyer opens /report?token=... to see the report: a page report is built
// on first view, a domain audit is built by the Inngest function.
//
// Nothing here touches subscriptions: subscription checkouts keep flowing
// through the existing subscription branch in billing.js.
import crypto from 'node:crypto';
import { config } from './config.js';
import { one, query } from './db.js';
import { sendPaymentReceivedEmail, sendReportLinkEmail } from './email-sequences.js';

export const ONE_TIME_PRODUCTS = {
  page_report: {
    id: 'page_report',
    name: 'Page Report',
    priceCents: 1900,
    priceLabel: '$19',
    blurb: 'Full issue detail, fixes and a PDF for a single page.',
  },
  domain_audit: {
    id: 'domain_audit',
    name: 'Domain Audit',
    priceCents: 7900,
    priceLabel: '$79',
    blurb: 'Full crawl of up to 500 pages, every issue with fixes, a PDF evidence pack, a dated good-faith summary and an accessibility statement.',
  },
};

const TOKEN_RE = /^[a-f0-9]{32}$/;
export function validToken(v) {
  return typeof v === 'string' && TOKEN_RE.test(v);
}

export function hostOf(u) {
  try {
    return new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** Payment Link URL for this purchase, tied to it by client_reference_id. Null when the link is not configured. */
export function oneTimeCheckoutUrl(product, purchase) {
  const c = config();
  const link = product === 'page_report' ? c.stripePaymentLinkPageReport : c.stripePaymentLinkDomainAudit;
  if (!link) return null;
  const url = new URL(link);
  url.searchParams.set('client_reference_id', purchase.token);
  if (purchase.email) url.searchParams.set('prefilled_email', purchase.email);
  return url.toString();
}

export async function createOneTimePurchase({ email, product, url }) {
  const token = crypto.randomBytes(16).toString('hex');
  const rows = await query(
    `insert into app.one_time_purchases (token, email, product, url, hostname, amount_cents, status, delivery)
     values ($1, $2, $3, $4, $5, $6, 'pending', 'pending') returning *`,
    [token, email.toLowerCase(), product, url, hostOf(url), ONE_TIME_PRODUCTS[product].priceCents],
  );
  return rows[0];
}

export async function getPurchaseByToken(token) {
  if (!validToken(token)) return null;
  return one('select * from app.one_time_purchases where token = $1', [token]);
}

/**
 * Mark a purchase paid from a verified checkout.session.completed payload.
 * Idempotent: a Stripe retry for the same session returns the paid row with
 * wasAlreadyPaid set, so the caller can skip repeat emails.
 */
export async function markPurchasePaid(session) {
  const token = session.client_reference_id;
  if (!validToken(token)) return null;
  const intent = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null;
  const paid = await one(
    `update app.one_time_purchases
        set status = 'paid', stripe_session_id = $2, stripe_payment_intent_id = $3, paid_at = now()
      where token = $1 and status = 'pending' returning *`,
    [token, session.id || null, intent],
  );
  if (paid) return { row: paid, wasAlreadyPaid: false };
  const existing = await one(`select * from app.one_time_purchases where token = $1 and status = 'paid'`, [token]);
  if (existing) return { row: existing, wasAlreadyPaid: true };
  return null;
}

/** Queue the domain-audit crawl. Throws on failure so Stripe retries the webhook. */
export async function sendOneTimeAuditEvent(token) {
  const { inngest } = await import('../inngest/functions.js');
  await inngest.send({ name: 'app/one-time.audit', data: { token } });
}

/**
 * Handle a verified one-time (mode=payment) checkout.session.completed.
 * Page reports need no background work: the report builds when the buyer
 * opens the emailed link. Domain audits queue an Inngest crawl; if queueing
 * throws, the caller must fail so Stripe retries the event.
 */
export async function handleOneTimePayment(session) {
  const marked = await markPurchasePaid(session);
  if (!marked) return 'unmatched one-time checkout';
  const { row, wasAlreadyPaid } = marked;
  const reportUrl = `${config().appUrl}/report?token=${row.token}`;
  if (row.product === 'domain_audit') {
    if (row.delivery === 'pending') await sendOneTimeAuditEvent(row.token);
    if (!wasAlreadyPaid) {
      try {
        await sendPaymentReceivedEmail({ to: row.email, hostname: row.hostname, reportUrl });
      } catch (err) {
        console.error('one-time payment email failed:', err.message);
      }
    }
    return 'one-time paid: domain audit';
  }
  if (!wasAlreadyPaid) {
    try {
      await sendReportLinkEmail({ to: row.email, hostname: row.hostname, reportUrl });
    } catch (err) {
      console.error('one-time report email failed:', err.message);
    }
  }
  return 'one-time paid: page report';
}

// ---------- Inngest audit lifecycle ----------

/** Move a paid, pending audit to building. A second run sees it is no longer pending and skips. */
export async function startOneTimeAudit(token) {
  const row = await one(
    `update app.one_time_purchases set delivery = 'building'
      where token = $1 and status = 'paid' and delivery = 'pending' returning *`,
    [token],
  );
  if (row) return { skipped: false, purchase: row };
  const existing = await getPurchaseByToken(token);
  return { skipped: true, reason: existing ? `delivery is ${existing.delivery}` : 'unknown purchase' };
}

/** Store the finished report and mark the audit ready. Only the run that still holds 'building' wins. */
export async function finishOneTimeAudit(token, report) {
  const row = await one(
    `update app.one_time_purchases set delivery = 'ready', report = $2::jsonb
      where token = $1 and delivery = 'building' returning *`,
    [token, JSON.stringify(report)],
  );
  return { ready: Boolean(row), purchase: row || null };
}

export async function failOneTimeAudit(token) {
  await one(
    `update app.one_time_purchases set delivery = 'failed' where token = $1 and delivery = 'building'`,
    [token],
  );
}

// ---------- Abandoned-checkout reminders (ops-triggered, once per purchase) ----------

/** Send one reminder for each pending purchase older than 24 hours that has not been reminded yet. */
export async function sendAbandonedCheckoutReminders({ sendReminder } = {}) {
  const { sendAbandonedCheckoutReminder } = await import('./email-sequences.js');
  const send = sendReminder || sendAbandonedCheckoutReminder;
  const rows = await query(
    `select * from app.one_time_purchases
      where status = 'pending' and reminder_sent_at is null and created_at < now() - interval '24 hours'
      order by created_at asc limit 100`,
  );
  let sent = 0;
  for (const row of rows) {
    const url = oneTimeCheckoutUrl(row.product, row);
    if (!url) continue;
    const res = await send({ to: row.email, product: row.product, hostname: row.hostname, checkoutUrl: url, purchaseId: row.id });
    if (res.ok) {
      await one('update app.one_time_purchases set reminder_sent_at = now() where id = $1', [row.id]);
      sent++;
    }
  }
  return { sent, checked: rows.length };
}

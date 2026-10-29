// POST /api/one-time-checkout { product, url, email } -> { checkoutUrl, token, product }
//
// Creates a pending one-time purchase and returns the Stripe Payment Link
// with client_reference_id set to the purchase token, so the webhook can
// match the payment back to this row. No account is required.
import { config } from '../server/app/config.js';
import { ONE_TIME_PRODUCTS, createOneTimePurchase, oneTimeCheckoutUrl } from '../server/app/one-time.js';
import { createRateLimiter } from '../server/rate-limit.js';
import { json, checkOrigin, clientIp, readJson, methodNotAllowed } from '../server/http.js';

const perMinute = createRateLimiter({ limit: 5, windowMs: 60_000 });
const perHour = createRateLimiter({ limit: 30, windowMs: 60 * 60_000 });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  if (!checkOrigin(request)) return json(403, { error: 'Requests from this origin are not allowed.' });
  const ip = clientIp(request);
  for (const limiter of [perMinute, perHour]) {
    const rl = limiter(ip);
    if (!rl.allowed) {
      return json(429, { error: 'Too many requests. Please wait a few minutes and try again.' }, { 'Retry-After': String(rl.retryAfter) });
    }
  }
  const body = await readJson(request, 4096);
  const product = body?.product;
  if (!ONE_TIME_PRODUCTS[product]) return json(400, { error: 'Choose a report type.' });
  if (typeof body?.url !== 'string' || body.url.length > 2048) return json(400, { error: 'Enter a valid web address.' });
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(body.url.trim()) ? body.url.trim() : `https://${body.url.trim()}`);
  } catch {
    return json(400, { error: 'Enter a valid web address.' });
  }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) {
    return json(400, { error: 'Enter a valid web address.' });
  }
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email) || email.length > 254) return json(400, { error: 'Enter a valid email address.' });
  const c = config();
  const link = product === 'page_report' ? c.stripePaymentLinkPageReport : c.stripePaymentLinkDomainAudit;
  if (!link) return json(503, { error: 'Checkout for this report is not configured yet. Please contact support.' });
  if (!process.env.DATABASE_URL) return json(503, { error: 'Checkout is not configured yet. Please contact support.' });
  try {
    const purchase = await createOneTimePurchase({ email, product, url: url.toString() });
    const checkoutUrl = oneTimeCheckoutUrl(product, purchase);
    if (!checkoutUrl) return json(503, { error: 'Checkout for this report is not configured yet. Please contact support.' });
    return json(200, { checkoutUrl, token: purchase.token, product });
  } catch (err) {
    if (err?.code === '42P01' || err?.code === '42703') {
      return json(503, { error: 'Checkout is not configured yet. Please contact support.' });
    }
    console.error('one-time checkout failed', err);
    return json(500, { error: 'Checkout could not be started. Please try again.' });
  }
}

export function GET() {
  return methodNotAllowed('POST');
}

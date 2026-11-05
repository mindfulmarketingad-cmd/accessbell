// Shopify webhooks, including the three mandatory privacy (compliance)
// topics every App Store app must handle. All arrive at one URL; the topic
// is in the X-Shopify-Topic header.
//
// AccessBell stores no data about a store's customers (shoppers): it scans
// public storefront pages and keeps the store owner's account. So the two
// customer topics have nothing to export or delete, and say so in the log.
import { verifyWebhookHmac, normalizeShop } from './verify.js';

const MAX_BODY = 256 * 1024;

export const TOPICS = ['app/uninstalled', 'app_subscriptions/update', 'customers/data_request', 'customers/redact', 'shop/redact'];

export async function handleWebhook(request, { apiSecret, store, syncPlan, log = console }) {
  const raw = await request.text();
  if (raw.length > MAX_BODY) return { status: 413, body: { error: 'payload too large' } };
  // Shopify's review checks that a bad signature gets a 401.
  if (!verifyWebhookHmac(raw, request.headers.get('x-shopify-hmac-sha256'), apiSecret)) {
    return { status: 401, body: { error: 'invalid hmac' } };
  }
  const topic = String(request.headers.get('x-shopify-topic') || '').toLowerCase();
  const shop = normalizeShop(request.headers.get('x-shopify-shop-domain'));
  const id = request.headers.get('x-shopify-event-id') || request.headers.get('x-shopify-webhook-id');
  if (!shop || !TOPICS.includes(topic)) return { status: 200, body: { ignored: true } };

  let payload = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    return { status: 400, body: { error: 'invalid json' } };
  }

  if (id && !(await store.recordWebhook(id, topic, shop))) return { status: 200, body: { duplicate: true } };

  switch (topic) {
    case 'app/uninstalled':
      await store.markUninstalled(shop);
      break;
    case 'app_subscriptions/update':
      // Plan changed, trial started or ended, or the merchant cancelled.
      if (syncPlan) await syncPlan(shop, payload);
      break;
    case 'customers/data_request':
    case 'customers/redact':
      // Nothing stored about shoppers. Logged (no PII) so the request has a record.
      log.log('shopify privacy request', topic, shop, payload?.customer?.id ? 'customer:' + payload.customer.id : '');
      break;
    case 'shop/redact':
      await store.redactShop(shop);
      break;
  }
  return { status: 200, body: { received: true } };
}

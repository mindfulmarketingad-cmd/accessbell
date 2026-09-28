// POST /api/stripe-webhook -> Stripe subscription events
import { config } from '../server/app/config.js';
import { verifyStripeSignature, handleStripeEvent } from '../server/app/billing.js';

const MAX_BODY = 512 * 1024;

const reply = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export async function POST(request) {
  const secret = config().stripeWebhookSecret;
  if (!secret) return reply(503, { error: 'webhook not configured' });

  const raw = await request.text();
  if (raw.length > MAX_BODY) return reply(413, { error: 'payload too large' });
  if (!verifyStripeSignature(raw, request.headers.get('stripe-signature'), secret)) {
    return reply(400, { error: 'invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return reply(400, { error: 'invalid json' });
  }

  try {
    const result = await handleStripeEvent(event);
    console.log('stripe event', event.type, event.id, result);
    return reply(200, { received: true });
  } catch (err) {
    // A non-2xx response makes Stripe retry the event later.
    console.error('stripe event failed', event.type, event.id, err && err.message);
    return reply(500, { error: 'processing failed' });
  }
}

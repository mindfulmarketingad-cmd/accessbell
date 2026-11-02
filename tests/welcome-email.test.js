// The subscriber welcome email: exact copy, reply-to, and that a failing
// sender never throws out of the Stripe webhook path.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { welcomeSubscriberEmail } from '../server/app/email-sequences.js';
import { welcomeOnce } from '../server/app/billing.js';

test('welcome email copy links to the dashboard', () => {
  const { subject, text } = welcomeSubscriberEmail();
  assert.equal(subject, 'Welcome to AccessBell');
  assert.match(text, /^Hi there,/);
  assert.match(text, /Your dashboard is ready here: https:\/\/www\.accessbell\.co\/app/);
  assert.match(text, /Welcome aboard,\nDavid\nAccessBell$/);
});

test('welcomeOnce sends to the checkout email with the account as key', async () => {
  const calls = [];
  const res = await welcomeOnce('acct-1', { customer_details: { email: 'Owner@Example.com ' } }, async (a) => {
    calls.push(a);
    return { ok: true, id: 'em_1' };
  });
  assert.deepEqual(calls, [{ to: 'owner@example.com', key: 'acct-1' }]);
  assert.equal(res.ok, true);
});

test('welcomeOnce never throws when sending fails', async () => {
  const res = await welcomeOnce('acct-2', { customer_email: 'a@b.co' }, async () => {
    throw new Error('resend down');
  });
  assert.equal(res.ok, false);
});

test('dashboard access rule includes a live Stripe subscription', async () => {
  const { accessRules } = await import('../server/app/access.js');
  const rules = accessRules('a');
  assert.ok(rules.every((r) => r.includes("a.subscription_status in ('trialing', 'active')")));
});

test('only AccessBell Pro products count as an AccessBell subscription', async () => {
  const { subscriptionMatchesProducts } = await import('../server/app/billing.js');
  const ids = new Set(['prod_ab']);
  const sub = (p) => ({ items: { data: [{ price: { product: p } }] } });
  assert.equal(subscriptionMatchesProducts(sub('prod_ab'), ids), true);
  assert.equal(subscriptionMatchesProducts(sub('prod_other'), ids), false);
  assert.equal(subscriptionMatchesProducts({ items: { data: [] } }, ids), false);
});

test('AccessBell products come from the configured Payment Links', async () => {
  const { accessBellProductIds } = await import('../server/app/billing.js');
  const { config } = await import('../server/app/config.js');
  const c = config();
  const stripeApi = async (_m, path) => {
    if (path.startsWith('/payment_links?')) {
      return { data: [{ id: 'plink_m', url: c.stripePaymentLink }, { id: 'plink_x', url: 'https://buy.stripe.com/other' }], has_more: false };
    }
    if (path.startsWith('/payment_links/plink_m/')) return { data: [{ price: { product: 'prod_ab' } }] };
    throw new Error(`unexpected ${path}`);
  };
  const ids = await accessBellProductIds({ stripeApi, now: 1 });
  assert.deepEqual([...ids], ['prod_ab']);
});

test('only email-link sessions count as a verified email', async () => {
  const { emailVerifiedSession } = await import('../server/app/billing.js');
  const tok = (methods) => `x.${Buffer.from(JSON.stringify({ amr: methods.map((method) => ({ method })) })).toString('base64url')}.y`;
  assert.equal(emailVerifiedSession(tok(['password'])), false);
  assert.equal(emailVerifiedSession(tok(['recovery'])), true);
  assert.equal(emailVerifiedSession(tok(['invite'])), true);
  assert.equal(emailVerifiedSession('garbage'), false);
});

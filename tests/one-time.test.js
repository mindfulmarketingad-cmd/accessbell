// One-time purchase helpers: products, tokens, hosts and checkout URLs.
// These tests never touch Stripe or the database.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ONE_TIME_PRODUCTS, validToken, hostOf, oneTimeCheckoutUrl } from '../server/app/one-time.js';

test('one-time products are priced $19 and $79', () => {
  assert.equal(ONE_TIME_PRODUCTS.page_report.priceCents, 1900);
  assert.equal(ONE_TIME_PRODUCTS.domain_audit.priceCents, 7900);
  assert.equal(ONE_TIME_PRODUCTS.page_report.priceLabel, '$19');
  assert.equal(ONE_TIME_PRODUCTS.domain_audit.priceLabel, '$79');
});

test('tokens are 32 lowercase hex characters', () => {
  assert.equal(validToken('a'.repeat(32)), true);
  assert.equal(validToken('A'.repeat(32)), false);
  assert.equal(validToken('short'), false);
  assert.equal(validToken(''), false);
  assert.equal(validToken(null), false);
});

test('hostOf strips www and schemes', () => {
  assert.equal(hostOf('https://www.example.com/checkout'), 'example.com');
  assert.equal(hostOf('example.org'), 'example.org');
  assert.equal(hostOf('not a url !!!'), '');
});

test('checkout URL ties the purchase token and email to the payment link', () => {
  process.env.STRIPE_PAYMENT_LINK_PAGE_REPORT = 'https://buy.stripe.com/test-page-report';
  process.env.STRIPE_PAYMENT_LINK_DOMAIN_AUDIT = 'https://buy.stripe.com/test-domain-audit';
  const token = 'b'.repeat(32);
  const pageUrl = oneTimeCheckoutUrl('page_report', { token, email: 'Buyer@Example.com' });
  assert.ok(pageUrl.startsWith('https://buy.stripe.com/test-page-report?'));
  const params = new URL(pageUrl).searchParams;
  assert.equal(params.get('client_reference_id'), token);
  assert.equal(params.get('prefilled_email'), 'Buyer@Example.com');
  const auditUrl = oneTimeCheckoutUrl('domain_audit', { token, email: '' });
  assert.ok(auditUrl.startsWith('https://buy.stripe.com/test-domain-audit?'));
  assert.equal(new URL(auditUrl).searchParams.get('client_reference_id'), token);
  delete process.env.STRIPE_PAYMENT_LINK_PAGE_REPORT;
  delete process.env.STRIPE_PAYMENT_LINK_DOMAIN_AUDIT;
});

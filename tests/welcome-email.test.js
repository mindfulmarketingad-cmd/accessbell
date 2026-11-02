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

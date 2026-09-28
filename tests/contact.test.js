import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateContact, formatEmail, sendViaResend } from '../server/contact.js';

const base = { name: 'Ada', email: 'ada@example.com', topic: 'general', plan: '', message: 'Hello there, a question.', consent: true, elapsedMs: 9000, website: '' };

test('accepts a valid submission', () => {
  const r = validateContact(base);
  assert.equal(r.ok, true);
  assert.equal(r.data.email, 'ada@example.com');
});

test('flags honeypot and too-fast submissions as spam', () => {
  assert.equal(validateContact({ ...base, website: 'http://spam' }).spam, true);
  assert.equal(validateContact({ ...base, elapsedMs: 300 }).spam, true);
});

test('rejects invalid fields', () => {
  assert.equal(validateContact({ ...base, email: 'nope' }).ok, false);
  assert.equal(validateContact({ ...base, topic: 'hack' }).ok, false);
  assert.equal(validateContact({ ...base, plan: 'free-forever' }).ok, false);
  assert.equal(validateContact({ ...base, plan: 'lite', domains: '3' }).ok, true);
  assert.equal(validateContact({ ...base, domains: '-1' }).ok, false);
  assert.equal(validateContact({ ...base, message: 'short' }).ok, false);
  assert.equal(validateContact({ ...base, consent: 'true' }).ok, false);
  assert.equal(validateContact(null).ok, false);
});

test('strips header-injection newlines from single-line fields', () => {
  const r = validateContact({ ...base, name: 'Ada\r\nBcc: victim@example.com' });
  assert.equal(r.ok, true);
  assert.doesNotMatch(r.data.name, /[\r\n]/);
});

test('email body is plain text', () => {
  const body = formatEmail(validateContact({ ...base, message: '<script>alert(1)</script> hello world' }).data, { at: 'now' });
  assert.match(body, /<script>/); // delivered as text/plain, never rendered
});

test('delivery reports not-configured without credentials', async () => {
  assert.deepEqual(await sendViaResend(base, {}), { ok: false, reason: 'not-configured' });
});

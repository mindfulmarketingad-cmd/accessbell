// Scan results email (capture) and the owner-gated outreach runner.
import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
const seq = await import('../server/app/email-sequences.js');
const { runOutreach } = await import('../server/app/funnel.js');

test('scan results email: real counts, guided fix wording, 3-day trial, unsubscribe footer', () => {
  const m = seq.scanResultsEmail({ to: 'a@b.co', hostname: 'b.co', url: 'https://b.co/', issues: 7, critical: 2, serious: 3 });
  assert.match(m.subject, /scan results for b\.co/);
  assert.match(m.text, /found 7 issues \(2 critical, 3 serious\)/);
  assert.match(m.text, /guided fix suggestions/);
  assert.match(m.text, /3-day free trial/);
  assert.match(m.text, /api\/unsubscribe\?t=/);
  assert.doesNotMatch(m.text, /AI-assisted/i);
  const none = seq.scanResultsEmail({ to: 'a@b.co', hostname: 'b.co', url: 'https://b.co/' });
  assert.match(none.text, /results page/);
});

test('outreach needs confirm SEND, skips suppressed/excluded/invalid, sends once each', async () => {
  const sends = [];
  const send = async (a) => { sends.push(a); return { ok: true, id: 'x' }; };
  const items = [
    { email: 'info@shop.com', hostname: 'shop.com', subject: 's', body: 'b' },
    { email: 'gone@x.com', hostname: 'x.com', subject: 's', body: 'b' },
    { email: 'me@ramenearyou.com', hostname: 'ramenearyou.com', subject: 's', body: 'b' },
    { email: 'not-an-email', hostname: 'y.com', subject: 's', body: 'b' },
  ];
  assert.ok((await runOutreach({ items, send, suppressedEmails: [] })).error);
  assert.equal(sends.length, 0);
  const dry = await runOutreach({ items, send, dryRun: true, suppressedEmails: ['GONE@x.com'] });
  assert.equal(sends.length, 0);
  assert.deepEqual(dry.log.map((l) => l.action), ['dry-run', 'skipped', 'skipped', 'skipped']);
  const live = await runOutreach({ items, send, confirm: 'SEND', suppressedEmails: ['gone@x.com'], pauseMs: 0 });
  assert.equal(live.sent, 1);
  assert.deepEqual(sends.map((s) => [s.to, s.key]), [['info@shop.com', 'info@shop.com/shop.com']]);
});

test('outreach sender refuses without the mailing address', async () => {
  const saved = { ...process.env };
  try {
    delete process.env.FUNNEL_MAILING_ADDRESS;
    assert.deepEqual(await seq.sendOutreachEmail({ to: 'a@b.co', subject: 's', body: 'b' }), { ok: false, reason: 'funnel-not-ready' });
    assert.deepEqual(await seq.sendScanResultsEmail({ to: 'a@b.co', hostname: 'b.co', url: 'https://b.co/' }), { ok: false, reason: 'funnel-not-ready' });
  } finally {
    process.env = saved;
  }
});

test('outreach footer states the real reason, not a signup', async () => {
  const saved = { ...process.env };
  const realFetch = globalThis.fetch;
  let payload;
  globalThis.fetch = async (_u, init) => { payload = JSON.parse(init.body); return new Response('{"id":"e"}'); };
  try {
    Object.assign(process.env, { FUNNEL_MAILING_ADDRESS: '1 Test St', RESEND_API_KEY: 'x' });
    await seq.sendOutreachEmail({ to: 'info@shop.com', subject: 's', body: 'b', hostname: 'shop.com' });
    assert.match(payload.text, /shop\.com was scanned with AccessBell's free checker/);
    assert.doesNotMatch(payload.text, /gave us this email/);
    assert.equal(payload.headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
  } finally {
    globalThis.fetch = realFetch;
    process.env = saved;
  }
});

test('outreach never re-sends an address already sent', async () => {
  const { OUTREACH_ALREADY_SENT } = await import('../server/app/outreach-sent.js');
  assert.equal(OUTREACH_ALREADY_SENT.size, 24);
  const first = 'info@howardcpas.com';
  assert.ok(OUTREACH_ALREADY_SENT.has(' INFO@howardcpas.com '));
  assert.ok(!OUTREACH_ALREADY_SENT.has('someone-new@example.com'));
  let calls = 0;
  const out = await runOutreach({ items: [{ email: first.toUpperCase(), hostname: 'x.com', subject: 's', body: 'b' }], confirm: 'SEND', send: async () => { calls++; return { ok: true }; }, suppressedEmails: [], pauseMs: 0 });
  assert.equal(calls, 0);
  assert.equal(out.log[0].reason, 'already-sent');
});

// Funnel unsubscribe: signed tokens, footer, live gate, endpoint, suppression.
import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
delete process.env.FUNNEL_UNSUBSCRIBE_SECRET;
const {
  unsubscribeToken, verifyUnsubscribeToken, unsubscribeUrl, unsubscribeHeaders, marketingFooter, funnelSendBlockers,
} = await import('../server/app/unsubscribe.js');
const { funnelLiveStatus, upsellCandidates, scanFollowupCandidates } = await import('../server/app/funnel.js');
const seq = await import('../server/app/email-sequences.js');
const { handleUnsubscribe } = await import('../api/unsubscribe.js');

const READY = { SUPABASE_SERVICE_ROLE_KEY: 'k', FUNNEL_MAILING_ADDRESS: '1 Test St, Testville, FL 00000' };

test('tokens round-trip, normalise case, and reject tampering', () => {
  const t = unsubscribeToken(' Person@Example.com ');
  assert.equal(verifyUnsubscribeToken(t), 'person@example.com');
  const [e, m] = t.split('.');
  const other = Buffer.from('victim@example.com').toString('base64url');
  assert.equal(verifyUnsubscribeToken(`${other}.${m}`), null);
  assert.equal(verifyUnsubscribeToken(`${e}.${m.slice(0, -2)}AA`), null);
  for (const bad of ['', 'x', 'a.b.c', `${e}.`, '.' + m]) assert.equal(verifyUnsubscribeToken(bad), null);
  // A different key cannot verify.
  assert.equal(verifyUnsubscribeToken(t, { SUPABASE_SERVICE_ROLE_KEY: 'other' }), null);
  // Dedicated secret wins over the derived key.
  const t2 = unsubscribeToken('a@b.co', { FUNNEL_UNSUBSCRIBE_SECRET: 's', SUPABASE_SERVICE_ROLE_KEY: 'k' });
  assert.equal(verifyUnsubscribeToken(t2, { FUNNEL_UNSUBSCRIBE_SECRET: 's' }), 'a@b.co');
  assert.equal(verifyUnsubscribeToken(t2, { SUPABASE_SERVICE_ROLE_KEY: 'k' }), null);
});

test('no signing key -> no token, no headers', () => {
  assert.equal(unsubscribeToken('a@b.co', {}), null);
  assert.deepEqual(unsubscribeHeaders('a@b.co', {}), {});
});

test('one-click headers point at the signed URL', () => {
  const h = unsubscribeHeaders('a@b.co', READY);
  assert.equal(h['List-Unsubscribe'], `<${unsubscribeUrl('a@b.co', READY)}>`);
  assert.equal(h['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
  assert.match(h['List-Unsubscribe'], /^<https:\/\/www\.accessbell\.co\/api\/unsubscribe\?t=/);
});

test('footer carries unsubscribe link and the configured address only', () => {
  const f = marketingFooter('a@b.co', READY);
  assert.match(f, /Unsubscribe with one click: https:\/\/www\.accessbell\.co\/api\/unsubscribe\?t=/);
  assert.match(f, /AccessBell, 1 Test St, Testville, FL 00000/);
  assert.match(marketingFooter('a@b.co', { SUPABASE_SERVICE_ROLE_KEY: 'k' }), /FUNNEL_MAILING_ADDRESS not set/);
});

test('every sequence template has the unsubscribe footer', () => {
  const to = 'lead@example.com';
  const all = [
    seq.scanFollowupEmail({ to, hostname: 'example.com', url: 'https://example.com/', issues: 3, critical: 1, serious: 1 }),
    seq.abandonedCheckoutEmail({ to, product: 'page_report', hostname: 'example.com', checkoutUrl: 'https://buy.stripe.com/x' }),
    seq.auditUpsellEmail({ to, hostname: 'example.com', reportUrl: 'https://www.accessbell.co/report?token=x' }),
    seq.pageReportUpsellEmail({ to, hostname: 'example.com', reportUrl: 'https://www.accessbell.co/report?token=x' }),
  ];
  for (const m of all) {
    assert.match(m.text, /Unsubscribe with one click: https:\/\/www\.accessbell\.co\/api\/unsubscribe\?t=/);
    const t = decodeURIComponent(m.text.match(/unsubscribe\?t=(\S+)/)[1]);
    assert.equal(verifyUnsubscribeToken(t), to);
    assert.doesNotMatch(m.text, /AI-assisted/i);
  }
});

test('live needs FUNNEL_EMAIL_LIVE=1 AND a mailing address AND a key', () => {
  const quiet = console.error;
  console.error = () => {};
  try {
    assert.equal(funnelLiveStatus({}).live, false);
    assert.equal(funnelLiveStatus(READY).live, false);
    const noAddr = funnelLiveStatus({ FUNNEL_EMAIL_LIVE: '1', SUPABASE_SERVICE_ROLE_KEY: 'k' });
    assert.equal(noAddr.live, false);
    assert.match(noAddr.blockers.join(), /FUNNEL_MAILING_ADDRESS/);
    assert.equal(funnelLiveStatus({ FUNNEL_EMAIL_LIVE: '1', FUNNEL_MAILING_ADDRESS: 'x' }).live, false);
    assert.equal(funnelLiveStatus({ ...READY, FUNNEL_EMAIL_LIVE: '1' }).live, true);
    assert.deepEqual(funnelSendBlockers(READY), []);
  } finally {
    console.error = quiet;
  }
});

test('sequence senders refuse without a mailing address (no network call)', async () => {
  const saved = { ...process.env };
  const realFetch = globalThis.fetch;
  const quiet = console.error;
  let called = false;
  globalThis.fetch = async () => { called = true; return new Response('{}'); };
  console.error = () => {};
  try {
    delete process.env.FUNNEL_MAILING_ADDRESS;
    process.env.RESEND_API_KEY = 'x';
    const res = await seq.sendScanFollowup({ to: 'a@b.co', hostname: 'b.co', url: 'https://b.co/' });
    assert.deepEqual(res, { ok: false, reason: 'funnel-not-ready' });
    assert.equal(called, false);
  } finally {
    globalThis.fetch = realFetch;
    console.error = quiet;
    process.env = saved;
  }
});

test('sequence sender attaches List-Unsubscribe headers when ready', async () => {
  const saved = { ...process.env };
  const realFetch = globalThis.fetch;
  let payload;
  globalThis.fetch = async (_u, init) => { payload = JSON.parse(init.body); return new Response('{"id":"e1"}'); };
  try {
    Object.assign(process.env, { FUNNEL_MAILING_ADDRESS: '1 Test St', RESEND_API_KEY: 'x' });
    const res = await seq.sendAuditUpsell({ to: 'a@b.co', hostname: 'b.co', reportUrl: 'https://www.accessbell.co/report?token=x' });
    assert.equal(res.ok, true);
    assert.equal(payload.headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
    assert.match(payload.headers['List-Unsubscribe'], /api\/unsubscribe\?t=/);
    assert.match(payload.text, /AccessBell, 1 Test St/);
  } finally {
    globalThis.fetch = realFetch;
    process.env = saved;
  }
});

test('unsubscribe endpoint: valid token suppresses (GET and one-click POST), bad token 400', async () => {
  const calls = [];
  const suppress = async (email, reason) => { calls.push([email, reason]); };
  const url = unsubscribeUrl('lead@example.com');
  const get = await handleUnsubscribe(new Request(url), { suppress });
  assert.equal(get.status, 200);
  assert.match(await get.text(), /You are unsubscribed/);
  const post = await handleUnsubscribe(new Request(url, { method: 'POST', body: 'List-Unsubscribe=One-Click' }), { suppress });
  assert.equal(post.status, 200);
  assert.deepEqual(calls, [['lead@example.com', 'unsubscribe-link'], ['lead@example.com', 'unsubscribe-one-click']]);
  const bad = await handleUnsubscribe(new Request('https://www.accessbell.co/api/unsubscribe?t=nope'), { suppress });
  assert.equal(bad.status, 400);
  assert.equal(calls.length, 2);
  const fail = await handleUnsubscribe(new Request(url), { suppress: async () => { throw new Error('db'); } });
  assert.equal(fail.status, 503);
});

test('suppressed addresses are skipped by follow-ups and upsells', () => {
  const now = new Date('2026-11-02T12:00:00Z');
  const leads = [{ id: 1, email: 'Gone@Example.com', hostname: 'a.com' }, { id: 2, email: 'stay@example.com', hostname: 'b.com' }];
  const f = scanFollowupCandidates({ leads, paidEmails: [], suppressedEmails: ['gone@example.com'] });
  assert.deepEqual(f.map((l) => l.id), [2]);
  const paid = new Date(now - 10 * 864e5).toISOString();
  const purchases = [
    { id: 1, email: 'gone@example.com', status: 'paid', product: 'domain_audit', paid_at: paid, hostname: 'a.com' },
    { id: 2, email: 'stay@example.com', status: 'paid', product: 'domain_audit', paid_at: paid, hostname: 'b.com' },
    { id: 3, email: 'x@example.com', status: 'paid', product: 'domain_audit', paid_at: paid, hostname: 'ramenearyou.com' },
  ];
  assert.deepEqual(upsellCandidates({ purchases, suppressedEmails: ['GONE@example.com'], now }).map((r) => r.id), [2]);
});

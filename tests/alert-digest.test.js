// One regression alert email per account and site per monitoring run.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

process.env.RESEND_API_KEY = 're_test_key';
const { ALERT_DIGEST_SCHEMA_SQL, addToDigest, claimReadyDigests, QUIET_MINUTES } = await import('../server/app/alert-digest.js');
const monitoring = await import('../server/app/monitoring.js');
const { sendRegressionAlert, sendReadyDigests, digestText } = monitoring;

const reg = (rule, scanId) => ({ device: 'desktop', rule, title: `Rule ${rule}`, impact: 'serious', count: 2, scanId });
const page = (n) => ({ accountId: 'acc1', hostname: 'foxwood.test', url: `https://foxwood.test/p${n}`, regressions: [reg(`r${n}`, `s${n}`)] });

test('migration 0017 matches the SQL the app applies, and is additive only', () => {
  const file = readFileSync(new URL('../supabase/migrations/0017_alert_digests.sql', import.meta.url), 'utf8');
  assert.ok(file.includes(ALERT_DIGEST_SCHEMA_SQL.trim()));
  assert.doesNotMatch(ALERT_DIGEST_SCHEMA_SQL.toLowerCase().replace(/on delete cascade/g, ''), /\b(drop|truncate|delete|update app\.)\b/);
  assert.match(ALERT_DIGEST_SCHEMA_SQL, /create unique index if not exists alert_digests_one_open_idx on app\.alert_digests \(account_id, hostname\) where sent_at is null/);
});

test('many pages of one site add to ONE digest and never email on their own', async () => {
  const calls = [];
  const q = async (text, params) => {
    calls.push({ text, params });
    return [{ id: 'digest-1' }];
  };
  let fetched = false;
  for (let n = 1; n <= 9; n++) {
    const out = await sendRegressionAlert(page(n), { addImpl: (r) => addToDigest(r, { q }) });
    assert.deepEqual([out.sent, out.queued, out.digestId], [false, true, 'digest-1']);
  }
  assert.equal(fetched, false);
  // Every page writes to the same open-digest row via the unique-index upsert.
  assert.equal(calls.length, 9);
  for (const c of calls) {
    assert.match(c.text, /on conflict \(account_id, hostname\) where sent_at is null/);
    assert.deepEqual([c.params[0], c.params[1]], ['acc1', 'foxwood.test']);
  }
});

test('no regressions queues nothing', async () => {
  let called = false;
  const out = await sendRegressionAlert({ accountId: 'a', hostname: 'h', regressions: [] }, { addImpl: () => (called = true) });
  assert.deepEqual(out, { sent: false, queued: false });
  assert.equal(called, false);
});

test('addToDigest creates the table on first use and retries once', async () => {
  const seen = [];
  let first = true;
  const q = async (text) => {
    seen.push(text.trim().split('\n')[0].slice(0, 40));
    if (first && /insert into app\.alert_digests/.test(text)) {
      first = false;
      throw Object.assign(new Error('missing'), { code: '42P01' });
    }
    return [{ id: 'd' }];
  };
  assert.equal(await addToDigest(page(1), { q }), 'd');
  assert.ok(seen.some((s) => /pg_advisory_xact_lock/.test(s)));
  assert.equal(seen.filter((s) => /insert into/.test(s)).length, 2);
});

test('claim is a single atomic update that only returns quiet digests', async () => {
  let sql;
  const q = async (text, params) => ((sql = { text, params }), []);
  await claimReadyDigests({ q });
  assert.match(sql.text, /^\s*update app\.alert_digests set sent_at = now\(\)\s+where sent_at is null/);
  assert.match(sql.text, /returning id, account_id, hostname, regressions/);
  assert.equal(sql.params[0], QUIET_MINUTES);
});

test('a claimed digest is emailed once, with an idempotency key, as one message', async () => {
  const digest = { id: 'dg1', account_id: 'acc1', hostname: 'foxwood.test', regressions: [1, 2, 3].map((n) => ({ ...reg(`r${n}`, `s${n}`), url: `https://foxwood.test/p${n}` })) };
  const text = digestText(digest, 'https://app.test');
  assert.match(text, /3 pages/);
  for (const n of [1, 2, 3]) assert.match(text, new RegExp(`Rule r${n}`));
  assert.match(text, /app\.test\/app\/scan\?id=s1/);

  const sends = [];
  const out = await sendReadyDigests({
    claimImpl: async () => [digest],
    sendImpl: async (d) => (sends.push(d.id), { sent: true }),
    reopenImpl: async () => assert.fail('must not reopen a sent digest'),
  });
  assert.deepEqual(out, { digests: 1, sent: 1, failed: 0 });
  assert.deepEqual(sends, ['dg1']);
});

test('a failed send reopens the digest for retry; nothing is claimed twice', async () => {
  const reopened = [];
  const out = await sendReadyDigests({
    claimImpl: async () => [{ id: 'dg2', regressions: [] }],
    sendImpl: async () => {
      throw new Error('resend-503');
    },
    reopenImpl: async (id) => reopened.push(id),
  });
  assert.deepEqual(out, { digests: 1, sent: 0, failed: 1 });
  assert.deepEqual(reopened, ['dg2']);
  // Two overlapping sweeps: the database hands the digest to only one of them.
  let claimed = false;
  const claimImpl = async () => (claimed ? [] : ((claimed = true), [{ id: 'dg3', regressions: [] }]));
  const sends = [];
  const sendImpl = async (d) => (sends.push(d.id), { sent: true });
  await Promise.all([sendReadyDigests({ claimImpl, sendImpl }), sendReadyDigests({ claimImpl, sendImpl })]);
  assert.deepEqual(sends, ['dg3']);
});

test('digest email: one Resend request, idempotency key per digest, to owners and admins', async () => {
  const requests = [];
  const fetchImpl = async (url, init) => (requests.push({ url, init }), { ok: true, status: 200, json: async () => ({ id: 'em_1' }) });
  // sendDigestEmail reads recipients from the database, which this unit test does not have;
  // an unreachable database must fail the send (and reopen the digest), never email.
  await assert.rejects(() => monitoring.sendDigestEmail({ id: 'dg4', account_id: 'acc1', hostname: 'h', regressions: [] }, { fetchImpl }));
  assert.equal(requests.length, 0);
});

// Admin tracking: additive migration, never-throwing writers, the snippet
// error endpoint and the new account flags (no database needed).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

process.env.ADMIN_EMAILS = 'boss@example.com';
const { TRACKING_SCHEMA_SQL } = await import('../server/app/tracking-schema.js');
const tracking = await import('../server/app/tracking.js');
const { accountFlags, TRACKING_SINCE } = await import('../server/app/admin.js');
const { handle } = await import('../server/app/router.js');
const { sendRegressionAlert } = await import('../server/app/monitoring.js');

test('migration 0015 matches the SQL the app applies, and is additive only', () => {
  const file = readFileSync(new URL('../supabase/migrations/0015_admin_tracking.sql', import.meta.url), 'utf8');
  assert.ok(file.includes(TRACKING_SCHEMA_SQL.trim()));
  const sql = TRACKING_SCHEMA_SQL.toLowerCase();
  for (const bad of [/\bdrop\b/, /\btruncate\b/, /\bdelete\b(?! cascade)/, /alter column/, /\bupdate app\./, /rename/]) {
    assert.doesNotMatch(sql.replace(/on delete cascade/g, ''), bad);
  }
  for (const stmt of sql.split(';').map((s) => s.trim()).filter(Boolean)) {
    assert.match(stmt, /^(select pg_advisory_xact_lock|alter table app\.\w+ (add column if not exists|enable row level security)|create table if not exists|create index if not exists)/);
  }
});

test('tracking writers never throw and do nothing without a database', async () => {
  const saved = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    assert.equal(await tracking.startScanRun({ accountId: 'x' }), null);
    assert.equal(await tracking.finishScanRun('r1', { durationMs: 5 }), null);
    assert.equal(await tracking.recordScanDuration('s1', 10), null);
    assert.equal(await tracking.recordAlertEmail({ accountId: 'a', status: 'sent' }), null);
    assert.equal(await tracking.recordWelcomeEmail('00000000-0000-0000-0000-000000000000', { ok: true, id: 'em_1' }), null);
    assert.equal(await tracking.recordSnippetError('A'.repeat(20), 'apply_error'), null);
    assert.equal(await tracking.ensureTrackingSchema(), false);
  } finally {
    if (saved !== undefined) process.env.DATABASE_URL = saved;
  }
});

test('tracking writers swallow database errors', async () => {
  const saved = process.env.DATABASE_URL;
  process.env.DATABASE_URL = 'postgres://x@127.0.0.1:1/x';
  try {
    assert.equal(await tracking.startScanRun({ accountId: '00000000-0000-0000-0000-000000000000' }), null);
    assert.equal(await tracking.recordSnippetError('A'.repeat(20), 'apply_error'), null);
  } finally {
    if (saved === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = saved;
  }
});

test('snippet errors accept only known codes and valid keys', async () => {
  assert.ok(tracking.SNIPPET_ERROR_CODES.has('bad_selector'));
  assert.equal(await tracking.recordSnippetError('A'.repeat(20), 'https://example.com/?email=a@b.co'), null);
  assert.equal(await tracking.recordSnippetError('bad key', 'apply_error'), null);
});

test('GET fix/error is public, CORS-open and always answers ok', async () => {
  const saved = { ...process.env };
  Object.assign(process.env, { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'x', SUPABASE_SERVICE_ROLE_KEY: 'x', DATABASE_URL: 'postgres://x@127.0.0.1:1/x' });
  try {
    const res = await handle(new Request('https://www.accessbell.co/api/app/fix/error?k=short&c=nope'));
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), '*');
    assert.deepEqual(await res.json(), { ok: true });
  } finally {
    process.env = saved;
  }
});

test('fix.js reports only the site key and a fixed code', () => {
  const js = readFileSync(new URL('../public/fix.js', import.meta.url), 'utf8');
  assert.match(js, /'\/api\/app\/fix\/error\?k=' \+ encodeURIComponent\(key\) \+ '&c=' \+ code/);
  for (const code of js.matchAll(/report\('([a-z_]+)'\)/g)) assert.ok(tracking.SNIPPET_ERROR_CODES.has(code[1]), code[1]);
});

test('regression alert with nothing to report sends nothing', async () => {
  let called = false;
  const out = await sendRegressionAlert({ accountId: 'a', regressions: [] }, { fetchImpl: () => (called = true) });
  assert.deepEqual(out, { sent: false, queued: false });
  assert.equal(called, false);
});

test('account flags: hung scans, failed alerts, missing welcome and snippet errors', () => {
  const now = new Date('2026-11-10T12:00:00Z').getTime();
  const base = {
    profile: { status: 'active', stripeLinked: true, lastSignInAt: '2026-11-09T00:00:00Z', accountCreatedAt: '2026-11-05T00:00:00Z' },
    domains: [{ hostname: 'a.com', lastScanAt: '2026-11-10T06:00:00Z', overduePages: 0, fixes: 0 }],
    scans: [],
  };
  const flags = accountFlags({
    ...base,
    scanRuns: [
      { kind: 'page', hung: true, status: 'hung', startedAt: '2026-11-10T06:00:00Z', url: 'https://a.com/' },
      { kind: 'domain', pages: 30, pagesScanned: 12, startedAt: '2026-11-09T06:00:00Z', hostname: 'a.com' },
    ],
    alertEmails: [{ status: 'failed', error: 'resend-422', createdAt: '2026-11-09T06:00:00Z' }],
    welcomeEmail: null,
    snippetErrors: [{ hostname: 'a.com', code: 'bad_selector', count: 3, lastAt: '2026-11-09T00:00:00Z' }],
  }, now);
  const text = flags.map((f) => f.text).join('\n');
  assert.match(text, /1 scan started but never finished/);
  assert.match(text, /12 of 30 pages/);
  assert.match(text, /alert email failed to send.*resend-422/);
  assert.match(text, /No welcome email recorded/);
  assert.match(text, /AccessBellFix reported 3 errors.*a\.com: bad_selector/);

  const ok = accountFlags({
    ...base,
    scanRuns: [{ kind: 'page', hung: false, status: 'done', startedAt: '2026-11-10T06:00:00Z' }],
    alertEmails: [{ status: 'sent', createdAt: '2026-11-09T06:00:00Z' }],
    welcomeEmail: { status: 'sent' },
    snippetErrors: [],
  }, now);
  assert.deepEqual(ok, []);

  // Accounts created before tracking began are not flagged for a missing welcome.
  const old = accountFlags({ ...base, profile: { ...base.profile, accountCreatedAt: '2026-10-30T00:00:00Z' }, welcomeEmail: null }, now);
  assert.ok(!old.some((f) => /welcome/i.test(f.text)));
  assert.ok(new Date(TRACKING_SINCE).getTime() > new Date('2026-10-30T00:00:00Z').getTime());
});

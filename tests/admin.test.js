// Admin analytics: gating and the MRR helpers (no database needed).
import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.ADMIN_EMAILS = 'boss@example.com';
const { adminOverview, adminAccountDetail, accountFlags, monthlyCents, computeMrr } = await import('../server/app/admin.js');
const { handle } = await import('../server/app/router.js');

test('admin overview refuses non-admins before touching the database', async () => {
  for (const ctx of [null, {}, { user: { email: 'someone@example.com' } }, { user: { email: '' } }]) {
    await assert.rejects(adminOverview(ctx), (err) => err.status === 403);
  }
});

test('GET admin/overview needs a session (401 when signed out)', async () => {
  const saved = { ...process.env };
  Object.assign(process.env, { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'x', SUPABASE_SERVICE_ROLE_KEY: 'x', DATABASE_URL: 'postgres://x@127.0.0.1:1/x' });
  try {
    const res = await handle(new Request('https://www.accessbell.co/api/app/admin/overview'));
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.ok(!('accounts' in body));
  } finally {
    process.env = saved;
  }
});

test('monthly value normalises annual prices and quantities', () => {
  const sub = (amount, interval, quantity = 1) => ({ items: { data: [{ quantity, price: { unit_amount: amount, recurring: { interval, interval_count: 1 } } }] } });
  assert.equal(monthlyCents(sub(2900, 'month', 2)), 5800);
  assert.equal(monthlyCents(sub(19900, 'year')), 1658);
});

test('MRR counts only active AccessBell subscriptions', async () => {
  const subs = {
    sub_ab: { status: 'active', items: { data: [{ quantity: 1, price: { product: 'prod_ab', unit_amount: 2900, recurring: { interval: 'month' } } }] } },
    sub_other: { status: 'active', items: { data: [{ quantity: 1, price: { product: 'prod_other', unit_amount: 9900, recurring: { interval: 'month' } } }] } },
    sub_trial: { status: 'trialing', items: { data: [{ quantity: 1, price: { product: 'prod_ab', unit_amount: 2900, recurring: { interval: 'month' } } }] } },
  };
  const { config } = await import('../server/app/config.js');
  const stripeApi = async (_m, path) => {
    if (path.startsWith('/payment_links?')) return { data: [{ id: 'pl', url: config().stripePaymentLink }], has_more: false };
    if (path.startsWith('/payment_links/pl/')) return { data: [{ price: { product: 'prod_ab' } }] };
    return subs[decodeURIComponent(path.split('/').pop())];
  };
  const mrr = await computeMrr(['sub_ab', 'sub_other', 'sub_trial'], { stripeApi, now: 42 });
  assert.equal(mrr.cents, 2900);
  assert.equal(mrr.subscriptions, 1);
});

test('account detail refuses non-admins and rejects bad ids before any query', async () => {
  for (const ctx of [null, { user: { email: 'someone@example.com' } }]) {
    await assert.rejects(adminAccountDetail(ctx, '00000000-0000-0000-0000-000000000000'), (err) => err.status === 403);
  }
  await assert.rejects(adminAccountDetail({ user: { email: 'boss@example.com' } }, "1' or 1=1"), (err) => err.status === 400);
});

test('GET admin/account needs a session (401 when signed out)', async () => {
  const saved = { ...process.env };
  Object.assign(process.env, { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'x', SUPABASE_SERVICE_ROLE_KEY: 'x', DATABASE_URL: 'postgres://x@127.0.0.1:1/x' });
  try {
    const res = await handle(new Request('https://www.accessbell.co/api/app/admin/account?id=00000000-0000-0000-0000-000000000000'));
    assert.equal(res.status, 401);
  } finally {
    process.env = saved;
  }
});

test('account flags catch failed scans, unscanned domains, billing and trial problems', () => {
  const now = Date.parse('2026-11-02T12:00:00Z');
  const flags = accountFlags({
    profile: { status: 'trialing', stripeLinked: false, lastSignInAt: null, signedUpAt: '2026-10-30T00:00:00Z', trialEndsAt: '2026-11-03T00:00:00Z' },
    domains: [{ hostname: 'a.com', lastScanAt: null, overduePages: 2, fixes: 1, snippetSeenAt: null }],
    scans: [{ status: 'failed', createdAt: '2026-11-01T00:00:00Z', error: 'Timed out' }],
  }, now).map((f) => f.text).join(' | ');
  for (const want of ['failed scan', 'never scanned', 'not scanned in 36+ hours', 'snippet has never called', 'no Stripe subscription linked', 'No sign-in', 'Trial ends within 48 hours']) {
    assert.ok(flags.includes(want), `missing flag: ${want}`);
  }
  const clean = accountFlags({ profile: { status: 'active', stripeLinked: true, lastSignInAt: '2026-11-01T00:00:00Z' }, domains: [{ hostname: 'a.com', lastScanAt: '2026-11-02T00:00:00Z', overduePages: 0, fixes: 0 }], scans: [] }, now);
  assert.deepEqual(clean, []);
  const past = accountFlags({ profile: { status: 'past_due', stripeLinked: true, lastSignInAt: '2026-11-01T00:00:00Z' }, domains: [], scans: [] }, now);
  assert.ok(past.some((f) => f.text.includes('past_due')));
});

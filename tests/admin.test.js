// Admin analytics: gating and the MRR helpers (no database needed).
import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.ADMIN_EMAILS = 'boss@example.com';
const { adminOverview, monthlyCents, computeMrr } = await import('../server/app/admin.js');
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

// Old platform checker URLs (/platforms/<id>-accessibility-checker and
// /platforms/<id>-ada-compliance-checker) moved to /platforms/<id>/<checker>.
// Every old URL must redirect permanently to its new home, in one hop.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const bySource = new Map(vercel.redirects.map((r) => [r.source, r]));
const ids = [...(readFileSync(new URL('../src/data/platforms.ts', import.meta.url), 'utf8') + readFileSync(new URL('../src/data/platforms-more.ts', import.meta.url), 'utf8')).matchAll(/slug: '([a-z0-9-]+)-accessibility-checker'/g)].map((m) => m[1]);

test('every platform has redirects from its old checker URLs', () => {
  assert.ok(ids.length >= 32, 'found the platform ids');
  for (const id of ids) {
    for (const type of ['accessibility-checker', 'ada-compliance-checker']) {
      const r = bySource.get(`/platforms/${id}-${type}`);
      assert.ok(r, `missing redirect for /platforms/${id}-${type}`);
      assert.equal(r.destination, `/platforms/${id}/${type}`);
      assert.equal(r.permanent, true);
    }
  }
});

test('redirect destinations are never themselves redirected', () => {
  for (const r of vercel.redirects) assert.ok(!bySource.has(r.destination), `${r.source} -> ${r.destination} is a chain`);
});

test('the removed /reviews page redirects to the homepage', () => {
  assert.equal(bySource.get('/reviews')?.destination, '/');
});

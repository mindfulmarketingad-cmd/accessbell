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

test('old comparison blog posts and /comparison URLs redirect to /comparisons', () => {
  for (const [old, slug] of [['accessibe-alternative', 'accessibe'], ['userway-alternative', 'userway'], ['siteimprove-alternative', 'siteimprove']]) {
    const r = bySource.get(`/blog/${old}`);
    assert.equal(r?.destination, `/comparisons/${slug}-vs-accessbell`);
    assert.equal(r.permanent, true);
  }
  assert.equal(bySource.get('/comparison')?.destination, '/comparisons');
  assert.equal(bySource.get('/comparison/:slug')?.destination, '/comparisons/:slug');
});

test('WCAG Codes Explained blog posts redirect to their WCAG library page', async () => {
  const { readdirSync } = await import('node:fs');
  const { CRITERIA } = await import('../server/wcag-criteria.js');
  const kebab = (s) => s.toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const guides = readdirSync(new URL('../src/content/blog/', import.meta.url)).map((f) => f.replace(/\.md$/, '')).filter((id) => /^wcag-\d+-\d+-\d+-/.test(id));
  assert.ok(guides.length >= 17);
  for (const id of guides) {
    const sc = id.match(/^wcag-(\d+)-(\d+)-(\d+)-/).slice(1).join('.');
    const r = bySource.get(`/blog/${id}`);
    assert.ok(r, `missing redirect for /blog/${id}`);
    assert.equal(r.destination, `/resources/wcag/${sc.replace(/\./g, '-')}-${kebab(CRITERIA[sc].name)}`);
    assert.equal(r.permanent, true);
  }
});

test('free tools moved from /resources/<tool> to /tools/<tool>', () => {
  const tools = ['wcag-2-2-aa-checker', 'wcag-2-1-aa-checker', 'ada-compliance-checker', 'section-508-checker', 'en-301-549-checker', 'contrast-checker', 'chart-color-checker', 'pdf-accessibility-checker', 'statement-generator', 'free-accessibility-icon-set'];
  for (const t of tools) {
    const r = bySource.get(`/resources/${t}`);
    assert.ok(r, `missing redirect for /resources/${t}`);
    assert.equal(r.destination, `/tools/${t}`);
    assert.equal(r.permanent, true);
  }
});

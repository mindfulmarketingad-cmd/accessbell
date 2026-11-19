// The buyer report page is a browser script. This stubs the DOM and the report
// API so showReport can be checked without a browser: the loading line must
// be gone once the report is on the page.
import { test } from 'node:test';
import assert from 'node:assert/strict';

function makeEl(tag) {
  const node = {
    tagName: tag,
    className: '',
    textContent: '',
    id: '',
    href: '',
    type: '',
    name: '',
    value: '',
    placeholder: '',
    rel: '',
    target: '',
    htmlFor: '',
    autocomplete: '',
    required: false,
    maxLength: 0,
    dataset: {},
    children: [],
    attributes: {},
    append(...kids) {
      this.children.push(...kids);
    },
    setAttribute(k, v) {
      this.attributes[k] = v;
    },
    addEventListener() {},
  };
  node.replaceChildren = (...kids) => {
    node.children = [...kids];
  };
  return node;
}

test('showReport removes the loading placeholder', async () => {
  const mount = makeEl('div');
  globalThis.document = {
    getElementById: (id) => (id === 'report-mount' ? mount : null),
    createElement: (tag) => makeEl(tag),
    createTextNode: (text) => ({ textContent: text, children: [] }),
  };
  globalThis.window = { print() {}, gtag() {}, dataLayer: [] };
  globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
  const token = 'ab'.repeat(16);
  globalThis.location = { search: `?token=${token}`, origin: 'https://www.accessbell.co', reload() {} };
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        status: 'paid',
        delivery: 'ready',
        product: 'domain_audit',
        hostname: 'nosh-flow-admin.base44.app',
        report: {
          summary: { critical: 1, serious: 2, moderate: 0, minor: 0 },
          issues: [],
          standard: 'WCAG 2.2 AA',
          pagesScanned: 4,
          score: 70,
          scannedAt: '2026-11-19T00:00:00.000Z',
        },
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );

  await import('../src/scripts/one-time-report.js');
  await new Promise((resolve) => setTimeout(resolve, 50));

  const dumped = JSON.stringify(mount.children);
  assert.equal(mount.children.length, 1);
  assert.equal(mount.children[0].className, 'results-card scan-result');
  assert.match(dumped, /Domain Audit: nosh-flow-admin\.base44\.app/);
  assert.doesNotMatch(dumped, /Loading your report/);
});

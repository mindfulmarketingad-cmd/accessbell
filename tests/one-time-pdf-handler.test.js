// A paid report link must keep working: no expiry, no raw 500s, and a readable
// fallback whenever the PDF cannot be rendered. Regression for Springrose
// (Domain Audit, Nov 2026), whose PDF link crashed on scraped text.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { servePdf, buildResilientPdf, asciiReport } from '../server/one-time-pdf-handler.js';
import { buildReportPdf } from '../server/report-pdf.js';

const token = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
const weird = 'Menu \u2192 Shop \u2713 \ud83d\ude00 \u05e9\u05dc\u05d5\u05dd \u65e5\u672c\u8a9e \u0000\u202e\ud800';
const report = {
  hostname: 'springrose.co',
  url: 'https://www.springrose.co/',
  scannedAt: '2026-11-04T17:58:00.000Z',
  pagesScanned: 333,
  pagesFailed: 1,
  summary: { issues: 12, critical: 4, serious: 6, moderate: 2, minor: 0 },
  issues: [
    { title: `Images must have alt text ${weird}`, impact: 'critical', count: 9, pagesAffected: 332, wcag: [{ sc: '1.1.1' }], fix: `Add alt ${weird}`, samples: [`<img src="a.svg"> ${weird}`, { html: weird }, ['x', weird]] },
  ],
};
// A renderer that, like the old bug, throws on anything outside printable ASCII.
const strictBuild = async (purchase, rep) => {
  if (/[^\x20-\x7E]/.test(JSON.stringify(rep).replace(/\\u[0-9a-f]{4}/gi, ''))) throw new Error('WinAnsi cannot encode');
  return buildReportPdf(purchase, rep);
};
const paid = (over = {}) => ({ token, status: 'paid', delivery: 'ready', product: 'domain_audit', hostname: 'springrose.co', url: 'https://www.springrose.co/', paid_at: '2023-01-01T00:00:00.000Z', report, ...over });
const req = (q = `token=${token}`) => new Request(`https://www.accessbell.co/api/one-time-pdf?${q}`);
const quiet = () => {};

test('a paid report years old still downloads as a real PDF (no expiry)', async () => {
  const res = await servePdf(req(), { getPurchase: async () => paid(), log: quiet });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'application/pdf');
  assert.equal(Buffer.from(await res.arrayBuffer()).subarray(0, 5).toString(), '%PDF-');
});

test('a render that throws on unusual text falls back instead of returning a 500', async () => {
  const res = await servePdf(req(), { getPurchase: async () => paid(), build: strictBuild, log: quiet });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('x-report-render'), 'ascii');
  assert.equal(Buffer.from(await res.arrayBuffer()).subarray(0, 5).toString(), '%PDF-');
});

test('summary-only PDF is the last PDF fallback', async () => {
  let n = 0;
  const flaky = async (p, r) => {
    n += 1;
    if (n < 3) throw new Error('boom');
    return buildReportPdf(p, r);
  };
  const out = await buildResilientPdf(paid(), report, { build: flaky, log: quiet });
  assert.equal(out.mode, 'summary');
});

test('when every render fails the customer gets a readable page that links to the online report', async () => {
  const res = await servePdf(req(), { getPurchase: async () => paid(), build: async () => { throw new Error('boom'); }, log: quiet });
  assert.equal(res.status, 503);
  assert.match(res.headers.get('content-type'), /text\/html/);
  const html = await res.text();
  assert.ok(html.includes(`/report?token=${token}`));
  assert.ok(html.includes('hello@accessbell.co'));
});

test('a database error is a retryable 503 page, not a crash', async () => {
  const res = await servePdf(req(), { getPurchase: async () => { throw new Error('db down'); }, log: quiet });
  assert.equal(res.status, 503);
});

test('unknown tokens 404 and not-yet-ready reports say so', async () => {
  assert.equal((await servePdf(req('token=nope'), { getPurchase: async () => paid(), log: quiet })).status, 404);
  assert.equal((await servePdf(req(), { getPurchase: async () => null, log: quiet })).status, 404);
  assert.equal((await servePdf(req(), { getPurchase: async () => paid({ status: 'pending' }), log: quiet })).status, 404);
  const building = await servePdf(req(), { getPurchase: async () => paid({ delivery: 'building', report: null }), log: quiet });
  assert.equal(building.status, 202);
});

test('asciiReport leaves only printable ASCII', () => {
  assert.ok(!/[^\x20-\x7E]/.test(JSON.stringify(asciiReport(report)).replace(/\\u[0-9a-f]{4}/gi, '')));
  assert.equal(asciiReport(report).pagesScanned, 333);
});

test('white-label query still applies', async () => {
  let seen;
  const res = await servePdf(req(`token=${token}&whiteLabel=1&agency=Northwind`), { getPurchase: async () => paid(), build: async (p, r) => { seen = p; return buildReportPdf(p, r); }, log: quiet });
  assert.equal(res.status, 200);
  assert.equal(seen.whiteLabel.agencyName, 'Northwind');
});

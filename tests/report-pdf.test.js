// Report PDF rendering: a valid PDF document with the report's content.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inflateSync } from 'node:zlib';
import { buildReportPdf } from '../server/report-pdf.js';

const purchase = { product: 'page_report', hostname: 'example.com', url: 'https://example.com/', paid_at: '2026-10-29T00:00:00.000Z' };
const report = {
  hostname: 'example.com',
  url: 'https://example.com/',
  scannedAt: '2026-10-29T00:00:00.000Z',
  score: 63,
  summary: { issues: 3, critical: 1, serious: 1, moderate: 1, minor: 0 },
  issues: [
    { title: 'Images do not have alt text', impact: 'critical', count: 2, wcag: [{ sc: '1.1.1' }], fix: 'Add an alt attribute.', samples: ['<img src="photo.png">'] },
  ],
};

test('report PDF is a valid PDF containing the report text', async () => {
  const pdf = await buildReportPdf(purchase, report);
  assert.ok(pdf.length > 1000, 'PDF has content');
  assert.equal(Buffer.from(pdf.slice(0, 5)).toString(), '%PDF-');
  // Content streams are Flate-compressed and text is hex-encoded: inflate,
  // then decode every hex string before searching.
  const raw = Buffer.from(pdf).toString('latin1');
  const streams = [...raw.matchAll(/stream\r?\n([\s\S]*?)endstream/g)].map((m) => m[1].replace(/\r?\n$/, ''));
  let text = '';
  for (const s of streams) {
    try {
      text += inflateSync(Buffer.from(s, 'latin1')).toString('latin1');
    } catch {
      text += s;
    }
  }
  text = text.replace(/<([0-9A-Fa-f\s]+)>/g, (_, hex) => Buffer.from(hex.replace(/\s/g, ''), 'hex').toString('latin1'));
  assert.ok(text.includes('Page Report'), 'PDF names the product');
  assert.ok(text.includes('example.com'), 'PDF names the hostname');
});

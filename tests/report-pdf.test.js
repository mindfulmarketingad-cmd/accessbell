// Report PDF rendering: a valid PDF document with the report's content.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inflateSync } from 'node:zlib';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { buildReportPdf, pdfSafe } from '../server/report-pdf.js';

function pdfText(pdf) {
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
  return text.replace(/<([0-9A-Fa-f\s]+)>/g, (_, hex) => Buffer.from(hex.replace(/\s/g, ''), 'hex').toString('latin1'));
}

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

test('white-label PDF uses the agency name and drops the AccessBell wordmark', async () => {
  const pdf = await buildReportPdf({ ...purchase, whiteLabel: { enabled: true, agencyName: 'Northwind Studio' } }, report);
  const text = pdfText(pdf);
  assert.ok(text.includes('Northwind Studio Page Report'), 'title uses the agency name');
  assert.ok(text.includes('Prepared for Northwind Studio'), 'cover line names the agency');
  assert.ok(!text.includes('AccessBell'), 'AccessBell wordmark is not drawn');
  assert.ok(text.includes('Lawsuit-common'), 'owner label is drawn for missing alt text');
});

test('report PDF is a valid PDF containing the report text', async () => {
  const pdf = await buildReportPdf(purchase, report);
  assert.ok(pdf.length > 1000, 'PDF has content');
  assert.equal(Buffer.from(pdf.slice(0, 5)).toString(), '%PDF-');
  // Content streams are Flate-compressed and text is hex-encoded: inflate,
  // then decode every hex string before searching.
  const text = pdfText(pdf);
  assert.ok(text.includes('Page Report'), 'PDF names the product');
  assert.ok(text.includes('example.com'), 'PDF names the hostname');
});

test('PDF renders samples with characters the standard font cannot encode', async () => {
  assert.equal(pdfSafe('a → b ’ “x” – — … 日'), "a -> b ' \"x\" - - ... ?");
  const report = { url: 'https://www.springrose.co/', hostname: 'springrose.co', pages: [{ url: 'https://www.springrose.co/', score: 50, issues: 1, serious: 0, critical: 0 }], issues: [{ id: 'heading-order', title: 'Heading levels are skipped', impact: 'moderate', fix: 'Use heading levels in order – don’t skip…', wcag: [{ sc: '1.3.1' }], samples: ['<h3>Scroll to see all styles →', '<a>Article: What’s “new” — 日本</a>'], pagesAffected: 1, elementsAffected: 1 }], summary: { issues: 1, critical: 0, serious: 0, moderate: 1, minor: 0, rulesFailed: 1 }, scannedAt: '2026-11-04T18:01:50.115Z', pagesScanned: 1 };
  const pdf = await buildReportPdf({ product: 'domain_audit', hostname: 'springrose.co' }, report);
  assert.ok(pdf.length > 1000);
});

test('pdfSafe output is always encodable by the standard font', async () => {
  const input = 'Title → “quote” ’ – — …\nline\ttab\r\n😀🎉\n日本 Привет café € ™\u0000\u007f\u2028';
  const safe = pdfSafe(input);
  assert.equal(safe.includes('\n') || safe.includes('\t') || safe.includes('\r'), false);
  assert.ok(safe.includes('->'), 'arrow is transliterated');
  assert.ok(safe.includes('€'), 'euro is kept because WinAnsi can encode it');
  assert.ok(safe.includes('™'));
  assert.ok(safe.includes('?'));
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.Courier);
  for (const face of [font, bold, mono]) {
    face.encodeText(safe);
    face.widthOfTextAtSize(safe, 11);
  }
  doc.addPage().drawText(safe, { x: 48, y: 700, size: 11, font });
});

test('one-time PDF renders arrows, curly quotes, emoji, and non-Latin text', async () => {
  const purchase = {
    product: 'domain_audit',
    hostname: 'host→.example',
    url: 'https://host→.example/path?q=ARROW→END',
    paid_at: '2026-11-04T18:03:41.000Z',
  };
  const report = {
    hostname: 'host→.example',
    url: 'https://host→.example/path?q=ARROW→END',
    scannedAt: '2026-11-04T18:03:41.000Z',
    score: 41,
    pagesScanned: 2,
    pagesFailed: 0,
    summary: { issues: 1, critical: 0, serious: 1, moderate: 0, minor: 0 },
    issues: [
      {
        title: 'Link name ARROW→END QUOTE’END “curly” CJK日END',
        description: 'Description with an arrow →, curly quotes “ ” and emoji 😀',
        impact: 'serious',
        count: 2,
        pagesAffected: 1,
        wcag: [{ sc: '2.4.4' }],
        fix: 'Use the destination. Don’t write “click here” — say where it goes… 😀',
        samples: [
          '<a href="/styles">Scroll to see all styles →</a>',
          '<button aria-label="What’s “new” — 日本">😀</button>',
          '#main > a.selector[href="ARROW→END"]\nline two\t日本語',
          { html: '<a>object sample → 😀</a>', target: ['#main > a.selector'], url: 'https://example.com/ページ' },
        ],
        elements: [{ selector: 'button.emoji → 😀', html: '<button>日</button>', target: ['nav > a'] }],
      },
    ],
  };
  const pdf = await buildReportPdf(purchase, report);
  assert.equal(Buffer.from(pdf.slice(0, 5)).toString(), '%PDF-');
  assert.ok(pdf.length > 1000);
  const text = pdfText(pdf);
  assert.ok(text.includes('Domain Audit'), 'PDF names the product');
  assert.ok(text.includes('ARROW->END'), 'arrow in the title and URL is transliterated and drawn');
  assert.ok(text.includes('host->.example'), 'arrow in the hostname is transliterated and drawn');
  assert.ok(text.includes("What's"), 'curly apostrophe in the sample is transliterated and drawn');
  assert.ok(text.includes('CJK?END'), 'non-Latin text is replaced and still drawn');
  assert.ok(text.includes('Description with an arrow ->'), 'issue description is drawn after transliteration');
  assert.ok(text.includes('selector'), 'selector text is drawn');
});

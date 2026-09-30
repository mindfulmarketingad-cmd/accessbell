// PDF accessibility checks and safe remediation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument, PDFName, PDFString, StandardFonts } from 'pdf-lib';
import { auditPdf, remediatePdf } from '../server/pdf-audit.js';

const PNG = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'));
const ids = (r) => r.issues.map((i) => i.id);

async function textPdf({ pages = 1, title, lang } = {}) {
  const doc = await PDFDocument.create({ updateMetadata: false });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i++) doc.addPage().drawText(`Page ${i + 1}`, { x: 50, y: 700, font });
  if (title) doc.setTitle(title);
  if (lang) doc.catalog.set(PDFName.of('Lang'), PDFString.of(lang));
  return doc;
}

/** Mark a document as tagged with one Figure element, with or without alt text. */
function tag(doc, { alt } = {}) {
  const ctx = doc.context;
  const figure = ctx.obj({ Type: 'StructElem', S: 'Figure', ...(alt ? { Alt: PDFString.of(alt) } : {}) });
  const root = ctx.obj({ Type: 'StructTreeRoot', K: ctx.obj([ctx.register(figure)]) });
  doc.catalog.set(PDFName.of('StructTreeRoot'), ctx.register(root));
  doc.catalog.set(PDFName.of('MarkInfo'), ctx.obj({ Marked: true }));
}

test('an untitled, untagged PDF with no language fails those checks', async () => {
  const r = await auditPdf(await (await textPdf()).save());
  assert.deepEqual(ids(r).sort(), ['pdf-lang', 'pdf-title', 'pdf-untagged']);
  assert.equal(r.pages, 1);
  assert.equal(r.tagged, false);
  const untagged = r.issues.find((i) => i.id === 'pdf-untagged');
  assert.equal(untagged.impact, 'critical');
  assert.deepEqual(untagged.wcag, ['1.3.1', '4.1.2']);
});

test('a tagged PDF with a title, language and figure alt text passes', async () => {
  const doc = await textPdf({ title: 'Annual report 2026', lang: 'en-US' });
  doc.setTitle('Annual report 2026', { showInWindowTitleBar: true });
  tag(doc, { alt: 'Bar chart of sales by quarter' });
  const r = await auditPdf(await doc.save());
  assert.deepEqual(ids(r), []);
  assert.equal(r.title, 'Annual report 2026');
  assert.equal(r.lang, 'en-US');
  assert.deepEqual(r.figures, { total: 1, missing: 0 });
});

test('finds figures without alt text, scanned pages, unlabeled fields and missing bookmarks', async () => {
  const doc = await textPdf({ pages: 22, title: 'Handbook', lang: 'en' });
  doc.setTitle('Handbook', { showInWindowTitleBar: true });
  tag(doc);
  const img = await doc.embedPng(PNG);
  doc.addPage().drawImage(img, { x: 0, y: 0, width: 100, height: 100 });
  doc.getForm().createTextField('email').addToPage(doc.getPage(0), { x: 50, y: 600 });
  const r = await auditPdf(await doc.save());
  assert.deepEqual(ids(r).sort(), ['pdf-bookmarks', 'pdf-figure-alt', 'pdf-form-labels', 'pdf-image-only', 'pdf-tab-order'].sort());
  assert.deepEqual(r.imageOnlyPages, [23]);
  assert.equal(r.formFields.unlabeled, 1);
});

test('remediation sets the title, language and title display without touching content', async () => {
  const before = await (await textPdf({ pages: 2 })).save();
  const fixed = await remediatePdf(before, { title: 'Price list', lang: 'en-GB' });
  const r = await auditPdf(fixed);
  assert.deepEqual(ids(r), ['pdf-untagged'], 'only tagging is left, which needs the source file or Acrobat');
  assert.equal(r.title, 'Price list');
  assert.equal(r.lang, 'en-GB');
  assert.equal(r.pages, 2);
  await assert.rejects(remediatePdf(before, { lang: 'english please' }), /language code/);
});

test('files that are not PDFs are reported clearly', async () => {
  await assert.rejects(auditPdf(Buffer.from('<html>not a pdf</html>')), /could not be read as a PDF/);
});

// Accessibility checks for PDF documents, based on the WCAG PDF techniques and
// the PDF/UA requirements automated tools can verify: tags, title, language,
// figure alternative text, scanned (image-only) pages, form field labels,
// bookmarks, tab order and encryption that blocks assistive technology.
// Like page scans, these are automated checks: reading order, alt text quality
// and table structure still need a person.
import { PDFDocument, PDFName, PDFDict, PDFArray, PDFBool, PDFNumber, PDFRawStream, PDFString, PDFHexString, decodePDFRawStream } from 'pdf-lib';

const LANG = /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8}){0,3}$/;
const MAX_STRUCT_NODES = 20_000;
const BOOKMARK_PAGES = 21;

export const PDF_CHECKS = {
  'pdf-untagged': {
    title: 'PDF is not tagged',
    impact: 'critical',
    wcag: ['1.3.1', '4.1.2'],
    fix: 'Export the PDF with tags from the source file (in Word: File > Save As > PDF > Options > "Document structure tags for accessibility"), or tag it in Adobe Acrobat Pro with Accessibility > Autotag Document, then review the tags.',
  },
  'pdf-image-only': {
    title: 'Pages are scanned images with no real text',
    impact: 'critical',
    wcag: ['1.1.1', '1.4.5'],
    fix: 'Run text recognition (OCR) on the scanned pages, for example Scan & OCR > Recognize Text in Acrobat, or replace the scan with a PDF exported from the original document.',
  },
  'pdf-figure-alt': {
    title: 'Figures have no alternative text',
    impact: 'critical',
    wcag: ['1.1.1'],
    fix: 'Add alternative text to each meaningful image in the source file before exporting, or in Acrobat with Accessibility > Set Alternate Text. Mark decorative images as artifacts.',
  },
  'pdf-encrypted': {
    title: 'Security settings block screen readers',
    impact: 'critical',
    wcag: ['4.1.2'],
    fix: 'In the PDF security settings, allow "Enable text access for screen reader devices for the visually impaired", or remove the password restrictions.',
  },
  'pdf-title': {
    title: 'PDF has no document title',
    impact: 'serious',
    wcag: ['2.4.2'],
    fix: 'Set a descriptive document title. AccessBell can add it for you.',
    autoFix: true,
  },
  'pdf-lang': {
    title: 'PDF has no document language',
    impact: 'serious',
    wcag: ['3.1.1'],
    fix: 'Set the document language, such as en-US, so screen readers pronounce it correctly. AccessBell can add it for you.',
    autoFix: true,
  },
  'pdf-form-labels': {
    title: 'Form fields have no accessible name',
    impact: 'serious',
    wcag: ['1.3.1', '3.3.2', '4.1.2'],
    fix: 'Give each form field a tooltip (in Acrobat: Prepare Form > field Properties > General > Tooltip) that says what to enter.',
  },
  'pdf-display-title': {
    title: 'The viewer shows the file name, not the title',
    impact: 'moderate',
    wcag: ['2.4.2'],
    fix: 'Set the document to show its title in the window title bar (in Acrobat: File > Properties > Initial View > Show: Document Title). AccessBell can set this for you.',
    autoFix: true,
  },
  'pdf-tab-order': {
    title: 'Tab order does not follow the document structure',
    impact: 'moderate',
    wcag: ['2.4.3'],
    fix: 'Set each page with links or form fields to use the document structure for tab order (in Acrobat: page Properties > Tab Order > Use Document Structure).',
  },
  'pdf-bookmarks': {
    title: 'Long PDF has no bookmarks',
    impact: 'moderate',
    wcag: ['2.4.5'],
    fix: 'Add bookmarks for each main section. Most apps create them from your headings when you export to PDF.',
  },
};

const text = (v) => (v instanceof PDFString || v instanceof PDFHexString ? v.decodeText() : '');
const bool = (v) => (v instanceof PDFBool ? v.asBoolean() : false);
const name = (v) => (v && typeof v.asString === 'function' ? v.asString().replace(/^\//, '') : v ? String(v).replace(/^\//, '') : '');

function xmp(doc) {
  try {
    const stream = doc.catalog.lookup(PDFName.of('Metadata'));
    if (!(stream instanceof PDFRawStream)) return '';
    return new TextDecoder('utf-8').decode(decodePDFRawStream(stream).decode());
  } catch {
    return '';
  }
}

/** Does these resources (or a form XObject inside them) use fonts, or draw images? */
function resourceUse(context, resources, depth = 0, seen = new Set()) {
  const out = { fonts: false, images: false };
  const res = context.lookupMaybe(resources, PDFDict);
  if (!res || depth > 3 || seen.has(res)) return out;
  seen.add(res);
  const fonts = context.lookupMaybe(res.get(PDFName.of('Font')), PDFDict);
  if (fonts && fonts.keys().length) out.fonts = true;
  const xobjects = context.lookupMaybe(res.get(PDFName.of('XObject')), PDFDict);
  for (const key of xobjects ? xobjects.keys() : []) {
    const x = context.lookup(xobjects.get(key));
    const dict = x?.dict || x;
    if (!(dict instanceof PDFDict)) continue;
    const subtype = name(dict.get(PDFName.of('Subtype')));
    if (subtype === 'Image') out.images = true;
    if (subtype === 'Form') {
      const inner = resourceUse(context, dict.get(PDFName.of('Resources')), depth + 1, seen);
      out.fonts ||= inner.fonts;
      out.images ||= inner.images;
    }
  }
  return out;
}

/** Count Figure elements in the structure tree and how many have no alternative text. */
function figures(doc, structRoot) {
  const context = doc.context;
  const roleMap = context.lookupMaybe(structRoot.get(PDFName.of('RoleMap')), PDFDict);
  const role = (s) => {
    let r = s;
    for (let i = 0; i < 5 && roleMap; i++) {
      const mapped = roleMap.get(PDFName.of(r));
      if (!mapped) break;
      r = name(mapped);
    }
    return r;
  };
  let total = 0;
  let missing = 0;
  let visited = 0;
  const stack = [structRoot.get(PDFName.of('K'))];
  const seen = new Set();
  while (stack.length && visited < MAX_STRUCT_NODES) {
    const node = context.lookup(stack.pop());
    if (!node || seen.has(node)) continue;
    seen.add(node);
    visited++;
    if (node instanceof PDFArray) {
      for (let i = 0; i < node.size(); i++) stack.push(node.get(i));
      continue;
    }
    if (!(node instanceof PDFDict)) continue;
    const s = node.get(PDFName.of('S'));
    if (s && role(name(s)) === 'Figure') {
      total++;
      if (!text(node.lookup(PDFName.of('Alt'))).trim() && !text(node.lookup(PDFName.of('ActualText'))).trim()) missing++;
    }
    const k = node.get(PDFName.of('K'));
    if (k) stack.push(k);
  }
  return { total, missing };
}

/** Audit a PDF. Returns its properties, issues (like page issues) and passed checks. */
export async function auditPdf(bytes) {
  let doc;
  try {
    doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false, throwOnInvalidObject: false });
  } catch {
    const err = new Error('This file could not be read as a PDF.');
    err.expose = true;
    err.status = 422;
    throw err;
  }
  const context = doc.context;
  const catalog = doc.catalog;
  const meta = xmp(doc);
  const pages = doc.getPages();

  // Title: the document information dictionary or the XMP dc:title.
  let title = '';
  try {
    title = (doc.getTitle() || '').trim();
  } catch {}
  if (!title) title = (/<dc:title>[\s\S]*?<rdf:li[^>]*>([^<]*)<\/rdf:li>/.exec(meta)?.[1] || '').trim();
  const viewer = context.lookupMaybe(catalog.get(PDFName.of('ViewerPreferences')), PDFDict);
  const displayTitle = bool(viewer?.get(PDFName.of('DisplayDocTitle')));
  const lang = text(catalog.lookup(PDFName.of('Lang'))).trim();
  const markInfo = context.lookupMaybe(catalog.get(PDFName.of('MarkInfo')), PDFDict);
  const structRoot = context.lookupMaybe(catalog.get(PDFName.of('StructTreeRoot')), PDFDict);
  const tagged = Boolean(structRoot) && bool(markInfo?.get(PDFName.of('Marked')));
  const pdfua = /pdfuaid:part/.test(meta);

  let encrypted = false;
  let blocksAT = false;
  try {
    encrypted = doc.isEncrypted;
    const enc = context.lookupMaybe(context.trailerInfo.Encrypt, PDFDict);
    const p = enc?.get(PDFName.of('P'));
    if (p instanceof PDFNumber) blocksAT = (p.asNumber() & 512) === 0;
  } catch {}

  const imageOnly = [];
  let withAnnots = 0;
  let badTabs = 0;
  pages.forEach((page, i) => {
    const use = resourceUse(context, page.node.Resources());
    if (use.images && !use.fonts) imageOnly.push(i + 1);
    const annots = page.node.Annots();
    if (annots && annots.size()) {
      withAnnots++;
      if (name(page.node.get(PDFName.of('Tabs'))) !== 'S') badTabs++;
    }
  });

  const figs = structRoot ? figures(doc, structRoot) : { total: 0, missing: 0 };

  let fields = 0;
  let unlabeled = 0;
  try {
    for (const f of doc.getForm().getFields()) {
      fields++;
      if (!text(f.acroField.dict.lookup(PDFName.of('TU'))).trim()) unlabeled++;
    }
  } catch {}

  const outlines = context.lookupMaybe(catalog.get(PDFName.of('Outlines')), PDFDict);
  const hasBookmarks = Boolean(outlines?.get(PDFName.of('First')));

  const found = [];
  const flag = (id, count, detail) => found.push({ id, ...PDF_CHECKS[id], count, detail });
  const passes = [];
  const check = (id, failed, count, detail) => (failed ? flag(id, count, detail) : passes.push(id));

  check('pdf-encrypted', encrypted && blocksAT, 1, 'The PDF is encrypted and its permissions stop assistive technology from reading the text.');
  check('pdf-untagged', !tagged, 1, structRoot ? 'The PDF has a structure tree but is not marked as tagged.' : 'The PDF has no tags, so screen readers cannot tell headings, lists, tables and reading order apart.');
  check('pdf-image-only', imageOnly.length > 0, imageOnly.length, `Page${imageOnly.length === 1 ? '' : 's'} ${imageOnly.slice(0, 12).join(', ')}${imageOnly.length > 12 ? '...' : ''} contain images but no text.`);
  if (tagged) check('pdf-figure-alt', figs.missing > 0, figs.missing, `${figs.missing} of ${figs.total} figure${figs.total === 1 ? '' : 's'} have no alternative text.`);
  check('pdf-title', !title, 1, 'The document has no title, so screen readers and browser tabs show the file name.');
  if (title) check('pdf-display-title', !displayTitle, 1, `The title is "${title.slice(0, 80)}", but viewers are not set to show it.`);
  check('pdf-lang', !LANG.test(lang), 1, lang ? `The language "${lang.slice(0, 20)}" is not a valid language code.` : 'The document does not say which language it is written in.');
  if (fields) check('pdf-form-labels', unlabeled > 0, unlabeled, `${unlabeled} of ${fields} form field${fields === 1 ? '' : 's'} have no tooltip or accessible name.`);
  if (tagged && withAnnots) check('pdf-tab-order', badTabs > 0, badTabs, `${badTabs} page${badTabs === 1 ? '' : 's'} with links or fields do not use the document structure for tab order.`);
  if (pages.length >= BOOKMARK_PAGES) check('pdf-bookmarks', !hasBookmarks, 1, `The document has ${pages.length} pages and no bookmarks.`);

  const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  found.sort((a, b) => order[a.impact] - order[b.impact]);
  return {
    pages: pages.length,
    title: title || null,
    lang: lang || null,
    tagged,
    pdfua,
    encrypted,
    figures: figs,
    formFields: { total: fields, unlabeled },
    imageOnlyPages: imageOnly,
    issues: found,
    passes,
  };
}

/**
 * Fix what can be fixed safely without changing the content: the title, the
 * language and showing the title in the viewer. Returns the new PDF bytes.
 */
export async function remediatePdf(bytes, { title, lang } = {}) {
  let doc;
  try {
    doc = await PDFDocument.load(bytes, { updateMetadata: false, throwOnInvalidObject: false });
  } catch (e) {
    const err = new Error(/encrypt/i.test(String(e?.message)) ? 'This PDF is encrypted, so it cannot be changed here. Remove its password protection, then try again.' : 'This file could not be read as a PDF.');
    err.expose = true;
    err.status = 422;
    throw err;
  }
  const t = String(title || '').trim();
  const l = String(lang || '').trim();
  if (t) doc.setTitle(t.slice(0, 300), { showInWindowTitleBar: true });
  else if ((doc.getTitle() || '').trim()) doc.setTitle(doc.getTitle().trim(), { showInWindowTitleBar: true });
  if (l) {
    if (!LANG.test(l)) {
      const err = new Error('Enter a language code, such as en or en-US.');
      err.expose = true;
      err.status = 400;
      throw err;
    }
    doc.catalog.set(PDFName.of('Lang'), PDFString.of(l));
  }
  return doc.save();
}

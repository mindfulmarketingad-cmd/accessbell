// PDF rendering for one-time reports, built with pdf-lib (already a
// dependency). Text only, no images: a title block, the summary, every issue
// with its fix and failing-code samples, and a dated good-faith summary for
// domain audits. The footer on every page states what an automated scan
// cannot do, so the PDF never implies a guarantee of compliance.
import { Encodings } from '@pdf-lib/standard-fonts';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 48;
const BODY = 11;
const SMALL = 9;

// Helvetica and Courier are WinAnsi fonts. pdf-lib throws
// `WinAnsi cannot encode "→"` from widthOfTextAtSize and drawText for any
// code point outside that set, including tab and newline. Transliterate
// punctuation that shows up in scraped labels, keep characters the font
// really can encode, and replace the rest. Every string that is measured or
// drawn goes through pdfSafe.
const SAFE_MAP = {
  '\u00A0': ' ',
  '\u2010': '-',
  '\u2011': '-',
  '\u2012': '-',
  '\u2013': '-',
  '\u2014': '-',
  '\u2015': '-',
  '\u2018': "'",
  '\u2019': "'",
  '\u201C': '"',
  '\u201D': '"',
  '\u2022': '*',
  '\u2026': '...',
  '\u2190': '<-',
  '\u2191': '^',
  '\u2192': '->',
  '\u2193': 'v',
  '\u2194': '<->',
  '\u21D2': '=>',
  '\u2212': '-',
};

function canEncode(ch) {
  return Encodings.WinAnsi.canEncodeUnicodeCodePoint(ch.codePointAt(0));
}

export function pdfSafe(text) {
  let out = '';
  for (const ch of String(text ?? '')) {
    const mapped = SAFE_MAP[ch];
    if (mapped !== undefined) {
      out += mapped;
      continue;
    }
    if (canEncode(ch)) {
      out += ch;
      continue;
    }
    // Unencodable whitespace (newline, tab, carriage return) would still
    // throw if it reached drawText. A normal space wraps the same way.
    out += /\s/u.test(ch) ? ' ' : '?';
  }
  return out;
}

function isEncodingError(err) {
  return typeof err?.message === 'string' && err.message.includes('cannot encode');
}

function toAscii(text) {
  let out = '';
  for (const ch of text) {
    const c = ch.codePointAt(0);
    out += c >= 32 && c <= 126 ? ch : '?';
  }
  return out;
}

function widthOf(font, text, size) {
  const safe = pdfSafe(text);
  try {
    return font.widthOfTextAtSize(safe, size);
  } catch (err) {
    if (!isEncodingError(err)) throw err;
    return font.widthOfTextAtSize(toAscii(safe), size);
  }
}

function drawSafe(page, text, opts) {
  const safe = pdfSafe(text);
  try {
    page.drawText(safe, opts);
  } catch (err) {
    if (!isEncodingError(err)) throw err;
    page.drawText(toAscii(safe), opts);
  }
}

// Samples are HTML strings. Some callers pass { html, code, target, selector, url }
// or a selector array. Flatten those to text before measuring, so an object
// never becomes "[object Object]" and every selector still goes through pdfSafe.
function sampleText(sample) {
  if (typeof sample === 'string') return sample;
  if (Array.isArray(sample)) return sample.map((part) => sampleText(part)).filter(Boolean).join(' ');
  if (sample && typeof sample === 'object') {
    const parts = [sample.html, sample.code, sample.target, sample.selector, sample.text, sample.url];
    const text = parts.map((part) => (part == null || part === '' ? '' : sampleText(part))).filter(Boolean).join(' ');
    if (text) return text;
  }
  return sample == null ? '' : String(sample);
}

function wrap(text, font, size, maxWidth) {
  const words = pdfSafe(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (widthOf(font, test, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

export async function buildReportPdf(purchase, report) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.Courier);
  const title = purchase.product === 'domain_audit' ? 'Domain Audit' : 'Page Report';
  const maxWidth = PAGE_W - MARGIN * 2;

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;
  const footer = () => {
    drawSafe(page, 'Automated scan findings. Some checks need a person, and no tool can guarantee legal compliance on its own.', {
      x: MARGIN,
      y: 32,
      size: 8,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  };
  const ensure = (needed) => {
    if (y - needed < 56) {
      footer();
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  };
  const line = (text, { size = BODY, f = font, gap = 4, width = maxWidth } = {}) => {
    for (const part of wrap(text, f, size, width)) {
      ensure(size + gap);
      drawSafe(page, part, { x: MARGIN, y, size, font: f, color: rgb(0, 0, 0) });
      y -= size + gap;
    }
  };
  const blank = (h = 8) => {
    y -= h;
  };

  line(`AccessBell ${title}`, { size: 20, f: bold, gap: 6 });
  line(report.hostname || purchase.hostname || '', { size: 13, f: bold });
  line(report.url || purchase.url || '', { size: SMALL });
  line(`Report date: ${(report.scannedAt || purchase.paid_at || new Date().toISOString()).slice(0, 10)}`, { size: SMALL });
  blank(10);

  const s = report.summary || {};
  line('Summary', { size: 14, f: bold, gap: 6 });
  if (report.pagesScanned !== undefined) line(`Pages scanned: ${report.pagesScanned}${report.pagesFailed ? ` (${report.pagesFailed} failed to load)` : ''}`);
  line(`Issues found: ${s.issues || 0} (${s.critical || 0} critical, ${s.serious || 0} serious, ${s.moderate || 0} moderate, ${s.minor || 0} minor)`);
  if (report.score !== undefined) line(`Score: ${report.score} / 100`);
  blank(10);

  line('Issues and fixes', { size: 14, f: bold, gap: 6 });
  for (const issue of report.issues || []) {
    ensure(60);
    line(issue.title || 'Issue', { f: bold });
    line(
      `${issue.impact ? issue.impact[0].toUpperCase() + issue.impact.slice(1) : ''}${issue.count ? ` · ${issue.count} element${issue.count === 1 ? '' : 's'}` : ''}${
        issue.pagesAffected ? ` · ${issue.pagesAffected} page${issue.pagesAffected === 1 ? '' : 's'}` : ''
      }${issue.wcag?.length ? ` · WCAG ${issue.wcag.map((c) => c.sc).join(', ')}` : ''}`,
      { size: SMALL },
    );
    if (issue.description) line(issue.description);
    if (issue.fix) line(`Fix: ${issue.fix}`);
    const samples = [];
    for (const sample of issue.samples || []) samples.push(sample);
    for (const el of issue.elements || []) {
      if (el?.target) samples.push(el.target);
      if (el?.selector) samples.push(el.selector);
      if (el?.html) samples.push(el.html);
    }
    for (const sample of samples) {
      for (const part of wrap(sampleText(sample), mono, 8, maxWidth)) {
        ensure(12);
        drawSafe(page, part, { x: MARGIN, y, size: 8, font: mono, color: rgb(0.25, 0.25, 0.25) });
        y -= 12;
      }
    }
    blank(8);
  }

  if (purchase.product === 'domain_audit') {
    line('Good-faith summary', { size: 14, f: bold, gap: 6 });
    line(
      `This report records the automated accessibility findings for ${report.hostname} on ${(report.scannedAt || '').slice(0, 10)}. ` +
        `${report.pagesScanned || 0} pages were scanned against WCAG 2.2 Level AA, and ${s.issues || 0} issues were found. ` +
        'Fixing the issues above, keeping the dated record of each fix, and reviewing the checks automation cannot decide are the steps that demonstrate a good-faith accessibility effort. ' +
        'This report is a record of automated testing, not a legal opinion and not a guarantee of compliance.',
    );
    blank(6);
    line('Keep this report with your fix log: together they show what was tested, what was found and when.');
  }

  footer();
  return doc.save();
}

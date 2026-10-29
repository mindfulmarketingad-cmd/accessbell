// PDF rendering for one-time reports, built with pdf-lib (already a
// dependency). Text only, no images: a title block, the summary, every issue
// with its fix and failing-code samples, and a dated good-faith summary for
// domain audits. The footer on every page states what an automated scan
// cannot do, so the PDF never implies a guarantee of compliance.
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 48;
const BODY = 11;
const SMALL = 9;

function wrap(text, font, size, maxWidth) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
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
    page.drawText('Automated scan findings. Some checks need a person, and no tool can guarantee legal compliance on its own.', {
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
      page.drawText(part, { x: MARGIN, y, size, font: f, color: rgb(0, 0, 0) });
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
    if (issue.fix) line(`Fix: ${issue.fix}`);
    for (const sample of issue.samples || []) {
      for (const part of wrap(sample, mono, 8, maxWidth)) {
        ensure(12);
        page.drawText(part, { x: MARGIN, y, size: 8, font: mono, color: rgb(0.25, 0.25, 0.25) });
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

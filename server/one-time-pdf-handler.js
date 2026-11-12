// Serves a paid report as a PDF. Written so a customer who paid never sees a
// raw 500: if the normal render throws for any reason, retry with the report
// reduced to plain ASCII, then with a summary-only PDF, and only then show a
// readable page that links to the online report. There is no expiry: a paid,
// ready report is served for as long as its row exists.
import { buildReportPdf, pdfSafe } from './report-pdf.js';

export const SUPPORT_EMAIL = 'hello@accessbell.co';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function page(status, title, body, extra = {}) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)}</title></head><body style="font-family:system-ui,sans-serif;max-width:40rem;margin:3rem auto;padding:0 1rem;line-height:1.5"><h1>${esc(title)}</h1>${body}</body></html>`;
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', ...extra } });
}

const asciiString = (s) => Array.from(pdfSafe(s), (ch) => (ch.codePointAt(0) >= 32 && ch.codePointAt(0) <= 126 ? ch : ' ')).join('');

/** Deep copy of the report where every string is printable ASCII and every value is plain JSON. */
export function asciiReport(value) {
  if (typeof value === 'string') return asciiString(value);
  if (Array.isArray(value)) return value.map(asciiReport);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, asciiReport(v)]));
  return typeof value === 'number' || typeof value === 'boolean' ? value : value == null ? undefined : asciiString(value);
}

/** Summary and issue titles only: the smallest PDF that is still the customer's findings. */
function summaryOnly(report) {
  const r = asciiReport(report) || {};
  return {
    hostname: typeof r.hostname === 'string' ? r.hostname : '',
    url: typeof r.url === 'string' ? r.url : '',
    scannedAt: typeof r.scannedAt === 'string' ? r.scannedAt : undefined,
    pagesScanned: Number.isFinite(r.pagesScanned) ? r.pagesScanned : undefined,
    pagesFailed: Number.isFinite(r.pagesFailed) ? r.pagesFailed : undefined,
    summary: r.summary && typeof r.summary === 'object' ? r.summary : {},
    issues: (Array.isArray(r.issues) ? r.issues : []).filter((i) => i && typeof i === 'object').map((i) => ({
      title: typeof i.title === 'string' ? i.title : 'Issue',
      impact: typeof i.impact === 'string' ? i.impact : '',
      count: Number.isFinite(i.count) ? i.count : 0,
      fix: typeof i.fix === 'string' ? i.fix : '',
    })),
  };
}

/** Build the PDF, degrading gracefully. Returns { pdf, mode } or throws only if every level fails. */
export async function buildResilientPdf(purchase, report, { build = buildReportPdf, log = console.error } = {}) {
  const attempts = [
    ['full', () => build(purchase, report)],
    ['ascii', () => build(purchase, asciiReport(report))],
    ['summary', () => build(purchase, summaryOnly(report))],
  ];
  let lastErr;
  for (const [mode, run] of attempts) {
    try {
      return { pdf: await run(), mode };
    } catch (err) {
      lastErr = err;
      log(`one-time-pdf ${mode} render failed:`, err?.message || err);
    }
  }
  throw lastErr;
}

function whiteLabelFromQuery(url) {
  if (url.searchParams.get('whiteLabel') !== '1') return null;
  const agencyName = (url.searchParams.get('agency') || '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 80);
  if (agencyName.length < 2) return null;
  return { enabled: true, agencyName };
}

export async function servePdf(request, { getPurchase, build = buildReportPdf, log = console.error } = {}) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || '';
  const reportLink = `/report?token=${encodeURIComponent(token)}`;
  const contact = `<p>Need help? Email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> with your report link and we will send the PDF to you.</p>`;
  let purchase = null;
  if (/^[a-f0-9]{32}$/.test(token)) {
    try {
      purchase = await getPurchase(token);
    } catch (err) {
      log('one-time-pdf lookup failed:', err?.message || err);
      return page(503, 'Report temporarily unavailable', `<p>We could not look up your report just now. Please try again in a minute.</p>${contact}`, { 'Retry-After': '60' });
    }
  }
  if (!purchase || purchase.status !== 'paid') {
    return page(404, 'Report not found', `<p>That report link was not recognized. Check the link in your email.</p>${contact}`);
  }
  if (purchase.delivery !== 'ready' || !purchase.report) {
    return page(202, 'Your report is being prepared', `<p>Your report is not ready yet. We will email you when it is. <a href="${esc(reportLink)}">Check its status</a>.</p>${contact}`, { 'Retry-After': '60' });
  }
  const whiteLabel = whiteLabelFromQuery(url);
  let result;
  try {
    result = await buildResilientPdf(whiteLabel ? { ...purchase, whiteLabel } : purchase, purchase.report, { build, log });
  } catch (err) {
    log('one-time-pdf unrecoverable for', purchase.hostname, err?.message || err);
    return page(
      503,
      'Your PDF is being fixed',
      `<p>The PDF could not be generated, but your report is ready online: <a href="${esc(reportLink)}">open the report</a> and use your browser's Print, Save as PDF option in the meantime.</p>${contact}`,
      { 'Retry-After': '300' },
    );
  }
  const prefix = whiteLabel ? '' : 'accessbell-';
  const name = `${prefix}${purchase.product}-${purchase.hostname}.pdf`.replace(/[^A-Za-z0-9._-]+/g, '-');
  return new Response(result.pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'no-store',
      'X-Report-Render': result.mode,
    },
  });
}

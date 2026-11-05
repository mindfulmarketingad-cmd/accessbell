// GET /api/one-time-pdf?token=... -> the report as a PDF download.
// Only for paid purchases whose report is ready; the token is the access control.
import { getPurchaseByToken, validToken } from '../server/app/one-time.js';
import { buildReportPdf } from '../server/report-pdf.js';
import { methodNotAllowed } from '../server/http.js';

function whiteLabelFromQuery(url) {
  if (url.searchParams.get('whiteLabel') !== '1') return null;
  const agencyName = (url.searchParams.get('agency') || '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 80);
  if (agencyName.length < 2) return null;
  return { enabled: true, agencyName };
}

export async function GET(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || '';
  if (!validToken(token)) return new Response('Not found', { status: 404 });
  const purchase = await getPurchaseByToken(token);
  if (!purchase || purchase.status !== 'paid' || purchase.delivery !== 'ready' || !purchase.report) {
    return new Response('Not found', { status: 404 });
  }
  const whiteLabel = whiteLabelFromQuery(url);
  const pdf = await buildReportPdf(whiteLabel ? { ...purchase, whiteLabel } : purchase, purchase.report);
  const prefix = whiteLabel ? '' : 'accessbell-';
  const name = `${prefix}${purchase.product}-${purchase.hostname}.pdf`.replace(/[^A-Za-z0-9._-]+/g, '-');
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'no-store',
    },
  });
}

export function POST() {
  return methodNotAllowed('GET');
}

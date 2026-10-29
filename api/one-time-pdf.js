// GET /api/one-time-pdf?token=... -> the report as a PDF download.
// Only for paid purchases whose report is ready; the token is the access control.
import { getPurchaseByToken, validToken } from '../server/app/one-time.js';
import { buildReportPdf } from '../server/report-pdf.js';
import { methodNotAllowed } from '../server/http.js';

export async function GET(request) {
  const token = new URL(request.url).searchParams.get('token') || '';
  if (!validToken(token)) return new Response('Not found', { status: 404 });
  const purchase = await getPurchaseByToken(token);
  if (!purchase || purchase.status !== 'paid' || purchase.delivery !== 'ready' || !purchase.report) {
    return new Response('Not found', { status: 404 });
  }
  const pdf = await buildReportPdf(purchase, purchase.report);
  const name = `accessbell-${purchase.product}-${purchase.hostname}.pdf`.replace(/[^A-Za-z0-9._-]+/g, '-');
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

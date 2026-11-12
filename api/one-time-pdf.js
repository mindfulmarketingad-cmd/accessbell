// GET /api/one-time-pdf?token=... -> the report as a PDF download.
// Only for paid purchases whose report is ready; the token is the access
// control and it never expires. See server/one-time-pdf-handler.js for the
// fallbacks that keep a paid customer from ever seeing a raw error.
import { getPurchaseByToken } from '../server/app/one-time.js';
import { servePdf } from '../server/one-time-pdf-handler.js';
import { methodNotAllowed } from '../server/http.js';

export function GET(request) {
  return servePdf(request, { getPurchase: getPurchaseByToken });
}

export function POST() {
  return methodNotAllowed('GET');
}

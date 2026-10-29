// GET /api/one-time-report?token=... -> the buyer's one-time report.
//
// No account is required: the emailed token link is the access control. A
// page report is built on first view (one page, fast). A domain audit is
// built by the Inngest crawl; while it is pending this endpoint nudges the
// crawl event again, so a lost webhook event self-heals.
import { getPurchaseByToken, validToken, sendOneTimeAuditEvent } from '../server/app/one-time.js';
import { one } from '../server/app/db.js';
import { browserAudit } from '../server/browser-audit.js';
import { audit } from '../server/audit.js';
import { fetchPage } from '../server/fetch-page.js';
import { json, methodNotAllowed } from '../server/http.js';

async function buildPageReport(purchase) {
  let report = null;
  if (process.env.BROWSER_WS_ENDPOINT) {
    try {
      report = await browserAudit(purchase.url, { standard: 'wcag22' });
    } catch {
      report = null;
    }
  }
  if (!report) {
    const page = await fetchPage(purchase.url);
    report = { finalUrl: page.finalUrl, engine: 'html', ...audit(page.html, { standard: 'wcag22' }) };
  }
  return {
    product: 'page_report',
    hostname: purchase.hostname,
    url: purchase.url,
    standard: 'WCAG 2.2 AA',
    scannedAt: new Date().toISOString(),
    score: report.score,
    summary: report.summary,
    issues: (report.issues || []).map((i) => ({
      id: i.id || null,
      title: i.title,
      impact: i.impact,
      count: i.count,
      wcag: i.wcag || [],
      fix: i.fix || '',
      samples: i.samples || [],
      helpUrl: i.helpUrl || null,
    })),
  };
}

export async function GET(request) {
  const token = new URL(request.url).searchParams.get('token') || '';
  if (!validToken(token)) return json(404, { error: 'Report not found.' });
  const purchase = await getPurchaseByToken(token);
  if (!purchase) return json(404, { error: 'Report not found.' });
  if (purchase.status !== 'paid') {
    return json(200, { status: purchase.status, delivery: purchase.delivery, product: purchase.product, hostname: purchase.hostname });
  }
  if (purchase.delivery === 'ready' && purchase.report) {
    return json(200, {
      status: 'paid',
      delivery: 'ready',
      product: purchase.product,
      hostname: purchase.hostname,
      report: purchase.report,
      pdfUrl: `/api/one-time-pdf?token=${token}`,
    });
  }
  if (purchase.product === 'page_report') {
    try {
      const report = await buildPageReport(purchase);
      await one(
        `update app.one_time_purchases set delivery = 'ready', report = $2::jsonb
          where token = $1 and delivery in ('pending', 'building')`,
        [token, JSON.stringify(report)],
      );
      return json(200, {
        status: 'paid',
        delivery: 'ready',
        product: purchase.product,
        hostname: purchase.hostname,
        report,
        pdfUrl: `/api/one-time-pdf?token=${token}`,
      });
    } catch (err) {
      console.error('one-time page report failed', err);
      return json(200, {
        status: 'paid',
        delivery: 'pending',
        product: purchase.product,
        hostname: purchase.hostname,
        error: 'The report could not be built yet. Please try again.',
      });
    }
  }
  if (purchase.delivery === 'pending') {
    try {
      await sendOneTimeAuditEvent(token);
    } catch {}
  }
  return json(200, { status: 'paid', delivery: purchase.delivery, product: purchase.product, hostname: purchase.hostname });
}

export function POST() {
  return methodNotAllowed('GET');
}

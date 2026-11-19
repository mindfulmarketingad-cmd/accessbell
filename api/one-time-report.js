// GET /api/one-time-report?token=... -> the buyer's one-time report.
//
// No account is required: the emailed token link is the access control. A
// page report is built on first view (one page, fast). A domain audit is
// built by the Inngest crawl; while it is pending this endpoint nudges the
// crawl event again, so a lost webhook event self-heals.
import { getPurchaseByToken, validToken, sendOneTimeAuditEvent } from '../server/app/one-time.js';
import { sendDegradedAuditAlert } from '../server/app/email-sequences.js';
import { one } from '../server/app/db.js';
import { runPaidCheck } from '../server/one-time-audit.js';
import { redactSecrets } from '../server/redact.js';
import { json, methodNotAllowed } from '../server/http.js';

async function buildPageReport(purchase) {
  const { report, browserFallback } = await runPaidCheck(purchase.url);
  const built = {
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
  if (browserFallback) {
    built.degraded = true;
    built.browserFallback = { reason: browserFallback, pages: 1 };
  }
  return built;
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
      // A browser failure must not be saved as a finished paid report.
      if (report.degraded) {
        try {
          const res = await sendDegradedAuditAlert({
            hostname: purchase.hostname,
            url: purchase.url,
            token,
            product: purchase.product,
            reason: report.browserFallback?.reason,
            pagesScanned: 1,
            pagesFellBack: 1,
            idempotencyKey: `degraded-page-report/${token}`,
          });
          if (!res.ok) console.error('degraded page report alert not sent:', res.reason || 'error');
        } catch (err) {
          console.error('degraded page report alert failed', redactSecrets(err?.message || err));
        }
        await one(
          `update app.one_time_purchases set delivery = 'failed', report = $2::jsonb
            where token = $1 and status = 'paid' and delivery in ('pending', 'building', 'failed')`,
          [token, JSON.stringify(report)],
        );
        return json(200, {
          status: 'paid',
          delivery: 'failed',
          product: purchase.product,
          hostname: purchase.hostname,
        });
      }
      await one(
        `update app.one_time_purchases set delivery = 'ready', report = $2::jsonb
          where token = $1 and delivery in ('pending', 'building', 'failed')`,
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
      console.error('one-time page report failed', redactSecrets(err?.message || err));
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

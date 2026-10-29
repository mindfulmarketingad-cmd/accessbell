// Email templates and senders for one-time purchases and follow-up sequences.
// Plain text only, so user input cannot inject markup. No email here claims a
// scan makes a site compliant or safe from legal action: automated scans find
// code-level barriers, and some checks still need a person.
//
// Transactional mail (report links, payment receipts) is sent by the webhook
// and the audit function. Marketing sequences (scan follow-up, abandoned
// checkout, audit upsell) are sent by the ops agent on their schedule; every
// sequence email carries an opt-out line. Nothing in this file sends mail on
// import: each function sends only when called.
import { config } from './config.js';

async function sendEmail({ to, subject, text }) {
  const c = config();
  if (!c.resendApiKey) return { ok: false, reason: 'not-configured' };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: c.emailFrom, to: [to], subject: subject.slice(0, 150), text }),
    signal: AbortSignal.timeout(8000),
  });
  return { ok: res.ok, reason: res.ok ? undefined : `resend-${res.status}` };
}

const FOOT = '\n\nAccessBell finds accessibility barriers in your site code and explains how to fix them. Automated testing covers part of the WCAG standard, not all of it, so some checks still need a person. No tool can guarantee legal compliance on its own.';
const OPTOUT = '\n\nReply to this email with "opt out" and we will not follow up.';

/** Page Report: the emailed link opens the report, which builds on first view. */
export function reportLinkEmail({ hostname, reportUrl }) {
  return {
    subject: `Your AccessBell Page Report for ${hostname}`,
    text: [
      `Your Page Report for ${hostname} is ready.`,
      '',
      `Open it here: ${reportUrl}`,
      '',
      'It includes every issue the automated scan found on the page, the failing code for each one, how to fix it, and a PDF download.',
      'Want the same detail for your whole website, or monitoring that catches new issues? See the Domain Audit and Pro plans at https://www.accessbell.co/pricing.',
      FOOT,
    ].join('\n'),
  };
}

/** Domain Audit, sent at payment: the crawl is running, the ready email follows. */
export function paymentReceivedEmail({ hostname, reportUrl }) {
  return {
    subject: `Your AccessBell Domain Audit for ${hostname} is being prepared`,
    text: [
      `Thanks for your order. Your Domain Audit for ${hostname} is being prepared: we crawl up to 500 pages on the domain and test each one against WCAG 2.2 AA.`,
      '',
      `When it is ready we will email you the report link. You can also check progress here: ${reportUrl}`,
      '',
      'The finished audit includes every issue with its fix, a PDF evidence pack, a dated good-faith summary and an accessibility statement.',
      FOOT,
    ].join('\n'),
  };
}

/** Domain Audit, sent when the crawl finishes and the report is stored. */
export function reportReadyEmail({ hostname, reportUrl, summary }) {
  const s = summary || {};
  return {
    subject: `Your AccessBell Domain Audit for ${hostname} is ready`,
    text: [
      `Your Domain Audit for ${hostname} is ready.`,
      '',
      `Open it here: ${reportUrl}`,
      s.pagesScanned ? `Pages scanned: ${s.pagesScanned}. Issues found: ${s.issues || 0} (${s.critical || 0} critical, ${s.serious || 0} serious).` : '',
      '',
      'The report includes every issue with its fix, a PDF evidence pack download, a dated good-faith summary and an accessibility statement.',
      'Keep it current: Pro monitoring rescans your domain daily and emails you when a new issue appears. See https://www.accessbell.co/pricing.',
      FOOT,
    ]
      .filter(Boolean)
      .join('\n'),
  };
}

/** Scan follow-up (sequence): sent after a free scan when the visitor left an email. */
export function scanFollowupEmail({ hostname, url, issues, critical, serious }) {
  return {
    subject: `Your ${hostname} scan results, and the full report`,
    text: [
      `You recently scanned ${url} with AccessBell's free checker.`,
      '',
      issues
        ? `The automated scan found ${issues} issue${issues === 1 ? '' : 's'} (${critical || 0} critical, ${serious || 0} serious). The free results list each issue by name; the full report shows the failing code and how to fix it.`
        : 'The automated scan found no issues on that page. Automated testing covers only part of the standard, so the rest of the domain may still have issues.',
      '',
      'Get the full detail for that page with a Page Report ($19, one-time): https://www.accessbell.co/solutions/page-report',
      'Or audit your whole domain, up to 500 pages, with a Domain Audit ($79, one-time): https://www.accessbell.co/solutions/domain-audit',
      FOOT,
      OPTOUT,
    ].join('\n'),
  };
}

/** Abandoned checkout (sequence): one reminder for a pending purchase. */
export function abandonedCheckoutEmail({ product, hostname, checkoutUrl }) {
  const name = product === 'domain_audit' ? 'Domain Audit ($79)' : 'Page Report ($19)';
  return {
    subject: `Your AccessBell ${name} checkout is still open`,
    text: [
      `You started checkout for a ${name} for ${hostname} but did not finish. Your report is one step away:`,
      '',
      checkoutUrl,
      '',
      'If you no longer want it, just ignore this email. We will not send another reminder for this order.',
      FOOT,
      OPTOUT,
    ].join('\n'),
  };
}

/** Audit-to-Pro upsell (sequence): sent after a domain audit is delivered. */
export function auditUpsellEmail({ hostname, reportUrl }) {
  return {
    subject: `Keep your ${hostname} audit current with monitoring`,
    text: [
      `Your Domain Audit for ${hostname} is a snapshot: the next edit to your site can introduce new issues.`,
      '',
      `Your report: ${reportUrl}`,
      '',
      'AccessBell Pro ($29 per domain per month, or $199 per year) rescans your domain daily, emails you when a new critical or serious issue appears, and keeps a dated record of every scan and fix. Start a 3-day free trial at https://www.accessbell.co/app/signup.',
      FOOT,
      OPTOUT,
    ].join('\n'),
  };
}

/**
 * NEW TEMPLATE (funnel agent, 2026-10-29): Page Report -> Domain Audit
 * upsell, sent a few days after a Page Report purchase. Needs David's
 * approval before any live send; the funnel agent runs dry-run until then.
 */
export function pageReportUpsellEmail({ hostname, reportUrl }) {
  return {
    subject: `Your ${hostname} page report, and the full-domain version`,
    text: [
      `You recently got a Page Report for ${hostname}. That report covered a single page in full detail.`,
      '',
      `Your report: ${reportUrl}`,
      '',
      'A Domain Audit ($79, one-time) does the same for your whole website: it crawls up to 500 pages, lists every issue with its fix, and includes a PDF evidence pack, a dated good-faith summary and an accessibility statement.',
      'Get the full-domain version at https://www.accessbell.co/solutions/domain-audit',
      FOOT,
      OPTOUT,
    ].join('\n'),
  };
}

export const sendReportLinkEmail = (a) => sendEmail({ to: a.to, ...reportLinkEmail(a) });
export const sendPaymentReceivedEmail = (a) => sendEmail({ to: a.to, ...paymentReceivedEmail(a) });
export const sendReportReadyEmail = (a) => sendEmail({ to: a.to, ...reportReadyEmail(a) });
export const sendScanFollowup = (a) => sendEmail({ to: a.to, ...scanFollowupEmail(a) });
export const sendAbandonedCheckoutReminder = (a) => sendEmail({ to: a.to, ...abandonedCheckoutEmail(a) });
export const sendAuditUpsell = (a) => sendEmail({ to: a.to, ...auditUpsellEmail(a) });
export const sendPageReportUpsell = (a) => sendEmail({ to: a.to, ...pageReportUpsellEmail(a) });

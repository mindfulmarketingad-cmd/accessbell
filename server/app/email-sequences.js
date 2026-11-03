// Email templates and senders for one-time purchases and follow-up sequences.
// Plain text only, so user input cannot inject markup. No email here claims a
// scan makes a site compliant or safe from legal action: automated scans find
// code-level barriers, and some checks still need a person.
//
// Transactional mail (report links, payment receipts) is sent by the webhook
// and the audit function. Marketing sequences (scan follow-up, abandoned
// checkout, audit upsell) are sent by the ops agent on their schedule; every
// sequence email carries a signed one-click unsubscribe link, List-Unsubscribe
// headers and the CAN-SPAM mailing address (see unsubscribe.js). Nothing in this file sends mail on
// import: each function sends only when called.
import { config } from './config.js';
import { recordWelcomeEmail } from './tracking.js';
import { marketingFooter, unsubscribeHeaders, funnelSendBlockers } from './unsubscribe.js';

async function sendEmail({ to, subject, text, replyTo, idempotencyKey, extraHeaders }) {
  const c = config();
  if (!c.resendApiKey) return { ok: false, reason: 'not-configured' };
  const headers = { Authorization: `Bearer ${c.resendApiKey}`, 'Content-Type': 'application/json' };
  // Resend drops a repeat request with the same key (24h), so a retried
  // webhook cannot send the same transactional email twice.
  if (idempotencyKey) headers['Idempotency-Key'] = String(idempotencyKey).slice(0, 256);
  const payload = { from: c.emailFrom, to: [to], subject: subject.slice(0, 150), text };
  if (replyTo) payload.reply_to = replyTo;
  if (extraHeaders && Object.keys(extraHeaders).length) payload.headers = extraHeaders;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, id: data?.id, reason: res.ok ? undefined : `resend-${res.status}` };
}

const FOOT = '\n\nAccessBell finds accessibility barriers in your site code and explains how to fix them. Automated testing covers part of the WCAG standard, not all of it, so some checks still need a person. No tool can guarantee legal compliance on its own.';

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

/** Trial signup link with the scanned site filled in. */
export function trialSignupUrl(hostname) {
  const host = String(hostname || '').trim().toLowerCase();
  return host ? `https://www.accessbell.co/app/signup?domain=${encodeURIComponent(host)}` : 'https://www.accessbell.co/app/signup';
}

const IMPACT_WORD = { critical: 'critical', serious: 'serious', moderate: 'moderate', minor: 'minor' };

/**
 * Scan follow-up, day 1 (sequence): the top issue on the page they scanned
 * and how to fix it. `topIssue` comes from a fresh server-side re-check of
 * the page; without one the email falls back to the logged counts.
 */
export function scanFollowupEmail({ to, hostname, url, issues, critical, serious, topIssue }) {
  const t = topIssue && topIssue.title ? topIssue : null;
  const wcag = t && (t.wcag || []).filter((c) => c && c.sc).map((c) => `${c.sc} ${c.name || ''}`.trim()).join(', ');
  const body = t
    ? [
        `The top ${IMPACT_WORD[t.impact] || ''} issue on that page right now:`.replace('  ', ' '),
        '',
        `${t.title}${t.count ? ` (${t.count} element${t.count === 1 ? '' : 's'})` : ''}${wcag ? `, WCAG ${wcag}` : ''}`,
        '',
        t.fix ? `How to fix it: ${t.fix}` : 'The full report shows the failing code and how to fix it.',
        t.helpUrl ? `More guidance: ${t.helpUrl}` : '',
      ]
    : [
        issues
          ? `The automated scan found ${issues} issue${issues === 1 ? '' : 's'} (${critical || 0} critical, ${serious || 0} serious). Critical issues are the ones that stop some visitors from using the page at all, so they are the place to start.`
          : 'Automated testing covers only part of the standard, and the rest of your site may have issues that page does not.',
      ];
  return {
    subject: t ? `The top accessibility issue on ${hostname}, and how to fix it` : `Your ${hostname} scan: where to start fixing`,
    text: [
      `You recently scanned ${url} with AccessBell's free checker.`,
      '',
      ...body,
      '',
      `That is one issue on one page. AccessBell Pro scans up to 500 pages on ${hostname} every day and gives you guided fix suggestions for each issue. Start a 3-day free trial, with ${hostname} filled in:`,
      trialSignupUrl(hostname),
      '',
      'Prefer a one-time check? A Page Report ($19) lists every issue on that page with its fix:',
      `https://www.accessbell.co/solutions/page-report?url=${encodeURIComponent(url || '')}`,
      FOOT,
    ]
      .filter((line) => line !== null && line !== undefined)
      .join('\n') + marketingFooter(to),
  };
}

/**
 * Scan follow-up, day 3 (sequence): "still failing?" with the result of a
 * fresh re-check of the same page. `recheck` is { issues, critical, serious }
 * or null when the page could not be re-checked.
 */
export function scanRescanEmail({ to, hostname, url, issues, recheck }) {
  const r = recheck && Number.isInteger(recheck.issues) ? recheck : null;
  const status = r
    ? r.issues
      ? `We re-checked ${url} today. It still has ${r.issues} automated issue${r.issues === 1 ? '' : 's'} (${r.critical || 0} critical, ${r.serious || 0} serious).`
      : `We re-checked ${url} today and the automated checks found no issues on that page. Nice work. Automated testing covers only part of the standard, and your other pages may still have issues.`
    : `When you scanned ${url} a few days ago, the automated scan found ${issues ? `${issues} issue${issues === 1 ? '' : 's'}` : 'results worth a second look'}. Has anything changed since?`;
  return {
    subject: r && !r.issues ? `${hostname} passed today's re-check. What about the rest of the site?` : `Still failing? A re-check of ${hostname}`,
    text: [
      status,
      '',
      'Accessibility issues come back as sites change: a new product, a plugin update or a new page can add barriers without anyone noticing.',
      '',
      `AccessBell Pro rescans up to 500 pages on ${hostname} every day, emails you when a new critical or serious issue appears, and gives you guided fix suggestions for each one. 3-day free trial, cancel anytime:`,
      trialSignupUrl(hostname),
      '',
      'Run another free scan any time: https://www.accessbell.co/#scan',
      FOOT,
    ].join('\n') + marketingFooter(to),
  };
}

/**
 * Scan results (transactional, requested): sent right away when a visitor
 * asks for their free scan results by email. Counts come from the server's
 * own free_scans log, never from the browser.
 */
export function scanResultsEmail({ to, hostname, url, issues, critical, serious }) {
  const known = Number.isInteger(issues);
  return {
    subject: `Your AccessBell scan results for ${hostname}`,
    text: [
      `Here are the results of the free AccessBell scan you ran on ${url}.`,
      '',
      known
        ? issues
          ? `The automated scan found ${issues} issue${issues === 1 ? '' : 's'} (${critical || 0} critical, ${serious || 0} serious).`
          : 'The automated scan found no issues on that page. Automated testing covers only part of the standard, so other pages and some manual checks may still have issues.'
        : 'Your scan summary is shown on the results page where you ran it.',
      '',
      'See the failing code and guided fix suggestions for every issue on that page with a Page Report ($19, one-time):',
      `https://www.accessbell.co/solutions/page-report?url=${encodeURIComponent(url)}`,
      '',
      `Or keep the whole site monitored: AccessBell Pro rescans daily and emails you when new issues appear. $29 per month after a 3-day free trial: ${trialSignupUrl(hostname)}`,
      '',
      'Run another free scan any time: https://www.accessbell.co/#scan',
      FOOT,
    ].join('\n') + marketingFooter(to),
  };
}

/** Abandoned checkout (sequence): one reminder for a pending purchase. */
export function abandonedCheckoutEmail({ to, product, hostname, checkoutUrl }) {
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
    ].join('\n') + marketingFooter(to),
  };
}

/** Audit-to-Pro upsell (sequence): sent after a domain audit is delivered. */
export function auditUpsellEmail({ to, hostname, reportUrl }) {
  return {
    subject: `Keep your ${hostname} audit current with monitoring`,
    text: [
      `Your Domain Audit for ${hostname} is a snapshot: the next edit to your site can introduce new issues.`,
      '',
      `Your report: ${reportUrl}`,
      '',
      'AccessBell Pro ($29 per domain per month, or $199 per year) rescans your domain daily, emails you when a new critical or serious issue appears, and keeps a dated record of every scan and fix. Start a 3-day free trial at https://www.accessbell.co/app/signup.',
      FOOT,
    ].join('\n') + marketingFooter(to),
  };
}

/**
 * NEW TEMPLATE (funnel agent, 2026-10-29): Page Report -> Domain Audit
 * upsell, sent a few days after a Page Report purchase. Needs David's
 * approval before any live send; the funnel agent runs dry-run until then.
 */
export function pageReportUpsellEmail({ to, hostname, reportUrl }) {
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
    ].join('\n') + marketingFooter(to),
  };
}

/**
 * Welcome (transactional): sent once when a Pro subscription checkout links
 * to an account. Written as David; replies go to him (first ADMIN_EMAILS
 * entry). Sent live regardless of FUNNEL_EMAIL_LIVE: it is not a sequence.
 */
export function welcomeSubscriberEmail({ dashboardUrl = 'https://www.accessbell.co/app' } = {}) {
  return {
    subject: 'Welcome to AccessBell',
    text: [
      'Hi there,',
      '',
      "Thanks for subscribing to AccessBell, I'm really glad you're here.",
      '',
      `Your dashboard is ready here: ${dashboardUrl}`,
      '',
      'From there you can run scans, see exactly how to fix each issue, and get daily rescans with alerts so your site stays accessible.',
      '',
      'If you have any questions or ideas, just reply to this email. It comes straight to me.',
      '',
      'Welcome aboard,',
      'David',
      'AccessBell',
    ].join('\n'),
  };
}

/** Send the welcome email. `key` (e.g. the account id) makes Resend drop duplicates. */
export async function sendWelcomeSubscriberEmail({ to, key }) {
  const replyTo = config().adminEmails[0] || undefined;
  let res;
  try {
    res = await sendEmail({
      to,
      ...welcomeSubscriberEmail(),
      replyTo,
      idempotencyKey: key ? `welcome-subscriber/${key}` : undefined,
    });
  } catch (err) {
    await recordWelcomeEmail(key, { ok: false, reason: err?.name || 'error' });
    throw err;
  }
  // Recorded for the admin account page (key is the account id). Never throws.
  await recordWelcomeEmail(key, res);
  return res;
}

export const sendReportLinkEmail = (a) => sendEmail({ to: a.to, ...reportLinkEmail(a) });
export const sendPaymentReceivedEmail = (a) => sendEmail({ to: a.to, ...paymentReceivedEmail(a) });
export const sendReportReadyEmail = (a) => sendEmail({ to: a.to, ...reportReadyEmail(a) });
/**
 * Sequence (marketing) sender: refuses to send without the CAN-SPAM address
 * and unsubscribe key, and attaches the one-click unsubscribe headers.
 */
async function sendSequenceEmail(a, template) {
  const blockers = funnelSendBlockers();
  if (blockers.length) {
    console.error('[funnel] refusing to send sequence email:', blockers.join('; '));
    return { ok: false, reason: 'funnel-not-ready' };
  }
  return sendEmail({ to: a.to, ...template({ ...a, to: a.to }), extraHeaders: unsubscribeHeaders(a.to), idempotencyKey: a.idempotencyKey });
}

export const sendScanFollowup = (a) => sendSequenceEmail(a, scanFollowupEmail);
export const sendScanRescan = (a) => sendSequenceEmail(a, scanRescanEmail);
export const sendAbandonedCheckoutReminder = (a) => sendSequenceEmail(a, abandonedCheckoutEmail);
export const sendAuditUpsell = (a) => sendSequenceEmail(a, auditUpsellEmail);
export const sendPageReportUpsell = (a) => sendSequenceEmail(a, pageReportUpsellEmail);

/** Requested scan results: transactional, so not gated by FUNNEL_EMAIL_LIVE, but still needs the footer config. */
export async function sendScanResultsEmail(a) {
  if (funnelSendBlockers().length) return { ok: false, reason: 'funnel-not-ready' };
  return sendEmail({ to: a.to, ...scanResultsEmail(a), extraHeaders: unsubscribeHeaders(a.to) });
}

/** Why an outreach recipient got the email (they did not sign up). */
export function outreachReason(hostname) {
  const site = hostname ? String(hostname) : 'your website';
  return `You are getting this because ${site} was scanned with AccessBell's free checker and this address is listed on that site.`;
}

/**
 * Owner-approved outreach (one email per prospect). Same footer, headers and
 * readiness gate as the funnel. The caller checks suppression first.
 */
export async function sendOutreachEmail({ to, subject, body, key, hostname }) {
  if (funnelSendBlockers().length) return { ok: false, reason: 'funnel-not-ready' };
  return sendEmail({
    to,
    subject,
    text: String(body).trimEnd() + marketingFooter(to, process.env, outreachReason(hostname)),
    extraHeaders: unsubscribeHeaders(to),
    idempotencyKey: key ? `outreach/${key}` : undefined,
  });
}

// Funnel agent: dry-run gating, exclusion rules, and one-send-per-trigger
// dedupe. These tests never touch the database, Resend, or Stripe: every
// runner takes its dependencies injected.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  funnelLive,
  isExcludedHostname,
  scanFollowupCandidates,
  isAbandonedCheckout,
  upsellCandidates,
  runScanFollowups,
  runUpsells,
  abandonedReminderSender,
} from '../server/app/funnel.js';
import { pageReportUpsellEmail, auditUpsellEmail } from '../server/app/email-sequences.js';

test('dry-run is the default; only FUNNEL_EMAIL_LIVE=1 enables live sends', () => {
  assert.equal(funnelLive({}), false);
  assert.equal(funnelLive({ FUNNEL_EMAIL_LIVE: '0' }), false);
  assert.equal(funnelLive({ FUNNEL_EMAIL_LIVE: 'yes' }), false);
  assert.equal(funnelLive({ FUNNEL_EMAIL_LIVE: '1' }), true);
});

test("David's own and employer hostnames are always excluded", () => {
  assert.equal(isExcludedHostname('ramenearyou.com'), true);
  assert.equal(isExcludedHostname('www.ramenearyou.com'), true);
  assert.equal(isExcludedHostname('RAMENEARYOU.COM'), true);
  assert.equal(isExcludedHostname('shopsigvaris.com'), true);
  assert.equal(isExcludedHostname('www.shopsigvaris.com'), true);
  assert.equal(isExcludedHostname('example.com'), false);
  assert.equal(isExcludedHostname(''), false);
});

const baseLead = { id: 1, email: 'Buyer@Example.com', hostname: 'example.com', url: 'https://example.com/', followup_sent_at: null };

test('scan follow-up candidates drop sent, paid, suppressed, excluded, and email-less leads', () => {
  const leads = [
    baseLead,
    { ...baseLead, id: 2, followup_sent_at: '2026-10-29T00:00:00Z' },
    { ...baseLead, id: 3, email: 'paid@example.com' },
    { ...baseLead, id: 4, email: 'bounced@example.com' },
    { ...baseLead, id: 5, hostname: 'ramenearyou.com' },
    { ...baseLead, id: 6, hostname: 'shopsigvaris.com' },
    { ...baseLead, id: 7, email: '' },
    { ...baseLead, id: 8, email: null },
  ];
  const out = scanFollowupCandidates({
    leads,
    paidEmails: ['PAID@example.com'],
    suppressedEmails: ['bounced@example.com'],
  });
  assert.deepEqual(out.map((l) => l.id), [1]);
});

test('scan follow-up dry-run logs but never sends or marks', async () => {
  let sends = 0;
  let marks = 0;
  const res = await runScanFollowups({
    candidates: [baseLead],
    sendScanFollowup: async () => { sends++; return { ok: true }; },
    markFollowupSent: async () => { marks++; },
    live: false,
  });
  assert.equal(sends, 0);
  assert.equal(marks, 0);
  assert.equal(res.sent, 0);
  assert.deepEqual(res.log, [{
    to: 'buyer@example.com',
    template: 'scanFollowupEmail',
    trigger: 'scan_leads:1',
    hostname: 'example.com',
    action: 'dry-run',
  }]);
});

test('scan follow-up live sends once, marks once, and a re-run skips the marked lead', async () => {
  let sends = 0;
  const marked = new Set();
  const run = (candidates) => runScanFollowups({
    candidates,
    sendScanFollowup: async () => { sends++; return { ok: true }; },
    markFollowupSent: async (id) => { marked.add(id); },
    live: true,
  });
  const first = await run([baseLead]);
  assert.equal(first.sent, 1);
  assert.equal(sends, 1);
  assert.ok(marked.has(1));
  const second = await run(scanFollowupCandidates({
    leads: [{ ...baseLead, followup_sent_at: '2026-10-30T00:00:00Z' }],
    paidEmails: [],
    suppressedEmails: [],
  }));
  assert.equal(second.sent, 0);
  assert.equal(sends, 1);
});

test('abandoned-checkout predicate: pending, unreminded, older than 24h only', () => {
  const now = new Date('2026-10-30T12:00:00Z');
  assert.equal(isAbandonedCheckout({ status: 'pending', reminder_sent_at: null, created_at: '2026-10-29T11:00:00Z' }, now), true);
  assert.equal(isAbandonedCheckout({ status: 'pending', reminder_sent_at: null, created_at: '2026-10-30T11:00:00Z' }, now), false);
  assert.equal(isAbandonedCheckout({ status: 'pending', reminder_sent_at: '2026-10-30T00:00:00Z', created_at: '2026-10-28T00:00:00Z' }, now), false);
  assert.equal(isAbandonedCheckout({ status: 'paid', reminder_sent_at: null, created_at: '2026-10-28T00:00:00Z' }, now), false);
});

test('abandoned reminder wrapper: dry-run logs with purchase id, excluded and suppressed never send', async () => {
  const log = [];
  let realSends = 0;
  const drySender = abandonedReminderSender({
    live: false,
    realSend: async () => { realSends++; return { ok: true }; },
    suppressedEmails: ['bounced@example.com'],
    log,
  });
  const a = await drySender({ to: 'buyer@example.com', product: 'page_report', hostname: 'example.com', checkoutUrl: 'https://x', purchaseId: 'abc' });
  assert.equal(a.ok, false);
  assert.equal(realSends, 0);
  assert.deepEqual(log, [{
    to: 'buyer@example.com',
    template: 'abandonedCheckoutEmail',
    trigger: 'one_time_purchases:abc',
    hostname: 'example.com',
    action: 'dry-run',
  }]);
  const b = await drySender({ to: 'me@ramenearyou.com', product: 'page_report', hostname: 'ramenearyou.com', checkoutUrl: 'https://x', purchaseId: 'def' });
  assert.equal(b.ok, false);
  assert.equal(log[1].action, 'skipped');
  assert.equal(log[1].reason, 'excluded-hostname');
  const c = await drySender({ to: 'bounced@example.com', product: 'page_report', hostname: 'example.com', checkoutUrl: 'https://x', purchaseId: 'ghi' });
  assert.equal(c.ok, false);
  assert.equal(log[2].reason, 'suppressed');

  const liveLog = [];
  const liveSender = abandonedReminderSender({
    live: true,
    realSend: async () => { realSends++; return { ok: true }; },
    suppressedEmails: [],
    log: liveLog,
  });
  const d = await liveSender({ to: 'me@ramenearyou.com', product: 'page_report', hostname: 'ramenearyou.com', checkoutUrl: 'https://x', purchaseId: 'def' });
  assert.equal(d.ok, false);
  assert.equal(realSends, 0);
  assert.equal(liveLog[0].action, 'skipped');
});

test('upsell candidates: per-product delay, paid only, one per purchase', () => {
  const now = new Date('2026-10-30T12:00:00Z');
  const rows = [
    { id: 'p1', product: 'page_report', status: 'paid', paid_at: '2026-10-27T11:00:00Z', upsell_sent_at: null },
    { id: 'p2', product: 'page_report', status: 'paid', paid_at: '2026-10-29T11:00:00Z', upsell_sent_at: null },
    { id: 'a1', product: 'domain_audit', status: 'paid', paid_at: '2026-10-23T11:00:00Z', upsell_sent_at: null },
    { id: 'a2', product: 'domain_audit', status: 'paid', paid_at: '2026-10-28T11:00:00Z', upsell_sent_at: null },
    { id: 's1', product: 'page_report', status: 'paid', paid_at: '2026-10-20T11:00:00Z', upsell_sent_at: '2026-10-25T00:00:00Z' },
    { id: 'u1', product: 'page_report', status: 'pending', paid_at: null, upsell_sent_at: null },
  ];
  const out = upsellCandidates({ purchases: rows, now });
  assert.deepEqual(out.map((r) => [r.id, r.upsellKind]), [
    ['p1', 'page_report_upsell'],
    ['a1', 'domain_audit_upsell'],
  ]);
});

test('upsell run: dry-run logs both kinds and marks nothing; live marks once', async () => {
  const candidates = [
    { id: 'p1', product: 'page_report', email: 'page@example.com', hostname: 'example.com', token: 'a'.repeat(32), upsellKind: 'page_report_upsell' },
    { id: 'a1', product: 'domain_audit', email: 'audit@example.com', hostname: 'example.org', token: 'b'.repeat(32), upsellKind: 'domain_audit_upsell' },
  ];
  let pageSends = 0;
  let auditSends = 0;
  let marks = 0;
  const dry = await runUpsells({
    candidates,
    sendPageUpsell: async () => { pageSends++; return { ok: true }; },
    sendAuditUpsell: async () => { auditSends++; return { ok: true }; },
    markUpsellSent: async () => { marks++; },
    live: false,
  });
  assert.equal(pageSends, 0);
  assert.equal(auditSends, 0);
  assert.equal(marks, 0);
  assert.deepEqual(dry.log.map((e) => [e.template, e.action]), [
    ['pageReportUpsellEmail', 'dry-run'],
    ['auditUpsellEmail', 'dry-run'],
  ]);
  const live = await runUpsells({
    candidates,
    sendPageUpsell: async () => { pageSends++; return { ok: true }; },
    sendAuditUpsell: async () => { auditSends++; return { ok: true }; },
    markUpsellSent: async () => { marks++; },
    live: true,
  });
  assert.equal(live.sent, 2);
  assert.equal(pageSends, 1);
  assert.equal(auditSends, 1);
  assert.equal(marks, 2);
});

test('upsell templates carry an opt-out line and the right offer', () => {
  const page = pageReportUpsellEmail({ hostname: 'example.com', reportUrl: 'https://www.accessbell.co/report?token=x' });
  assert.match(page.text, /\$79/);
  assert.match(page.text, /opt out/);
  assert.match(page.text, /Domain Audit/);
  const audit = auditUpsellEmail({ hostname: 'example.org', reportUrl: 'https://www.accessbell.co/report?token=y' });
  assert.match(audit.text, /\$29/);
  assert.match(audit.text, /opt out/);
});

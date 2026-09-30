// Legal Evidence Package: renders a compliance record exactly as issued, for
// printing to PDF, and bundles it with CSV files into a ZIP. The record's text
// (record.json) is what the SHA-256 fingerprint was taken from.
import { api, boot, el, qs, fmtDate } from './core.js';
import { zipFiles } from './zip.js';
import { activityText, actionLabel, scroller } from './vault.js';

await boot();
const $ = (s) => document.querySelector(s);
const IMPACT = { critical: 'Critical', serious: 'Serious', moderate: 'Moderate', minor: 'Minor' };
const TYPE = { resolved: 'Fixed', detected: 'New issue detected' };
const fmtDay = (v) => new Date(`${v}T00:00:00Z`).toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' });
const n = (v) => (v === null || v === undefined ? '-' : Number(v).toLocaleString());

function table(caption, head, rows, empty) {
  if (!rows.length) return el('p', { class: 'muted', text: empty });
  return scroller(caption, [
    el('table', { class: 'data-table record-table' }, [
      el('caption', { class: 'visually-hidden', text: caption }),
      el('thead', {}, [el('tr', {}, head.map((h) => el('th', { scope: 'col', text: h })))]),
      el('tbody', {}, rows.map((r) => el('tr', {}, r.map((c) => el('td', {}, [c ?? '-']))))),
    ]),
  ]);
}

const section = (title, ...children) => el('section', { class: 'record-section' }, [el('h2', { text: title }), ...children]);
const facts = (pairs) =>
  el(
    'dl',
    { class: 'record-facts' },
    pairs.flatMap(([k, v]) => [el('dt', { text: k }), el('dd', {}, [v ?? '-'])]),
  );

function render(r, sha, verifyUrl) {
  const s = r.status;
  const trend = r.trend.map((t) => [t.month, n(t.scans), t.averageScore === null ? '-' : `${t.averageScore}/100`, n(t.averageIssues)]);
  const events = r.remediation.events.map((e) => [
    fmtDate(e.confirmedAt, true),
    TYPE[e.type] || e.type,
    e.title,
    e.impact ? IMPACT[e.impact] || e.impact : '-',
    e.wcag.join(', ') || '-',
    `${e.page} (${e.device})`,
    e.lastSeenAt ? fmtDate(e.lastSeenAt, true) : '-',
  ]);
  $('[data-record]').replaceChildren(
    el('header', { class: 'record-head' }, [
      el('p', { class: 'record-kicker', text: 'Accessibility Compliance Record' }),
      el('h1', { id: 'record-title', text: r.domain.hostname }),
      el('p', { class: 'record-period', text: `${fmtDay(r.period.from)} to ${fmtDay(r.period.to)}` }),
      facts([
        ['Organization', r.organization],
        ['Website', r.domain.baseUrl],
        ['Issued', fmtDate(r.generatedAt, true)],
        ['Issued by', r.generatedBy],
        ['Record ID', el('code', { text: r.recordId })],
        ['SHA-256 fingerprint', el('code', { class: 'record-hash', text: sha })],
        ['Verify this record', el('a', { href: verifyUrl, text: verifyUrl })],
      ]),
    ]),
    section(
      '1. Testing Program',
      facts([
        ['Standard tested', `WCAG ${r.standard.wcagVersion} Level ${r.standard.wcagLevel}`],
        ['Devices', r.standard.devices.join(', ')],
        ['Subdomains included', r.standard.includeSubdomains ? 'Yes' : 'No'],
        ['Scheduled monitoring', r.monitoring.schedule],
        ['Pages monitored today', n(r.monitoring.monitoredPages)],
        ['Domain added to AccessBell', fmtDate(r.domain.addedAt)],
      ]),
    ),
    section(
      '2. Scans in This Period',
      facts([
        ['Total scans', n(r.scans.total)],
        ['Scheduled scans', n(r.scans.scheduled)],
        ['Scans started by a person', n(r.scans.manual)],
        ['Scans that could not complete', n(r.scans.failed)],
        ['Pages scanned', n(r.scans.pagesScanned)],
        ['First scan', r.scans.firstScanAt ? fmtDate(r.scans.firstScanAt, true) : '-'],
        ['Last scan', r.scans.lastScanAt ? fmtDate(r.scans.lastScanAt, true) : '-'],
      ]),
      el('h3', { text: 'Monthly results' }),
      table('Monthly scan results', ['Month', 'Scans', 'Average score', 'Average issues per scan'], trend, 'No scans ran in this period.'),
    ),
    section(
      '3. Progress',
      table(
        'Status at the start and end of the period',
        ['Measure', 'Start of period', 'End of period'],
        [
          ['Average score', s.start.averageScore === null ? '-' : `${s.start.averageScore}/100`, s.end.averageScore === null ? '-' : `${s.end.averageScore}/100`],
          ['Open issues (elements)', n(s.start.openIssues), n(s.end.openIssues)],
          ['Pages with results', n(s.start.pagesScanned), n(s.end.pagesScanned)],
        ],
        '',
      ),
    ),
    section(
      '4. Remediation Log',
      el('p', {
        text: `${n(r.remediation.resolved)} issues confirmed fixed and ${n(r.remediation.detected)} new issues detected between consecutive scans of a page. "Fixed" means the issue was found in one scan and no longer found in the next scan of the same page and device.${r.remediation.truncated ? ' This period has more events than one record holds; choose a shorter period to see them all.' : ''}`,
      }),
      table('Remediation events', ['Confirmed', 'Event', 'Issue', 'Severity', 'WCAG', 'Page', 'Last seen before'], events, 'No changes between scans in this period.'),
    ),
    section(
      '5. Changes and Remediation Notes',
      table(
        'Changes and notes',
        ['Date', 'Change', 'Details', 'By'],
        r.activity.map((a) => [a.date, actionLabel(a.action), activityText({ ...a, detail: a.detail }), a.by]),
        'No changes or notes were logged in this period.',
      ),
    ),
    section(
      '6. Fixes Applied With AccessBellFix',
      table(
        'AccessBellFix fixes',
        ['Added', 'Type', 'Element', 'Value', 'Status', 'By'],
        r.fixes.map((f) => [fmtDate(f.addedAt), f.kind, f.selector, f.value, f.enabled ? 'On' : 'Off', f.by]),
        'No AccessBellFix fixes were in place.',
      ),
    ),
    section(
      '7. Accessibility Statement',
      r.statement
        ? facts([
            ['Organization', r.statement.organization],
            ['Stated conformance', r.statement.status === 'conformant' ? 'Fully conformant' : 'Partially conformant'],
            ['Contact for accessibility feedback', r.statement.contact],
            ['Last edited', r.statement.updatedAt ? fmtDate(r.statement.updatedAt, true) : '-'],
            ['Public address', r.statement.url ? `${location.origin}${r.statement.url}` : '-'],
          ])
        : el('p', { class: 'muted', text: 'No accessibility statement was published in AccessBell.' }),
    ),
    section(
      '8. Open Issues at the End of the Period',
      table(
        'Open issues',
        ['Issue', 'Severity', 'WCAG', 'Pages', 'Elements'],
        r.openIssues.map((o) => [o.title, o.impact ? IMPACT[o.impact] || o.impact : '-', o.wcag.join(', ') || '-', n(o.pages), n(o.elements)]),
        'No open issues were detected in the latest scans.',
      ),
    ),
    section(
      '9. Pages and Latest Results',
      table(
        'Pages',
        ['Page', 'Device', 'Score', 'Issues', 'Last scanned'],
        r.pages.map((p) => [p.page, p.device, p.score === null ? '-' : `${p.score}/100`, n(p.issues), fmtDate(p.lastScanAt, true)]),
        'No pages had been scanned by the end of the period.',
      ),
    ),
    el('footer', { class: 'record-foot' }, [el('h2', { text: 'About This Record' }), el('p', { text: r.disclaimer }), el('p', { text: `Record ${r.recordId}. SHA-256 ${sha}. Verify at ${verifyUrl}` })]),
  );
}

// ---------- ZIP bundle ----------

const cell = (v) => {
  let t = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`; // never let a spreadsheet run a cell as a formula
  return /[",\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};
const csv = (head, rows) => [head, ...rows].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';

function bundle(r, body, sha, verifyUrl) {
  const readme = [
    'AccessBell Legal Evidence Package',
    '',
    `Website: ${r.domain.hostname}`,
    `Period: ${r.period.from} to ${r.period.to}`,
    `Issued: ${r.generatedAt} by ${r.generatedBy || 'unknown'}`,
    `Record ID: ${r.recordId}`,
    `SHA-256 fingerprint of record.json: ${sha}`,
    '',
    'Files',
    '  record.json            The complete record, exactly as issued. The fingerprint is taken from this file.',
    '  remediation-log.csv    Issues fixed and new issues detected between scans.',
    '  changes-and-notes.csv  Changes made in AccessBell and remediation notes.',
    '  monthly-results.csv    Scans, average score and average issues per month.',
    '  open-issues.csv        Issues still detected at the end of the period.',
    '  pages.csv              Each page and its latest result.',
    '  accessbellfix.csv      Fixes applied with AccessBellFix.',
    '',
    'To verify this record has not been altered',
    `  1. Open ${verifyUrl}`,
    '  2. Or compute the SHA-256 of record.json (for example: shasum -a 256 record.json) and compare it with the fingerprint above.',
    '',
    r.disclaimer,
    '',
  ].join('\r\n');
  return zipFiles([
    { name: 'README.txt', text: readme },
    { name: 'record.json', text: body },
    {
      name: 'remediation-log.csv',
      text: csv(
        ['confirmed_at', 'event', 'issue', 'rule', 'severity', 'wcag', 'page', 'device', 'elements', 'last_seen_at', 'scan_id', 'scan_trigger'],
        r.remediation.events.map((e) => [e.confirmedAt, e.type, e.title, e.rule, e.impact, e.wcag.join(' '), e.page, e.device, e.elements, e.lastSeenAt, e.scanId, e.scanTrigger]),
      ),
    },
    { name: 'changes-and-notes.csv', text: csv(['date', 'logged_at', 'change', 'details', 'by'], r.activity.map((a) => [a.date, a.at, actionLabel(a.action), activityText(a), a.by])) },
    { name: 'monthly-results.csv', text: csv(['month', 'scans', 'average_score', 'average_issues'], r.trend.map((t) => [t.month, t.scans, t.averageScore, t.averageIssues])) },
    { name: 'open-issues.csv', text: csv(['issue', 'rule', 'severity', 'wcag', 'pages', 'elements'], r.openIssues.map((o) => [o.title, o.rule, o.impact, o.wcag.join(' '), o.pages, o.elements])) },
    { name: 'pages.csv', text: csv(['page', 'device', 'score', 'issues', 'last_scanned'], r.pages.map((p) => [p.page, p.device, p.score, p.issues, p.lastScanAt])) },
    { name: 'accessbellfix.csv', text: csv(['added', 'type', 'element', 'value', 'enabled', 'by'], r.fixes.map((f) => [f.addedAt, f.kind, f.selector, f.value, f.enabled, f.by])) },
  ]);
}

try {
  const { body, sha256 } = await api(`record?id=${encodeURIComponent(qs('id') || '')}`);
  const r = JSON.parse(body);
  const verifyUrl = `${location.origin}/verify?id=${encodeURIComponent(r.recordId)}&sha256=${sha256}`;
  document.title = `Evidence package: ${r.domain.hostname} | AccessBell`;
  const domainId = new URLSearchParams(location.search).get('domain');
  $('[data-crumb-host]').textContent = r.domain.hostname;
  if (domainId) $('[data-back]').setAttribute('href', `/app/domain?id=${encodeURIComponent(domainId)}&tab=vault`);
  render(r, sha256, verifyUrl);
  $('[data-record-actions]').hidden = false;
  $('[data-record-print]').addEventListener('click', () => window.print());
  $('[data-record-zip]').addEventListener('click', () => {
    const blob = bundle(r, body, sha256, verifyUrl);
    const a = el('a', { href: URL.createObjectURL(blob), download: `accessbell-evidence-${r.domain.hostname}-${r.period.from}-to-${r.period.to}.zip` });
    document.body.append(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1000);
  });
} catch (err) {
  $('[data-progress]').textContent = err.message;
}

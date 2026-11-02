// One account's analytics (site admins only). Data from GET admin/account,
// which returns 401 signed out and 403 for anyone not in ADMIN_EMAILS.
import { api, boot, el, fmtDate, setStatus, qs } from './core.js';

const me = await boot();
const $ = (s) => document.querySelector(s);
const status = $('[data-ac-status]');
const NT = 'not tracked';
const date = (v, t = true) => (v === NT ? NT : v ? fmtDate(v, t) : '-');
const td = (v, num) => el('td', { class: num ? 'num' : undefined, text: v == null || v === '' ? '-' : String(v) });
const table = (caption, head, rows, empty) =>
  rows.length
    ? el('div', { class: 'table-wrap', role: 'region', tabindex: '0', 'aria-label': `${caption} (table)` }, [
        el('table', { class: 'data-table' }, [
          el('caption', { class: 'visually-hidden', text: caption }),
          el('thead', {}, [el('tr', {}, head.map((h) => el('th', { scope: 'col', text: h })))]),
          el('tbody', {}, rows),
        ]),
      ])
    : el('p', { class: 'muted', text: empty });
const ND = 'no data yet';
const secs = (ms) => (ms == null ? '-' : ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`);
const welcomeText = (w) =>
  !w ? ND : w.status === 'sent' ? `Sent ${date(w.sentAt)}${w.resendId ? ` (Resend ${w.resendId})` : ''}` : `Failed ${date(w.updatedAt)}: ${w.error || 'unknown error'}`;
const dl = (pairs) => el('dl', { class: 'ac-list' }, pairs.flatMap(([k, v]) => [el('dt', { text: k }), el('dd', { text: v == null ? '-' : String(v) })]));

function render(d) {
  const p = d.profile;
  $('[data-ac-title]').textContent = p.email || p.name;
  $('[data-ac-flags]').replaceChildren(
    d.flags.length
      ? el('ul', { class: 'ac-flags' }, d.flags.map((f) => el('li', { 'data-level': f.level }, [el('strong', { text: f.level === 'error' ? 'Problem: ' : 'Check: ' }), f.text])))
      : el('p', { text: 'No problems detected from the recorded data.' }),
  );
  $('[data-ac-profile]').replaceChildren(dl([
    ['Email', p.email], ['Signed up', date(p.signedUpAt)], ['Last sign-in', date(p.lastSignInAt)], ['Last activity', date(p.lastActivityAt)],
    ['Plan / status', `${p.status}${p.interval ? ` (${p.interval})` : ''}`], ['Stripe subscription linked', p.stripeLinked ? 'Yes' : 'No'],
    ['Trial ends', date(p.trialEndsAt)], ['Current period ends', date(p.currentPeriodEnd)], ['Domain quota', p.domainQuota],
    ['Welcome email', welcomeText(d.welcomeEmail)],
  ]));
  $('[data-ac-team]').replaceChildren(table('Team members', ['Email', 'Role', 'Added'], d.members.map((m) => el('tr', {}, [td(m.email), td(m.role), td(date(m.addedAt, false))])), 'No members.'));
  $('[data-ac-domains]').replaceChildren(table('Domains', ['Domain', 'Standard', 'Devices', 'Pages (monitored)', 'Overdue 36h+', 'Last scan', 'Last status', 'Fixes', 'Snippet last called'],
    d.domains.map((x) => el('tr', {}, [
      td(x.hostname), td(`WCAG ${x.settings.wcagVersion} ${x.settings.wcagLevel}${x.settings.includeSubdomains ? ', subdomains' : ''}${x.settings.customHeaders ? `, ${x.settings.customHeaders} custom headers` : ''}`),
      td((x.settings.devices || []).join(', ')), td(`${x.pages} (${x.monitoredPages})`), td(x.overduePages), td(date(x.lastScanAt)), td(x.lastScanStatus || 'never scanned'),
      td(x.fixes), td(x.snippetSeenAt ? date(x.snippetSeenAt) : 'never'),
    ])), 'No domains added.'));
  $('[data-ac-daily]').replaceChildren(
    el('h3', { text: 'Regression alert emails' }),
    table('Alert emails', ['When', 'Page', 'Recipients', 'Status', 'Resend id / error'],
      d.alertEmails.map((e) => el('tr', { 'data-status': e.status }, [td(date(e.createdAt)), el('td', { class: 'url', text: e.pageUrl || '-' }), td(e.recipients, 1), td(e.status), td(e.resendId || e.error)])),
      ND),
    el('h3', { text: 'Scheduled rescans per day' }),
    table('Daily rescans', ['Day', 'Pages', 'Scans', 'Done', 'Failed', 'Issues found'], d.dailyRescans.map((r) => el('tr', {}, [td(r.day), td(r.pages, 1), td(r.scans, 1), td(r.done, 1), td(r.failed, 1), td(r.issues, 1)])), 'No scheduled rescans in the last 30 days.'),
  );
  $('[data-ac-scans]').replaceChildren(
    el('h3', { text: 'Scan runs (hung = started 20+ min ago, never finished)' }),
    table('Scan runs', ['Started', 'Kind', 'Trigger', 'Page / domain', 'Pages', 'Status', 'Duration'],
      d.scanRuns.map((r) => el('tr', { 'data-status': r.hung ? 'failed' : r.status }, [
        td(date(r.startedAt)), td(r.kind), td(r.trigger), el('td', { class: 'url', text: r.url || r.hostname || '-' }),
        td(r.kind === 'domain' ? `${r.pagesScanned ?? 0} of ${r.pages}` : r.pages, 1), td(r.status), td(secs(r.durationMs), 1),
      ])),
      ND),
    el('h3', { text: 'Recent scans' }),
    table('Recent scans', ['When', 'Page', 'Device', 'Trigger', 'Status', 'Score', 'Issues', 'Duration', 'Error'],
      d.scans.map((s) => el('tr', { 'data-status': s.status }, [td(date(s.createdAt)), el('td', { class: 'url', text: s.url }), td(s.device), td(s.trigger), td(s.status), td(s.score, 1), td(s.issues, 1), td(s.durationMs == null ? ND : secs(s.durationMs), 1), td(s.error)])),
      'No scans yet.'),
  );
  $('[data-ac-fixes]').replaceChildren(
    el('h3', { text: 'Snippet errors (last 30 days)' }),
    table('Snippet errors', ['Domain', 'Error code', 'Count', 'Last seen'], d.snippetErrors.map((e) => el('tr', {}, [td(e.hostname), td(e.code), td(e.count, 1), td(date(e.lastAt))])), ND),
    el('p', { class: 'muted', text: '"Snippet last called" under Domains shows whether it is installed and calling in.' }),
    el('h3', { text: 'Fixes' }),
    table('Fixes', ['Domain', 'Kind', 'Enabled', 'Added'], d.fixes.map((f) => el('tr', {}, [td(f.hostname), td(f.kind), td(f.enabled ? 'Yes' : 'No'), td(date(f.createdAt, false))])), 'No fixes added.'),
  );
  $('[data-ac-vault]').replaceChildren(table('Vault records', ['Domain', 'Period', 'By', 'Created'], d.vault.map((v) => el('tr', {}, [td(v.hostname), td(`${date(v.from, false)} to ${date(v.to, false)}`), td(v.by), td(date(v.createdAt, false))])), 'No Vault records.'));
  $('[data-ac-activity]').replaceChildren(table('Recent activity', ['When', 'Action', 'Domain', 'By'], d.activity.map((a) => el('tr', {}, [td(date(a.at)), td(a.action), td(a.hostname), td(a.by)])), 'No activity logged.'));
}

if (me && !me.admin) {
  setStatus(status, 'error', 'This page is only for AccessBell site admins.');
} else if (me) {
  setStatus(status, '', 'Loading...');
  try {
    const d = await api(`admin/account?id=${encodeURIComponent(qs('id') || '')}`);
    $('[data-ac-body]').hidden = false;
    render(d);
    setStatus(status, '', '');
  } catch (err) {
    setStatus(status, 'error', err.message || 'Could not load this account.');
  }
}

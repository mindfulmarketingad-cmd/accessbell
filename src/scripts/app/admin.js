// Admin analytics (site admins only). All data comes from GET admin/overview,
// which returns 401 when signed out and 403 for anyone not in ADMIN_EMAILS.
import { api, boot, el, fmtDate, setStatus } from './core.js';

const me = await boot();
const $ = (s) => document.querySelector(s);
const status = $('[data-ad-status]');
const money = (c) => (c == null ? 'n/a' : `$${(c / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`);
const pct = (v) => (v == null ? '-' : `${v}%`);
const date = (v) => (v ? fmtDate(v) : '-');
let data = null;

const table = (caption, head, body) =>
  el('div', { class: 'table-wrap', role: 'region', tabindex: '0', 'aria-label': `${caption} (table)` }, [
    el('table', { class: 'data-table' }, [
      el('caption', { class: 'visually-hidden', text: caption }),
      el('thead', {}, [el('tr', {}, head.map((h) => el('th', { scope: 'col', class: h.num ? 'num' : undefined, text: h.label })))]),
      el('tbody', {}, body),
    ]),
  ]);
const td = (text, num) => el('td', { class: num ? 'num' : undefined, text: String(text) });

function render() {
  const s = data.summary;
  const tiles = [
    [s.totalAccounts, 'Total accounts'],
    [s.trialing, 'Trialing'],
    [s.activePaid, 'Active paid'],
    [money(s.mrrCents), s.mrrError ? `MRR (${s.mrrError})` : 'MRR, linked AccessBell subscriptions'],
    [s.pastDue + s.canceled, 'Past due or canceled'],
    [data.scanLeads.last30d, 'Scan leads, 30 days'],
    [money(s.oneTime30d.cents), `One-time sales, 30 days (${s.oneTime30d.purchases})`],
  ];
  $('[data-ad-summary]').replaceChildren(...tiles.map(([v, l]) => el('li', {}, [el('strong', { text: String(v) }), el('span', { text: l })])));

  const f = data.funnel30d;
  $('[data-ad-funnel]').replaceChildren(
    table('Funnel, last 30 days', [{ label: 'Step' }, { label: 'Count', num: true }, { label: 'Conversion', num: true }], [
      el('tr', {}, [el('th', { scope: 'row', text: 'Free scans (domains)' }), td(`${f.freeScans} (${f.freeDomains})`, true), td('-', true)]),
      el('tr', {}, [el('th', { scope: 'row', text: 'Scan leads (emails left)' }), td(f.leads, true), td('-', true)]),
      el('tr', {}, [el('th', { scope: 'row', text: 'Sign-ups' }), td(f.signups, true), td(`${pct(f.scanToSignupPct)} of scanned domains`, true)]),
      el('tr', {}, [el('th', { scope: 'row', text: 'Started trial or paid' }), td(f.trialsOrPaid, true), td(`${pct(f.signupToTrialPct)} of sign-ups`, true)]),
      el('tr', {}, [el('th', { scope: 'row', text: 'Active paid' }), td(f.paid, true), td(`${pct(f.trialToPaidPct)} of trials`, true)]),
    ]),
  );

  $('[data-ad-free]').replaceChildren(
    data.freeScansPerDay.length
      ? table('Free scans per day', [{ label: 'Day' }, { label: 'Scans', num: true }, { label: 'Domains', num: true }],
          data.freeScansPerDay.map((d) => el('tr', {}, [el('th', { scope: 'row', text: d.day }), td(d.scans, true), td(d.domains, true)])))
      : el('p', { class: 'muted', text: 'No free scans in the last 30 days.' }),
  );

  $('[data-ad-accounts]').replaceChildren(
    data.accounts.length
      ? table('Accounts', [
          { label: 'Email' }, { label: 'Signed up' }, { label: 'Plan' }, { label: 'Trial ends' }, { label: 'Domains', num: true },
          { label: 'Monitored pages', num: true }, { label: 'Scans', num: true }, { label: 'Scans, 30 days', num: true },
          { label: 'Rescans', num: true }, { label: 'Last scan' }, { label: 'Last active' }, { label: 'Vault records', num: true }, { label: 'Fixes', num: true },
        ], data.accounts.map((a) => el('tr', {}, [
          el('th', { scope: 'row', text: a.email || a.name }),
          td(date(a.signedUpAt)),
          td(`${a.status}${a.interval ? ` (${a.interval})` : ''}${a.stripeLinked ? '' : a.status === 'none' ? '' : ' - not linked'}`),
          td(date(a.trialEndsAt)),
          td(`${a.domains}/${a.domainQuota}`, true),
          td(a.monitoredPages, true), td(a.scans, true), td(a.scans30d, true), td(a.rescans, true),
          td(date(a.lastScanAt)), td(date(a.lastActiveAt)), td(a.vaultRecords, true), td(a.fixes, true),
        ])))
      : el('p', { class: 'muted', text: 'No accounts yet.' }),
  );
  $('[data-ad-csv]').disabled = !data.accounts.length;
}

$('[data-ad-csv]').addEventListener('click', () => {
  const cols = ['email', 'name', 'signedUpAt', 'status', 'interval', 'stripeLinked', 'trialEndsAt', 'domains', 'domainQuota', 'monitoredPages', 'scans', 'scans30d', 'rescans', 'lastScanAt', 'lastActiveAt', 'vaultRecords', 'fixes'];
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const out = [cols, ...data.accounts.map((a) => cols.map((c) => a[c]))];
  const a = el('a', { href: URL.createObjectURL(new Blob(['\ufeff' + out.map((r) => r.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' })), download: `accessbell-accounts-${new Date().toISOString().slice(0, 10)}.csv` });
  a.click();
});

if (me && !me.admin) {
  setStatus(status, 'error', 'This page is only for AccessBell site admins.');
} else if (me) {
  setStatus(status, '', 'Loading...');
  try {
    data = await api('admin/overview');
    $('[data-ad-body]').hidden = false;
    render();
    setStatus(status, '', `Updated ${fmtDate(data.generatedAt, true)}.`);
  } catch (err) {
    setStatus(status, 'error', err.message || 'Could not load admin analytics.');
  }
}

// Compliance Vault tab: evidence packages, 12 months of scan snapshots, the fix
// log with remediation notes, the accessibility statement and the certificate.
// Loads the first time the tab is shown.
import { api, el, icon, fmtDate, busy, can, setStatus } from './core.js';

const IMPACT = { critical: 'Critical', serious: 'Serious', moderate: 'Moderate', minor: 'Minor' };
const plural = (n, word) => `${n.toLocaleString()} ${word}${n === 1 ? '' : 's'}`;
const today = () => new Date().toISOString().slice(0, 10);
const yearAgo = () => {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() - 1);
  return d.toISOString().slice(0, 10);
};
// Date-only values (YYYY-MM-DD) are shown as that calendar day, whatever the viewer's time zone.
const fmtDay = (v) => new Date(v).toLocaleDateString(undefined, { dateStyle: 'medium', timeZone: 'UTC' });
const monthName = (m) => new Date(`${m}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const ACTION = {
  note: 'Remediation note',
  'fix.added': 'AccessBellFix fix added',
  'fix.enabled': 'AccessBellFix fix turned on',
  'fix.disabled': 'AccessBellFix fix turned off',
  'fix.removed': 'AccessBellFix fix removed',
  'statement.saved': 'Accessibility statement updated',
  'settings.updated': 'Scan settings changed',
  'pages.selected': 'Monitored pages updated',
  'page.added': 'Page added to monitoring',
  'page.monitored': 'Page monitoring turned on',
  'page.unmonitored': 'Page monitoring turned off',
  'page.removed': 'Page removed',
  'domain.added': 'Domain added',
};

export function activityText(a) {
  const d = a.detail || {};
  if (a.action === 'note') return d.page ? `${d.text} (${d.page})` : d.text;
  if (a.action.startsWith('fix.')) return `${d.kind === 'alt' ? 'Alt text' : d.kind === 'lang' ? 'Page language' : 'Accessible name'} "${d.value}" on ${d.selector}`;
  if (a.action === 'settings.updated') return `WCAG ${d.wcagVersion} Level ${d.wcagLevel}, ${(d.devices || []).join(' and ')}`;
  if (a.action === 'pages.selected') return plural(d.monitored || 0, 'page') + ' monitored';
  if (a.action === 'statement.saved') return d.organization ? `${d.organization}, ${d.status === 'conformant' ? 'fully conformant' : 'partially conformant'}` : '';
  return d.page || d.url || '';
}
export const actionLabel = (a) => ACTION[a] || a;

// Set through the style API: style attributes are blocked by the Content Security Policy.
const styled = (node, prop, value) => {
  node.style.setProperty(prop, value);
  return node;
};

/** A table container that scrolls sideways on small screens and can be reached by keyboard. */
export const scroller = (label, children) => el('div', { class: 'table-wrap', tabindex: '0', role: 'region', 'aria-label': label }, children);

const card = ({ iconName, title, text, foot, action }) =>
  el('article', { class: 'vault-card' }, [
    el('span', { class: 'vault-icon', 'aria-hidden': 'true' }, [icon(iconName)]),
    el('h3', { text: title }),
    el('p', { text }),
    foot || null,
    el('div', { class: 'vault-action' }, [action]),
  ]);

export function mountVault({ panel, box, domainId, me, selectTab }) {
  let loaded = false;
  let data;
  const detail = el('section', { class: 'vault-detail', 'aria-live': 'polite' });
  const status = el('p', { class: 'status-line', role: 'status', 'aria-live': 'polite' });

  const openDetail = (title, children) => {
    const h = el('h3', { tabindex: '-1', text: title });
    detail.replaceChildren(el('div', { class: 'vault-detail-head' }, [h, el('button', { class: 'btn btn-sm btn-outline', type: 'button', text: 'Close', on: { click: () => detail.replaceChildren() } })]), ...children);
    h.focus({ preventScroll: true });
    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ---------- Legal evidence package ----------
  function packageForm() {
    const from = el('input', { id: 'vault-from', type: 'date', value: yearAgo(), max: today() });
    const to = el('input', { id: 'vault-to', type: 'date', value: today(), max: today() });
    const go = el('button', { class: 'btn btn-accent', type: 'submit' }, [icon('shield'), 'Generate evidence package']);
    const note = el('p', { class: 'status-line', role: 'status', 'aria-live': 'polite' });
    const form = el('form', { class: 'vault-form', novalidate: true }, [
      el('div', { class: 'vault-dates' }, [
        el('div', { class: 'field' }, [el('label', { for: 'vault-from', text: 'From' }), from]),
        el('div', { class: 'field' }, [el('label', { for: 'vault-to', text: 'To' }), to]),
      ]),
      go,
      note,
    ]);
    form.addEventListener(
      'submit',
      busy(go, note, async (e) => {
        e?.preventDefault?.();
        const r = await api('domain/record', { method: 'POST', body: { id: domainId, from: from.value, to: to.value } });
        location.assign(`/app/record?id=${encodeURIComponent(r.id)}&domain=${encodeURIComponent(domainId)}`);
      }),
    );
    const previous = data.records.length
      ? scroller('Evidence packages already issued', [el('table', { class: 'data-table vault-table' }, [
          el('caption', { class: 'visually-hidden', text: 'Evidence packages already issued' }),
          el('thead', {}, [el('tr', {}, ['Issued', 'Period', 'By', 'Fingerprint', 'Package'].map((t) => el('th', { scope: 'col', text: t })))]),
          el(
            'tbody',
            {},
            data.records.map((r) =>
              el('tr', {}, [
                el('td', { text: fmtDate(r.generatedAt, true) }),
                el('td', { text: `${r.from} to ${r.to}` }),
                el('td', { text: r.generatedBy || '' }),
                el('td', {}, [el('code', { class: 'vault-hash', text: `${r.sha256.slice(0, 12)}...` })]),
                el('td', {}, [el('a', { href: `/app/record?id=${encodeURIComponent(r.id)}&domain=${encodeURIComponent(domainId)}`, text: 'Open' })]),
              ]),
            ),
          ),
        ])])
      : el('p', { class: 'muted', text: 'No packages issued yet.' });
    openDetail('Legal Evidence Package', [
      el('p', { text: 'Choose the period to cover. The package lists every scan, every issue that was fixed and when a scan confirmed it, your remediation notes and changes, open issues and your accessibility statement. It is stored exactly as issued with a unique fingerprint, so anyone you share it with can verify it has not been altered.' }),
      form,
      el('h4', { text: 'Packages already issued' }),
      previous,
    ]);
  }

  // ---------- Historical scan archive ----------
  function archiveView() {
    const max = Math.max(1, ...data.archive.map((m) => m.scans));
    openDetail('Historical Scan Archive', [
      el('p', { text: 'One snapshot per month for the last 12 months: how many scans ran and the average score and issue count they found. Open any page on the Pages tab for its full scan history.' }),
      scroller('Monthly scan snapshots', [
        el('table', { class: 'data-table vault-table' }, [
          el('caption', { class: 'visually-hidden', text: 'Monthly scan snapshots' }),
          el('thead', {}, [el('tr', {}, ['Month', 'Scans', 'Pages scanned', 'Average score', 'Average issues per scan'].map((t) => el('th', { scope: 'col', text: t })))]),
          el(
            'tbody',
            {},
            [...data.archive].reverse().map((m) =>
              el('tr', {}, [
                el('th', { scope: 'row', text: monthName(m.month) }),
                el('td', {}, [styled(el('span', { class: 'vault-bar', 'aria-hidden': 'true' }), '--w', `${Math.round((m.scans / max) * 100)}%`), m.scans.toLocaleString()]),
                el('td', { text: m.pages ? m.pages.toLocaleString() : '-' }),
                el('td', { text: m.averageScore === null ? '-' : `${m.averageScore}/100` }),
                el('td', { text: m.averageIssues === null ? '-' : m.averageIssues.toLocaleString() }),
              ]),
            ),
          ),
        ]),
      ]),
      el('p', {}, [el('button', { class: 'btn btn-outline', type: 'button', on: { click: () => selectTab('pages') } }, [icon('list'), 'Open page scan history'])]),
    ]);
  }

  // ---------- Proof of fixes ----------
  function noteForm() {
    const text = el('textarea', { id: 'vault-note', rows: '3', maxlength: '2000', placeholder: 'For example: Added labels to the checkout form fields and tested with NVDA and a keyboard.' });
    const page = el('input', { id: 'vault-note-page', type: 'text', maxlength: '2048', placeholder: '/checkout', inputmode: 'url' });
    const date = el('input', { id: 'vault-note-date', type: 'date', value: today(), max: today() });
    const save = el('button', { class: 'btn', type: 'submit', text: 'Add to fix log' });
    const note = el('p', { class: 'status-line', role: 'status', 'aria-live': 'polite' });
    const form = el('form', { class: 'vault-form', novalidate: true }, [
      el('div', { class: 'field' }, [el('label', { for: 'vault-note', text: 'What did you change or test?' }), text]),
      el('div', { class: 'vault-dates' }, [
        el('div', { class: 'field' }, [el('label', { for: 'vault-note-page', text: 'Page (optional)' }), page]),
        el('div', { class: 'field' }, [el('label', { for: 'vault-note-date', text: 'Date of the change' }), date]),
      ]),
      save,
      note,
    ]);
    form.addEventListener(
      'submit',
      busy(save, note, async (e) => {
        e?.preventDefault?.();
        await api('domain/note', { method: 'POST', body: { id: domainId, text: text.value, page: page.value, date: date.value } });
        await load();
        fixLogView();
        setStatus(status, 'success', 'Note added to the fix log.');
      }),
    );
    return form;
  }

  function fixLogView() {
    const resolved = data.fixLog.length
      ? scroller('Issues confirmed fixed by a scan', [
          el('table', { class: 'data-table vault-table' }, [
            el('caption', { class: 'visually-hidden', text: 'Issues confirmed fixed by a scan' }),
            el('thead', {}, [el('tr', {}, ['Confirmed fixed', 'Issue', 'Severity', 'WCAG', 'Page', 'Last seen'].map((t) => el('th', { scope: 'col', text: t })))]),
            el(
              'tbody',
              {},
              data.fixLog.map((f) =>
                el('tr', {}, [
                  el('td', { text: fmtDate(f.confirmedAt, true) }),
                  el('td', { text: f.elements ? `${f.title} (${plural(f.elements, 'element')})` : f.title }),
                  el('td', {}, [f.impact ? el('span', { class: `tag tag-${f.impact}`, text: IMPACT[f.impact] || f.impact }) : '-']),
                  el('td', { text: f.wcag.join(', ') || '-' }),
                  el('td', { class: 'vault-url', text: `${f.page.replace(/^https?:\/\//, '')} (${f.device})` }),
                  el('td', { text: f.lastSeenAt ? fmtDate(f.lastSeenAt, true) : '-' }),
                ]),
              ),
            ),
          ]),
        ])
      : el('p', { class: 'muted', text: 'No fixes confirmed yet. When an issue found in one scan is gone in the next scan of that page, it is logged here with both dates.' });
    const activity = data.activity.length
      ? el(
          'ol',
          { class: 'vault-activity' },
          data.activity.map((a) =>
            el('li', {}, [
              el('span', { class: 'vault-when', text: a.action === 'note' && a.happened_on ? fmtDay(a.happened_on) : fmtDate(a.created_at, true) }),
              el('strong', { text: actionLabel(a.action) }),
              el('span', { text: activityText(a) }),
              a.user_email ? el('span', { class: 'muted', text: `by ${a.user_email}` }) : null,
            ]),
          ),
        )
      : el('p', { class: 'muted', text: 'Nothing logged yet.' });
    openDetail('Proof of Fixes', [
      el('p', { text: 'Every issue a scan confirmed as fixed in the last 12 months, with the date it was last seen and the date the next scan confirmed it was gone. Add notes for work done outside AccessBell, such as code changes and manual tests, so your record is complete.' }),
      el('h4', { text: `Confirmed fixes (${data.fixLog.length.toLocaleString()})` }),
      resolved,
      el('h4', { text: 'Add a remediation note' }),
      can(me, 'member') ? noteForm() : el('p', { class: 'muted', text: 'Members, admins and owners can add notes.' }),
      el('h4', { text: 'Changes and notes' }),
      activity,
    ]);
  }

  // ---------- Cards ----------
  function render() {
    const score = data.score;
    const statementCard = data.statement.saved
      ? card({
          iconName: 'doc',
          title: 'Accessibility Statement',
          text: 'Your public statement updates itself with your latest scan date, so it always reflects where your site stands.',
          foot: el('p', { class: 'vault-foot' }, [
            icon('check-circle'),
            `Published${data.statement.updatedAt ? `, last edited ${fmtDate(data.statement.updatedAt)}` : ''}. `,
            data.statement.url ? el('a', { href: data.statement.url, target: '_blank', rel: 'noopener', text: 'View statement (opens in a new tab)' }) : null,
          ]),
          action: el('button', { class: 'btn btn-outline btn-block', type: 'button', on: { click: () => goStatement() } }, [icon('gear'), 'Edit statement']),
        })
      : card({
          iconName: 'doc',
          title: 'Accessibility Statement',
          text: 'A customizable, auto-updating accessibility statement powered by your scan results. Always current and audit-ready.',
          action: el('button', { class: 'btn btn-outline btn-block', type: 'button', on: { click: () => goStatement() } }, [icon('gear'), 'Set up']),
        });
    const pct = score === null ? 0 : score;
    const certAction = data.certificateReady
      ? el('a', { class: 'btn btn-accent btn-block', href: `/app/certificate?id=${encodeURIComponent(domainId)}` }, [icon('download'), 'Download certificate'])
      : el('p', { class: 'vault-foot', text: 'Unlocks when every scanned page scores 100 in its latest scan.' });
    box.replaceChildren(
      ...(data.migrationNeeded ? [el('p', { class: 'notice', text: 'Evidence packages and the fix log are being set up for your account. Please check back shortly or contact support.' })] : []),
      el('div', { class: 'vault-grid' }, [
        card({
          iconName: 'shield',
          title: 'Legal Evidence Package',
          text: 'A complete, dated record of your accessibility work: scan history, fix log, remediation notes, open issues and statement status. Made for audits, legal claims and procurement reviews.',
          foot: el('p', { class: 'vault-foot muted', text: 'Exports as PDF + ZIP bundle, with a verifiable fingerprint' }),
          action: el('button', { class: 'btn btn-outline btn-block', type: 'button', disabled: data.migrationNeeded || undefined, on: { click: packageForm } }, [icon('download'), 'Export Evidence Package']),
        }),
        card({
          iconName: 'chart',
          title: 'Historical Scan Archive',
          text: 'Monthly snapshots of your scans for the last 12 months. Track progress, check past results and keep a consistent compliance history.',
          foot: el('p', { class: 'vault-foot muted', text: `${plural(data.archive.reduce((n, m) => n + m.scans, 0), 'scan')} in the last 12 months` }),
          action: el('button', { class: 'btn btn-outline btn-block', type: 'button', on: { click: archiveView } }, ['View Scan History', icon('chevron')]),
        }),
        card({
          iconName: 'check-circle',
          title: 'Proof of Fixes',
          text: 'Automatically documented evidence of resolved issues, with the dates each one was last seen and confirmed fixed. Your traceable improvement trail.',
          foot: el('p', { class: 'vault-foot muted', text: `${data.fixLog.length.toLocaleString()} ${data.fixLog.length === 1 ? 'fix' : 'fixes'} confirmed in the last 12 months` }),
          action: el('button', { class: 'btn btn-outline btn-block', type: 'button', on: { click: fixLogView } }, ['View Fix Log', icon('chevron')]),
        }),
        statementCard,
        card({
          iconName: 'star',
          title: 'Accessibility Certificate',
          text: 'Reach a score of 100 on every scanned page to download a certificate showing your site passed every automated check. Share your commitment with confidence.',
          foot: el('div', { class: 'vault-meter' }, [
            el('div', { class: 'vault-meter-head' }, [el('span', { text: 'Accessibility score' }), el('strong', { text: score === null ? 'Not scanned' : `${score}/100` })]),
            el('div', { class: 'vault-meter-bar', role: 'img', 'aria-label': score === null ? 'Not scanned yet' : `Score ${score} out of 100` }, [styled(el('i'), 'width', `${pct}%`)]),
          ]),
          action: certAction,
        }),
      ]),
      status,
      detail,
    );
  }

  function goStatement() {
    selectTab('settings');
    const target = document.getElementById('statement');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target?.focus({ preventScroll: true });
  }

  async function load() {
    data = await api(`domain/vault?id=${encodeURIComponent(domainId)}`);
  }

  async function show() {
    if (loaded) return;
    loaded = true;
    try {
      await load();
      render();
    } catch (err) {
      loaded = false;
      box.replaceChildren(el('p', { class: 'notice', text: err.message }));
    }
  }

  // Load the first time the tab is shown, however it is selected.
  if (!panel.hidden) show();
  new MutationObserver(() => {
    if (!panel.hidden) show();
  }).observe(panel, { attributes: true, attributeFilter: ['hidden'] });

  return {
    /** Open the evidence package form, for the Export menu. */
    async openPackage() {
      selectTab('vault');
      await show();
      if (data) packageForm();
    },
  };
}

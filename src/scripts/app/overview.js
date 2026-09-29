// "Your Domains": every domain with its latest result, and adding new ones.
import { api, boot, el, icon, avatar, fmtDate, can, setStatus } from './core.js';
import { scoreRing } from './charts.js';
import { setupTour } from './onboarding.js';
import { setupAddDomain } from './add-domain.js';
import { domainMenu, rescanDomain, relative, nextScheduledScan } from './domain-actions.js';

const me = await boot();
const $ = (s) => document.querySelector(s);
const openButton = $('[data-open-add]');
const listStatus = $('[data-list-status]');
const search = $('[data-domain-search]');
let billing = me.domainList.billing;
const openAdd = setupAddDomain(me, { getBilling: () => billing });

const plural = (n, word) => `${n.toLocaleString()} ${word}${n === 1 ? '' : 's'}`;

function emptyState() {
  const cta = el('button', { class: 'btn', type: 'button' }, [icon('plus'), ' Add Domain']);
  cta.addEventListener('click', () => openAdd());
  return el('div', { class: 'empty-state' }, [
    el('h2', { text: 'Start by adding a domain' }),
    el('p', { text: 'Get started quickly and see how your website measures up against WCAG.' }),
    can(me, 'admin') ? cta : el('p', { class: 'muted', text: 'Ask an admin on your team to add a domain.' }),
  ]);
}

/** Headline for a scanned domain, from its open issues and their worst severity. */
function verdict(d) {
  if (!d.issues) return ['good', 'No automated failures', 'Complete the manual review'];
  if (d.worstImpact === 'critical' || d.worstImpact === 'serious') return ['bad', 'Not conformant', 'Critical issues to fix'];
  return ['warn', 'Not conformant', 'Issues to fix'];
}

async function reload(message) {
  const r = await api('domains');
  me.domainList = r;
  billing = r.billing;
  render();
  if (message) setStatus(listStatus, 'success', message);
}

async function rescan(d) {
  const { total, failed } = await rescanDomain(d.id);
  await reload(failed ? `Scanned ${total - failed} of ${total} pages of ${d.hostname}. ${failed} could not be scanned.` : `Scanned ${plural(total, 'page')} of ${d.hostname}.`);
}

function row(d) {
  const scanned = Boolean(d.last_scanned_at);
  const pagesUrl = `/app/pages?id=${encodeURIComponent(d.id)}`;
  const name = el('div', { class: 'dt-name' }, [
    avatar(d.hostname, 'avatar-lg'),
    el('span', {}, [
      el('a', { href: scanned ? `/app/domain?id=${encodeURIComponent(d.id)}` : pagesUrl, class: 'dt-host', text: d.hostname }),
      el('small', { text: scanned ? plural(d.pages, 'page') : d.discovered_at ? `Pending scan of ${plural(d.pages, 'page')}` : 'Finding pages...' }),
    ]),
  ]);
  const menu = domainMenu(me, { id: d.id, hostname: d.hostname, scanned, monitored: d.monitored }, {
    status: listStatus,
    onRescan: () => rescan(d),
    onAddSubdomain: () => openAdd(`.${d.hostname}`),
    onRemoved: () => reload(`${d.hostname} removed.`),
  });

  if (!scanned) {
    const canSelect = me.subscribed && can(me, 'member');
    return el('tr', { class: 'dt-row dt-pending' }, [
      el('th', { scope: 'row' }, [name]),
      el('td', { colspan: '4', class: 'dt-pending-cell' }, [
        d.failedPages
          ? el('p', { class: 'dt-partial dt-failed' }, [icon('alert'), 'Last scan failed: the pages could not be loaded. Check the site is online, then try again.'])
          : null,
        canSelect
          ? el('a', { class: 'btn', href: pagesUrl }, ['Select pages & Scan ', icon('chevron')])
          : el('span', { class: 'muted', text: 'Not scanned yet' }),
      ]),
      el('td', { class: 'dt-menu' }, [menu]),
    ]);
  }

  const [tone, label, sub] = verdict(d);
  const failedPct = d.scannedPages ? Math.round((d.failedPages / d.scannedPages) * 100) : 0;
  const monitoring = me.subscribed && d.monitored > 0;
  return el('tr', { class: 'dt-row' }, [
    el('th', { scope: 'row' }, [name]),
    el('td', { 'data-label': 'Scan result' }, [
      el('div', { class: 'dt-result' }, [
        scoreRing(d.score, { size: 52, label: false }),
        el('span', {}, [el('strong', { class: `dt-verdict dt-${tone}`, text: label }), el('small', { text: sub })]),
      ]),
      failedPct ? el('p', { class: 'dt-partial' }, [icon('alert'), `Partial scan: ${failedPct}% of pages failed`]) : null,
    ]),
    el('td', { 'data-label': 'Active issues' }, [
      el('a', { class: `count-pill ${d.issues ? 'count-bad' : ''}`, href: `/app/domain?id=${encodeURIComponent(d.id)}&tab=issues`, 'aria-label': `${plural(d.issues, 'active issue')} on ${d.hostname}` }, [icon('alert'), d.issues.toLocaleString()]),
    ]),
    el('td', { 'data-label': 'Resolved issues' }, [
      el('span', { class: `count-pill ${d.resolved ? 'count-ok' : 'count-muted'}`, 'aria-label': plural(d.resolved, 'resolved issue') }, [icon('check'), d.resolved.toLocaleString()]),
    ]),
    el('td', { 'data-label': 'Scan date' }, [
      el('dl', { class: 'dt-dates' }, [
        el('div', {}, [el('dt', { text: 'Last scan:' }), el('dd', {}, [el('time', { datetime: new Date(d.last_scanned_at).toISOString(), title: fmtDate(d.last_scanned_at, true), text: relative(d.last_scanned_at) })])]),
        el('div', {}, [el('dt', { text: 'Next scan:' }), el('dd', { text: monitoring ? fmtDate(nextScheduledScan()) : 'Not scheduled' })]),
      ]),
    ]),
    el('td', { class: 'dt-menu' }, [menu]),
  ]);
}

function render() {
  const { domains } = me.domainList;
  $('[data-domain-count]').textContent = String(domains.length);
  openButton.hidden = !can(me, 'admin');
  $('[data-list-tools]').hidden = domains.length < 2;
  const box = $('[data-domains]');
  if (!domains.length) {
    box.replaceChildren(emptyState());
    return;
  }
  const q = search.value.trim().toLowerCase();
  const shown = domains.filter((d) => !q || d.hostname.includes(q));
  box.replaceChildren(
    el('div', { class: 'domain-table-wrap' }, [
      el('table', { class: 'domain-table' }, [
        el('caption', { class: 'visually-hidden', text: 'Your domains' }),
        el('thead', {}, [
          el('tr', {}, [
            ...['Domain name', 'Scan result', 'Active issues', 'Resolved issues', 'Scan date'].map((h) => el('th', { scope: 'col', text: h })),
            el('th', { scope: 'col' }, [el('span', { class: 'visually-hidden', text: 'Actions' })]),
          ]),
        ]),
        el('tbody', {}, shown.length ? shown.map(row) : [el('tr', {}, [el('td', { colspan: '6', class: 'muted', text: 'No domains match your search.' })])]),
      ]),
    ]),
  );
}

openButton.addEventListener('click', () => openAdd());
search.addEventListener('input', render);
render();
const params = new URLSearchParams(location.search);
if (params.get('add') === '1' && can(me, 'admin')) {
  history.replaceState(null, '', location.pathname);
  openAdd(params.get('sub') ? `.${params.get('sub')}` : '');
}
setupTour(me, 'dashboard', { openAdd: () => openAdd() });
// Back from Found Pages after a scan.
if (params.get('done')) {
  const scanned = Number(params.get('scanned') || 0);
  const failed = Number(params.get('failed') || 0);
  setStatus(
    listStatus,
    failed && !scanned ? 'error' : 'success',
    `Scan complete for ${params.get('done')}: ${plural(scanned, 'page')} scanned${failed ? `, ${failed} could not be scanned` : ''}.`,
  );
  history.replaceState(null, '', location.pathname);
}

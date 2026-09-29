// "Your Domains": every monitored domain, and adding new ones.
import { api, boot, el, icon, avatar, fmtDate, busy, can, setStatus, startCheckout } from './core.js';
import { scoreRing } from './charts.js';
import { setupTour } from './onboarding.js';

const me = await boot();
const $ = (s) => document.querySelector(s);
const dialog = $('[data-add-dialog]');
const form = $('[data-add-domain]');
const status = $('[data-add-status]');
const submit = $('[data-add-submit]');
const openButton = $('[data-open-add]');
let billing = me.domainList.billing;

const kpi = (label, value, note) => el('div', { class: 'kpi' }, [el('span', { text: label }), el('strong', { text: value }), note ? el('small', { text: note }) : null]);

function openAdd() {
  setStatus(status, '', '');
  const blocked = $('[data-add-blocked]');
  const ready = $('[data-add-ready]');
  let reason = null;
  if (!me.subscribed) {
    reason = el('div', {}, [
      el('p', { text: 'Start your 3-day free trial of AccessBell Lite to add domains. $79 per domain per month after the trial.' }),
      me.role === 'owner' ? null : el('p', { class: 'muted', text: 'Ask the account owner to start the subscription.' }),
    ]);
    submit.textContent = 'Start free trial';
    submit.hidden = me.role !== 'owner';
  } else if (billing.domainsUsed >= billing.domainQuota) {
    reason = el('p', {}, [
      `Your plan includes ${billing.domainQuota} domain${billing.domainQuota === 1 ? '' : 's'} and all are in use. `,
      el('a', { href: '/app/billing', text: 'Add a domain to your plan in Billing' }),
      '.',
    ]);
    submit.hidden = true;
  } else {
    submit.textContent = 'Add domain';
    submit.hidden = false;
    $('[data-add-quota]').textContent = `${billing.domainsUsed} of ${billing.domainQuota} domain${billing.domainQuota === 1 ? '' : 's'} in your plan used.`;
  }
  blocked.replaceChildren(...(reason ? [reason] : []));
  blocked.hidden = !reason;
  ready.hidden = Boolean(reason);
  dialog.showModal();
  if (!reason) form.elements.url.focus();
}

document.querySelectorAll('[data-close-add]').forEach((b) => b.addEventListener('click', () => dialog.close()));
form.addEventListener(
  'submit',
  busy(submit, status, async (event) => {
    event.preventDefault();
    if (!me.subscribed) return startCheckout();
    const url = form.elements.url.value.trim();
    if (!url) {
      form.elements.url.focus();
      throw new Error('Enter a website address.');
    }
    const { domain } = await api('domains', { method: 'POST', body: { url } });
    setStatus(status, 'success', `${domain.hostname} added. Opening it now...`);
    location.assign(`/app/domain?id=${domain.id}`);
  }),
);

function emptyState() {
  const cta = el('button', { class: 'btn', type: 'button' }, [icon('plus'), ' Add Domain']);
  cta.addEventListener('click', openAdd);
  return el('div', { class: 'empty-state' }, [
    el('h2', { text: 'Start by adding a domain' }),
    el('p', { text: 'Get started quickly and see how your website measures up against WCAG.' }),
    can(me, 'admin') ? cta : el('p', { class: 'muted', text: 'Ask an admin on your team to add a domain.' }),
  ]);
}

function card(d) {
  const issues = el('span', { class: 'chip chip-issues' }, [icon('alert'), `${d.issues} issue${d.issues === 1 ? '' : 's'}`]);
  return el('li', {}, [
    el('a', { class: 'domain-card', href: `/app/domain?id=${d.id}` }, [
      el('div', { class: 'domain-card-head' }, [avatar(d.hostname, 'avatar-lg'), el('span', {}, [el('strong', { text: d.hostname }), el('small', { text: d.base_url })])]),
      el('div', { class: 'domain-card-body' }, [
        scoreRing(d.score, { size: 64, label: false }),
        el('dl', { class: 'mini-stats' }, [
          el('div', {}, [el('dt', { text: 'Open issues' }), el('dd', {}, [issues])]),
          el('div', {}, [el('dt', { text: 'Monitored URLs' }), el('dd', { text: `${d.monitored} / 25` })]),
          el('div', {}, [el('dt', { text: 'Last scan' }), el('dd', { text: d.last_scanned_at ? fmtDate(d.last_scanned_at) : 'Not yet' })]),
        ]),
      ]),
    ]),
  ]);
}

function render() {
  const { domains } = me.domainList;
  billing = me.domainList.billing;
  $('[data-domain-count]').textContent = String(domains.length);
  openButton.hidden = !can(me, 'admin');
  const box = $('[data-domains]');
  const kpis = $('[data-kpis]');
  if (!domains.length) {
    kpis.hidden = true;
    box.replaceChildren(emptyState());
    return;
  }
  const scored = domains.filter((d) => d.score !== null);
  const avg = scored.length ? Math.round(scored.reduce((n, d) => n + d.score, 0) / scored.length) : null;
  kpis.hidden = false;
  kpis.replaceChildren(
    kpi('Average score', avg === null ? 'n/a' : String(avg), 'Across monitored pages'),
    kpi('Open issues', String(domains.reduce((n, d) => n + d.issues, 0)), 'Failing elements'),
    kpi('Monitored URLs', String(domains.reduce((n, d) => n + d.monitored, 0)), 'Up to 25 per domain'),
    kpi('Domains', `${billing.domainsUsed} / ${billing.domainQuota}`, 'Used / in your plan'),
  );
  box.replaceChildren(el('ul', { class: 'domain-grid', 'aria-label': 'Domains' }, domains.map(card)));
}

openButton.addEventListener('click', openAdd);
render();
if (new URLSearchParams(location.search).get('add') === '1' && can(me, 'admin')) {
  history.replaceState(null, '', location.pathname);
  openAdd();
}
setupTour(me, 'dashboard', { openAdd });

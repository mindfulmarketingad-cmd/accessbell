// Dashboard home: multi-domain view and adding domains.
import { api, boot, el, fmtDate, scorePill, busy, can, setStatus } from './core.js';

const me = await boot();
const domainsBox = document.querySelector('[data-domains]');
const kpis = document.querySelector('[data-kpis]');
const quota = document.querySelector('[data-quota]');
const addPanel = document.querySelector('[data-add-panel]');
const addForm = document.querySelector('[data-add-domain]');
const addStatus = document.querySelector('[data-add-status]');

const kpi = (label, value, note) => el('div', { class: 'kpi' }, [el('span', { text: label }), el('strong', { text: value }), note ? el('small', { text: note }) : null]);

async function load() {
  const { domains, billing } = await api('domains');
  const scored = domains.filter((d) => d.score !== null);
  const avg = scored.length ? Math.round(scored.reduce((n, d) => n + d.score, 0) / scored.length) : null;
  kpis.replaceChildren(
    kpi('Average score', avg === null ? 'n/a' : String(avg), 'Across monitored pages'),
    kpi('Open issues', String(domains.reduce((n, d) => n + d.issues, 0)), 'Failing elements'),
    kpi('Monitored URLs', String(domains.reduce((n, d) => n + d.monitored, 0)), 'Up to 25 per domain'),
    kpi('Domains', `${billing.domainsUsed} / ${billing.domainQuota}`, 'Used / in your plan'),
  );
  quota.textContent =
    billing.domainQuota > 0
      ? `${billing.domainsUsed} of ${billing.domainQuota} domain${billing.domainQuota === 1 ? '' : 's'} used. Add more domains in Billing.`
      : 'Start your free trial to add domains.';

  if (!domains.length) {
    domainsBox.replaceChildren(el('div', { class: 'empty' }, [el('h3', { text: 'No domains yet' }), el('p', { text: me.subscribed ? 'Add your first domain below to start monitoring.' : 'Start your 3-day free trial, then add your first domain.' })]));
  } else {
    const rows = domains.map((d) =>
      el('tr', {}, [
        el('th', { scope: 'row' }, [el('a', { href: `/app/domain?id=${d.id}`, text: d.hostname })]),
        el('td', { class: 'num' }, [scorePill(d.score)]),
        el('td', { class: 'num', text: String(d.issues) }),
        el('td', { class: 'num', text: `${d.monitored} / 25` }),
        el('td', { text: fmtDate(d.last_scanned_at, true) }),
      ]),
    );
    domainsBox.replaceChildren(
      el('div', { class: 'table-wrap' }, [
        el('table', { class: 'data-table' }, [
          el('caption', { class: 'visually-hidden', text: 'Monitored domains' }),
          el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'Domain' }), el('th', { scope: 'col', class: 'num', text: 'Score' }), el('th', { scope: 'col', class: 'num', text: 'Issues' }), el('th', { scope: 'col', class: 'num', text: 'URLs' }), el('th', { scope: 'col', text: 'Last scan' })])]),
          el('tbody', {}, rows),
        ]),
      ]),
    );
  }
  addPanel.hidden = !(me.subscribed && can(me, 'admin') && billing.domainsUsed < billing.domainQuota);
}

const addButton = addForm.querySelector('button');
addForm.addEventListener(
  'submit',
  busy(addButton, addStatus, async () => {
    const url = addForm.elements.url.value.trim();
    if (!url) throw new Error('Enter a website address.');
    const { domain } = await api('domains', { method: 'POST', body: { url } });
    setStatus(addStatus, 'success', `${domain.hostname} added.`);
    location.assign(`/app/domain?id=${domain.id}`);
  }),
);

await load();

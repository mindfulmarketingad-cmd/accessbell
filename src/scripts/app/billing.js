// Subscription status, trial checkout and the Stripe customer portal.
import { boot, el, fmtDate, busy, planButtons, openPortal } from './core.js';

const me = await boot();
const b = me.billing;
const $ = (s) => document.querySelector(s);
const STATUS = { none: 'Not started', trialing: 'Free trial', active: 'Active', past_due: 'Payment failed', unpaid: 'Unpaid', canceled: 'Canceled', incomplete: 'Incomplete', incomplete_expired: 'Expired', paused: 'Paused' };
const kpi = (label, value, note) => el('div', { class: 'kpi' }, [el('span', { text: label }), el('strong', { text: value }), note ? el('small', { text: note }) : null]);

$('[data-billing-kpis]').replaceChildren(
  kpi('Status', STATUS[b.status] || b.status, b.status === 'trialing' && b.trialEndsAt ? `Ends ${fmtDate(b.trialEndsAt)}` : ''),
  kpi('Domains in plan', String(b.domainQuota), `${b.domainsUsed} in use`),
  b.interval === 'year'
    ? kpi('Annual price', `$${199 * Math.max(b.domainQuota, 1)}`, `$199 x ${Math.max(b.domainQuota, 1)} domain${b.domainQuota === 1 ? '' : 's'}, billed yearly`)
    : kpi('Monthly price', `$${29 * Math.max(b.domainQuota, 1)}`, `$29 x ${Math.max(b.domainQuota, 1)} domain${b.domainQuota === 1 ? '' : 's'}`),
  kpi(b.status === 'trialing' ? 'First charge' : 'Renews', fmtDate(b.status === 'trialing' ? b.trialEndsAt : b.currentPeriodEnd)),
);

const note = $('[data-billing-note]');
const actions = $('[data-billing-actions]');
const status = $('[data-billing-status]');

if (me.role !== 'owner') {
  note.textContent = 'Only the account owner can change billing.';
} else if (!b.hasCustomer || ['none', 'canceled', 'incomplete_expired'].includes(b.status)) {
  note.textContent = 'Choose monthly ($29/mo per domain, 3-day free trial) or annual ($199/year per domain). Same features on both. You can choose how many domains to monitor at checkout and change it any time.';
  actions.append(planButtons(status, { restart: b.status !== 'none' }));
} else {
  note.textContent = 'Change the number of domains, update your card, download invoices or cancel in the secure Stripe portal.';
  const portal = el('button', { class: 'btn', type: 'button', text: 'Manage billing' });
  portal.addEventListener('click', busy(portal, status, openPortal));
  actions.append(portal);
}

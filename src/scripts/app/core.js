// Shared helpers for dashboard pages. All data is inserted with textContent
// or DOM APIs, never as HTML.
import { ICONS } from '../../lib/icons.js';

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** Call /api/app/<route>. Redirects to sign-in when the session has ended. */
export async function api(route, { method = 'GET', body, redirectOn401 = true } = {}) {
  // The server only accepts JSON for writes, so POSTs always carry a body.
  if (method !== 'GET' && body === undefined) body = {};
  const res = await fetch(`/api/app/${route}`, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try {
    data = await res.json();
  } catch {}
  if (res.status === 401 && redirectOn401) {
    const next = location.pathname + location.search;
    location.assign(`/app/login?next=${encodeURIComponent(next)}`);
    return new Promise(() => {}); // the page is navigating away
  }
  if (!res.ok) throw new ApiError(res.status, data.error || 'Something went wrong. Please try again.', data.code);
  return data;
}

/** Tiny element builder: el('a', { href, text, class }, [children]). */
export function el(tag, attrs, children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'text') node.textContent = v;
    else if (k === 'on') for (const [evt, fn] of Object.entries(v)) node.addEventListener(evt, fn);
    else if (v === true) node.setAttribute(k, '');
    else node.setAttribute(k, String(v));
  }
  for (const c of children || []) if (c !== null && c !== undefined && c !== false) node.append(c);
  return node;
}

const SVG = 'http://www.w3.org/2000/svg';
export function svg(tag, attrs, children) {
  const node = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, String(v));
  for (const c of children || []) node.append(c);
  return node;
}

/** Decorative stroke icon from the shared icon set (static, trusted markup). */
export function icon(name) {
  const node = svg('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false' });
  node.innerHTML = ICONS[name] || '';
  return node;
}

/** Letter avatar for a domain or person; the colour is stable per name. */
export function avatar(name, extra = '') {
  const letter = (String(name || '?').replace(/^www\./, '').match(/[a-z0-9]/i) || ['?'])[0].toUpperCase();
  let h = 0;
  for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return el('span', { class: `avatar avatar-${h % 4} ${extra}`.trim(), 'aria-hidden': 'true', text: letter });
}

const initials = (email) => {
  const local = String(email || '').split('@')[0].replace(/[^a-z0-9]+/gi, ' ').trim();
  const parts = local.split(' ').filter(Boolean);
  return ((parts[0]?.[0] || '?') + (parts[1]?.[0] || '')).toUpperCase();
};

export const qs = (name) => new URLSearchParams(location.search).get(name);

export function fmtDate(value, withTime = false) {
  if (!value) return 'Never';
  const d = new Date(value);
  return withTime
    ? d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : d.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

export const band = (score) => (score === null || score === undefined ? 'none' : score >= 90 ? 'high' : score >= 60 ? 'mid' : 'low');

export const scorePill = (score) =>
  el('span', { class: 'score-pill', 'data-band': band(score), text: score === null || score === undefined ? 'n/a' : String(score) });

/** Status text for forms, announced to screen readers. */
export function setStatus(node, state, message) {
  node.setAttribute('data-state', state || '');
  node.textContent = message || '';
}

/** Wrap an async click/submit handler with a busy state and error reporting. */
export function busy(button, statusNode, fn) {
  return async (event) => {
    event?.preventDefault?.();
    if (button.disabled) return;
    button.disabled = true;
    if (statusNode) setStatus(statusNode, '', '');
    try {
      await fn(event);
    } catch (err) {
      if (statusNode) setStatus(statusNode, 'error', err.message);
      else alert(err.message);
    } finally {
      button.disabled = false;
    }
  };
}

const RANK = { viewer: 1, member: 2, admin: 3, owner: 4 };
export const can = (me, role) => RANK[me.role] >= RANK[role];

/** Load the signed-in user and their domains, fill the sidebar and show the billing banner. */
export async function boot() {
  initShell();
  const me = await api('me');
  const set = (sel, text) => document.querySelectorAll(sel).forEach((n) => (n.textContent = text));
  set('[data-account-name]', me.account.name);
  set('[data-account-label]', me.account.name);
  set('[data-account-members]', `${me.account.members} member${me.account.members === 1 ? '' : 's'}`);
  set('[data-user-email]', me.user.email);
  set('[data-user-initials]', initials(me.user.email));
  set('[data-workspace-initial]', (me.account.name.match(/[a-z0-9]/i) || ['A'])[0].toUpperCase());
  document.querySelector('[data-signout]')?.addEventListener('click', async () => {
    await api('auth/logout', { method: 'POST', redirectOn401: false }).catch(() => {});
    location.assign('/app/login');
  });
  if (!me.subscribed) {
    renderPending(me);
    return new Promise(() => {}); // the page stays on the activation screen
  }
  const list = await api('domains');
  me.domainList = list;
  renderSideDomains(list.domains, me);
  renderBanner(me);
  return me;
}

/**
 * Shown until the site owner marks the account as a Subscriber in Supabase.
 * Checks every 30 seconds and opens the dashboard once access is switched on.
 */
function renderPending(me) {
  const main = document.getElementById('main');
  if (!main) return;
  const paid = ['trialing', 'active'].includes(me.billing?.status);
  const isOwner = me.role === 'owner';
  const status = el('p', { class: 'status-line', role: 'status', 'aria-live': 'polite' });

  let action = null;
  if (paid) {
    action = el('p', { class: 'pending-done', text: 'Payment received. Thank you!' });
  } else if (isOwner) {
    action = el('button', { class: 'btn btn-accent', type: 'button', text: 'Start 3-day free trial' });
    action.addEventListener('click', busy(action, status, startCheckout));
  } else {
    action = el('p', { text: 'Ask the owner of this account to start the subscription.' });
  }

  main.replaceChildren(
    el('div', { class: 'pending' }, [
      el('h1', { text: 'Activate Your Dashboard' }),
      el('p', { class: 'pending-lead', text: `You are signed in as ${me.user.email}. Two steps and your dashboard is ready:` }),
      el('ol', { class: 'pending-steps' }, [
        el('li', { class: paid ? 'is-done' : null }, [
          el('h2', { text: 'Start your 3-day free trial' }),
          el('p', { text: 'Add your card on our secure Stripe checkout. You are not charged until the trial ends, then it is $29/mo per domain. Cancel anytime.' }),
          action,
        ]),
        el('li', {}, [
          el('h2', { text: 'We switch on your dashboard' }),
          el('p', { text: 'Once your payment is confirmed, we activate your account. This page checks every 30 seconds and opens your dashboard as soon as it is ready.' }),
        ]),
      ]),
      status,
      el('p', { class: 'pending-help' }, ['Questions? ', el('a', { href: '/contact', text: 'Contact us' }), '.']),
    ]),
  );

  setInterval(async () => {
    if (document.visibilityState !== 'visible') return;
    const next = await api('me').catch(() => null);
    if (next?.subscribed) location.reload();
  }, 30_000);
}

/** Domains listed under "Domains" in the sidebar, plus an "Add domain" link. */
export function renderSideDomains(domains, me) {
  const box = document.querySelector('[data-side-domains]');
  if (!box) return;
  const current = new URLSearchParams(location.search).get('id');
  const onDomainPage = location.pathname.replace(/\.html$/, '') === '/app/domain';
  const items = domains.map((d) =>
    el('li', {}, [
      el('a', { href: `/app/domain?id=${d.id}`, 'aria-current': onDomainPage && d.id === current ? 'page' : null }, [avatar(d.hostname, 'avatar-xs'), el('span', { text: d.hostname })]),
    ]),
  );
  if (!me || can(me, 'admin')) items.push(el('li', {}, [el('a', { href: '/app?add=1', class: 'nav-add' }, [icon('plus'), el('span', { text: 'Add domain' })])]));
  box.replaceChildren(...items);
}

const SIDE_KEY = 'ab-side-collapsed';

/** Sidebar collapse (desktop), slide-out menu (phones) and the user menu. */
function initShell() {
  const shell = document.querySelector('[data-shell]');
  if (!shell || shell.dataset.ready) return;
  shell.dataset.ready = '1';
  const side = document.getElementById('app-side');
  const collapse = shell.querySelector('[data-side-collapse]');
  const open = shell.querySelector('[data-side-open]');
  const backdrop = shell.querySelector('[data-side-backdrop]');

  const setCollapsed = (on) => {
    shell.classList.toggle('is-collapsed', on);
    collapse?.setAttribute('aria-expanded', String(!on));
    const label = collapse?.querySelector('[data-collapse-label]');
    if (label) label.textContent = on ? 'Expand sidebar' : 'Collapse sidebar';
    try {
      localStorage.setItem(SIDE_KEY, on ? '1' : '0');
    } catch {}
  };
  try {
    if (localStorage.getItem(SIDE_KEY) === '1') setCollapsed(true);
  } catch {}
  collapse?.addEventListener('click', () => setCollapsed(!shell.classList.contains('is-collapsed')));

  const setOpen = (on) => {
    shell.classList.toggle('is-open', on);
    open?.setAttribute('aria-expanded', String(on));
    if (backdrop) backdrop.hidden = !on;
    if (on) side.querySelector('a, button')?.focus();
    else if (document.activeElement && side.contains(document.activeElement)) open?.focus();
  };
  open?.addEventListener('click', () => setOpen(true));
  backdrop?.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && shell.classList.contains('is-open')) setOpen(false);
  });

  const toggle = shell.querySelector('[data-domains-toggle]');
  toggle?.addEventListener('click', () => {
    const on = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(on));
    document.getElementById('side-domains').hidden = !on;
  });

  const menuButton = shell.querySelector('[data-user-menu]');
  if (menuButton) disclosure(menuButton, document.getElementById(menuButton.getAttribute('aria-controls')));
}

/** Button that shows and hides a small popover; closes on Escape and outside clicks. */
export function disclosure(button, panel) {
  const set = (on) => {
    button.setAttribute('aria-expanded', String(on));
    panel.hidden = !on;
  };
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    set(panel.hidden);
  });
  document.addEventListener('click', (e) => {
    if (!panel.hidden && !panel.contains(e.target)) set(false);
  });
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      set(false);
      button.focus();
    }
  });
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') set(false);
  });
  return set;
}

export async function startCheckout() {
  const { url } = await api('billing/checkout');
  location.assign(url);
}

export async function openPortal() {
  const { url } = await api('billing/portal', { method: 'POST' });
  location.assign(url);
}

function renderBanner(me) {
  const slot = document.querySelector('[data-banner]');
  if (!slot) return;
  const b = me.billing;
  let banner = null;
  // Accounts switched on by hand may have no Stripe subscription on record; do not nag them.
  if ((b.status === 'none' && !me.subscribed) || b.status === 'canceled' || b.status === 'incomplete_expired') {
    const isOwner = me.role === 'owner';
    const button = isOwner ? el('button', { class: 'btn btn-accent', type: 'button', text: b.status === 'none' ? 'Start 3-day free trial' : 'Restart subscription' }) : null;
    if (button) button.addEventListener('click', busy(button, null, startCheckout));
    banner = el('div', { class: 'banner', role: 'region', 'aria-label': 'Subscription' }, [
      el('div', {}, [
        el('strong', { text: b.status === 'none' ? 'Start monitoring with AccessBell Pro' : 'Your subscription has ended' }),
        el('p', {
          text: isOwner
            ? '$29 per domain per month after a 3-day free trial. Up to 500 URLs per domain, unlimited rescans and AI-assisted fixes.'
            : 'Ask the account owner to start the subscription to unlock monitoring.',
        }),
      ]),
      button,
    ]);
  } else if (b.status === 'past_due' || b.status === 'unpaid') {
    const button = me.role === 'owner' ? el('button', { class: 'btn', type: 'button', text: 'Update payment method' }) : null;
    if (button) button.addEventListener('click', busy(button, null, openPortal));
    banner = el('div', { class: 'banner banner-warn', role: 'region', 'aria-label': 'Subscription' }, [
      el('div', {}, [el('strong', { text: 'Your last payment failed' }), el('p', { text: 'Monitoring is paused until the payment method is updated.' })]),
      button,
    ]);
  } else if (b.status === 'trialing' && b.trialEndsAt) {
    banner = el('div', { class: 'banner banner-info', role: 'region', 'aria-label': 'Subscription' }, [
      el('div', {}, [el('strong', { text: `Free trial active until ${fmtDate(b.trialEndsAt)}` }), el('p', { text: 'Your card is charged when the trial ends unless you cancel in Billing.' })]),
    ]);
  }
  slot.replaceChildren(...(banner ? [banner] : []));
}

/** Run async tasks with limited concurrency, reporting progress. */
export async function pool(items, limit, worker, onProgress) {
  let done = 0;
  let index = 0;
  const results = [];
  const run = async () => {
    while (index < items.length) {
      const i = index++;
      try {
        results[i] = await worker(items[i]);
      } catch (err) {
        results[i] = err;
      }
      done++;
      onProgress?.(done, items.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

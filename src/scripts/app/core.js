// Shared helpers for dashboard pages. All data is inserted with textContent
// or DOM APIs, never as HTML.

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

/** Load the signed-in user, fill the sidebar and show the billing banner. */
export async function boot() {
  const me = await api('me');
  const name = document.querySelector('[data-account-name]');
  const email = document.querySelector('[data-user-email]');
  if (name) name.textContent = me.account.name;
  if (email) email.textContent = me.user.email;
  document.querySelector('[data-signout]')?.addEventListener('click', async () => {
    await api('auth/logout', { method: 'POST', redirectOn401: false }).catch(() => {});
    location.assign('/app/login');
  });
  renderBanner(me);
  return me;
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
  if (b.status === 'none' || b.status === 'canceled' || b.status === 'incomplete_expired') {
    const isOwner = me.role === 'owner';
    const button = isOwner ? el('button', { class: 'btn btn-accent', type: 'button', text: b.status === 'none' ? 'Start 3-day free trial' : 'Restart subscription' }) : null;
    if (button) button.addEventListener('click', busy(button, null, startCheckout));
    banner = el('div', { class: 'banner', role: 'region', 'aria-label': 'Subscription' }, [
      el('div', {}, [
        el('strong', { text: b.status === 'none' ? 'Start monitoring with AccessBell Lite' : 'Your subscription has ended' }),
        el('p', {
          text: isOwner
            ? '$79 per domain per month after a 3-day free trial. Up to 25 URLs per domain, unlimited rescans and AI-assisted fixes.'
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

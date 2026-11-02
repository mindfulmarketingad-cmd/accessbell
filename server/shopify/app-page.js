// The page Shopify shows inside the store admin (an iframe). It loads App
// Bridge, gets an ID token, and asks /api/shopify/session for the store's
// AccessBell results. Served by a function (not a static page) because the
// frame-ancestors header has to name the store that is embedding it.
import crypto from 'node:crypto';
import { normalizeShop } from './verify.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function frameAncestors(shop) {
  const s = normalizeShop(shop);
  return s ? `https://${s} https://admin.shopify.com` : 'https://admin.shopify.com';
}

export function appPage({ apiKey, shop }) {
  const nonce = crypto.randomBytes(16).toString('base64');
  const csp = [
    "default-src 'self'",
    `script-src 'self' https://cdn.shopify.com 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline' https://cdn.shopify.com",
    "img-src 'self' data: https://cdn.shopify.com",
    "connect-src 'self' https://*.shopify.com https://*.myshopify.com",
    `frame-ancestors ${frameAncestors(shop)}`,
    "base-uri 'self'",
    "object-src 'none'",
  ].join('; ');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="shopify-api-key" content="${esc(apiKey)}">
<script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
<title>AccessBell</title>
<style>
body{font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;margin:0;padding:16px;color:#1a1a1a;background:#f1f1f1}
main{max-width:960px;margin:0 auto}
.card{background:#fff;border-radius:12px;padding:16px 20px;margin:0 0 16px;box-shadow:0 1px 2px rgba(0,0,0,.08)}
h1{font-size:20px;margin:0 0 12px}h2{font-size:16px;margin:0 0 8px}
.score{font-size:40px;font-weight:700}.muted{color:#616161}
table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:8px;border-bottom:1px solid #e3e3e3;vertical-align:top}
.impact{font-weight:600;text-transform:capitalize}
a{color:#005bd3}
button{font:inherit;padding:6px 14px;border-radius:8px;border:1px solid #8a8a8a;background:#fff;cursor:pointer}button:disabled{opacity:.6;cursor:default}
.ok{color:#0c5132;font-weight:600}.warn{color:#8e1f0b;font-weight:600}
</style>
</head>
<body>
<main>
  <h1>AccessBell accessibility</h1>
  <div id="status" class="card" role="status" aria-live="polite">Loading your store's results&hellip;</div>
  <section id="summary" class="card" hidden aria-labelledby="sum-h"><h2 id="sum-h">Accessibility score</h2><div id="sum"></div></section>
  <section id="issues" class="card" hidden aria-labelledby="iss-h"><h2 id="iss-h">Top issues and guided fix suggestions</h2><div id="iss"></div></section>
  <section id="plan" class="card" hidden aria-labelledby="plan-h"><h2 id="plan-h">Your plan</h2><div id="plan-body"></div>
    <p><button type="button" id="change-plan">See plans</button></p></section>
  <section id="scan" class="card" hidden aria-labelledby="scan-h"><h2 id="scan-h">Scans</h2><p id="scan-info"></p>
    <p><button type="button" id="scan-now">Scan now</button> <button type="button" id="find-pages" hidden>Find and monitor store pages</button></p>
    <p id="scan-msg" role="status" aria-live="polite"></p></section>
  <section id="setup" class="card" hidden aria-labelledby="set-h"><h2 id="set-h">AccessBell app embed</h2>
    <p id="embed-state"></p>
    <p>The <strong>AccessBell fixes</strong> app embed loads the fixes you approve and the accessibility toolbar. It changes attributes such as alt text and labels, never your design.</p>
    <p><a id="embed-link" target="_top" href="#">Open App embeds in the theme editor</a></p>
  </section>
</main>
<script nonce="${nonce}">
(async function () {
  const $ = (id) => document.getElementById(id);
  const text = (s) => document.createTextNode(s == null ? '' : String(s));
  function el(tag, attrs, kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v);
    for (const c of [].concat(kids || [])) e.append(typeof c === 'string' ? text(c) : c);
    return e;
  }
  const api = async (path) => {
    const token = await shopify.idToken();
    const res = await fetch('/api/shopify/' + path, { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(data.error || 'Something went wrong.'); e.data = data; e.status = res.status; throw e; }
    return data;
  };
  const day = (d) => new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  async function load() {
    const data = await api('session');
    const o = data.overview || {};
    const p = data.plan;
    $('status').textContent = o.scanned ? 'Results for ' + data.hostname + '.' : 'Your store ' + data.hostname + ' is connected. Results appear here after its first scan.';
    if (o.scanned) {
      $('sum').replaceChildren(
        el('div', { class: 'score' }, [String(o.score ?? '–'), el('span', { class: 'muted' }, ' / 100')]),
        el('p', {}, o.issues + ' issues on ' + o.pages + ' monitored page' + (o.pages === 1 ? '' : 's') + '. Automated checks find many issues, not all of them.'),
      );
      $('summary').hidden = false;
      const rows = (o.topIssues || []).map((i) => el('tr', {}, [
        el('td', { class: 'impact' }, i.impact || ''),
        el('td', {}, [el('strong', {}, i.title || i.id), el('br'), el('span', { class: 'muted' }, (i.elements || 0) + ' elements, ' + (i.pages || 0) + ' pages')]),
        el('td', {}, i.fix || ''),
      ]));
      if (rows.length) {
        $('iss').replaceChildren(el('table', {}, [el('thead', {}, el('tr', {}, [el('th', { scope: 'col' }, 'Impact'), el('th', { scope: 'col' }, 'Issue'), el('th', { scope: 'col' }, 'Guided fix suggestion')])), el('tbody', {}, rows)]));
        $('issues').hidden = false;
      }
    }
    const every = p.rescanEveryDays === 1 ? 'daily' : p.rescanEveryDays === 7 ? 'weekly' : 'monthly';
    const lines = [el('p', {}, [el('strong', {}, p.name), ': ' + (p.monitoredPages === 1 ? 'home page' : 'up to ' + p.monitoredPages + ' pages') + ', rescanned ' + every + (p.fixes ? ', approved fixes on your storefront.' : '. Upgrade to apply approved fixes.')])];
    if (p.status === 'trialing' && p.trialEndsAt) lines.push(el('p', { class: 'muted' }, 'Free trial ends ' + day(p.trialEndsAt) + '.'));
    if (p.status === 'paused') lines.push(el('p', { class: 'warn' }, 'Your Shopify billing is on hold, so paid features are paused.'));
    $('plan-body').replaceChildren(...lines);
    $('change-plan').textContent = p.tier === 'free' ? 'Start a 3-day free trial' : 'Change plan';
    $('change-plan').onclick = () => window.open(data.pricingUrl, '_top');
    $('plan').hidden = false;

    $('scan-info').textContent = data.scan.monitored + ' page' + (data.scan.monitored === 1 ? '' : 's') + ' monitored.' + (data.scan.nextAllowedAt ? ' Next manual scan: ' + day(data.scan.nextAllowedAt) + '.' : '');
    $('scan-now').disabled = Boolean(data.scan.nextAllowedAt);
    $('find-pages').hidden = !p.discovery;
    $('scan').hidden = false;

    $('embed-state').replaceChildren(data.embed.enabled
      ? el('span', { class: 'ok' }, 'The app embed is on.')
      : el('span', { class: 'warn' }, 'The app embed is off, so fixes and the toolbar are not on your storefront yet.'));
    $('embed-link').href = data.embed.activateUrl;
    $('setup').hidden = false;
  }
  async function action(btn, path, done) {
    btn.disabled = true;
    $('scan-msg').textContent = 'Working…';
    try {
      const r = await api(path);
      $('scan-msg').textContent = done(r);
      await load();
    } catch (err) {
      $('scan-msg').textContent = err.message;
      btn.disabled = false;
    }
  }
  $('scan-now').onclick = () => action($('scan-now'), 'scan', (r) => r.mode === 'background' ? 'Scanning ' + r.pages + ' pages. Results update as each one finishes.' : 'Scan finished.');
  $('find-pages').onclick = () => action($('find-pages'), 'pages', (r) => 'Found ' + r.found + ' pages. Monitoring ' + r.monitored + ' of up to ' + r.limit + '.');
  try {
    await load();
  } catch (err) {
    $('status').textContent = 'Could not load AccessBell: ' + err.message;
  }
})();
</script>
</body>
</html>`;
  return { html, csp };
}

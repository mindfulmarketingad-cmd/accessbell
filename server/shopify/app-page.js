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
</style>
</head>
<body>
<main>
  <h1>AccessBell accessibility</h1>
  <div id="status" class="card" role="status" aria-live="polite">Loading your store's results&hellip;</div>
  <section id="summary" class="card" hidden aria-labelledby="sum-h"><h2 id="sum-h">Accessibility score</h2><div id="sum"></div></section>
  <section id="issues" class="card" hidden aria-labelledby="iss-h"><h2 id="iss-h">Top issues and guided fix suggestions</h2><div id="iss"></div></section>
  <section id="setup" class="card" hidden aria-labelledby="set-h"><h2 id="set-h">Apply approved fixes on your storefront</h2>
    <p>Turn on the <strong>AccessBell fixes</strong> app embed in <em>Online Store &rsaquo; Themes &rsaquo; Customize &rsaquo; App embeds</em>. It loads the fixes you approve in AccessBell. It changes attributes such as alt text and labels, never your design.</p>
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
  try {
    const token = await shopify.idToken();
    const res = await fetch('/api/shopify/session', { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    const o = data.overview || {};
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
    if (data.billing && data.billing.status === 'pending') {
      $('status').append(el('p', { class: 'muted' }, 'Plans are coming soon.'));
    }
    $('setup').hidden = false;
  } catch (err) {
    $('status').textContent = 'Could not load AccessBell: ' + err.message;
  }
})();
</script>
</body>
</html>`;
  return { html, csp };
}

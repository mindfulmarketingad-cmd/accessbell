// Free scans log (site admins only): who ran the public checkers, on which domain.
import { api, boot, el, fmtDate, setStatus } from './core.js';

const me = await boot();
const $ = (s) => document.querySelector(s);
const status = $('[data-fs-status]');
const STANDARD = { wcag22: 'WCAG 2.2 AA', wcag21: 'WCAG 2.1 AA', ada: 'ADA', section508: 'Section 508', en301549: 'EN 301 549' };
let rows = [];
let next = null;
let filter = { q: '', days: '30' };

const table = (caption, head, body) =>
  el('div', { class: 'table-wrap', role: 'region', tabindex: '0', 'aria-label': `${caption} (table)` }, [
    el('table', { class: 'data-table' }, [
      el('caption', { class: 'visually-hidden', text: caption }),
      el('thead', {}, [el('tr', {}, head.map((h) => el('th', { scope: 'col', class: h.num ? 'num' : undefined, text: h.label })))]),
      el('tbody', {}, body),
    ]),
  ]);

const searchFor = (text) => {
  const b = el('button', { type: 'button', class: 'link-btn', text });
  b.addEventListener('click', () => {
    $('#fs-q').value = text;
    filter.q = text;
    load();
  });
  return b;
};

function result(r) {
  if (r.status === 'failed') return el('span', { class: 'tag', title: r.error || '', text: 'Could not scan' });
  return el('span', {}, [
    `${r.issues ?? 0} issues`,
    r.critical || r.serious ? el('span', { class: 'muted', text: ` (${r.critical || 0} critical, ${r.serious || 0} serious)` }) : null,
  ]);
}

function renderList() {
  $('[data-fs-list]').replaceChildren(
    rows.length
      ? table(
          'Latest free scans',
          [{ label: 'When' }, { label: 'Domain' }, { label: 'URL entered' }, { label: 'Checker page' }, { label: 'Standard' }, { label: 'Result' }, { label: 'Country' }],
          rows.map((r) =>
            el('tr', {}, [
              el('td', { class: 'nowrap', text: fmtDate(r.createdAt, true) }),
              el('th', { scope: 'row' }, [searchFor(r.hostname)]),
              el('td', { class: 'url' }, [el('a', { href: r.finalUrl || r.url, target: '_blank', rel: 'noopener noreferrer nofollow', text: r.url })]),
              el('td', { class: 'url' }, [r.source ? el('a', { href: r.source, text: r.source }) : '-']),
              el('td', { text: STANDARD[r.standard] || r.standard }),
              el('td', {}, [result(r)]),
              el('td', { text: r.country || '-' }),
            ]),
          ),
        )
      : el('p', { class: 'muted', text: 'No free scans match this filter yet.' }),
  );
  $('[data-fs-more]').hidden = !next;
  $('[data-fs-csv]').disabled = !rows.length;
}

async function load(append = false) {
  const qs = new URLSearchParams({ q: filter.q, days: filter.days });
  if (append && next) qs.set('before', next);
  setStatus(status, '', 'Loading...');
  try {
    const data = await api(`admin/free-scans?${qs}`);
    $('[data-fs-body]').hidden = false;
    for (const [k, v] of Object.entries(data.totals)) {
      const n = document.querySelector(`[data-total="${k}"]`);
      if (n) n.textContent = Number(v).toLocaleString();
    }
    rows = append ? rows.concat(data.scans) : data.scans;
    next = data.next;
    $('[data-fs-top]').replaceChildren(
      data.top.length
        ? table('Most checked domains', [{ label: 'Domain' }, { label: 'Scans', num: true }, { label: 'Last scan' }], data.top.map((t) => el('tr', {}, [el('th', { scope: 'row' }, [searchFor(t.hostname)]), el('td', { class: 'num', text: String(t.scans) }), el('td', { class: 'nowrap', text: fmtDate(t.last_at, true) })])))
        : el('p', { class: 'muted', text: 'No scans in this period.' }),
    );
    $('[data-fs-pages]').replaceChildren(
      data.pages.length
        ? table('Scans by checker page', [{ label: 'Checker page' }, { label: 'Scans', num: true }], data.pages.map((p) => el('tr', {}, [el('th', { scope: 'row', class: 'url' }, [p.source.startsWith('/') ? el('a', { href: p.source, text: p.source }) : p.source]), el('td', { class: 'num', text: String(p.scans) })])))
        : el('p', { class: 'muted', text: 'No scans in this period.' }),
    );
    renderList();
    setStatus(status, '', `Showing ${rows.length.toLocaleString()} scan${rows.length === 1 ? '' : 's'}${filter.q ? ` matching "${filter.q}"` : ''}.`);
  } catch (err) {
    setStatus(status, 'error', err.message);
  }
}

function exportCsv() {
  const cell = (v) => {
    let t = String(v ?? '');
    if (/^[=+\-@]/.test(t)) t = `'${t}`;
    return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  const out = [['Date', 'Domain', 'URL entered', 'Checker page', 'Standard', 'Status', 'Issues', 'Critical', 'Serious', 'Error', 'Country']];
  for (const r of rows) out.push([new Date(r.createdAt).toISOString(), r.hostname, r.url, r.source, STANDARD[r.standard] || r.standard, r.status, r.issues, r.critical, r.serious, r.error, r.country]);
  const a = el('a', { href: URL.createObjectURL(new Blob(['﻿' + out.map((r) => r.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' })), download: `accessbell-free-scans-${new Date().toISOString().slice(0, 10)}.csv` });
  document.body.append(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 0);
}

if (!me.admin) {
  setStatus(status, 'error', 'Only site admins can see free scans.');
} else {
  $('[data-fs-filter]').addEventListener('submit', (e) => {
    e.preventDefault();
    filter = { q: $('#fs-q').value.trim(), days: $('#fs-days').value };
    load();
  });
  $('[data-fs-more]').addEventListener('click', () => load(true));
  $('[data-fs-csv]').addEventListener('click', exportCsv);
  load();
}

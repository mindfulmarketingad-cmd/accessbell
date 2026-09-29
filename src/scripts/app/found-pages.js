// Found Pages: every page found on the domain. Choose up to 25 to scan and
// monitor, then Start Scan.
import { api, boot, el, icon, qs, busy, can, setStatus } from './core.js';
import { scanWithDialog } from './domain-actions.js';

const me = await boot();
const id = qs('id');
const $ = (s) => document.querySelector(s);
const MAX = 25;
const PAGE_SIZE = 100;
const status = $('[data-found-status]');
const search = $('[data-page-search]');
const list = $('[data-found-list]');
const startBtn = $('[data-start-scan]');
const selectShown = $('[data-select-shown]');
let data;
let pages = [];
let selected = new Set();
let limit = PAGE_SIZE;
const editable = me.subscribed && can(me, 'member');
const settingsUrl = () => `/app/domain?id=${encodeURIComponent(id)}&tab=settings`;

const banner = (state, title, body) =>
  $('[data-crawl-banner]').replaceChildren(
    el('div', { class: `crawl-card crawl-${state}` }, [
      el('span', { class: 'crawl-icon', 'aria-hidden': 'true' }, [state === 'busy' ? el('span', { class: 'spinner' }) : icon(state === 'done' ? 'check' : 'alert')]),
      el('div', {}, [el('h2', { text: title }), el('p', {}, body)]),
    ]),
  );

function doneBanner() {
  const addLink = el('button', { type: 'button', class: 'link-btn', text: 'add pages manually' });
  addLink.addEventListener('click', openAddPages);
  banner('done', 'Website crawl completed', [
    'Review the pages we found and select the ones to scan. If some pages are missing, you can ',
    el('a', { href: settingsUrl(), text: 'add your XML sitemap' }),
    ', ',
    addLink,
    ' or ',
    el('a', { href: settingsUrl(), text: 'add login headers' }),
    ' for password-protected pages.',
  ]);
}

const filtered = () => {
  const q = search.value.trim().toLowerCase();
  return q ? pages.filter((p) => p.url.toLowerCase().includes(q)) : pages;
};
const display = (url) => url.replace(/^https?:\/\//, '');

function updateCounts() {
  $('[data-selected-count]').textContent = `${selected.size} of ${pages.length.toLocaleString()} pages selected for scanning`;
  startBtn.disabled = !editable || !selected.size;
  startBtn.lastChild.textContent = selected.size ? ` Start Scan (${selected.size})` : ' Start Scan';
  const shown = filtered();
  const shownSelected = shown.filter((p) => selected.has(p.id)).length;
  selectShown.checked = shown.length > 0 && (shownSelected === shown.length || selected.size >= MAX) && shownSelected > 0;
  selectShown.indeterminate = shownSelected > 0 && !selectShown.checked;
  $('[data-footer-note]').textContent = selected.size >= MAX ? `${MAX} of ${MAX} pages selected. Unselect a page to choose a different one.` : `${MAX - selected.size} more page${MAX - selected.size === 1 ? '' : 's'} can be selected.`;
}

function renderList() {
  const shown = filtered();
  const items = shown.slice(0, limit).map((p) => {
    const box = el('input', { type: 'checkbox', id: `pg-${p.id}`, checked: selected.has(p.id), disabled: !editable });
    box.addEventListener('change', () => {
      if (box.checked && selected.size >= MAX) {
        box.checked = false;
        setStatus(status, 'error', `You can select up to ${MAX} pages. Unselect one first.`);
        return;
      }
      setStatus(status, '', '');
      if (box.checked) selected.add(p.id);
      else selected.delete(p.id);
      updateCounts();
    });
    return el('li', { class: `found-row${selected.has(p.id) ? ' is-selected' : ''}` }, [
      box,
      el('label', { for: `pg-${p.id}`, class: 'found-url', text: display(p.url) }),
      p.source === 'manual' && p.url !== data.domain.baseUrl + '/' ? el('span', { class: 'tag', text: 'Added' }) : null,
      el('a', { class: 'found-open', href: p.url, target: '_blank', rel: 'noopener noreferrer' }, [icon('external'), 'Open', el('span', { class: 'visually-hidden', text: ` ${display(p.url)} (opens in a new tab)` })]),
    ]);
  });
  list.replaceChildren(...(items.length ? items : [el('li', { class: 'found-empty muted', text: pages.length ? 'No pages match your search.' : 'No pages found yet.' })]));
  const more = $('[data-found-more]');
  if (shown.length > limit) {
    const b = el('button', { class: 'btn btn-outline', type: 'button', text: `Show more (${(shown.length - limit).toLocaleString()} more)` });
    b.addEventListener('click', () => {
      limit += PAGE_SIZE * 5;
      renderList();
    });
    more.replaceChildren(b);
  } else more.replaceChildren();
  updateCounts();
}

// Refresh the "is-selected" styling without re-rendering the list.
list.addEventListener('change', (e) => e.target.closest('.found-row')?.classList.toggle('is-selected', e.target.checked));

function sortPages(all) {
  const home = data.domain.baseUrl + '/';
  return [...all].sort((a, b) => (a.url === home ? -1 : b.url === home ? 1 : 0));
}

async function load() {
  data = await api(`domain?id=${encodeURIComponent(id || '')}`);
  pages = sortPages(data.pages);
  document.title = `Found Pages: ${data.domain.hostname} | AccessBell`;
  $('[data-crumb-host]').replaceChildren(el('a', { href: `/app/domain?id=${encodeURIComponent(id)}`, text: data.domain.hostname }));
  $('[data-found-count]').textContent = pages.length.toLocaleString();
  const monitored = pages.filter((p) => p.monitored);
  const neverScanned = !data.lastScanAt && monitored.length <= 1;
  // First visit: preselect the first 25 pages. Later: the pages already monitored.
  selected = new Set((neverScanned ? pages.slice(0, MAX) : monitored).map((p) => p.id));
  renderList();
}

async function crawl() {
  banner('busy', 'Crawling your website...', ['Reading your sitemap and following the links on your home page. Large sites can take up to a minute.']);
  try {
    const r = await api('domain/discover', { method: 'POST', body: { id } });
    await load();
    setStatus(status, 'success', `Found ${r.found.toLocaleString()} pages.`);
    doneBanner();
  } catch (err) {
    banner('warn', 'We could not crawl your website', [err.message, ' You can still ', el('a', { href: settingsUrl(), text: 'add your XML sitemap' }), ' or add pages by hand.']);
  }
}

// ---------- Add pages ----------

const addDialog = $('[data-add-pages-dialog]');
const addForm = $('[data-add-pages]');
function openAddPages() {
  setStatus($('[data-add-pages-status]'), '', '');
  addDialog.showModal();
  addForm.elements.urls.focus();
}
document.querySelectorAll('[data-close-add-pages]').forEach((b) => b.addEventListener('click', () => addDialog.close()));
addForm.addEventListener(
  'submit',
  busy(addForm.querySelector('[type="submit"]'), $('[data-add-pages-status]'), async () => {
    const urls = addForm.elements.urls.value.split('\n').map((u) => u.trim()).filter(Boolean);
    if (!urls.length) throw new Error('Enter at least one page address.');
    const r = await api('domain/pages/add', { method: 'POST', body: { id, urls } });
    const keep = new Set(selected);
    await load();
    selected = keep;
    for (const p of r.pages) if (selected.size < MAX) selected.add(p.id);
    renderList();
    addForm.reset();
    addDialog.close();
    setStatus(status, 'success', `Added ${r.pages.length} page${r.pages.length === 1 ? '' : 's'}${selected.size >= MAX ? '' : ' and selected them'}.`);
  }),
);

// ---------- Selection and scanning ----------

selectShown.addEventListener('change', () => {
  if (selectShown.checked) {
    for (const p of filtered()) {
      if (selected.size >= MAX) break;
      selected.add(p.id);
    }
    if (filtered().some((p) => !selected.has(p.id))) setStatus(status, '', `Selected the first ${MAX} pages. You can scan up to ${MAX} pages.`);
  } else {
    for (const p of filtered()) selected.delete(p.id);
  }
  renderList();
});
$('[data-clear-selection]').addEventListener('click', () => {
  selected.clear();
  renderList();
});
search.addEventListener('input', () => {
  limit = PAGE_SIZE;
  renderList();
});

startBtn.addEventListener(
  'click',
  busy(startBtn, status, async () => {
    const { pages: chosen } = await api('domain/pages/select', { method: 'POST', body: { id, pageIds: [...selected] } });
    const { total, failed } = await scanWithDialog(chosen);
    const note = failed ? `&scanned=${total - failed}&failed=${failed}` : `&scanned=${total}`;
    location.assign(`/app?done=${encodeURIComponent(data.domain.hostname)}${note}`);
  }),
);

try {
  $('[data-scan-settings]').setAttribute('href', settingsUrl());
  if (!editable) {
    $('[data-open-add-pages]').hidden = true;
    setStatus(status, '', me.subscribed ? 'Only Members and Admins can choose pages and start scans.' : 'Start your free trial to scan pages.');
  }
  $('[data-open-add-pages]').addEventListener('click', openAddPages);
  await load();
  if (!data.discoveredAt && editable) await crawl();
  else doneBanner();
} catch (err) {
  banner('warn', 'Domain not available', [err.message]);
}

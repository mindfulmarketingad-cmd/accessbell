// Domain view: compliance overview, monitored pages and scan settings.
import { api, boot, el, svg, qs, fmtDate, scorePill, busy, can, setStatus, pool } from './core.js';
import { wcagLabel } from './report.js';
import { initTabs } from './tabs.js';

const me = await boot();
const id = qs('id');
const $ = (s) => document.querySelector(s);
initTabs($('[data-tabs]'));

const IMPACT_LABEL = { critical: 'Critical', serious: 'Serious', moderate: 'Moderate', minor: 'Minor' };
let data;

// ---------- Overview ----------

function renderKpis() {
  const total = Object.values(data.impacts).reduce((a, b) => a + b, 0);
  const kpi = (label, value, note) => el('div', { class: 'kpi' }, [el('span', { text: label }), el('strong', { text: value }), note ? el('small', { text: note }) : null]);
  $('[data-kpis]').replaceChildren(
    kpi('Compliance score', data.score === null ? 'n/a' : String(data.score), data.domain.settings.wcagVersion ? `WCAG ${data.domain.settings.wcagVersion} Level ${data.domain.settings.wcagLevel}` : ''),
    kpi('Failing elements', String(total), `${data.rules.length} rules`),
    kpi('Monitored URLs', `${data.monitoredCount} / ${data.monitoredLimit}`),
    kpi('Devices', data.domain.settings.devices.map((d) => d[0].toUpperCase() + d.slice(1)).join(' + ')),
  );
}

function renderRules() {
  const box = $('[data-rules]');
  if (!data.rules.length) {
    box.replaceChildren(el('p', { class: 'muted', text: data.score === null ? 'Run a scan to see issues across the domain.' : 'No automated issues found on monitored pages.' }));
    return;
  }
  box.replaceChildren(
    el(
      'ul',
      { class: 'group-list' },
      data.rules.slice(0, 25).map((r) =>
        el('li', {}, [
          el('div', { class: 'top' }, [el('strong', { text: r.title }), el('span', {}, [el('span', { class: `tag tag-${r.impact}`, text: IMPACT_LABEL[r.impact] }), ' ', el('span', { class: 'tag', text: wcagLabel(r.wcag) })])]),
          el('p', { text: `${r.elements} element${r.elements === 1 ? '' : 's'} on ${r.pages} page${r.pages === 1 ? '' : 's'}` }),
        ]),
      ),
    ),
  );
}

function renderComponents() {
  const box = $('[data-components]');
  if (!data.components.length) {
    box.replaceChildren(el('p', { class: 'muted', text: 'No repeated components found yet. They appear once several pages share the same failing element.' }));
    return;
  }
  box.replaceChildren(
    el(
      'ul',
      { class: 'group-list' },
      data.components.map((c) =>
        el('li', {}, [
          el('div', { class: 'top' }, [el('strong', { text: c.title }), el('span', { class: `tag tag-${c.impact}`, text: `${c.pages} pages` })]),
          el('p', {}, ['Component: ', el('code', { text: c.component })]),
        ]),
      ),
    ),
  );
}

function renderTrend() {
  const box = $('[data-trend]');
  const points = data.trend.map((t) => ({ day: new Date(t.day), score: t.score }));
  if (points.length < 2) {
    box.replaceChildren(el('p', { class: 'muted', text: 'The trend appears after scans on two or more days.' }));
    return;
  }
  const W = 400;
  const H = 120;
  const x = (i) => (i / (points.length - 1)) * (W - 8) + 4;
  const y = (s) => H - 6 - (s / 100) * (H - 12);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.score).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1).toFixed(1)},${H - 6} L${x(0).toFixed(1)},${H - 6} Z`;
  const first = points[0];
  const last = points[points.length - 1];
  box.replaceChildren(
    svg('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none', role: 'img', 'aria-label': `Score went from ${first.score} on ${fmtDate(first.day)} to ${last.score} on ${fmtDate(last.day)}` }, [
      svg('line', { class: 'axis', x1: 0, x2: W, y1: H - 6, y2: H - 6 }),
      svg('path', { class: 'area', d: area }),
      svg('path', { class: 'line', d: line }),
    ]),
    el('p', { class: 'muted mb-0', text: `${fmtDate(first.day)}: ${first.score}  -  ${fmtDate(last.day)}: ${last.score}` }),
  );
}

function renderImpacts() {
  const max = Math.max(1, ...Object.values(data.impacts));
  $('[data-impacts]').replaceChildren(
    ...Object.entries(IMPACT_LABEL).map(([k, label]) => {
      const fill = el('span', { class: 'fill', 'data-impact': k });
      fill.style.setProperty('width', `${Math.round(((data.impacts[k] || 0) / max) * 100)}%`);
      return el('div', { class: 'impact-bar' }, [el('span', { text: label }), el('span', { class: 'track', 'aria-hidden': 'true' }, [fill]), el('span', { class: 'num', text: String(data.impacts[k] || 0) })]);
    }),
  );
}

function renderCriteria() {
  const box = $('[data-criteria]');
  if (!data.criteria.length) {
    box.replaceChildren(el('p', { class: 'muted', text: 'No failing criteria.' }));
    return;
  }
  box.replaceChildren(
    el('table', { class: 'data-table' }, [
      el('caption', { class: 'visually-hidden', text: 'Failing WCAG success criteria' }),
      el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'Criterion' }), el('th', { scope: 'col', class: 'num', text: 'Elements' })])]),
      el('tbody', {}, data.criteria.map((c) => el('tr', {}, [el('th', { scope: 'row', text: c.level === '-' ? 'Best practice' : `${c.sc} (${c.level})` }), el('td', { class: 'num', text: String(c.elements) })]))),
    ]),
  );
}

// ---------- Pages ----------

const canEditPages = () => me.subscribed && can(me, 'member');

async function rescan(page, button) {
  button.disabled = true;
  button.textContent = 'Scanning...';
  try {
    await api('scan', { method: 'POST', body: { pageId: page.id } });
  } finally {
    await load();
  }
}

function renderPages() {
  const monitored = data.pages.filter((p) => p.monitored);
  const found = data.pages.filter((p) => !p.monitored);
  $('[data-monitored-count]').textContent = `${monitored.length} of ${data.monitoredLimit} URLs monitored. Rescans are unlimited.`;
  $('[data-add-page]').hidden = !canEditPages() || monitored.length >= data.monitoredLimit;

  const row = (p) => {
    const actions = el('td', { class: 'actions' });
    if (canEditPages()) {
      const scanBtn = el('button', { class: 'btn btn-outline btn-sm', type: 'button', text: 'Rescan' });
      scanBtn.addEventListener('click', () => rescan(p, scanBtn).catch((e) => setStatus($('[data-page-status]'), 'error', e.message)));
      const stop = el('button', { class: 'btn btn-outline btn-sm', type: 'button', text: 'Stop monitoring' });
      stop.addEventListener('click', busy(stop, $('[data-page-status]'), async () => {
        await api('pages/monitor', { method: 'POST', body: { id: p.id, monitored: false } });
        await load();
      }));
      actions.append(scanBtn, stop);
    }
    return el('tr', {}, [
      el('th', { scope: 'row', class: 'url' }, [p.last_scan_id ? el('a', { href: `/app/scan?id=${p.last_scan_id}`, text: p.url }) : document.createTextNode(p.url)]),
      el('td', { class: 'num' }, [scorePill(p.last_score)]),
      el('td', { class: 'num', text: p.last_issues === null ? '-' : String(p.last_issues) }),
      el('td', {}, [el('a', { href: `/app/page?id=${p.id}`, text: fmtDate(p.last_scanned_at, true), 'aria-label': `Scan history for ${p.url}` })]),
      actions,
    ]);
  };
  $('[data-monitored]').replaceChildren(
    monitored.length
      ? el('div', { class: 'table-wrap' }, [
          el('table', { class: 'data-table' }, [
            el('caption', { class: 'visually-hidden', text: 'Monitored URLs' }),
            el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'URL' }), el('th', { scope: 'col', class: 'num', text: 'Score' }), el('th', { scope: 'col', class: 'num', text: 'Issues' }), el('th', { scope: 'col', text: 'Last scan' }), el('th', { scope: 'col' }, [el('span', { class: 'visually-hidden', text: 'Actions' })])])]),
            el('tbody', {}, monitored.map(row)),
          ]),
        ])
      : el('p', { class: 'muted', text: 'No monitored URLs yet.' }),
  );

  $('[data-found]').replaceChildren(
    found.length
      ? el('div', { class: 'table-wrap' }, [
          el('table', { class: 'data-table' }, [
            el('caption', { class: 'visually-hidden', text: 'Discovered pages' }),
            el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'URL' }), el('th', { scope: 'col', text: 'Found by' }), el('th', { scope: 'col' }, [el('span', { class: 'visually-hidden', text: 'Actions' })])])]),
            el(
              'tbody',
              {},
              found.map((p) => {
                const actions = el('td', { class: 'actions' });
                if (canEditPages()) {
                  const add = el('button', { class: 'btn btn-outline btn-sm', type: 'button', text: 'Monitor', disabled: monitored.length >= data.monitoredLimit });
                  add.addEventListener('click', busy(add, $('[data-page-status]'), async () => {
                    await api('pages/monitor', { method: 'POST', body: { id: p.id, monitored: true } });
                    await load();
                  }));
                  actions.append(add);
                }
                return el('tr', {}, [el('th', { scope: 'row', class: 'url', text: p.url }), el('td', { text: p.source === 'sitemap' ? 'Sitemap' : p.source === 'crawl' ? 'Crawl' : 'Manual' }), actions]);
              }),
            ),
          ]),
        ])
      : el('p', { class: 'muted', text: 'Use "Find pages" to crawl the domain and read its sitemap.' }),
  );
}

// ---------- Settings ----------

function headerRow(h = { name: '', value: '' }) {
  const n = el('input', { type: 'text', 'aria-label': 'Header name', placeholder: 'Authorization', value: h.name, maxlength: 64 });
  const v = el('input', { type: 'text', 'aria-label': 'Header value', placeholder: 'Value', value: h.value, maxlength: 2048, autocomplete: 'off' });
  const remove = el('button', { class: 'btn btn-outline btn-sm', type: 'button', text: 'Remove' });
  const row = el('div', { class: 'header-row field' }, [n, v, remove]);
  remove.addEventListener('click', () => row.remove());
  return row;
}

function renderSettings() {
  const f = $('[data-settings]');
  const s = data.domain.settings;
  f.elements.wcagVersion.value = s.wcagVersion;
  f.elements.wcagLevel.value = s.wcagLevel;
  f.querySelectorAll('[name="device"]').forEach((c) => (c.checked = s.devices.includes(c.value)));
  f.elements.includeSubdomains.checked = s.includeSubdomains;
  f.elements.scroll.checked = s.scroll;
  f.elements.delayMs.value = s.delayMs;
  f.elements.include.value = (s.include || []).join('\n');
  f.elements.exclude.value = (s.exclude || []).join('\n');
  $('[data-header-rows]').replaceChildren(...(s.headers || []).map(headerRow));
  const editable = can(me, 'admin');
  f.querySelectorAll('input, select, textarea, button').forEach((x) => (x.disabled = !editable));
  $('[data-danger]').hidden = !editable;
}

function bindSettings() {
  const f = $('[data-settings]');
  const status = $('[data-settings-status]');
  $('[data-add-header]').addEventListener('click', () => $('[data-header-rows]').append(headerRow()));
  f.addEventListener(
    'submit',
    busy(f.querySelector('button[type="submit"]'), status, async () => {
      const settings = {
        wcagVersion: f.elements.wcagVersion.value,
        wcagLevel: f.elements.wcagLevel.value,
        devices: [...f.querySelectorAll('[name="device"]:checked')].map((c) => c.value),
        includeSubdomains: f.elements.includeSubdomains.checked,
        scroll: f.elements.scroll.checked,
        delayMs: Number(f.elements.delayMs.value || 0),
        include: f.elements.include.value,
        exclude: f.elements.exclude.value,
        headers: [...$('[data-header-rows]').children].map((r) => {
          const [n, v] = r.querySelectorAll('input');
          return { name: n.value.trim(), value: v.value };
        }),
      };
      await api('domain/settings', { method: 'POST', body: { id, settings } });
      await load();
      renderSettings();
      setStatus(status, 'success', 'Settings saved. They apply to the next scan.');
    }),
  );
  const del = $('[data-delete-domain]');
  del.addEventListener(
    'click',
    busy(del, status, async () => {
      if (!confirm(`Remove ${data.domain.hostname} and all of its scan history?`)) return;
      await api('domain/delete', { method: 'POST', body: { id } });
      location.assign('/app');
    }),
  );
}

// ---------- Page actions ----------

function bindActions() {
  const progress = $('[data-progress]');
  const discover = $('[data-discover]');
  const rescanAll = $('[data-rescan-all]');
  const addForm = $('[data-add-page]');
  const pageStatus = $('[data-page-status]');

  discover.addEventListener(
    'click',
    busy(discover, progress, async () => {
      progress.textContent = 'Crawling the domain and reading its sitemap...';
      const r = await api('domain/discover', { method: 'POST', body: { id } });
      progress.textContent = `Found ${r.found} pages (${r.fromSitemap} in the sitemap). ${r.added} new pages are ready to monitor in the Pages tab.`;
      await load();
    }),
  );

  rescanAll.addEventListener(
    'click',
    busy(rescanAll, progress, async () => {
      const pages = data.pages.filter((p) => p.monitored);
      progress.textContent = `Scanning 0 of ${pages.length} pages...`;
      const results = await pool(pages, 2, (p) => api('scan', { method: 'POST', body: { pageId: p.id } }), (done, total) => {
        progress.textContent = `Scanning ${done} of ${total} pages...`;
      });
      const failed = results.filter((r) => r instanceof Error).length;
      progress.textContent = failed ? `Finished with ${failed} page${failed === 1 ? '' : 's'} that could not be scanned.` : `All ${pages.length} pages rescanned.`;
      await load();
    }),
  );

  addForm.addEventListener(
    'submit',
    busy(addForm.querySelector('button'), pageStatus, async () => {
      const url = addForm.elements.url.value.trim();
      if (!url) throw new Error('Enter a page URL.');
      const { page } = await api('pages', { method: 'POST', body: { domainId: id, url } });
      addForm.reset();
      setStatus(pageStatus, 'success', `Monitoring ${page.url}. Scanning it now...`);
      await api('scan', { method: 'POST', body: { pageId: page.id } }).catch(() => {});
      setStatus(pageStatus, 'success', `Added ${page.url}.`);
      await load();
    }),
  );
}

async function load() {
  data = await api(`domain?id=${encodeURIComponent(id || '')}`);
  document.title = `${data.domain.hostname} | AccessBell`;
  $('[data-title]').textContent = data.domain.hostname;
  $('[data-subtitle]').textContent = data.domain.baseUrl;
  $('[data-discover]').hidden = !canEditPages();
  $('[data-rescan-all]').hidden = !canEditPages() || !data.monitoredCount;
  renderKpis();
  renderRules();
  renderComponents();
  renderTrend();
  renderImpacts();
  renderCriteria();
  renderPages();
}

try {
  await load();
  renderSettings();
  bindSettings();
  bindActions();
} catch (err) {
  $('[data-title]').textContent = 'Domain not available';
  $('[data-subtitle]').textContent = err.message;
}

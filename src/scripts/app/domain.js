// Domain view: last scan overview, scan history, WCAG coverage, issues with
// fixes, manual review items, monitored pages and scan settings.
import { api, boot, el, icon, avatar, qs, fmtDate, scorePill, busy, can, setStatus, disclosure } from './core.js';
import { wcagLabel } from './report.js';
import { initTabs } from './tabs.js';
import { scoreRing, historyChart } from './charts.js';
import { fixExample } from '../shared/fix-examples.js';
import { criteriaFor, PRINCIPLES } from '../../../server/wcag-criteria.js';
import { setupTour } from './onboarding.js';
import { codeBlock } from './code-block.js';
import { issueVisual } from '../shared/issue-visuals.js';
import { domainMenu, scanDomainWithDialog, scanMessage, relative, nextScheduledScan } from './domain-actions.js';
import { mountFixInstall, mountFixList, mountStatementFlow, statementUrl, mountToolbar } from './site-tools.js';
import { mountVault } from './vault.js';
import { mountDocuments } from './documents.js';

const me = await boot();
const id = qs('id');
const $ = (s) => document.querySelector(s);
const showTab = initTabs($('[data-tabs]'));

// Pages, PDF documents and settings open as full views from the Manage menu,
// so the tabs stay focused on results: Overview, Issues, Manually Required and the Vault.
const VIEWS = ['pages', 'documents', 'settings'];
let lastTab = 'overview';
function openView(name) {
  $('[data-tabs]').hidden = true;
  document.querySelectorAll('[data-view]').forEach((v) => (v.hidden = v.dataset.view !== name));
  history.replaceState(null, '', `${location.pathname}${location.search}#${name}`);
  $(`[data-view="${name}"] .view-head h2`).focus();
}
function closeViews() {
  const open = document.querySelector('[data-view]:not([hidden])');
  document.querySelectorAll('[data-view]').forEach((v) => (v.hidden = true));
  $('[data-tabs]').hidden = false;
  return Boolean(open);
}
function selectTab(name) {
  if (VIEWS.includes(name)) return openView(name);
  closeViews();
  lastTab = name;
  showTab(name);
}
document.querySelectorAll('[role="tab"]').forEach((t) => t.addEventListener('click', () => (lastTab = t.id.replace(/^tab-/, ''))));

const IMPACT_LABEL = { critical: 'Critical', serious: 'Serious', moderate: 'Moderate', minor: 'Minor' };
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
let data;

const chip = (kind, iconName, text) => el('span', { class: `chip chip-${kind}` }, [iconName ? icon(iconName) : null, text]);
const target = () => ({ version: data.domain.settings.wcagVersion || '2.2', level: data.domain.settings.wcagLevel || 'AA' });

// ---------- Overview: last scan ----------

function renderLso() {
  const { version, level } = target();
  const issues = activeRules().reduce((n, r) => n + r.elements, 0);
  const wcagFailures = data.criteria.some((c) => c.level && c.level !== '-');
  const reviewCount = data.review.reduce((n, r) => n + r.elements, 0);
  const failedCount = data.failedPages.length;
  const failedPct = data.monitoredCount ? Math.round((failedCount / data.monitoredCount) * 100) : 0;
  let state;
  let note;
  if (data.score === null && failedCount) {
    state = ['bad', 'Scan failed'];
    note = 'We could not load your monitored pages. Check the site is online, or add login headers in Settings for password-protected pages.';
  } else if (data.score === null) {
    state = ['none', 'Not scanned yet'];
    note = 'Run a scan to see how this domain measures up.';
  } else if (wcagFailures) {
    state = ['bad', 'Not conformant'];
    note = `Automated tests found failures of WCAG ${version} Level ${level} criteria. Fix them to reduce legal risk.`;
  } else {
    state = ['good', 'No automated failures'];
    note = 'Automated tests found no WCAG failures. Complete the manual review to confirm conformance.';
  }
  const monitoring = me.subscribed && data.monitoredCount > 0;
  const row = (label, value) => el('div', {}, [el('dt', { text: label }), el('dd', {}, [value])]);
  const gotoTab = (name, text) => {
    const b = el('button', { type: 'button', class: 'link-btn', text });
    b.addEventListener('click', () => selectTab(name));
    return b;
  };
  const partial = failedCount && data.score !== null
    ? el('details', { class: 'lso-partial' }, [
        el('summary', {}, [icon('alert'), `Partial scan: ${failedPct}% of pages failed`]),
        el('p', { class: 'muted', text: 'These pages could not be loaded, so their results are missing. Check they are online, or add login headers in Settings if they need a password:' }),
        el('ul', {}, data.failedPages.slice(0, 10).map((u) => el('li', { text: u }))),
      ])
    : null;
  $('[data-lso]').replaceChildren(
    el('div', { class: 'lso-left' }, [
      el('p', { class: `lso-state lso-${state[0]}`, text: state[1] }),
      partial,
      el('p', { class: 'lso-note', text: note }),
      scoreRing(data.score),
      el('p', { class: 'lso-foot' }, [
        el('a', { href: '/blog/what-is-a-website-accessibility-checker#how-results-are-scored', text: 'How we score' }),
        ` against WCAG ${version} Level ${level}`,
      ]),
    ]),
    el('div', { class: 'lso-right' }, [
      el('h3', { class: 'lso-h' }, [gotoTab('issues', 'Automated tests')]),
      el('dl', { class: 'dot-list' }, [
        row('Active issues', chip(issues ? 'bad' : 'ok', 'alert', plural(issues, 'issue'))),
        row('Resolved since last scan', chip('ok', 'check', `${data.resolved} solved`)),
        data.resolutions.length ? row('Marked resolved by your team', chip('ok', 'check', plural(resolvedRules().length, 'issue'))) : null,
        row('Scanned pages', document.createTextNode(`${data.scannedPages} of ${data.monitoredCount}`)),
        row('Last automated scan', document.createTextNode(data.lastScanAt ? relative(data.lastScanAt) : 'Never')),
        row('Next scheduled scan', document.createTextNode(monitoring ? relative(nextScheduledScan()) : 'Not scheduled')),
      ]),
      el('h3', { class: 'lso-h' }, [gotoTab('review', 'Manually required')]),
      el('dl', { class: 'dot-list' }, [row('Items to check', chip(reviewCount ? 'warn' : 'ok', reviewCount ? 'eye' : 'check', reviewCount ? plural(reviewCount, 'item') : 'None flagged'))]),
    ]),
  );
}

// ---------- Overview: scan history ----------

function renderHistory() {
  const days = Number($('[data-range]').value);
  const since = Date.now() - days * 86400000;
  const points = data.history.filter((h) => new Date(h.day).getTime() >= since);
  const box = $('[data-history]');
  if (!points.length) {
    box.replaceChildren(el('div', { class: 'chart-empty' }, [el('p', { text: 'No scans in this period yet. The history fills in as scans run.' })]));
    return;
  }
  box.replaceChildren(historyChart(points, { caption: `Scan history for the last ${days} days` }));
}

// ---------- Overview: coverage by principle ----------

// A small non-modal popup next to a coverage chip, like a tooltip you can click into.
let openPop = null;
function closePop(returnFocus = true) {
  if (!openPop) return;
  const { node, trigger } = openPop;
  openPop = null;
  node.remove();
  trigger.setAttribute('aria-expanded', 'false');
  if (returnFocus) trigger.focus();
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && openPop) closePop();
});
document.addEventListener('click', (e) => {
  if (openPop && !openPop.node.contains(e.target) && !openPop.trigger.contains(e.target)) closePop(false);
});

const issueHref = (ruleId) => `/app/issue?id=${encodeURIComponent(id)}&rule=${encodeURIComponent(ruleId)}`;
const kebab = (s) => s.toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const criterionPath = (c) => `/resources/wcag/${c.sc.replace(/\./g, '-')}-${kebab(c.name)}`;

function popover(trigger, { tone, iconName, title, body }) {
  const was = openPop?.trigger === trigger;
  closePop(false);
  if (was) return;
  const titleId = `pop-${Math.random().toString(36).slice(2, 8)}`;
  const close = el('button', { type: 'button', class: 'icon-btn pop-close' }, [icon('x'), el('span', { class: 'visually-hidden', text: 'Close' })]);
  const node = el('div', { class: `cov-pop cov-pop-${tone}`, role: 'dialog', 'aria-labelledby': titleId }, [
    el('div', { class: 'cov-pop-head' }, [icon(iconName), el('h3', { id: titleId, tabindex: '-1', text: title }), close]),
    ...body,
  ]);
  close.addEventListener('click', () => closePop());
  document.body.append(node);
  const r = trigger.getBoundingClientRect();
  const w = node.offsetWidth;
  const left = Math.min(Math.max(8, r.right + window.scrollX - w), document.documentElement.clientWidth - w - 8);
  node.style.left = `${left}px`;
  node.style.top = `${r.bottom + window.scrollY + 8}px`;
  trigger.setAttribute('aria-expanded', 'true');
  openPop = { node, trigger };
  node.querySelector('h3').focus();
}

const ruleLinks = (rules, tone) =>
  el(
    'ul',
    { class: 'pop-rules' },
    rules.map((r) => el('li', {}, [el('a', { class: `rule-pill rule-${tone}`, href: issueHref(r.id) }, [icon(tone === 'bad' ? 'alert' : 'eye'), el('span', { text: r.id })]), el('small', { text: r.title })])),
  );

function coverageStatus(c) {
  const cov = data.coverage[c.sc] || { issues: 0, passed: false, review: 0, rules: [], reviewRules: [] };
  const trigger = (kind, iconName, text, open) => {
    const b = el('button', { type: 'button', class: `chip chip-${kind} chip-link`, 'aria-haspopup': 'dialog', 'aria-expanded': 'false' }, [icon(iconName), text]);
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      open(b);
    });
    return b;
  };
  const guide = el('a', { href: criterionPath(c), text: `How to test ${c.sc} ${c.name}` });
  const auto = cov.issues
    ? trigger('bad', 'alert', plural(cov.issues, 'issue'), (b) =>
        popover(b, { tone: 'bad', iconName: 'alert', title: 'Automated tests: Failed', body: [el('p', { class: 'pop-label', text: 'Issues failed' }), ruleLinks(cov.rules || [], 'bad')] }),
      )
    : cov.passed
      ? chip('ok', 'check', 'Passed')
      : chip('muted', 'minus', 'Not tested');
  // Every criterion needs a person to confirm it; flagged items and untested criteria come first.
  const manual = cov.review
    ? trigger('warn', 'eye', `Needs review (${cov.review})`, (b) =>
        popover(b, { tone: 'warn', iconName: 'eye', title: 'Manual review: Needs review', body: [el('p', { class: 'pop-label', text: 'Items to check' }), ruleLinks(cov.reviewRules || [], 'warn')] }),
      )
    : cov.issues || cov.passed
      ? trigger('outline', 'eye', 'Spot check', (b) =>
          popover(b, { tone: 'muted', iconName: 'eye', title: 'Spot check', body: [el('p', { text: 'Automated rules cover part of this criterion. A quick manual check confirms the rest.' }), el('p', {}, [guide])] }),
        )
      : trigger('warn-outline', 'eye', 'Needs review', (b) =>
          popover(b, { tone: 'bad', iconName: 'eye', title: 'Manual test needed', body: [el('p', { text: 'No automated test covers this criterion on your pages, so a person needs to check it.' }), el('p', {}, [guide])] }),
        );
  return { cov, auto, manual };
}

function renderCoverage() {
  const { version, level } = target();
  const onlyIssues = $('[data-cov-issues-only]').checked;
  const all = criteriaFor(version, level);
  const tbodies = Object.values(PRINCIPLES).map((principle, index) => {
    const rows = all
      .filter((c) => c.principle === principle)
      .map((c) => ({ c, ...coverageStatus(c) }))
      .filter((r) => !onlyIssues || r.cov.issues);
    const failing = rows.filter((r) => r.cov.issues).length;
    // Perceivable starts open, like the rest of the report's first section.
    const open = index === 0 || onlyIssues;
    const toggle = el('button', { type: 'button', class: 'group-toggle', 'aria-expanded': String(open) }, [
      icon(open ? 'minus' : 'plus'),
      el('span', { text: principle }),
      el('small', { text: failing ? `${plural(failing, 'criterion')} with issues`.replace('criterions', 'criteria') : `${rows.length} criteria` }),
    ]);
    const trs = rows.map((r) =>
      el('tr', { hidden: !open }, [
        el('td', { class: 'cov-principle', text: principle }),
        el('td', { text: r.c.guideline }),
        el('th', { scope: 'row' }, [el('span', { class: 'sc-num', text: r.c.sc }), ` ${r.c.name}`]),
        el('td', {}, [el('span', { class: 'level-badge', text: r.c.level })]),
        el('td', {}, [r.auto]),
        el('td', {}, [r.manual]),
      ]),
    );
    toggle.addEventListener('click', () => {
      const now = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(now));
      toggle.firstChild.replaceWith(icon(now ? 'minus' : 'plus'));
      trs.forEach((tr) => (tr.hidden = !now));
    });
    if (!rows.length) return null;
    return el('tbody', {}, [el('tr', { class: 'group-row' }, [el('th', { colspan: '6', scope: 'colgroup' }, [toggle])]), ...trs]);
  });
  $('[data-cov-sub]').textContent = `All ${all.length} success criteria in WCAG ${version} Level ${level}, grouped by principle. For each one you can see what automated testing found and whether it needs a person to check it.`;
  const bodies = tbodies.filter(Boolean);
  $('[data-coverage]').replaceChildren(
    bodies.length
      ? el('div', { class: 'table-wrap cov-wrap', role: 'region', 'aria-label': 'WCAG coverage table', tabindex: '0' }, [
          el('table', { class: 'data-table cov-table' }, [
            el('caption', { class: 'visually-hidden', text: `Test coverage for WCAG ${version} Level ${level}` }),
            el('thead', {}, [el('tr', {}, ['WCAG principle', 'Guideline', 'Success criterion', 'Level', 'Issues', 'Manually required'].map((h) => el('th', { scope: 'col', text: h })))]),
            ...bodies,
          ]),
        ])
      : el('p', { class: 'muted', text: 'No criteria with issues. Clear the filter to see every criterion.' }),
  );
}

function renderComponents() {
  const box = $('[data-components]');
  if (!data.components.length) {
    box.replaceChildren(el('p', { class: 'muted mb-0', text: 'No repeated components found yet. They appear once several pages share the same failing element.' }));
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

// ---------- Issues ----------

function issueDetails(r) {
  const ex = fixExample(r.id);
  const where = r.samples.length
    ? el('ul', { class: 'sample-list' }, r.samples.map((s) => el('li', {}, [s.url ? el('span', { class: 'sample-url', text: s.url }) : null, el('pre', {}, [el('code', { text: s.code })])])))
    : el('p', { class: 'muted', text: 'No element snippets were captured for this rule.' });
  const steps = ex
    ? el('ol', { class: 'fix-steps' }, ex.steps.map(([t, d]) => el('li', {}, [el('strong', { text: `${t}: ` }), d])))
    : el('p', { text: r.fix || 'Follow the detailed guidance linked below.' });
  const guidance = r.helpUrl && r.helpUrl.startsWith('https://') ? el('a', { href: r.helpUrl, target: '_blank', rel: 'noopener noreferrer', text: 'Detailed guidance for this rule (opens in a new tab)' }) : null;
  return el('div', { class: 'issue-body' }, [
    el('h3', {}, ['1. What is ', el('span', { class: 'accent-text', text: 'wrong' })]),
    el('p', { text: r.description || r.title }),
    issueVisual(r),
    el('h3', {}, ['2. Where it ', el('span', { class: 'accent-text', text: 'happens' })]),
    el('p', { class: 'muted', text: `${plural(r.elements, 'element')} on ${plural(r.pages, 'page')}${r.samples.length ? '. Examples:' : '.'}` }),
    where,
    el('h3', {}, ['3. How to ', el('span', { class: 'accent-text', text: 'solve it' })]),
    steps,
    ex ? codeBlock(ex.code, 'Correct markup solutions') : null,
    r.fix && ex ? el('p', { class: 'muted' }, [el('strong', { text: 'For your page: ' }), r.fix]) : null,
    guidance ? el('p', {}, [guidance]) : null,
    el('p', { class: 'no-print' }, [el('a', { class: 'btn btn-outline btn-sm', href: issueHref(r.id) }, ['View every failed element and fixes ', icon('arrow')])]),
  ]);
}

const ruleOf = new WeakMap();

// Printing (or saving as PDF) shows every issue with its fix.
window.addEventListener('beforeprint', () => {
  document.querySelectorAll('.issue-acc').forEach((d) => {
    if (d.children.length === 1 && ruleOf.has(d)) d.append(issueDetails(ruleOf.get(d)));
    d.open = true;
  });
});

// ---------- Issues: manual resolutions ----------

const canResolve = () => can(me, 'member');
const domainResolution = (rule) => data.resolutions.find((x) => x.rule === rule && !x.pageId);
const pageResolution = (rule, pageId) => domainResolution(rule) || data.resolutions.find((x) => x.rule === rule && x.pageId === pageId);
const pagesWith = (rule) => data.pageIssues.filter((p) => p.rules[rule]);

/** A rule with its counts limited to the pages nobody has marked resolved. */
function activeView(r) {
  if (domainResolution(r.id)) return null;
  const hit = pagesWith(r.id);
  const open = hit.filter((p) => !pageResolution(r.id, p.pageId));
  if (!open.length) return null;
  if (open.length === hit.length) return r;
  return { ...r, pages: open.length, elements: open.reduce((n, p) => n + p.rules[r.id], 0), pageUrls: open.map((p) => p.url) };
}
const activeRules = () => data.rules.map(activeView).filter(Boolean);
const resolvedRules = () => data.rules.filter((r) => !activeView(r));

async function setResolved(on, { rule, title, pageId, note }) {
  await api(on ? 'domain/issue/resolve' : 'domain/issue/reopen', { method: 'POST', body: { id, rule, title, pageId, note } });
  await load();
}

/** "Mark as resolved" that opens a short form for an optional note. */
function resolveControl({ rule, title, pageId, label }) {
  if (!canResolve()) return null;
  const status = $('[data-issue-status]');
  const wrap = el('div', { class: 'resolve-ctl' });
  const open = el('button', { class: 'btn btn-outline btn-sm', type: 'button' }, [icon('check'), label]);
  const noteId = `note-${rule}-${pageId || 'all'}`;
  const form = el('form', { class: 'resolve-form', hidden: true }, [
    el('label', { for: noteId, text: 'Note for your records (optional)' }),
    el('input', { id: noteId, type: 'text', maxlength: 500, placeholder: 'For example: fixed in release 4.2, or not an issue because...' }),
    el('div', { class: 'fix-row' }, [
      el('button', { class: 'btn btn-sm', type: 'submit', text: 'Mark as resolved' }),
      el('button', { class: 'btn btn-outline btn-sm', type: 'button', 'data-cancel': '', text: 'Cancel' }),
    ]),
  ]);
  open.addEventListener('click', () => {
    open.hidden = true;
    form.hidden = false;
    form.querySelector('input').focus();
  });
  form.querySelector('[data-cancel]').addEventListener('click', () => {
    form.hidden = true;
    open.hidden = false;
    open.focus();
  });
  form.addEventListener(
    'submit',
    busy(form.querySelector('[type="submit"]'), status, async () => {
      await setResolved(true, { rule, title, pageId, note: form.querySelector('input').value });
      setStatus(status, 'success', `Marked "${title}" as resolved${pageId ? ' on that page' : ''}. It is saved in the Compliance Vault.`);
    }),
  );
  wrap.append(open, form);
  return wrap;
}

function reopenButton({ rule, title, pageId }) {
  if (!canResolve()) return null;
  const b = el('button', { class: 'btn btn-outline btn-sm', type: 'button' }, ['Reopen', el('span', { class: 'visually-hidden', text: ` ${title}` })]);
  const status = $('[data-issue-status]');
  b.addEventListener(
    'click',
    busy(b, status, async () => {
      await setResolved(false, { rule, title, pageId });
      setStatus(status, 'success', `Reopened "${title}".`);
    }),
  );
  return b;
}

// ---------- Issues: by issue and by page ----------

let issueView = 'issue';

function issueSummary(r) {
  return el('summary', {}, [
    el('span', { class: `sev-dot sev-${r.impact}`, 'aria-hidden': 'true' }),
    el('span', { class: 'issue-acc-title', text: r.title }),
    el('span', { class: 'issue-acc-meta' }, [
      el('span', { class: `tag tag-${r.impact}`, text: IMPACT_LABEL[r.impact] }),
      el('span', { class: 'tag', text: wcagLabel(r.wcag) }),
      chip('bad', 'alert', String(r.elements)),
    ]),
  ]);
}

function byIssueList(rules) {
  return el(
    'div',
    { class: 'issue-acc-list' },
    rules.map((r) => {
      const details = el('details', { class: 'issue-acc' }, [issueSummary(r)]);
      details.addEventListener('toggle', () => {
        if (details.open && details.children.length === 1) {
          const body = issueDetails(r);
          const ctl = resolveControl({ rule: r.id, title: r.title, label: r.pages > 1 ? `Mark as resolved on all ${r.pages} pages` : 'Mark as resolved' });
          if (ctl) body.append(el('div', { class: 'resolve-bar' }, [ctl]));
          details.append(body);
        }
      });
      ruleOf.set(details, r);
      return details;
    }),
  );
}

function byPageList(filter) {
  const ruleById = new Map(data.rules.map((r) => [r.id, r]));
  const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  const pages = data.pageIssues
    .map((p) => {
      const rules = Object.entries(p.rules)
        .map(([rid, count]) => ({ r: ruleById.get(rid), count }))
        .filter(({ r }) => r && !pageResolution(r.id, p.pageId) && (!filter || r.impact === filter))
        .sort((a, b) => order[a.r.impact] - order[b.r.impact] || b.count - a.count);
      return { ...p, list: rules, total: rules.reduce((n, x) => n + x.count, 0) };
    })
    .filter((p) => p.list.length)
    .sort((a, b) => b.total - a.total);
  if (!pages.length) return el('p', { class: 'muted', text: 'No pages have active issues for this filter.' });
  return el(
    'div',
    { class: 'issue-acc-list' },
    pages.map((p) =>
      el('details', { class: 'issue-acc page-acc' }, [
        el('summary', {}, [
          icon('doc'),
          el('span', { class: 'issue-acc-title page-acc-url', text: p.url.replace(/^https?:\/\/[^/]+/, '') || '/' }),
          el('span', { class: 'issue-acc-meta' }, [el('span', { class: 'tag', text: plural(p.list.length, 'issue') }), chip('bad', 'alert', String(p.total))]),
        ]),
        el(
          'ul',
          { class: 'page-issues' },
          p.list.map(({ r, count }) =>
            el('li', {}, [
              el('div', { class: 'page-issue-main' }, [
                el('span', { class: `tag tag-${r.impact}`, text: IMPACT_LABEL[r.impact] }),
                el('a', { href: issueHref(r.id), text: r.title }),
                el('span', { class: 'muted', text: ` ${plural(count, 'element')}, ${wcagLabel(r.wcag)}` }),
              ]),
              resolveControl({ rule: r.id, title: r.title, pageId: p.pageId, label: 'Mark resolved on this page' }),
            ]),
          ),
        ),
      ]),
    ),
  );
}

function renderResolved() {
  const ruleById = new Map(data.rules.map((r) => [r.id, r]));
  const urlOf = new Map(data.pages.map((p) => [p.id, p.url]));
  const items = data.resolutions.filter((x) => ruleById.has(x.rule));
  $('[data-resolved-wrap]').hidden = !items.length;
  $('[data-count-resolved]').textContent = items.length ? String(items.length) : '';
  $('[data-resolved]').replaceChildren(
    el(
      'ul',
      { class: 'review-list resolved-list' },
      items.map((x) => {
        const r = ruleById.get(x.rule);
        const where = x.pageId ? `On ${urlOf.get(x.pageId) || 'one page'}` : 'On every page';
        const who = [x.resolvedBy, fmtDate(x.resolvedAt, true)].filter(Boolean).join(', ');
        return el('li', {}, [
          el('div', {}, [
            el('a', { class: 'review-title', href: issueHref(r.id) }, [el('strong', { text: r.title })]),
            el('p', { class: 'muted', text: `${where}. Marked resolved${who ? ` by ${who}` : ''}.` }),
            x.note ? el('p', { class: 'resolved-note', text: `Note: ${x.note}` }) : null,
          ]),
          reopenButton({ rule: r.id, title: r.title, pageId: x.pageId }),
        ]);
      }),
    ),
  );
}

function renderRules() {
  const filter = $('[data-issue-filter]').value;
  const active = activeRules();
  const rules = active.filter((r) => !filter || r.impact === filter);
  $('[data-count-issues]').textContent = active.length ? String(active.length) : '';
  $('[data-issues-sub]').textContent = active.length
    ? `${plural(active.length, 'issue')} failing across ${plural(data.scannedPages, 'page')}. ${issueView === 'page' ? 'Open a page to see its issues.' : 'Open an issue to see where it happens and how to fix it.'}`
    : '';
  document.querySelectorAll('[data-issue-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.issueView === issueView)));
  renderResolved();
  const box = $('[data-rules]');
  if (!active.length) {
    const none = data.score === null;
    box.replaceChildren(
      el('div', { class: 'empty-state empty-sm' }, [
        el('h2', { text: none ? 'No scans yet' : data.rules.length ? 'All issues marked as resolved' : 'No automated issues' }),
        el('p', { text: none ? 'Run a scan to see issues across the domain.' : 'Nothing is left in the active list. Check the Manually Required tab next.' }),
      ]),
    );
    return;
  }
  box.replaceChildren(issueView === 'page' ? byPageList(filter) : rules.length ? byIssueList(rules) : el('p', { class: 'muted', text: 'No issues match this filter.' }));
}

// ---------- Overview: lawsuit risk ----------

// An estimate from the accessibility score: the lower the score, the more
// barriers an automated test (like the ones plaintiffs' firms use) can find.
const RISK_BANDS = [
  { min: 90, label: 'Low', tone: 'ok', text: 'Few automated issues remain. Keep monitoring, complete the manual checks and publish an accessibility statement.' },
  { min: 75, label: 'Moderate', tone: 'warn', text: 'Some barriers are easy to find with automated tools. Fix critical and serious issues first.' },
  { min: 50, label: 'High', tone: 'bad', text: 'Many barriers are easy to find with automated tools, which is how most demand letters start. Prioritize critical and serious issues on key pages.' },
  { min: 0, label: 'Very high', tone: 'bad', text: 'Barriers are widespread. Start with critical issues on your home page, checkout, forms and other key journeys.' },
];

function renderRisk() {
  const box = $('[data-risk]');
  if (data.score === null) {
    box.replaceChildren(el('p', { class: 'muted', text: 'Run a scan to estimate your lawsuit risk.' }));
    return;
  }
  const risk = Math.max(0, Math.min(100, 100 - data.score));
  const band = RISK_BANDS.find((b) => data.score >= b.min);
  const critical = activeRules().filter((r) => r.impact === 'critical').length;
  const meter = el('div', { class: 'risk-meter', role: 'img', 'aria-label': `Lawsuit risk ${risk} out of 100, ${band.label}` }, [el('span', { class: 'risk-marker' })]);
  meter.firstChild.style.setProperty('left', `${risk}%`);
  box.replaceChildren(
    el('div', { class: 'risk-row' }, [
      el('div', { class: 'risk-num' }, [el('strong', { text: String(risk) }), el('span', { text: '/100' })]),
      el('div', { class: 'risk-main' }, [
        el('p', { class: `risk-label risk-${band.tone}`, text: `${band.label} risk` }),
        meter,
        el('div', { class: 'risk-scale', 'aria-hidden': 'true' }, [el('span', { text: 'Low' }), el('span', { text: 'Moderate' }), el('span', { text: 'High' }), el('span', { text: 'Very high' })]),
      ]),
    ]),
    el('p', { text: band.text + (critical ? ` ${plural(critical, 'critical issue')} still open.` : '') }),
    el('p', { class: 'muted risk-note' }, [
      `Based on your accessibility score of ${data.score}/100 (risk = 100 minus the score). It is an estimate, not legal advice or a guarantee: lawsuits also depend on your industry, location and traffic. `,
      el('a', { href: '/state-accessibility-laws', text: 'Accessibility laws by state' }),
      '.',
    ]),
  );
}

function renderReview() {
  const total = data.review.reduce((n, r) => n + r.elements, 0);
  $('[data-count-review]').textContent = total ? String(total) : '';
  const box = $('[data-review]');
  if (!data.review.length) {
    box.replaceChildren(el('div', { class: 'empty-state empty-sm' }, [el('h2', { text: 'Nothing flagged' }), el('p', { text: 'Still test key pages with a keyboard and a screen reader. Automated tools cannot judge everything.' })]));
    return;
  }
  box.replaceChildren(
    el(
      'ul',
      { class: 'review-list' },
      data.review.map((r) =>
        el('li', {}, [
          el('div', {}, [
            el('a', { class: 'review-title', href: issueHref(r.id) }, [el('strong', { text: r.title })]),
            el('p', { class: 'muted', text: `${plural(r.elements, 'element')} on ${plural(r.pages, 'page')} - ${wcagLabel(r.wcag)}` }),
          ]),
          el('a', { class: 'btn btn-outline btn-sm', href: issueHref(r.id), text: 'View elements to check' }),
        ]),
      ),
    ),
  );
}

// ---------- Export ----------

function exportCsv() {
  const cell = (v) => {
    const t = String(v ?? '');
    return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  const rows = [['Issue', 'Status', 'Severity', 'WCAG', 'Elements', 'Pages', 'Affected URLs', 'How to fix']];
  for (const r of data.rules) {
    const a = activeView(r);
    rows.push([r.title, a ? 'Open' : 'Marked resolved', IMPACT_LABEL[r.impact], wcagLabel(r.wcag), (a || r).elements, (a || r).pages, ((a || r).pageUrls || []).join(' '), r.fix]);
  }
  // Spreadsheet apps treat cells starting with = + - @ as formulas; prefix them.
  const safe = rows.map((row) => row.map((v) => (/^[=+\-@]/.test(String(v ?? '')) ? `'${v}` : v)));
  const blob = new Blob(['\ufeff' + safe.map((row) => row.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = el('a', { href: URL.createObjectURL(blob), download: `${data.domain.hostname}-accessibility-issues-${new Date().toISOString().slice(0, 10)}.csv` });
  document.body.append(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 0);
}

// ---------- Pages ----------

const canEditPages = () => me.subscribed && can(me, 'member');

async function rescan(page, button) {
  button.disabled = true;
  button.classList.add('is-busy');
  button.setAttribute('aria-busy', 'true');
  button.textContent = 'Scanning...';
  // Announce it too, since the button label is replaced when the table redraws.
  setStatus($('[data-page-status]'), '', `Scanning ${page.url}...`);
  try {
    await api('scan', { method: 'POST', body: { pageId: page.id } });
    await load();
    setStatus($('[data-page-status]'), 'success', `Scanned ${page.url}.`);
  } catch (err) {
    await load();
    throw err;
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
      const scanBtn = el('button', { class: 'btn btn-sm', type: 'button', text: 'Scan now' });
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
      : el('p', { class: 'muted' }, ['No other pages found yet. ', el('a', { href: `/app/pages?id=${encodeURIComponent(id)}`, text: 'Manage domain pages' }), ' to crawl the site and choose pages.']),
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
  f.elements.sitemapUrl.value = s.sitemapUrl || '';
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
        sitemapUrl: f.elements.sitemapUrl.value.trim(),
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

function openFixSetup() {
  selectTab('settings');
  $('#accessbellfix').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('#accessbellfix').focus({ preventScroll: true });
}

function bindActions() {
  const progress = $('[data-progress]');
  const setExport = disclosure($('[data-export]'), $('#export-menu'));
  $('[data-export-csv]').addEventListener('click', () => {
    setExport(false);
    exportCsv();
  });
  $('[data-export-print]').addEventListener('click', () => {
    setExport(false);
    window.print();
  });
  document.querySelectorAll('[data-goto]').forEach((b) => b.addEventListener('click', () => selectTab(b.dataset.goto)));
  $('[data-goto-fix]').addEventListener('click', openFixSetup);
  $('[data-range]').addEventListener('change', renderHistory);
  $('[data-cov-issues-only]').addEventListener('change', renderCoverage);
  $('[data-issue-filter]').addEventListener('change', renderRules);
  document.querySelectorAll('[data-issue-view]').forEach((b) =>
    b.addEventListener('click', () => {
      issueView = b.dataset.issueView;
      renderRules();
    }),
  );
  const setManage = disclosure($('[data-manage]'), $('#manage-menu'));
  document.querySelectorAll('[data-open-view]').forEach((b) =>
    b.addEventListener('click', () => {
      setManage(false);
      openView(b.dataset.openView);
    }),
  );
  document.querySelectorAll('[data-close-view]').forEach((b) => b.addEventListener('click', () => selectTab(lastTab)));
  const rescanAll = $('[data-rescan-all]');
  const addForm = $('[data-add-page]');
  const pageStatus = $('[data-page-status]');

  rescanAll.addEventListener(
    'click',
    busy(rescanAll, progress, async () => {
      const result = await scanDomainWithDialog(id);
      await load();
      progress.textContent = scanMessage(result, data.domain.hostname);
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
  $('[data-domain-avatar]').replaceChildren(avatar(data.domain.hostname, 'avatar-lg'));
  $('[data-domain-menu]').replaceChildren(
    domainMenu(me, { id, hostname: data.domain.hostname, scanned: data.score !== null, monitored: data.monitoredCount }, {
      onRescan: () => $('[data-rescan-all]').click(),
      onAddSubdomain: () => location.assign(`/app?add=1&sub=${encodeURIComponent(data.domain.hostname)}`),
      onRemoved: () => location.assign('/app'),
    }),
  );
  const last = $('[data-last-scan]');
  last.hidden = !data.lastScanAt;
  if (data.lastScanAt) last.lastElementChild.textContent = `Last scan: ${relative(data.lastScanAt)}`;
  $('[data-rescan-all]').hidden = !canEditPages() || !data.monitoredCount;
  renderLso();
  renderRisk();
  renderHistory();
  renderCoverage();
  renderComponents();
  renderRules();
  renderReview();
  renderPages();
}

// ---------- AccessBellFix and statement (Settings tab) ----------

async function renderSiteTools() {
  const installBox = $('[data-fix-install]');
  const listBox = $('[data-fix-list]');
  const stBox = $('[data-statement]');
  let setup;
  try {
    setup = await mountFixList(listBox, { domainId: id, canEdit: can(me, 'member') });
  } catch (err) {
    installBox.replaceChildren(el('p', { class: 'muted', text: err.message }));
    listBox.replaceChildren();
    stBox.replaceChildren(el('p', { class: 'muted', text: err.message }));
    return;
  }
  const seenRecently = setup.seenAt && Date.now() - new Date(setup.seenAt).getTime() < 7 * 86400000;
  $('[data-fix-promo]').hidden = Boolean(seenRecently) || !can(me, 'member');
  document.addEventListener('accessbellfix:connected', () => {
    $('[data-fix-promo]').hidden = true;
  });
  mountFixInstall(installBox, { domainId: id, hostname: data.domain.hostname, siteKey: setup.siteKey, headingLevel: 'h3' });
  mountToolbar($('[data-toolbar]'), { domainId: id, canEdit: can(me, 'admin'), fixConnected: Boolean(seenRecently) }).catch((err) =>
    $('[data-toolbar]').replaceChildren(el('p', { class: 'muted', text: err.message })),
  );

  const showStatement = async () => {
    const r = await api(`domain/statement?id=${encodeURIComponent(id)}`);
    const edit = el('button', { class: 'btn', type: 'button', text: r.statement ? 'Edit statement' : 'Create statement' });
    edit.hidden = !can(me, 'admin');
    edit.addEventListener('click', () => {
      const flow = el('div', { class: 'statement-flow' });
      stBox.replaceChildren(flow);
      mountStatementFlow(flow, {
        domain: { id, hostname: data.domain.hostname, settings: data.domain.settings },
        siteKey: r.siteKey,
        existing: r.statement,
        me,
        finishLabel: 'Done',
        onFinish: showStatement,
        onExit: showStatement,
      });
    });
    const link = statementUrl(r.siteKey);
    stBox.replaceChildren(
      r.statement
        ? el('p', {}, [
            `Last updated ${fmtDate(r.statement.updatedAt)}. Your hosted statement: `,
            el('a', { href: link, target: '_blank', rel: 'noopener', text: 'open it (new tab)' }),
            '. Link to it from your site footer.',
          ])
        : el('p', { class: 'muted', text: 'You have not created a statement for this domain yet. It takes about two minutes.' }),
      edit,
    );
  };
  await showStatement().catch((err) => stBox.replaceChildren(el('p', { class: 'muted', text: err.message })));
}

try {
  await load();
  renderSettings();
  bindSettings();
  bindActions();
  const vault = mountVault({ panel: $('#panel-vault'), box: $('[data-vault]'), domainId: id, me, selectTab });
  mountDocuments({ panel: $('#panel-documents'), box: $('[data-documents]'), domainId: id, me });
  $('[data-export-vault]').addEventListener('click', () => {
    $('[data-export]').click();
    vault.openPackage();
  });
  const params = new URLSearchParams(location.search);
  const tab = params.get('tab');
  const hashView = location.hash.slice(1);
  if (['overview', 'issues', 'review', 'vault', ...VIEWS].includes(tab)) selectTab(tab);
  else if (VIEWS.includes(hashView)) openView(hashView);
  if (params.get('setup') === 'fix') openFixSetup();
  const exp = params.get('export');
  if (exp) history.replaceState(null, '', `${location.pathname}?id=${encodeURIComponent(id)}`);
  if (exp === 'csv') exportCsv();
  if (exp === 'pdf') setTimeout(() => window.print(), 300);
  renderSiteTools();
  if (!tab && !exp) setupTour(me, 'domain', { selectTab });
} catch (err) {
  $('[data-title]').textContent = 'Domain not available';
  $('[data-progress]').textContent = err.message;
}

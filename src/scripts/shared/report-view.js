// Report rendering with WCAG filters, shared by the free scanner and the
// dashboard. All report data is inserted with textContent, never as HTML.
import { CRITERIA, PRINCIPLES, LEVEL_RANK, VERSION_RANK, criterion, withinTarget } from '../../../server/wcag-criteria.js';
import { issueVisual } from './issue-visuals.js';

const IMPACTS = ['critical', 'serious', 'moderate', 'minor'];
const IMPACT_LABEL = { critical: 'Critical', serious: 'Serious', moderate: 'Moderate', minor: 'Minor' };

// ---------- DOM helpers ----------

export function el(tag, attrs, children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'text') node.textContent = v;
    else if (v === true) node.setAttribute(k, '');
    else node.setAttribute(k, String(v));
  }
  for (const c of children || []) if (c !== null && c !== undefined && c !== false) node.append(c);
  return node;
}

const checkIcon = () => {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  for (const [k, v] of Object.entries({ viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'aria-hidden': 'true' })) svg.setAttribute(k, v);
  const p = document.createElementNS(ns, 'path');
  p.setAttribute('d', 'M20 6 9 17l-5-5');
  svg.append(p);
  return svg;
};

// ---------- WCAG helpers ----------

/** Fill in name, version, level and principle for older results that lack them. */
const refs = (item) => (item.wcag || []).map((w) => ({ ...w, ...(criterion(w.sc) || {}) }));

export const wcagLabel = (list) =>
  (list || []).map((w) => (w.level === '-' || !w.level ? 'Best practice' : `WCAG ${w.sc} (${w.level})`)).join(', ');

/** Version and level a scan was run against, from a free-scan standard id or a stored label. */
export function scopeOf(standard) {
  if (standard && typeof standard === 'object') {
    const m = /^wcag(2)(\d)-(A{1,3})$/.exec(standard.id || '');
    if (m) return { version: `${m[1]}.${m[2]}`, level: m[3] };
    return { wcag22: { version: '2.2', level: 'AA' }, wcag21: { version: '2.1', level: 'AA' }, ada: { version: '2.1', level: 'AA' }, en301549: { version: '2.1', level: 'AA' }, section508: { version: '2.0', level: 'AA' } }[standard.id] || scopeOf(standard.label);
  }
  const m = /WCAG (2\.[012])(?: Level)? (A{1,3})/.exec(String(standard || ''));
  return m ? { version: m[1], level: m[2] } : { version: '2.2', level: 'AA' };
}

export function matches(item, f, { useImpact = true } = {}) {
  const r = refs(item);
  if (f.sc && !r.some((x) => x.sc === f.sc)) return false;
  if (f.principle && !r.some((x) => x.principle === f.principle)) return false;
  if (useImpact && item.impact && !f.impacts.has(item.impact)) return false;
  const known = r.filter((x) => x.version);
  // Best-practice rules have no WCAG criterion; show them only when no target narrows the view.
  if (!known.length) return f.version === '2.2' && f.level === 'AAA';
  return known.some((x) => withinTarget(x, f.version, f.level));
}

// ---------- Report body ----------

const helpLink = (href, label) =>
  href && href.startsWith('https://') ? el('a', { href, rel: 'noopener noreferrer', target: '_blank', text: `${label} (opens in a new tab)` }) : null;

/**
 * Issues, manual-review items and passes. `level` is the heading level for
 * section headings (item titles use level + 1).
 */
export function renderReport(scan, { level = 2, emptyText } = {}) {
  const H = `h${level}`;
  const H2 = `h${Math.min(level + 1, 6)}`;
  const body = el('div', { class: 'results-body' });
  const issues = scan.issues || [];

  if (issues.length) {
    body.append(el(H, { class: 'h3-size', text: `Issues to fix (${issues.length})` }));
    const list = el('ul', { class: 'issue-list' });
    for (const issue of issues) {
      const item = el('li', { class: 'issue' }, [
        el('div', { class: 'issue-top' }, [
          el(H2, { class: 'h4-size', text: issue.title + (issue.count > 1 ? ` - ${issue.count} instances` : '') }),
          el('span', {}, [el('span', { class: `tag tag-${issue.impact}`, text: IMPACT_LABEL[issue.impact] || issue.impact }), ' ', el('span', { class: 'tag', text: wcagLabel(refs(issue)) })]),
        ]),
        el('p', { text: issue.description }),
        el('p', {}, [el('strong', { text: 'How to fix: ' }), issue.fix]),
      ]);
      const link = helpLink(issue.helpUrl, 'Learn how to fix this');
      if (link) item.append(el('p', {}, [link]));
      item.append(issueVisual(issue));
      for (const s of issue.samples || []) item.append(el('pre', {}, [el('code', { text: s })]));
      list.append(item);
    }
    body.append(list);
  } else {
    body.append(el(H, { class: 'h3-size', text: emptyText ? 'No matching issues' : 'No automated issues found' }), el('p', { text: emptyText || 'Follow up with keyboard and screen reader testing to cover what automation cannot.' }));
  }

  const review = scan.review || [];
  if (review.length) {
    body.append(el(H, { class: 'h3-size', text: `Needs manual review (${review.length})` }), el('p', { class: 'muted', text: 'Automated testing could not decide these. A person should check them.' }));
    const list = el('ul', { class: 'issue-list' });
    for (const r of review) {
      const li = el('li', { class: 'issue' }, [
        el('div', { class: 'issue-top' }, [el(H2, { class: 'h4-size', text: r.title + (r.count > 1 ? ` - ${r.count} elements` : '') }), el('span', { class: 'tag', text: wcagLabel(refs(r)) })]),
      ]);
      const link = helpLink(r.helpUrl, 'How to review this');
      if (link) li.append(el('p', {}, [link]));
      list.append(li);
    }
    body.append(list);
  }

  const passes = scan.passes || [];
  if (passes.length) {
    body.append(el(H, { class: 'h3-size', text: `Checks passed (${passes.length})` }));
    body.append(el('ul', { class: 'pass-list' }, passes.map((p) => el('li', {}, [checkIcon(), el('span', { text: `${p.title} (${wcagLabel(refs(p))})` })]))));
  }
  for (const n of scan.notes || []) body.append(el('p', { class: 'muted mb-0', text: n }));
  return body;
}

// ---------- Filter bar ----------

let uid = 0;

const select = (id, label, options, value) =>
  el('div', { class: 'field' }, [
    el('label', { for: id, text: label }),
    el('select', { id }, options.map(([v, t]) => el('option', { value: v, text: t, selected: v === value }))),
  ]);

/**
 * Render a report with filters for WCAG version, level, principle, success
 * criterion and severity. Filtering happens in the browser, so it is instant.
 */
export function mountFilteredReport(container, scan, { level = 2 } = {}) {
  const scope = scopeOf(scan.standard);
  const id = `rf${++uid}`;
  const initial = () => ({ version: scope.version, level: scope.level, principle: '', sc: '', impacts: new Set(IMPACTS) });
  let f = initial();

  // Criteria present in this report, for the criterion menu.
  const present = new Map();
  for (const item of [...(scan.issues || []), ...(scan.review || [])]) {
    for (const r of refs(item)) if (r.version) present.set(r.sc, (present.get(r.sc) || 0) + (item.count || 1));
  }
  const scOptions = [['', 'All criteria'], ...[...present.keys()].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map((sc) => [sc, `${sc} ${CRITERIA[sc].name} (${present.get(sc)})`])];

  const form = el('form', { class: 'report-filters', 'aria-label': 'Filter results', novalidate: true }, [
    el('div', { class: 'report-filters-row' }, [
      select(`${id}-v`, 'WCAG version', [['2.0', 'WCAG 2.0'], ['2.1', 'WCAG 2.1'], ['2.2', 'WCAG 2.2']], f.version),
      select(`${id}-l`, 'Level', [['A', 'Level A'], ['AA', 'Level AA'], ['AAA', 'Level AAA']], f.level),
      select(`${id}-p`, 'Principle', [['', 'All principles'], ...Object.values(PRINCIPLES).map((p) => [p, p])], ''),
      select(`${id}-c`, 'Success criterion', scOptions, ''),
    ]),
    el('fieldset', { class: 'report-filters-impact' }, [
      el('legend', { text: 'Severity' }),
      ...IMPACTS.map((imp) => el('label', {}, [el('input', { type: 'checkbox', value: imp, checked: true }), ` ${IMPACT_LABEL[imp]}`])),
    ]),
    el('div', { class: 'report-filters-foot' }, [
      el('p', { class: 'report-filters-summary', role: 'status', 'aria-live': 'polite' }),
      el('button', { class: 'btn btn-outline btn-sm', type: 'reset', text: 'Reset filters' }),
    ]),
  ]);
  const summary = form.querySelector('.report-filters-summary');
  const bodySlot = el('div');
  container.replaceChildren(form, bodySlot);

  const count = (list) => list.reduce((n, i) => n + (i.count || 1), 0);

  function apply() {
    const issues = (scan.issues || []).filter((i) => matches(i, f));
    const review = (scan.review || []).filter((i) => matches(i, f, { useImpact: false }));
    const passes = (scan.passes || []).filter((i) => matches(i, f, { useImpact: false }));
    const narrowed = issues.length !== (scan.issues || []).length;
    bodySlot.replaceChildren(
      renderReport({ ...scan, issues, review, passes }, { level, emptyText: narrowed ? 'No issues match these filters. Adjust or reset the filters to see more.' : undefined }),
    );

    const target = `WCAG ${f.version} Level ${f.level}`;
    const n = count(issues);
    const total = (scan.issues || []).length;
    let text = `Showing ${issues.length} of ${total} issue${total === 1 ? '' : 's'} (${n} element${n === 1 ? '' : 's'}) for ${target}.`;
    // What moving up one step would add, within what this scan tested.
    const next = LEVEL_RANK[f.level] < LEVEL_RANK[scope.level] ? { version: f.version, level: f.level === 'A' ? 'AA' : 'AAA' } : VERSION_RANK[f.version] < VERSION_RANK[scope.version] ? { version: f.version === '2.0' ? '2.1' : '2.2', level: f.level } : null;
    if (next && !f.sc && !f.principle) {
      const extra = (scan.issues || []).filter((i) => matches(i, { ...f, ...next })).length - issues.length;
      if (extra > 0) text += ` Moving to WCAG ${next.version} Level ${next.level} adds ${extra} more.`;
    }
    if (VERSION_RANK[f.version] > VERSION_RANK[scope.version] || LEVEL_RANK[f.level] > LEVEL_RANK[scope.level]) {
      text += ` This scan tested WCAG ${scope.version} Level ${scope.level}, so rules beyond that were not run. Rescan with a higher standard to include them.`;
    }
    summary.textContent = text;
  }

  const [v, l, p, c] = form.querySelectorAll('select');
  form.addEventListener('change', () => {
    f = { version: v.value, level: l.value, principle: p.value, sc: c.value, impacts: new Set([...form.querySelectorAll('input[type=checkbox]:checked')].map((x) => x.value)) };
    apply();
  });
  form.addEventListener('reset', () => {
    // Let the browser reset the controls, then restore this scan's own target.
    setTimeout(() => {
      f = initial();
      v.value = f.version;
      l.value = f.level;
      apply();
    });
  });
  form.addEventListener('submit', (e) => e.preventDefault());
  apply();
}

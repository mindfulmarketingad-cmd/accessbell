// Renders a stored scan report (issues, manual review items, passes).
import { el, svg } from './core.js';

const IMPACT = { critical: 'Critical', serious: 'Serious', moderate: 'Moderate', minor: 'Minor' };

export const wcagLabel = (list) =>
  (list || []).map((w) => (w.level === '-' ? 'Best practice' : `WCAG ${w.sc} (${w.level})`)).join(', ');

const helpLink = (href, label) =>
  href && href.startsWith('https://')
    ? el('a', { href, rel: 'noopener noreferrer', target: '_blank', text: `${label} (opens in a new tab)` })
    : null;

const check = () =>
  svg('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'aria-hidden': 'true' }, [svg('path', { d: 'M20 6 9 17l-5-5' })]);

export function renderReport(scan) {
  const body = el('div', { class: 'results-body' });
  const issues = scan.issues || [];
  if (issues.length) {
    body.append(el('h2', { class: 'h3-size', text: `Issues to fix (${issues.length})` }));
    const list = el('ul', { class: 'issue-list' });
    for (const issue of issues) {
      const item = el('li', { class: 'issue' }, [
        el('div', { class: 'issue-top' }, [
          el('h3', { class: 'h4-size', text: issue.title + (issue.count > 1 ? ` - ${issue.count} instances` : '') }),
          el('span', {}, [el('span', { class: `tag tag-${issue.impact}`, text: IMPACT[issue.impact] || issue.impact }), ' ', el('span', { class: 'tag', text: wcagLabel(issue.wcag) })]),
        ]),
        el('p', { text: issue.description }),
        el('p', {}, [el('strong', { text: 'How to fix: ' }), issue.fix]),
      ]);
      const link = helpLink(issue.helpUrl, 'Learn how to fix this');
      if (link) item.append(el('p', {}, [link]));
      for (const s of issue.samples || []) item.append(el('pre', {}, [el('code', { text: s })]));
      list.append(item);
    }
    body.append(list);
  } else {
    body.append(el('h2', { class: 'h3-size', text: 'No automated issues found' }), el('p', { text: 'Follow up with keyboard and screen reader testing to cover what automation cannot.' }));
  }

  const review = scan.review || [];
  if (review.length) {
    body.append(
      el('h2', { class: 'h3-size', text: `Needs manual review (${review.length})` }),
      el('p', { class: 'muted', text: 'Automated testing could not decide these. A person should check them.' }),
    );
    const list = el('ul', { class: 'issue-list' });
    for (const r of review) {
      const li = el('li', { class: 'issue' }, [
        el('div', { class: 'issue-top' }, [el('h3', { class: 'h4-size', text: r.title + (r.count > 1 ? ` - ${r.count} elements` : '') }), el('span', { class: 'tag', text: wcagLabel(r.wcag) })]),
      ]);
      const link = helpLink(r.helpUrl, 'How to review this');
      if (link) li.append(el('p', {}, [link]));
      list.append(li);
    }
    body.append(list);
  }

  const passes = scan.passes || [];
  if (passes.length) {
    body.append(el('h2', { class: 'h3-size', text: `Checks passed (${passes.length})` }));
    body.append(el('ul', { class: 'pass-list' }, passes.map((p) => el('li', {}, [check(), el('span', { text: `${p.title} (${wcagLabel(p.wcag)})` })]))));
  }
  for (const n of scan.notes || []) body.append(el('p', { class: 'muted mb-0', text: n }));
  return body;
}

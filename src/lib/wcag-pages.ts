import { createRequire } from 'node:module';
import { CRITERIA, withinTarget } from '../../server/wcag-criteria.js';
import { CHECKERS, checkerPath, type Checker } from '../data/checkers';

const require = createRequire(import.meta.url);
// axe-core's rule metadata, the same rules the scanner runs.
const axe = require('axe-core') as { getRules: () => { ruleId: string; description: string; help: string; helpUrl: string; tags: string[] }[] };
const ALL_RULES = axe.getRules().filter((r) => !r.tags.includes('experimental') && !r.tags.includes('deprecated'));

export const WCAG_BASE = '/resources/wcag';

const kebab = (s: string) =>
  s
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** "1.4.3" -> "1-4-3-contrast-minimum" */
export const criterionSlug = (sc: string) => {
  const c = CRITERIA[sc];
  return `${sc.replace(/\./g, '-')}-${kebab(c ? c.name : sc)}`;
};
export const criterionPath = (sc: string) => `${WCAG_BASE}/${criterionSlug(sc)}`;

/** W3C "Understanding" document for a criterion. 4.1.1 is only documented for WCAG 2.1. */
export const understandingUrl = (sc: string) => {
  const c = CRITERIA[sc];
  const name = kebab(c ? c.name : sc);
  return sc === '4.1.1' ? `https://www.w3.org/WAI/WCAG21/Understanding/${name}.html` : `https://www.w3.org/WAI/WCAG22/Understanding/${name}.html`;
};

/** Only link to axe's own documentation site. */
const safeHelpUrl = (u: string) => (/^https:\/\/dequeuniversity\.com\//.test(u || '') ? u : undefined);

/** The axe-core rules that test a success criterion, regardless of standard. */
export function rulesForCriterion(sc: string) {
  const tag = `wcag${sc.replace(/\./g, '')}`;
  return ALL_RULES.filter((r) => r.tags.includes(tag)).map((r) => ({ id: r.ruleId, description: r.description, helpUrl: safeHelpUrl(r.helpUrl) }));
}

/** Which of AccessBell's free checker pages test this criterion at Level AA. */
export function checkersForCriterion(sc: string): Checker[] {
  const c = CRITERIA[sc];
  if (!c) return [];
  return CHECKERS.filter((checker) => withinTarget(c, checker.version, 'AA'));
}

export { checkerPath };

import { CRITERIA } from '../../server/wcag-criteria.js';

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

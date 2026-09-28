import { createRequire } from 'node:module';
import { tagsFor } from '../../server/wcag.js';
import { criteriaFor, PRINCIPLES } from '../../server/wcag-criteria.js';

const require = createRequire(import.meta.url);
// axe-core's rule metadata, the same rules the scanner runs.
const axe = require('axe-core') as { getRules: (tags?: string[]) => { ruleId: string; tags: string[] }[] };

/**
 * For a WCAG version at Level AA: every success criterion and how many
 * automated rules test it, grouped by principle. Experimental and deprecated
 * rules are left out because the scanner does not run them.
 */
export function coverageFor(version: '2.0' | '2.1' | '2.2') {
  const rules = axe.getRules(tagsFor(version, 'AA')).filter((r) => !r.tags.includes('experimental') && !r.tags.includes('deprecated'));
  const criteria = criteriaFor(version, 'AA').map((c) => {
    const tag = `wcag${c.sc.replace(/\./g, '')}`;
    return { ...c, rules: rules.filter((r) => r.tags.includes(tag)).length };
  });
  const groups = Object.values(PRINCIPLES).map((p) => ({ principle: p, criteria: criteria.filter((c) => c.principle === p) }));
  return {
    ruleCount: rules.length,
    total: criteria.length,
    automated: criteria.filter((c) => c.rules > 0).length,
    groups,
  };
}

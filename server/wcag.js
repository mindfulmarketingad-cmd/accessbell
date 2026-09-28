// WCAG version and level selection, shared by the free scan and the app.
export const VERSIONS = ['2.0', '2.1', '2.2'];
export const LEVELS = ['A', 'AA', 'AAA'];

const VERSION_PREFIX = { '2.0': 'wcag2', '2.1': 'wcag21', '2.2': 'wcag22' };
const LEVEL_SUFFIX = { A: ['a'], AA: ['a', 'aa'], AAA: ['a', 'aa', 'aaa'] };

/** axe-core tags for a WCAG version and conformance level (cumulative). */
export function tagsFor(version = '2.2', level = 'AA') {
  const v = VERSIONS.includes(version) ? version : '2.2';
  const l = LEVELS.includes(level) ? level : 'AA';
  const prefixes = VERSIONS.slice(0, VERSIONS.indexOf(v) + 1).map((x) => VERSION_PREFIX[x]);
  return prefixes.flatMap((p) => LEVEL_SUFFIX[l].map((s) => p + s));
}

export const standardFor = (version = '2.2', level = 'AA') => ({
  id: `wcag${(VERSIONS.includes(version) ? version : '2.2').replace('.', '')}-${LEVELS.includes(level) ? level : 'AA'}`,
  label: `WCAG ${VERSIONS.includes(version) ? version : '2.2'} Level ${LEVELS.includes(level) ? level : 'AA'}`,
});

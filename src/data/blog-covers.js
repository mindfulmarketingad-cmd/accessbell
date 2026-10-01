// Featured image topics for blog posts, used by scripts/generate-covers.mjs
// and for the cover's alt text. Each post has an icon from the site's own
// artwork (`ui` = interface icon, `a11y` = accessibility icon set), a short
// label and a caption. Add an entry for every new post, then run npm run covers.

/** Plain-language names for the icons, for alt text. */
const ICON_NAMES = {
  'screen-reader': 'a screen reader symbol',
  'closed-captions': 'a closed captions symbol',
  'high-contrast': 'a high contrast symbol',
  'low-vision': 'a low vision symbol',
  'text-resize': 'a text resize symbol',
  cognitive: 'a cognitive accessibility symbol',
  wheelchair: 'a wheelchair symbol',
  'universal-access': 'the universal access symbol',
  keyboard: 'a keyboard symbol',
  list: 'a list icon',
  clock: 'a clock icon',
  plus: 'a plus sign',
  gear: 'a settings icon',
  doc: 'a form icon',
  lock: 'a lock icon',
  bell: 'a notification bell icon',
  layers: 'a layers icon',
  shield: 'a shield icon',
  mail: 'an envelope icon',
  scale: 'the scales of justice',
  'check-circle': 'a check mark icon',
  code: 'a code icon',
  star: 'a star icon',
  wrench: 'a wrench icon',
  card: 'a payment card icon',
  search: 'a magnifying glass icon',
  globe: 'a globe icon',
  panel: 'a browser panel icon',
  check: 'a check mark icon',
  chart: 'a bar chart icon',
  scan: 'a scanner icon',
  sparkle: 'a sparkle icon',
};

export const COVER_TOPICS = {
  'wcag-1-1-1-non-text-content': { a11y: 'screen-reader', label: '1.1.1', caption: 'Non-text Content' },
  'wcag-1-2-9-audio-only-live': { a11y: 'closed-captions', label: '1.2.9', caption: 'Audio-only (Live)' },
  'wcag-1-3-2-meaningful-sequence': { ui: 'list', label: '1.3.2', caption: 'Meaningful Sequence' },
  'wcag-1-4-1-use-of-color': { a11y: 'high-contrast', label: '1.4.1', caption: 'Use of Color' },
  'wcag-1-4-3-contrast-minimum': { a11y: 'low-vision', label: '1.4.3', caption: 'Contrast (Minimum)' },
  'wcag-1-4-8-visual-presentation': { a11y: 'text-resize', label: '1.4.8', caption: 'Visual Presentation' },
  'wcag-2-2-2-pause-stop-hide': { a11y: 'cognitive', label: '2.2.2', caption: 'Pause, Stop, Hide' },
  'wcag-2-2-3-no-timing': { ui: 'clock', label: '2.2.3', caption: 'No Timing' },
  'wcag-2-5-8-target-size-minimum': { ui: 'plus', label: '2.5.8', caption: 'Target Size (Minimum)' },
  'wcag-3-2-2-on-input': { ui: 'gear', label: '3.2.2', caption: 'On Input' },
  'wcag-3-3-2-labels-or-instructions': { ui: 'doc', label: '3.3.2', caption: 'Labels or Instructions' },
  'wcag-3-3-8-accessible-authentication-minimum': { ui: 'lock', label: '3.3.8', caption: 'Accessible Authentication' },
  'wcag-3-3-9-accessible-authentication-enhanced': { ui: 'lock', label: '3.3.9', caption: 'Accessible Authentication (Enhanced)' },
  'wcag-4-1-1-parsing': { ui: 'code', label: '4.1.1', caption: 'Parsing (removed in 2.2)' },
  'wcag-4-1-2-name-role-value': { ui: 'code', label: '4.1.2', caption: 'Name, Role, Value' },
  'wcag-4-1-3-status-messages': { ui: 'bell', label: '4.1.3', caption: 'Status Messages' },
  'wcag-2-2-checklist': { ui: 'check', label: '2.2', caption: 'WCAG 2.2 Checklist' },
  'wcag-2-aa-checklist': { ui: 'list', label: 'AA', caption: 'WCAG 2 AA Checklist' },
  'what-you-should-know-about-wcag-2-2': { ui: 'sparkle', label: '2.2', caption: 'What’s new in WCAG' },
  'european-accessibility-act-technical-compliance': { ui: 'globe', label: 'EAA', caption: 'Technical aspects of compliance' },
  'ada-website-accessibility': { a11y: 'universal-access', label: 'ADA', caption: 'Avoid website lawsuits' },
  'best-ada-compliance-software-for-small-businesses': { ui: 'scale', label: 'Top 5', caption: 'ADA software for small business' },
  'best-website-accessibility-testing-software': { ui: 'scan', label: 'Top 5', caption: 'Accessibility testing software' },
  'digital-accessibility-platforms': { ui: 'bell', label: 'Top 3', caption: 'Monitoring and audit platforms' },
  '5-accessibe-alternatives': { ui: 'layers', label: 'Top 5', caption: 'accessiBe alternatives' },
  'accessibe-alternative': { ui: 'shield', label: 'Fix code', caption: 'An accessiBe alternative' },
  'siteimprove-alternative': { ui: 'globe', label: 'Compare', caption: 'A Siteimprove alternative' },
  'userway-alternative': { ui: 'panel', label: 'Compare', caption: 'A UserWay alternative' },
  'website-accessibility-checkers': { ui: 'scan', label: 'Compare', caption: 'Website accessibility checkers' },
  'we-tested-10-accessibility-checker-tools': { ui: 'chart', label: '10 tools', caption: 'One test page, 35 barriers' },
  'ada-demand-letter': { ui: 'mail', label: 'ADA', caption: 'Demand letters' },
  'ada-lawsuit-process': { ui: 'scale', label: 'ADA', caption: 'The lawsuit process' },
  'what-happens-after-being-sued-for-ada-website-compliance': { ui: 'scale', label: 'ADA', caption: 'After being sued' },
  'ada-requirements-for-bathrooms': { a11y: 'universal-access', label: 'ADA', caption: 'Accessible bathrooms' },
  'ada-requirements-for-ramps': { a11y: 'wheelchair', label: 'ADA', caption: 'Ramp requirements' },
  'ada-title-iii-law-for-businesses': { ui: 'scale', label: 'Title III', caption: 'ADA law for businesses' },
  'ada-website-compliance-guide': { ui: 'check-circle', label: 'ADA', caption: 'Website compliance' },
  'automated-vs-manual-accessibility-testing': { ui: 'code', label: 'Testing', caption: 'Automated vs manual' },
  'famous-people-with-disabilities': { ui: 'star', label: 'People', caption: 'Famous people with disabilities' },
  'free-tools-to-check-website-accessibility': { ui: 'wrench', label: 'Free', caption: 'Accessibility testing tools' },
  'grants-for-people-with-disabilities': { ui: 'card', label: 'Grants', caption: 'Funding and support' },
  'keyboard-accessibility-testing': { a11y: 'keyboard', label: 'Tab', caption: 'Keyboard testing' },
  'stories-of-web-users-with-disabilities': { a11y: 'universal-access', label: 'Stories', caption: 'Web users with disabilities' },
  'seo-audit': { ui: 'search', label: 'SEO', caption: 'Full site audit' },
  'what-is-a-website-accessibility-checker': { a11y: 'universal-access', label: 'WCAG', caption: 'What a checker does' },
};

export const CATEGORY_THEMES = {
  'WCAG Codes Explained': { bg: '#eef5ec', soft: '#dfeddb', accent: '#44723f', ink: '#1f2430', muted: '#4d5b4a', line: '#cfe1ce' },
  Standards: { bg: '#e9f2f4', soft: '#d6e8ec', accent: '#2f6272', ink: '#1f2430', muted: '#44606a', line: '#c4dbe1' },
  Compliance: { bg: '#edeff4', soft: '#dde1ea', accent: '#353a47', ink: '#1f2430', muted: '#4f5666', line: '#cfd4de' },
  Guides: { bg: '#f7f1e7', soft: '#efe3cf', accent: '#8a5a1f', ink: '#1f2430', muted: '#6b5335', line: '#e6d4b5' },
  Comparisons: { bg: '#f1eef7', soft: '#e3ddf0', accent: '#5b4a86', ink: '#1f2430', muted: '#574d70', line: '#d6cde8' },
};

/** Alt text for a post's cover illustration. */
export function coverAlt(slug) {
  const t = COVER_TOPICS[slug];
  if (!t) return '';
  return `Illustration: ${ICON_NAMES[t.a11y || t.ui] || 'an icon'}, with ${t.label} and ${t.caption}`;
}

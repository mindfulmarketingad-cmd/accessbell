/**
 * Authoritative external references, defined once and cited by id from Help
 * Center articles and categories. Fix a moved URL here and every page follows.
 */
export const SOURCES = {
  'wcag22': { label: 'Web Content Accessibility Guidelines (WCAG) 2.2', publisher: 'W3C', url: 'https://www.w3.org/TR/WCAG22/' },
  'new-in-22': { label: 'What’s New in WCAG 2.2', publisher: 'W3C Web Accessibility Initiative', url: 'https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/' },
  'new-in-21': { label: 'What’s New in WCAG 2.1', publisher: 'W3C Web Accessibility Initiative', url: 'https://www.w3.org/WAI/standards-guidelines/wcag/new-in-21/' },
  'understanding': { label: 'Understanding WCAG 2.2', publisher: 'W3C Web Accessibility Initiative', url: 'https://www.w3.org/WAI/WCAG22/Understanding/' },
  'accessible-auth': { label: 'Understanding Accessible Authentication (Minimum)', publisher: 'W3C Web Accessibility Initiative', url: 'https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html' },
  'apg': { label: 'ARIA Authoring Practices Guide', publisher: 'W3C Web Accessibility Initiative', url: 'https://www.w3.org/WAI/ARIA/apg/' },
  'wai-intro': { label: 'Introduction to Web Accessibility', publisher: 'W3C Web Accessibility Initiative', url: 'https://www.w3.org/WAI/fundamentals/accessibility-intro/' },
  'wai-evaluate': { label: 'Evaluating Web Accessibility Overview', publisher: 'W3C Web Accessibility Initiative', url: 'https://www.w3.org/WAI/test-evaluate/' },
  'wai-statements': { label: 'Developing an Accessibility Statement', publisher: 'W3C Web Accessibility Initiative', url: 'https://www.w3.org/WAI/planning/statements/' },
  'wai-arrm': { label: 'Accessibility Roles and Responsibilities Mapping (ARRM)', publisher: 'W3C Web Accessibility Initiative', url: 'https://www.w3.org/WAI/planning/arrm/' },
  'axe-core': { label: 'axe-core, the open-source accessibility testing engine', publisher: 'Deque Systems', url: 'https://github.com/dequelabs/axe-core' },
  'axe-rules': { label: 'axe-core rule descriptions', publisher: 'Deque Systems', url: 'https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md' },
  'webaim-million': { label: 'The WebAIM Million (2025)', publisher: 'WebAIM', url: 'https://webaim.org/projects/million/2025' },
  'wave': { label: 'WAVE Web Accessibility Evaluation Tool', publisher: 'WebAIM', url: 'https://wave.webaim.org/' },
  'sitemaps': { label: 'Sitemaps XML protocol', publisher: 'sitemaps.org', url: 'https://www.sitemaps.org/protocol.html' },
  'mdn-auth': { label: 'The Authorization HTTP header', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization' },
  'mdn-status': { label: 'HTTP response status codes', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status' },
  'stripe-security': { label: 'Security at Stripe', publisher: 'Stripe', url: 'https://stripe.com/docs/security' },
  'stripe-privacy': { label: 'Stripe Privacy Policy', publisher: 'Stripe', url: 'https://stripe.com/privacy' },
  'ada-web': { label: 'Guidance on Web Accessibility and the ADA', publisher: 'U.S. Department of Justice', url: 'https://www.ada.gov/resources/web-guidance/' },
  'vpat': { label: 'VPAT (Voluntary Product Accessibility Template)', publisher: 'Information Technology Industry Council', url: 'https://www.itic.org/policy/accessibility/vpat' },
  'gmail-help': { label: 'Gmail Help', publisher: 'Google', url: 'https://support.google.com/mail' },
} as const;

export type SourceId = keyof typeof SOURCES;
export const SOURCE_IDS = Object.keys(SOURCES) as [SourceId, ...SourceId[]];
export const sourcesFor = (ids: readonly SourceId[]) => ids.map((id) => ({ id, ...SOURCES[id] }));

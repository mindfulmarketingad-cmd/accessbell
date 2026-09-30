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
  'webaim-million-2026': { label: 'The WebAIM Million: 2026 report on the accessibility of the top 1,000,000 home pages', publisher: 'WebAIM', url: 'https://webaim.org/projects/million/' },
  'semrush-2025-study': { label: 'Why Accessibility Matters More Than Ever for SEO Performance', publisher: 'Semrush', url: 'https://www.semrush.com/news/420048-study-why-accessibility-matters-more-than-ever-for-seo-performance/' },
  'semrush-2023-study': { label: 'Is Web Accessibility Key to Driving Organic Traffic?', publisher: 'Semrush', url: 'https://www.semrush.com/news/242494-study-is-web-accessibility-key-to-driving-organic-traffic/' },
  'who-disability': { label: 'Disability fact sheet', publisher: 'World Health Organization', url: 'https://www.who.int/news-room/fact-sheets/detail/disability-and-health' },
  'google-seo-starter': { label: 'SEO Starter Guide', publisher: 'Google Search Central', url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide' },
  'google-image-seo': { label: 'Google Images SEO best practices', publisher: 'Google Search Central', url: 'https://developers.google.com/search/docs/appearance/google-images' },
  'doj-title-ii-dates': { label: 'DOJ extends digital accessibility compliance dates under Title II of the ADA', publisher: 'Reed Smith', url: 'https://www.reedsmith.com/articles/doj-extends-digital-accessibility-compliance-dates-under-title-ii-of-the-ada/' },
  'wave': { label: 'WAVE Web Accessibility Evaluation Tool', publisher: 'WebAIM', url: 'https://wave.webaim.org/' },
  'sitemaps': { label: 'Sitemaps XML protocol', publisher: 'sitemaps.org', url: 'https://www.sitemaps.org/protocol.html' },
  'mdn-auth': { label: 'The Authorization HTTP header', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization' },
  'mdn-status': { label: 'HTTP response status codes', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status' },
  'stripe-security': { label: 'Security at Stripe', publisher: 'Stripe', url: 'https://stripe.com/docs/security' },
  'stripe-privacy': { label: 'Stripe Privacy Policy', publisher: 'Stripe', url: 'https://stripe.com/privacy' },
  'ada-web': { label: 'Guidance on Web Accessibility and the ADA', publisher: 'U.S. Department of Justice', url: 'https://www.ada.gov/resources/web-guidance/' },
  'vpat': { label: 'VPAT (Voluntary Product Accessibility Template)', publisher: 'Information Technology Industry Council', url: 'https://www.itic.org/policy/accessibility/vpat' },
  'mdn-script': { label: 'The <script> element', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script' },
  'mdn-aria-label': { label: 'aria-label', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label' },
  'mdn-csp': { label: 'Content-Security-Policy header', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy' },
  'w3c-csp': { label: 'Content Security Policy Level 3', publisher: 'W3C', url: 'https://www.w3.org/TR/CSP3/' },
  'text-spacing': { label: 'Understanding Success Criterion 1.4.12: Text Spacing', publisher: 'W3C Web Accessibility Initiative', url: 'https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html' },
  'resize-text': { label: 'Understanding Success Criterion 1.4.4: Resize Text', publisher: 'W3C Web Accessibility Initiative', url: 'https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html' },
  'mdn-reduced-motion': { label: 'prefers-reduced-motion', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion' },
  'pdf-techniques': { label: 'PDF Techniques for WCAG 2.2', publisher: 'W3C', url: 'https://www.w3.org/WAI/WCAG22/Techniques/#pdf' },
  'pdf-title': { label: 'PDF18: Specifying the document title using the Title entry of the document information dictionary', publisher: 'W3C', url: 'https://www.w3.org/WAI/WCAG22/Techniques/pdf/PDF18' },
  'pdf-lang': { label: 'PDF16: Setting the default language using the /Lang entry in the document catalog', publisher: 'W3C', url: 'https://www.w3.org/WAI/WCAG22/Techniques/pdf/PDF16' },
  'pdf-alt': { label: 'PDF1: Applying text alternatives to images with the Alt entry in PDF documents', publisher: 'W3C', url: 'https://www.w3.org/WAI/WCAG22/Techniques/pdf/PDF1' },
  'gmail-help': { label: 'Gmail Help', publisher: 'Google', url: 'https://support.google.com/mail' },
} as const;

export type SourceId = keyof typeof SOURCES;
export const SOURCE_IDS = Object.keys(SOURCES) as [SourceId, ...SourceId[]];
export const sourcesFor = (ids: readonly SourceId[]) => ids.map((id) => ({ id, ...SOURCES[id] }));

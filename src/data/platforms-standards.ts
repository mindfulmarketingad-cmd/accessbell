/**
 * "[Platform] WCAG 2.2 / WCAG 2.1 / Section 508 / EN 301 549 Checker" pages at
 * /platforms/<platform>/<type>. Each standard has its own explanation, key
 * criteria and a note for every kind of platform; the page combines these with
 * the platform's own issues. `{name}` is replaced with the platform name.
 */
export type PlatformGroup = 'ecommerce' | 'cms' | 'builder' | 'framework' | 'host';

export type PlatformStandard = {
  /** URL segment, e.g. "wcag-2-2-checker" */
  id: string;
  /** "WCAG 2.2", used as "{Platform} WCAG 2.2 Checker" */
  label: string;
  /** Scanner preset (src/config/site.ts STANDARDS) */
  standardId: 'wcag22' | 'wcag21' | 'section508' | 'en301549';
  /** The matching general checker at /resources/<slug> */
  checkerSlug: string;
  version: '2.0' | '2.1' | '2.2';
  icon: string;
  /** Card summary on the platform page */
  summary: string;
  lead: string;
  intro: string[];
  facts: [string, string][];
  who: string[];
  keyHeading: string;
  key: { sc: string; text: string }[];
  groupNotes: Record<PlatformGroup, string>;
  manual: string[];
  faqs: { q: string; a: string }[];
};

export const PLATFORM_STANDARDS: PlatformStandard[] = [
  {
    id: 'wcag-2-2-checker',
    label: 'WCAG 2.2',
    standardId: 'wcag22',
    checkerSlug: 'wcag-2-2-aa-checker',
    version: '2.2',
    icon: 'check-circle',
    summary: 'Test your {name} site against WCAG 2.2 Level AA, the newest W3C standard, including target size and focus visibility.',
    lead: 'Check your {name} site against WCAG 2.2 Level AA, the current W3C recommendation. The scan tests every page you enter, including the new 2.2 criteria that sticky headers, small icons and sign-in forms on {name} sites often fail.',
    intro: [
      'WCAG 2.2 became a W3C Recommendation in October 2023. It keeps every WCAG 2.1 requirement except 4.1.1 Parsing and adds six success criteria at Level A and AA, mostly about people with low vision, motor disabilities and cognitive disabilities. A {name} site that meets WCAG 2.2 AA also meets 2.1 AA and 2.0 AA.',
      'This checker runs the same free scan as the {name} accessibility checker with the WCAG 2.2 AA preset, so the results include the 2.2 rules that automated testing can check.',
    ],
    facts: [
      ['Published', 'October 5, 2023'],
      ['Success criteria at Level A and AA', '55'],
      ['New at Level A and AA', '6'],
      ['Removed', '4.1.1 Parsing'],
    ],
    who: [
      '{name} site owners who want the most current, future-proof target.',
      'Teams redesigning a {name} site, where adopting the latest version costs little extra.',
      'Organizations selling into the EU, where EN 301 549 V4.1.1 now uses WCAG 2.2.',
      'Anyone preparing for new rules, which tend to adopt the latest WCAG version.',
    ],
    keyHeading: 'The New WCAG 2.2 Criteria to Check on {name}',
    key: [
      { sc: '2.4.11', text: 'Sticky headers, cookie banners and chat widgets must not completely hide the element that has keyboard focus.' },
      { sc: '2.5.7', text: 'Anything that works by dragging, such as sliders, carousels and sortable lists, needs a single-pointer alternative.' },
      { sc: '2.5.8', text: 'Buttons and links need a target of at least 24 by 24 CSS pixels, or enough space around them. Icon buttons and pagination links often fail.' },
      { sc: '3.2.6', text: 'Help such as a contact link or chat must appear in the same place on every page that has it.' },
      { sc: '3.3.7', text: 'Do not ask for the same information twice in one process, such as shipping and billing addresses, without offering to fill it in.' },
      { sc: '3.3.8', text: 'Sign-in must not depend on a cognitive test, such as remembering a password without paste support or solving a puzzle.' },
    ],
    groupNotes: {
      ecommerce: 'On {name} stores, WCAG 2.2 failures cluster in the purchase path: small quantity buttons and swatches (target size), sticky add-to-cart bars that cover focused fields, and checkouts that ask for an address twice. Test the cart and checkout by hand as well as scanning product pages.',
      cms: 'On {name} sites, WCAG 2.2 issues usually come from the theme and plugins rather than core: icon-only social links below 24 pixels, sticky headers that cover focused links, and login or comment forms that block password managers.',
      builder: 'On {name}, WCAG 2.2 issues often come from design choices made in the editor: small icon buttons, sticky headers and announcement bars, and carousels that only respond to swiping or dragging. Check each section template once and fix it there.',
      framework: 'In {name} apps, WCAG 2.2 issues usually live in custom components: drag-and-drop interfaces without a button alternative, compact icon buttons, and authentication flows that block paste or use puzzles. Add the 2.2 rules to your component tests.',
      host: 'The host does not decide WCAG 2.2 compliance. For a site hosted on {name}, the theme, builder or code you run there does, so scan the live pages and fix issues in that software.',
    },
    manual: [
      'Tab through each page and check the focused element is never fully covered by sticky content (2.4.11).',
      'Try every drag interaction with a single click or tap instead (2.5.7).',
      'Sign in with a password manager and check paste works (3.3.8).',
    ],
    faqs: [
      { q: 'Does my {name} site need to meet WCAG 2.2?', a: 'Few laws require WCAG 2.2 yet, but it is the current standard and meeting it also meets 2.1 and 2.0. EN 301 549 V4.1.1, written for the European Accessibility Act, now uses WCAG 2.2 AA.' },
      { q: 'What is new in WCAG 2.2 for {name} sites?', a: 'Six Level A and AA criteria: focus not obscured, dragging movements, target size, consistent help, redundant entry and accessible authentication. Target size and focus visibility are the ones scans most often flag.' },
      { q: 'Can the scan check every WCAG 2.2 criterion on {name}?', a: 'No automated tool can. The scan checks the criteria that can be tested automatically, such as target size, and lists the ones that need a person, such as accessible authentication.' },
    ],
  },
  {
    id: 'wcag-2-1-checker',
    label: 'WCAG 2.1',
    standardId: 'wcag21',
    checkerSlug: 'wcag-2-1-aa-checker',
    version: '2.1',
    icon: 'check',
    summary: 'Test your {name} site against WCAG 2.1 Level AA, the standard most laws and contracts reference today.',
    lead: 'Check your {name} site against WCAG 2.1 Level AA, the version most laws, settlements and contracts reference today. The scan tests every page you enter and maps each issue to the WCAG 2.1 criteria it fails.',
    intro: [
      'WCAG 2.1 became a W3C Recommendation in June 2018. It added criteria for mobile, low vision and cognitive accessibility to WCAG 2.0, and it is the standard named in the US Department of Justice rule for state and local government websites, in EN 301 549 V3.2.1 and in most accessibility settlements.',
      'This checker runs the free scan with the WCAG 2.1 AA preset, so the results match the standard your contract, policy or regulator is most likely to name for a {name} site.',
    ],
    facts: [
      ['Published', 'June 5, 2018'],
      ['Success criteria at Level A and AA', '50'],
      ['Added to WCAG 2.0 at Level A and AA', '12'],
      ['Referenced by', 'ADA Title II rule, EN 301 549 V3.2.1'],
    ],
    who: [
      '{name} site owners whose contracts or policies name WCAG 2.1 AA.',
      'State and local government bodies, under the ADA Title II rule.',
      'Businesses responding to an ADA demand letter, which usually cites WCAG 2.1 AA.',
      'Public sector bodies in the EU, under the Web Accessibility Directive.',
    ],
    keyHeading: 'WCAG 2.1 Criteria That Often Fail on {name}',
    key: [
      { sc: '1.3.5', text: 'Form fields that collect personal data, such as name, email and address, need the right autocomplete attribute.' },
      { sc: '1.4.10', text: 'Content must reflow at 320 CSS pixels wide, the same as 400% zoom, without scrolling in two directions.' },
      { sc: '1.4.11', text: 'Buttons, form borders, icons and focus indicators need a contrast ratio of at least 3:1.' },
      { sc: '1.4.12', text: 'Text must stay readable when users increase line, paragraph, letter and word spacing.' },
      { sc: '1.4.13', text: 'Tooltips and menus that appear on hover or focus must be dismissible, hoverable and stay visible.' },
      { sc: '4.1.3', text: 'Messages such as “added to cart” or form errors must be announced to screen readers without moving focus.' },
    ],
    groupNotes: {
      ecommerce: 'On {name} stores, WCAG 2.1 issues show up in checkout and account forms (missing autocomplete), faint input borders and swatch outlines (non-text contrast), and cart updates that are not announced (status messages).',
      cms: 'On {name} sites, WCAG 2.1 issues usually come from themes: fixed-width layouts that do not reflow, light form borders, and hover menus that disappear when the pointer moves. Fix them in the theme or a child theme so every page benefits.',
      builder: 'On {name}, WCAG 2.1 issues often come from layout settings: sections with fixed heights that cut off text when spacing increases, pale button borders, and hover effects that hide content from keyboard users.',
      framework: 'In {name} apps, WCAG 2.1 issues are usually in dynamic behavior: toasts and validation messages without a live region, custom inputs without autocomplete, and tooltips that cannot be dismissed with Escape.',
      host: 'For a site on {name}, WCAG 2.1 compliance depends on the theme, builder or code you run, not the hosting. Scan the live pages and fix issues in that software.',
    },
    manual: [
      'Zoom to 400% and check nothing is cut off or needs scrolling in two directions (1.4.10).',
      'Apply increased text spacing with a bookmarklet and check text is still readable (1.4.12).',
      'Open hover menus and tooltips and check you can dismiss them with Escape (1.4.13).',
    ],
    faqs: [
      { q: 'Does my {name} site need to meet WCAG 2.1?', a: 'WCAG 2.1 AA is the standard most often cited in ADA claims and settlements, required for state and local governments under ADA Title II and used by EN 301 549 V3.2.1. For most {name} sites it is the practical minimum.' },
      { q: 'What is the difference between WCAG 2.1 and 2.2 for {name}?', a: 'WCAG 2.2 adds six Level A and AA criteria, such as target size, and removes 4.1.1 Parsing. Meeting 2.2 AA also meets 2.1 AA, so use the WCAG 2.2 checker if you want to go further.' },
      { q: 'Can the scan check every WCAG 2.1 criterion?', a: 'No automated tool can. The scan checks the criteria that can be tested automatically and lists those that need manual review, such as reflow and text spacing.' },
    ],
  },
  {
    id: 'section-508-checker',
    label: 'Section 508',
    standardId: 'section508',
    checkerSlug: 'section-508-checker',
    version: '2.0',
    icon: 'shield',
    summary: 'Test your {name} site against the Revised Section 508 Standards (WCAG 2.0 AA) for federal agencies and vendors.',
    lead: 'Check your {name} site against the Revised Section 508 Standards, which apply WCAG 2.0 Level AA to federal websites and the technology agencies buy. Use it if you are a federal agency, or a vendor selling to one.',
    intro: [
      'Section 508 of the Rehabilitation Act requires federal agencies to make the information and communication technology they develop, buy, maintain or use accessible. The Revised 508 Standards, in effect since January 2018, incorporate WCAG 2.0 Level A and AA for web content, electronic documents and software.',
      'Private businesses are not directly covered, but agencies must buy accessible technology, so vendors are often asked for an Accessibility Conformance Report (ACR) based on the VPAT. This checker runs the scan with the WCAG 2.0 AA preset that Section 508 uses.',
    ],
    facts: [
      ['Applies to', 'Federal agencies and the ICT they buy'],
      ['Web standard', 'WCAG 2.0 Level A and AA'],
      ['Success criteria at Level A and AA', '38'],
      ['In effect', 'January 18, 2018 (Revised Standards)'],
    ],
    who: [
      'Federal agencies running a site or microsite on {name}.',
      'Contractors and vendors whose {name} site or portal is part of a federal contract.',
      'Agencies and vendors preparing a VPAT or Accessibility Conformance Report.',
      'State bodies and universities whose policies adopt Section 508.',
    ],
    keyHeading: 'Section 508 Checks That Matter for {name} Sites',
    key: [
      { sc: '1.1.1', text: 'Every image, icon and chart needs a text alternative, or must be marked as decorative.' },
      { sc: '1.3.1', text: 'Headings, lists, tables and form labels must be marked up so assistive technology can read the structure.' },
      { sc: '1.4.3', text: 'Text needs a contrast ratio of at least 4.5:1, or 3:1 for large text.' },
      { sc: '2.1.1', text: 'Every function must work with a keyboard alone.' },
      { sc: '2.4.1', text: 'Provide a way to skip repeated navigation, such as a skip link.' },
      { sc: '4.1.2', text: 'Custom controls need a name, role and state that assistive technology can read.' },
    ],
    groupNotes: {
      ecommerce: 'A {name} store is rarely a federal site, but vendors on GSA schedules or selling to agencies may be asked for an ACR covering their ordering portal. Scan the catalog, cart and checkout, and record the results for the report.',
      cms: '{name} is often used for agency and university sites. Under Section 508, the theme, plugins and every PDF you publish are in scope, so scan the templates and check documents with a PDF accessibility checker.',
      builder: 'If a federal program or contractor runs a site on {name}, the builder’s templates and widgets must meet WCAG 2.0 AA. Check that you can edit the parts that fail; if you cannot, document them in your ACR.',
      framework: 'Federal apps built with {name} are software as well as web content under Section 508. Scan the rendered pages here, and test keyboard and screen reader behavior in your components by hand.',
      host: 'Hosting does not affect Section 508 conformance. For an agency or vendor site on {name}, test the site you run there and keep dated results for your ACR.',
    },
    manual: [
      'Test every page with a keyboard only, including menus and dialogs (2.1.1).',
      'Check documents and PDFs separately, since Section 508 covers them too.',
      'Record results per criterion if you need to complete a VPAT or ACR.',
    ],
    faqs: [
      { q: 'Does Section 508 apply to my {name} site?', a: 'It applies to federal agencies and the technology they buy. A private {name} site is not directly covered, but vendors selling to agencies are often asked to show conformance in an Accessibility Conformance Report.' },
      { q: 'Which WCAG version does Section 508 use?', a: 'The Revised 508 Standards incorporate WCAG 2.0 Level A and AA. Meeting WCAG 2.1 or 2.2 AA also meets WCAG 2.0 AA.' },
      { q: 'Can this scan produce a VPAT for my {name} site?', a: 'No. A VPAT or ACR needs a full review, including manual testing. The scan gives you automated results per criterion to start from, and AccessBell Pro keeps a dated record of them.' },
    ],
  },
  {
    id: 'en-301-549-checker',
    label: 'EN 301 549',
    standardId: 'en301549',
    checkerSlug: 'en-301-549-checker',
    version: '2.1',
    icon: 'globe',
    summary: 'Test your {name} site against EN 301 549, the European standard behind the European Accessibility Act.',
    lead: 'Check your {name} site against EN 301 549, the European accessibility standard behind the European Accessibility Act and the Web Accessibility Directive. Use it if you sell to consumers in the EU or run a public sector site there.',
    intro: [
      'EN 301 549 is the European standard for accessible information and communication technology. For websites, its clause 9 reuses WCAG: version 3.2.1 uses WCAG 2.1 Level AA, and version 4.1.1, published in September 2026 for the European Accessibility Act, uses WCAG 2.2 Level AA.',
      'The European Accessibility Act has applied to e-commerce and other consumer services since June 28, 2025, wherever the business is based. This checker runs the scan with the EN 301 549 preset, which tests the WCAG 2.1 AA web requirements. Run the {name} WCAG 2.2 checker as well to cover version 4.1.1.',
    ],
    facts: [
      ['Applies through', 'European Accessibility Act, Web Accessibility Directive'],
      ['Web requirements', 'WCAG 2.1 AA (V3.2.1), WCAG 2.2 AA (V4.1.1)'],
      ['EAA applies since', 'June 28, 2025'],
      ['Microenterprise exemption', 'Service providers with under 10 staff and €2M or less'],
    ],
    who: [
      '{name} businesses that sell products or services to consumers in the EU.',
      'Public sector bodies in the EU running a site on {name}.',
      'Vendors selling software or services to EU public bodies.',
      'Non-EU companies with EU customers, since the EAA follows the customer.',
    ],
    keyHeading: 'EN 301 549 Requirements to Check on {name}',
    key: [
      { sc: '1.4.10', text: 'Pages must reflow on a narrow screen without scrolling in two directions.' },
      { sc: '1.4.11', text: 'Controls, icons and focus indicators need 3:1 contrast.' },
      { sc: '3.1.1', text: 'Each page must declare its language, which matters on multilingual EU sites.' },
      { sc: '3.3.2', text: 'Form fields, including checkout and consent forms, need visible labels or instructions.' },
      { sc: '4.1.2', text: 'Custom controls such as cookie consent switches need a name, role and state.' },
      { sc: '4.1.3', text: 'Status messages, such as cart updates and form errors, must be announced.' },
    ],
    groupNotes: {
      ecommerce: 'A {name} store selling to EU consumers is an e-commerce service under the European Accessibility Act. Scan product, cart and checkout pages, check every language version, and publish accessibility information about the service.',
      cms: 'On {name} sites run by EU public bodies or businesses, EN 301 549 covers the theme, plugins, PDFs and each language version. Cookie consent banners and language switchers are frequent sources of failures.',
      builder: 'If you build EU sites with {name}, check each language version and the cookie banner, which is often a third-party widget. Fix templates once so every page benefits.',
      framework: 'For {name} apps serving EU users, EN 301 549 also has clauses for software. Scan the rendered pages here and add accessibility tests to your components and release process.',
      host: 'Hosting does not affect EN 301 549 conformance. For a site on {name} that serves EU customers, test the site itself, in every language you publish.',
    },
    manual: [
      'Check every language version, including the page language setting (3.1.1).',
      'Test the cookie consent banner with a keyboard and screen reader.',
      'Publish accessibility information for your service, as the EAA requires.',
    ],
    faqs: [
      { q: 'Does EN 301 549 apply to my {name} site?', a: 'If you sell to consumers in the EU, the European Accessibility Act applies, and EN 301 549 is how conformance is measured. Microenterprises providing services are exempt. EU public sector sites are covered by the Web Accessibility Directive.' },
      { q: 'Which WCAG version does EN 301 549 use?', a: 'Version 3.2.1 uses WCAG 2.1 AA. Version 4.1.1, published in September 2026, uses WCAG 2.2 AA. Testing to WCAG 2.2 AA covers both.' },
      { q: 'Does this scan cover all of EN 301 549?', a: 'No. It tests the automated web requirements. EN 301 549 also covers documents, software, support and hardware, and many web requirements need manual testing.' },
    ],
  },
];

export const fill = (s: string, name: string) => s.replace(/\{name\}/g, name);

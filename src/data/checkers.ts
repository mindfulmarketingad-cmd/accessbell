/**
 * Programmatic SEO pages at /tools/<slug>: one free checker per standard.
 * The scanner, coverage table and counts are shared and computed; everything
 * below is written for the specific standard and its audience.
 */
export type Checker = {
  slug: string;
  /** Scanner standard id (src/config/site.ts STANDARDS) */
  standardId: 'wcag22' | 'wcag21' | 'ada' | 'section508' | 'en301549';
  name: string;
  seoTitle: string;
  description: string;
  /** WCAG version and level the scan runs */
  version: '2.0' | '2.1' | '2.2';
  level: 'AA';
  lead: string;
  whatIs: { heading: string; paragraphs: string[] };
  facts: [string, string][];
  who: { heading: string; items: string[] };
  focus: { heading: string; intro: string; items: { title: string; text: string }[] };
  manual: string[];
  faqs: { q: string; a: string }[];
  sources: { label: string; href: string }[];
  /** Blog posts to recommend, by slug */
  related: string[];
};

export const CHECKERS: Checker[] = [
  {
    slug: 'wcag-2-2-aa-checker',
    related: ['wcag-2-2-checklist', 'wcag-2-aa-checklist', 'automated-vs-manual-accessibility-testing'],
    standardId: 'wcag22',
    name: 'WCAG 2.2 AA Checker',
    seoTitle: 'Free WCAG 2.2 AA Checker: Test Any Page',
    description: 'Free WCAG 2.2 AA checker. Test any web page against the latest W3C accessibility standard, including the new 2.2 criteria, and see how many issues it has.',
    version: '2.2',
    level: 'AA',
    lead: 'Test any public web page against WCAG 2.2 Level AA, the current W3C recommendation, including the new target size criterion. Free, with no account needed.',
    whatIs: {
      heading: 'What Is WCAG 2.2 Level AA?',
      paragraphs: [
        'The Web Content Accessibility Guidelines (WCAG) 2.2 became a W3C Recommendation in October 2023. It is the newest version of the standard that almost every accessibility law in the world points to, and it builds directly on WCAG 2.1: every 2.1 requirement is still there, except 4.1.1 Parsing, which was retired because modern browsers handle the problems it covered.',
        'WCAG 2.2 adds nine success criteria. Six of them are at Level A or AA, so they matter for most organizations: Focus Not Obscured (2.4.11), Dragging Movements (2.5.7), Target Size (2.5.8), Consistent Help (3.2.6), Redundant Entry (3.3.7) and Accessible Authentication (3.3.8). Together they focus on people with low vision, motor disabilities and cognitive disabilities, and on common friction points such as sign-in forms and sticky headers.',
        'Level AA is the target most organizations aim for. It includes every Level A requirement plus the Level AA ones, 55 success criteria in total in WCAG 2.2. Because WCAG 2.2 is backwards compatible, a site that meets 2.2 AA also meets 2.1 AA and 2.0 AA.',
      ],
    },
    facts: [
      ['Published', 'October 5, 2023 (W3C Recommendation)'],
      ['Success criteria at Level A and AA', '55'],
      ['New in 2.2 at Level A and AA', '6 (plus 3 at Level AAA)'],
      ['Removed', '4.1.1 Parsing'],
      ['Already required by', 'UK public sector monitoring since October 2024'],
    ],
    who: {
      heading: 'Who Should Test Against WCAG 2.2 AA?',
      items: [
        'Any organization that wants the most current, future-proof target. Meeting 2.2 AA also covers 2.1 AA and 2.0 AA.',
        'UK public sector bodies, whose websites the Government Digital Service has monitored against WCAG 2.2 AA since October 2024.',
        'Teams redesigning a site or building a new one, where adopting the latest version costs little extra.',
        'Businesses preparing for future rules, since new laws and standard revisions tend to adopt the latest WCAG version.',
      ],
    },
    focus: {
      heading: 'The New WCAG 2.2 Criteria at Level A and AA',
      intro: 'These are the six requirements most teams have not tested for yet. Only Target Size can be checked automatically today; the others need a short manual review.',
      items: [
        { title: '2.4.11 Focus Not Obscured (Minimum), AA', text: 'When a control receives keyboard focus, it must not be completely hidden by sticky headers, cookie banners or chat widgets.' },
        { title: '2.5.7 Dragging Movements, AA', text: 'Anything that works by dragging, such as sliders and sortable lists, needs a single-pointer alternative like buttons or tapping.' },
        { title: '2.5.8 Target Size (Minimum), AA', text: 'Click and tap targets must be at least 24 by 24 CSS pixels, or have enough space around them. This checker tests it automatically.' },
        { title: '3.2.6 Consistent Help, A', text: 'If you offer help such as a phone number, chat or contact link on several pages, keep it in the same relative place.' },
        { title: '3.3.7 Redundant Entry, A', text: 'Do not make people type the same information twice in one process. Pre-fill it or let them select it.' },
        { title: '3.3.8 Accessible Authentication (Minimum), AA', text: 'Sign-in must not depend on a memory or puzzle test unless there is an alternative. Allow password managers and pasting.' },
      ],
    },
    manual: [
      'Tab through the page and check that no focused control disappears behind a sticky header or banner (2.4.11).',
      'Try every slider, carousel and drag-and-drop feature with a single click or tap (2.5.7).',
      'Compare the position of your help links across several pages (3.2.6).',
      'Walk through checkout or sign-up and note anywhere you are asked for the same details twice (3.3.7).',
      'Sign in with a password manager and by pasting a password (3.3.8).',
      'Check that alternative text is meaningful and that focus order follows the visual order.',
    ],
    faqs: [
      { q: 'Is WCAG 2.2 legally required?', a: 'Not yet in most places. Most laws still reference WCAG 2.1 AA or 2.0 AA. However, the UK public sector already monitors against 2.2 AA, and new rules and standard updates are expected to adopt it. Because 2.2 includes nearly all of 2.1, testing against 2.2 AA is the safest choice.' },
      { q: 'What is the difference between WCAG 2.1 and 2.2?', a: 'WCAG 2.2 adds nine success criteria, six of them at Level A or AA, focused on focus visibility, dragging, target size, consistent help, redundant entry and accessible sign-in. It also removes 4.1.1 Parsing. Everything else is the same.' },
      { q: 'Can a WCAG 2.2 checker test every criterion?', a: 'No automated tool can. This checker runs every automated rule for WCAG 2.2 AA and shows you exactly which criteria it covers. The rest, such as whether focus is hidden by a sticky header, need a person to check. The table on this page lists both.' },
      { q: 'Does meeting WCAG 2.2 AA mean I also meet 2.1 AA?', a: 'Yes. WCAG 2.2 is backwards compatible, so content that conforms to 2.2 AA also conforms to 2.1 AA and 2.0 AA.' },
    ],
    sources: [
      { label: 'W3C: Web Content Accessibility Guidelines (WCAG) 2.2', href: 'https://www.w3.org/TR/WCAG22/' },
      { label: 'W3C WAI: What is new in WCAG 2.2', href: 'https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/' },
      { label: 'GOV.UK: Accessibility requirements for public sector websites and apps', href: 'https://www.gov.uk/guidance/accessibility-requirements-for-public-sector-websites-and-apps' },
    ],
  },
  {
    slug: 'wcag-2-1-aa-checker',
    related: ['wcag-2-aa-checklist', 'ada-website-compliance-guide', 'what-is-a-website-accessibility-checker'],
    standardId: 'wcag21',
    name: 'WCAG 2.1 AA Checker',
    seoTitle: 'Free WCAG 2.1 AA Checker: Test Any Page',
    description: 'Free WCAG 2.1 AA checker. Test any page against the standard most accessibility laws reference, and see how many failures it has, ranked by severity.',
    version: '2.1',
    level: 'AA',
    lead: 'Test any public web page against WCAG 2.1 Level AA, the version most accessibility laws and lawsuits reference today. Free, with no account needed.',
    whatIs: {
      heading: 'What Is WCAG 2.1 Level AA?',
      paragraphs: [
        'WCAG 2.1 became a W3C Recommendation in June 2018. It extended WCAG 2.0 with 17 new success criteria for mobile devices, people with low vision and people with cognitive and learning disabilities, and it kept everything from 2.0.',
        'At Level AA, WCAG 2.1 has 50 success criteria. That is the benchmark in the US Department of Justice rule for state and local government websites, in the European standard EN 301 549, and in most ADA website settlements. If you have been told your site must be "WCAG compliant" without further detail, WCAG 2.1 AA is usually what is meant.',
        'The additions that surprise teams most are Reflow (1.4.10), which requires content to work at 400 percent zoom without scrolling sideways, Non-text Contrast (1.4.11) for icons, input borders and focus indicators, and Text Spacing (1.4.12), which requires layouts to survive larger letter and line spacing.',
      ],
    },
    facts: [
      ['Published', 'June 5, 2018 (W3C Recommendation)'],
      ['Success criteria at Level A and AA', '50'],
      ['New in 2.1 at Level A and AA', '12 (plus 5 at Level AAA)'],
      ['Referenced by', 'DOJ ADA Title II rule, EN 301 549, most ADA settlements'],
      ['Newer version', 'WCAG 2.2 (includes all of 2.1 except 4.1.1)'],
    ],
    who: {
      heading: 'Who Needs WCAG 2.1 AA?',
      items: [
        'US state and local governments, public universities and transit agencies, under the Department of Justice ADA Title II rule adopted in 2024.',
        'Businesses serving the public in the US, where WCAG 2.1 AA is the standard most ADA Title III settlements and court orders use.',
        'Public sector bodies across the EU, and many private companies covered by the European Accessibility Act, through EN 301 549.',
        'Vendors answering procurement questionnaires that ask for WCAG 2.1 AA conformance.',
      ],
    },
    focus: {
      heading: 'What WCAG 2.1 Added at Level A and AA',
      intro: 'These requirements are not in WCAG 2.0, so older audits and templates often miss them.',
      items: [
        { title: '1.3.4 Orientation, AA', text: 'Pages must work in both portrait and landscape unless a specific orientation is essential.' },
        { title: '1.3.5 Identify Input Purpose, AA', text: 'Personal data fields such as name, email and address need the right autocomplete values. This checker tests it.' },
        { title: '1.4.10 Reflow, AA', text: 'Content must reflow into a single column at 320 CSS pixels wide, equivalent to 400 percent zoom, without horizontal scrolling.' },
        { title: '1.4.11 Non-text Contrast, AA', text: 'Icons, input borders, focus indicators and chart elements need 3:1 contrast against their background.' },
        { title: '1.4.12 Text Spacing, AA', text: 'Text must not be cut off when people increase line, paragraph, letter or word spacing. This checker tests inline styles that block it.' },
        { title: '2.5.1 to 2.5.4 Pointer and Motion, A', text: 'Multi-finger gestures need single-pointer alternatives, actions should fire on release, visible labels must match accessible names, and shake-to-act features need alternatives.' },
      ],
    },
    manual: [
      'Zoom the browser to 400 percent, or narrow the window to 320 pixels, and check that nothing needs sideways scrolling (1.4.10).',
      'Rotate a phone or tablet and confirm the page works in both orientations (1.3.4).',
      'Check the contrast of icons, input borders and focus outlines against their backgrounds (1.4.11).',
      'Make sure the visible text of each button matches or starts its accessible name (2.5.3).',
      'Tab through the page and confirm focus order and visible focus.',
      'Review alternative text and form error messages for meaning, not just presence.',
    ],
    faqs: [
      { q: 'Is WCAG 2.1 AA the legal standard for websites?', a: 'It is the most common one. The US Department of Justice adopted WCAG 2.1 AA for state and local government websites in 2024, the European standard EN 301 549 uses it for web content, and most ADA website settlements require it. Some laws still reference WCAG 2.0, and WCAG 2.2 is the newest version.' },
      { q: 'Should I test against WCAG 2.1 or 2.2?', a: 'If a contract or law names WCAG 2.1 AA, test against it and report against it. If you are free to choose, test against 2.2 AA: it includes almost everything in 2.1 plus six more A and AA criteria, so you cover both at once.' },
      { q: 'How many WCAG 2.1 AA criteria can be tested automatically?', a: 'Automated rules exist for part of the standard. The coverage table on this page shows exactly which WCAG 2.1 AA criteria this checker tests and which need manual review.' },
      { q: 'What does a WCAG 2.1 AA report include?', a: 'Each failure shows the element that failed, the success criterion and level, its severity and how to fix it. Items the tool cannot decide are listed separately for manual review.' },
    ],
    sources: [
      { label: 'W3C: Web Content Accessibility Guidelines (WCAG) 2.1', href: 'https://www.w3.org/TR/WCAG21/' },
      { label: 'W3C WAI: What is new in WCAG 2.1', href: 'https://www.w3.org/WAI/standards-guidelines/wcag/new-in-21/' },
      { label: 'ADA.gov: Fact sheet on the ADA Title II web and mobile rule', href: 'https://www.ada.gov/resources/2024-03-08-web-rule/' },
    ],
  },
  {
    slug: 'ada-compliance-checker',
    related: ['ada-website-compliance-guide', 'ada-lawsuit-process', 'free-tools-to-check-website-accessibility'],
    standardId: 'ada',
    name: 'ADA Compliance Checker',
    seoTitle: 'Free ADA Compliance Checker for Websites',
    description: 'Free ADA website compliance checker. Test any page against WCAG 2.1 AA, the benchmark used in ADA rules and settlements, and see how many issues it has.',
    version: '2.1',
    level: 'AA',
    lead: 'Check any public web page against WCAG 2.1 Level AA, the technical benchmark used in ADA regulations and website settlements. Free, with no account needed.',
    whatIs: {
      heading: 'What Does ADA Compliance Mean for a Website?',
      paragraphs: [
        'The Americans with Disabilities Act (ADA) is a 1990 civil rights law. It does not mention websites, but the Department of Justice has long taken the position that it covers them. Title II applies to state and local governments, and Title III applies to businesses that are open to the public, known as places of public accommodation.',
        'For Title II, the question is settled: in April 2024 the Department of Justice published a rule adopting WCAG 2.1 Level AA as the technical standard for government websites and mobile apps. For Title III businesses there is no website regulation yet, but courts and settlement agreements almost always use WCAG 2.1 AA as the measure. That is why an ADA compliance check is, in practice, a WCAG 2.1 AA check.',
        'Most website claims start with barriers an automated scan can find: missing alternative text, unlabeled form fields, empty links and low contrast. Finding and fixing those first, then testing key journeys with a keyboard and a screen reader, is the most practical way to reduce risk.',
      ],
    },
    facts: [
      ['Law', 'Americans with Disabilities Act of 1990, Titles II and III'],
      ['Technical benchmark', 'WCAG 2.1 Level AA'],
      ['Title II rule compliance dates', 'April 26, 2027 (50,000+ residents), April 26, 2028 (smaller entities), after a one-year extension in April 2026'],
      ['Title III', 'No web regulation; courts and settlements reference WCAG 2.1 AA'],
      ['Enforced by', 'Department of Justice and private lawsuits'],
    ],
    who: {
      heading: 'Who Needs to Think About ADA Website Compliance?',
      items: [
        'State and local government bodies, including cities, counties, public schools, public universities, courts and transit agencies (Title II).',
        'Businesses open to the public: retailers, restaurants, hotels, healthcare providers, banks, and service businesses with a website (Title III).',
        'E-commerce sites, which receive a large share of website accessibility claims because checkout and product pages involve forms and images.',
        'Agencies and developers who build websites for any of the above.',
      ],
    },
    focus: {
      heading: 'Barriers Most Often Cited in ADA Website Claims',
      intro: 'Demand letters and complaints tend to describe the same problems. The first five are ones this checker finds automatically.',
      items: [
        { title: 'Images without alternative text', text: 'Product photos, icons and linked images that a screen reader cannot describe (WCAG 1.1.1).' },
        { title: 'Unlabeled form fields', text: 'Search boxes, sign-up and checkout fields that do not announce what to enter (1.3.1, 4.1.2).' },
        { title: 'Empty links and buttons', text: 'Icon-only links such as social media, cart and menu buttons with no accessible name (2.4.4, 4.1.2).' },
        { title: 'Low color contrast', text: 'Light grey text, text over images and placeholder text that is hard to read (1.4.3).' },
        { title: 'Missing page language and titles', text: 'Pages that screen readers pronounce incorrectly or cannot identify (3.1.1, 2.4.2).' },
        { title: 'Keyboard barriers', text: 'Menus, pop-ups and carousels that cannot be reached or closed without a mouse. These need a manual keyboard test.' },
      ],
    },
    manual: [
      'Complete your most important task, such as checkout, booking or a contact form, using only a keyboard.',
      'Listen to the same task with a screen reader such as NVDA or VoiceOver.',
      'Check that pop-ups, cookie banners and chat widgets can be closed with the keyboard.',
      'Confirm that error messages explain what went wrong and how to fix it.',
      'Check PDFs and documents linked from key pages, which are also covered.',
      'Publish an accessibility statement with a way to report barriers.',
    ],
    faqs: [
      { q: 'Does the ADA apply to websites?', a: 'The Department of Justice says it does. For state and local governments, a 2024 rule sets WCAG 2.1 AA as the standard. For businesses open to the public, there is no specific regulation, but courts have applied the ADA to websites and settlements consistently require WCAG 2.1 AA.' },
      { q: 'Can a checker make my website ADA compliant?', a: 'No tool can on its own. An automated checker finds many of the code-level barriers that appear in claims, quickly and at scale. You still need to fix them, test key journeys manually and keep monitoring as your site changes.' },
      { q: 'Do accessibility overlays make a site ADA compliant?', a: 'Overlay widgets change how a page looks after it loads but do not fix the underlying code, and sites using them have still been sued. Fixing issues at the source is the reliable approach.' },
      { q: 'What happens if my website is not accessible?', a: 'Businesses can receive demand letters or lawsuits. Under federal Title III, plaintiffs can seek an order to fix the site plus attorney fees; some state laws, such as California\'s Unruh Act, also allow damages. Government bodies can face Department of Justice enforcement.' },
    ],
    sources: [
      { label: 'ADA.gov: Guidance on web accessibility and the ADA', href: 'https://www.ada.gov/resources/web-guidance/' },
      { label: 'ADA.gov: Fact sheet on the ADA Title II web and mobile rule', href: 'https://www.ada.gov/resources/2024-03-08-web-rule/' },
      { label: 'W3C: Web Content Accessibility Guidelines (WCAG) 2.1', href: 'https://www.w3.org/TR/WCAG21/' },
    ],
  },
  {
    slug: 'section-508-checker',
    related: ['wcag-2-aa-checklist', 'automated-vs-manual-accessibility-testing', 'free-tools-to-check-website-accessibility'],
    standardId: 'section508',
    name: 'Section 508 Checker',
    seoTitle: 'Free Section 508 Checker for Websites',
    description: 'Free Section 508 checker. Test any web page against WCAG 2.0 AA, the standard in the Revised 508 Standards for federal agencies, contractors and vendors.',
    version: '2.0',
    level: 'AA',
    lead: 'Test any public web page against WCAG 2.0 Level AA, the web standard incorporated into the Revised Section 508 Standards. Free, with no account needed.',
    whatIs: {
      heading: 'What Is Section 508?',
      paragraphs: [
        'Section 508 of the Rehabilitation Act requires US federal agencies to make the information and communication technology (ICT) they develop, buy, maintain or use accessible to people with disabilities, both employees and members of the public.',
        'The Revised 508 Standards, published by the US Access Board in January 2017 and in effect since January 18, 2018, incorporate WCAG 2.0 Level A and AA by reference. They apply WCAG 2.0 not only to websites but also to electronic documents such as PDFs and to software. That is why this checker runs the WCAG 2.0 AA rules when you choose Section 508.',
        'Section 508 reaches well beyond federal agencies in practice. Contractors and software vendors selling to the government are asked to show conformance, usually with an Accessibility Conformance Report based on the VPAT template, and many state governments and universities use Section 508 in their own procurement rules.',
      ],
    },
    facts: [
      ['Law', 'Section 508 of the Rehabilitation Act (29 U.S.C. 794d)'],
      ['Web standard', 'WCAG 2.0 Level A and AA'],
      ['Revised Standards in effect', 'January 18, 2018'],
      ['Success criteria at Level A and AA', '38'],
      ['Applies to', 'Federal agencies, and in practice their vendors and contractors'],
    ],
    who: {
      heading: 'Who Needs Section 508 Conformance?',
      items: [
        'US federal departments and agencies, for public websites, intranets, documents and software.',
        'Federal contractors and SaaS vendors, who are asked for an Accessibility Conformance Report (ACR), typically using the VPAT 508 edition.',
        'Many state agencies and public universities, which adopt Section 508 in their own accessibility policies and purchasing.',
        'Organizations receiving federal funding that choose Section 508 as their internal benchmark.',
      ],
    },
    focus: {
      heading: 'What Makes Section 508 Different From Plain WCAG',
      intro: 'The web requirements are WCAG 2.0 AA, but the Revised 508 Standards add context that matters for testing and reporting.',
      items: [
        { title: 'Documents are covered too', text: 'PDFs, Word files and presentations must meet the WCAG 2.0 AA requirements that apply to documents, not just web pages.' },
        { title: 'Software and apps', text: 'Desktop and mobile software must meet WCAG 2.0 AA as applied to software, plus the functional requirements in Chapter 5.' },
        { title: 'Functional performance criteria', text: 'Chapter 3 requires ways to use ICT without vision, with limited vision, without hearing, with limited manipulation and more.' },
        { title: 'Conformance reports', text: 'Vendors document conformance in an Accessibility Conformance Report. Automated results are useful evidence but need manual testing to back them up.' },
        { title: 'Trusted Tester process', text: 'Many agencies test with the DHS Trusted Tester methodology, which combines tools such as ANDI with manual steps.' },
        { title: 'WCAG 2.0, not 2.1', text: 'Section 508 still references WCAG 2.0. Testing against 2.1 or 2.2 is fine and exceeds the requirement, but report against 2.0 AA.' },
      ],
    },
    manual: [
      'Test every page template with a keyboard and a screen reader, as the Trusted Tester process does.',
      'Check linked PDFs and documents for tags, reading order, headings and alternative text.',
      'Confirm video has captions and, where needed, audio description.',
      'Review forms for clear labels, instructions and error identification.',
      'Record results per criterion so they can go into an Accessibility Conformance Report.',
      'Test with high contrast and zoom, per the functional performance criteria.',
    ],
    faqs: [
      { q: 'Is Section 508 the same as WCAG?', a: 'For web content, the Revised 508 Standards incorporate WCAG 2.0 Level A and AA. Section 508 also applies those requirements to documents and software, and adds functional performance criteria and requirements for hardware and support documentation.' },
      { q: 'Does Section 508 apply to private companies?', a: 'The law applies to federal agencies, but agencies must buy accessible ICT, so vendors and contractors are expected to meet it and provide an Accessibility Conformance Report. Many states and universities also require it.' },
      { q: 'What is a VPAT?', a: 'The Voluntary Product Accessibility Template is a document format from the Information Technology Industry Council. Once completed, it becomes an Accessibility Conformance Report describing how a product meets each requirement. A scan report is useful evidence, but a VPAT also needs manual testing.' },
      { q: 'Why does this checker use WCAG 2.0 for Section 508?', a: 'Because the Revised 508 Standards reference WCAG 2.0 AA. Running only the 2.0 rules gives you results that match what you must report. If you want to exceed the requirement, test against WCAG 2.2 AA as well.' },
    ],
    sources: [
      { label: 'Section508.gov: Official Section 508 program site', href: 'https://www.section508.gov/' },
      { label: 'US Access Board: Information and Communication Technology standards', href: 'https://www.access-board.gov/ict/' },
      { label: 'ITI: Voluntary Product Accessibility Template (VPAT)', href: 'https://www.itic.org/policy/accessibility/vpat' },
    ],
  },
  {
    slug: 'en-301-549-checker',
    related: ['wcag-2-aa-checklist', 'wcag-2-2-checklist', 'what-is-a-website-accessibility-checker'],
    standardId: 'en301549',
    name: 'EN 301 549 Checker',
    seoTitle: 'Free EN 301 549 Checker for Websites',
    description: 'Free EN 301 549 checker. Test any web page against the WCAG 2.1 AA requirements in the European accessibility standard behind the EAA and Web Accessibility Directive.',
    version: '2.1',
    level: 'AA',
    lead: 'Test any public web page against the web requirements of EN 301 549, the European accessibility standard, which uses WCAG 2.1 Level AA. Free, with no account needed.',
    whatIs: {
      heading: 'What Is EN 301 549?',
      paragraphs: [
        'EN 301 549 is the European standard for the accessibility of information and communication technology. It is published jointly by the European standards bodies ETSI, CEN and CENELEC. The version cited in the Official Journal of the EU is 3.2.1, from 2021. Version 4.1.1, published on September 2, 2026, is the first written for the European Accessibility Act and moves the web requirements to WCAG 2.2 Level A and AA; it is expected to be cited around the end of 2026.',
        'The standard covers far more than websites, including software, documents, hardware and two-way voice communication. For web content, Clause 9 reproduces the WCAG 2.1 Level A and AA success criteria, so a web page that meets WCAG 2.1 AA meets the web requirements of EN 301 549. That is why this checker runs the WCAG 2.1 AA rules when you choose EN 301 549.',
        'EN 301 549 is the harmonised standard for the EU Web Accessibility Directive, which covers public sector websites and apps. It is also the reference point for the European Accessibility Act (EAA), which applies to many consumer products and services, including e-commerce, banking, transport and e-books, from June 28, 2025. Version 4.1.1 was written to support the EAA.',
      ],
    },
    facts: [
      ['Published by', 'ETSI, CEN and CENELEC'],
      ['Cited version', '3.2.1 (2021), WCAG 2.1 for the web'],
      ['Latest version', '4.1.1 (September 2026), WCAG 2.2 for the web'],
      ['Web requirements', 'Clause 9: WCAG 2.1 Level A and AA'],
      ['Used for', 'EU Web Accessibility Directive and the European Accessibility Act'],
      ['EAA applies from', 'June 28, 2025'],
    ],
    who: {
      heading: 'Who Needs EN 301 549?',
      items: [
        'Public sector bodies in EU member states, for websites and mobile apps under the Web Accessibility Directive.',
        'Businesses selling covered products and services to consumers in the EU under the European Accessibility Act, such as online shops, banks, transport operators and e-book publishers, including companies based outside the EU.',
        'Suppliers to public bodies in the EU, where EN 301 549 is used in public procurement.',
        'Organizations that follow it voluntarily as a comprehensive accessibility benchmark.',
      ],
    },
    focus: {
      heading: 'What EN 301 549 Covers Beyond a Web Page Scan',
      intro: 'The web clause mirrors WCAG, but the full standard asks more. These are the areas teams most often overlook.',
      items: [
        { title: 'Clause 9: Web', text: 'The WCAG 2.1 A and AA success criteria for web pages. This is what this checker tests.' },
        { title: 'Clause 10: Documents', text: 'PDFs and office documents offered for download must meet equivalent requirements, including tagging and reading order.' },
        { title: 'Clause 11: Software', text: 'Apps and desktop software, including mobile apps, have their own set of requirements based on WCAG.' },
        { title: 'Clause 4: Functional performance', text: 'Products must be usable without vision, with limited vision, without hearing and with limited manipulation or strength.' },
        { title: 'Clause 12: Documentation and support', text: 'Help documentation and support services must be accessible and describe accessibility features.' },
        { title: 'Accessibility statement', text: 'The Web Accessibility Directive requires public bodies to publish one, and the EAA requires information on how services meet accessibility requirements.' },
      ],
    },
    manual: [
      'Test key user journeys, such as buying a product or opening an account, with a keyboard and a screen reader.',
      'Check downloadable PDFs and documents against Clause 10.',
      'Review your mobile app separately, under Clause 11.',
      'Zoom to 400 percent and check reflow (WCAG 1.4.10).',
      'Publish an accessibility statement with a feedback mechanism.',
      'Keep dated evidence of testing and fixes for regulators and customers.',
    ],
    faqs: [
      { q: 'Is EN 301 549 the same as WCAG 2.1?', a: 'For web content, yes: Clause 9 reproduces the WCAG 2.1 Level A and AA success criteria. The full standard also covers documents, software, hardware, functional performance and support, so it is broader than WCAG.' },
      { q: 'Does the European Accessibility Act apply to companies outside the EU?', a: 'Yes, if they sell covered products or services to consumers in the EU. Microenterprises providing services, with fewer than 10 employees and annual turnover or balance sheet of no more than 2 million euros, are exempt from the service requirements.' },
      { q: 'Will EN 301 549 move to WCAG 2.2?', a: 'Yes. Version 4.1.1, published on September 2, 2026, adds the six WCAG 2.2 Level A and AA success criteria. It gives a presumption of conformity once it is cited in the Official Journal, expected around the end of 2026. Choose WCAG 2.2 AA in AccessBell to test against it now; that also covers WCAG 2.1 AA.' },
      { q: 'Can I claim EN 301 549 conformance from a scan?', a: 'An automated scan covers part of Clause 9. A conformance claim also needs manual testing of the web criteria that tools cannot judge, plus any other clauses that apply to your product.' },
    ],
    sources: [
      { label: 'ETSI: EN 301 549 V3.2.1 (2021-03)', href: 'https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf' },
      { label: 'National Disability Authority (Ireland): EN 301 549 V4.1.1 published', href: 'https://nda.ie/news/en301549-published' },
      { label: 'EUR-Lex: Directive (EU) 2019/882, the European Accessibility Act', href: 'https://eur-lex.europa.eu/eli/dir/2019/882/oj' },
      { label: 'EUR-Lex: Directive (EU) 2016/2102, the Web Accessibility Directive', href: 'https://eur-lex.europa.eu/eli/dir/2016/2102/oj' },
    ],
  },
];

export const checkerPath = (c: Checker) => `/tools/${c.slug}`;

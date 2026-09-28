/**
 * Programmatic SEO pages at /industries/<slug>: the free scanner, framed
 * for one industry's specific compliance drivers and common failures.
 */
export type Industry = {
  slug: string;
  name: string;
  seoTitle: string;
  description: string;
  lead: string;
  stat: { text: string; href: string; label: string };
  whatIs: string[];
  commonIssues: { title: string; text: string }[];
  fixNotes: string[];
  faqs: { q: string; a: string }[];
  related: string[];
};

export const INDUSTRIES: Industry[] = [
  {
    slug: 'ecommerce',
    name: 'E-Commerce',
    seoTitle: 'E-Commerce Website Accessibility Checker',
    description: 'Free e-commerce accessibility checker. Test your online store for the WCAG failures that block sales and drive the most ADA demand letters.',
    lead: 'Scan your online store for the WCAG failures that block a sale, and that plaintiffs’ attorneys look for first.',
    stat: {
      text: 'In WebAIM’s 2025 Million report, every major e-commerce platform scored worse than the overall web average of 51 errors per home page: Shopify averaged 69.6, WooCommerce 75.6, and Magento 85.4 errors per page.',
      href: 'https://webaim.org/projects/million/2025',
      label: 'WebAIM Million 2025',
    },
    whatIs: [
      'E-commerce is one of the most heavily litigated categories in web accessibility, for a simple reason: a store that cannot be navigated by keyboard or read by a screen reader directly blocks a purchase, which is exactly the kind of concrete harm a demand letter or lawsuit describes.',
      'Product catalogs also multiply small mistakes. A single missing alt-text pattern applied across a catalog of hundreds of products becomes hundreds of individual failures, and a single broken checkout step blocks every customer who relies on assistive technology.',
    ],
    commonIssues: [
      { title: 'Keyboard traps in cart and checkout', text: 'Customers who cannot use a mouse are frequently unable to complete a purchase because a cart drawer, quantity selector or payment step does not support keyboard navigation.' },
      { title: 'Missing or generic product image alt text', text: 'Alt text failures are consistently the single most common issue in e-commerce, and they scale directly with catalog size.' },
      { title: 'Filter and sort controls', text: 'Faceted search and filter widgets built with custom JavaScript often do not announce their state changes to screen readers, so a filtered result count is never heard.' },
      { title: 'Low-contrast pricing and sale badges', text: 'Sale prices, discount badges and "low stock" labels are frequently styled with low-contrast colors chosen for visual emphasis rather than legibility.' },
      { title: 'Third-party apps and widgets', text: 'Reviews, upsell, live chat and marketing apps inject their own code, which is rarely audited for accessibility before it ships on every page.' },
    ],
    fixNotes: [
      'Fix checkout and cart issues first: they block revenue directly and are the most common trigger for a demand letter in this industry.',
      'Rescan after every theme change and every app or plugin install; third-party code is the most common source of regressions in e-commerce.',
    ],
    faqs: [
      { q: 'Why are e-commerce sites sued so often over accessibility?', a: 'Because the harm is concrete and easy to describe: a specific customer could not add an item to their cart, could not complete checkout, or could not read a price. That makes e-commerce a common target for demand letters and lawsuits.' },
      { q: 'Does my e-commerce platform matter?', a: 'It affects your starting point, but not your risk. WebAIM’s research found every major platform scores worse than the overall web average, so no platform is a safe default; a scan of your actual store is what matters.' },
      { q: 'What should I fix first on my store?', a: 'Cart and checkout keyboard access first, since it blocks purchases directly, followed by product image alt text, which is usually the highest-volume issue on a catalog site.' },
    ],
    related: ['ada-website-compliance-guide', 'shopify-accessibility-checker', 'ada-demand-letter'],
  },
  {
    slug: 'healthcare',
    name: 'Healthcare',
    seoTitle: 'Healthcare Website Accessibility Checker',
    description: 'Free healthcare website accessibility checker. Section 1557 now requires WCAG 2.1 AA for providers that accept Medicare, Medicaid or CHIP.',
    lead: 'Scan your patient-facing website against WCAG 2.1 AA, the standard Section 1557 of the ACA now requires for many healthcare organizations.',
    stat: {
      text: 'Under Section 1557 of the Affordable Care Act, healthcare organizations that accept Medicare, Medicaid or CHIP funding must meet WCAG 2.1 Level AA on their websites, mobile apps and patient-facing kiosks. HHS extended the original deadline by a year: recipients with 15 or more employees now have until May 11, 2027, and smaller recipients until May 10, 2028.',
      href: 'https://www.morganlewis.com/blogs/healthlawscan/2025/01/affordable-care-act-section-1557-new-language-accessibility-requirements',
      label: 'Section 1557 accessibility requirements',
    },
    whatIs: [
      'Section 1557 is not optional guidance; it is a federal nondiscrimination rule tied directly to funding. If your organization accepts Medicare, Medicaid or CHIP, and most providers do, your website, patient portal and any patient-facing kiosk are in scope.',
      'The rule follows you to your vendors. Booking widgets, patient portals, telehealth platforms and billing tools built by outside vendors are still your responsibility if a patient cannot use them.',
    ],
    commonIssues: [
      { title: 'Appointment booking widgets', text: 'Third-party scheduling tools embedded on provider sites are a frequent source of keyboard traps and unlabeled form fields, blocking patients from booking care.' },
      { title: 'Patient portal login and forms', text: 'Login screens and intake forms often lack proper labels and error messages, which is a serious barrier when the content involves personal health information.' },
      { title: 'PDF forms and documents', text: 'Intake forms, consent documents and insurance paperwork are frequently unlabeled scanned PDFs that a screen reader cannot read at all.' },
      { title: 'Provider directory search', text: 'Search and filter tools for finding a doctor or location often fail to announce results or filter changes to screen reader users.' },
      { title: 'Low-contrast text on clinical content', text: 'Medical information pages often use light gray text for secondary details, such as dosage notes or appointment instructions, that fails contrast requirements.' },
    ],
    fixNotes: [
      'Audit third-party tools (scheduling, patient portal, telehealth) separately, since Section 1557 makes you responsible for their accessibility even when you did not build them.',
      'Prioritize anything in the patient journey to get or manage care first: booking, portal login, and forms, since those carry both the most legal exposure and the most direct impact on patients.',
    ],
    faqs: [
      { q: 'Does Section 1557 apply to my healthcare organization?', a: 'If you accept Medicare, Medicaid or CHIP funding, generally yes. The rule covers a very wide range of healthcare providers, not just hospitals.' },
      { q: 'What is the deadline to comply?', a: 'HHS extended the original 2026 deadline by one year. Recipients with 15 or more employees now have until May 11, 2027, and smaller recipients until May 10, 2028.' },
      { q: 'Am I responsible for my patient portal vendor’s accessibility?', a: 'Under Section 1557, yes, in practice. Outsourcing a website, portal or booking tool to a vendor does not remove your obligation to ensure patients can use it.' },
    ],
    related: ['ada-website-compliance-guide', 'ada-lawsuit-process', 'wcag-2-2-checklist'],
  },
  {
    slug: 'higher-education',
    name: 'Higher Education',
    seoTitle: 'Higher Education Website Accessibility Checker',
    description: 'Free higher education accessibility checker. Section 504 and, for public institutions, the DOJ’s Title II rule now require WCAG 2.1 AA.',
    lead: 'Scan your college or university website against WCAG 2.1 AA, the standard now required under Section 504 and, for public institutions, the DOJ’s Title II rule.',
    stat: {
      text: 'Section 504 applies to virtually every accredited college and university, public or private, because of federal student aid. HHS’s 2024 rule harmonizes Section 504 with WCAG 2.1 AA; after a one-year extension, institutions with 15 or more employees must comply by May 11, 2027, and smaller institutions by May 10, 2028.',
      href: 'https://onlinelearningconsortium.org/olc-insights/2025/09/federal-digital-a11y-requirements/',
      label: 'federal digital accessibility requirements for higher ed',
    },
    whatIs: [
      'Higher education has two overlapping obligations. Section 504 covers essentially every institution because of federal student aid. Public colleges and universities, as government entities, are also covered by the DOJ’s Title II rule, which sets WCAG 2.1 AA compliance deadlines of April 2027 or 2028 depending on the entity.',
      'Scope goes well beyond the marketing website: course content and your learning management system, admissions and financial aid portals, campus event and dining systems, and faculty and department pages are all in scope.',
    ],
    commonIssues: [
      { title: 'PDF syllabi and course materials', text: 'Scanned or poorly tagged PDFs distributed through the LMS are one of the most common and highest-impact accessibility failures in higher ed, since they block a student’s coursework directly.' },
      { title: 'Admissions and financial aid forms', text: 'Multi-step application and aid forms frequently have missing labels and unclear error messages, at exactly the point a prospective student cannot afford to get stuck.' },
      { title: 'Video lectures without captions', text: 'Recorded lectures and course videos hosted outside the LMS often ship without captions or a transcript.' },
      { title: 'Department and faculty pages', text: 'Individually maintained department sites, often outside central IT’s control, are a common source of missing alt text, poor heading structure and low contrast.' },
      { title: 'Campus map and event tools', text: 'Interactive campus maps and event calendars built with custom widgets often fail basic keyboard and screen reader support.' },
    ],
    fixNotes: [
      'Start with anything in the enrollment funnel and current coursework: admissions forms, financial aid, and LMS content, since these carry the most direct impact on students and the most legal exposure.',
      'Give department-level site owners a simple way to check their own pages; centrally-run scans often miss the long tail of individually maintained content.',
    ],
    faqs: [
      { q: 'Does this apply to private colleges too?', a: 'Yes. Section 504 applies to any institution receiving federal financial assistance, which includes essentially every accredited private college through federal student aid, regardless of the DOJ’s Title II rule, which only covers public institutions directly.' },
      { q: 'What is the compliance deadline?', a: 'Under the HHS Section 504 rule, institutions with 15 or more employees must comply by May 11, 2027, and smaller institutions by May 10, 2028. Public institutions also face DOJ Title II deadlines around April 2027-2028 depending on the entity.' },
      { q: 'Does this cover our learning management system content?', a: 'Yes. Course content, PDFs, videos and other materials delivered through your LMS are within scope, not just the public-facing website.' },
    ],
    related: ['ada-website-compliance-guide', 'wcag-2-2-checklist', 'ada-lawsuit-process'],
  },
  {
    slug: 'government',
    name: 'Government',
    seoTitle: 'Government Website Accessibility Checker (Section 508 / Title II)',
    description: 'Free government accessibility checker. The DOJ’s Title II rule sets a WCAG 2.1 AA deadline for state and local government sites in 2027 and 2028.',
    lead: 'Scan your state or local government website against WCAG 2.1 AA, the standard the DOJ’s Title II rule now requires on a fixed deadline.',
    stat: {
      text: 'The DOJ’s Title II rule requires state and local government websites and mobile apps to meet WCAG 2.1 Level AA. After an April 2026 interim final rule extended the original timeline by a year, entities serving a population of 50,000 or more must comply by April 26, 2027, and smaller entities and special districts by April 26, 2028. The underlying obligation is already in force.',
      href: 'https://www.icemiller.com/thought-leadership/understanding-the-doj-rule-on-web-accessibility-ada-title-ii',
      label: 'DOJ Title II web accessibility rule',
    },
    whatIs: [
      'Unlike most industries, government web accessibility is not a matter of legal risk assessment: it is a rule with a fixed, published technical standard (WCAG 2.1 AA) and specific compliance deadlines, and federal contractors and agencies separately face Section 508.',
      'The rule covers far more than a homepage. Permit and license applications, tax payment portals, public meeting agendas and minutes, court and records search tools, and any mobile app your entity publishes are all in scope.',
    ],
    commonIssues: [
      { title: 'PDF forms, agendas and minutes', text: 'Permit applications, meeting agendas and public notices published as scanned or poorly tagged PDFs are one of the most common failures on government sites, and often the most legally visible.' },
      { title: 'Payment and permitting portals', text: 'Third-party systems for paying taxes, utility bills or applying for permits frequently have unlabeled fields and error messages that are not announced to screen readers.' },
      { title: 'Public records and court search tools', text: 'Search interfaces for court records, property records or public documents often fail basic keyboard operability.' },
      { title: 'Embedded meeting video', text: 'Livestreamed or archived public meetings are frequently published without captions, which is both an accessibility failure and, for some content, a separate legal issue.' },
      { title: 'Department and agency subsites', text: 'Individual department or agency pages, often built or maintained outside central IT, are a common source of missing alt text and poor heading structure.' },
    ],
    fixNotes: [
      'Prioritize anything a resident needs to complete a required civic task: paying a bill, applying for a permit, or accessing a public meeting record.',
      'Treat this as a compliance deadline, not a general goal. Document your scan history and fix timeline against the April 2027 or 2028 deadline that applies to your entity.',
    ],
    faqs: [
      { q: 'What deadline applies to my government entity?', a: 'Entities serving a population of 50,000 or more must comply by April 26, 2027. Smaller entities and special districts have until April 26, 2028. The underlying WCAG 2.1 AA obligation already applies.' },
      { q: 'Is this different from Section 508?', a: 'Section 508 applies to federal agencies and federal contractors. The DOJ’s Title II rule specifically covers state and local government entities, both using WCAG 2.1 AA as the technical standard.' },
      { q: 'Does this cover our mobile apps too?', a: 'Yes. The Title II rule covers government mobile applications as well as websites.' },
    ],
    related: ['section-508-checker', 'ada-website-compliance-guide', 'wcag-2-2-checklist'],
  },
  {
    slug: 'real-estate',
    name: 'Real Estate',
    seoTitle: 'Real Estate Website Accessibility Checker',
    description: 'Free real estate accessibility checker. Property and listing sites face double exposure under the ADA and the Fair Housing Act; scan yours now.',
    lead: 'Scan your property or listing site for the WCAG failures that create risk under both the ADA and the Fair Housing Act.',
    stat: {
      text: 'An inaccessible real estate website can raise exposure under two federal laws at once: the ADA, as a place of public accommodation, and the Fair Housing Act, which prohibits disability discrimination in the ability to search for and apply for housing. Multifamily and listing sites relying only on overlay widgets have become frequent lawsuit targets.',
      href: 'https://medium.com/@krisrivenburgh/fair-housing-act-and-website-accessibility-lawsuits-b9c37092a1d0',
      label: 'Fair Housing Act and website accessibility lawsuits',
    },
    whatIs: [
      'Real estate is unusual in facing two overlapping legal theories at once. A listing site that a screen reader user cannot navigate is both an ADA public-accommodation issue and, under the Fair Housing Act, a potential barrier to searching for or applying for housing, which is squarely what the FHA prohibits.',
      'That double exposure is a major reason plaintiffs’ attorneys target property management and real estate marketing sites specifically, and why an overlay-only fix is a particularly risky choice in this industry.',
    ],
    commonIssues: [
      { title: 'Property search and filter tools', text: 'Map-based and filter-driven search widgets are frequently unusable by keyboard and do not announce result counts to screen readers.' },
      { title: 'Listing image galleries', text: 'Photo galleries and virtual tour embeds commonly trap keyboard focus or lack any text alternative describing the property shown.' },
      { title: 'Application and lease forms', text: 'Rental application and lease forms, often the most consequential interaction on the site, frequently have missing labels and unclear validation errors.' },
      { title: 'Contact and inquiry forms', text: 'Forms to request a showing or contact an agent are a common point of failure, directly blocking a prospective tenant or buyer from reaching out.' },
      { title: 'Low-contrast pricing and availability badges', text: '"Available now," pricing and unit-status badges are frequently styled with low-contrast colors chosen for visual emphasis.' },
    ],
    fixNotes: [
      'Fix the application, lease and inquiry forms first: they are both the highest-risk point under the Fair Housing Act and the most direct barrier to housing access.',
      'Do not rely on an overlay alone in this industry; settlements in real estate and multifamily cases frequently require overlays to be removed and the underlying code fixed.',
    ],
    faqs: [
      { q: 'Why does real estate face more legal exposure than other industries?', a: 'Because an inaccessible property website can implicate two federal laws at once: the ADA and the Fair Housing Act, which specifically prohibits disability discrimination in access to housing search and applications.' },
      { q: 'Does this apply to a single listing site or property management company?', a: 'It applies broadly, from individual agent and brokerage sites to large multifamily and property management platforms; any site used to search for or apply for housing is in scope.' },
      { q: 'Is an accessibility overlay enough for a real estate site?', a: 'It is generally not considered a durable fix. Overlays run in the browser and do not change your code, and many real estate accessibility settlements specifically require them to be removed.' },
    ],
    related: ['accessibe-alternative', 'ada-lawsuit-process', 'ada-demand-letter'],
  },
];

export const industryPath = (i: Industry) => `/industries/${i.slug}`;

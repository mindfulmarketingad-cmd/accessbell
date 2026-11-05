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
  /** Free standard checkers (CHECKERS slugs) for the standard this industry is held to. */
  checkers: string[];
  /** Extra primary sources listed under the in-body citation. */
  sources?: { href: string; label: string }[];
  /** When this page's content was last reviewed. Defaults to the shared industry review date. */
  reviewed?: Date;
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
    related: ['ada-website-compliance-guide', 'best-ada-compliance-software-for-small-businesses', 'ada-demand-letter'],
    checkers: ['ada-compliance-checker', 'wcag-2-2-aa-checker'],
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
    checkers: ['wcag-2-1-aa-checker', 'ada-compliance-checker'],
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
    related: ['ada-title-ii-website-compliance', 'ada-website-compliance-guide', 'wcag-2-2-checklist'],
    checkers: ['wcag-2-1-aa-checker', 'ada-compliance-checker'],
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
    related: ['ada-title-ii-website-compliance', 'ada-website-compliance-guide', 'automated-vs-manual-accessibility-testing'],
    checkers: ['wcag-2-1-aa-checker', 'section-508-checker'],
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
    related: ['ada-lawsuit-process', 'ada-demand-letter'],
    checkers: ['ada-compliance-checker', 'wcag-2-2-aa-checker'],
  },
  {
    slug: 'restaurants',
    name: 'Restaurant',
    seoTitle: 'Restaurant Accessibility Checker',
    description: 'Free restaurant accessibility checker. Scan your menu, online ordering and reservation pages for the WCAG issues that block guests and show up in ADA website claims.',
    lead: 'Scan your restaurant website with a free restaurant accessibility checker. It finds the WCAG failures on menus, online ordering and reservations that can stop a guest from ordering, and that ADA website complaints often name.',
    stat: {
      text: 'In Robles v. Domino’s Pizza, the Ninth Circuit held in 2019 that the ADA applied to Domino’s website and mobile app because they connected customers to the goods and services of its physical restaurants, even when customers used them away from the restaurant.',
      href: 'https://cdn.ca9.uscourts.gov/datastore/opinions/2019/01/15/17-55504.pdf',
      label: 'Robles v. Domino’s Pizza, 913 F.3d 898 (9th Cir. 2019)',
    },
    whatIs: [
      'A restaurant accessibility checker scans the pages guests actually use: the menu, online ordering, reservations and the contact form. The ADA names a restaurant, bar, or other establishment serving food or drink as a public accommodation when its operations affect commerce. The Department of Justice’s web guidance lists food and drink establishments among the businesses that must make the goods and services they offer online accessible.',
      'There is no Title III regulation that sets a technical standard for business websites. The Department of Justice says businesses have flexibility in how they comply, and it points to the Web Content Accessibility Guidelines (WCAG) as helpful guidance. AccessBell’s ADA preset tests WCAG 2.1 Level AA. A restaurant accessibility checker shows the automated failures on a live page so you can fix the menu and the order flow, then keep checking as the site changes.',
    ],
    commonIssues: [
      { title: 'Menus that are only a picture or a PDF', text: 'A photo of the menu, or a PDF exported without tags, has no text alternative. Screen reader users cannot hear the dishes or the prices. WCAG 1.1.1 requires a text alternative for that content.' },
      { title: 'Ordering controls that need a mouse', text: 'Size, modifier and add-to-cart controls built as clickable boxes often have no accessible name and no keyboard support, so a guest cannot build an order without a mouse. That is a WCAG 2.1.1 and 4.1.2 failure.' },
      { title: 'Reservation and contact forms', text: 'Date, party size and phone fields are frequently unlabeled, and an error such as “pick a time” is not announced to a screen reader. WCAG 3.3.2 and 3.3.1 cover labels and error identification.' },
      { title: 'Allergens and specials shown only by color', text: 'A red dot for spicy, or a green badge for vegetarian, conveys nothing to someone who cannot see that color and nothing to a screen reader. WCAG 1.4.1 requires the information in text as well.' },
      { title: 'Embedded ordering and reservation widgets', text: 'Third-party ordering, reservation, review and chat widgets add their own markup. One unlabeled button or focus trap in the widget is on every page that loads it, and your theme cannot fix code the widget owns.' },
    ],
    fixNotes: [
      'Start with the pages that take an order or a reservation. A guest who cannot read the menu, choose a dish or submit a booking cannot spend money with you, and those are the journeys restaurant website complaints describe.',
      'Publish the menu as real text, or add a text alternative that includes the dishes and prices. Do not rely on a photo or an untagged PDF as the only menu.',
      'Name every ordering control in text, such as “Size: large” and “Add margherita pizza”, and check the flow with the keyboard: Tab to each control, activate it with Enter or Space, and leave pop-ups with Escape.',
      'Rescan after every theme, plugin or ordering-widget update. A new widget can add unlabeled buttons to every page overnight.',
    ],
    faqs: [
      { q: 'Does the ADA apply to my restaurant website?', a: 'If you are a restaurant, bar or other place serving food or drink and your operations affect commerce, the ADA lists you as a public accommodation. The Department of Justice says the ADA applies to the goods and services those businesses offer on the web, which includes online menus, ordering and reservations. In Robles v. Domino’s Pizza (9th Cir. 2019), the court held that Domino’s website and app were covered because they connected customers to its physical restaurants. This is general information, not legal advice.' },
      { q: 'What should a restaurant accessibility checker look at first?', a: 'The menu, the online ordering flow and the reservation or contact form. Those are the pages a guest needs to eat with you. Run the free scan above on each of them, then fix critical and serious issues before the rest of the site.' },
      { q: 'Will an overlay make my restaurant website compliant?', a: 'No. An overlay runs in the visitor’s browser and does not change your menu, forms or ordering code. The restaurant accessibility checker shows the failing markup so it can be fixed at the source. Guided fix suggestions can speed up specific edits, such as missing alt text and unnamed buttons. They do not make a site conform to WCAG on their own, and no tool can guarantee you will not be sued.' },
      { q: 'Can I scan my ordering page for free?', a: 'Yes. The scan on this page is free and needs no account. It tests one public URL. To see the failing code and the fix for every issue on that page, buy a Page Report for $19. A Domain Audit is $79 for up to 500 pages, once. Pro monitors up to 500 URLs per domain every day and starts with a 3-day free trial, then $29 per domain per month or $199 per domain per year.' },
    ],
    related: ['ada-title-iii-law-for-businesses', 'ada-website-compliance-guide', 'ada-demand-letter', 'wcag-1-1-1-non-text-content'],
    checkers: ['ada-compliance-checker', 'wcag-2-2-aa-checker'],
    reviewed: new Date('2026-11-02'),
    sources: [
      { href: 'https://www.law.cornell.edu/uscode/text/42/12181', label: '42 U.S.C. § 12181: a restaurant, bar, or other establishment serving food or drink is a public accommodation' },
      { href: 'https://www.ada.gov/resources/web-guidance/', label: 'ADA.gov: Guidance on Web Accessibility and the ADA (March 18, 2022)' },
      { href: 'https://www.w3.org/TR/WCAG22/', label: 'W3C: Web Content Accessibility Guidelines (WCAG) 2.2' },
    ],
  },
  {
    slug: 'hotels',
    name: 'Hotel',
    seoTitle: 'Hotel Accessibility Checker',
    description: 'Free hotel accessibility checker. Scan booking, room and contact pages for the WCAG issues that block a reservation and show up in ADA website claims.',
    lead: 'Scan your hotel website with a free hotel accessibility checker. It finds the WCAG failures on booking, room and contact pages that can stop a guest from reserving, and that ADA website complaints often name.',
    stat: {
      text: 'The Department of Justice’s March 18, 2022 web guidance lists hotels, inns and motels among the businesses open to the public, and says the ADA applies to the goods, services and privileges those businesses offer on the web.',
      href: 'https://www.ada.gov/resources/web-guidance/',
      label: 'ADA.gov: Guidance on Web Accessibility and the ADA (March 18, 2022)',
    },
    whatIs: [
      'A hotel accessibility checker scans the pages a guest uses to choose a room and book it: the booking form, a room page, photos and the contact form. The ADA lists an inn, hotel, motel or other place of lodging as a public accommodation when its operations affect commerce. A narrow exception covers a place inside a building with five or fewer rooms for rent when the owner lives there. The Department of Justice’s web guidance names hotels, inns and motels as businesses that must make the goods and services they offer online accessible.',
      'Hotels also have a reservation rule that is separate from WCAG. Under 28 C.F.R. § 36.302(e), a place of lodging must let people reserve accessible guest rooms in the same manner as other rooms, and describe accessible features in enough detail for a guest to decide whether a room meets their needs. A booking page that hides those features in an unlabeled image fails that practical need. There is still no Title III regulation that sets a technical standard for business websites. The Department of Justice says businesses have flexibility in how they comply, and it points to the Web Content Accessibility Guidelines (WCAG) as helpful guidance. A 2010 consent decree required Hilton’s websites on hilton.com to meet WCAG 2.0 Level A for the term of that decree, which has ended. The decree bound Hilton, not every hotel. AccessBell’s ADA preset tests WCAG 2.1 Level AA. A hotel accessibility checker shows the automated failures on a live page so you can fix the booking flow, then keep checking as rates and photos change.',
    ],
    commonIssues: [
      { title: 'Booking calendars that need a mouse', text: 'Date pickers built as clickable grids often have no keyboard support and no accessible name for each day, so a guest cannot choose arrival and departure without a mouse. That is a WCAG 2.1.1 and 4.1.2 failure.' },
      { title: 'Room photos with no text alternative', text: 'A gallery of room and amenity photos with empty alt text tells a screen reader user nothing about the bed, the bathroom or the entrance. WCAG 1.1.1 requires a text alternative. The reservation rule also asks lodging sites to describe accessible features in enough detail for a guest to judge the room.' },
      { title: 'Guest details and request forms', text: 'Name, phone and accessible-room fields are frequently unlabeled, and an error such as “choose a date” is not announced. WCAG 3.3.2 and 3.3.1 cover labels and error identification. The Department of Justice’s web guidance calls out inaccessible online forms as a barrier.' },
      { title: 'Rates and availability shown only by color', text: 'A red label for sold out, or a green badge for an accessible room, conveys nothing to someone who cannot see that color and nothing to a screen reader. WCAG 1.4.1 requires the information in text as well.' },
      { title: 'Embedded booking engines', text: 'Third-party booking, review and chat widgets add their own markup. One unlabeled button or focus trap in the widget is on every page that loads it, and your theme cannot fix code the widget owns.' },
    ],
    fixNotes: [
      'Start with the booking path: dates, room choice, guest details and the confirmation. A guest who cannot pick a date or submit a reservation cannot stay with you, and those are the journeys hotel website complaints describe.',
      'Describe accessible room features in text, not only in a photo or an icon. Put details a guest needs in order to decide, such as a roll-in shower or a visual alarm, in the same booking flow as other rooms.',
      'Name every booking control in text, such as “Check-in date” and “Select king room”, and check the flow with the keyboard: Tab to each control, activate it with Enter or Space, and leave calendars and pop-ups with Escape.',
      'Rescan after every theme, booking-engine or photo update. A new widget can add unlabeled buttons to every room page overnight.',
    ],
    faqs: [
      { q: 'Does the ADA apply to my hotel website?', a: 'If you operate an inn, hotel, motel or other place of lodging and your operations affect commerce, the ADA lists you as a public accommodation, with a narrow exception for a place inside a building with five or fewer rooms for rent when the owner lives there. The Department of Justice says the ADA applies to the goods and services those businesses offer on the web, which includes online booking. A separate rule, 28 C.F.R. § 36.302(e), requires places of lodging to let guests reserve accessible rooms in the same manner as other rooms and to describe accessible features in enough detail. This is general information, not legal advice.' },
      { q: 'What should a hotel accessibility checker look at first?', a: 'The booking flow, one room page and the contact form. Those are the pages a guest needs to reserve a stay. Run the free scan above on each of them, then fix critical and serious issues before the rest of the site.' },
      { q: 'Will an overlay make my hotel website compliant?', a: 'No. An overlay runs in the visitor’s browser and does not change your booking form, room descriptions or photos. The hotel accessibility checker shows the failing markup so it can be fixed at the source. Guided fix suggestions can speed up specific edits, such as missing alt text and unnamed buttons. They do not make a site conform to WCAG on their own, and no tool can guarantee you will not be sued.' },
      { q: 'Can I scan my booking page for free?', a: 'Yes. The scan on this page is free and needs no account. It tests one public URL. To see the failing code and the fix for every issue on that page, buy a Page Report for $19. A Domain Audit is $79 for up to 500 pages, once. Pro monitors up to 500 URLs per domain every day and starts with a 3-day free trial, then $29 per domain per month or $199 per domain per year.' },
    ],
    related: ['ada-title-iii-law-for-businesses', 'ada-website-compliance-guide', 'ada-demand-letter', 'wcag-3-3-2-labels-or-instructions'],
    checkers: ['ada-compliance-checker', 'wcag-2-2-aa-checker'],
    reviewed: new Date('2026-11-03'),
    sources: [
      { href: 'https://www.law.cornell.edu/uscode/text/42/12181', label: '42 U.S.C. § 12181: an inn, hotel, motel, or other place of lodging is a public accommodation' },
      { href: 'https://www.law.cornell.edu/cfr/text/28/36.302', label: '28 C.F.R. § 36.302(e): reservations made by places of lodging' },
      { href: 'https://archive.ada.gov/hilton/hilton.htm', label: 'United States v. Hilton Worldwide Inc. consent decree (November 29, 2010): WCAG 2.0 Level A on hilton.com for the term of the decree' },
      { href: 'https://www.w3.org/TR/WCAG22/', label: 'W3C: Web Content Accessibility Guidelines (WCAG) 2.2' },
    ],
  },
  {
    slug: 'dental-practices',
    name: 'Dental Practice',
    seoTitle: 'Dental Practice Accessibility Checker',
    description: 'Free dental practice accessibility checker. Scan appointment, new-patient and contact pages for the WCAG issues that block patients and show up in ADA claims.',
    lead: 'Scan your dental practice website with a free dental practice accessibility checker. It finds the WCAG failures on appointment, new-patient and contact pages that can stop a patient from booking, and that ADA website complaints often name.',
    stat: {
      text: 'The Department of Justice, in its March 18, 2022 web guidance, lists hospitals and medical offices among the businesses open to the public, and says the ADA applies to the goods, services and privileges those businesses offer on the web.',
      href: 'https://www.ada.gov/resources/web-guidance/',
      label: 'ADA.gov: Guidance on Web Accessibility and the ADA (March 18, 2022)',
    },
    whatIs: [
      'A dental practice accessibility checker scans the pages a patient uses to book care: the appointment form, new-patient paperwork and the contact page. The ADA lists a professional office of a health care provider as a public accommodation when its operations affect commerce. A dental office is that kind of office. The Department of Justice web guidance names hospitals and medical offices as businesses that must make the goods and services they offer online accessible.',
      'There is no Title III regulation that sets a technical standard for business websites. The Department of Justice says businesses have flexibility in how they comply, and it points to the Web Content Accessibility Guidelines (WCAG) and the Section 508 standards as helpful guidance. The same guidance lists barriers that show up on practice sites: poor color contrast, information shown by color alone, images without text alternatives, videos without captions, forms without labels or error messages, and mouse-only navigation. The AccessBell ADA preset tests WCAG 2.1 Level AA. A dental practice accessibility checker shows the automated failures on a live page so the booking path can be fixed, then checked again as hours and forms change.',
    ],
    commonIssues: [
      { title: 'Appointment forms without labels or error messages', text: 'Name, phone, insurance and reason-for-visit fields are frequently unlabeled, and an error such as "pick a time" is not announced. The Department of Justice web guidance calls out inaccessible online forms, including missing labels, unclear instructions and missing error indicators. WCAG 3.3.2 and 3.3.1 cover labels and error identification.' },
      { title: 'Date and time controls that need a mouse', text: 'Calendars built as clickable grids often have no keyboard support and no accessible name for each day, so a patient cannot choose a visit without a mouse. The web guidance names mouse-only navigation as a barrier. That is a WCAG 2.1.1 and 4.1.2 failure.' },
      { title: 'Office, team and treatment photos with no text alternative', text: 'A gallery with empty alt text tells a screen reader user nothing about the office, the clinician or the treatment shown. The web guidance says people who are blind will not understand the content and purpose of an image when no text alternative is provided. WCAG 1.1.1 requires one.' },
      { title: 'Hours and new-patient notes shown only by color or low contrast', text: 'A green badge for accepting new patients, or light gray text for office hours, fails people who cannot see that color or that faint type. The web guidance lists poor color contrast and the use of color alone to give information. WCAG 1.4.3 and 1.4.1 cover contrast and color.' },
      { title: 'Embedded scheduling, review and chat widgets', text: 'Third-party scheduling, review and chat widgets add their own markup. One unlabeled button or focus trap in the widget is on every page that loads it, and the theme cannot fix code the widget owns.' },
    ],
    fixNotes: [
      'Start with the appointment path: date, time, patient details and the confirmation. A patient who cannot pick a time or submit the form cannot book.',
      'Label every field in text, such as "Phone number" and "Preferred date", and make sure an error says what is wrong and how to fix it. Do not rely on placeholder text or a red border alone.',
      'Name every scheduling control in text, and check the flow with the keyboard: Tab to each control, activate it with Enter or Space, and leave calendars and pop-ups with Escape.',
      'Rescan after every scheduling-widget, theme or form update. A new widget can add unlabeled buttons to the appointment page overnight.',
    ],
    faqs: [
      { q: 'Does the ADA apply to my dental practice website?', a: 'If you operate a dental office and your operations affect commerce, the ADA lists a professional office of a health care provider as a public accommodation. The Department of Justice web guidance includes hospitals and medical offices among businesses open to the public, and says the ADA applies to the goods and services those businesses offer on the web, which includes online appointment booking. There is no Title III regulation that names a technical standard for business websites. This is general information, not legal advice.' },
      { q: 'What should a dental practice accessibility checker look at first?', a: 'The appointment page, one new-patient form and the contact page. Those are the pages a patient needs in order to become a patient. Run the free scan above on each of them, then fix critical and serious issues before the rest of the site.' },
      { q: 'Will an overlay make my dental practice website compliant?', a: 'No. An overlay runs in the browser and does not change the appointment form, patient forms or photos. The dental practice accessibility checker shows the failing markup so it can be fixed at the source. Guided fix suggestions can speed up specific edits, such as missing alt text and unnamed buttons. They do not make a site conform to WCAG on their own, and no tool can guarantee you will not be sued.' },
      { q: 'Can I scan my appointment page for free?', a: 'Yes. The scan on this page is free and needs no account. It tests one public URL. To see the failing code and the fix for every issue on that page, buy a <a href="/solutions/page-report">Page Report</a> for $19. A <a href="/solutions/domain-audit">Domain Audit</a> is $79 for up to 500 pages, once. <a href="/app/signup">Pro</a> monitors up to 500 URLs per domain every day and starts with a 3-day free trial, then $29 per domain per month or $199 per domain per year. Cancel before the trial ends and you will not be charged.' },
    ],
    related: ['ada-title-iii-law-for-businesses', 'ada-website-compliance-guide', 'ada-demand-letter', 'wcag-3-3-2-labels-or-instructions'],
    checkers: ['ada-compliance-checker', 'wcag-2-2-aa-checker'],
    reviewed: new Date('2026-11-04'),
    sources: [
      { href: 'https://www.law.cornell.edu/uscode/text/42/12181', label: '42 U.S.C. § 12181(7)(F): a professional office of a health care provider is a public accommodation' },
      { href: 'https://www.ada.gov/resources/web-guidance/', label: 'ADA.gov: Guidance on Web Accessibility and the ADA (March 18, 2022), listing hospitals and medical offices' },
      { href: 'https://www.w3.org/TR/WCAG22/', label: 'W3C: Web Content Accessibility Guidelines (WCAG) 2.2' },
    ],
  },
  {
    slug: 'law-firms',
    name: 'Law Firm',
    seoTitle: 'Law Firm ADA Website Accessibility Checker',
    description: 'Free law firm accessibility checker. Scan intake forms, attorney bios and booking pages for WCAG issues that block clients and show up in ADA website claims.',
    lead: 'Scan your law firm website with a free law firm accessibility checker. It finds the WCAG failures on contact and intake forms, attorney bios and booking pages that can stop a client from reaching the firm, and that ADA website complaints often name.',
    stat: {
      text: 'Title III of the ADA defines places of public accommodation to include the “office of an accountant or lawyer” when the operations of that office affect commerce. 42 U.S.C. § 12181(7)(F).',
      href: 'https://www.law.cornell.edu/uscode/text/42/12181',
      label: '42 U.S.C. § 12181(7)(F): the office of an accountant or lawyer is a public accommodation',
    },
    whatIs: [
      'A law firm accessibility checker scans the pages a prospective client uses to reach the firm: the contact or intake form, attorney biography pages and any public page that links a consultation booking. Title III of the ADA defines a place of public accommodation to include the office of an accountant or lawyer when its operations affect commerce. A law office is that kind of office.',
      'There is no Title III regulation that sets a technical standard for business websites. The Department of Justice, in its March 18, 2022 web guidance, says the ADA applies to the goods, services, privileges and activities that public accommodations offer on the web, and that businesses have flexibility in how they comply. It points to the Web Content Accessibility Guidelines (WCAG) and the Section 508 standards as helpful guidance. The same guidance lists barriers that show up on firm sites: poor color contrast, information shown by color alone, images without text alternatives, videos without captions, forms without labels or error messages, and mouse-only navigation. The AccessBell ADA preset tests WCAG 2.1 Level AA. A law firm accessibility checker shows the automated failures on a public page so the intake path can be fixed, then checked again as bios and forms change.',
    ],
    commonIssues: [
      { title: 'Contact and intake forms without labels', text: 'Name, phone, email and matter-type fields are frequently unlabeled, and an error such as "enter a phone number" is not announced. The Department of Justice web guidance calls out inaccessible online forms, including missing labels, unclear instructions and missing error indicators. WCAG 3.3.2 and 3.3.1 cover labels and error identification.' },
      { title: 'Attorney bio images with no text alternative', text: 'Headshots and office photos with empty alt text tell a screen reader user nothing about the attorney or the office shown. The web guidance says people who are blind will not understand the content and purpose of an image when no text alternative is provided. WCAG 1.1.1 requires a text alternative for an image that conveys information.' },
      { title: 'Retainer and agreement PDFs', text: 'Engagement letters, retainers and fee agreements posted only as an untagged PDF have no reading order a screen reader can follow. The W3C PDF techniques for WCAG describe tags, a document title and text alternatives for figures. A scan of the HTML page does not open the file.' },
      { title: 'Calendar and booking widgets', text: 'Consultation calendars built as clickable grids often have no keyboard support and no accessible name for each day, so a visitor cannot choose a time without a mouse. The web guidance names mouse-only navigation as a barrier. That is a WCAG 2.1.1 and 4.1.2 failure. A third-party booking widget adds its own markup, and the theme cannot fix code the widget owns.' },
      { title: 'Client portal login and documents', text: 'Login, document and message screens in a client portal often have unlabeled fields and controls that only work with a mouse. WCAG 3.3.2 and 2.1.1 cover labels and keyboard access. The free scan tests one public URL, so a page that requires a login is outside that scan.' },
      { title: 'Navigation and keyboard traps', text: 'A menu, chat widget or booking pop-up that keeps keyboard focus inside it, with no way to move on, is a keyboard trap. WCAG 2.1.2 requires a keyboard way out. WCAG 2.1.1 requires the menu itself to work without a mouse. Finding a trap takes a person: Tab through the header, the chat window and the booking pop-up, and confirm Tab or Escape leaves each one.' },
    ],
    fixNotes: [
      'Start with the contact and intake path: labels, errors and the confirmation. A person who cannot submit the form cannot hire the firm.',
      'Label every field in text, such as "Phone number" and "Type of matter", and make sure an error says what is wrong and how to fix it. Do not rely on placeholder text or a red border alone.',
      'Give each informative attorney photo a short text alternative, such as the attorney name. Publish retainers and fee agreements as HTML or as a tagged PDF, and give the link a name that says it opens a PDF.',
      'Check booking widgets and menus with the keyboard: Tab to each control, activate it with Enter or Space, and leave calendars and pop-ups with Escape.',
      'Use the code example on an issue, such as a missing label or empty alt text, as the guide for the edit in your own templates. A guided fix suggestion does not change the site by itself and does not make the site conform to WCAG.',
    ],
    faqs: [
      { q: 'Does the ADA apply to my law firm website?', a: 'If you operate an office of a lawyer and your operations affect commerce, Title III of the ADA lists that office as a public accommodation in 42 U.S.C. § 12181(7)(F), in the same clause as the office of an accountant and other service establishments. The Department of Justice web guidance says the ADA applies to the goods, services, privileges and activities public accommodations offer on the web, which includes online contact and intake. There is no Title III regulation that names a technical standard for business websites. This is general information, not legal advice.' },
      { q: 'What should a law firm accessibility checker look at first?', a: 'The contact or intake form, one attorney biography and any public page that links a consultation booking. Those are the pages a prospective client needs in order to reach the firm. Run the free scan above on each public URL, then fix critical and serious issues before the rest of the site. A retainer posted as a PDF can be checked with the <a href="/tools/pdf-accessibility-checker">free PDF accessibility checker</a>. A client portal behind a login is not part of that public scan. <a href="/resources/help-center/domains/scan-staging-and-protected-sites">Pro can send custom HTTP headers</a> for staging sites and pages behind basic authentication or a login.' },
      { q: 'Will an overlay make my law firm website compliant?', a: 'No. An overlay runs in the browser and does not change the intake form, attorney photos, PDFs or booking widget. The law firm accessibility checker shows the failing markup so it can be fixed at the source. Guided fix suggestions and code examples can speed up specific edits, such as missing alt text and unnamed buttons. They do not make a site conform to WCAG on their own, and no tool can guarantee you will not be sued.' },
      { q: 'Can I scan my intake page for free?', a: 'Yes. The scan on this page is free and needs no account. It tests one public URL. To see the failing code and the fix for every issue on that page, buy a <a href="/solutions/page-report">Page Report</a> for $19. A <a href="/solutions/domain-audit">Domain Audit</a> is $79 for up to 500 pages, once. <a href="/app/signup">Pro</a> monitors up to 500 URLs per domain every day and starts with a 3-day free trial, then $29 per domain per month or $199 per domain per year. Cancel before the trial ends and you will not be charged.' },
    ],
    related: ['ada-title-iii-law-for-businesses', 'ada-compliance-report-for-lawyer', 'wcag-3-3-2-labels-or-instructions', 'wcag-1-1-1-non-text-content'],
    checkers: ['ada-compliance-checker', 'wcag-2-2-aa-checker'],
    reviewed: new Date('2026-11-05'),
    sources: [
      { href: 'https://www.ada.gov/resources/web-guidance/', label: 'ADA.gov: Guidance on Web Accessibility and the ADA (March 18, 2022)' },
      { href: 'https://www.w3.org/TR/WCAG22/', label: 'W3C: Web Content Accessibility Guidelines (WCAG) 2.2' },
      { href: 'https://www.w3.org/WAI/WCAG22/Techniques/#pdf', label: 'W3C: PDF Techniques for WCAG 2.2' },
    ],
  },
];

export const industryPath = (i: Industry) => `/industries/${i.slug}`;

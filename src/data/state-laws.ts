/**
 * Programmatic SEO pages at /state-accessibility-laws/<slug>: the free
 * scanner, framed around one state's specific accessibility litigation
 * landscape and laws.
 */
export type StateLaw = {
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

export const STATE_LAWS: StateLaw[] = [
  {
    slug: 'california',
    name: 'California',
    seoTitle: 'California Website Accessibility Law (Unruh Act)',
    description: 'Free website accessibility checker for California businesses. The Unruh Act carries $4,000 in statutory damages per violation, no proof of harm needed.',
    lead: 'Scan your website against WCAG before a California plaintiff’s attorney does. The Unruh Act carries $4,000 in statutory damages per violation, with no need to prove actual harm.',
    stat: {
      text: 'Unruh Civil Rights Act filings against websites exceeded 3,000 in California in 2025. A California appellate ruling that online-only businesses are not a "place of public accommodation" under the ADA has pushed most website accessibility claims in the state out of federal court and into state court as Unruh Act cases instead, each carrying a $4,000 statutory minimum per violation.',
      href: 'https://www.accessibility.works/blog/unruh-act-website-compliance-california-website-accessibility/',
      label: 'California Unruh Act litigation trends',
    },
    whatIs: [
      'California’s Unruh Civil Rights Act independently prohibits disability discrimination, and courts have applied it to inaccessible websites. Unlike a typical ADA claim, Unruh does not require the plaintiff to prove they were actually harmed: each violation carries a $4,000 statutory minimum in damages, plus attorney’s fees.',
      'That statutory minimum, combined with no requirement to show actual harm, is why California generates more website accessibility litigation than any other state, even as the specific legal path has shifted from federal ADA claims toward state-court Unruh Act claims.',
    ],
    commonIssues: [
      { title: 'Missing form labels', text: 'Contact, checkout and account forms without properly associated labels are one of the most commonly cited issues in Unruh Act complaints.' },
      { title: 'Low color contrast', text: 'Text and buttons that fail the WCAG 4.5:1 contrast minimum are easy for a plaintiff’s expert to document and are frequently cited.' },
      { title: 'Missing image alt text', text: 'Product images, icons and informational graphics with no alt text are a straightforward, well-documented violation.' },
      { title: 'Keyboard traps and inaccessible navigation', text: 'Menus, modals and carousels that cannot be operated by keyboard block a real category of visitors and are commonly cited as concrete harm.' },
      { title: 'Missing page titles and language', text: 'Pages with no descriptive title or no declared language are quick to detect and commonly appear in complaint filings.' },
    ],
    fixNotes: [
      'Fix the issues most commonly cited in Unruh Act complaints first: form labels, contrast, alt text, keyboard access and page titles, since these are the fastest for an opposing expert to document.',
      'Keep dated scan reports and a fix log. A documented, ongoing testing program is one of the strongest things to show if a claim does arrive.',
    ],
    faqs: [
      { q: 'What is the Unruh Civil Rights Act?', a: 'A California law that independently prohibits disability discrimination, including by businesses with inaccessible websites. It carries a $4,000 statutory minimum in damages per violation, and a plaintiff does not need to prove they were actually harmed to recover it.' },
      { q: 'Why did California ADA lawsuits move to state court?', a: 'A California appellate court held that an online-only business is not a "place of public accommodation" under the ADA, which made federal ADA claims harder to bring against many websites. Plaintiffs’ attorneys shifted to filing Unruh Act claims in state court instead, where the same underlying website issues still create liability.' },
      { q: 'Does this only apply to businesses based in California?', a: 'It applies to businesses that operate in California or serve California customers, not only those headquartered there. If your website serves California visitors, the Unruh Act can apply.' },
    ],
    related: ['ada-lawsuit-process', 'ada-demand-letter', 'ada-website-compliance-guide'],
  },
  {
    slug: 'new-york',
    name: 'New York',
    seoTitle: 'New York Website Accessibility Law',
    description: 'Free website accessibility checker for New York businesses. New York leads the country in federal website accessibility lawsuit filings.',
    lead: 'Scan your website against WCAG before a New York plaintiff’s attorney does. New York consistently files more federal website accessibility lawsuits than any other state.',
    stat: {
      text: 'New York led the country in federal ADA Title III website accessibility lawsuit filings in 2025, with reporting from Seyfarth Shaw’s ADA Title III tracker and other trackers consistently placing it first by volume, well ahead of every other state.',
      href: 'https://www.adatitleiii.com/2026/03/federal-court-website-accessibility-lawsuit-filings-bounce-back-in-2025/',
      label: 'ADA Title III lawsuit filing trends',
    },
    whatIs: [
      'New York does not have a California-style statutory damages law specific to accessibility, but it has the country’s most active plaintiffs’ bar for website accessibility claims, filing in federal court under the ADA and, for New York City businesses, potentially under the New York City Human Rights Law as well.',
      'The volume itself is the risk: with more filings originating from New York than any other state, businesses that serve New York customers, or are based there, face a meaningfully higher baseline chance of receiving a demand letter or complaint.',
    ],
    commonIssues: [
      { title: 'Missing form labels', text: 'Checkout, account and contact forms without properly associated labels are a frequently cited, easy-to-document issue.' },
      { title: 'Inaccessible navigation menus', text: 'Dropdown and mobile menus that cannot be operated by keyboard or are not announced correctly to screen readers are commonly cited.' },
      { title: 'Missing alt text on images', text: 'Product images, banners and icons published with no alt text remain one of the most common and easiest-to-cite failures.' },
      { title: 'Low contrast text', text: 'Text and interactive elements that fall below WCAG’s minimum contrast ratio are straightforward for an expert to document.' },
      { title: 'Inaccessible PDFs', text: 'Menus, catalogs and forms published as untagged PDFs are frequently cited alongside website issues in filings.' },
    ],
    fixNotes: [
      'Fix the highest-volume, easiest-to-document issues first: form labels, navigation, alt text and contrast, since these are what most filings specifically cite.',
      'If you operate in New York City specifically, review your obligations under the NYC Human Rights Law in addition to the ADA with your attorney.',
    ],
    faqs: [
      { q: 'Why does New York have so many website accessibility lawsuits?', a: 'New York has the country’s most active plaintiffs’ bar for this type of claim, consistently filing more federal ADA Title III website accessibility lawsuits than any other state.' },
      { q: 'Is there a New York-specific accessibility law like California’s Unruh Act?', a: 'New York does not have an identical statutory-damages law, but New York City businesses may also face claims under the NYC Human Rights Law in addition to the federal ADA. Talk to an attorney about which laws apply to your specific business.' },
      { q: 'Does this apply to my business if I am not based in New York?', a: 'It can. If your website serves New York customers, you can face a claim filed in New York regardless of where your business is headquartered.' },
    ],
    related: ['ada-lawsuit-process', 'ada-demand-letter', 'ada-website-compliance-guide'],
  },
  {
    slug: 'florida',
    name: 'Florida',
    seoTitle: 'Florida Website Accessibility Law',
    description: 'Free website accessibility checker for Florida businesses. Florida federal website accessibility lawsuit filings rose sharply in 2025.',
    lead: 'Scan your website against WCAG before a Florida plaintiff’s attorney does. Florida federal filings rose sharply in 2025 and now rank among the highest in the country.',
    stat: {
      text: 'Florida federal website accessibility lawsuit filings rose sharply in 2025, roughly doubling year over year according to multiple lawsuit trackers, making it one of the two or three highest-filing states in the country alongside New York.',
      href: 'https://www.adatitleiii.com/2026/03/federal-court-website-accessibility-lawsuit-filings-bounce-back-in-2025/',
      label: 'ADA Title III lawsuit filing trends',
    },
    whatIs: [
      'Florida does not have a California-style statutory damages law specific to accessibility, but its federal courts, particularly the Southern and Middle Districts, have become some of the most active in the country for website accessibility filings, with volume rising sharply in 2025.',
      'Businesses based in Florida, or serving Florida customers, face rising exposure whether or not they have been sued before; the sharp year-over-year increase means the base rate of risk has grown quickly.',
    ],
    commonIssues: [
      { title: 'Missing form labels', text: 'Checkout, contact and account forms without properly associated labels are a frequently cited, easy-to-document issue.' },
      { title: 'Missing alt text on images', text: 'Product images, banners and icons with no alt text remain one of the most common and easiest-to-cite failures.' },
      { title: 'Inaccessible navigation and menus', text: 'Dropdown and mobile menus that cannot be operated by keyboard are commonly cited alongside form issues.' },
      { title: 'Low contrast text and buttons', text: 'Text and interactive elements below WCAG’s minimum contrast ratio are straightforward for an expert to document.' },
      { title: 'Missing headings and page structure', text: 'Pages with no logical heading structure make navigation difficult for screen reader users and are frequently cited.' },
    ],
    fixNotes: [
      'Fix the highest-volume, easiest-to-document issues first: form labels, alt text, navigation and contrast, since these are what most filings specifically cite.',
      'Given the sharp rise in filings, treat a scan and fix pass as time-sensitive rather than optional, even if you have not received a demand letter yet.',
    ],
    faqs: [
      { q: 'Why have Florida website accessibility lawsuits increased so much?', a: 'Multiple lawsuit trackers reported federal filings roughly doubling year over year in 2025, making Florida one of the highest-filing states in the country alongside New York.' },
      { q: 'Is there a Florida-specific accessibility law like California’s Unruh Act?', a: 'Florida does not have an identical statutory-damages law. Most Florida website accessibility claims are filed under the federal ADA in Florida’s federal courts. Talk to an attorney about any state-law claims that might also apply to your business.' },
      { q: 'Does this apply to my business if I am not based in Florida?', a: 'It can. If your website serves Florida customers, a claim can be filed in Florida’s federal courts regardless of where your business is headquartered.' },
    ],
    related: ['ada-lawsuit-process', 'ada-demand-letter', 'ada-website-compliance-guide'],
  },
];

export const stateLawPath = (s: StateLaw) => `/state-accessibility-laws/${s.slug}`;

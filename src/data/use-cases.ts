/**
 * /use-cases hub and its pages: how real customers use AccessBell. Every
 * number and quote comes from the customer. Never add figures they did not
 * give us, and describe only features that exist in the product.
 */
export type UseCase = {
  slug: string;
  /** Exact H1. */
  h1: string;
  /** Full <title>, 65 characters or fewer. */
  title: string;
  description: string;
  /** Who the customer is, shown as the eyebrow and on cards. */
  customer: string;
  site: string;
  siteUrl: string;
  industry: string;
  icon: string;
  pubDate: Date;
  /** Opening paragraph: contains the page's keyword. */
  lead: string;
  summary: string;
  /** Figures the customer reported. */
  stats: { value: string; label: string }[];
  quote: { text: string; name: string; role: string };
  benefits: { title: string; text: string }[];
  sections: { id: string; h2: string; paras: string[]; bullets?: string[] }[];
  steps: string[];
  faqs: { q: string; a: string }[];
  /** AccessBell features used, with links. */
  features: { href: string; label: string; note: string }[];
  sources: { href: string; label: string }[];
};

export const USE_CASES: UseCase[] = [
  {
    slug: 'directory-accessibility-compliance-monitoring',
    h1: 'How a Directory Used AccessBell To Monitor Accessibility Compliance',
    title: 'How a Directory Monitors Accessibility Compliance With AccessBell',
    description:
      'How directory site ramennearyou.com used AccessBell to monitor accessibility compliance: 300+ issues on 22 pages, checks every 12 hours and fixes with AccessBellFix.',
    customer: 'ramennearyou.com',
    site: 'ramennearyou.com',
    siteUrl: 'https://ramennearyou.com',
    industry: 'Online directory',
    icon: 'search',
    pubDate: new Date('2026-10-01'),
    lead:
      'Ramennearyou.com is an online directory that helps people find ramen near them. Its team used AccessBell to monitor accessibility compliance across the site, fix what automated tests found and work through the checks that need a person, so they could lower their risk of an accessibility lawsuit without hiring a specialist.',
    summary: 'A directory site found 300+ accessibility issues across 22 pages, fixed them with AccessBellFix and now checks the site every 12 hours.',
    stats: [
      { value: '300+', label: 'issues found in the first scan' },
      { value: '22', label: 'pages in that first scan: the home page and blog' },
      { value: '12 hours', label: 'between accessibility checks' },
      { value: '2', label: 'checks a day: one scheduled, one on demand' },
    ],
    quote: {
      text: 'We didn’t really know compliance was such a big deal until we came across it in an article on AccessBell. We saw that the pricing wasn’t too bad, so we decided to give them a try, and man oh man, am I happy with the results. We feel safer knowing our website accessibility compliance is in line.',
      name: 'John',
      role: 'Website owner, ramennearyou.com',
    },
    benefits: [
      {
        title: 'Proactive ADA compliance',
        text: 'The ADA applies to businesses open to the public, and the Department of Justice has said that includes their websites. Monitoring accessibility compliance lets the team find and fix barriers before a visitor, or a demand letter, finds them first.',
      },
      {
        title: 'Time savings',
        text: 'AccessBellFix applies approved fixes such as image alt text and button names without editing the site’s code, so repetitive accessibility work takes minutes instead of hours and the team can focus on growing the directory.',
      },
      {
        title: 'Scale without adding staff',
        text: 'A directory keeps adding listings and articles. AccessBell monitors up to 500 URLs per domain, so new pages are checked as the site grows without hiring anyone to test them.',
      },
    ],
    sections: [
      {
        id: 'challenge',
        h2: 'The Challenge: Accessibility Compliance Was Not on the Radar',
        paras: [
          'Like many small site owners, the team behind ramennearyou.com had not thought much about accessibility compliance. That changed when John read an article on the AccessBell blog about [ADA website lawsuits](/blog/ada-website-accessibility) and how often they target small businesses.',
          'A directory is a typical target. It has many similar pages built from the same templates: listing cards, maps, search filters, images and links. One problem in a shared template, such as a button with no name or an image with no alt text, repeats on every page that uses it.',
          'They compared [pricing](/pricing), found it affordable for a site their size and started the 3-day free trial.',
        ],
      },
      {
        id: 'first-scan',
        h2: 'The First Accessibility Compliance Scan: 300+ Issues on 22 Pages',
        paras: [
          'When the team added their domain, they started with the pages that matter most: the home page and the blog. AccessBell scanned 22 pages and found more than 300 accessibility issues against WCAG.',
          'Each issue in the dashboard shows the failing element, the [WCAG success criterion](/resources/wcag) it relates to, how serious it is and how to fix it. Issues that repeat across pages are grouped by component, so a problem in a shared template only has to be fixed once.',
        ],
      },
      {
        id: 'monitoring',
        h2: 'How They Monitor Accessibility Compliance Every 12 Hours',
        paras: [
          'AccessBell’s [continuous monitoring](/solutions/continuous-monitoring) rescans every monitored page once a day on a schedule. The ramennearyou.com team added a second check each evening with Scan now, so the site is checked about every 12 hours.',
          'Two checks a day means a problem introduced by a new listing, a theme update or a plugin is caught within hours. When a scheduled scan finds a new critical or serious issue, AccessBell emails the account owner.',
        ],
        bullets: [
          'A scheduled scan every morning, run automatically',
          'A manual rescan every evening with Scan now',
          'Email alerts only for new critical and serious issues',
          'Score history to show progress over time',
        ],
      },
      {
        id: 'fixes',
        h2: 'Fixing Automated Issues Quickly With AccessBellFix',
        paras: [
          'Many of the issues on the site were the kind [AccessBellFix](/solutions/automated-fixes) is built for: images without alt text, buttons and links without an accessible name, and the page language. The team typed the correct text once in the dashboard, approved the fix, and AccessBellFix applied it on the live site without anyone editing the site’s templates.',
          'The next scan confirmed each fix and logged it as resolved, so the issue count went down as the team worked through the list.',
        ],
      },
      {
        id: 'manual-review',
        h2: 'Reviewing the Manual Accessibility Checks In-House',
        paras: [
          'Automated testing cannot judge everything. Whether alt text actually describes an image, or whether a page makes sense with a keyboard, needs a person. AccessBell lists these in the Manually Required tab instead of counting them as failures.',
          'The ramennearyou.com team reviewed those items themselves. They marked issues as resolved when they were fixed or did not apply, added notes on what they changed, and tracked it all in AccessBell. Every scan, fix and note is kept in the [Compliance Vault](/solutions/compliance-vault) as a dated record of their work.',
        ],
      },
      {
        id: 'results',
        h2: 'The Results: Accessibility Compliance They Can Keep Up With',
        paras: [
          'The team went from not knowing accessibility compliance was an issue to a routine they can keep up with: two checks a day, fixes applied from the dashboard and a record of everything they have done.',
          'No tool can make a website 100% compliant or guarantee it will never be sued. What AccessBell does is help a team spot accessibility issues, help them fix them and keep a record that shows the work, which is what ramennearyou.com needed.',
        ],
      },
    ],
    steps: [
      'Run a free scan of your home page to see where you stand.',
      'Start the 3-day free trial and add your domain.',
      'Choose the pages to monitor, up to 500 per domain. Start with your home page and your most visited templates.',
      'Install AccessBellFix and fix alt text, button names and the page language from the dashboard.',
      'Work through the Manually Required tab with your team and mark issues as resolved with a note.',
      'Let scheduled monitoring run every day, and use Scan now after each release.',
    ],
    faqs: [
      {
        q: 'Can AccessBell scan a website every 12 hours?',
        a: 'Scheduled monitoring rescans every monitored page once a day. You can run Scan now at any time for an extra check, which is how ramennearyou.com checks its site about every 12 hours.',
      },
      {
        q: 'Does AccessBellFix fix every accessibility issue?',
        a: 'No. AccessBellFix applies fixes you approve for image alt text, accessible names on buttons and links, and the page language. Other issues, such as color contrast or heading structure, need a change in your site’s code or content, and AccessBell shows how to make it.',
      },
      {
        q: 'Is a directory website covered by the ADA?',
        a: 'Businesses open to the public are covered by Title III of the ADA, and the Department of Justice says that includes the accessibility of their websites. This is general information, not legal advice.',
      },
      {
        q: 'How many pages can AccessBell monitor for a directory?',
        a: 'Up to 500 URLs per domain. Directories often have many pages built from the same templates, so monitoring a sample of each template catches most shared problems.',
      },
    ],
    features: [
      { href: '/solutions/continuous-monitoring', label: 'Continuous monitoring', note: 'Scheduled daily scans and email alerts.' },
      { href: '/solutions/automated-fixes', label: 'Automated fixes with AccessBellFix', note: 'Apply approved fixes without editing code.' },
      { href: '/solutions/compliance-vault', label: 'Compliance Vault', note: 'A dated record of every scan, fix and note.' },
      { href: '/solutions/url-monitoring', label: 'URL monitoring', note: 'Monitor up to 500 URLs per domain.' },
    ],
    sources: [
      { href: 'https://www.ada.gov/resources/web-guidance/', label: 'ADA.gov: Guidance on Web Accessibility and the ADA' },
      { href: 'https://www.w3.org/TR/WCAG22/', label: 'W3C: Web Content Accessibility Guidelines (WCAG) 2.2' },
      { href: 'https://www.w3.org/WAI/test-evaluate/', label: 'W3C WAI: Evaluating Web Accessibility Overview' },
    ],
  },
];

export const useCasePath = (u: UseCase) => `/use-cases/${u.slug}`;

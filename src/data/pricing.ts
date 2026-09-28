export type Plan = {
  id: string;
  name: string;
  monthly: number | null;
  blurb: string;
  limits: string[];
  cta: string;
  featured?: boolean;
};

/** Annual billing discount applied to monthly prices. */
export const ANNUAL_DISCOUNT = 0.2;

export const PLANS: Plan[] = [
  {
    id: 'lite',
    name: 'Lite',
    monthly: 69,
    blurb: 'For a single site that needs continuous WCAG coverage.',
    limits: ['1 domain', 'Up to 500 pages', 'Weekly automated scans'],
    cta: 'Start free trial',
  },
  {
    id: 'starter',
    name: 'Starter',
    monthly: 149,
    blurb: 'For growing teams managing several properties.',
    limits: ['3 domains', 'Up to 2,500 pages', 'Daily automated scans'],
    cta: 'Start free trial',
    featured: true,
  },
  {
    id: 'growth',
    name: 'Growth',
    monthly: 299,
    blurb: 'For organizations with larger sites and audit needs.',
    limits: ['10 domains', 'Up to 10,000 pages', 'Daily scans plus on-demand'],
    cta: 'Start free trial',
  },
  {
    id: 'tailored',
    name: 'Tailored',
    monthly: null,
    blurb: 'For enterprises, agencies and high-page-count sites.',
    limits: ['Unlimited domains', 'Custom page volume', 'SSO and API access'],
    cta: "Let's talk",
  },
];

export const ALL_PLANS_INCLUDE = [
  'WCAG 2.2 AA compliance scanning',
  'Automated reports ready for audits',
  'AI-assisted fix suggestions, reviewed by you',
  'Continuous monitoring and alerts',
  'Accessibility statement generator',
  'Page-level issue history',
];

export const TAILORED_INCLUDES = ['Custom crawl rules and schedules', 'Dedicated account manager', 'VPAT and ACR support'];

/** true = included, false = not included, string = included with a note */
type Cell = boolean | string;
export type CompareRow = { feature: string; values: [Cell, Cell, Cell, Cell]; note?: string };
export type CompareGroup = { title: string; rows: CompareRow[] };

export const COMPARE: CompareGroup[] = [
  {
    title: 'Compliance',
    rows: [
      { feature: 'WCAG 2.2 AA coverage', values: [true, true, true, true] },
      { feature: 'Choose WCAG level (A, AA, AAA)', values: [true, true, true, true] },
      { feature: 'Continuous monitoring and alerts', values: [true, true, true, true] },
      { feature: 'Accessibility statement generator', values: [true, true, true, true] },
      { feature: 'Automated manual-testing prompts', values: [false, true, true, true] },
      { feature: 'Domain-wide WCAG compliance overview', values: [true, true, true, true] },
      { feature: 'Audit evidence export', values: [false, true, true, true] },
    ],
  },
  {
    title: 'Scanning and configuration',
    rows: [
      { feature: 'Scheduled scans', values: ['Weekly', 'Daily', 'Daily', 'Custom'] },
      { feature: 'Automatic domain crawl', values: [true, true, true, true] },
      { feature: 'Subdomain coverage', values: [false, true, true, true] },
      { feature: 'Sitemap import', values: [true, true, true, true] },
      { feature: 'Scan behind login', values: [false, false, true, true] },
      { feature: 'Multi-device testing', values: [true, true, true, true] },
      { feature: 'Include and exclude URL rules', values: [false, true, true, true] },
      { feature: 'PDF document scanning', values: [false, false, true, true] },
      { feature: 'REST API access', values: [false, false, false, true] },
    ],
  },
  {
    title: 'Issue detection and debugging',
    rows: [
      { feature: 'Automated issue detection', values: [true, true, true, true] },
      { feature: 'Step-by-step fixing instructions', values: [true, true, true, true] },
      { feature: 'WCAG criteria mapping', values: [true, true, true, true] },
      { feature: 'Element-level code snippets', values: [true, true, true, true] },
      { feature: 'Contrast analyzer', values: [true, true, true, true] },
      { feature: 'AI-assisted fixes', values: [false, true, true, true] },
    ],
  },
  {
    title: 'Dashboard and reporting',
    rows: [
      { feature: 'Multi-domain view', values: [false, true, true, true] },
      { feature: 'Progress tracking over time', values: [true, true, true, true] },
      { feature: 'PDF and CSV exports', values: [true, true, true, true] },
      { feature: 'Scheduled email reports', values: [false, true, true, true] },
      { feature: 'White-label reports', values: [false, false, true, true] },
    ],
  },
  {
    title: 'Team and workflow',
    rows: [
      { feature: 'Team seats', values: ['2', '5', '15', 'Unlimited'] },
      { feature: 'Role-based permissions', values: [false, true, true, true] },
      { feature: 'Jira and GitHub issue export', values: [false, false, true, true] },
      { feature: 'Single sign-on (SSO)', values: [false, false, false, true] },
    ],
  },
  {
    title: 'Support',
    rows: [
      { feature: 'Help center and email support', values: [true, true, true, true] },
      { feature: 'Priority support', values: [false, true, true, true] },
      { feature: 'Onboarding session', values: [false, false, true, true] },
      { feature: 'Dedicated account manager', values: [false, false, false, true] },
    ],
  },
];

/** The single AccessBell offer. Price is per domain, per month. */
export const PLAN = {
  id: 'lite',
  name: 'Pro',
  price: 29,
  currency: 'USD',
  urlsPerDomain: 25,
  blurb: 'Continuous WCAG monitoring and AI-assisted fixes for every domain you run.',
  highlights: ['Up to 25 URLs per domain', 'Unlimited rescans', 'AI-assisted fixes', 'Email support'],
  cta: 'Start 3-day free trial',
  ctaHref: '/app/signup',
} as const;

export type FeatureGroup = { title: string; features: string[] };

/** Everything included in Pro, grouped for the pricing page. */
export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    title: 'Compliance',
    features: [
      'WCAG Full Coverage',
      'Choose WCAG Level (up to 2.2 AAA)',
      'Continuous Monitoring and Alerts',
      'Auto-Updating Accessibility Statements',
      'Assisted Manual Testing Procedures',
      'Domain-Wide WCAG Compliance Overview',
      'Automated Audit Evidence Collection',
    ],
  },
  {
    title: 'Scanning and Configuration',
    features: [
      'Unlimited Rescans',
      'Automatic Domain Crawl',
      'Subdomain Coverage',
      'Sitemap Scanning',
      'Test in Staging Environments',
      'Multi-Device Testing',
      'Custom HTTP Headers',
      'Page Load Delay',
      'Page Scroll Settings',
    ],
  },
  {
    title: 'Issue Detection and Debugging',
    features: [
      'Automatic Issue Detection',
      'Detailed Fixing Instructions',
      'WCAG Criteria Mapping',
      'Failing Elements',
      'Component Grouping',
      'AI-Assisted Fixes',
    ],
  },
  {
    title: 'Dashboard and Reporting',
    features: ['Multi-Domain View', 'Language Support', 'PDF Exports', 'Excel Exports', 'Email Notifications'],
  },
  {
    title: 'Team and Workflow',
    features: ['Role-Based Permissions', 'User Management'],
  },
  {
    title: 'Support',
    features: ['Email Support'],
  },
];

/** The single AccessBell offer, billed monthly or yearly with the same features. Prices are per domain. */
export const PLAN = {
  id: 'lite',
  name: 'Pro',
  price: 29,
  annualPrice: 199,
  annualCtaHref: '/app/signup?plan=annual',
  currency: 'USD',
  urlsPerDomain: 500,
  blurb: 'Continuous WCAG monitoring and AI-assisted fixes for every domain you run.',
  highlights: ['Up to 500 URLs per domain', 'Unlimited rescans', 'AI-assisted fixes', 'Email support'],
  cta: 'Start 3-day free trial',
  ctaHref: '/app/signup',
} as const;

/** One-time reports, sold without a subscription. Prices are per report, not per domain per month. */
export const ONE_TIME = {
  pageReport: {
    id: 'page_report',
    name: 'Page Report',
    price: 19,
    href: '/solutions/page-report',
    blurb: 'Full issue detail, fixes and a PDF for a single page.',
  },
  domainAudit: {
    id: 'domain_audit',
    name: 'Domain Audit',
    price: 79,
    href: '/solutions/domain-audit',
    blurb: 'Full crawl of up to 500 pages, every issue with fixes, a PDF evidence pack, a dated good-faith summary and an accessibility statement.',
  },
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
      'Compliance Vault: Legal Evidence Packages',
      'Proof of Fixes Log and Remediation Notes',
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
      'PDF Accessibility Scanning',
      'PDF Title and Language Remediation',
    ],
  },
  {
    title: 'On-Site Tools',
    features: ['AccessBellFix Approved Fixes', 'PageAssist Visitor Toolbar'],
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

import type { SourceId } from './sources';

/** Help Center categories, in display order. Folder names under src/content/help. */
export const HELP_CATEGORIES = [
  { id: 'getting-started', title: 'Getting Started', icon: 'sparkle', blurb: 'Create your account, start your trial and run your first scan.', sources: ['wai-intro', 'wcag22'] },
  { id: 'domains', title: 'Managing Domains and Pages', icon: 'globe', blurb: 'Add domains, choose the pages you monitor and set how scans run.', sources: ['sitemaps', 'wai-evaluate'] },
  { id: 'scans-and-reports', title: 'Scans, Reports and Monitoring', icon: 'scan', blurb: 'Read your overview, filter reports, export results and set up monitoring.', sources: ['understanding', 'wai-evaluate'] },
  { id: 'fixing-issues', title: 'Fixing Issues', icon: 'wrench', blurb: 'Understand each issue, fix it at the source and plan manual testing.', sources: ['understanding', 'apg'] },
  { id: 'account-and-team', title: 'Account, Team and Security', icon: 'users', blurb: 'Invite teammates, set roles, and manage your sign-in details.', sources: ['wai-arrm', 'accessible-auth'] },
  { id: 'billing', title: 'Billing, Plans and Pricing', icon: 'card', blurb: 'Your plan, free trial, invoices, adding domains and cancelling.', sources: ['stripe-security', 'stripe-privacy'] },
  { id: 'troubleshooting', title: 'Troubleshooting', icon: 'alert', blurb: 'Fix sign-in emails, failed scans and other common problems.', sources: ['axe-rules', 'mdn-status'] },
] as const satisfies readonly { sources: readonly SourceId[] }[];

export type HelpCategoryId = (typeof HELP_CATEGORIES)[number]['id'];

export const HELP_BASE = '/resources/help-center';
/** References shown on the Help Center home page. */
export const HELP_HOME_SOURCES: SourceId[] = ['wai-intro', 'wcag22', 'understanding', 'wai-evaluate'];
export const helpCategory = (id: string) => HELP_CATEGORIES.find((c) => c.id === id);
/** Category folder of an article id such as "domains/add-a-domain". */
export const categoryOf = (articleId: string) => articleId.split('/')[0];

/** Icons for Quick Start Guide articles, by article id. */
export const QUICK_START_ICONS: Record<string, string> = {
  'getting-started/start-your-free-trial': 'card',
  'getting-started/add-your-first-domain': 'globe',
  'getting-started/run-your-first-scan': 'scan',
  'getting-started/navigate-your-dashboard': 'list',
  'fixing-issues/fix-common-errors': 'wrench',
  'domains/manage-multiple-domains': 'layers',
};

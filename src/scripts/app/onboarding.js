// First-run product tours. The dashboard tour runs on a user's first visit;
// the domain tour runs the first time they open a domain report, since a new
// user has no domain to show until they add one. Both can be replayed from
// "Product tour" in the sidebar.
import { api, can } from './core.js';
import { runTour } from './tour.js';

const LOCAL_KEY = 'ab-tours-done';

function localDone() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  } catch {
    return {};
  }
}

// me.onboarding is null until the database stores tour progress; this browser
// remembers it meanwhile so the tour is not shown on every page load.
const isDone = (me, tour) => (me.onboarding ? me.onboarding[tour] : Boolean(localDone()[tour]));

function markDone(me, tour) {
  if (me.onboarding) me.onboarding[tour] = true;
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ ...localDone(), [tour]: true }));
  } catch {}
  api('onboarding', { method: 'POST', body: { tour } }).catch(() => {});
}

const SIDEBAR_OR_MENU = (sel) => [`.app-side ${sel}`, '[data-side-open]'];

function dashboardSteps(me) {
  const admin = can(me, 'admin');
  const hasDomains = me.domainList.domains.length > 0;
  const hasBanner = Boolean(document.querySelector('[data-banner] .banner'));
  return [
    {
      title: 'Welcome to AccessBell',
      body: [
        'This short tour shows you every part of your dashboard: adding a website, reading your accessibility report, fixing issues and working with your team.',
        'It takes about a minute. You can replay it anytime from Product tour in the sidebar.',
      ],
      nextLabel: 'Start the tour',
      skipLabel: 'Not now',
    },
    {
      target: SIDEBAR_OR_MENU('[data-nav-domains]'),
      placement: 'right',
      title: 'Your domains',
      body: 'Every website you monitor is listed in the sidebar, so you can jump straight to its report from any page. On a phone, open the menu to find it.',
    },
    admin && {
      target: '[data-open-add]',
      placement: 'bottom',
      title: 'Add a domain',
      body: [
        'Add a live website or a staging environment. A short setup finds your pages from your sitemap, sets your WCAG standard, and optionally installs AccessBellFix and creates your accessibility statement. Then you choose up to 500 pages to scan and monitor.',
        me.subscribed ? 'Your plan sets how many domains you can add.' : 'To add your first domain, start your 3-day free trial of AccessBell Pro.',
      ],
    },
    hasDomains
      ? {
          target: '.domain-table',
          title: 'Your domains at a glance',
          body: [
            'Each row shows a domain’s score out of 100, its active and resolved issues, and when it was last and will next be scanned. Click the domain name for the full report.',
            'A new domain shows Select pages & Scan until you choose its pages. The ⋮ menu has exports, re-scan, page management, settings and more.',
          ],
        }
      : {
          target: '.empty-state',
          title: 'Your domains will appear here',
          body: 'Once you add a domain, its score, open issues and last scan date show up here in a row you can open for the full report.',
        },
    hasBanner && {
      target: '[data-banner] .banner',
      title: 'Your plan',
      body: 'Important updates about your subscription, such as your free trial end date, appear at the top of the dashboard.',
    },
    {
      target: SIDEBAR_OR_MENU('a[href="/app/team"]'),
      placement: 'right',
      title: 'Invite your team',
      body: 'Bring in developers, QA testers and content editors. Viewers can read reports, Members can also manage pages and run scans, and Admins can also manage domains, settings and the team.',
    },
    {
      target: SIDEBAR_OR_MENU('a[href="/app/billing"]'),
      placement: 'right',
      title: 'Billing',
      body: 'See your plan status and price. The account owner can start the free trial, change the number of domains, update the card, download invoices or cancel.',
    },
    {
      target: SIDEBAR_OR_MENU('a[href="/app/account"]'),
      placement: 'right',
      title: 'Account settings',
      body: 'Rename your team and change your password.',
    },
    {
      target: SIDEBAR_OR_MENU('[data-tour-replay]'),
      placement: 'right',
      title: 'Help whenever you need it',
      body: 'The Help Center has step-by-step guides for every feature, Support reaches our team, and Product tour replays this walkthrough.',
    },
    {
      title: 'You’re ready to go',
      body:
        admin && !hasDomains
          ? ['Start by adding your first domain. When its first scan finishes, open it and we’ll show you around the report: scores, issues with code fixes, manual checks, pages and settings.']
          : ['Open any domain to see its full report. The first time you do, we’ll show you around it: scores, issues with code fixes, manual checks, pages and settings.'],
      nextLabel: admin && !hasDomains ? 'Add your first domain' : 'Finish',
      after: admin && !hasDomains ? 'add' : null,
    },
  ].filter(Boolean);
}

function domainSteps(me, { selectTab }) {
  const onTab = (name) => () => selectTab(name);
  const overview = onTab('overview');
  return [
    {
      title: 'Your domain report',
      body: [
        'This is where you find and fix accessibility issues on one website. Here’s a quick look at each part of the report.',
      ],
      before: overview,
      nextLabel: 'Show me around',
      skipLabel: 'Not now',
    },
    {
      target: ['[data-rescan-all]', '[data-last-scan]', '.top-actions'],
      before: overview,
      title: 'Scans and monitoring',
      body: [
        'Every monitored page is rescanned automatically each day, and you can see when the last scan ran.',
        'Use Scan now to test every monitored page again right away, for example after you ship a fix.',
      ],
    },
    {
      target: '[data-export]',
      before: overview,
      title: 'Export and share',
      body: 'Download every issue as a CSV file for Excel, Jira or your tracker, or print the full report with its fixes and save it as a PDF for audits and stakeholders.',
    },
    {
      target: '[data-domain-menu]',
      before: overview,
      title: 'More actions',
      body: 'The ⋮ menu has exports, re-scan, Manage domain pages (find pages and choose which to scan), Add subdomain and Remove domain.',
    },
    {
      target: '[data-manage]',
      before: overview,
      title: 'Manage',
      body: 'Monitored URLs (add any URL on this domain, up to 500), PDF documents, and domain settings: WCAG version and level, devices, URL rules, custom headers, AccessBellFix, the PageAssist toolbar and your accessibility statement.',
    },
    {
      target: '[role="tablist"]',
      before: overview,
      title: 'Four views of your domain',
      body: 'Overview, Issues, Manually Required and Compliance Vault. Next, we’ll step through each one.',
    },
    {
      target: 'section[aria-labelledby="lso-title"]',
      before: overview,
      title: 'Last scan overview',
      body: 'Your score out of 100, whether automated tests found WCAG failures, active and resolved issues, pages scanned and when the next scheduled scan runs. Select Automated tests or Manually required to jump to them.',
    },
    {
      target: 'section[aria-labelledby="hist-title"]',
      before: overview,
      title: 'Scan history',
      body: 'See how your results change over the last 7, 30 or 90 days, so you can track progress and spot regressions after a release.',
    },
    {
      target: '.coverage-head',
      before: overview,
      title: 'Test coverage by WCAG principle',
      body: 'Every success criterion in your target standard, grouped as Perceivable, Operable, Understandable and Robust, showing whether automated checks found issues or passed it, and what still needs a manual test. Tick “Only criteria with issues” to focus.',
    },
    {
      target: 'section[aria-labelledby="risk-title"]',
      before: overview,
      title: 'Lawsuit risk score',
      body: 'An estimate based on your accessibility score: the more barriers automated tools can find, the higher the risk. It is a guide for prioritizing, not legal advice.',
    },
    {
      target: 'section[aria-labelledby="components-title"]',
      before: overview,
      title: 'Component grouping',
      body: 'When the same failing element appears on many pages, such as a header or footer, it is grouped here. Fix the shared component once and every page improves.',
    },
    {
      target: '#tab-issues',
      before: onTab('issues'),
      title: 'Issues',
      body: [
        'Every failing rule, sorted by severity. View them by issue or by page, and filter for critical, serious, moderate or minor.',
        'Open an issue to see what is wrong, the exact failing HTML on each page, step-by-step fix instructions and a code example you can copy. Mark it as resolved when it is fixed or does not apply.',
      ],
    },
    {
      target: '#tab-review',
      before: onTab('review'),
      title: 'Manually required',
      body: 'Some checks need human judgment, such as whether alt text actually describes the image. Automated testing flags them here for a person to review. They are not counted as failures.',
    },
    {
      target: '#tab-vault',
      before: onTab('vault'),
      title: 'Compliance Vault',
      body: 'Your audit-ready history: scan snapshots, the fix log with notes, issues your team marked as resolved, your accessibility statement and evidence packages to download.',
    },
    {
      title: 'That’s the whole tour',
      body: [
        'Start with the Issues tab and work from critical down. Scan now again after you fix something to confirm it passes.',
        can(me, 'admin') ? 'Invite your team from Team in the sidebar, and replay this tour anytime from Product tour.' : 'You can replay this tour anytime from Product tour in the sidebar.',
      ],
      before: overview,
    },
  ];
}

async function start(me, tour, steps, deps) {
  if (document.querySelector('dialog.ob-tour')) return;
  const result = await runTour(steps);
  markDone(me, tour);
  if (result === 'finished' && steps[steps.length - 1].after === 'add') deps.openAdd?.();
}

/**
 * Wire up a page's tour: start it automatically if the user hasn't seen it,
 * or if they came here from "Product tour" on another page, and replay it in
 * place when "Product tour" is pressed.
 */
export function setupTour(me, tour, deps = {}) {
  const build = () => (tour === 'dashboard' ? dashboardSteps(me) : domainSteps(me, deps));
  const run = () => start(me, tour, build(), deps);

  document.querySelectorAll('[data-tour-replay]').forEach((link) =>
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (document.querySelector('[data-shell]')?.classList.contains('is-open')) document.querySelector('[data-side-backdrop]')?.click();
      run();
    }),
  );

  const params = new URLSearchParams(location.search);
  const requested = params.get('tour') === tour;
  if (requested) {
    params.delete('tour');
    const rest = params.toString();
    history.replaceState(null, '', `${location.pathname}${rest ? `?${rest}` : ''}${location.hash}`);
  }
  const busyElsewhere = document.querySelector('dialog[open]');
  if (requested || (!isDone(me, tour) && !busyElsewhere)) run();
}

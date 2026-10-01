/**
 * /comparisons/<competitor>-vs-accessbell pages. Competitor facts come only
 * from the linked sources (vendor pages, software directories and press
 * releases), checked October 2026. Where a vendor does not publish something,
 * the page says so instead of guessing. Update `checked` when you re-verify.
 */
/** A table cell: true = yes, false = no, or a short text answer. */
export type Cell = boolean | string;
export type RowKey =
  | 'price' | 'free' | 'selfServe' | 'flatPrice'
  | 'crawl' | 'monitoring' | 'urls' | 'engine' | 'standards' | 'alerts' | 'pdf'
  | 'codeFix' | 'approvedFix' | 'overlay' | 'manual' | 'expert' | 'suite'
  | 'evidence' | 'fixLog' | 'statement' | 'regulatory';

export type Comparison = {
  slug: string;
  /** Competitor display name, used as "<name> vs. AccessBell" */
  name: string;
  /** Short kind of product, e.g. "Overlay widget" */
  kind: string;
  /** One-line summary for cards */
  summary: string;
  description: string;
  /** "The short version" box */
  short: string;
  intro: string[];
  /** Competitor answers. Rows the competitor has no sourced answer for are left out. */
  cells: Partial<Record<RowKey, Cell>>;
  differences: { h: string; text: string }[];
  /** Longer, sourced background sections. Text may contain [label](url) links. */
  background?: { h: string; paras: string[] }[];
  chooseThem: string[];
  chooseUs: string[];
  faqs: { q: string; a: string }[];
  sources: { label: string; href: string }[];
  related: string[];
  checked: string;
  /** Groups similar tools so each page links to its closest alternatives first. */
  category: 'overlay' | 'enterprise' | 'testing';
};

/** The comparison table: groups, row labels and AccessBell's own answers. */
export const ROWS: { group: string; rows: { key: RowKey; label: string; us: Cell }[] }[] = [
  {
    group: 'Pricing and access',
    rows: [
      { key: 'price', label: 'Published price', us: '$29 per domain per month, or $199 per year' },
      { key: 'free', label: 'Free option', us: 'Free one-page scan, no account, and a 3-day free trial' },
      { key: 'selfServe', label: 'Sign up online, no sales call', us: true },
      { key: 'flatPrice', label: 'Price does not rise with traffic', us: true },
    ],
  },
  {
    group: 'Testing and monitoring',
    rows: [
      { key: 'crawl', label: 'Finds pages from your sitemap and links', us: true },
      { key: 'monitoring', label: 'Scheduled rescans', us: 'Every monitored URL, daily' },
      { key: 'urls', label: 'Pages monitored', us: 'Up to 500 URLs per domain' },
      { key: 'engine', label: 'Testing engine', us: 'axe-core in a real Chrome browser' },
      { key: 'standards', label: 'Standards', us: 'WCAG 2.0 to 2.2, ADA, Section 508, EN 301 549' },
      { key: 'alerts', label: 'Email alerts for new serious issues', us: true },
      { key: 'pdf', label: 'PDF accessibility checks', us: true },
      { key: 'suite', label: 'SEO, analytics or content-quality modules', us: false },
    ],
  },
  {
    group: 'Fixing issues',
    rows: [
      { key: 'codeFix', label: 'Failing code and a corrected example for each issue', us: true },
      { key: 'approvedFix', label: 'Apply fixes without a code deploy', us: 'Fixes you approve, with AccessBellFix' },
      { key: 'overlay', label: 'Relies on an overlay widget', us: 'No' },
      { key: 'manual', label: 'Manual testing guidance', us: 'Step-by-step procedures' },
      { key: 'expert', label: 'Expert audits by specialists', us: false },
    ],
  },
  {
    group: 'Compliance and evidence',
    rows: [
      { key: 'evidence', label: 'Exportable evidence package for legal claims', us: true },
      { key: 'fixLog', label: 'Dated log of confirmed fixes', us: true },
      { key: 'statement', label: 'Accessibility statement', us: true },
      { key: 'regulatory', label: 'Legal or regulatory action over compliance claims', us: 'None' },
    ],
  },
];

const OVERLAY_FACT_SHEET = { label: 'Overlay Fact Sheet', href: 'https://overlayfactsheet.com/en/' };

export const COMPARISONS: Comparison[] = [
  {
    slug: 'audioeye-vs-accessbell',
    category: 'overlay',
    name: 'AudioEye',
    kind: 'Automated fixes plus managed services',
    summary: 'AudioEye pairs a script that applies automatic fixes with paid expert services. AccessBell finds issues in your code, shows the fix and documents your work for a flat price.',
    description: 'AudioEye vs AccessBell: compare automatic fixes and managed services with code-level fixes, daily monitoring of 500 URLs and a flat $29 per domain price.',
    intro: [
      'AudioEye and AccessBell both scan websites for accessibility issues, but they take different routes to fixing them. AudioEye installs a script on your site that detects issues and applies automatic fixes in the visitor’s browser, and it sells higher tiers with expert testing and remediation. AccessBell tests every page in a real Chrome browser, shows the failing code with a corrected example so it can be fixed at the source, and keeps a dated record of every scan and fix.',
    ],
    short: 'Both scan for accessibility issues. AudioEye fixes in the visitor’s browser with a script and sells managed services on top. AccessBell shows the exact code fix, monitors 500 URLs per domain daily and keeps legal-grade evidence, for one published price.',
    cells: {
      price: 'Several tiers; entry plans listed from about $49/month (Capterra)',
      free: 'Free website scan',
      monitoring: 'Ongoing detection through an installed script',
      approvedFix: 'Automatic fixes applied by its script',
      overlay: 'Listed on the Overlay Fact Sheet',
      expert: 'On managed tiers',
    },
    differences: [
      { h: 'Fixing in the browser vs fixing the code', text: 'Automatic fixes that run in the visitor’s browser, as with [accessiBe](/comparisons/accessibe-vs-accessbell) and [UserWay](/comparisons/userway-vs-accessbell), can change some attributes, but they cannot rebuild missing structure, keyboard support or form logic, and they do not change the code other tools see. AccessBell shows the failing element and a corrected version so your team fixes it once at the source. AccessBellFix exists for quick, specific fixes you approve, such as alt text, but it is not presented as making a site compliant.' },
      { h: 'Predictable pricing', text: 'AccessBell is one plan with every feature for $29 per domain per month. AudioEye sells several tiers, and the ones that include expert testing cost considerably more, so confirm the current price for the level of service you need.' },
      { h: 'Who does the work', text: 'If you want a vendor to carry out audits and remediation for you, AudioEye’s managed tiers are built for that. AccessBell is built for teams who fix their own sites and want the issues, code fixes, monitoring and evidence in one place.' },
    ],
    chooseThem: ['You want a vendor to manage audits and remediation for you.', 'You are comfortable with fixes applied by a script in the browser.'],
    chooseUs: ['You want issues fixed in your own code, with the exact fix shown.', 'You want daily monitoring of up to 500 URLs and a dated evidence trail for a flat price.', 'You want to avoid relying on an overlay.'],
    faqs: [
      { q: 'Is AudioEye an overlay?', a: 'AudioEye applies automatic fixes through a script that runs on your site, and accessibility professionals list it on the Overlay Fact Sheet. It also sells human testing and remediation services.' },
      { q: 'How much does AudioEye cost compared with AccessBell?', a: 'AccessBell is $29 per domain per month or $199 per year. AudioEye sells several tiers; directories such as Capterra list entry plans from about $49 per month, and managed tiers cost more. Check AudioEye for current prices.' },
      { q: 'Can I switch from AudioEye to AccessBell?', a: 'Yes. Run a free AccessBell scan on a few pages to see what your code still fails with the AudioEye script removed, then start a 3-day free trial to monitor the whole domain.' },
    ],
    sources: [
      { label: 'Capterra: AudioEye pricing and reviews', href: 'https://www.capterra.com/p/214283/Audioeye/' },
      OVERLAY_FACT_SHEET,
    ],
    related: ['best-ada-compliance-software-for-small-businesses', '5-accessibe-alternatives'],
    checked: '2026-10-01',
  },
  {
    slug: 'aaardvark-vs-accessbell',
    category: 'testing',
    name: 'AAArdvark',
    kind: 'Accessibility testing and audit management',
    summary: 'AAArdvark is a testing tool with automated and manual testing and multi-site plans. AccessBell monitors 500 URLs per domain daily and adds code fixes and legal evidence.',
    description: 'AAArdvark vs AccessBell: compare page-based testing plans with 500 URLs per domain, code fixes, PDF checks and a Compliance Vault for $29 per domain.',
    intro: [
      'AAArdvark and AccessBell are both testing tools rather than overlays: they find accessibility issues so your team can fix them. AAArdvark focuses on testing and audit management, with automated and manual testing, a visual mode that shows issues on the page, and plans that cover several sites. AccessBell focuses on monitoring and proof: 500 URLs per domain rescanned daily, a corrected code example for each issue, PDF checks and a Compliance Vault for evidence.',
    ],
    short: 'Neither is an overlay: both find issues so you can fix them. AAArdvark leans into manual auditing and multi-site plans. AccessBell gives one site 500 URLs of daily monitoring, a code fix for every issue, PDF checks and a legal evidence package for less per month.',
    cells: {
      price: '$49/month for 1 site and 100 pages; up to $499/month for 50 sites',
      free: 'Free plan: 1 site, 1 page',
      selfServe: true,
      urls: '100 to 10,000 pages, by plan',
      standards: 'WCAG 2.1 and 2.2',
      codeFix: 'Remediation guidance',
      overlay: 'No',
      manual: 'Manual testing tools and visual mode',
      fixLog: 'Issue tracking with comments',
    },
    differences: [
      { h: 'Price per page', text: 'For one website, AccessBell includes 500 URLs for $29 a month, while AAArdvark’s one-site plan is $49 a month for 100 pages. AAArdvark’s larger plans spread pages across several sites, which can suit agencies with many small sites.' },
      { h: 'Monitoring and evidence', text: 'AccessBell rescans every monitored URL daily, emails owners and admins about new serious issues, and records each scan and confirmed fix in the Compliance Vault, which exports a verifiable evidence package.' },
      { h: 'Manual auditing workflow', text: 'AAArdvark puts more emphasis on manual auditing, though not on the expert services that [Level Access](/comparisons/level-access-vs-accessbell) sells, with tools to log, comment on and track issues found by hand. AccessBell gives step-by-step manual test procedures and lets you record remediation notes, but its core is automated monitoring.' },
    ],
    chooseThem: ['You run detailed manual audits and want to log and discuss findings as a team.', 'You manage many small sites and want pages shared across sites in one plan.'],
    chooseUs: ['You want 500 URLs on one domain monitored daily for $29 a month.', 'You want a corrected code example for every issue and optional approved fixes.', 'You want PDF checks and a legal evidence package.'],
    faqs: [
      { q: 'Is AAArdvark an overlay?', a: 'No. Like AccessBell, it is a testing tool that helps you find and fix issues in your site rather than a widget that changes the page in the browser.' },
      { q: 'How does AAArdvark pricing compare with AccessBell?', a: 'AAArdvark lists plans from $49 a month for one site and 100 pages, up to $499 a month for 50 sites. AccessBell is $29 per domain per month, or $199 a year, for up to 500 URLs on each domain.' },
      { q: 'Can I use both?', a: 'Yes. Some teams run detailed manual audits in one tool and use AccessBell for daily monitoring and evidence.' },
    ],
    sources: [
      { label: 'AAArdvark: pricing', href: 'https://aaardvarkaccessibility.com/pricing/' },
      { label: 'G2: AAArdvark reviews', href: 'https://www.g2.com/products/aaardvark/reviews' },
    ],
    related: ['best-website-accessibility-testing-software', 'automated-vs-manual-accessibility-testing'],
    checked: '2026-10-01',
  },
  {
    slug: 'accessibe-vs-accessbell',
    category: 'overlay',
    name: 'accessiBe',
    kind: 'Overlay widget',
    summary: 'accessiBe’s accessWidget changes your page in the visitor’s browser and is priced by traffic. AccessBell finds issues in your code and documents every fix for a flat price.',
    description: 'accessiBe vs AccessBell: an AI overlay priced by traffic, and fined $1 million by the FTC, vs code-level fixes, daily monitoring and evidence for $29 per domain.',
    intro: [
      'accessiBe is best known for accessWidget, an AI-powered overlay that adjusts your page in the visitor’s browser and adds a toolbar. AccessBell takes the opposite approach: it tests your pages, shows the failing code with a corrected example so it can be fixed at the source, and keeps dated evidence of your work.',
    ],
    short: 'accessiBe sells an AI overlay priced by traffic, and was ordered by the FTC to pay $1 million over its compliance claims. AccessBell is not an overlay: it shows the code to fix, monitors 500 URLs per domain daily and documents every fix, for $29 per domain.',
    cells: {
      price: 'From $490/year for up to 5,000 monthly visits',
      free: 'Free scan',
      flatPrice: false,
      approvedFix: 'AI changes applied in the browser',
      overlay: 'Yes, accessWidget',
      regulatory: 'FTC order to pay $1 million (2025)',
    },
    differences: [
      { h: 'An overlay vs fixing the code', text: 'A widget runs on top of your page and cannot rebuild missing labels, headings or keyboard support in the code. AccessBell shows exactly what to change in your code, then confirms the fix on the next scan.' },
      { h: 'The FTC order', text: 'In 2025 the FTC finalized an order requiring accessiBe to pay $1 million over claims that its product could make any website WCAG compliant. AccessBell does not claim any tool can make a site compliant on its own.' },
      { h: 'Price that does not grow with traffic', text: 'accessiBe’s widget price rises with monthly visits. AccessBell is $29 per domain per month whatever your traffic.' },
    ],
    background: [
      {
        h: 'What the FTC Found',
        paras: [
          'In January 2025 the [FTC announced a $1 million settlement](https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million) with accessiBe. Its complaint said accessiBe marketed accessWidget as able to make websites comply with WCAG 2.1 AA automatically, when the widget failed to make basic components such as menus, form fields and image descriptions accessible. The FTC also found that accessiBe published paid endorsements formatted to look like independent reviews. The order became final in April 2025.',
          'The [Overlay Fact Sheet](https://overlayfactsheet.com/en/), signed by more than 1,000 accessibility professionals, names accessiBe among overlay vendors whose products it says can interfere with screen readers and keyboard use rather than fixing the underlying problems.',
        ],
      },
      {
        h: 'Why an Overlay Cannot Fix Your Code',
        paras: [
          'An overlay runs after your HTML has reached the browser. It cannot give a page real headings, add a label that is missing from the markup, or make a custom dropdown keyboard-operable if it was never built that way. When you remove the widget, your site is exactly as accessible as before. That is why many lawsuit settlements require the defendant to fix the code, and why AccessBell shows you the code to change.',
        ],
      },
    ],
    chooseThem: ['You want a visitor toolbar and accept the limits of an overlay.'],
    chooseUs: ['You want issues fixed in your code, with the fix shown.', 'You want a price that does not rise with traffic.', 'You want dated evidence of testing and fixes.'],
    faqs: [
      { q: 'Does accessiBe make a website ADA compliant?', a: 'No tool can on its own. The FTC ordered accessiBe to pay $1 million in 2025 over claims that its widget could make any website WCAG compliant, and sites using overlays have continued to be sued.' },
      { q: 'How much does accessiBe cost compared with AccessBell?', a: 'accessiBe’s accessWidget starts at $490 a year for up to 5,000 monthly visits and rises with traffic. AccessBell is $29 per domain per month or $199 per year.' },
      { q: 'How do I switch from accessiBe to AccessBell?', a: 'Run a free AccessBell scan with the widget removed to see what your code still fails, fix the critical issues first, then monitor the whole domain with a 3-day free trial.' },
    ],
    sources: [
      { label: 'accessiBe: accessWidget pricing', href: 'https://accessibe.com/pricing/accesswidget' },
      { label: 'FTC: final order requiring accessiBe to pay $1 million', href: 'https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million' },
      OVERLAY_FACT_SHEET,
    ],
    related: ['5-accessibe-alternatives', 'ada-website-accessibility'],
    checked: '2026-10-01',
  },
  {
    slug: 'userway-vs-accessbell',
    category: 'overlay',
    name: 'UserWay',
    kind: 'Overlay widget',
    summary: 'UserWay is an AI widget, part of Level Access since 2024, with monitoring of a limited number of pages. AccessBell monitors 500 URLs per domain and fixes issues at the source.',
    description: 'UserWay vs AccessBell: an AI accessibility widget with limited page monitoring vs 500 URLs per domain, code-level fixes and legal evidence for $29 per domain.',
    intro: [
      'UserWay sells an AI-powered accessibility widget that adjusts pages in the visitor’s browser, with a free version and paid plans that add monitoring of a set number of pages and an accessibility statement. [Level Access](/comparisons/level-access-vs-accessbell) completed its acquisition of UserWay in March 2024, and UserWay continues as its own brand. AccessBell is not a widget: it tests your pages, shows the code fix and records your work.',
    ],
    short: 'UserWay is an AI widget that changes pages in the browser, with monitoring of a limited number of pages on paid plans. AccessBell fixes issues at the source, monitors up to 500 URLs per domain daily and keeps dated evidence.',
    cells: {
      price: 'Reported from about $490/year; Capterra lists plans from $69/month',
      free: 'Free widget',
      urls: '10 to 100 pages, by plan (Capterra)',
      alerts: 'On paid plans',
      approvedFix: 'AI changes applied in the browser',
      overlay: 'Yes, listed on the Overlay Fact Sheet',
      statement: 'On paid plans',
      regulatory: 'Customer class action over compliance claims (2024, pending)',
    },
    differences: [
      { h: 'Pages monitored', text: 'UserWay’s paid plans, as listed on Capterra, monitor 10 to 100 pages. AccessBell monitors up to 500 URLs per domain every day.' },
      { h: 'Widget vs code', text: 'A widget changes what the visitor’s browser shows but leaves your code as it was. AccessBell shows the failing code and a corrected example, so the fix holds for every visitor and every tool.' },
      { h: 'Evidence', text: 'AccessBell’s Compliance Vault records every scan and confirmed fix and exports an evidence package you can share with a lawyer or auditor.' },
    ],
    background: [
      {
        h: 'UserWay’s Pricing and Legal Support Program',
        paras: [
          'UserWay offers a free widget and paid plans. Reported pricing starts around $490 a year for Widget Pro, with AI-driven remediations and a “Legal Support Program” described as including a $1 million pledge ([PricingSaaS](https://pricingsaas.com/companies/userway)). Capterra lists monthly plans from $69 with 10 to 100 monitored pages ([Capterra](https://www.capterra.com/p/218549/UserWay/pricing/)). Confirm current terms with UserWay.',
        ],
      },
      {
        h: 'The Bloomsybox Lawsuit',
        paras: [
          'In July 2024, [Bloomsybox.com LLC filed a class action against UserWay](https://www.courtlistener.com/opinion/10594298/bloomsyboxcom-llc-v-userway-inc/). According to reporting on the case, Bloomsybox bought UserWay’s widget as a solution for ADA and WCAG 2.1 compliance with up to $1 million in legal support, was sued for accessibility about six months later, and alleges the support it received did not match what was promised. A magistrate judge recommended that the central claims proceed, rejecting UserWay’s motion to dismiss ([Law Office of Lainey Feingold](https://www.lflegal.com/2025/02/userway-overlay-lawsuit/)). The case is a claim, not a finding.',
        ],
      },
    ],
    chooseThem: ['You only want a free visitor toolbar.'],
    chooseUs: ['You want 500 URLs per domain monitored daily.', 'You want issues fixed in your code.', 'You want a dated evidence trail.'],
    faqs: [
      { q: 'Is UserWay an overlay?', a: 'Yes. Its main product is an AI widget that changes pages in the visitor’s browser, and accessibility professionals list it on the Overlay Fact Sheet.' },
      { q: 'Who owns UserWay?', a: 'Level Access completed its acquisition of UserWay in March 2024. UserWay continues to operate as its own brand.' },
      { q: 'How does UserWay pricing compare with AccessBell?', a: 'UserWay has a free widget, and Capterra lists paid plans from $69 a month with 10 to 100 monitored pages. AccessBell is $29 per domain per month for up to 500 URLs.' },
    ],
    sources: [
      { label: 'Capterra: UserWay pricing', href: 'https://www.capterra.com/p/218549/UserWay/pricing/' },
      { label: 'Level Access: acquisition of UserWay completed', href: 'https://www.levelaccess.com/blog/level-access-completes-acquisition-of-userway/' },
      OVERLAY_FACT_SHEET,
    ],
    related: ['5-accessibe-alternatives', 'best-ada-compliance-software-for-small-businesses'],
    checked: '2026-10-01',
  },
  {
    slug: 'siteimprove-vs-accessbell',
    category: 'enterprise',
    name: 'Siteimprove',
    kind: 'Enterprise digital governance suite',
    summary: 'Siteimprove bundles accessibility with SEO, analytics and content tools for large organizations, by quote. AccessBell focuses on accessibility for a flat $29 per domain.',
    description: 'Siteimprove vs AccessBell: an enterprise suite priced by quote vs focused accessibility monitoring of 500 URLs per domain, code fixes and evidence for $29.',
    intro: [
      'Siteimprove is an enterprise platform that combines accessibility testing with SEO, analytics, content quality and policy tools, sold by quote and priced by module and site size. AccessBell does one job, website accessibility, and publishes one price: $29 per domain per month with every feature included.',
    ],
    short: 'Siteimprove is a broad enterprise suite sold by quote. AccessBell is focused accessibility software with a published price: 500 URLs per domain monitored daily, a code fix for every issue and a legal evidence package.',
    cells: {
      price: 'Not published; by quote, per module and site size',
      free: 'Demo on request',
      selfServe: false,
      crawl: true,
      engine: 'Siteimprove’s own engine (Alfa)',
      overlay: 'No',
      suite: true,
    },
    differences: [
      { h: 'Scope', text: 'Like [Acquia Web Governance](/comparisons/acquia-vs-accessbell), Siteimprove suits large organizations that want one vendor for accessibility, SEO, analytics and governance across many sites and editors. AccessBell suits teams who need accessibility done well without buying a suite.' },
      { h: 'Price and buying process', text: 'Siteimprove does not publish prices and sells through sales conversations. AccessBell is self-serve: run a free scan, start a 3-day trial, and pay $29 per domain per month.' },
      { h: 'Evidence for legal claims', text: 'AccessBell’s Compliance Vault is built around proving your work: dated scans, a fix log, remediation notes and an evidence package with a verifiable fingerprint.' },
    ],
    background: [
      {
        h: 'What Siteimprove Costs',
        paras: [
          'Siteimprove does not publish pricing; directories such as G2 and Capterra list it as contact vendor. Independent analyses put small accessibility-only contracts around $11,000 a year for about 1,000 pages, mid-market bundles at roughly $8,000 to $20,000, and full-platform enterprise contracts at $30,000 to $80,000 or more ([independent pricing analysis](https://ratedwithai.com/blog/siteimprove-pricing-2026), [WebYes](https://www.webyes.com/blogs/siteimprove-pricing/)). Pricing scales with page count, modules and contract length, and is agreed through sales.',
        ],
      },
    ],
    chooseThem: ['You need SEO, analytics and content governance in the same platform.', 'You run many sites with large editorial teams and an enterprise budget.'],
    chooseUs: ['You want accessibility monitoring without an enterprise contract.', 'You want a published, flat price per domain.', 'You want legal evidence built in.'],
    faqs: [
      { q: 'How much does Siteimprove cost?', a: 'Siteimprove does not publish prices. It quotes by module and site size, and third-party estimates put contracts in the tens of thousands of dollars a year. AccessBell is $29 per domain per month.' },
      { q: 'Is AccessBell a Siteimprove alternative?', a: 'For accessibility, yes. AccessBell does not include SEO, analytics or content governance, so teams that rely on those modules may keep Siteimprove for them.' },
      { q: 'Do they use the same testing engine?', a: 'No. AccessBell runs the open-source axe-core engine in a real Chrome browser. Siteimprove uses its own engine, so results can differ slightly.' },
    ],
    sources: [
      { label: 'WebYes: Siteimprove pricing in 2026 (third-party estimate)', href: 'https://www.webyes.com/blogs/siteimprove-pricing/' },
      { label: 'Deque: axe-core on GitHub', href: 'https://github.com/dequelabs/axe-core' },
    ],
    related: ['best-website-accessibility-testing-software', 'digital-accessibility-platforms'],
    checked: '2026-10-01',
  },
  {
    slug: 'level-access-vs-accessbell',
    category: 'enterprise',
    name: 'Level Access',
    kind: 'Enterprise platform with expert services',
    summary: 'Level Access combines an enterprise platform with expert audits and managed services, by quote. AccessBell is self-serve monitoring, code fixes and evidence for $29 per domain.',
    description: 'Level Access vs AccessBell: an enterprise platform with expert audits by quote vs self-serve monitoring of 500 URLs per domain, code fixes and evidence for $29.',
    intro: [
      'Level Access is one of the largest accessibility companies. It combines the Level Access Platform with expert audits, testing and managed services, merged with eSSENTIAL Accessibility and acquired [UserWay](/comparisons/userway-vs-accessbell) in 2024. It sells mainly to large organizations by quote. AccessBell is a self-serve platform for teams who fix their own sites: daily monitoring, code-level fixes and a legal evidence trail for a flat price.',
    ],
    short: 'Level Access is an enterprise platform with a large team of experts, sold by quote. AccessBell is self-serve software for teams who fix their own sites: daily monitoring, code fixes and an evidence trail for $29 per domain.',
    cells: {
      price: 'Not published; custom quote',
      free: 'Demo on request',
      selfServe: false,
      monitoring: 'Automated monitoring in the platform',
      overlay: 'Owns UserWay, an overlay sold separately',
      manual: 'Manual testing by specialists',
      expert: true,
    },
    differences: [
      { h: 'Services vs self-serve', text: 'Level Access’s strength is its people: specialists who audit with assistive technology and help run an accessibility program. AccessBell gives your own team the tools, without a services contract.' },
      { h: 'Price', text: 'Level Access quotes each customer. AccessBell publishes one price of $29 per domain per month and lets you start a trial online.' },
      { h: 'Using both', text: 'Many organizations buy a third-party expert audit once, then use AccessBell to monitor every day and record fixes between audits.' },
    ],
    chooseThem: ['You need expert manual audits or a third-party conformance report.', 'You want a managed accessibility program across many products.'],
    chooseUs: ['You want daily monitoring and code fixes without a services contract.', 'You want a published price and a self-serve trial.', 'You want evidence of every scan and fix between audits.'],
    faqs: [
      { q: 'Does AccessBell offer expert audits like Level Access?', a: 'No. AccessBell runs automated scans, gives manual test procedures and records your work. If you need a third-party audit by specialists, Level Access is one of the providers that offer it.' },
      { q: 'How much does Level Access cost?', a: 'Level Access does not publish prices; it quotes each customer. AccessBell is $29 per domain per month or $199 per year.' },
      { q: 'Is UserWay part of Level Access?', a: 'Yes. Level Access completed its acquisition of UserWay in March 2024, and UserWay operates as its own brand.' },
    ],
    sources: [
      { label: 'Level Access: platform and services', href: 'https://www.levelaccess.com/platform-services-overview/' },
      { label: 'Level Access: auditing and testing', href: 'https://www.levelaccess.com/auditing-and-testing/' },
      { label: 'Level Access: acquisition of UserWay completed', href: 'https://www.levelaccess.com/blog/level-access-completes-acquisition-of-userway/' },
    ],
    related: ['digital-accessibility-platforms', 'automated-vs-manual-accessibility-testing'],
    checked: '2026-10-01',
  },
  {
    slug: 'acquia-vs-accessbell',
    category: 'enterprise',
    name: 'Acquia',
    kind: 'Web governance suite (formerly Monsido and Acquia Optimize)',
    summary: 'Acquia Web Governance, formerly Monsido and Acquia Optimize, scans for accessibility, SEO, quality and policy issues by annual quote. AccessBell focuses on accessibility for $29 per domain.',
    description: 'Acquia vs AccessBell: Acquia Web Governance (formerly Monsido) by annual quote vs focused accessibility monitoring, code fixes and evidence for $29 per domain.',
    intro: [
      'Acquia Web Governance is Acquia’s website governance product. It began as Monsido, which Acquia acquired in 2024 and renamed Acquia Optimize, and was renamed Acquia Web Governance in 2025. It scans for accessibility issues alongside broken links, spelling, SEO, privacy and custom policies, with a PDF accessibility add-on. AccessBell does accessibility only, with daily monitoring, code-level fixes, PDF checks and a Compliance Vault, for a published price.',
    ],
    short: 'Acquia Web Governance, formerly Monsido, checks accessibility alongside SEO, quality and policies, sold by annual quote. AccessBell focuses on accessibility, with code fixes, PDF checks and a Compliance Vault for a published price.',
    cells: {
      price: 'Not published; annual subscription by pages and complexity',
      free: 'Free scan request',
      selfServe: 'Contact Acquia for pricing',
      crawl: true,
      pdf: 'Add-on, with paid remediation through a partner',
      approvedFix: 'Fix tools within the platform',
      suite: true,
    },
    differences: [
      { h: 'Accessibility only vs governance suite', text: 'Like [Siteimprove](/comparisons/siteimprove-vs-accessbell), Acquia Web Governance suits organizations, often on Acquia’s Drupal stack, that want accessibility, content quality, SEO and policy checks in one tool. AccessBell focuses on accessibility and works on any platform.' },
      { h: 'Price and buying', text: 'Acquia sells annual subscriptions by quote. AccessBell is self-serve at $29 per domain per month, with a 3-day free trial.' },
      { h: 'Evidence for legal claims', text: 'AccessBell’s Compliance Vault records every scan and confirmed fix and exports an evidence package with a verifiable fingerprint, designed for demand letters and audits.' },
    ],
    chooseThem: ['You want content quality, SEO and policy checks with accessibility, from one vendor.', 'You already use Acquia’s platform.'],
    chooseUs: ['You want accessibility monitoring with a published price.', 'You want code fixes for each issue and a legal evidence trail.', 'You run a site on any platform, not just Drupal.'],
    faqs: [
      { q: 'What happened to Monsido?', a: 'Acquia acquired Monsido in 2024 and renamed it Acquia Optimize, then renamed it Acquia Web Governance in 2025. The product scans websites for accessibility and other quality issues.' },
      { q: 'How much does Acquia Web Governance cost?', a: 'Acquia does not publish prices. It sells annual subscriptions priced by the number of pages and site complexity. AccessBell is $29 per domain per month.' },
      { q: 'Does AccessBell check PDFs like Acquia?', a: 'Yes. AccessBell checks PDFs linked from your pages on its Documents tab, as part of the same plan.' },
    ],
    sources: [
      { label: 'Acquia: Web Governance release notes', href: 'https://docs.acquia.com/web-governance/release/2025-09-30/94736-web-governance-september-2025' },
      { label: 'Acquia: PDF accessibility scan', href: 'https://docs.acquia.com/acquia-optimize/pdf-accessibility-scan' },
      { label: 'Silktide: What happened to Monsido?', href: 'https://silktide.com/blog/what-happened-to-monsido/' },
      { label: 'Capterra: Monsido pricing', href: 'https://capterra.com/p/140505/Monsido/' },
    ],
    related: ['digital-accessibility-platforms', 'best-website-accessibility-testing-software'],
    checked: '2026-10-01',
  },
];

export const CATEGORY_LABEL = { overlay: 'overlay and automated-fix tools', enterprise: 'enterprise platforms', testing: 'testing tools' } as const;

/** Other comparisons, closest alternatives first. */
export const similarTo = (c: Comparison) => [
  ...COMPARISONS.filter((o) => o.slug !== c.slug && o.category === c.category),
  ...COMPARISONS.filter((o) => o.slug !== c.slug && o.category !== c.category),
];

export const comparisonPath = (c: Comparison) => `/comparisons/${c.slug}`;

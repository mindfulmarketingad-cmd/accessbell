/**
 * /solutions hub and its pages: what AccessBell does after the first
 * scan. Every claim here is a feature that exists in the product; see the
 * linked help articles for the exact behavior.
 */
export type Solution = {
  slug: 'continuous-monitoring' | 'url-monitoring' | 'automated-fixes' | 'compliance-vault';
  /** Short name used in nav, cards and breadcrumbs. */
  name: string;
  /** Exact H1. */
  h1: string;
  /** <title> without the brand suffix. */
  title: string;
  description: string;
  icon: string;
  eyebrow: string;
  /** Opening paragraph: contains the page's keyword. */
  lead: string;
  /** One-line summary for cards. */
  summary: string;
  highlights: { title: string; text: string }[];
  steps: string[];
  sections: { id: string; h2: string; paras: string[]; bullets?: string[] }[];
  limits: string;
  faqs: { q: string; a: string }[];
  help: { href: string; label: string; note: string }[];
  sources: { href: string; label: string }[];
  /** Blog post ids worth reading next. */
  related: string[];
};

const WAI_EVAL = { href: 'https://www.w3.org/WAI/test-evaluate/', label: 'W3C WAI: Evaluating Web Accessibility Overview' };
const ADA_WEB = { href: 'https://www.ada.gov/resources/web-guidance/', label: 'ADA.gov: Guidance on Web Accessibility and the ADA' };

export const SOLUTIONS: Solution[] = [
  {
    slug: 'continuous-monitoring',
    name: 'Continuous Monitoring',
    h1: 'Continuous Website Accessibility Monitoring',
    title: 'Continuous Website Accessibility Monitoring',
    description: 'Continuous website accessibility monitoring with scheduled daily scans of up to 500 pages per domain, email alerts for new serious issues and score history.',
    icon: 'refresh',
    eyebrow: 'Scheduled monitoring',
    lead: 'Continuous website accessibility monitoring means your site is tested every day, not once a year. AccessBell rescans up to 500 pages per domain on a schedule, compares each scan with the last one and emails you when a new critical or serious issue appears, so a bad release is caught in a day instead of in a demand letter.',
    summary: 'Scheduled daily scans of up to 500 pages per domain, with email alerts when a new critical or serious issue appears.',
    highlights: [
      { title: 'Scheduled daily scans', text: 'Every monitored page on every domain is rescanned once a day, starting at 06:00 UTC, using the settings you chose for that domain.' },
      { title: 'Up to 500 pages per domain', text: 'Start from your sitemap and links, then pick the pages that matter: home, forms, checkout, and one example of each template.' },
      { title: 'Alerts for new problems only', text: 'After each scheduled scan, owners and admins are emailed when a critical or serious issue appears that was not in the previous scan.' },
      { title: 'Unlimited rescans', text: 'Run Scan now whenever you ship a fix or a release. Rescans are unlimited under fair use.' },
    ],
    steps: [
      'Add your domain and choose the standard to test against, such as WCAG 2.2 Level AA, the ADA preset or EN 301 549.',
      'AccessBell reads your XML sitemap and follows links to find pages. You choose up to 500 to monitor.',
      'Each page is scanned in a real Chrome browser on the devices you selected, and issues are mapped to WCAG success criteria.',
      'Every day the scan repeats. New critical and serious issues trigger an email, and the score and issue counts are added to your history.',
    ],
    sections: [
      {
        id: 'why-monitor',
        h2: 'Why Continuous Website Accessibility Monitoring Matters',
        paras: [
          'A site that passed a test in January can fail in March. A new plugin adds an unlabeled form field, a marketing team uploads images without alt text, a theme update changes the focus styles. None of these are decisions anyone made about accessibility, and a one-time audit cannot catch them.',
          'The W3C’s overview of evaluating web accessibility treats testing as something you plan for as part of building and maintaining a site, not a single event ([W3C WAI](https://www.w3.org/WAI/test-evaluate/)). Scheduled monitoring is the practical version of that for small teams: a regular, automatic check with a record of the results.',
        ],
      },
      {
        id: 'scheduled-monitoring',
        h2: 'How Scheduled Accessibility Monitoring Works in AccessBell',
        paras: [
          'Scheduled monitoring runs on your monitored pages without anyone starting it. Each run uses the domain’s current settings, including devices, the standard and any custom headers needed to reach staging or protected pages. A domain’s overview always shows the next scheduled scan.',
        ],
        bullets: [
          'Pages are found from your XML sitemap, robots.txt and the links on your home page, and you can add pages by hand or exclude sections with URL rules. See [URL monitoring](/solutions/url-monitoring) for how to choose up to 500 URLs per domain.',
          'Staging and password-protected sites can be scanned with custom HTTP headers, so you can test before launch.',
          'PDFs linked from your pages are listed on a Documents tab and checked separately.',
          'Monitoring pauses if the subscription is not active, and restarts on the next daily run when it is.',
        ],
      },
      {
        id: 'alerts-and-history',
        h2: 'Accessibility Alerts and Scan History That Show Progress',
        paras: [
          'Alerts are deliberately narrow. AccessBell emails the account owner and admins when a scheduled scan finds a critical or serious issue that was not on the page before. It does not email about problems that were already known, or about minor ones, so an alert means something changed.',
          'Every scan is saved. The domain overview charts your score, open issues and pages scanned over 7, 30 or 90 days, and each page has its own history. The same history feeds the [Compliance Vault](/solutions/compliance-vault), where it becomes dated evidence of your work.',
        ],
      },
      {
        id: 'after-the-alert',
        h2: 'What to Do When Monitoring Finds a New Issue',
        paras: [
          'Open the issue to see the failing element, the WCAG criteria it relates to and how to fix it. For missing alt text, unnamed buttons and links, unlabeled fields and a missing page language, you can type the correct text once and AccessBell writes the corrected code, or applies it with [AccessBellFix](/solutions/automated-fixes). The next scheduled scan confirms the fix and logs it as resolved.',
        ],
      },
    ],
    limits: 'Automated scans detect many, but not all, WCAG failures. Keyboard flows, meaningful alt text and screen reader behavior still need a person to review, and AccessBell lists the checks that need manual testing. Monitoring documents your effort and catches regressions; it does not guarantee legal compliance.',
    faqs: [
      { q: 'What is continuous website accessibility monitoring?', a: 'Automatically rescanning your site on a schedule, comparing each result with the last, and alerting you when something new fails. It catches problems introduced by new content, plugins and releases between audits.' },
      { q: 'How often does AccessBell scan my site?', a: 'Every monitored page is rescanned once a day, starting at 06:00 UTC, and you can scan at any time with Scan now. Rescans are unlimited under fair use.' },
      { q: 'How many pages can I monitor?', a: 'Up to 500 pages per domain. AccessBell finds pages from your sitemap and links, and you choose which ones to monitor.' },
      { q: 'Who gets the email alerts?', a: 'The account owner and admins. They are emailed after a scheduled scan when a critical or serious issue appears that was not in the page’s previous scan.' },
      { q: 'Can AccessBell monitor a staging site?', a: 'Yes. Add custom HTTP headers in the domain settings and AccessBell can scan staging, pre-launch and protected pages.' },
    ],
    help: [
      { href: '/resources/help-center/scans-and-reports/scheduled-monitoring-and-alerts', label: 'Scheduled monitoring and email alerts', note: 'When scans run and who is emailed.' },
      { href: '/resources/help-center/domains/find-and-monitor-pages', label: 'Find and monitor pages', note: 'Choose up to 500 pages per domain.' },
      { href: '/resources/help-center/scans-and-reports/scan-history', label: 'Track progress with scan history', note: 'Charts and per-page history.' },
    ],
    sources: [WAI_EVAL, ADA_WEB],
    related: ['automated-vs-manual-accessibility-testing', 'digital-accessibility-platforms'],
  },
  {
    slug: 'url-monitoring',
    name: 'URL Monitoring',
    h1: 'URL Monitoring: Monitor Up to 500 URLs Under One Domain',
    title: 'URL Monitoring: Up to 500 URLs Per Domain',
    description: 'Accessibility URL monitoring with AccessBell: find pages automatically, choose up to 500 URLs under one domain and rescan them every day for WCAG issues.',
    icon: 'list',
    eyebrow: 'Up to 500 URLs per domain',
    lead: 'With AccessBell’s URL monitoring, you can monitor up to 500 URLs under one domain for accessibility issues. AccessBell finds the pages on your site, you choose which URLs to monitor, and every one of them is rescanned each day against the WCAG standard you pick. This page explains how URL monitoring works, how to choose the right 500 URLs and how to keep large sites under control.',
    summary: 'Find pages automatically, choose up to 500 URLs under one domain and rescan them every day.',
    highlights: [
      { title: '500 URLs under one domain', text: 'Each domain you add can monitor up to 500 URLs, with its own settings, history and issues.' },
      { title: 'Automatic page discovery', text: 'AccessBell reads your XML sitemap and follows links from your home page, then keeps up to 2,000 discovered pages for you to choose from.' },
      { title: 'You choose the URLs', text: 'Tick the pages that matter on the Found Pages screen, search the list and add any missing URL by hand.' },
      { title: 'Rules for large sites', text: 'Include or exclude whole sections with plain text or a * wildcard, such as /docs/* or ?s=, and decide whether subdomains are included.' },
    ],
    steps: [
      'Add your domain, then open Manage domain pages. AccessBell reads your sitemap and the links on your home page to find pages.',
      'Tick up to 500 URLs on the Found Pages screen. Use search to find pages, and Add Pages to include any URL that was not found.',
      'Select Start Scan. Each URL is scanned in a real Chrome browser on the devices you chose.',
      'From then on, every monitored URL is rescanned daily. Each one gets its own score, issues and scan history.',
    ],
    sections: [
      {
        id: 'what-is-url-monitoring',
        h2: 'What URL Monitoring Means for Accessibility',
        paras: [
          'Accessibility URL monitoring is the practice of testing a defined list of page addresses, again and again, so that you know when any of them stops meeting your standard. A one-off scan tells you about one page on one day. Monitoring a set of URLs tells you about your site, and about how it changes.',
          'In AccessBell, each unique page address that you monitor counts as one URL. A domain can monitor up to 500 of them. Links to files such as PDFs and images are not counted as pages; PDFs are listed separately on the Documents tab, where they are [checked for accessibility](/resources/help-center/scans-and-reports/pdf-accessibility-scanning).',
        ],
      },
      {
        id: 'monitor-500-urls',
        h2: 'How to Monitor Up to 500 URLs Under One Domain',
        paras: [
          'The first time you open Found Pages, AccessBell crawls your site. It reads the XML sitemap you entered, the ones listed in robots.txt and /sitemap.xml (including sitemap index files), and follows the links on your home page. It keeps up to 2,000 discovered pages per domain, only on the same domain unless you turn on subdomains.',
          'You then choose which of those to monitor. Tick up to 500 pages, use Search pages to find a specific one, and select Start Scan. The pages you select become the domain’s monitored URLs. Pages you untick stop being monitored, but their scan history is kept.',
        ],
        bullets: [
          'Missing a page? Select Add Pages and enter one address per line, as a full address or a path such as /pricing.',
          'Sitemap not found? Enter it under XML sitemap in the domain settings.',
          'Pages behind a login or on a staging site? Add custom headers in the settings to reach them.',
        ],
      },
      {
        id: 'choose-your-urls',
        h2: 'Choosing the Right 500 URLs to Monitor',
        paras: [
          'Many sites have more than 500 pages, and most have far fewer templates than pages. Because pages built from the same template share the same markup, a barrier in one product page usually exists in all of them. Choose URLs that cover your templates and your most important journeys first:',
        ],
        bullets: [
          'The home page and your main landing pages.',
          'Every page with a form: sign-up, contact, checkout and account pages.',
          'One example of each template, such as a product page, a blog post and a category page.',
          'Pages that change often, such as promotions, events and news.',
        ],
      },
      {
        id: 'url-rules',
        h2: 'Control Which URLs Are Monitored With Rules and Subdomains',
        paras: [
          'URL rules decide which pages AccessBell keeps when it discovers them. Set them in the domain settings, one rule per line. Plain text matches anywhere in the address, and * matches any characters.',
        ],
        bullets: [
          'Only include /docs/* to focus on one section of a large site.',
          'Exclude /blog/tag/* and /blog/author/* to skip archive pages.',
          'Exclude ?s= to skip search result pages, or /fr/* to skip a language version.',
          'Turn on Include subdomains to monitor pages such as shop.example.com under example.com. Otherwise, a subdomain counts as its own domain.',
        ],
      },
      {
        id: 'what-happens-next',
        h2: 'What Happens to Your Monitored URLs',
        paras: [
          'Monitored URLs are rescanned automatically every day as part of [continuous website accessibility monitoring](/solutions/continuous-monitoring), and you can scan at any time with Scan now. Owners and admins are emailed when a new critical or serious issue appears. Every URL keeps its own scan history, which feeds the [Compliance Vault](/solutions/compliance-vault).',
          'Each domain has its own 500 URLs. If you manage several sites, add each as a domain and see them side by side in Your Domains. The [component grouping](/resources/help-center/fixing-issues/component-grouping) view then shows which issues come from shared components, so you can fix a header or form once instead of on hundreds of URLs.',
        ],
      },
    ],
    limits: 'A domain monitors up to 500 URLs. The free scan tests one page at a time, and PDFs and other files are checked separately rather than counted as URLs. Monitoring a sample of your pages cannot prove that every page is accessible, and automated scans detect many, but not all, WCAG failures, so test your key journeys by hand as well.',
    faqs: [
      { q: 'How many URLs can I monitor with AccessBell?', a: 'Up to 500 URLs under each domain. Every domain in your plan has its own 500, along with its own settings, history and issues.' },
      { q: 'What counts as one URL?', a: 'Each unique page address that you monitor counts as one. Links to files such as PDFs and images are not added as pages; PDFs are listed on the Documents tab and checked separately.' },
      { q: 'How does AccessBell find the URLs on my site?', a: 'It reads your XML sitemap, the sitemaps listed in robots.txt and /sitemap.xml, and the links on your home page, and keeps up to 2,000 pages for you to choose from. You can also add pages by hand.' },
      { q: 'My site has more than 500 pages. What should I monitor?', a: 'Start with your home page, pages with forms and one example of each template. Pages built from the same template share the same code, so an issue found on one usually appears on all of them, and fixing the template fixes them all.' },
      { q: 'Are subdomains included in the 500 URLs?', a: 'Only if you turn on Include subdomains for the domain. Otherwise a subdomain such as shop.example.com is treated as its own domain with its own 500 URLs.' },
      { q: 'Can I exclude parts of my site?', a: 'Yes. Use include and exclude URL rules, with plain text or the * wildcard, to leave out sections such as tag archives, search results or other languages.' },
    ],
    help: [
      { href: '/resources/help-center/domains/find-and-monitor-pages', label: 'Find and monitor pages', note: 'Choose up to 500 pages per domain.' },
      { href: '/resources/help-center/domains/include-and-exclude-url-rules', label: 'Include and exclude URL rules', note: 'Focus on the sections that matter.' },
      { href: '/resources/help-center/domains/manage-multiple-domains', label: 'Manage multiple domains', note: 'Each domain has its own 500 URLs.' },
    ],
    sources: [WAI_EVAL, { href: 'https://www.sitemaps.org/protocol.html', label: 'sitemaps.org: Sitemap protocol' }],
    related: ['automated-vs-manual-accessibility-testing', 'digital-accessibility-platforms'],
  },
  {
    slug: 'automated-fixes',
    name: 'Automated Fixes',
    h1: 'Automatically Fix Website Accessibility Issues',
    title: 'Automatically Fix Website Accessibility Issues',
    description: 'Automatically fix website accessibility issues with AccessBellFix: apply approved alt text, button name and page language fixes with one script and no code edits.',
    icon: 'sparkle',
    eyebrow: 'AccessBellFix',
    lead: 'You can automatically fix website accessibility issues like missing alt text, unnamed buttons and a missing page language with AccessBellFix. Add one line of code to your site, approve a fix in AccessBell, and it is applied on every page load. It is not an overlay: every fix is one you wrote or approved, tied to a specific element, and your next scan checks whether it worked.',
    summary: 'AccessBellFix applies the alt text, button names and page language fixes you approve, without editing your theme or code.',
    highlights: [
      { title: 'One-line install', text: 'Paste the AccessBellFix script once into your site’s shared head. Guides cover WordPress, Shopify, Wix, Squarespace, Webflow and Google Tag Manager.' },
      { title: 'Corrected code for each element', text: 'Type the alt text or label once and AccessBell writes the element’s corrected markup, ready to copy into your code.' },
      { title: 'Fix now, without a deploy', text: 'When you cannot edit the code quickly, select Fix now and AccessBellFix applies the fix in visitors’ browsers.' },
      { title: 'Verified by the next scan', text: 'Fixes are not taken on trust. The next scan shows whether the issue is gone, and the fix is logged in your Compliance Vault.' },
    ],
    steps: [
      'Open an issue and go to its Failed Elements tab. Many issues show a Fix this element box under each failing element.',
      'Type what the image shows, what the button does or which language the page uses. AccessBell writes the corrected code.',
      'Copy the code into your site, or select Fix now to apply it with AccessBellFix. Installing AccessBellFix takes one line.',
      'Rescan. The issue moves to resolved, and the fix appears in the fix log.',
    ],
    sections: [
      {
        id: 'what-it-fixes',
        h2: 'What AccessBellFix Can Automatically Fix',
        paras: [
          'AccessBellFix handles the fixes that can be made safely in the browser from a short piece of text. Each one is scoped to the element you chose with a CSS selector, and nothing else on your page changes.',
        ],
        bullets: [
          'Image alt text: sets the alt text of an image, or an accessible name for an SVG or role="img" element (WCAG 1.1.1).',
          'Accessible names: sets the aria-label of an icon-only button, link or control (WCAG 4.1.2).',
          'Page language: sets the lang attribute of the page (WCAG 3.1.1).',
        ],
      },
      {
        id: 'not-an-overlay',
        h2: 'Why Automatic Fixes Are Not an Accessibility Overlay',
        paras: [
          'Overlays promise to make a whole site compliant with one script. In 2025 the FTC finalized an order requiring accessiBe to pay $1 million over claims that its product could make any website WCAG compliant ([FTC](https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million)). AccessBell makes no such claim.',
          'AccessBellFix applies only fixes that you added and approved, to the specific elements you named, and it does not redesign your pages. Fixing the source code is still the most robust option, and AccessBell gives you the corrected code for that. AccessBellFix is for when you cannot change the code quickly, such as on a hosted platform or a theme you do not control.',
        ],
      },
      {
        id: 'fix-workflow',
        h2: 'A Workflow to Fix Website Accessibility Issues Faster',
        paras: [
          'Most sites reuse templates, so one broken component repeats on hundreds of pages. AccessBell groups failing elements by component, so you can fix the shared header, form or card once. Issues are ranked by severity, and each comes with an explanation, correct and incorrect markup examples and instructions for the specific page.',
          'AI-assisted suggestions help with wording, such as alt text and labels, but nothing changes on your site until a person approves it. Combined with [continuous monitoring](/solutions/continuous-monitoring), new issues are found daily and the same workflow fixes them.',
        ],
      },
      {
        id: 'prove-the-fix',
        h2: 'Proof That Each Accessibility Fix Worked',
        paras: [
          'Every issue a later scan confirms as fixed is added to your fix log with the date it was last seen and the date it was confirmed gone. Fixes applied with AccessBellFix are included in the evidence package you can export from the [Compliance Vault](/solutions/compliance-vault).',
        ],
      },
    ],
    limits: 'AccessBellFix does not fix everything. Color contrast, keyboard traps, heading structure, captions and layout problems need a design, content or code change, and AccessBell shows you what to change. Treat AccessBellFix as a quick way to close specific gaps while you fix the source, and do not rely on it to make a site conform to WCAG on its own.',
    faqs: [
      { q: 'Can accessibility issues be fixed automatically?', a: 'Some can. Missing alt text, unnamed buttons and links and a missing page language can be corrected from a short piece of text, so AccessBellFix can apply them. Contrast, keyboard behavior and content structure need human decisions and code or design changes.' },
      { q: 'What is AccessBellFix?', a: 'An optional one-line script. Once it is on your site, it applies the fixes you add and approve in AccessBell in your visitors’ browsers. It only applies the fixes you have approved and does not change your design.' },
      { q: 'Is AccessBellFix an accessibility overlay?', a: 'No. It does not claim to make a site compliant and does not add a general fix-everything layer. It applies specific fixes you approve, and your scans show whether each one resolved its issue. An optional PageAssist toolbar is separate and only appears if you turn it on.' },
      { q: 'Will AccessBellFix slow down my site?', a: 'The script loads asynchronously, so it does not block the page from loading.' },
      { q: 'Do I still need to fix the underlying code?', a: 'Where you can, yes. Fixing the source works everywhere, including for tools that do not run scripts. AccessBell gives you the corrected code for each element so you can do it.' },
    ],
    help: [
      { href: '/resources/help-center/getting-started/install-accessbellfix', label: 'Install AccessBellFix', note: 'The snippet, platform guides and validation.' },
      { href: '/resources/help-center/fixing-issues/read-an-issue', label: 'Read an issue and decide what to fix first', note: 'Failed elements, fix boxes and correct markup.' },
      { href: '/resources/help-center/troubleshooting/accessbellfix-content-security-policy', label: 'AccessBellFix and Content Security Policy', note: 'If the script is blocked.' },
    ],
    sources: [
      { href: 'https://www.w3.org/TR/WCAG22/', label: 'W3C: Web Content Accessibility Guidelines (WCAG) 2.2' },
      { href: 'https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million', label: 'FTC: final order requiring accessiBe to pay $1 million' },
    ],
    related: ['accessibe-alternative', 'ada-website-accessibility'],
  },
  {
    slug: 'compliance-vault',
    name: 'Compliance Vault',
    h1: 'Document Accessibility Issues & Fixes',
    title: 'Document Accessibility Issues & Fixes',
    description: 'Document accessibility issues and fixes with the AccessBell Compliance Vault: dated scan history, a fix log and an exportable, verifiable evidence package.',
    icon: 'shield',
    eyebrow: 'Compliance Vault',
    lead: 'To document accessibility issues and fixes, you need dated proof of what you tested, what you found and what you fixed. The AccessBell Compliance Vault keeps that record for you: every scan, a fix log with remediation notes, your accessibility statement, and an evidence package you can export for a lawyer, auditor or customer.',
    summary: 'Dated scan history, a fix log, remediation notes and an exportable evidence package with a verifiable fingerprint.',
    highlights: [
      { title: 'Legal Evidence Package', text: 'Export your testing program, scan results, remediation log and open issues as a PDF or a ZIP with the full record and CSV files.' },
      { title: 'Fix log with dates', text: 'Every issue a scan confirmed as fixed, with the date it was last seen and the date it was confirmed gone.' },
      { title: 'Remediation notes', text: 'Record work done outside AccessBell, such as a code change or a screen reader test. Notes are included in every future package.' },
      { title: 'Tamper-evident', text: 'Each package carries a record ID and a SHA-256 fingerprint, so anyone you share it with can check it has not been changed.' },
    ],
    steps: [
      'Monitor your domain. Every scan, manual or scheduled, is saved with its date, devices and standard.',
      'Fix issues. Scans confirm each fix and add it to the fix log. Add remediation notes for work done elsewhere.',
      'Publish your accessibility statement from the same place, so it matches your results.',
      'Export the evidence package for the period you need, and share it with its verification link.',
    ],
    sections: [
      {
        id: 'why-document',
        h2: 'Why You Should Document Accessibility Issues and Fixes',
        paras: [
          'Website accessibility claims are common, and many target small businesses. When a demand letter arrives, the strongest position is usually a documented, ongoing effort: you tested regularly against a recognized standard and fixed what you found. The Department of Justice states that the ADA applies to businesses’ web content and recommends choosing and following a standard ([ADA.gov](https://www.ada.gov/resources/web-guidance/)). Records show what you did and when.',
          'Records also help well before a dispute. Procurement teams ask for them, regulators in the EU expect documentation, and your own team needs to see what changed since the last audit.',
        ],
      },
      {
        id: 'evidence-package',
        h2: 'What an Evidence Package Includes',
        paras: ['The Legal Evidence Package covers the last 12 months by default, or the period you choose. It includes:'],
        bullets: [
          'Your testing program: the WCAG version and level, devices and the daily scan schedule.',
          'Every scan in the period, with monthly results.',
          'Your score and open issues at the start and end of the period.',
          'A remediation log: each issue found in one scan and gone in the next scan of the same page, with both dates.',
          'Your remediation notes and fixes applied with [AccessBellFix](/solutions/automated-fixes).',
          'Your accessibility statement and the issues still open.',
        ],
      },
      {
        id: 'scan-history',
        h2: 'A Scan History Archive Documents Issues Over Time',
        paras: [
          'The vault keeps one snapshot per month for the last 12 months, with scans run, pages scanned, average score and average issues, and each page has its full scan history. This comes from [continuous monitoring](/solutions/continuous-monitoring), so the record builds up automatically while your team works.',
        ],
      },
      {
        id: 'statement-and-certificate',
        h2: 'Accessibility Statement and Certificate',
        paras: [
          'An accessibility statement tells visitors what standard you aim for, what is not yet accessible and how to reach you. The W3C publishes [guidance on developing a statement](https://www.w3.org/WAI/planning/statements/), and our free [accessibility statement generator](/resources/statement-generator) writes a starting point. In the vault, the statement is kept with your scan results.',
          'When every scanned page scores 100 in its latest scan, you can generate an Accessibility Certificate. It states that the site passed every automated check on that date, and it is not a certification of full WCAG conformance.',
        ],
      },
    ],
    limits: 'The vault documents your effort. It is not legal advice or a guarantee against claims. Automated testing detects many, but not all, WCAG failures, and an issue that is no longer detected may have been fixed or removed from the page.',
    faqs: [
      { q: 'How do I document accessibility issues and fixes?', a: 'Keep dated records of each scan, the issues found and when each was fixed, plus notes on work done outside your scanner. AccessBell does this automatically in the Compliance Vault and exports it as an evidence package.' },
      { q: 'What does the Legal Evidence Package contain?', a: 'Your testing program, every scan in the period, start and end scores, a remediation log with dates, remediation notes, fixes applied with AccessBellFix, your accessibility statement and the issues still open. Download it as a PDF or as a ZIP with the record and CSV files.' },
      { q: 'How can someone verify the package has not been altered?', a: 'Each package is stored as issued with a record ID and a SHA-256 fingerprint of its record file. Anyone can check it at the verification link printed on the package, or compute the fingerprint themselves.' },
      { q: 'Will the vault protect me from an ADA lawsuit?', a: 'No tool can guarantee that. The vault gives you and your lawyer a dated record of your testing and fixes, which supports a good-faith accessibility program.' },
      { q: 'How long is the history kept?', a: 'Scan history is kept as long as the domain and page exist in your account, and the vault archive shows monthly snapshots for the last 12 months. Export anything you need before removing a domain.' },
    ],
    help: [
      { href: '/resources/help-center/scans-and-reports/compliance-vault', label: 'Use the Compliance Vault for legal evidence', note: 'Export, verify and browse the archive.' },
      { href: '/resources/help-center/getting-started/create-your-accessibility-statement', label: 'Create your accessibility statement', note: 'Publish a statement from your results.' },
      { href: '/resources/help-center/scans-and-reports/export-reports', label: 'Export reports', note: 'Download scan results.' },
    ],
    sources: [ADA_WEB, { href: 'https://www.w3.org/WAI/planning/statements/', label: 'W3C WAI: Developing an Accessibility Statement' }],
    related: ['what-happens-after-being-sued-for-ada-website-compliance', 'ada-website-compliance-guide'],
  },
];

export const solutionPath = (s: Solution) => `/solutions/${s.slug}`;

---
title: 'Free Tools to Check Website Accessibility: 6 Best Options Compared'
seoTitle: 'Free Tools to Check Website Accessibility'
description: 'Compare the best free tools to check website accessibility: AccessBell, WAVE, axe DevTools, Accessibility Insights, Lighthouse and ANDI, and when to use each.'
pubDate: 2026-09-28
category: 'Guides'
contributors:
  - author: joseph-edwards
    role: Author
history:
  - date: 2026-09-28
    note: 'First published. Tool features reviewed against each tool''s own documentation.'
  - date: 2026-09-30
    note: 'Updated: the free AccessBell scan now shows issue counts by severity; the full report with fixes is part of AccessBell Pro.'
related: ['we-tested-10-accessibility-checker-tools', 'what-is-a-website-accessibility-checker', 'automated-vs-manual-accessibility-testing']
faqs:
  - q: 'What is the best free tool to check website accessibility?'
    a: 'It depends on who is testing. For a quick issue count with no installation, start with [AccessBell](/#scan), which shows the full report with fixes on its paid plan. Developers usually add axe DevTools or Accessibility Insights to their browser, designers like WAVE''s visual overlay, and Section 508 testers use ANDI. Most teams use two or three together.'
  - q: 'Can a free accessibility checker make my website ADA compliant?'
    a: 'No tool can make a site compliant on its own. Automated checkers reliably find code-level failures such as missing alt text, unlabeled form fields and low contrast, but some WCAG requirements need a person to judge them. Use automated tools to find and fix the objective issues, then test with a keyboard and a screen reader.'
  - q: 'Do these tools work on pages behind a login?'
    a: 'Browser extensions and bookmarklets (WAVE, axe DevTools, Accessibility Insights, Lighthouse and ANDI) test whatever page is open in your browser, including pages you are signed in to. Web-based checkers like the free AccessBell scan test public pages. AccessBell Pro can scan staging and protected pages using custom HTTP headers.'
  - q: 'Why do different accessibility tools give different results?'
    a: 'Each tool uses its own rule set, runs at a different moment in the page load and reports issues differently. Several tools, including AccessBell, axe DevTools, Lighthouse and Accessibility Insights, share the open-source axe-core engine, so their automated results overlap. WAVE and ANDI use their own checks, so they surface some issues the others do not.'
  - q: 'Does a Lighthouse accessibility score of 100 mean my site is accessible?'
    a: 'No. Lighthouse runs a subset of automated checks and weights them into a score. A perfect score means none of those checks failed, not that the page meets WCAG. Many barriers, like confusing focus order or unhelpful alt text, can only be found with manual testing.'
  - q: 'Can I test against WCAG 2.1 AA only?'
    a: 'Yes. In the free AccessBell scanner, choose "WCAG 2.1 AA" from the standard menu and the scan runs only the WCAG 2.0 and 2.1 Level A and AA rules, and reports how many issues it found. In the dashboard, report filters narrow results by version, level, principle, success criterion or severity. Pro plan customers can set WCAG 2.0, 2.1 or 2.2 and Level A, AA or AAA for each domain.'
---

The best **free tools to check website accessibility** are AccessBell, WAVE, axe DevTools, Accessibility Insights, Google Lighthouse and ANDI. Each one finds barriers that stop people with disabilities from using a website, such as missing [alt text](/blog/wcag-1-1-1-non-text-content), unlabeled form fields, low [color contrast](/resources/contrast-checker) and buttons with no name. They differ in who they are built for, how you run them and how they present results.

This guide compares all six so you can pick the right mix for your team. We make AccessBell, so we have marked it clearly and explained where it fits and where another tool is the better choice.

## Quick Comparison

| Tool | How you run it | Best for | Tests pages behind a login | Engine |
| --- | --- | --- | --- | --- |
| **AccessBell** (our tool) | Website: paste a URL | A free issue count by severity; full report with fixes on the paid plan | Paid plan, via custom headers | axe-core in a real browser |
| **WAVE** | Browser extension or website | Visual, on-page review | Yes, with the extension | WebAIM's own rules |
| **axe DevTools** | Browser extension | Developers debugging code | Yes | axe-core |
| **Accessibility Insights** | Browser extension | Fast checks plus guided manual testing | Yes | axe-core plus guided tests |
| **Google Lighthouse** | Built into Chrome DevTools | Quick score alongside performance | Yes | Subset of axe-core |
| **ANDI** | Bookmarklet | Inspecting accessible names, Section 508 testing | Yes | ANDI's own inspection modules |

All six are free to use. Some have paid tiers for extra features.

## What Free Accessibility Checkers Can and Cannot Do

Every tool on this list is an automated checker, and automated testing has limits. It is excellent at finding **objective, code-level failures**, and those are the barriers most often cited in accessibility complaints. It cannot judge whether alt text is meaningful, whether focus order makes sense or whether an error message is helpful. Industry research consistently finds that automated rules catch only a portion of WCAG issues, commonly estimated at around a third.

The practical takeaway: use one or two automated tools to find and fix the objective problems, then test key pages with a keyboard and a screen reader. Our guide to [automated vs manual accessibility testing](/blog/automated-vs-manual-accessibility-testing) explains how to split the work.

## 1. AccessBell (Our Tool)

**Best for:** a quick, install-free answer to "how many accessibility issues does this page have?", then a full report and monitoring if you subscribe.

[AccessBell](/) is a **website accessibility checker** that runs in your browser. Paste a URL, choose a standard, and it loads the page in a real browser and runs the open-source axe-core engine against WCAG success criteria.

**What is free and what is paid.** The free scan tells you how many issues the page has and how severe they are (critical, serious, moderate and minor). To see the issues themselves, with the failing code and how to fix each one, you need AccessBell Pro, which starts with a 3-day free trial. If you want a free tool that lists every issue, WAVE, axe DevTools and the others below do that at no cost.

### Where It Fits

- **Nothing to install.** It works in any browser, on any device, including phones and tablets. That makes it easy to use on locked-down work computers and to share with non-technical teammates.
- **Choose exactly what to test against.** Pick WCAG 2.2 AA, WCAG 2.1 AA, ADA, Section 508 or EN 301 549. The scan runs only the rules for that version and level.
- **A fast severity count.** The free scan is a quick way to see whether a page has a few problems or many before you spend time on it.
- **Plain-language fixes, with Pro.** In the dashboard, each issue explains what is wrong, which WCAG criterion it fails and how to fix it, with the failing code, and you can filter by version, level, principle, criterion or severity.
- **Honest about limits.** Items a machine cannot decide appear in a separate "needs manual review" list instead of being hidden or reported as failures.
- **Grows with you.** Pro monitors up to 500 URLs per domain with daily scans, unlimited rescans, scan history you can use as audit evidence, component grouping and team roles.

### Limitations

- The free scan shows **counts only**, not which issues were found. The other tools in this guide list every issue for free.
- It checks **one public page at a time**. For pages behind a login, use a browser extension below or AccessBell Pro with custom headers.
- It reports what automated rules can detect. Pair it with the manual checks described later in this guide.

[Run a free AccessBell scan](/#scan) to see how many issues your page has, or open it preset for [WCAG 2.2 AA](/resources/wcag-2-2-aa-checker), [WCAG 2.1 AA](/resources/wcag-2-1-aa-checker), [ADA compliance](/resources/ada-compliance-checker), [Section 508](/resources/section-508-checker) or [EN 301 549](/resources/en-301-549-checker).

## 2. WAVE by WebAIM

**Best for:** designers, content editors and anyone who learns visually.

WAVE, from the nonprofit WebAIM, is available as a browser extension for Chrome, Firefox and Edge, and as a website at [wave.webaim.org](https://wave.webaim.org/). Its signature feature is a **visual overlay**. It places icons directly on the page to mark errors, contrast problems, alerts, ARIA usage and structural elements like headings and landmarks.

**Strengths:**

- You see each issue in context, right where it sits on the page.
- The structure and order views make heading and [reading order](/blog/wcag-1-3-2-meaningful-sequence) problems easy to spot.
- A built-in contrast panel checks text against its background.
- Because the extension runs locally, it works on internal and signed-in pages.

**Limitations:** the overlay can feel busy on complex pages, and the results are best for reviewing one page at a time rather than tracking a whole site.

## 3. axe DevTools by Deque

**Best for:** developers who want precise, code-level results.

axe DevTools is a browser extension built on **[axe-core](https://github.com/dequelabs/axe-core)**, Deque's open-source accessibility engine. axe-core is widely used because it aims for no false positives, so a reported failure is almost always a real one. It is the same engine behind several other tools on this list, including AccessBell.

**Strengths:**

- Fast, reliable results inside your browser's developer tools.
- Each issue points to the exact element and includes remediation guidance.
- It fits developer workflows, and the open-source axe-core library can also run in automated test suites.

**Limitations:** the free extension covers automated checks. Guided testing, saved reports and some advanced features are part of Deque's paid tiers. Some people also find the interface less approachable than WAVE's visual view.

## 4. Accessibility Insights by Microsoft

**Best for:** teams that want automated checks plus a structured way to learn manual testing.

[Accessibility Insights for Web](https://accessibilityinsights.io/) is a free, open-source extension for Chrome and Edge. Microsoft also offers versions for Windows and Android apps.

**Strengths:**

- **FastPass** runs automated checks and a tab-stops visualization in a couple of minutes. It catches high-impact issues and shows how keyboard focus moves through the page.
- **Assessment mode** walks you through a full manual review, step by step, explaining what to check and how. It is one of the best free ways to learn manual accessibility testing.
- It works on any page open in your browser, including signed-in pages.

**Limitations:** the full assessment is thorough but time-consuming, and it is only available in Chromium-based browsers.

## 5. Google Lighthouse

**Best for:** a quick accessibility score alongside performance and SEO checks.

[Lighthouse](https://developer.chrome.com/docs/lighthouse/overview) is built into Chrome DevTools. It also runs through PageSpeed Insights and from the command line. Its accessibility audit uses a **subset of axe-core** checks and produces a score from 0 to 100, next to performance, best practices and SEO.

**Strengths:**

- Already installed for anyone using Chrome.
- Easy to run in automated pipelines to catch regressions.
- A familiar score that is easy to report to stakeholders.

**Limitations:** a score of 100 does not mean a page is accessible. Lighthouse runs fewer accessibility checks than dedicated tools, and the score weights some failures more than others. Treat it as a smoke test, not an audit.

## 6. ANDI (Accessible Name and Description Inspector)

**Best for:** Section 508 testers and anyone checking what screen readers will announce.

ANDI is a free **bookmarklet** created by the U.S. Social Security Administration. You add it to your bookmarks bar and click it on any page. It is part of the testing process used by the federal Section 508 Trusted Tester program.

**Strengths:**

- Shows the **accessible name and description** of each element, which is what a screen reader will announce. That is invaluable for checking links, buttons, form fields and images.
- Separate modules inspect focusable elements, graphics, links and buttons, tables, structure, color contrast and hidden content.
- It runs in any modern desktop browser without installing an extension.

**Limitations:** ANDI is an inspection tool rather than a one-click report. It works best when you already know what you are looking for, and its interface takes some practice.

## Free Manual Testing Tools Worth Adding

Automated checkers cover a portion of WCAG. These free tools help with the rest:

- **Your keyboard.** Press Tab through each page. Can you reach and use every link, button and form field, and can you always see where focus is?
- **NVDA,** a free screen reader for Windows.
- **VoiceOver,** built into macOS, iPhone and iPad.
- **TalkBack,** built into Android.
- **Colour Contrast Analyser** by TPGi, a free desktop app for checking contrast anywhere on screen, including images and PDFs.
- **Browser zoom.** Zoom to 200 and 400 percent to check that text resizes and content reflows without horizontal scrolling.

## How to Choose the Right Mix

Most teams do not need all six tools. Pick based on who is testing:

| If you are... | Start with | Add |
| --- | --- | --- |
| A business owner or marketer | AccessBell | WAVE for a visual view |
| A designer or content editor | WAVE | AccessBell Pro for shareable reports |
| A front-end developer | axe DevTools or Accessibility Insights | AccessBell to track progress over time |
| A federal agency or vendor | ANDI | Accessibility Insights for guided manual tests |
| Tracking many pages or domains | AccessBell Pro (paid) | Any extension for spot checks |

Whatever you choose, make testing a habit rather than a one-time event. Websites change constantly, and new content is the most common source of new barriers. For a deeper look at what these tools test, read [what a website accessibility checker is and how it works](/blog/what-is-a-website-accessibility-checker).

## Conclusion

Free accessibility tools are good enough to find most of the objective barriers on your website. WAVE gives you a visual map, axe DevTools and Accessibility Insights serve developers, Lighthouse gives a quick score, and ANDI shows what screen readers will announce.

For head-to-head results, see our test of [10 accessibility checker tools on the same website](/blog/we-tested-10-accessibility-checker-tools), which shows exactly which barriers each one caught and missed.

If you want the fastest answer to "is my site accessible?" with nothing to install, start with an AccessBell scan, and subscribe when you want a prioritized fix list anyone on your team can read. [Run a free scan now](/#scan), then pair it with a keyboard and a screen reader to cover what automation cannot.

Ready for more than free tools? Compare the [best website accessibility testing software](/blog/best-website-accessibility-testing-software).

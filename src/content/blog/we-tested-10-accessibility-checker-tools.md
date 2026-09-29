---
title: "We Tested 10 Accessibility Checker Tools on the Same Website. Here's What Each One Actually Caught."
seoTitle: 'We Tested 10 Accessibility Checker Tools'
description: "We tested 10 accessibility checker tools on one website with 35 planted barriers. Here's what each tool caught, what it missed and what it flagged by mistake."
pubDate: 2026-09-29
category: 'Comparisons'
contributors:
  - author: joseph-edwards
    role: Author
history:
  - date: 2026-09-29
    note: 'First published. All ten tools run on September 29, 2026 against the same test page, using the versions listed in the article.'
related: ['website-accessibility-checkers', 'free-tools-to-check-website-accessibility', 'automated-vs-manual-accessibility-testing']
faqs:
  - q: 'Which accessibility checker tool caught the most issues in your test?'
    a: 'IBM Equal Access and QualWeb each flagged 24 of the 35 planted barriers, but many of those were "needs review" prompts rather than definite failures, and both produced far more findings to sort through (64 and 110). For definite errors, AccessLint (18) and Lighthouse (17) led. AccessBell caught 15, with no false alarms.'
  - q: 'Can an accessibility checker find every problem on a page?'
    a: 'No. Across all ten tools combined, 5 of the 35 barriers were never flagged at all, including a keyboard trap, an auto-advancing carousel and a CAPTCHA-only sign-in. Another 7 only ever appeared as "please check this by hand" prompts. Automated testing has to be paired with manual testing.'
  - q: 'Is a high Lighthouse accessibility score a sign that a site is accessible?'
    a: 'Not on its own. Lighthouse gave our test page 41 out of 100, which correctly signals a problem, but it only evaluates a subset of checks. A page can score well and still contain keyboard traps, missing captions or confusing instructions that no automated score measures.'
  - q: 'Should I use more than one accessibility checker?'
    a: 'Using two engines built on different rule sets catches more. In our test, AccessBell alone caught 15 of 35 barriers; AccessBell plus IBM Equal Access or QualWeb together caught 25, more than any single tool. Neither replaces a manual keyboard and screen reader pass.'
  - q: 'Why did you include your own product, and is the test fair?'
    a: 'We make AccessBell, so we have an obvious interest. To keep the test honest we ran every tool against the same page on the same day, published the exact versions and settings, used one scoring rule for every tool, and report AccessBell''s misses as plainly as everyone else''s.'
---

We tested 10 accessibility checker tools on the same website to answer a simple question: when you point a tool at a page full of real accessibility barriers, what does it actually catch? Every accessibility checker tool claims to find WCAG issues. Very few comparisons show which issues, side by side, on the same code.

So we built a test website with 35 known barriers, ran all ten tools against it on the same day, and matched every finding back to the barrier it was about. Here is what each accessibility checker tool caught, what it missed and what it flagged by mistake.

**Disclosure:** we make [AccessBell](/), one of the ten tools. We report its misses as plainly as everyone else's, and you can check our [testing methodology](/methodology) for how our scanner works.

## Quick Facts

- Together, the ten accessibility checker tools caught **30 of the 35** barriers. **5 barriers were missed by every tool.**
- The best single tool flagged **24 of 35 (69%)**, and that count includes "needs review" prompts, not just definite failures.
- Only **3 barriers** were caught by all ten tools: a missing page language, an image with no alt attribute and a linked logo with no accessible name.
- **7 barriers** were only ever raised as prompts for a person to check, never as definite failures.
- Google Lighthouse scored the page **41 out of 100**, despite it containing 35 deliberate barriers.

## How We Tested the Accessibility Checker Tools

**The test site.** We built a realistic one-page store for a fictional brand, Pinecrest Trail Supply, with a header, hero, product cards, a carousel, a video, a data table, a checkout form, a sign-in form, a chat box, an embedded map and a footer. Into it we planted **35 barriers**, each a real failure of a specific WCAG success criterion or a widely recognized best practice. Some are easy for software to find (an image with no alt attribute). Others need human judgment (an informative chart marked as decorative, or a chat box that traps keyboard focus). Every barrier is listed in the results table below.

**The tools and versions.** All ten ran against the same URL on September 29, 2026:

| # | Tool | Version tested | What it is |
| --- | --- | --- | --- |
| 1 | [AccessBell](/) | axe-core 4.13.0, WCAG 2.2 A/AA rules | Hosted checker and monitoring service (ours) |
| 2 | [axe-core](https://github.com/dequelabs/axe-core) | 4.13.0, default settings | The open-source engine behind axe DevTools |
| 3 | [Google Lighthouse](https://github.com/GoogleChrome/lighthouse) | 13.5.0 | Built into Chrome DevTools and PageSpeed Insights |
| 4 | [Pa11y](https://github.com/pa11y/pa11y) | 10.0.0, WCAG2AA, warnings on | Command-line tester using HTML_CodeSniffer |
| 5 | [IBM Equal Access Checker](https://github.com/IBMa/equal-access) | Engine 4.0.34, IBM_Accessibility rules | The engine inside IBM's browser extension |
| 6 | [QualWeb](https://github.com/qualweb/qualweb) | Core 0.9.5, ACT rules, WCAG techniques, best practices | Open-source evaluator used in public-sector monitoring |
| 7 | [Siteimprove Alfa](https://alfa.siteimprove.com) | 0.84.2 | Siteimprove's open-source rule engine |
| 8 | [Sa11y](https://sa11y.netlify.app) | 5.0.9 | Content-author checker that highlights issues in the page |
| 9 | [W3C Nu Html Checker](https://github.com/validator/validator) | 26.9.27 | The W3C's markup validator |
| 10 | [AccessLint](https://github.com/AccessLint/accesslint) | Core 0.21.0 | Lightweight WCAG 2.2 rule engine |

**How we scored.** A tool "caught" a barrier if it reported a finding that pointed at the barrier's element and was about that problem. We counted both definite failures (**✓**) and "needs review" prompts (**R**), because a prompt still sends a person to the right place. A finding on the right element about something else did not count, and neither did a vague page-wide prompt unless it named the specific problem. Every tool was scored with the same rules.

## Results: How the 10 Accessibility Checker Tools Compared

| Tool | Barriers caught (of 35) | As definite failures | As review prompts | Total findings reported | Findings not about a planted barrier |
| --- | --- | --- | --- | --- | --- |
| IBM Equal Access | **24** | 13 | 11 | 64 | 21 |
| QualWeb | **24** | 16 | 8 | 110 | 52 |
| Siteimprove Alfa | 19 | 14 | 5 | 65 | 30 |
| axe-core (default) | 18 | 16 | 2 | 60 | 16 |
| AccessLint | 18 | 18 | 0 | 22 | 1 |
| Google Lighthouse | 17 | 17 | 0 | 21 | 0 |
| **AccessBell** | 15 | 13 | 2 | 20 | 2 |
| Pa11y | 15 | 10 | 5 | 24 | 6 |
| Sa11y | 12 | 9 | 3 | 17 | 1 |
| W3C Nu Html Checker | 9 | 6 | 3 | 11 | 2 |

"Findings not about a planted barrier" are not all mistakes. Some were real problems we had not planted (several tools correctly noticed an `aria-label` on a plain `div` in our carousel), and many were repeats or general "check this" prompts. The clear false positives were Pa11y's: it reported three correctly labelled social icon links as missing [alt text](/blog/wcag-1-1-1-non-text-content).

### Barrier-by-barrier results

**✓** = flagged as a failure, **R** = flagged for manual review, **–** = missed.

| Barrier | WCAG | AccessBell | axe-core | Lighthouse | Pa11y | IBM | QualWeb | Alfa | Sa11y | Nu | AccessLint |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Page language not set | 3.1.1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | R | ✓ |
| Missing page title | 2.4.2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✓ | ✓ |
| Zoom disabled in viewport meta | 1.4.4 | ✓ | ✓ | ✓ | R | R | ✓ | ✓ | – | R | ✓ |
| No main landmark or skip link | 2.4.1 | – | ✓ | ✓ | – | ✓ | R | R | – | – | ✓ |
| Image with no alt attribute | 1.1.1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Alt text is a file name | 1.1.1 | – | – | – | – | R | R | R | ✓ | – | – |
| Informative size chart marked decorative (alt="") | 1.1.1 | – | – | – | R | – | – | – | R | – | – |
| Logo link has no accessible name | 2.4.4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Image of text with incomplete alt ("Sale") | 1.4.5 | – | – | – | – | – | R | – | – | – | – |
| Heading level skipped (h1 to h4) | 1.3.1 | – | ✓ | ✓ | R | – | R | ✓ | ✓ | ✓ | ✓ |
| Visual heading not marked up as a heading | 1.3.1 | – | – | – | – | R | – | – | – | – | – |
| Empty heading | 1.3.1 | – | ✓ | – | ✓ | R | ✓ | ✓ | ✓ | R | ✓ |
| Data table with no header cells | 1.3.1 | – | – | ✓ | – | ✓ | ✓ | – | ✓ | – | – |
| List item outside a list | 1.3.1 | ✓ | ✓ | ✓ | – | R | ✓ | – | – | ✓ | ✓ |
| Low-contrast text (2.3:1) | 1.4.3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✓ |
| White text over a light background image | 1.4.3 | R | R | – | R | R | R | R | R | – | – |
| Required fields shown by color alone | 1.4.1 | – | – | – | – | R | – | – | – | – | – |
| Instructions rely on shape, color and position | 1.3.3 | – | – | – | – | R | – | – | – | – | – |
| Icon-only button with no accessible name | 4.1.2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | – | ✓ |
| Ambiguous "Read more" links | 2.4.4 | – | – | – | – | – | R | R | ✓ | – | – |
| Touch targets under 24 x 24 px | 2.5.8 | ✓ | – | ✓ | – | – | – | ✓ | – | – | – |
| Misspelled ARIA role (role="buton") | 4.1.2 | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ | – | ✓ | ✓ |
| Focusable link hidden with aria-hidden | 4.1.2 | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ | – | – | ✓ |
| Email field with placeholder but no label | 1.3.1 | – | – | – | ✓ | R | ✓ | – | – | – | ✓ |
| Select menu with no label | 4.1.2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | – | ✓ |
| Name and email fields missing autocomplete | 1.3.5 | – | – | – | – | – | – | – | – | – | – |
| CAPTCHA is the only way to sign in | 3.3.8 | – | – | – | – | – | – | – | – | – | – |
| Clickable div not reachable by keyboard | 2.1.1 | – | – | – | R | ✓ | ✓ | – | – | – | – |
| Positive tabindex changes focus order | 2.4.3 | – | ✓ | ✓ | – | – | – | – | – | – | ✓ |
| Focus outline removed on all controls | 2.4.7 | – | – | – | – | R | R | R | – | – | – |
| Keyboard trap in the chat box | 2.1.2 | – | – | – | – | – | – | – | – | – | – |
| Auto-advancing carousel with no pause | 2.2.2 | – | – | – | – | – | – | – | – | – | – |
| Video with no captions | 1.2.2 | R | R | – | – | R | R | – | R | – | ✓ |
| Map iframe with no title | 4.1.2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | – | ✓ |
| Add-to-cart status not announced | 4.1.3 | – | – | – | – | – | – | – | – | – | – |
| **Total caught** | | **15** | **18** | **17** | **15** | **24** | **24** | **19** | **12** | **9** | **18** |

## What No Accessibility Checker Tool Caught

Five barriers slipped past all ten accessibility checker tools:

- **A keyboard trap.** Our chat box swallowed the Tab key, so keyboard users could not leave it ([WCAG 2.1.2](/resources/wcag/2-1-2-no-keyboard-trap)).
- **An [auto-advancing carousel](/blog/wcag-2-2-2-pause-stop-hide) with no pause button** ([WCAG 2.2.2](/resources/wcag/2-2-2-pause-stop-hide)).
- **A [CAPTCHA](/blog/wcag-3-3-8-accessible-authentication-minimum) as the only way to sign in**, a cognitive test with no alternative ([WCAG 3.3.8](/resources/wcag/3-3-8-accessible-authentication-minimum)).
- **An "added to cart" message that screen readers never announce** ([WCAG 4.1.3](/resources/wcag/4-1-3-status-messages)).
- **Name and email fields without autocomplete**, which makes forms harder for people with memory or motor disabilities ([WCAG 1.3.5](/resources/wcag/1-3-5-identify-input-purpose)).

Seven more only ever appeared as "please check" prompts, including required fields marked by color alone, instructions that rely on shape and position, and focus outlines removed from every control. These are exactly the issues that show up in real complaints, and they are why a [manual keyboard test](/blog/keyboard-accessibility-testing) is not optional. Our guide to [automated vs. manual accessibility testing](/blog/automated-vs-manual-accessibility-testing) explains how to split the work.

## 1. AccessBell (Our Pick for Most Teams)

**Caught 15 of 35.** 13 as failures, 2 for review. **20 findings, all of them real problems, and no false alarms.**

We will be straightforward: in raw detection, AccessBell finished in the middle of the pack. It runs the 70 axe-core rules mapped to WCAG 2.0, 2.1 and 2.2 at Levels A and AA, and it deliberately reports WCAG failures rather than best-practice advice. That is why it did not report the skipped heading level, the empty heading, the missing main landmark or the positive `tabindex`, which axe-core's best-practice rules did. Like axe-core, it also accepts placeholder text as a field's accessible name, so it passed our placeholder-only email field.

What it did well:

- **Zero noise.** Every one of its 20 findings pointed at a real problem. Only Lighthouse and AccessLint matched that record.
- **WCAG 2.2 touch targets are on.** AccessBell was one of only three tools to catch our 16-pixel social icons ([WCAG 2.5.8](/resources/wcag/2-5-8-target-size-minimum)). axe-core ships with that rule switched off by default, so the default axe run missed them.
- **It tests the rendered page.** Pages load in a real Chrome browser, so contrast, ARIA and JavaScript-rendered content are tested as visitors see them.

**Why it is still our recommendation.** The other nine are testing engines: you run them on one page, read the output, and run them again next time. AccessBell is the only tool here built to keep a whole site accessible over time. That includes:

- **Scheduled monitoring** of up to 25 URLs per domain, rescanned daily, with scan history and a count of issues resolved since the last scan.
- **A fix for every issue:** what is wrong, the failing HTML on each page, step-by-step instructions and a code example you can copy.
- **A manual review list** of items automation cannot decide, kept separate from failures.
- **WCAG 2.0, 2.1 or 2.2** at Level A, AA or AAA, and presets for the ADA, Section 508 and EN 301 549.
- **Exports** to CSV and PDF, team roles, and [simple pricing](/pricing): $79 per domain per month after a 3-day free trial, with a [free single-page scan](/#scan) and no account needed.

Everything we test for, and how, is on our [methodology page](/methodology).

## 2. axe-core (the axe DevTools Engine)

**Caught 18 of 35.** 16 as failures, 2 for review. 60 findings.

With its default settings, axe-core runs its best-practice rules as well as its WCAG rules, so it caught the heading-level skip, empty heading, missing landmarks and positive `tabindex`. The cost is volume: 14 of its 60 findings were the same "content should be in a landmark" message repeated on different elements. Its WCAG 2.2 target-size rule is off by default, so it missed our tiny icons.

## 3. Google Lighthouse

**Caught 17 of 35, all as failures.** 21 findings, none off-target.

Lighthouse runs a subset of axe-core checks, but its selection includes target size and table headers, so it caught two things the default axe run did not. It produces no "needs review" findings, so it never flagged the text over the background image or the missing video captions. It gave the page an accessibility score of 41.

## 4. Pa11y

**Caught 15 of 35.** 10 as failures, 5 for review. 24 findings.

Pa11y was one of only three tools to fail our placeholder-only email field as a definite error, and it prompted a check of the size chart marked as decorative. It missed the misspelled ARIA role, the focusable link inside `aria-hidden` and the small touch targets, and it reported three correctly labelled icon links as missing alt text, the only clear false positives in the test.

## 5. IBM Equal Access Checker

**Caught 24 of 35, tied for the most.** 13 as failures, 11 for review. 64 findings.

IBM was the only tool to prompt a check of our fake heading (bold text styled as a heading), our shape-and-position instructions and our color-only required fields. Many of its catches are review prompts, so expect to spend time triaging: 21 of its findings were not about any planted barrier.

## 6. QualWeb

**Caught 24 of 35, tied for the most.** 16 as failures, 8 for review. 110 findings.

QualWeb combines W3C ACT rules, WCAG techniques and best practices, and it was the only tool to question the incomplete alt text on our "Sale" banner. It also produced by far the most output: 110 findings, 52 of them not about a planted barrier.

## 7. Siteimprove Alfa

**Caught 19 of 35.** 14 as failures, 5 for review. 65 findings.

Alfa caught the small touch targets, the file-name alt text and the missing skip link, and flagged the ambiguous "Read more" links for review. It missed the table without headers and the list item outside a list.

## 8. Sa11y

**Caught 12 of 35.** 9 as failures, 3 for review. 17 findings.

Sa11y is built for content editors, and it shows. It was the only tool to fail our file-name alt text and our "Read more" links as definite errors. It does not test page titles, form labels or ARIA, so it missed everything in those categories.

## 9. W3C Nu Html Checker

**Caught 9 of 35.** 6 as failures, 3 for review. 11 findings.

The Nu checker is a markup validator, not an accessibility checker, and it scored like one. It caught invalid markup such as the misspelled role, the stray list item and the missing title, but nothing that depends on how the page renders, such as contrast.

## 10. AccessLint

**Caught 18 of 35, all as failures.** 22 findings, only one off-target.

AccessLint was the only tool to fail the video without captions outright, and one of three to fail the placeholder-only email field. It has no review category, so it never flagged anything that needed human judgment.

## How to Use Accessibility Checker Tools Together

No single tool caught more than 69% of our barriers, so a practical setup looks like this:

1. **Monitor continuously with one engine.** Use [AccessBell](/pricing) or another monitoring service so new failures are caught when pages change.
2. **Add a second engine for audits.** IBM Equal Access or QualWeb use different rule sets and caught several barriers the axe-based tools did not.
3. **Test by hand.** Use a keyboard, a screen reader and our [WCAG 2.2 checklist](/blog/wcag-2-2-checklist) for everything automation cannot judge.

For a broader buyer's view of paid checkers and overlays, see our comparison of the [best website accessibility checkers](/blog/website-accessibility-checkers), or start now with a [free scan of your own site](/#scan).

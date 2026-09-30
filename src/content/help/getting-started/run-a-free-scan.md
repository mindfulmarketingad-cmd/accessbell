---
title: 'Run a Free Accessibility Scan'
description: 'How to check any public web page for free with the AccessBell scanner, choose a WCAG standard, and what the free preview shows compared with Pro.'
order: 2
updatedDate: 2026-09-30
sources: ['axe-core', 'wai-evaluate']
---

The free scan checks a single public page against WCAG in under a minute and tells you how many issues it found and how severe they are. You do not need an account. To see each issue and how to fix it, subscribe to AccessBell Pro.

## Run a Scan

1. Go to the [AccessBell homepage](/#scan).
2. Type the address of the page you want to check, for example `example.com/pricing`. You can leave out `https://`.
3. Choose a standard from the menu:
   - **WCAG 2.2 AA**, the current version and the default
   - **WCAG 2.1 AA**
   - **ADA**, which uses WCAG 2.1 AA as the benchmark
   - **Section 508**, which uses WCAG 2.0 AA
   - **EN 301 549**, the European standard, which uses WCAG 2.1 AA

   Each standard also has its own page with the checker preset and a breakdown of what it tests: [WCAG 2.2 AA](/resources/wcag-2-2-aa-checker), [WCAG 2.1 AA](/resources/wcag-2-1-aa-checker), [ADA](/resources/ada-compliance-checker), [Section 508](/resources/section-508-checker) and [EN 301 549](/resources/en-301-549-checker).
4. Select **Check accessibility**.

The standard you choose decides which rules run. If you pick WCAG 2.1 AA, rules that only apply to WCAG 2.2 or to Level AAA are not run.

## What the Free Scan Shows

The free scan is a preview. When it finishes, you see:

- **How many issues** the page has against the standard you chose
- **How severe they are**: the number of critical, serious, moderate and minor issues

To see the issues themselves, subscribe to AccessBell Pro. In the dashboard, every issue shows what is wrong, the WCAG criterion it fails, where it is on the page, the failing code and how to fix it. You can also filter the report by WCAG version, level, principle, success criterion and severity. See [Filter reports by WCAG version and level](/resources/help-center/scans-and-reports/filter-reports-by-wcag-version).

Pro is $29 per domain per month after a 3-day free trial, or $199 per domain per year. [Start your free trial](/resources/help-center/getting-started/start-your-free-trial).

## Limits of the Free Scan

- One public page per scan. Pages behind a login need the Pro plan and [custom HTTP headers](/resources/help-center/domains/scan-staging-and-protected-sites).
- To keep the service fast for everyone, each network can run 5 free scans per minute and 30 per hour.
- The free scan does not save history. To track progress over time, [add the domain](/resources/help-center/getting-started/add-your-first-domain) to your dashboard.

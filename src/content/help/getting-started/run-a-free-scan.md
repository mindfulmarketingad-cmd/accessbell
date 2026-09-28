---
title: 'Run a Free Accessibility Scan'
description: 'How to check any public web page for free with the AccessBell scanner, choose a WCAG standard, and read and filter the report.'
order: 2
updatedDate: 2026-09-28
---

The free scan checks a single public page against WCAG and gives you a full report in under a minute. You do not need an account.

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

## Read the Report

The report starts with a score out of 100 and a summary, followed by three lists:

- **Issues to fix**, sorted from critical to minor. Each one shows what is wrong, the WCAG criterion it fails, how to fix it and the failing code.
- **Needs manual review**, for items automated testing could not decide.
- **Checks passed**.

## Filter the Report

Use the filters above the results to narrow the list without scanning again:

- **WCAG version** and **Level**, for example only WCAG 2.1 Level AA issues
- **Principle**: perceivable, operable, understandable or robust
- **Success criterion**, with a count for each
- **Severity**: critical, serious, moderate or minor

The summary line tells you how many issues match and, when it applies, how many more you would add by moving up a level. See [Filter reports by WCAG version and level](/resources/help-center/scans-and-reports/filter-reports-by-wcag-version).

## Limits of the Free Scan

- One public page per scan. Pages behind a login need the Lite plan and [custom HTTP headers](/resources/help-center/domains/scan-staging-and-protected-sites).
- To keep the service fast for everyone, each network can run 5 free scans per minute and 30 per hour.
- The free scan does not save history. To track progress over time, [add the domain](/resources/help-center/getting-started/add-your-first-domain) to your dashboard.

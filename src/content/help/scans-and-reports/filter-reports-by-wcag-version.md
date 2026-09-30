---
title: 'Filter Reports by WCAG Version and Level'
description: 'Narrow any AccessBell report to one WCAG version, conformance level, principle, success criterion or severity, and see what moving up a level would add.'
order: 5
updatedDate: 2026-09-28
sources: ['new-in-22', 'new-in-21']
---

Reports can be filtered after the scan, instantly, without running it again. This works in every report in the dashboard.

## The Filters

- **WCAG version**: 2.0, 2.1 or 2.2
- **Level**: A, AA or AAA
- **Principle**: perceivable, operable, understandable or robust
- **Success criterion**: only the criteria found in this report, with a count for each
- **Severity**: critical, serious, moderate and minor, as checkboxes

The filters start at the target the scan ran against. **Reset filters** returns to it.

## The Summary Line

Above the results, a line tells you what you are looking at, for example:

> Showing 3 of 4 issues for WCAG 2.1 Level AA. Moving to WCAG 2.2 Level AA adds 1 more.

This is useful when your goal is a specific target and no more. If you filter above what the scan tested, for example Level AAA on a Level AA scan, the line explains that those rules were not run and suggests a rescan with a higher target.

## Common Uses

- **"We only need WCAG 2.1 AA."** Choose 2.1 and AA to see exactly what stands between you and that target.
- **Hand one criterion to a developer.** Choose a success criterion, such as 1.4.3 Contrast, to see only those issues.
- **Fix the worst first.** Untick moderate and minor to focus on critical and serious issues.

To change what future scans test, change the WCAG version and level in the domain's [Settings](/resources/help-center/domains/scan-settings).

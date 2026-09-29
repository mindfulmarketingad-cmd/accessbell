---
title: 'Understanding the Domain Overview'
description: 'What each part of the AccessBell domain overview means: conformance status, score, active and resolved issues, scan history and coverage.'
order: 1
updatedDate: 2026-09-29
sources: ['understanding', 'wcag22']
---

The **Overview** tab is the first thing you see when you open a domain. It answers three questions: where does this domain stand, is it getting better, and which WCAG requirements are affected?

## Last Scan Overview

**Status** at the top left is one of:

- **Not conformant**: automated tests found at least one failure of a WCAG criterion in your target. This is a factual statement about the automated results, not a legal finding.
- **No automated failures**: nothing in your target failed. You still need a [manual review](/resources/help-center/scans-and-reports/manual-review-items) before you can claim conformance.
- **Not scanned yet**: select Scan now to start.

The **score ring** shows the average score of your monitored pages, out of 100. Green is 90 and above, amber is 60 to 89 and red is below 60. See [How the accessibility score works](/resources/help-center/scans-and-reports/how-the-score-works).

**Automated tests** lists:

| Item | Meaning |
| --- | --- |
| Active issues | Failing elements across the latest scan of every monitored page |
| Resolved since last scan | Elements that failed in each page's previous scan and pass now |
| Scanned pages | Monitored pages that have at least one completed scan |
| Last automated scan | When the most recent scan finished |
| Next scheduled scan | When daily monitoring runs next |

**Manual review** shows how many items automated tests flagged for a person to check. Select the headings to jump to the Issues or Manually Required tab.

## Scan History

A chart of the last 7, 30 or 90 days, with one point per day:

- **Score**, the average score of pages scanned that day
- **Open issues**, the failing elements found that day
- **Pages scanned**

Select a line's name to hide or show it. Move your pointer over the chart, or focus it and use the left and right arrow keys, to see the values for each day. See [Track progress with scan history](/resources/help-center/scans-and-reports/scan-history).

## Test Coverage by WCAG Principle

A table of every success criterion in your target, showing which have issues, which passed automated checks and which need manual testing. See [The WCAG coverage table](/resources/help-center/scans-and-reports/wcag-coverage-table).

## Component Grouping

At the bottom, AccessBell lists failing elements that appear on several pages, such as a header button. Fixing the shared component fixes every page at once. See [Component grouping](/resources/help-center/fixing-issues/component-grouping).

---
title: 'How the Accessibility Score Works'
description: 'How AccessBell calculates the score out of 100 for each page and each domain, what raises and lowers it, and why it is a trend line rather than a verdict.'
order: 2
updatedDate: 2026-09-28
sources: ['axe-rules', 'webaim-million']
---

Every scan gets a score from 0 to 100. It is a quick way to track progress. It is not a percentage of compliance and it is not a legal measure.

## How a Page Is Scored

Each page starts at 100. Every failing rule takes points away, based on how badly it blocks people and how many elements fail:

| Severity | Points for one failing element | Most points for one rule |
| --- | --- | --- |
| Critical | 10 | 20 |
| Serious | 7 | 14 |
| Moderate | 4 | 8 |
| Minor | 2 | 4 |

More failing elements for the same rule take away more points, but the penalty for one rule is capped at double. That way, one repeated issue cannot sink the whole score, and fixing the most severe rules raises it fastest. The score never goes below 0.

Items in Manually Required do not affect the score.

## How a Domain Is Scored

The domain score is the average of the latest scores of its monitored pages. When you scan on desktop and mobile, each page's most recent scan is used.

## Colors

- **Green**: 90 and above
- **Amber**: 60 to 89
- **Red**: below 60

## What the Score Does Not Tell You

A score of 100 means no automated rule failed. Some WCAG requirements can only be checked by a person, so a perfect score does not prove a page is accessible. Use the [coverage table](/resources/help-center/scans-and-reports/wcag-coverage-table) to see what still needs manual testing.

Scores also vary between tools, because each tool runs different rules and weighs them differently. See [Why results differ from other tools](/resources/help-center/troubleshooting/results-differ-from-other-tools).

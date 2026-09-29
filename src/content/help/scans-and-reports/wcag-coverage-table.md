---
title: 'The WCAG Coverage Table'
description: 'How to read the Test Coverage by WCAG Principle table: every success criterion in your target, with automated results and what needs manual testing.'
order: 3
updatedDate: 2026-09-29
sources: ['wcag22', 'understanding']
---

The **Test Coverage by WCAG Principle** table on a domain's Overview lists every success criterion in the WCAG version and level you chose in Settings. For WCAG 2.2 Level AA, that is 55 criteria.

## How It Is Organized

Criteria are grouped under the four WCAG principles: **Perceivable**, **Operable**, **Understandable** and **Robust**. Select a principle's name to collapse or expand its group. Each group shows how many criteria have issues.

Perceivable starts open. Each row shows:

- **WCAG principle**, such as Perceivable
- **Guideline**, the group the criterion belongs to, such as Text Alternatives or Navigable
- **Success criterion**, its number and name, such as 1.1.1 Non-text Content
- **Level**: A, AA or AAA

## Issues Column

| Status | Meaning |
| --- | --- |
| Issues | Automated rules found failing elements for this criterion. The number is how many. Select it to see the failing rules, then select a rule to open [its details](/resources/help-center/fixing-issues/read-an-issue). |
| Passed | Automated rules for this criterion ran and found nothing wrong. |
| Not tested | No automated rule produced a result for this criterion. Either no rule exists for it, or the content it applies to, such as video, was not found. |

## Manually Required Column

| Status | Meaning |
| --- | --- |
| Needs review (number) | Automated tests flagged items for a person to check. Select it to see the rules involved and open the elements to check. |
| Needs review | Automated tests could not check this criterion, so a person needs to test it. |
| Spot check | Automated rules cover part of this criterion. A quick manual check confirms the rest. |

## Useful Tools

- **Only criteria with issues** hides everything else, so you can see at a glance which requirements are failing.
- **Domain Settings** opens the Settings tab, where you can change the WCAG version and level.

## Why so Many Criteria Need Review

Many WCAG requirements depend on meaning and experience, for example whether captions are accurate or whether the focus order makes sense. No automated tool can judge those. The table makes the gap visible so you can plan manual testing. See [Plan manual testing](/resources/help-center/fixing-issues/plan-manual-testing).

---
title: 'Read an Issue and Decide What to Fix First'
description: 'What each part of an AccessBell issue means, from severity and WCAG criteria to failing elements and correct markup, and how to prioritize your fixes.'
order: 1
updatedDate: 2026-09-29
sources: ['understanding', 'axe-rules']
---

The **Issues** tab on a domain lists every rule that failed across your monitored pages, most severe first. Select an issue to open it.

## The Issue Header

- **Severity**: how badly the problem blocks people.
  - **Critical**: blocks a task completely, such as a form field with no label.
  - **Serious**: makes a task very hard.
  - **Moderate**: causes friction.
  - **Minor**: an annoyance.
- **WCAG criteria**: the success criteria the rule relates to, with their level, for example WCAG 1.1.1 (A). "Best practice" means the rule is recommended but not required by WCAG.
- **The number**: how many elements fail across all monitored pages.

Use the **Severity** menu at the top of the tab to show one severity at a time.

## Inside an Issue

**1. What is wrong** explains the rule in plain language.

**2. Where it happens** shows how many elements and pages are affected, with examples of the failing code and the page each one is on. Search your code for the class names or text in these snippets to find the source.

**3. How to solve it** gives step-by-step instructions. For the most common issues, you also get **Correct markup solutions**: working code examples with line numbers and a **Copy** button. Below them, **For your page** gives the specific fix for what was found on your site.

A link at the bottom opens detailed guidance for the rule, and **View every failed element and fixes** opens the issue's own page.

## The Issue Details Page

Open it from an issue, from a **Manually Required** item, or from the coverage table on the Overview: select a criterion's **issues** or **Needs review** status to see the rules behind it, then select a rule.

It has three tabs:

- **Issue Overview**: summary cards for pages affected, failed elements, the issue's share of all issues, severity, who is most affected (for example, blind and screen reader users or people with low vision) and the WCAG success criteria, with links to our guide for each criterion. Below them, **What does this mean?** and **How to solve it**, with **Correct markup solutions** and **Incorrect markup solutions** you can copy.
- **Failed Elements**: every failing element from the latest scan of each page (up to 25 per rule per page), grouped by page and device, with its HTML, its CSS selector and what to fix. For missing alt text, button and link names and the page language, you can type the fix under an element and apply it with [AccessBellFix](/resources/help-center/getting-started/install-accessbellfix).
- **Fixed Elements**: pages where this issue failed in the previous scan and passes in the latest one.

## What to Fix First

1. **Critical and serious issues on your key pages**: forms, checkout, sign-in and navigation.
2. **Issues on many pages**: these usually come from a shared template. See [Component grouping](/resources/help-center/fixing-issues/component-grouping).
3. **Everything else**, starting with the highest counts.

After you deploy a fix, select **Scan now** to confirm it. The Overview's **Resolved since last scan** counts what you fixed.

---
title: 'Read an Issue and Decide What to Fix First'
description: 'What each part of an AccessBell issue means, from severity and WCAG criteria to failing elements and correct markup, and how to prioritize your fixes.'
order: 1
updatedDate: 2026-09-28
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

A link at the bottom opens detailed guidance for the rule.

## What to Fix First

1. **Critical and serious issues on your key pages**: forms, checkout, sign-in and navigation.
2. **Issues on many pages**: these usually come from a shared template. See [Component grouping](/resources/help-center/fixing-issues/component-grouping).
3. **Everything else**, starting with the highest counts.

After you deploy a fix, select **Re-Scan** to confirm it. The Overview's **Resolved since last scan** counts what you fixed.

---
title: 'WCAG 2.2 Checklist: What Changed and How to Test Each Criterion'
seoTitle: 'WCAG 2.2 Checklist: Changes and How to Test'
description: 'A practical WCAG 2.2 AA checklist: the nine new success criteria, the one that was removed, and how to test your website against each requirement.'
pubDate: 2026-09-18
category: 'Standards'
contributors:
  - author: accessbell-editorial-team
    role: Author
related: ['what-you-should-know-about-wcag-2-2', 'what-is-a-website-accessibility-checker', 'ada-website-compliance-guide']
---

The Web Content Accessibility Guidelines (WCAG) 2.2 became a [W3C Recommendation](https://www.w3.org/TR/WCAG22/) on October 5, 2023. It is backward compatible with WCAG 2.1: if your site meets 2.2, it also meets 2.1 and 2.0 at the same level. Most organizations target **Level AA**, which is the level referenced by the majority of laws and procurement policies.

This checklist focuses on what changed in 2.2, then gives you a condensed AA checklist you can work through page by page.

## What Is New in WCAG 2.2

WCAG 2.2 added nine success criteria, summarized by the W3C in [What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/). Six of them apply at Level A or AA.

| Criterion | Level | What it requires |
| --- | --- | --- |
| 2.4.11 Focus Not Obscured (Minimum) | AA | A focused element is not entirely hidden by author-created content such as sticky headers or cookie banners. |
| 2.4.12 Focus Not Obscured (Enhanced) | AAA | No part of the focused element is hidden. |
| 2.4.13 Focus Appearance | AAA | Focus indicators meet minimum size and contrast. |
| 2.5.7 Dragging Movements | AA | Anything done by dragging can also be done with a single pointer without dragging. |
| 2.5.8 Target Size (Minimum) | AA | Pointer targets are at least 24 by 24 CSS pixels, or have enough spacing, with some exceptions. |
| 3.2.6 Consistent Help | A | Help mechanisms, such as contact details or a chat link, appear in the same relative order across pages. |
| 3.3.7 Redundant Entry | A | Information a user already entered in a process is auto-filled or available to select. |
| 3.3.8 Accessible Authentication (Minimum) | AA | Logging in does not require a cognitive function test, such as remembering a password or solving a puzzle, unless an alternative or assistance is provided. |
| 3.3.9 Accessible Authentication (Enhanced) | AAA | Stricter version of 3.3.8 with fewer exceptions. |

### What Was Removed

Success criterion **4.1.1 Parsing** is obsolete in WCAG 2.2. Modern browsers and assistive technologies handle markup errors consistently, so duplicate attributes and unclosed tags no longer need to be reported as accessibility failures on their own. Problems they cause, such as a broken accessible name, are still caught by other criteria.

## How to Test the New AA Criteria

**Focus Not Obscured (2.4.11).** Tab through the page with a sticky header, a cookie banner and any chat widget visible. Every focused element must remain at least partially visible. A common fix is adding `scroll-padding-top` equal to the header height.

**Dragging Movements (2.5.7).** Find sliders, sortable lists, maps and kanban boards. Each needs an alternative that works with single clicks or taps, such as up and down buttons or a menu.

**Target Size (2.5.8).** Measure small icon buttons, pagination links and close buttons. Targets smaller than 24 by 24 CSS pixels pass only if a 24 pixel circle centered on each target does not overlap another target, or if an exception applies, such as links inside a sentence.

**Accessible Authentication (3.3.8).** Confirm your login allows password managers to fill fields and allows pasting. Avoid puzzles as the only verification method. Email magic links and passkeys are accessible alternatives.

## Condensed WCAG 2.2 AA Checklist

Use this as a working list. The criteria numbers help you cross-reference the full specification and our [WCAG 2.2 AA checker](/resources/wcag-2-2-aa-checker) reports. To record results issue by issue, use our free [WCAG 2 AA checklist spreadsheet](/blog/wcag-2-aa-checklist).

### Perceivable

- **1.1.1** Every meaningful image, icon and image button has a text alternative. Decorative images use an empty alt.
- **1.2.2 and 1.2.4** Prerecorded video has captions. Live video has captions.
- **1.2.5** Prerecorded video has audio description where visual information is not conveyed in the audio.
- **1.3.1** Headings, lists, tables and form labels are coded, not just styled.
- **1.3.5** Personal-data form fields use the correct `autocomplete` values.
- **1.4.3** Text contrast is at least 4.5:1, or 3:1 for large text.
- **1.4.4 and 1.4.10** Content works at 200 percent text size and reflows at 320 CSS pixels wide without horizontal scrolling.
- **1.4.11** Interface components and meaningful graphics have at least 3:1 contrast.
- **1.4.13** Tooltips and popovers that appear on hover or focus can be dismissed and stay visible while hovered.

### Operable

- **2.1.1 and 2.1.2** Everything works with a keyboard, and focus never gets trapped.
- **2.2.2** Moving, blinking or auto-updating content can be paused.
- **2.4.1** A skip link or landmarks let users bypass repeated navigation.
- **2.4.2** Every page has a descriptive title.
- **2.4.3 and 2.4.7** Focus order is logical and focus is always visible.
- **2.4.4** Link purpose is clear from the link text or its context.
- **2.4.11** Focus is not hidden behind sticky content.
- **2.5.7 and 2.5.8** Dragging has an alternative and targets meet minimum size.

### Understandable

- **3.1.1** The page language is set.
- **3.2.6** Help is in a consistent location.
- **3.3.1 and 3.3.3** Errors are identified in text with suggestions to fix them.
- **3.3.2** Inputs have visible labels or instructions.
- **3.3.7 and 3.3.8** No redundant entry, and login avoids memory tests.

### Robust

- **4.1.2** Custom controls expose a name, role and state to assistive technology.
- **4.1.3** Status messages, such as "Added to cart", are announced without moving focus.

## Which Criteria Can Be Tested Automatically

A checker can reliably detect many failures under 1.1.1, 1.3.1, 1.4.3, 2.4.2, 3.1.1 and 4.1.2. Criteria like 2.4.3 focus order, 1.2.2 caption accuracy and 3.3.3 error suggestions require human judgment. The [WCAG 2.2 AA checker page](/resources/wcag-2-2-aa-checker#coverage) lists every criterion and whether automated rules cover it. Our guide to [automated vs manual accessibility testing](/blog/automated-vs-manual-accessibility-testing) explains how to split the work.

## Keep Your Checklist Current

A checklist is only useful if you run it more than once. Every new template, plugin or marketing page is a chance for regressions. Scheduled scans catch the automated failures, and a short manual pass on new templates catches the rest. See how [continuous monitoring plans](/pricing) keep your whole domain checked against WCAG 2.2 AA.

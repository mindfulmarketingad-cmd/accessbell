---
title: 'WCAG 2 AA Checklist'
seoTitle: 'WCAG 2 AA Checklist: Free Testing Spreadsheet'
description: 'A free WCAG 2 AA checklist spreadsheet for testing and recording issues, plus all 55 WCAG 2.2 Level A and AA success criteria and how to test each one.'
pubDate: 2026-09-28
category: 'Guides'
contributors:
  - author: accessbell-editorial-team
    role: Author
history:
  - date: 2026-09-28
    note: 'First published. Criteria list checked against the W3C WCAG 2.2 Recommendation.'
related: ['what-you-should-know-about-wcag-2-2', 'wcag-2-2-checklist', 'automated-vs-manual-accessibility-testing']
faqs:
  - q: 'What is a WCAG 2 AA checklist?'
    a: 'A list of every WCAG success criterion at Level A and AA, broken into specific checks you can test and mark as passed or failed. It turns the guidelines into a repeatable testing routine and a record of what you found.'
  - q: 'Does the checklist cover WCAG 2.0 and 2.1 as well as 2.2?'
    a: 'Yes. WCAG 2.2 includes nearly every WCAG 2.0 and 2.1 requirement, so a WCAG 2.2 AA checklist covers all three. If you only need 2.0 AA or 2.1 AA, use the "Added in" column in the table on this page to skip the newer criteria.'
  - q: 'Can I use the checklist instead of an automated tool?'
    a: 'Use both. An automated checker finds code-level failures across many pages in seconds, and the checklist guides the manual testing no tool can do. Start with a [free automated scan](/resources/wcag-2-2-aa-checker), then work through the checklist.'
  - q: 'How long does a full WCAG 2 AA review take?'
    a: 'It depends on the size of the site. Most teams review a set of representative pages and key user journeys rather than every page. Allow a few hours per template or journey for a careful manual review, less once you are familiar with the checks.'
  - q: 'Is the checklist free to use?'
    a: 'Yes. Make your own copy of the spreadsheet in Google Sheets and use it for as many reviews as you like.'
---

A **WCAG 2 AA checklist** turns the Web Content Accessibility Guidelines into a testing routine you can follow page by page and a record of every issue you find. AccessBell offers a free copy of a detailed WCAG 2.2 Level A and AA checklist as a Google Sheets spreadsheet. It lists every success criterion, broken down into specific checks that help you confirm each part of a requirement is met.

**[Make your own copy of the free WCAG 2 AA checklist (Google Sheets)](https://docs.google.com/spreadsheets/d/1d04nfqE9oC1psVWwv3RGagCTxGMmPl0a35zK2-NNYRE/copy)**

The checklist is based on the free WCAG 2.2 checklist originally published by Cornell University's Custom Development team, one of the most thorough public checklists available. This guide explains what is in it, how to use it, and which checks automated testing can do for you.

## What Is in the Checklist

The spreadsheet has three tabs.

**Checklist** is where the testing happens. Each row is one specific check, grouped into categories such as Images, Forms and Inputs, and Content, and mapped to its WCAG success criterion and level. For example, WCAG 1.1.1 Non-text Content is split into separate checks for informative images, decorative images, functional images, complex images such as charts, and CAPTCHAs. For every check you record:

- A result: **Pass**, **Warning**, **Fail** or **N/A**
- The element that caused the issue
- What you observed
- How you tested it
- Your recommendation for fixing it
- A link to a screenshot
- The impact on users

**Scope** is where you plan the review before you start: the critical and secondary user tasks you will test, and the screens or pages involved, with their URLs, notes and an estimate of the time each will take.

**README** explains how to fill in the checklist.

## What WCAG 2 AA Means

"WCAG 2" covers three versions of the guidelines, and each one builds on the last:

| Version | Published | Level A and AA criteria | Commonly required by |
| --- | --- | --- | --- |
| WCAG 2.0 | December 2008 | 38 | Section 508, Ontario's AODA |
| WCAG 2.1 | June 2018 | 50 | ADA Title II rule, EN 301 549, most ADA settlements |
| WCAG 2.2 | October 2023 | 55 | UK public sector monitoring; the current W3C recommendation |

Level AA includes every Level A requirement plus the Level AA ones. It is the level almost every law and policy asks for. Because WCAG 2.2 is backwards compatible, content that meets WCAG 2.2 AA also meets 2.1 AA and 2.0 AA, which is why the checklist is built on WCAG 2.2.

Not sure which version applies to you? Our [WCAG version comparison](/#versions-title) and the [ADA website compliance guide](/blog/ada-website-compliance-guide) explain which laws use which version.

## How to Use the Checklist

1. **Make a copy.** Open the link above and select **Make a copy**. Rename it with the site and date.
2. **Define your scope.** On the Scope tab, list the tasks people must be able to complete, such as signing up, searching or checking out, and the pages and templates involved. Testing one example of each template is usually enough to find issues that repeat across the site.
3. **Run an automated scan first.** A [free WCAG 2.2 AA scan](/resources/wcag-2-2-aa-checker) finds the code-level failures in seconds, such as missing alternative text, unlabeled fields and low contrast. Record them in the checklist so the manual review can focus on what tools cannot judge.
4. **Work through each check.** Test with a keyboard, a screen reader and browser zoom where the check calls for it. Our [manual testing guide](/resources/help-center/fixing-issues/plan-manual-testing) walks through a simple routine.
5. **Record one issue per row.** If a check fails in more than one way, duplicate the row and describe each issue separately. That keeps every issue traceable to a fix.
6. **Choose the right result.**
   - **Pass**: the requirement is met.
   - **Fail**: the requirement is not met, or the issue blocks or seriously hinders someone.
   - **Warning**: it technically passes WCAG but still causes a problem for users.
   - **N/A**: it does not apply, for example media checks on a site with no video or audio.
7. **Prioritize by user impact.** Fix the failures that block key tasks first, then the rest.
8. **Retest and keep the record.** After fixes ship, retest the failed rows and keep the dated checklist as evidence of your work.

## All WCAG 2.2 Level A and AA Success Criteria

These are the 55 success criteria the checklist covers, grouped by the four WCAG principles. "Added in" tells you which version introduced each one, so you can skip the newer criteria if you only need WCAG 2.0 AA or 2.1 AA. "Automated testing" shows whether automated rules can test part of the criterion. Even then, a person should confirm the result.

### Perceivable

| Success criterion | Level | Added in | Automated testing |
| --- | --- | --- | --- |
| 1.1.1 Non-text Content | A | WCAG 2.0 | Partly automated |
| 1.2.1 Audio-only and Video-only (Prerecorded) | A | WCAG 2.0 | Manual only |
| 1.2.2 Captions (Prerecorded) | A | WCAG 2.0 | Partly automated |
| 1.2.3 Audio Description or Media Alternative (Prerecorded) | A | WCAG 2.0 | Manual only |
| 1.2.4 Captions (Live) | AA | WCAG 2.0 | Manual only |
| 1.2.5 Audio Description (Prerecorded) | AA | WCAG 2.0 | Manual only |
| 1.3.1 Info and Relationships | A | WCAG 2.0 | Partly automated |
| [1.3.2 Meaningful Sequence](/blog/wcag-1-3-2-meaningful-sequence) | A | WCAG 2.0 | Manual only |
| 1.3.3 Sensory Characteristics | A | WCAG 2.0 | Manual only |
| 1.3.4 Orientation | AA | WCAG 2.1 | Manual only |
| 1.3.5 Identify Input Purpose | AA | WCAG 2.1 | Partly automated |
| 1.4.1 Use of Color | A | WCAG 2.0 | Partly automated |
| 1.4.2 Audio Control | A | WCAG 2.0 | Partly automated |
| 1.4.3 Contrast (Minimum) | AA | WCAG 2.0 | Partly automated |
| 1.4.4 Resize Text | AA | WCAG 2.0 | Partly automated |
| 1.4.5 Images of Text | AA | WCAG 2.0 | Manual only |
| 1.4.10 Reflow | AA | WCAG 2.1 | Manual only |
| 1.4.11 Non-text Contrast | AA | WCAG 2.1 | Manual only |
| 1.4.12 Text Spacing | AA | WCAG 2.1 | Partly automated |
| 1.4.13 Content on Hover or Focus | AA | WCAG 2.1 | Manual only |

### Operable

| Success criterion | Level | Added in | Automated testing |
| --- | --- | --- | --- |
| 2.1.1 Keyboard | A | WCAG 2.0 | Partly automated |
| 2.1.2 No Keyboard Trap | A | WCAG 2.0 | Manual only |
| 2.1.4 Character Key Shortcuts | A | WCAG 2.1 | Manual only |
| 2.2.1 Timing Adjustable | A | WCAG 2.0 | Partly automated |
| 2.2.2 Pause, Stop, Hide | A | WCAG 2.0 | Partly automated |
| 2.3.1 Three Flashes or Below Threshold | A | WCAG 2.0 | Manual only |
| 2.4.1 Bypass Blocks | A | WCAG 2.0 | Partly automated |
| 2.4.2 Page Titled | A | WCAG 2.0 | Partly automated |
| 2.4.3 Focus Order | A | WCAG 2.0 | Manual only |
| 2.4.4 Link Purpose (In Context) | A | WCAG 2.0 | Partly automated |
| 2.4.5 Multiple Ways | AA | WCAG 2.0 | Manual only |
| 2.4.6 Headings and Labels | AA | WCAG 2.0 | Manual only |
| 2.4.7 Focus Visible | AA | WCAG 2.0 | Manual only |
| 2.4.11 Focus Not Obscured (Minimum) | AA | WCAG 2.2 | Manual only |
| 2.5.1 Pointer Gestures | A | WCAG 2.1 | Manual only |
| 2.5.2 Pointer Cancellation | A | WCAG 2.1 | Manual only |
| 2.5.3 Label in Name | A | WCAG 2.1 | Manual only |
| 2.5.4 Motion Actuation | A | WCAG 2.1 | Manual only |
| 2.5.7 Dragging Movements | AA | WCAG 2.2 | Manual only |
| 2.5.8 Target Size (Minimum) | AA | WCAG 2.2 | Partly automated |

### Understandable

| Success criterion | Level | Added in | Automated testing |
| --- | --- | --- | --- |
| 3.1.1 Language of Page | A | WCAG 2.0 | Partly automated |
| 3.1.2 Language of Parts | AA | WCAG 2.0 | Partly automated |
| 3.2.1 On Focus | A | WCAG 2.0 | Manual only |
| 3.2.2 On Input | A | WCAG 2.0 | Manual only |
| 3.2.3 Consistent Navigation | AA | WCAG 2.0 | Manual only |
| 3.2.4 Consistent Identification | AA | WCAG 2.0 | Manual only |
| 3.2.6 Consistent Help | A | WCAG 2.2 | Manual only |
| 3.3.1 Error Identification | A | WCAG 2.0 | Manual only |
| 3.3.2 Labels or Instructions | A | WCAG 2.0 | Partly automated |
| 3.3.3 Error Suggestion | AA | WCAG 2.0 | Manual only |
| 3.3.4 Error Prevention (Legal, Financial, Data) | AA | WCAG 2.0 | Manual only |
| 3.3.7 Redundant Entry | A | WCAG 2.2 | Manual only |
| 3.3.8 Accessible Authentication (Minimum) | AA | WCAG 2.2 | Manual only |

### Robust

| Success criterion | Level | Added in | Automated testing |
| --- | --- | --- | --- |
| 4.1.2 Name, Role, Value | A | WCAG 2.0 | Partly automated |
| 4.1.3 Status Messages | AA | WCAG 2.1 | Manual only |

Criterion 4.1.1 Parsing appears in WCAG 2.0 and 2.1 but was removed in WCAG 2.2, so it is not listed. For a plain-language explanation of each criterion, see our [WCAG 2.2 checklist](/blog/wcag-2-2-checklist).

## Where Automated Testing Fits

Automated rules can test part of about 20 of the 55 criteria above, and they do it across every page in seconds. They cannot judge whether alternative text is meaningful, whether the focus order makes sense or whether error messages are helpful. That is the job of the checklist.

A practical split:

- **Automated**: run a free scan against the standard you need, such as the [WCAG 2.1 AA checker](/resources/wcag-2-1-aa-checker), the [ADA compliance checker](/resources/ada-compliance-checker), the [Section 508 checker](/resources/section-508-checker) or the [EN 301 549 checker](/resources/en-301-549-checker).
- **Manual**: use the checklist on your key templates and journeys.
- **Ongoing**: monitor your important pages so new issues are caught as content changes. [AccessBell Lite](/pricing) rescans up to 25 URLs per domain every day.

Read more in [automated vs manual accessibility testing](/blog/automated-vs-manual-accessibility-testing).

## Common Mistakes When Using a Checklist

- **Testing only the homepage.** Barriers usually live in forms, checkout and account pages.
- **Marking a whole criterion as passed after one check.** Many criteria have several parts, which is why the checklist splits them into separate rows.
- **Skipping the keyboard and screen reader.** Many checks cannot be judged by looking at the page.
- **Treating the checklist as a one-time task.** Websites change every week. Repeat the review after major releases and redesigns.

## After the Review

Share the filled-in checklist with the people who will fix the issues, starting with the failures. When you are done, publish an accessibility statement that explains your target standard and how people can report barriers. Our free [accessibility statement generator](/resources/statement-generator) creates one in a minute.

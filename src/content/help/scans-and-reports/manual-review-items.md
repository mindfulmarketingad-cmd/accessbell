---
title: 'Manually Required Items'
description: 'What the Manually Required tab in AccessBell contains, why automated testing cannot decide these items, and how to check and act on them.'
order: 6
updatedDate: 2026-09-29
sources: ['understanding', 'wai-evaluate']
---

Some checks need human judgment. When automated testing finds something it cannot decide, it does not guess. It lists the item under **Manually Required** so a person can check it.

## Where to Find Them

- The **Manually Required** tab on a domain lists every item across your monitored pages, with the WCAG criteria it relates to and how many elements and pages are involved.
- Each page report has a **Needs manual review** section.
- The Overview's **Manual review** line shows the total.

## Common Examples

- **Contrast over images or gradients.** The tool cannot measure text contrast when the background is an image.
- **Video captions.** A video exists, but only a person can confirm captions are present and accurate.
- **Elements hidden or covered.** Content that is partly off screen or overlapped.

## How to Review an Item

1. Select **How to review** to open detailed guidance for that check.
2. Look at the element on the page, ideally with the tools you would use for manual testing: a keyboard, a screen reader, or our [color contrast checker](/tools/contrast-checker).
3. If it fails, fix it like any other issue. If it passes, no action is needed.

Manual review items do not lower your score and are not counted as issues. They are still part of WCAG, so do not skip them. See [Plan manual testing](/resources/help-center/fixing-issues/plan-manual-testing).

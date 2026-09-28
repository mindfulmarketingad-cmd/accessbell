---
title: 'Plan Manual Testing'
description: 'What automated scans cannot check, and a simple manual testing routine with a keyboard, a screen reader and browser zoom to cover the rest of WCAG.'
order: 4
updatedDate: 2026-09-28
---

Automated testing finds a meaningful share of WCAG issues, and it finds them fast. It cannot judge meaning or experience. A short manual routine on your most important pages covers much of the rest.

## Use the Coverage Table as Your Checklist

On a domain's Overview, the [coverage table](/resources/help-center/scans-and-reports/wcag-coverage-table) marks criteria as **Manual test** or **Spot check**. Those are the ones to test by hand. Leave **Only criteria with issues** unticked so every criterion is listed.

## A 20-Minute Routine per Key Page

**Keyboard (about 5 minutes)**

1. Put your mouse aside and press Tab from the top of the page.
2. Can you reach every link, button and form field?
3. Can you always see where focus is?
4. Does the order make sense?
5. Can you open and close menus and dialogs, and escape from them?

**Screen reader (about 10 minutes)**

Use NVDA on Windows (free), VoiceOver on Mac, iPhone and iPad (built in), or TalkBack on Android (built in). Complete one real task, such as signing up or buying something. Listen for:

- Unclear link or button names
- Images described poorly
- Form errors that are not announced

**Zoom and reflow (about 5 minutes)**

1. Zoom the browser to 200 percent. Text should grow and nothing should be cut off.
2. Zoom to 400 percent. Content should reflow into one column without scrolling sideways.

## Record What You Find

Fix problems like any other issue. Keep notes of what you tested and when, alongside your [exported reports](/resources/help-center/scans-and-reports/export-reports), as evidence of your work.

For more on splitting the work, read [automated vs manual accessibility testing](/blog/automated-vs-manual-accessibility-testing).

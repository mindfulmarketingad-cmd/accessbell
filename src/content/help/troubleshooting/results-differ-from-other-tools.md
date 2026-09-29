---
title: 'Why Results Differ From Other Tools'
description: 'Why AccessBell, WAVE, Lighthouse and other accessibility checkers report different issues and scores for the same page, and which results to trust.'
order: 3
updatedDate: 2026-09-28
sources: ['axe-rules', 'wave']
---

It is normal for accessibility tools to disagree. That does not mean one of them is wrong.

## Different Rules

Each tool runs its own set of checks. AccessBell uses the open-source axe-core engine, which is designed to avoid false positives: when it reports a failure, it is almost always real. Tools such as WAVE use their own rules and flag more possible problems for review.

## Different Targets

AccessBell only runs the rules in the WCAG version and level you choose. If another tool tests WCAG 2.2 AAA and you chose 2.1 AA, the other tool reports more. Check your [scan settings](/resources/help-center/domains/scan-settings).

## Different Moments and Devices

AccessBell tests the fully loaded page in a real browser, on desktop, mobile or both. A tool that reads the page source before scripts run, or tests a different screen size, sees a different page. Cookie banners, pop-ups and content that loads on scroll also change results.

## Different Scores

Every tool calculates its score differently. Lighthouse weights its checks one way, AccessBell another. Compare the issues, not the numbers. See [How the accessibility score works](/resources/help-center/scans-and-reports/how-the-score-works).

## What to Do

Treat every real failure as worth fixing, whichever tool found it. For a side-by-side look at popular tools, read [Free tools to check website accessibility](/blog/free-tools-to-check-website-accessibility).

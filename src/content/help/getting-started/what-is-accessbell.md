---
title: 'What Is AccessBell?'
description: 'A plain-English introduction to AccessBell: what it checks, how scans work, what the free scan and the Lite plan include, and what it cannot do.'
order: 1
updatedDate: 2026-09-28
---

AccessBell is a website accessibility checker. It loads your pages in a real browser, tests them against the Web Content Accessibility Guidelines (WCAG), and tells you what is blocking people with disabilities, where it happens and how to fix it.

## Two Ways to Use AccessBell

**The free scan** checks one public page at a time from the [homepage](/#scan). There is nothing to install and no account needed. It is the quickest way to see where a page stands.

**AccessBell Lite** is the paid plan for ongoing work. For $79 per domain per month you get:

- Up to 25 monitored URLs per domain, with unlimited rescans
- A dashboard for every domain you manage, with scores, history and a WCAG coverage table
- Scheduled daily scans and email alerts when new serious issues appear
- Scan settings for WCAG version and level, desktop and mobile, staging sites and more
- Team members with roles
- Exports for spreadsheets and printable reports

Every new subscription starts with a 3-day free trial. See [Start your free trial](/resources/help-center/getting-started/start-your-free-trial).

## How a Scan Works

1. AccessBell opens the page in a real Chromium browser, the same engine as Google Chrome.
2. It waits for the page to load, and optionally scrolls and waits longer for late content.
3. It runs the open-source axe-core accessibility engine against the fully rendered page.
4. Each result is mapped to the WCAG success criterion it relates to and ranked by how badly it blocks people.

The result is a list of issues with the failing code, a list of checks that passed, and a list of items a person should review.

## What AccessBell Cannot Do

No automated tool can confirm that a website is fully accessible. Automated rules reliably find code-level problems such as missing alternative text, unlabeled form fields and low contrast. Other requirements, such as whether alt text is meaningful or whether keyboard focus moves in a sensible order, need a person to judge.

AccessBell makes this clear in every report: items it cannot decide appear under **Manual Review**, and the coverage table shows which WCAG criteria automated tests cover. AccessBell does not add an overlay or widget to your site, and it does not change your code.

## Next Steps

- [Create your account](/resources/help-center/getting-started/create-your-account)
- [Run a free scan](/resources/help-center/getting-started/run-a-free-scan)
- [Add your first domain](/resources/help-center/getting-started/add-your-first-domain)

---
title: 'What You Should Know About WCAG 2.2'
seoTitle: 'What You Should Know About WCAG 2.2'
description: "Here's what you should know about WCAG 2.2: the nine new success criteria, what changed since WCAG 2.1, whether you must conform, and how to test your site."
pubDate: 2026-09-29
category: 'Standards'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-09-29
    note: 'First published. Criteria, dates and legal references checked against the W3C WCAG 2.2 Recommendation and each cited regulation''s own text, as of September 2026.'
related: ['wcag-2-2-checklist', 'wcag-2-aa-checklist', 'ada-website-compliance-guide']
faqs:
  - q: 'What is WCAG 2.2?'
    a: 'WCAG 2.2 is the latest version of the Web Content Accessibility Guidelines, published by the W3C. It builds on WCAG 2.1 by adding nine new success criteria focused on focus visibility, touch target size, dragging alternatives, consistent help, and easier authentication.'
  - q: "What's the difference between WCAG 2.2 and WCAG 2.1?"
    a: 'WCAG 2.2 keeps everything in WCAG 2.1 and WCAG 2.0, so meeting 2.2 automatically means meeting the earlier versions at the same level. It adds nine new success criteria and removes one, 4.1.1 Parsing, which is now considered obsolete.'
  - q: 'Do I need to conform to WCAG 2.2 right now?'
    a: 'Most laws, including how U.S. courts currently apply the ADA, still reference WCAG 2.0 or 2.1 at Level AA. WCAG 2.2 is not yet the universal legal baseline, but it is the current, most complete version of the guidelines, and the UK''s public sector accessibility regulations already require it. Conforming now avoids a second remediation pass later.'
  - q: 'What are the most important new criteria to know?'
    a: 'For most sites, the highest-impact additions are 2.4.11 Focus Not Obscured (sticky headers and cookie banners cannot hide the keyboard focus indicator), 2.5.8 Target Size (small tap targets need enough size or spacing), and 3.3.8 Accessible Authentication (logins cannot rely only on memory or puzzles).'
  - q: 'How do I test a site against WCAG 2.2?'
    a: 'Pair automated scanning, which reliably catches issues like missing alt text, poor contrast and missing form labels, with manual testing for things a script cannot judge, such as focus order, caption accuracy or whether alt text is actually meaningful. Start with a free automated scan, then work through the criteria a tool cannot check.'
  - q: 'Does conforming to WCAG 2.2 guarantee legal compliance?'
    a: 'No. Conformance is strong evidence of a good-faith accessibility effort, but no automated or manual review can guarantee legal compliance, and laws vary by jurisdiction. This article is educational, not legal advice; talk to a qualified attorney about your specific obligations.'
---

If you are only going to read one section of this guide, make it this: WCAG 2.2 does not replace WCAG 2.1, it adds nine new success criteria on top of it, drops one that had become obsolete, and is quickly becoming the version most worth building toward. Here is what you should know about WCAG 2.2 before you start.

This guide is written for website owners, not lawyers. Technical terms are explained in plain language, and anything touching on legal requirements is simplified deliberately. It is educational content, not legal advice, and should not be relied on in litigation.

## Quick Facts

- WCAG 2.2 became an official [W3C Recommendation on October 5, 2023](https://www.w3.org/TR/WCAG22/), the fourth version of WCAG since the first was published in 1999.
- It adds nine new success criteria and removes exactly one from WCAG 2.1: 4.1.1 Parsing.
- WCAG 2.2 is fully backward compatible: a page that meets WCAG 2.2 at a given level also meets WCAG 2.1 and WCAG 2.0 at that level.
- Most U.S. legal precedent under the ADA still points to WCAG 2.0 or 2.1 AA, but the UK's public sector accessibility regulations already [require WCAG 2.2 AA](https://www.gov.uk/guidance/accessibility-requirements-for-public-sector-websites-and-apps).

## What Is WCAG 2.2?

The Web Content Accessibility Guidelines (WCAG) are published by the [World Wide Web Consortium (W3C)](https://www.w3.org/), the international standards body responsible for web technologies. WCAG defines what makes a website accessible to people with disabilities, and it is the technical standard nearly every accessibility law in the world points back to, directly or indirectly.

WCAG 2.2 is simply the newest version of that standard. It keeps every requirement from WCAG 2.1, so meeting 2.2 automatically satisfies the earlier versions at the same conformance level.

## Why a New Version?

WCAG has been revised three times since its first release:

- **WCAG 1.0** was published in 1999.
- **WCAG 2.0** followed nine years later, in 2008, and became the version most laws still reference today.
- **WCAG 2.1** arrived a decade after that, in 2018, adding requirements for mobile devices, low vision and cognitive disabilities.
- **WCAG 2.2** was published in 2023, addressing gaps that newer interface patterns, touch devices and authentication methods had exposed.

Each revision responds to how the web has changed since the last one. WCAG 2.1 is still a widely accepted standard, but WCAG 2.2 is the most current and complete version available, which is why it is worth building toward even where the law has not fully caught up yet.

## What's New in WCAG 2.2

WCAG 2.2 adds nine new success criteria, grouped into four themes.

### Focus indicators

A focus indicator is the visual outline that shows which element is currently selected when navigating by keyboard. It is essential for anyone who cannot use a mouse.

| Criterion | Level | What it requires |
| --- | --- | --- |
| 2.4.11 Focus Not Obscured (Minimum) | AA | The focused element cannot be entirely hidden by sticky headers, cookie banners or chat widgets. |
| 2.4.12 Focus Not Obscured (Enhanced) | AAA | No part of the focused element can be hidden, even in complex overlapping layouts. |
| 2.4.13 Focus Appearance | AAA | The focus indicator must meet a minimum size and contrast so it is easy to see. |

### Input methods and gestures

These criteria cover how people interact with a page beyond a standard click, including touch and drag gestures common on mobile.

| Criterion | Level | What it requires |
| --- | --- | --- |
| 2.5.7 Dragging Movements | AA | Anything done by dragging, such as a slider or reorderable list, needs a single-pointer alternative that does not require dragging. |
| 2.5.8 Target Size (Minimum) | AA | Interactive targets are at least 24 by 24 CSS pixels, or have enough spacing between them, with some exceptions. |

### User assistance and consistency

| Criterion | Level | What it requires |
| --- | --- | --- |
| 3.2.6 Consistent Help | A | Help mechanisms, such as a contact link or chat, appear in the same relative order on every page where they are offered. |

### Form usability and error prevention

| Criterion | Level | What it requires |
| --- | --- | --- |
| 3.3.7 Redundant Entry | A | Information a user already entered earlier in a process is auto-filled or offered again, rather than asked for twice. |
| 3.3.8 Accessible Authentication (Minimum) | AA | Logging in cannot depend solely on a cognitive function test, such as remembering a password or solving a puzzle, unless an alternative or assistance is available. |
| 3.3.9 Accessible Authentication (Enhanced) | AAA | A stricter version of 3.3.8 with fewer exceptions. |

Six of the nine new criteria apply at Level A or AA, the level most organizations target. For a full working checklist covering how to test each one, see our [WCAG 2.2 checklist](/blog/wcag-2-2-checklist).

## What Was Removed

WCAG 2.2 drops one criterion that existed in WCAG 2.1: **4.1.1 Parsing**, which required well-formed markup, such as no duplicate IDs or unclosed tags, so that assistive technology could interpret it correctly. Modern browsers now normalize malformed HTML consistently enough that this is no longer treated as an accessibility failure on its own. Markup errors that actually break something, like a missing accessible name, are still caught by other criteria.

## Do You Need to Conform to WCAG 2.2?

This is the part without a single clean answer, because different laws currently point to different versions of WCAG.

**In the United States**, most courts applying the [Americans with Disabilities Act (ADA)](/blog/ada-website-compliance-guide) to websites reference WCAG 2.0 or WCAG 2.1 at Level AA, since no formal technical standard is written into the ADA itself. [Section 508 of the Rehabilitation Act](https://www.section508.gov/), which applies to federal agencies and their contractors, also sets WCAG 2.0 AA as its baseline.

**In Canada**, the [Accessibility for Ontarians with Disabilities Act (AODA)](https://www.ontario.ca/laws/regulation/110191) requires WCAG 2.0 AA for many organizations registered in Ontario.

**In the United Kingdom**, the Public Sector Bodies Accessibility Regulations are the clearest exception: they now direct public sector websites and apps to [meet WCAG 2.2 AA as the current minimum standard](https://www.gov.uk/guidance/accessibility-requirements-for-public-sector-websites-and-apps).

**Bottom line:** if your only goal is meeting today's minimum legal bar in the U.S. or Canada, WCAG 2.1 AA is still widely accepted. But WCAG 2.2 is the current, most complete version of the guidelines, it costs little extra to build toward once you are already targeting 2.1, and it positions you ahead of the next round of legal updates rather than behind it.

## How to Test a Website for WCAG 2.2 Conformance

No single tool checks everything WCAG 2.2 covers. The most reliable results come from combining two approaches:

**Automated scanning** catches a meaningful share of failures quickly and consistently, things like missing [alt text](/resources/wcag/1-1-1-non-text-content), insufficient [color contrast](/resources/contrast-checker), unlabeled form fields and missing page language. [Run a free WCAG 2.2 scan](/resources/wcag-2-2-aa-checker) to see where your site stands in under a minute.

**Manual review** is necessary for the criteria that require human judgment, including several of the criteria new to 2.2: whether a focus indicator is actually obscured in your specific layout, whether a dragging interaction has a usable alternative, and whether your login flow genuinely avoids memory-dependent steps. Our guide to [automated vs. manual accessibility testing](/blog/automated-vs-manual-accessibility-testing) breaks down exactly which checks fall into each category, and involving people who actually use assistive technology in your testing, where possible, surfaces barriers a checklist alone will miss.

Whichever approach you start with, an accurate picture of where you stand today is the necessary first step. [Run a free scan](/#scan) to see how many WCAG 2.2 issues your page has in under a minute, no account required.

Selling in the EU? EN 301 549 version 4.1.1 now uses WCAG 2.2. See [the European Accessibility Act: technical aspects of compliance](/blog/european-accessibility-act-technical-compliance).

For a closer look at one of the new criteria, read [2.4.12 Focus Not Obscured (Enhanced) explained in plain English](/resources/wcag/2-4-12-focus-not-obscured-enhanced).

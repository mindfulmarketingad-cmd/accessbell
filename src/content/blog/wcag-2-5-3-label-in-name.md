---
title: 'WCAG 2.5.3 Label in Name Explained in Plain English'
seoTitle: 'WCAG 2.5.3 Label in Name Explained'
description: 'WCAG 2.5.3 Label in Name explained simply: why a control’s accessible name must contain its visible text, how voice control relies on it and how to test.'
pubDate: 2026-10-01
category: 'WCAG Codes Explained'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-10-01
    note: 'First published. Checked against the W3C WCAG 2.2 Recommendation, the Understanding document for 2.5.3 Label in Name and the W3C techniques it lists.'
related: ['wcag-4-1-2-name-role-value', 'wcag-2-4-4-link-purpose-in-context', 'wcag-3-3-2-labels-or-instructions']
faqs:
  - q: 'What level is WCAG 2.5.3 Label in Name?'
    a: 'Level A. It was added in WCAG 2.1, so it applies to WCAG 2.1 and 2.2 targets.'
  - q: 'What is an accessible name?'
    a: 'The name assistive technology uses for a control. It usually comes from the visible text or label, but aria-label and aria-labelledby replace it. 2.5.3 Label in Name is about making sure that replacement still contains the visible words.'
  - q: 'Does the accessible name have to match the label exactly?'
    a: 'No. It must contain the visible text. Extra words are allowed, and the W3C recommends putting the visible text first, so "Buy now, 2-person tent" is better than "2-person tent, buy now".'
  - q: 'Does 2.5.3 apply to icon-only buttons?'
    a: 'Not directly. It applies to controls whose label includes text or images of text. An icon-only button has no visible text to match, though it still needs an accessible name under 4.1.2 Name, Role, Value.'
---

**2.5.3 Label in Name** is the WCAG success criterion that says the name a control has in the code must include the words people can see on it. If a button says "Search", its accessible name must contain "Search". This matters most for voice control users, who say what they see, "Click Search", to press a button. This guide explains WCAG 2.5.3 Label in Name in plain English, the common mistakes and how to test.

> **The official wording:** "For user interface components with labels that include text or images of text, the name contains the text that is presented visually." ([W3C, WCAG 2.2](https://www.w3.org/TR/WCAG22/#label-in-name))

## What Is 2.5.3 Label in Name?

2.5.3 Label in Name is a Level A requirement under the **Operable** principle, in the guideline "Input Modalities", added in WCAG 2.1. Every control has an accessible name that assistive technology announces and uses. Normally it comes from the visible text, so it matches. Problems start when developers add `aria-label` or `aria-labelledby`, which replace the visible text as the name, and write something different.

<figure>
  <img src="/images/wcag/2-5-3-label-in-name/voice-control.svg" width="800" height="400" loading="lazy" alt="Two Search buttons. In the failing one the code has aria-label Find items; a voice control user says Click Search and nothing happens. In the passing one the code has aria-label Search products; the user says Click Search and the button is pressed.">
  <figcaption>Voice control matches what people say against the accessible name, not the visible text.</figcaption>
</figure>

## Why 2.5.3 Label in Name Matters

Voice control software, such as Voice Control on Mac and iPhone, Voice Access on Android and Dragon on Windows, lets people operate a page by speaking. They read a control's visible label and say it. If the accessible name is different, the command does not match and nothing happens.

It matters for screen reader users who can see the screen too, such as people with low vision or dyslexia. If they hear "Find items" while looking at a button that says "Search", the page feels inconsistent and confusing.

## Who Is Affected by 2.5.3 Label in Name

- People who use voice control because of motor disabilities, repetitive strain injury or temporary injury
- Screen reader users who can also see the screen
- People with cognitive disabilities who rely on consistent labels

## How to Meet 2.5.3 Label in Name

### Let the visible text be the name

The simplest fix is to not override the name at all. A `button` with text, a link with text and an input with a `label` element all get their accessible name from that visible text automatically. Only add ARIA naming when you need to add information.

### If you add words, include the visible text, ideally first

<figure>
  <img src="/images/wcag/2-5-3-label-in-name/name-patterns.svg" width="800" height="300" loading="lazy" alt="Three Buy now buttons with different accessible names. Buy now, 2-person tent is best. 2-person tent, buy now passes but is not ideal. Purchase fails because it does not contain the visible text.">
  <figcaption>The name must contain the visible text. Starting with it works best for voice control.</figcaption>
</figure>

The W3C techniques [G208, including the text of the visible label as part of the accessible name](https://www.w3.org/WAI/WCAG22/Techniques/general/G208) and [G211, matching the accessible name to the visible label](https://www.w3.org/WAI/WCAG22/Techniques/general/G211) describe the fix. An accessible name that does not contain the visible label is failure [F96](https://www.w3.org/WAI/WCAG22/Techniques/failures/F96).

```html
<!-- Fails: name does not contain "Search" -->
<button aria-label="Find items">Search</button>

<!-- Passes: visible text first, extra context after -->
<button aria-label="Search products">Search</button>

<!-- Passes: visible text plus context from the page -->
<h3 id="tent">2-person tent</h3>
<button id="buy" aria-labelledby="buy tent">Buy now</button>
```

### Watch for form labels that differ from placeholders

If a field has a visible label, the accessible name should come from that label. Do not label it with `aria-label` text that differs from what people see.

### Ignore punctuation and capitalization

Matching is about the words. "Search" and "search" match, and so do "Next ›" and "Next". Symbols that are not words, such as arrows, do not need to be in the name.

## How to Test for 2.5.3 Label in Name

1. **Inspect each control** with your browser's accessibility panel and compare the accessible name with the visible text.
2. **Look for `aria-label` and `aria-labelledby`** in your code. Each one is a place the name and label can drift apart.
3. **Try voice control.** Say "Click" followed by the visible text of buttons and links. Each should work.
4. **Listen with a screen reader** while looking at the screen. What you hear should match what you see.

## Related Success Criteria

- [4.1.2 Name, Role, Value](/resources/wcag/4-1-2-name-role-value): every control has an accessible name and role.
- [2.4.4 Link Purpose (In Context)](/resources/wcag/2-4-4-link-purpose-in-context): link text describes where links go.
- [3.3.2 Labels or Instructions](/resources/wcag/3-3-2-labels-or-instructions): fields have visible labels.
- [2.4.6 Headings and Labels](/resources/wcag/2-4-6-headings-and-labels): labels describe their purpose.

[Run a free WCAG scan](/#scan) to compare accessible names with visible labels on any page, then test with voice control.

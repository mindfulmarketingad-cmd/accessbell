---
title: 'WCAG 4.1.1 Parsing Explained in Plain English'
seoTitle: 'WCAG 4.1.1 Parsing Explained'
description: 'WCAG 4.1.1 Parsing explained simply: what it required, why WCAG 2.2 removed it, and the markup habits that still matter, with examples and how to test.'
pubDate: 2026-09-30
category: 'WCAG Codes Explained'
contributors:
  - author: joseph-edwards
    role: Author
history:
  - date: 2026-09-30
    note: 'First published. Checked against the W3C WCAG 2.1 and 2.2 Recommendations, the WCAG 2.0 and 2.1 note on 4.1.1 and the W3C "What''s New in WCAG 2.2" page.'
related: ['wcag-4-1-2-name-role-value', 'what-you-should-know-about-wcag-2-2', 'wcag-2-aa-checklist']
faqs:
  - q: 'What level is WCAG 4.1.1 Parsing?'
    a: 'Level A in WCAG 2.0 and 2.1. It was removed from WCAG 2.2, so it no longer appears there at all.'
  - q: 'Do I still need to meet 4.1.1 Parsing?'
    a: 'If you follow WCAG 2.2, no, because the criterion no longer exists. If a law or contract still points to WCAG 2.0 or 2.1, the W3C has added a note to those versions saying 4.1.1 always passes for content written in HTML or XML. Either way, clean markup is still good practice.'
  - q: 'Why was 4.1.1 Parsing removed?'
    a: 'When WCAG 2.0 was published in 2008, browsers and assistive technology handled broken markup badly. Since then, HTML has defined how browsers recover from errors, and assistive technology reads the browser''s own interpretation of the page instead of parsing the code itself. Most parsing errors stopped causing real barriers.'
  - q: 'Are duplicate IDs still a problem?'
    a: 'Yes, when the ID is referenced. Labels that use for, and attributes such as aria-labelledby, aria-describedby and aria-controls, look up an element by its ID. If two elements share an ID, the reference can point at the wrong one. That is a failure of criteria such as 1.3.1 Info and Relationships or 4.1.2 Name, Role, Value, not of 4.1.1.'
  - q: 'Does a failed HTML validator mean my site fails WCAG?'
    a: 'No. Validators report many things that do not affect accessibility. Use validation as a debugging aid, and fix the errors that change how the page is read, such as duplicate IDs, broken nesting and invalid ARIA.'
---

**4.1.1 Parsing** is the WCAG success criterion that asked web pages to be written with valid, well-formed markup. It is also the only criterion that WCAG 2.2 removed. If you are searching for it, the short answer is that you no longer need to test for it, but the habits behind it still prevent real bugs. This guide explains WCAG 4.1.1 Parsing in plain English: what it required, why the W3C dropped it, and what to check instead.

> **What it said (WCAG 2.1):** "In content implemented using markup languages, elements have complete start and end tags, elements are nested according to their specifications, elements do not contain duplicate attributes, and any IDs are unique, except where the specifications allow these features." ([W3C, WCAG 2.1](https://www.w3.org/TR/WCAG21/#parsing))

## What Was 4.1.1 Parsing?

4.1.1 Parsing was a Level A requirement under the **Robust** principle, present in WCAG 2.0 and WCAG 2.1. The idea was simple: if your code is malformed, assistive technology might read it wrongly, so the code should follow the rules of its markup language.

<figure>
  <img src="/blog/wcag-4-1-1-parsing/parsing-timeline.svg" width="800" height="372" loading="lazy" alt="Timeline. WCAG 2.0, December 2008: 4.1.1 Parsing is Level A. WCAG 2.1, June 2018: Level A. WCAG 2.2, October 2023: removed. In WCAG 2.0 and 2.1 the W3C notes that 4.1.1 always passes for HTML and XML.">
  <figcaption>4.1.1 Parsing was Level A in WCAG 2.0 and 2.1, and was removed in WCAG 2.2.</figcaption>
</figure>

It asked for four things:

<figure>
  <img src="/blog/wcag-4-1-1-parsing/four-parsing-rules.svg" width="800" height="448" loading="lazy" alt="Four cards, each with a failing and a passing example. Complete start and end tags: p Hello with no closing tag versus a closed paragraph. Correct nesting: b and i closed in the wrong order versus the right order. No duplicate attributes: an h1 with two ids versus one id. Unique IDs: two anchors sharing the id x versus x and y.">
  <figcaption>The four markup rules of 4.1.1 Parsing, with a failing and a passing example of each.</figcaption>
</figure>

- **Complete start and end tags** for elements that need them
- **Correct nesting**, so elements close in the reverse order they opened
- **No duplicate attributes** on a single element
- **Unique IDs** across the page

## Why WCAG 2.2 Removed 4.1.1 Parsing

The W3C removed the criterion because the problem it solved no longer exists in practice. When WCAG 2.0 was published in 2008, browsers and assistive technology handled bad markup unpredictably. Today:

- HTML defines exactly how browsers must recover from errors, so every modern browser builds the same page from the same broken code.
- Assistive technology reads the browser's accessibility tree, not the raw HTML, so it is shielded from most parsing errors.

For WCAG 2.0 and 2.1, the W3C added a note saying that 4.1.1 should be treated as always satisfied for content using HTML or XML. The W3C lists the removal on its page [What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/), and our overview of [what you should know about WCAG 2.2](/blog/what-you-should-know-about-wcag-2-2) covers the other changes. Our [WCAG 2.2 AA checklist](/blog/wcag-2-aa-checklist) leaves it out for the same reason.

The takeaway for site owners: **do not fail a page on 4.1.1 Parsing alone, and do not report it as a WCAG 2.2 failure.**

## Who Was Affected by 4.1.1 Parsing?

The original concern was for people who use assistive technology, such as screen readers, magnifiers and speech recognition, because those tools depended on the code being interpreted correctly. Today the risk sits mostly with specific bugs, not with the general idea of "invalid HTML".

## Markup Problems That Still Matter

Dropping the criterion did not make every markup error harmless. A few still break accessibility, and they are covered by other criteria.

### Duplicate IDs that are referenced

IDs are how the code connects one element to another. A `label` finds its field through `for`. `aria-labelledby`, `aria-describedby` and `aria-controls` find their targets by ID. If two elements share an ID, the connection can land on the wrong one:

<figure>
  <img src="/blog/wcag-4-1-1-parsing/duplicate-id-label.svg" width="800" height="404" loading="lazy" alt="Code shows two labels with for email pointing at two inputs that both have the id email. Both labels attach to the first input, and the second input has no label, so a screen reader reads it only as edit text.">
  <figcaption>Two inputs with the same ID: the second one ends up with no label.</figcaption>
</figure>

```html
<!-- Fails: both inputs share id="email" -->
<label for="email">Home email</label> <input id="email">
<label for="email">Work email</label> <input id="email">

<!-- Passes -->
<label for="home-email">Home email</label> <input id="home-email">
<label for="work-email">Work email</label> <input id="work-email">
```

This is a failure of [1.3.1 Info and Relationships](/resources/wcag/1-3-1-info-and-relationships) or [4.1.2 Name, Role, Value](/blog/wcag-4-1-2-name-role-value), and of [3.3.2 Labels or Instructions](/blog/wcag-3-3-2-labels-or-instructions), depending on what breaks.

### Broken nesting that changes structure

Browsers repair bad nesting, but not always the way you meant. A `<div>` inside a `<p>` closes the paragraph early, and a stray `</div>` can pull content out of a landmark or a list. The page looks fine, and the structure a screen reader user hears is different from what you intended.

### Invalid ARIA and duplicate attributes

Unknown roles, misspelled `aria-` attributes and missing required attributes are real accessibility errors, and are checked under [4.1.2 Name, Role, Value](/blog/wcag-4-1-2-name-role-value).

## How to Test Your Markup Today

You do not need a 4.1.1 test, but a few quick checks catch the bugs above:

1. **Run an automated scan.** An automated checker reports duplicate IDs that break labels or ARIA references, invalid roles and other structural problems, each with the failing HTML. A [free accessibility scan](/#scan) shows how many a page has, and AccessBell Pro lists each one.
2. **Validate as a debugging aid.** The W3C's [Nu HTML Checker](https://validator.w3.org/nu/) finds unclosed elements and duplicate attributes. Treat the results as hints, not as WCAG failures, and fix those that affect structure.
3. **Search the page for repeated IDs** used by labels and ARIA attributes, especially in components that render more than once, such as cards, tabs and repeated forms.
4. **Check the accessibility tree.** In your browser's developer tools, confirm that key fields still show the right name and role.

## Related Success Criteria

- [1.3.1 Info and Relationships](/resources/wcag/1-3-1-info-and-relationships): structure and relationships are available in the code.
- [4.1.2 Name, Role, Value](/blog/wcag-4-1-2-name-role-value): controls expose a name, role and state.
- [4.1.3 Status Messages](/blog/wcag-4-1-3-status-messages): updates are announced without moving focus.

Want to find the structural problems that still matter? [Run a free WCAG scan](/#scan) of any page, or [start a 3-day free trial](/app/signup) to monitor up to 500 URLs per domain every day.

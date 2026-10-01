---
title: 'WCAG 1.3.1 Info and Relationships Explained in Plain English'
seoTitle: 'WCAG 1.3.1 Info and Relationships Explained'
description: 'WCAG 1.3.1 Info and Relationships explained simply: why headings, lists, tables and form labels must be in the code, with fixes and how to test.'
pubDate: 2026-10-01
category: 'WCAG Codes Explained'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-10-01
    note: 'First published. Checked against the W3C WCAG 2.2 Recommendation, the Understanding document for 1.3.1 Info and Relationships and the W3C techniques it lists.'
related: ['wcag-1-3-2-meaningful-sequence', 'wcag-4-1-2-name-role-value', 'wcag-3-3-2-labels-or-instructions']
faqs:
  - q: 'What level is WCAG 1.3.1 Info and Relationships?'
    a: 'Level A, the most basic level. It has been part of WCAG since version 2.0, so every site aiming for WCAG 2.0, 2.1 or 2.2 has to meet it.'
  - q: 'Does 1.3.1 mean I have to use ARIA?'
    a: 'Usually not. Native HTML elements such as headings, lists, tables, labels and fieldsets carry the structure on their own. ARIA is for custom components that HTML cannot describe, and the first rule of ARIA is to use a native element when one exists.'
  - q: 'Is bold text a heading under 1.3.1?'
    a: 'Only if it is marked up as one. Text that looks like a heading because it is large or bold, but is coded as a paragraph or div, fails 1.3.1 Info and Relationships. Use a real h1 to h6 element at the right level.'
  - q: 'Can automated tools test 1.3.1 Info and Relationships?'
    a: 'Partly. Tools can find broken list markup, table headers that point nowhere and form fields with no label. They cannot tell whether bold text is really a heading, or whether a grid of text is really a data table, so check those by hand.'
---

**1.3.1 Info and Relationships** is the WCAG success criterion that says the structure people can see must also be in the code. If something looks like a heading, it must be coded as a heading. If items look like a list, they must be a list. If a label sits next to a field, the two must be connected. This guide explains WCAG 1.3.1 Info and Relationships in plain English, with fixes for headings, lists, tables and forms, and how to test your pages.

> **The official wording:** "Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text." ([W3C, WCAG 2.2](https://www.w3.org/TR/WCAG22/#info-and-relationships))

## What Is 1.3.1 Info and Relationships?

1.3.1 Info and Relationships is a Level A requirement under the **Perceivable** principle, in the guideline "Adaptable". "Programmatically determined" means software, such as a screen reader, can read the structure from the code instead of guessing it from how the page looks.

Sighted people understand a page from visual cues: big bold text is a heading, indented items with bullets are a list, text in a grid lines up with the column at the top. Screen readers, voice control and reader modes cannot see those cues. They rely on the HTML.

<figure>
  <img src="/images/wcag/1-3-1-info-and-relationships/visual-vs-code.svg" width="800" height="420" loading="lazy" alt="Two versions of the same content: a heading Opening hours, two bulleted opening times and a Phone field. They look identical. In the failing one the heading is a div with large text, the bullets are typed characters and the Phone text is not connected to the field. In the passing one the heading is an h2, the times are a ul list and the field has a label element.">
  <figcaption>The two versions look the same. Only the second one tells assistive technology what each part is.</figcaption>
</figure>

## Why 1.3.1 Info and Relationships Matters

Structure is how people navigate. Screen reader users commonly jump from heading to heading to skim a page, the way sighted people scan bold titles. They hear "list, 5 items" and know how long a list is. In a data table, they hear the column header with each cell. When the structure is missing:

- A long page becomes one undivided stream of text, with no headings to jump between.
- Form fields are announced as "edit text" with no name, so people do not know what to type.
- A table of prices reads as a sequence of numbers with no meaning.
- Reader modes, browser extensions and custom stylesheets cannot reshape the content, because they do not know what each part is.

## Who Is Affected by 1.3.1 Info and Relationships

- People who are blind and use screen readers
- People with low vision who use screen magnifiers together with speech
- People who use voice control, which relies on labels to target fields
- People with cognitive disabilities who use tools that simplify or restyle pages
- Anyone using reader mode, a custom stylesheet or a text-only browser

## How to Meet 1.3.1 Info and Relationships

### Use real headings in a logical order

Mark headings with `h1` to `h6`, following the outline of the page: one `h1` for the page topic, `h2` for main sections, `h3` for subsections. Do not pick a level because of its size; change the size with CSS. This is the W3C technique [H42, using h1 to h6 to identify headings](https://www.w3.org/WAI/WCAG22/Techniques/html/H42). Using CSS to make text look like a heading without the markup is failure [F2](https://www.w3.org/WAI/WCAG22/Techniques/failures/F2).

### Use list markup for lists

Use `ul` for unordered lists, `ol` for numbered steps and `dl` for terms with descriptions ([H48](https://www.w3.org/WAI/WCAG22/Techniques/html/H48)). Typing bullet characters or numbers at the start of lines gives a visual list with no structure.

### Give data tables real headers

<figure>
  <img src="/images/wcag/1-3-1-info-and-relationships/data-table.svg" width="800" height="380" loading="lazy" alt="Two price tables with columns Plan, Price and Pages. In the failing one every cell is a td, so a screen reader reads $29 with no idea what it is. In the passing one the first row uses th elements with scope col, so each price is read with its column header: Price, $29.">
  <figcaption>Header cells let a screen reader announce which column each value belongs to.</figcaption>
</figure>

Mark header cells with `th` and, for simple tables, add `scope="col"` or `scope="row"` ([H51](https://www.w3.org/WAI/WCAG22/Techniques/html/H51), [H63](https://www.w3.org/WAI/WCAG22/Techniques/html/H63)). Not marking up table headers is failure [F91](https://www.w3.org/WAI/WCAG22/Techniques/failures/F91). Use tables only for data, not for layout.

```html
<table>
  <caption>Plans</caption>
  <tr><th scope="col">Plan</th><th scope="col">Price</th><th scope="col">Pages</th></tr>
  <tr><td>Starter</td><td>$29</td><td>500</td></tr>
</table>
```

### Connect labels to fields and group related controls

Every form field needs a `label` element tied to it with `for` and `id` ([H44](https://www.w3.org/WAI/WCAG22/Techniques/html/H44)). Groups of radio buttons or checkboxes that answer one question go in a `fieldset` with a `legend` ([H71](https://www.w3.org/WAI/WCAG22/Techniques/html/H71)).

<figure>
  <img src="/images/wcag/1-3-1-info-and-relationships/form-groups.svg" width="800" height="380" loading="lazy" alt="Two sets of radio buttons for Delivery speed: Standard, Express and Collect in store. Without a group, a screen reader announces only Standard, radio button, and the question is never read out. Inside a fieldset with the legend Delivery speed, it announces Delivery speed, group, Standard, radio button, 1 of 3.">
  <figcaption>A fieldset and legend give every option its question.</figcaption>
</figure>

```html
<fieldset>
  <legend>Delivery speed</legend>
  <label><input type="radio" name="speed" value="standard"> Standard (3 to 5 days)</label>
  <label><input type="radio" name="speed" value="express"> Express (next day)</label>
</fieldset>
```

Labels also help meet [3.3.2 Labels or Instructions](/resources/wcag/3-3-2-labels-or-instructions) and [4.1.2 Name, Role, Value](/resources/wcag/4-1-2-name-role-value).

### Mark up page regions

Use `header`, `nav`, `main`, `aside` and `footer` so people can jump between regions ([ARIA11, using ARIA landmarks](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA11)). Native HTML elements create the landmarks for you.

### Use text when styling carries meaning

If you show meaning with styling, such as a strikethrough old price or text in a highlighted box, make sure it is also in the code or the text: use `del` and `ins`, `strong` and `em`, or add words such as "Was $49, now $29".

## How to Test for 1.3.1 Info and Relationships

Automated tools catch part of 1.3.1 Info and Relationships, such as list items outside a list, table headers that point nowhere and fields with no label. A person needs to check the rest:

1. **List the headings.** Use a browser extension or a screen reader's headings list. Every visual heading should appear, at a level that matches the outline, and nothing else should.
2. **Turn off CSS** or use reader mode. Does the page still read in a sensible structure?
3. **Check lists and tables.** Lists should be announced as lists; data tables should announce their headers with each cell.
4. **Click each label.** Clicking a label should focus its field. Check that radio groups are announced with their question.
5. **Look for meaning in styling only,** such as color, bold or position, and check it is also in the markup or text.

Our [keyboard accessibility testing guide](/blog/keyboard-accessibility-testing) pairs well with a screen reader check of headings and forms.

## Related Success Criteria

- [1.3.2 Meaningful Sequence](/resources/wcag/1-3-2-meaningful-sequence): the reading order in the code makes sense.
- [2.4.6 Headings and Labels](/resources/wcag/2-4-6-headings-and-labels): headings and labels describe their topic or purpose.
- [2.4.10 Section Headings](/resources/wcag/2-4-10-section-headings): sections of content have headings, at Level AAA.
- [3.3.2 Labels or Instructions](/resources/wcag/3-3-2-labels-or-instructions): form fields have labels or instructions.
- [4.1.2 Name, Role, Value](/resources/wcag/4-1-2-name-role-value): every control has a name and role.

[Run a free WCAG scan](/#scan) to find missing labels, broken lists and table header problems, then check headings and structure by hand.

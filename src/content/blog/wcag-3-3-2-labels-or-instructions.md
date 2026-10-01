---
title: 'WCAG 3.3.2 Labels or Instructions Explained in Plain English'
seoTitle: 'WCAG 3.3.2 Labels or Instructions Explained'
description: 'WCAG 3.3.2 Labels or Instructions explained simply: visible labels, format hints, grouped fields and required markers, with code examples and a test routine.'
pubDate: 2026-09-29
category: 'WCAG Codes Explained'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-09-29
    note: 'First published. Checked against the W3C WCAG 2.2 Recommendation and the Understanding document for 3.3.2 Labels or Instructions.'
related: ['wcag-1-4-1-use-of-color', 'wcag-3-3-8-accessible-authentication-minimum', 'we-tested-10-accessibility-checker-tools']
faqs:
  - q: 'What level is WCAG 3.3.2 Labels or Instructions?'
    a: 'Level A, the most basic level. It has been part of WCAG since version 2.0, so it applies to every site that aims for WCAG 2.0, 2.1 or 2.2.'
  - q: 'Is placeholder text enough to meet 3.3.2 Labels or Instructions?'
    a: 'We do not recommend it. Placeholder text disappears as soon as people start typing, is often low in contrast and is not reliably read by all assistive technology. Use a visible label, and put hints in text next to the field.'
  - q: 'What is the difference between 3.3.2 and 1.3.1?'
    a: '3.3.2 Labels or Instructions is about whether people can see labels and instructions when they fill in a form. 1.3.1 Info and Relationships is about whether those labels are connected to their fields in the code, for example with the label element, so assistive technology can announce them.'
  - q: 'Can an automated checker test 3.3.2 Labels or Instructions?'
    a: 'Only partly. Checkers can find fields with no label in the code, but they cannot judge whether a label or instruction is clear enough. In our test of 10 accessibility checkers, only 3 reported an email field labelled only by placeholder text as an error.'
---

**3.3.2 Labels or Instructions** is the WCAG success criterion that makes sure people know what to enter in a form. Every field needs a clear label, and where the answer has to follow a format or a rule, people need to be told before they start. This guide explains WCAG 3.3.2 Labels or Instructions in plain English: what a good label looks like, when to add instructions, code examples and how to test your forms.

> **The official wording:** "Labels or instructions are provided when content requires user input." ([W3C, WCAG 2.2](https://www.w3.org/TR/WCAG22/#labels-or-instructions))

## What Is 3.3.2 Labels or Instructions?

3.3.2 Labels or Instructions is a Level A requirement under the **Understandable** principle, in the guideline "Input Assistance". It applies to any place people enter information: sign-up and checkout forms, search boxes, filters, surveys and settings.

It asks for two things:

1. **Labels:** visible text that says what each field, checkbox, radio button or menu is for.
2. **Instructions:** extra guidance where people need it, such as a required format ("DD/MM/YYYY"), a rule ("at least 8 characters"), or which fields are required.

The goal is to prevent mistakes before they happen. Error messages after the fact are covered by [3.3.1 Error Identification](/resources/wcag/3-3-1-error-identification) and [3.3.3 Error Suggestion](/resources/wcag/3-3-3-error-suggestion).

## Why 3.3.2 Labels or Instructions Matters

A form without clear labels and instructions turns into a guessing game:

- People with **cognitive or learning disabilities** may not work out what an unlabelled field wants, or may forget a hint that has disappeared.
- People with **memory impairments** lose track of what a field is for once placeholder text vanishes.
- **Screen magnifier users** see only part of the screen, so a label placed far from its field may be out of view.
- **Screen reader users** rely on labels to know what each field is. Without instructions, they only discover format rules through error messages.
- **Everyone** makes fewer mistakes, and finishes faster, when a form is clear.

## Who Is Affected by 3.3.2 Labels or Instructions

- People with cognitive, learning or memory disabilities
- People who are blind or have low vision
- People who use screen magnifiers
- People filling in a form in a second language
- Older adults and anyone new to a form or service

## How to Meet 3.3.2 Labels or Instructions

### Give every field a visible label

Every input needs a label people can see, that stays visible while they type. The W3C technique [G131, providing descriptive labels](https://www.w3.org/WAI/WCAG22/Techniques/general/G131), covers the wording: short and specific, such as "Email" or "Postcode", not "Field 1" or "Details".

<figure>
  <img src="/blog/wcag-3-3-2-labels-or-instructions/placeholder-vs-label.svg" width="800" height="400" loading="lazy" alt="Two sign-in forms. The failing one uses placeholder text Email as the only label; after typing, the fields show sam@example and Tr41l-Mix and the hints are gone, so you cannot tell which field was which. The passing one has visible labels Email and Password with hints We will send your receipt here and At least 8 characters, which stay visible while people type.">
  <figcaption>Placeholder text disappears when people type. A visible label and hint stay put.</figcaption>
</figure>

Connect the label to its field in the code with the `label` element, as in the W3C technique [H44, using label elements to associate text labels with form controls](https://www.w3.org/WAI/WCAG22/Techniques/html/H44). Put hints in text next to the field and connect them with `aria-describedby`, so screen readers read them too:

```html
<label for="email">Email</label>
<p id="email-hint" class="hint">We'll send your receipt here</p>
<input id="email" name="email" type="email" autocomplete="email" aria-describedby="email-hint">
```

Do not rely on `placeholder` as the label. If you use it, use it only for an example, and keep the real label and instructions visible.

### Explain formats and rules up front

If an answer must follow a format, say so before people type. The W3C technique [G89, providing expected data format and example](https://www.w3.org/WAI/WCAG22/Techniques/general/G89), describes this:

<figure>
  <img src="/blog/wcag-3-3-2-labels-or-instructions/format-instructions.svg" width="800" height="360" loading="lazy" alt="Two date of birth fields. The failing one gives no format; someone types 3/5/90 and gets the error Invalid date, so people have to guess the format and fix it after an error. The passing one says Use DD/MM/YYYY, for example 05/03/1990, and the entry 05/03/1990 is right the first time.">
  <figcaption>Stating the format and giving an example prevents the error in the first place.</figcaption>
</figure>

```html
<label for="dob">Date of birth</label>
<p id="dob-hint" class="hint">Use DD/MM/YYYY, for example 05/03/1990</p>
<input id="dob" name="dob" inputmode="numeric" autocomplete="bday" aria-describedby="dob-hint">
```

Do the same for password rules, file size limits, character limits and anything else that could cause an error. For long forms, a short note at the top that explains what people will need helps too, as in the W3C technique [G184, text instructions at the start of a form](https://www.w3.org/WAI/WCAG22/Techniques/general/G184).

### Mark required and optional fields in text

Tell people which fields they must fill in, in words. Either mark each required field "(required)", or say at the top "All fields are required unless marked optional" and mark the optional ones. An asterisk works if you explain what it means at the start of the form. Do not use color alone to show required fields, which also fails [1.4.1 Use of Color](/blog/wcag-1-4-1-use-of-color).

### Label groups and every part of a group

Radio buttons, checkboxes and fields that belong together need a label for the group and a label for each part:

<figure>
  <img src="/blog/wcag-3-3-2-labels-or-instructions/grouped-fields.svg" width="800" height="380" loading="lazy" alt="Two forms with grouped fields. The failing one has a Phone label over three unlabeled boxes, and a Size label over radio buttons S, M and L, leaving people asking what goes in each box and size of what. The passing one has a Phone number group with parts labelled Area code, First 3 and Last 4, and a Tent size group with options Small, 2 people, and Large, 4 people.">
  <figcaption>Name the group, then label each part, so every field makes sense on its own.</figcaption>
</figure>

Use `fieldset` and `legend` for the group, as in the W3C technique [H71, describing groups of form controls with fieldset and legend](https://www.w3.org/WAI/WCAG22/Techniques/html/H71):

```html
<fieldset>
  <legend>Tent size</legend>
  <input type="radio" id="size-small" name="size" value="small">
  <label for="size-small">Small (2 people)</label>
  <input type="radio" id="size-large" name="size" value="large">
  <label for="size-large">Large (4 people)</label>
</fieldset>
```

A phone number split into several boxes with no label on each part is failure [F82, visually formatting phone number fields without a text label](https://www.w3.org/WAI/WCAG22/Techniques/failures/F82). A single phone field is usually simpler for everyone.

### Keep labels close to their fields

Put each label right above or right beside its field, so the pairing is obvious. Labels far away from their fields, such as in a wide two-column layout, are easy to mismatch, and at high zoom the two may not be on screen together.

<figure>
  <img src="/blog/wcag-3-3-2-labels-or-instructions/label-position.svg" width="800" height="340" loading="lazy" alt="Two form layouts. The failing one puts the labels First name and Town on the far left with the fields on the far right, so at high zoom the label and field may not be on screen together. The passing one puts each label directly above its field, so the pairing is obvious.">
  <figcaption>Labels right above their fields are easy to match at any zoom level.</figcaption>
</figure>

Checkbox and radio button labels usually go to the right of the control. A search field can be labelled by a clearly worded button next to it, such as "Search", as in the W3C technique [G167, using an adjacent button to label the purpose of a field](https://www.w3.org/WAI/WCAG22/Techniques/general/G167).

## How to Test for 3.3.2 Labels or Instructions

Automated checkers find fields that have no label in the code, but they cannot tell whether a label is visible, clear or close to its field. In [our test of 10 accessibility checker tools](/blog/we-tested-10-accessibility-checker-tools), an email field labelled only by placeholder text was reported as an error by just 3 of the 10 tools, and AccessBell was not one of them. Test every form by hand:

1. **Look at each field.** Does it have a visible label that says what to enter?
2. **Start typing.** Is the label still visible once the field has text in it?
3. **Look for rules.** Is every format, length limit and password rule explained before people type?
4. **Check required fields.** Are they marked in text, not only with color?
5. **Check groups.** Do radio buttons, checkboxes and split fields have a group label and a label for each part?
6. **Zoom to 200% or use a screen magnifier.** Can you still see each label next to its field?

For a quick reference, see our [3.3.2 Labels or Instructions page](/resources/wcag/3-3-2-labels-or-instructions) in the WCAG library, and the W3C's [Understanding 3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html).

## Related Success Criteria

- [1.3.1 Info and Relationships](/resources/wcag/1-3-1-info-and-relationships): labels are connected to their fields in the code.
- [2.4.6 Headings and Labels](/resources/wcag/2-4-6-headings-and-labels): headings and labels describe their topic or purpose.
- [2.5.3 Label in Name](/resources/wcag/2-5-3-label-in-name): the visible label is part of the control's accessible name.
- [3.3.8 Accessible Authentication (Minimum)](/blog/wcag-3-3-8-accessible-authentication-minimum): sign-in forms work with password managers and paste.

Want to find form fields with no label in the code? [Run a free WCAG scan](/#scan) of any page, then check your labels and instructions by hand.

Form builders often hide labels. See what to check in [WooCommerce accessibility checker](/platforms/woocommerce-accessibility-checker), [HubSpot CMS accessibility checker](/platforms/hubspot-cms-accessibility-checker) and [Elementor accessibility checker](/platforms/elementor-accessibility-checker) forms.

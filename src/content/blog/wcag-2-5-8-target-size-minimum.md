---
title: 'WCAG 2.5.8 Target Size (Minimum) Explained in Plain English'
seoTitle: 'WCAG 2.5.8 Target Size (Minimum) Explained'
description: 'WCAG 2.5.8 Target Size (Minimum) explained simply: the 24 by 24 pixel rule, the spacing test, the five exceptions, CSS fixes and how to check your site.'
pubDate: 2026-09-29
category: 'WCAG Codes Explained'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-09-29
    note: 'First published. Checked against the W3C WCAG 2.2 Recommendation and the Understanding document for 2.5.8 Target Size (Minimum).'
related: ['wcag-2-2-checklist', 'what-you-should-know-about-wcag-2-2', 'we-tested-10-accessibility-checker-tools']
faqs:
  - q: 'What level is WCAG 2.5.8 Target Size (Minimum)?'
    a: 'Level AA. It is new in WCAG 2.2, so it applies to any site that targets WCAG 2.2 Level AA. It is not part of WCAG 2.0 or 2.1.'
  - q: 'Does the icon itself have to be 24 by 24 pixels?'
    a: 'No. 2.5.8 Target Size (Minimum) measures the target, meaning the area that responds to a click or tap. A 16 pixel icon inside a button with 4 pixels of padding on each side has a 24 by 24 pixel target and passes.'
  - q: 'What is the difference between 2.5.8 and 2.5.5?'
    a: '2.5.8 Target Size (Minimum) is Level AA and asks for 24 by 24 CSS pixels, with several exceptions. 2.5.5 Target Size (Enhanced) is Level AAA and asks for 44 by 44 CSS pixels.'
  - q: 'Do links in a paragraph have to be 24 pixels tall?'
    a: 'No. Targets inside a sentence, or whose size is limited by the line height of the surrounding text, are exempt under the inline exception.'
---

**2.5.8 Target Size (Minimum)** is the WCAG rule that makes buttons and links big enough to hit. Every clickable or tappable target should be at least **24 by 24 CSS pixels**, or have enough space around it that a slightly-off tap does not land on something else. This guide explains 2.5.8 Target Size (Minimum) in plain English, with the spacing test, the exceptions, CSS fixes and how to check your own site.

> **The official wording:** "The size of the target for pointer inputs is at least 24 by 24 CSS pixels", with exceptions for spacing, equivalent controls, inline targets, user agent controls and essential presentations. ([W3C, WCAG 2.2](https://www.w3.org/TR/WCAG22/#target-size-minimum))

## What Is 2.5.8 Target Size (Minimum)?

2.5.8 Target Size (Minimum) is a Level AA success criterion that was added in WCAG 2.2. It sits under the **Operable** principle, in the guideline on input modalities.

A **target** is the area that responds to a pointer: a mouse click, a tap or a stylus. The rule is about that area, not the visible icon. A small icon can pass if its button has enough padding.

There are two ways to pass:

1. **Size:** the target is at least 24 by 24 CSS pixels.
2. **Spacing:** if a target is smaller, imagine a circle 24 pixels across centered on it. If that circle does not overlap any other target, or the circle around another small target, it passes.

<figure>
  <img src="/images/wcag/2-5-8-target-size-minimum/size-and-spacing.svg" width="800" height="400" loading="lazy" alt="Three examples of icon buttons. Fails: three 16 by 16 pixel buttons 2 pixels apart, whose 24 pixel circles overlap. Passes on size: three 24 by 24 pixel buttons. Passes on spacing: three 16 by 16 pixel buttons 26 pixels apart, whose 24 pixel circles do not overlap.">
  <figcaption>Small targets fail when they are crowded together. Make them 24 by 24 pixels, or space them so their 24 pixel circles do not overlap.</figcaption>
</figure>

## Why 2.5.8 Target Size (Minimum) Matters

Tiny, tightly packed controls cause mis-taps for everyone. For some people they make a site unusable:

- **People with hand tremors, arthritis or limited dexterity** cannot always place a pointer precisely. A 16 pixel close button right next to a "Delete" button is a real risk.
- **People using a phone one-handed**, on a moving bus or with a larger finger pad hit neighboring targets by accident.
- **People using head pointers, eye tracking or a mouth stick** move less precisely than a mouse, so small targets take several attempts.

## Who Is Affected by 2.5.8 Target Size (Minimum)

- People with motor disabilities, including tremors and limited fine motor control
- Older adults, whose dexterity and vision may be declining
- People using touchscreens, especially on small phones
- People using alternative pointing devices such as head, eye or mouth pointers
- Anyone in an unsteady situation, such as walking or on public transport

## How to Meet 2.5.8 Target Size (Minimum)

### Give small controls a bigger hit area

The easiest fix is a minimum size on anything clickable. Keep the icon the same size and let padding do the work:

```css
/* Every icon button and icon link is at least 24 by 24 CSS pixels */
.icon-button,
.icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  min-height: 24px;
}

/* A 16 px icon with 4 px of padding on every side = a 24 px target */
.icon-button svg {
  width: 16px;
  height: 16px;
}
```

Going further helps more people. Many teams use 44 by 44 pixels on touch screens, which also meets the stricter Level AAA criterion, [2.5.5 Target Size (Enhanced)](/resources/wcag/2-5-5-target-size-enhanced).

### Or space small targets apart

If a design really needs small controls, such as a row of social icons, space them so each one's 24 pixel circle stays clear of the others. In practice that means centers at least 24 pixels apart, with nothing else clickable inside the circle.

### Know the five exceptions

<figure>
  <img src="/images/wcag/2-5-8-target-size-minimum/exceptions.svg" width="800" height="300" loading="lazy" alt="Four tiles showing exceptions to 2.5.8 Target Size (Minimum). Inline: links inside a sentence. Equivalent: a small icon next to a larger Share button that does the same job. User agent: unstyled default browser checkboxes and radio buttons. Essential: map pins whose size and position are essential.">
  <figcaption>Targets can be smaller than 24 pixels in these situations.</figcaption>
</figure>

2.5.8 Target Size (Minimum) does not apply when:

- **Spacing:** the small target passes the 24 pixel circle test described above.
- **Equivalent:** the same function is available through another control on the page that meets the size requirement.
- **Inline:** the target is in a sentence, or its size is limited by the line height of the text around it, like a link in a paragraph.
- **User agent control:** the browser decides the size and you have not changed it, such as a default checkbox.
- **Essential:** the size or position is essential or legally required, such as pins on a map.

## How to Test for 2.5.8 Target Size (Minimum)

Automated testing can check this criterion, but only if the rule is switched on. In [our test of 10 accessibility checker tools](/blog/we-tested-10-accessibility-checker-tools), only 3 of the 10, including AccessBell, caught a row of 16 pixel social icons. axe-core, the engine behind many popular checkers, ships with its target-size rule turned off by default. AccessBell turns it on for every WCAG 2.2 scan.

To test by hand:

1. Open your browser's developer tools and inspect small controls: icon buttons, close buttons, pagination links, carousel dots and social icons.
2. Check the rendered width and height of the clickable element, not just the icon inside it.
3. For anything under 24 by 24 pixels, check the spacing: is there another target within 12 pixels of its center?
4. Check whether an exception applies before marking it as a failure.

Then [run a free WCAG 2.2 scan](/tools/wcag-2-2-aa-checker) to find undersized targets across the page automatically. For a quick reference, see our [2.5.8 Target Size (Minimum) page](/resources/wcag/2-5-8-target-size-minimum) in the WCAG library.

## Related Success Criteria

- [2.5.5 Target Size (Enhanced)](/resources/wcag/2-5-5-target-size-enhanced): the Level AAA version, at 44 by 44 CSS pixels.
- [2.5.1 Pointer Gestures](/resources/wcag/2-5-1-pointer-gestures): complex gestures need a simple single-pointer alternative.
- [2.5.2 Pointer Cancellation](/resources/wcag/2-5-2-pointer-cancellation): people can back out of an accidental press.
- [2.5.7 Dragging Movements](/resources/wcag/2-5-7-dragging-movements): dragging needs a single-pointer alternative, also new in WCAG 2.2.

Another new WCAG 2.2 rule, explained the same way: [2.4.12 Focus Not Obscured (Enhanced)](/resources/wcag/2-4-12-focus-not-obscured-enhanced).

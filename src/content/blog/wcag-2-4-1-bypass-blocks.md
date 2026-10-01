---
title: 'WCAG 2.4.1 Bypass Blocks Explained in Plain English'
seoTitle: 'WCAG 2.4.1 Bypass Blocks Explained'
description: 'WCAG 2.4.1 Bypass Blocks explained simply: skip links, landmarks and headings that let keyboard and screen reader users jump past repeated menus.'
pubDate: 2026-10-01
category: 'WCAG Codes Explained'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-10-01
    note: 'First published. Checked against the W3C WCAG 2.2 Recommendation, the Understanding document for 2.4.1 Bypass Blocks and the W3C techniques it lists.'
related: ['wcag-2-1-1-keyboard', 'wcag-1-3-1-info-and-relationships', 'keyboard-accessibility-testing']
faqs:
  - q: 'What level is WCAG 2.4.1 Bypass Blocks?'
    a: 'Level A. It has been in WCAG since version 2.0.'
  - q: 'Is a skip link required by 2.4.1 Bypass Blocks?'
    a: 'Not strictly. WCAG asks for a mechanism to bypass repeated blocks. A skip link, ARIA landmarks or headings at the start of each section can all meet it. A visible skip link is the most reliable choice for sighted keyboard users, who do not have a screen reader’s landmark shortcuts.'
  - q: 'Can a skip link be hidden?'
    a: 'It can be hidden until it receives keyboard focus, which is the usual pattern. It must become visible when focused, so keyboard users can see and use it.'
  - q: 'Can automated tools test 2.4.1 Bypass Blocks?'
    a: 'Partly. Tools can check that a page has a main landmark or that a skip link points to a real target. Whether the skip link works and lands in the right place needs a quick keyboard test.'
---

**2.4.1 Bypass Blocks** is the WCAG success criterion that says people must be able to skip content that repeats on every page, such as the site header and main menu. Without a way to jump past it, keyboard users have to press Tab through dozens of links on every page before they reach the content. This guide explains WCAG 2.4.1 Bypass Blocks in plain English, with skip links, landmarks and headings, and how to test them.

> **The official wording:** "A mechanism is available to bypass blocks of content that are repeated on multiple Web pages." ([W3C, WCAG 2.2](https://www.w3.org/TR/WCAG22/#bypass-blocks))

## What Is 2.4.1 Bypass Blocks?

2.4.1 Bypass Blocks is a Level A requirement under the **Operable** principle, in the guideline "Navigable". A "block" is any chunk of content repeated across pages: the logo and header, the main navigation, a search bar, a sidebar or a long list of filters. The criterion asks for at least one way to move past those blocks quickly.

<figure>
  <img src="/images/wcag/2-4-1-bypass-blocks/skip-link.svg" width="800" height="420" loading="lazy" alt="Two versions of a page with a 12-link menu above the main content. In the failing one keyboard users must Tab through all 12 links on every page. In the passing one a focused Skip to main content link appears first and jumps straight to the main content.">
  <figcaption>A skip link turns a dozen key presses into one, on every page.</figcaption>
</figure>

## Why 2.4.1 Bypass Blocks Matters

Mouse users skip the menu without thinking: they look past it and click the content. Keyboard users move through a page one control at a time. On a store with a mega menu, that can mean 50 or more key presses before the first product, on every single page. That is slow, tiring and, for people with motor disabilities, physically painful.

## Who Is Affected by 2.4.1 Bypass Blocks

- People who use a keyboard instead of a mouse
- People who use switch devices, where every step is a deliberate action
- Screen reader users, who would otherwise hear the menu read out on every page
- People using screen magnification, who lose their place in long repeated blocks

## How to Meet 2.4.1 Bypass Blocks

### Add a skip link

Put a "Skip to main content" link as the first focusable element on the page, pointing at the main content. This is the W3C technique [G1, adding a link at the top of each page that goes directly to the main content area](https://www.w3.org/WAI/WCAG22/Techniques/general/G1).

```html
<a class="skip-link" href="#main">Skip to main content</a>
<header>…</header>
<main id="main" tabindex="-1">…</main>
```

```css
.skip-link { position: absolute; left: 8px; top: -60px; }
.skip-link:focus { top: 8px; }
```

Hide the link off screen until it receives focus, then show it clearly. `tabindex="-1"` on the target lets browsers move focus into the main content reliably.

### Use landmarks

<figure>
  <img src="/images/wcag/2-4-1-bypass-blocks/landmarks.svg" width="800" height="390" loading="lazy" alt="A page divided into header, nav, main and footer elements, which create the landmark roles banner, navigation, main and contentinfo. A screen reader landmarks list shows the four regions, with main highlighted, so users can jump straight to it.">
  <figcaption>Native HTML elements create landmarks that screen reader users can jump between.</figcaption>
</figure>

Wrap regions in `header`, `nav`, `main`, `aside` and `footer`. Screen readers list these landmarks and let users jump straight to "main". This is the W3C technique [ARIA11, using ARIA landmarks to identify regions of a page](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA11). Use one `main` per page, and label multiple `nav` elements, such as `aria-label="Footer"`.

### Start sections with headings

Headings at the start of each section let screen reader users jump through the page by heading ([H69](https://www.w3.org/WAI/WCAG22/Techniques/html/H69)). Correct heading markup also helps meet [1.3.1 Info and Relationships](/resources/wcag/1-3-1-info-and-relationships).

### Use all three

Landmarks and headings mostly help screen reader users. A visible skip link helps sighted keyboard users, who have no landmark shortcuts in most browsers. Using all three serves everyone.

## How to Test for 2.4.1 Bypass Blocks

1. **Load the page and press Tab once.** A skip link should appear as the first focused element.
2. **Press Enter on it.** Focus should land at the start of the main content, and the next Tab should go to the first link or control in the content, not back into the menu.
3. **Check other templates.** Product, blog and checkout pages often have different layouts.
4. **List the landmarks** with a screen reader or a browser extension. There should be one `main`, and the menus should be inside `nav`.
5. **Check long repeated blocks inside pages,** such as filter panels, and consider a skip link past those too.

## Related Success Criteria

- [1.3.1 Info and Relationships](/resources/wcag/1-3-1-info-and-relationships): headings and regions are marked up in the code.
- [2.1.1 Keyboard](/resources/wcag/2-1-1-keyboard): everything works with a keyboard.
- [2.4.3 Focus Order](/resources/wcag/2-4-3-focus-order): focus moves in a logical order.
- [2.4.7 Focus Visible](/resources/wcag/2-4-7-focus-visible): the skip link is visible when focused.

[Run a free WCAG scan](/#scan) to check landmarks and skip link targets, then test the skip link with your keyboard.

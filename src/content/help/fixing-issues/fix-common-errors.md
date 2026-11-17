---
title: 'Fix the Most Common Accessibility Errors'
description: 'Practical fixes for the errors AccessBell finds most often: missing alt text, unlabeled fields, low contrast, empty links and buttons, headings and page language.'
order: 2
quickStart: 5
updatedDate: 2026-09-29
sources: ['webaim-million', 'understanding']
---

A small number of issues account for most of what automated tests find on the web. Fix these and your score will rise quickly. Each issue in your dashboard also includes copyable code examples.

## Images Without Alternative Text ([WCAG 1.1.1 Non-text Content](/resources/wcag/1-1-1-non-text-content))

Screen readers cannot describe an image without an `alt` attribute.

- Describe what the image is for, not what it looks like: `alt="Download the price list"` for a linked icon.
- Use `alt=""` for decorative images so they are skipped.
- Do not start with "Image of".

## Form Fields Without Labels ([WCAG 1.3.1 Info and Relationships](/resources/wcag/1-3-1-info-and-relationships), [WCAG 4.1.2 Name, Role, Value](/resources/wcag/4-1-2-name-role-value))

Placeholder text is not a label. It disappears while typing and is not reliably announced.

```html
<label for="email">Email address</label>
<input id="email" type="email" autocomplete="email">
```

## Low Color Contrast ([WCAG 1.4.3 Contrast (Minimum)](/resources/wcag/1-4-3-contrast-minimum))

Normal text needs a contrast ratio of at least 4.5:1 with its background. Large text, at least 24px or 19px bold, needs 3:1. Fix the color in your design tokens or CSS variables so every component that uses it improves at once. Check hover, focus and placeholder states too.

## Links and Buttons With No Name ([WCAG 2.4.4 Link Purpose (In Context)](/resources/wcag/2-4-4-link-purpose-in-context), [WCAG 4.1.2 Name, Role, Value](/resources/wcag/4-1-2-name-role-value))

Icon-only links and buttons need a text name:

```html
<button type="button" aria-label="Close dialog">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>
```

Avoid vague link text such as "Click here". Say where the link goes: "Download the 2026 report".

## Heading Order (Best Practice, Supports WCAG 1.3.1)

Use one `h1` per page and do not skip levels, for example from `h2` to `h4`. If you want a heading to look smaller, change its CSS rather than its level.

## Missing Page Language ([WCAG 3.1.1 Language of Page](/resources/wcag/3-1-1-language-of-page))

Add `lang` to the `html` element so screen readers pronounce the page correctly:

```html
<html lang="en">
```

## Missing Page Title ([WCAG 2.4.2 Page Titled](/resources/wcag/2-4-2-page-titled))

Give every page a unique `<title>` that starts with the page topic, for example "Pricing - Example Co".

## Zoom Disabled ([WCAG 1.4.4 Resize Text](/resources/wcag/1-4-4-resize-text))

Remove `maximum-scale=1` and `user-scalable=no` from the viewport meta tag, so people can pinch to zoom.

## After Fixing

Deploy the change and select **Scan now** on the domain. For a deeper walkthrough of every WCAG 2.2 requirement, see our [WCAG 2.2 checklist](/blog/wcag-2-2-checklist).

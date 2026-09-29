---
title: 'Install AccessBellFix'
description: 'Add the AccessBellFix snippet to your site, validate the connection and apply fixes you approve, such as alt text and button names. Guides for popular platforms.'
order: 8
updatedDate: 2026-09-29
sources: ['mdn-script', 'mdn-aria-label', 'understanding']
---

AccessBellFix is an optional, one-line script. Once it is on your site, you can add fixes in AccessBell and it applies them in your visitors' browsers. It only applies fixes you have added and approved. It does not change your design, add a widget or make changes on its own.

## What It Can Fix

| Fix | What it does | Example |
| --- | --- | --- |
| Image alt text | Sets the `alt` text of an image, or an accessible name for an SVG or `role="img"` element | A product photo with no alt text |
| Accessible name | Sets the [`aria-label`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label) of a button, link or control | An icon-only search button |
| Page language | Sets the `lang` attribute of the page | A page with no language set |

These fixes help with WCAG 1.1.1 Non-text Content, 4.1.2 Name, Role, Value and 3.1.1 Language of Page. Fixing the source code is still the most robust option, because the fix then works everywhere, including for tools that do not run scripts. AccessBellFix is useful when you cannot change the code quickly, such as on a hosted platform or a theme you do not control.

## Install the Snippet

Find your code in either place:

- During **Add Domain**, on the **AccessBellFix** step.
- On a domain, in **Settings** > **AccessBellFix**.

It looks like this, with your own site key:

```html
<script src="https://www.accessbell.co/fix.js" data-site="YOUR-SITE-KEY" async></script>
```

Paste it once into your site's shared template, just before the closing `</head>` tag, so it loads on every page. The `async` attribute means it never blocks your page from loading.

### WordPress

Use your theme's header settings if it has them, or a plugin that adds code to the header, such as WPCode. Paste the snippet into the **Header** section and save. Avoid editing theme files directly, because theme updates overwrite them.

### Shopify

Go to **Online Store** > **Themes**, open the menu for your current theme and select **Edit code**. Open `layout/theme.liquid`, paste the snippet just before `</head>` and save.

### Wix

Go to **Settings** > **Custom code** and add new code. Paste the snippet, choose **All pages** and **Head**, and apply.

### Squarespace

Go to **Settings** > **Advanced** > **Code injection**, paste the snippet into **Header** and save. Code injection needs a plan that supports it.

### Webflow

Open **Site settings** > **Custom code**, paste the snippet into **Head code**, save and publish the site.

### Google Tag Manager

Create a **Custom HTML** tag, paste the snippet, set it to fire on **All Pages**, then submit and publish the container.

Not sure how to do it? Select **Send to my developer** to email the code and these instructions.

## Validate the Connection

Select **Validate connection**. AccessBell loads your home page and looks for your site key. It also counts as connected if the script has loaded on any of your pages in the last 7 days, which helps when a caching or tag manager setup hides the code from the home page.

If it is not found, check the change is saved and published, clear any site cache and try again.

## Add a Fix

1. Open the domain and go to **Settings** > **AccessBellFix** > **Your fixes**.
2. Choose what to fix: image alt text, accessible name or page language.
3. Enter the element's CSS selector, such as `img.hero` or `#search-button`. You can copy it from an issue's example code or from your browser's developer tools.
4. Enter the text to use and select **Add fix**.

The fix applies the next time a page loads. Turn a fix off, or delete it, at any time. Your next scan shows whether the issue is resolved.

## Who Can Do This

Members, Admins and the Owner can add and change fixes. AccessBellFix only serves fixes while your subscription or trial is active.

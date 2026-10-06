---
title: 'How to Check if Your Website Is ADA Compliant (Step by Step)'
seoTitle: 'How to Check if Your Website Is ADA Compliant'
description: 'How to check if your website is ADA compliant: run an automated WCAG scan, then test keyboard use, zoom, forms, contrast and captions by hand. A step-by-step guide.'
pubDate: 2026-10-06
category: 'Guides'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-10-06
    note: 'First published. The examples of website barriers were checked against the Department of Justice guidance on web accessibility at ADA.gov, and the manual checks against the W3C Web Accessibility Initiative''s Easy Checks and WCAG 2.2.'
related: ['ada-website-compliance-guide', 'automated-vs-manual-accessibility-testing', 'keyboard-accessibility-testing']
faqs:
  - q: 'Is there an official ADA compliance test for websites?'
    a: 'No. The Department of Justice has not published a test or certification for business websites. Its guidance points businesses to existing technical standards, and WCAG 2.1 or 2.2 Level AA is the benchmark used in practice. Checking your site means testing it against WCAG.'
  - q: 'Can a free scanner tell me if my website is ADA compliant?'
    a: 'A free scanner tells you which automated WCAG checks a page fails. It cannot confirm compliance on its own, because many WCAG requirements need a person to judge them, such as whether alt text actually describes an image or whether the keyboard focus order makes sense.'
  - q: 'How long does it take to check a website for ADA compliance?'
    a: 'An automated scan of one page takes under a minute. The manual checks in this guide take about 15 to 30 minutes per page type, such as your home page, a product page and checkout. A full audit of a large site by a specialist takes longer.'
  - q: 'How often should I check my website?'
    a: 'Every time you change a template, theme or plugin, and on a regular schedule in between. New products, blog posts and pop-ups can add barriers without anyone noticing, which is why ongoing monitoring catches more than a one-time check.'
---

If you want to check if your website is ADA compliant, there is no single button that answers yes or no. The Americans with Disabilities Act does not come with a website test of its own. What you can do is test your site against the Web Content Accessibility Guidelines (WCAG), the technical standard that the Department of Justice points to and that demand letters and settlements are measured against. This guide shows you how to check if your website is ADA compliant in about an hour, starting with an automated scan and finishing with the hands-on checks that a scanner cannot do.

You do not need to be a developer. You need a browser, a keyboard and a list of the pages that matter most to your customers.

## What "ADA Compliant" Means for a Website

The ADA covers businesses that are open to the public, and the Department of Justice has said that includes the goods and services they offer online. Its [guidance on web accessibility and the ADA](https://www.ada.gov/resources/web-guidance/) explains that businesses can choose how they make their websites accessible, and points to existing standards such as WCAG for help.

In practice, that means **WCAG 2.1 Level AA**, with **WCAG 2.2 Level AA** as the newer version. When you check your website for ADA compliance, you are really checking it against those success criteria. Our [ADA website compliance guide](/blog/ada-website-compliance-guide) covers the legal background in more detail, and the [WCAG Library](/resources/wcag) explains every criterion in plain English.

The ADA.gov guidance also lists the barriers it sees most often:

- Poor color contrast, such as light gray text on a white background
- Using color alone to give information, such as marking required form fields only in red
- Images with no text alternative (alt text)
- Videos with no captions
- Online forms without labels that a screen reader can announce
- Pages that only work with a mouse

Those six problems make a good checklist on their own, and every step below covers at least one of them.

## Step 1: Pick the Pages to Check First

You do not need to test every page on day one. Start with the pages a customer must use to buy from you or contact you:

1. Your home page
2. One page of each template: a product page, a category or collection page, a blog post
3. The cart and checkout, or your booking or quote form
4. Your contact page and any sign-up or login form

Most websites are built from a handful of templates, so a problem on one product page usually repeats on every product page. Fixing the template fixes them all.

## Step 2: Run an Automated Scan to Check Your Website for ADA Issues

An automated scan is the fastest way to check if your website is ADA compliant at the code level. It finds missing alt text, low-contrast text, unlabeled form fields, buttons and links with no name, missing page language and many other failures in seconds.

Use the free [Website Accessibility Checker](/#scan) on each of the pages from Step 1, or the [ADA Compliance Checker](/tools/ada-compliance-checker), which is preset for the WCAG 2.1 AA benchmark. Each result lists the issue, how serious it is and the WCAG criterion it fails.

Keep two limits in mind:

- **A free scan checks one URL at a time.** Other pages on your domain can have different issues, so scan each template.
- **Automated testing covers only part of WCAG.** A scanner can tell that an image has alt text, but not whether the text describes the image. Our guide to [automated vs manual accessibility testing](/blog/automated-vs-manual-accessibility-testing) explains the split.

Fix the critical and serious issues the scan finds first. Then move on to the manual checks, which the W3C's [Easy Checks](https://www.w3.org/WAI/test-evaluate/easy-checks/) also walk through.

## Step 3: Check the Page With Only a Keyboard

Many people cannot use a mouse. They move through a page with the Tab key, Shift+Tab to go back, Enter to follow links and press buttons, the Space bar for checkboxes and the arrow keys inside menus.

Put your mouse aside and try this on each page:

1. Press **Tab** from the top of the page. Can you see where you are at every step? A visible outline or highlight should move from link to link. If it disappears, the page fails [2.4.7 Focus Visible](/resources/wcag/2-4-7-focus-visible).
2. Does the focus move in a logical order, top to bottom and left to right? If it jumps around, check [2.4.3 Focus Order](/resources/wcag/2-4-3-focus-order).
3. Can you open the menu, choose a product option, add to cart and get through checkout? Anything you can only do with a mouse fails [2.1.1 Keyboard](/resources/wcag/2-1-1-keyboard).
4. Open any pop-up or cookie banner. Can you close it with the keyboard, and does focus go back to the page afterwards?

Our [keyboard accessibility testing guide](/blog/keyboard-accessibility-testing) covers this step in more depth.

## Step 4: Zoom In to 200% and 400%

People with low vision zoom in, sometimes a lot. In your browser, press **Ctrl** and **+** (or **Cmd** and **+** on a Mac) until the zoom reads 200%. Then check:

- Can you still read all the text, with nothing cut off or overlapping?
- Do buttons and menus still work?

Then zoom to 400% on a desktop-width window. The page should reflow into one column so you only scroll up and down, not sideways. These checks map to [1.4.4 Resize Text](/resources/wcag/1-4-4-resize-text) and [1.4.10 Reflow](/resources/wcag/1-4-10-reflow).

## Step 5: Check Your Forms

Forms are where accessibility problems cost you sales. For every form, check that:

- Each field has a visible label that stays visible after you start typing. Placeholder text that disappears is not a label.
- Required fields are marked with text or a symbol that is explained, not only with color.
- When you submit with a mistake, the error message says what went wrong and which field it is in.

A screen reader needs the label to be connected to the field in the code. In HTML that looks like this:

```html
<!-- Fails: the screen reader announces only "edit text" -->
<input type="email" placeholder="Email">

<!-- Passes: the label is tied to the field -->
<label for="email">Email address</label>
<input type="email" id="email" autocomplete="email">
```

The automated scan in Step 2 catches most missing labels. These checks relate to [3.3.2 Labels or Instructions](/resources/wcag/3-3-2-labels-or-instructions) and [1.3.1 Info and Relationships](/resources/wcag/1-3-1-info-and-relationships).

## Step 6: Check Images and Alt Text

Your scan tells you which images have no alt text at all. Now check that the alt text that is there makes sense. You can see it in most browsers by right-clicking an image and choosing **Inspect**, then reading the `alt` attribute.

- Product photos should describe the product, such as "Blue canvas tote bag with leather handles", not "IMG_4021" or "product image".
- Images that are only decoration should have an empty alt (`alt=""`) so screen readers skip them.
- Images of text, such as a sale banner, need alt text that repeats the words.

See [1.1.1 Non-text Content](/resources/wcag/1-1-1-non-text-content) for more examples.

## Step 7: Check Color Contrast and Color-Only Information

Normal text needs a contrast ratio of at least 4.5:1 against its background, and large text at least 3:1. Your scan flags most low-contrast text, but it can miss text over images and gradients. Check those with the free [WCAG Color Contrast Checker](/tools/contrast-checker) by entering your brand colors.

Also look for anything that relies on color alone: a red border as the only sign of an error, links that are a different color but not underlined in a paragraph, or a "sale" price shown only in red. Add a word, an icon or an underline. The rules are in [1.4.3 Contrast (Minimum)](/resources/wcag/1-4-3-contrast-minimum) and [1.4.1 Use of Color](/resources/wcag/1-4-1-use-of-color).

## Step 8: Check Videos and Audio

If your site has video, every video with speech needs accurate captions, not only auto-generated ones you have never checked. Audio-only content such as a podcast needs a transcript. Video that starts playing by itself, or anything that moves for more than five seconds, needs a way to pause it. See [1.2.2 Captions (Prerecorded)](/resources/wcag/1-2-2-captions-prerecorded).

## Step 9: Write Down What You Found and What You Fixed

Keep a simple record: the date, the pages you checked, what you found and when you fixed it. If you ever receive a demand letter, a dated record of testing and fixes is one of the first things your attorney will ask for. Our guide on what to do after an [ADA demand letter](/blog/ada-demand-letter) explains why.

## Step 10: Keep Checking Your Website After Every Change

A site that passes today can fail next week. A new product, a theme update, a plugin or a pop-up can add new barriers, and a one-time check will not catch them.

[Continuous monitoring](/solutions/continuous-monitoring) rescans your pages on a schedule and emails you when a new critical or serious issue appears. With AccessBell you can monitor up to 500 URLs per domain, see each issue with the failing code and how to fix it, and keep a dated record of your fixes in the [Compliance Vault](/solutions/compliance-vault). No tool can make a website 100% compliant or guarantee you will never be sued, but regular checks help you spot accessibility issues and fix them before a customer runs into them.

## A Quick Checklist to Check if Your Website Is ADA Compliant

| Check | How | WCAG criterion |
| --- | --- | --- |
| Automated scan | Free scanner on each key template | Many |
| Keyboard only | Tab through the whole page and checkout | 2.1.1, 2.4.3, 2.4.7 |
| Zoom | 200% and 400% | 1.4.4, 1.4.10 |
| Forms | Visible labels, clear errors | 1.3.1, 3.3.1, 3.3.2 |
| Images | Alt text that describes the image | 1.1.1 |
| Contrast and color | 4.5:1 for text, no color-only meaning | 1.4.1, 1.4.3 |
| Video and audio | Captions, transcripts, pause controls | 1.2.2, 2.2.2 |
| Records | Dates of testing and fixes | n/a |

Start with Step 2 now: [run a free scan](/#scan) of your home page and see what it finds.

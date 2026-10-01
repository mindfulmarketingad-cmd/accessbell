---
title: 'ADA Website Accessibility – How to Use AccessBell To Avoid Lawsuits'
seoTitle: 'ADA Website Accessibility: Avoid Lawsuits'
description: 'ADA website accessibility explained: who the ADA covers, whether websites count, the WCAG standard, and how to use AccessBell to avoid accessibility lawsuits.'
pubDate: 2026-10-01
category: 'Compliance'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-10-01
    note: 'First published. Legal background checked against ADA.gov, the Federal Register and the cited court decisions. Lawsuit figures from Seyfarth Shaw and UsableNet''s 2025 reports. This article is general information, not legal advice.'
related: ['ada-website-compliance-guide', 'ada-title-iii-law-for-businesses', 'what-happens-after-being-sued-for-ada-website-compliance']
faqs:
  - q: 'Does the ADA apply to my business website?'
    a: 'If your business is open to the public, very likely yes. The Department of Justice says businesses covered by Title III of the ADA must make their websites accessible. Courts disagree on some details, such as whether an online-only business is covered, but most website lawsuits are filed against businesses that sell to the public online.'
  - q: 'What standard makes a website ADA compliant?'
    a: 'The ADA does not name a technical standard for private businesses. Courts, settlements and the DOJ''s own rule for state and local governments point to WCAG 2.1 Level AA, so that is the practical target. WCAG 2.2 Level AA adds six more requirements at Levels A and AA and is a good choice for new work.'
  - q: 'Can AccessBell guarantee I will not be sued?'
    a: 'No tool can guarantee that. AccessBell finds the barriers automated testing can detect, shows you how to fix them, checks your site every day and keeps dated records of your testing and fixes. That lowers your risk and gives you evidence of good faith, but you still need to fix what it finds and test key tasks by hand.'
  - q: 'How long does it take to make a website ADA accessible?'
    a: 'It depends on the site. Many common issues, such as missing alt text, unlabeled form fields and missing page language, can be fixed in days. Template-level issues, such as menus that do not work with a keyboard, may need a developer for longer. Start with your checkout, forms and navigation.'
  - q: 'Is an accessibility widget enough for ADA compliance?'
    a: 'No. A widget changes the page in the visitor''s browser but does not fix the barriers in your code, and sites using widgets continue to be sued. Fix the code itself, and use a visitor toolbar only as an extra.'
---

**ADA website accessibility** means making sure people with disabilities can use your website, including people who are blind and use screen readers, people who cannot use a mouse and people with low vision or hearing loss. Under the Americans with Disabilities Act (ADA), businesses that serve the public can be sued if their websites shut these customers out, and thousands are every year. This guide explains what the ADA requires online, which standard to follow and how to use [AccessBell](/) to find and fix problems before they turn into a lawsuit.

> This article is general information, not legal advice. If you have received a demand letter or lawsuit, talk to a lawyer who handles ADA cases.

## What Is the ADA?

The Americans with Disabilities Act is a civil rights law signed in 1990 that bans discrimination against people with disabilities. Three of its titles matter most for businesses and websites:

- **Title I, employment:** employers with 15 or more employees cannot discriminate against qualified people with disabilities and must provide reasonable accommodations. Online job applications are part of this.
- **Title II, state and local governments:** cities, counties, public schools, public universities, courts and transit agencies must make their services accessible, including online services.
- **Title III, public accommodations:** private businesses open to the public, such as stores, restaurants, hotels, banks, doctors' offices and gyms, must give people with disabilities full and equal access to their goods and services.

Most ADA website accessibility lawsuits against businesses are filed under Title III. See our guide to [ADA Title III law for businesses](/blog/ada-title-iii-law-for-businesses) for the details.

## Does the ADA Cover Websites?

The ADA was written before most businesses had websites, so the law itself does not mention them. The Department of Justice has said for years that it does cover them: its [guidance on web accessibility and the ADA](https://www.ada.gov/resources/web-guidance/) states that businesses open to the public must make their websites accessible to people with disabilities.

Federal courts have not all agreed on how far that reaches:

- In **Robles v. Domino's Pizza** (9th Circuit, 2019), the court held that the ADA applied to Domino's website and app because they connected customers to its physical restaurants. The Supreme Court declined to review the case.
- In **Gil v. Winn-Dixie** (11th Circuit, 2021), the court held that a website was not itself a place of public accommodation, but that decision was later vacated.
- Some courts, especially federal courts in New York, have allowed claims against websites even without a physical store.

The practical answer for a business that sells or serves customers online is to treat your website as covered. That is where the lawsuits are. In 2025, plaintiffs filed **3,117 website accessibility lawsuits in U.S. federal court**, up 27% from 2024 ([Seyfarth Shaw](https://www.adatitleiii.com/2026/03/federal-court-website-accessibility-lawsuit-filings-bounce-back-in-2025/)), and New York and Florida federal courts saw the most.

Many of these cases are brought by "testers," people who visit many websites to find barriers. In **Acheson Hotels v. Laufer** (2023), the Supreme Court was asked whether testers can sue but dismissed the case as moot, so the question is still open and tester lawsuits continue.

## What Makes a Website ADA Compliant?

For private businesses, the ADA does not set a technical standard. Courts, settlements and the DOJ consistently point to the **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA**, published by the W3C.

For state and local governments, the standard is now written down. In 2024 the DOJ adopted [WCAG 2.1 Level AA](https://www.ada.gov/resources/2024-03-08-web-rule/) for their websites and mobile apps. In April 2026 it extended the compliance dates by one year, to April 26, 2027 for entities serving 50,000 people or more and April 26, 2028 for smaller ones ([Federal Register](https://www.federalregister.gov/documents/2026/04/20/2026-07663/extension-of-compliance-dates-for-nondiscrimination-on-the-basis-of-disability-accessibility-of-web)).

So for ADA website accessibility, aim for WCAG 2.1 Level AA at minimum. WCAG 2.2 adds nine new success criteria, six of them at Levels A and AA, and drops the obsolete 4.1.1 Parsing, so meeting 2.2 AA also covers 2.1 AA in practice. It is a sensible target for new work. Our guide to [what you should know about WCAG 2.2](/blog/what-you-should-know-about-wcag-2-2) explains the difference.

## The Four WCAG Principles Behind ADA Website Accessibility

Every WCAG success criterion falls under one of four principles, often shortened to POUR:

1. **Perceivable:** people can perceive all the content. Images have text alternatives, videos have captions and text has enough contrast against its background.
2. **Operable:** people can use every control. Everything works with a keyboard, nothing flashes dangerously and people have enough time to complete tasks.
3. **Understandable:** content and controls make sense. The page language is set, forms have clear labels and instructions, and errors are explained.
4. **Robust:** the site works with assistive technology. Buttons, links and form fields expose their name, role and state to screen readers.

You can browse every criterion in plain English in our [WCAG success criteria library](/resources/wcag), or work through our [WCAG 2.2 checklist](/blog/wcag-2-2-checklist).

## The ADA Website Accessibility Problems Behind Most Lawsuits

Website accessibility complaints usually describe the same handful of barriers, the kind a screen reader user hits in the first minute:

- Images and product photos with no alt text
- Form fields, such as checkout and contact forms, with no labels
- Buttons and icon links with no accessible name
- Menus, pop-ups and carousels that do not work with a keyboard
- Low color contrast on text and buttons
- PDFs, such as menus and forms, that screen readers cannot read

Almost all of these can be found by automated testing and fixed in your code. That is what AccessBell is built to do.

## How to Use AccessBell To Avoid ADA Website Accessibility Lawsuits

<figure>
  <img src="/blog/ada-website-accessibility/accessbell-workflow.svg" width="960" height="460" alt="The AccessBell workflow for ADA website accessibility in six steps: 1, scan your site against WCAG 2.1 or 2.2 AA. 2, fix critical issues first using the code shown for each one. 3, apply quick fixes with AccessBellFix. 4, check your PDFs. 5, monitor every day with email alerts. 6, keep proof in the Compliance Vault.">
  <figcaption>Six steps to find, fix and document ADA website accessibility issues with AccessBell.</figcaption>
</figure>

This 47-second demo shows the whole workflow in the AccessBell dashboard. The site in it is an example store.

<figure>
  <video controls playsinline preload="none" poster="/demo/accessbell-demo-poster.jpg" width="1920" height="1080">
    <source src="/demo/accessbell-demo.webm" type="video/webm">
    <source src="/demo/accessbell-demo.mp4" type="video/mp4">
    <a href="/demo/accessbell-demo.mp4">Download the AccessBell demo video (MP4)</a>.
  </video>
  <figcaption>The video is silent. It shows the steps below: adding a domain, finding pages, scanning, reviewing results, fixing an image with no alt text, the Compliance Vault and daily monitoring.</figcaption>
</figure>

### 1. Scan Your Whole Site Against WCAG

[Run a free scan](/#scan) of your homepage to see where you stand. Then start the 3-day free trial and add your domain. AccessBell finds your pages from your sitemap and links, up to 500 per domain, and scans each one in a real Chrome browser on desktop and mobile. Choose **WCAG 2.1 AA** or **WCAG 2.2 AA**, or the ADA preset.

### 2. Fix the Critical Issues First

Results are ranked by severity and mapped to their WCAG success criteria. Start with **Critical** issues on the pages that matter most to customers: checkout, forms, booking and navigation. Each issue shows the failing HTML and a corrected example, so a developer, or anyone comfortable editing your site, knows exactly what to change. Issues that come from a shared template are grouped, so one fix clears every page. See [how to read an issue](/resources/help-center/fixing-issues/read-an-issue).

### 3. Apply Quick Fixes With AccessBellFix

Some fixes, such as alt text, button names and the page language, can go live in minutes. With the [AccessBellFix](/resources/help-center/getting-started/install-accessbellfix) snippet on your site, you write the fix in the dashboard, select **Fix now** and it is applied for every visitor, while you update the code properly. AccessBellFix only applies fixes you approve.

### 4. Check the PDFs on Your Site

Menus, price lists and forms published as PDFs count too. AccessBell finds the PDFs linked from your pages, checks each one for tags, a title, a language, alt text and more, and fixes the title and language for you. Try a single file in the free [PDF accessibility checker](/resources/pdf-accessibility-checker).

### 5. Monitor Every Day

New products, blog posts, plugins and theme updates add new barriers. AccessBell rescans on a schedule and emails you when something new fails, so a broken checkout button is caught the next morning, not in a demand letter.

### 6. Keep Proof in the Compliance Vault

If you are ever contacted about accessibility, you will want to show what you tested, what you fixed and when. The [Compliance Vault](/resources/help-center/scans-and-reports/compliance-vault) keeps dated scan records with a verifiable fingerprint, a fix log with your remediation notes and exportable evidence packages. Add an [accessibility statement](/resources/statement-generator) to your site that tells visitors how to report a problem.

## What AccessBell Cannot Do for ADA Website Accessibility

Automated testing finds many, but not all, accessibility barriers. Some checks need a person, such as whether alt text actually describes the image or whether a page makes sense when read aloud. AccessBell lists those checks with step-by-step instructions, and our guide to [automated vs manual accessibility testing](/blog/automated-vs-manual-accessibility-testing) explains what to test by hand. Also be wary of any product that promises instant compliance: a widget alone does not fix your code. Read [why overlays fall short](/blog/accessibe-alternative).

## If You Have Already Received a Demand Letter

Do not ignore it, and do not panic. Talk to a lawyer, run a full scan so you know what the plaintiff likely found, and start fixing and documenting right away. Our guides to [responding to an ADA demand letter](/blog/ada-demand-letter) and [what happens after being sued for ADA website compliance](/blog/what-happens-after-being-sued-for-ada-website-compliance) walk through each step, and our [ADA lawsuit process](/blog/ada-lawsuit-process) guide explains how a case moves through court.

## Free ADA Website Accessibility Resources

- [ADA.gov web guidance](https://www.ada.gov/resources/web-guidance/) from the Department of Justice
- [WCAG 2 at a glance](https://www.w3.org/WAI/standards-guidelines/wcag/glance/) from the W3C Web Accessibility Initiative
- [Easy Checks: a first review of web accessibility](https://www.w3.org/WAI/test-evaluate/easy-checks/) from the W3C
- The [ADA National Network](https://adata.org/), which answers ADA questions for free
- AccessBell's free [website scan](/#scan), [color contrast checker](/resources/contrast-checker), [statement generator](/resources/statement-generator) and [Help Center](/resources/help-center)

ADA website accessibility is ongoing work, not a one-time project. [Start your 3-day free trial](/app/signup) and let AccessBell find, track and document the fixes for you, or compare your options in our list of the [best ADA compliance software for small businesses](/blog/best-ada-compliance-software-for-small-businesses).

Checking a specific platform? Use the ADA compliance checkers for [Shopify](/platforms/shopify-ada-compliance-checker), [WordPress](/platforms/wordpress-ada-compliance-checker), [WooCommerce](/platforms/woocommerce-ada-compliance-checker), [Wix](/platforms/wix-ada-compliance-checker), [Squarespace](/platforms/squarespace-ada-compliance-checker) and [Webflow](/platforms/webflow-ada-compliance-checker), or see [all ADA compliance checkers by platform](/platforms#ada-compliance-checkers).

To put this into practice, see how AccessBell handles [continuous monitoring](/solutions/continuous-monitoring), [automated fixes](/solutions/automated-fixes) and the [Compliance Vault](/solutions/compliance-vault) for documenting issues and fixes.

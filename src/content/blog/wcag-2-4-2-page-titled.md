---
title: 'WCAG 2.4.2 Page Titled Explained in Plain English'
seoTitle: 'WCAG 2.4.2 Page Titled Explained'
description: 'WCAG 2.4.2 Page Titled explained simply: how to write unique, descriptive page titles, what to do in single-page apps and how to test your titles.'
pubDate: 2026-10-01
category: 'WCAG Codes Explained'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-10-01
    note: 'First published. Checked against the W3C WCAG 2.2 Recommendation, the Understanding document for 2.4.2 Page Titled and the W3C techniques it lists.'
related: ['seo-audit', 'wcag-2-4-4-link-purpose-in-context', 'wcag-2-4-1-bypass-blocks']
faqs:
  - q: 'What level is WCAG 2.4.2 Page Titled?'
    a: 'Level A. It has been in WCAG since version 2.0.'
  - q: 'Do page titles have to be unique under 2.4.2?'
    a: 'WCAG asks for titles that describe the topic or purpose of each page. In practice, two pages with different content need different titles, or the titles do not describe them. Unique titles are also best practice for search engines.'
  - q: 'Should the site name come first or last in the title?'
    a: 'WCAG does not say, but putting the page-specific part first is more useful. Screen readers and browser tabs show the start of the title first, so people hear "Checkout: step 2 of 3" before "Trailhead Outfitters".'
  - q: 'Can automated tools test 2.4.2 Page Titled?'
    a: 'Partly. Tools reliably flag pages with no title or an empty one. Whether a title actually describes the page needs a person to judge.'
---

**2.4.2 Page Titled** is the WCAG success criterion that says every web page needs a title that describes its topic or purpose. The page title is the text in the HTML `title` element. It is shown in browser tabs, bookmarks and search results, and it is the first thing a screen reader announces when a page loads. This guide explains WCAG 2.4.2 Page Titled in plain English, how to write good titles and how to test them.

> **The official wording:** "Web pages have titles that describe topic or purpose." ([W3C, WCAG 2.2](https://www.w3.org/TR/WCAG22/#page-titled))

## What Is 2.4.2 Page Titled?

2.4.2 Page Titled is a Level A requirement under the **Operable** principle, in the guideline "Navigable". It has two parts: the page must have a title, and the title must describe the page. A title of "Home" on every page, or "Untitled document", technically exists but tells people nothing.

<figure>
  <img src="/images/wcag/2-4-2-page-titled/browser-tabs.svg" width="800" height="320" loading="lazy" alt="Two rows of browser tabs. In the failing row all three tabs say Home. In the passing row the tabs say Cart, 2 items, Trailhead; Checkout: step 2 of 3, Trailhead; and Tents, Trailhead, so each page is easy to tell apart.">
  <figcaption>Identical titles make tabs, bookmarks and history impossible to tell apart.</figcaption>
</figure>

## Why 2.4.2 Page Titled Matters

A good title answers "Where am I?" before anything else on the page loads:

- **Screen reader users** hear the title first, so it confirms they reached the right page.
- **People with cognitive or memory impairments** use titles to keep track of where they are, especially with several tabs open.
- **Everyone** uses titles to find the right tab, bookmark or history entry.
- **Search engines** show the title as the clickable headline in results, so good titles also help with SEO.

## Who Is Affected by 2.4.2 Page Titled

- People who are blind and use screen readers
- People with cognitive disabilities or short-term memory difficulties
- People with low vision who zoom in and can only see part of the screen
- People who keep many tabs open and switch between them

## How to Meet 2.4.2 Page Titled

### Give every page a title element

Every page needs one `title` element inside `head` ([H25, providing a title using the title element](https://www.w3.org/WAI/WCAG22/Techniques/html/H25)). Content management systems and site builders usually create it from a "page title" or "SEO title" field, so fill those in for every page.

### Make titles descriptive, with the specific part first

<figure>
  <img src="/images/wcag/2-4-2-page-titled/title-pattern.svg" width="800" height="230" loading="lazy" alt="A pattern for page titles: what is on this page, for example Checkout: step 2 of 3, then a separator, then the site name, Trailhead Outfitters. The resulting code is title Checkout: step 2 of 3, Trailhead Outfitters.">
  <figcaption>Lead with what is unique to the page, then add the site name.</figcaption>
</figure>

Write titles the way you would describe the page to someone: "Return policy", "Search results for tents", "Checkout: step 2 of 3". The W3C technique [G88, providing descriptive titles for web pages](https://www.w3.org/WAI/WCAG22/Techniques/general/G88) recommends this. A title that does not identify the contents of the page is failure [F25](https://www.w3.org/WAI/WCAG22/Techniques/failures/F25).

Good habits:

- Put the page-specific words first and the site name last.
- Include useful state: "Search results for tents (24 results)", "Error: payment declined", "Step 2 of 3".
- Keep it short enough to read in a tab, roughly 60 characters.
- Match the main heading of the page, so people know they are in the right place.

### Update titles in single-page apps

In React, Vue and similar apps, the page content changes without loading a new HTML document, so the title stays the same unless you change it. Update `document.title` on every route change, or use your framework's head manager. Frameworks such as Next.js set titles per route through their metadata features.

```js
// After the route changes
document.title = 'Order history | Trailhead Outfitters';
```

### Title frames and documents too

Each `iframe` should have a `title` attribute describing its content, which helps meet [4.1.2 Name, Role, Value](/resources/wcag/4-1-2-name-role-value). PDFs and other documents also need a title in their properties.

## How to Test for 2.4.2 Page Titled

1. **Check every template.** Open the homepage, a category page, a product or article, search results, the cart, checkout steps, account pages and error pages.
2. **Read the tab.** Does the title describe the page? Would you know which tab to click if you had ten open?
3. **Look for duplicates** in a site crawl or in your search console's page reports.
4. **In apps, navigate between views** and check the title changes each time.
5. **Listen with a screen reader.** The title should be announced first when the page loads.

Our [SEO audit guide](/blog/seo-audit) shows how to find missing and duplicate titles across a whole site.

## Related Success Criteria

- [2.4.4 Link Purpose (In Context)](/resources/wcag/2-4-4-link-purpose-in-context): links describe where they go.
- [2.4.6 Headings and Labels](/resources/wcag/2-4-6-headings-and-labels): headings describe their topic.
- [2.4.8 Location](/resources/wcag/2-4-8-location): people can tell where they are in a set of pages, at Level AAA.
- [4.1.2 Name, Role, Value](/resources/wcag/4-1-2-name-role-value): frames have accessible names.

[Run a free WCAG scan](/#scan) to catch missing titles, then read your titles in context to make sure they describe each page.

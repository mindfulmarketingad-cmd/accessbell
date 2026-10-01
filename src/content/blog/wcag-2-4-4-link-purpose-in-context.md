---
title: 'WCAG 2.4.4 Link Purpose (In Context) Explained in Plain English'
seoTitle: 'WCAG 2.4.4 Link Purpose (In Context) Explained'
description: 'WCAG 2.4.4 Link Purpose (In Context) explained simply: why "click here" and "read more" fail, how to write link text that works and how to test it.'
pubDate: 2026-10-01
category: 'WCAG Codes Explained'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-10-01
    note: 'First published. Checked against the W3C WCAG 2.2 Recommendation, the Understanding document for 2.4.4 Link Purpose (In Context) and the W3C techniques it lists.'
related: ['wcag-2-4-2-page-titled', 'wcag-1-1-1-non-text-content', 'seo-audit']
faqs:
  - q: 'What level is WCAG 2.4.4 Link Purpose (In Context)?'
    a: 'Level A. It has been in WCAG since version 2.0.'
  - q: 'Is "Read more" always a failure of 2.4.4?'
    a: 'Not always. Under 2.4.4 the purpose can come from the link text together with its context, such as the same sentence, paragraph, list item or table cell. A "Read more" link inside the paragraph it refers to can pass. Descriptive link text is still better, and the Level AAA criterion 2.4.9 requires it.'
  - q: 'What about image links?'
    a: 'If an image is the only content of a link, its alt text is the link text. It must describe where the link goes, such as "Trailhead home", not the picture. An image link with no alt text fails both 2.4.4 and 1.1.1.'
  - q: 'Can automated tools test 2.4.4 Link Purpose (In Context)?'
    a: 'Partly. Tools find links with no text at all, such as icon links with no name. They cannot judge whether link text is descriptive enough, so review your link text by hand.'
---

**2.4.4 Link Purpose (In Context)** is the WCAG success criterion that says people must be able to tell where a link goes from its text, or from its text plus the content around it. "Click here", "Read more" and "Learn more" repeated across a page fail for many people, because out of context every link sounds the same. This guide explains WCAG 2.4.4 Link Purpose (In Context) in plain English, how to write link text that works and how to test it.

> **The official wording:** "The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link context, except where the purpose of the link would be ambiguous to users in general." ([W3C, WCAG 2.2](https://www.w3.org/TR/WCAG22/#link-purpose-in-context))

## What Is 2.4.4 Link Purpose (In Context)?

2.4.4 Link Purpose (In Context) is a Level A requirement under the **Operable** principle, in the guideline "Navigable". "Programmatically determined link context" means content that software can tie to the link: the same sentence or paragraph, the list item it sits in, the table cell and its headers, or text referenced with `aria-describedby` or `aria-labelledby`. A heading three paragraphs earlier does not count.

The exception covers links that would be unclear to everyone, such as a link in a puzzle game whose destination is meant to be a surprise.

<figure>
  <img src="/images/wcag/2-4-4-link-purpose-in-context/link-list.svg" width="800" height="400" loading="lazy" alt="Two screen reader link lists. The failing one reads Click here, Read more, Read more, Read more and More, so every link sounds the same out of context. The passing one reads 2026 price list (PDF), Read more about tent sizes, Read more about waterproofing, Read more about returns and All camping guides, so each link says where it goes.">
  <figcaption>Screen readers can list every link on a page. Vague links become a list of identical words.</figcaption>
</figure>

## Why 2.4.4 Link Purpose (In Context) Matters

Many screen reader users skim a page by pulling up a list of its links, or by tabbing from link to link. In both cases they hear the link text with little or no surrounding content. Five links all called "Read more" leave them guessing, or force them to read the whole page to find the one they want.

Clear link text also helps people with cognitive disabilities, people using voice control (who say the link text to click it) and anyone scanning a page quickly. It helps search engines understand your pages too.

## Who Is Affected by 2.4.4 Link Purpose (In Context)

- Screen reader users who navigate by links
- Voice control users, who activate links by saying their text
- People with cognitive or learning disabilities
- People with low vision who see only part of the page at a time

## How to Meet 2.4.4 Link Purpose (In Context)

### Write link text that describes the destination

The best fix is link text that makes sense on its own: "Download the 2026 price list (PDF)" instead of "Click here". This is the W3C technique [G91, providing link text that describes the purpose of a link](https://www.w3.org/WAI/WCAG22/Techniques/general/G91), using the text of the `a` element ([H30](https://www.w3.org/WAI/WCAG22/Techniques/html/H30)). Mention file types and sizes for downloads, and say when a link opens in a new tab.

### Keep context next to the link

<figure>
  <img src="/images/wcag/2-4-4-link-purpose-in-context/card-link.svg" width="800" height="380" loading="lazy" alt="Two article cards about choosing a 2-person tent. In the failing one the link says Learn more, which only makes sense if you saw the heading. In the passing one the link says Read the 2-person tent guide, so the link text names the guide.">
  <figcaption>On cards, put the topic into the link text, or make the heading itself the link.</figcaption>
</figure>

If you keep short link text, the context must be programmatically tied to it: in the same sentence or paragraph ([H78](https://www.w3.org/WAI/WCAG22/Techniques/html/H78)), the same list item ([H77](https://www.w3.org/WAI/WCAG22/Techniques/html/H77)), or connected with ARIA. Context that is visually nearby but in unrelated markup is failure [F63](https://www.w3.org/WAI/WCAG22/Techniques/failures/F63).

On cards, a simple pattern is to make the card heading the link and drop the separate "Learn more" link.

### Use ARIA when the design needs short text

If the design must show "Read more", add the full purpose for assistive technology with `aria-label` ([ARIA8](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA8)) or by pointing to the heading with `aria-labelledby` ([ARIA7](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA7)). Keep the visible text inside the accessible name, so voice control still works ([2.5.3 Label in Name](/resources/wcag/2-5-3-label-in-name)).

```html
<h3 id="tent-guide">Choosing a 2-person tent</h3>
<a href="/guides/2-person-tents" aria-labelledby="tent-more tent-guide" id="tent-more">Read more</a>
```

### Name icon and image links

An icon-only or image-only link needs a text alternative that describes the destination, such as `aria-label="Cart, 2 items"` or alt text "Trailhead home". An image link with no accessible name is failure [F89](https://www.w3.org/WAI/WCAG22/Techniques/failures/F89) and also fails [1.1.1 Non-text Content](/resources/wcag/1-1-1-non-text-content).

## How to Test for 2.4.4 Link Purpose (In Context)

1. **List the links.** Use a screen reader's links list or a browser extension. Can you tell where each link goes from its text?
2. **Check repeated text.** Links with the same text should go to the same place. Several "Read more" links with different destinations need more context.
3. **Check icon and image links** have a name that describes the destination.
4. **Check the context rule.** If a link relies on context, is that context in the same sentence, paragraph, list item or table cell?
5. **Check downloads and new tabs** are mentioned in the link text.

## Related Success Criteria

- [2.4.9 Link Purpose (Link Only)](/resources/wcag/2-4-9-link-purpose-link-only): the Level AAA version, where link text alone must make sense.
- [1.1.1 Non-text Content](/resources/wcag/1-1-1-non-text-content): image links need text alternatives.
- [2.5.3 Label in Name](/resources/wcag/2-5-3-label-in-name): the accessible name includes the visible text.
- [2.4.6 Headings and Labels](/resources/wcag/2-4-6-headings-and-labels): headings and labels are descriptive.

[Run a free WCAG scan](/#scan) to find links with no accessible name, then read through your link text by hand.

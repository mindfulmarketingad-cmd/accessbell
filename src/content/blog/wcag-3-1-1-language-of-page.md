---
title: 'WCAG 3.1.1 Language of Page Explained in Plain English'
seoTitle: 'WCAG 3.1.1 Language of Page Explained'
description: 'WCAG 3.1.1 Language of Page explained simply: why every page needs a lang attribute, which language code to use and how to check it in seconds.'
pubDate: 2026-10-01
category: 'WCAG Codes Explained'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-10-01
    note: 'First published. Checked against the W3C WCAG 2.2 Recommendation, the Understanding document for 3.1.1 Language of Page and W3C technique H57.'
related: ['wcag-2-4-2-page-titled', 'wcag-1-3-1-info-and-relationships', 'what-you-should-know-about-wcag-2-2']
faqs:
  - q: 'What level is WCAG 3.1.1 Language of Page?'
    a: 'Level A. It has been in WCAG since version 2.0.'
  - q: 'Do I need en-US or is en enough?'
    a: 'Either passes 3.1.1 Language of Page. The primary code, such as en, is what matters. A region subtag, such as en-US or en-GB, adds detail some tools use for spelling and pronunciation.'
  - q: 'What if my page uses more than one language?'
    a: 'Set the lang attribute on the html element to the main language of the page, then mark passages in other languages with their own lang attribute. That second part is 3.1.2 Language of Parts, a Level AA criterion.'
  - q: 'Can automated tools test 3.1.1 Language of Page?'
    a: 'Mostly, yes. Tools reliably find a missing or invalid lang attribute. They cannot always tell whether the declared language matches the actual content, so check translated pages by eye.'
---

**3.1.1 Language of Page** is the WCAG success criterion that says every page must declare its main language in the code. One attribute does it: `lang` on the `html` element, such as `lang="en"` or `lang="fr"`. It tells screen readers which voice and pronunciation rules to use, and tells browsers and translation tools what language they are looking at. This guide explains WCAG 3.1.1 Language of Page in plain English, which code to use and how to check it.

> **The official wording:** "The default human language of each Web page can be programmatically determined." ([W3C, WCAG 2.2](https://www.w3.org/TR/WCAG22/#language-of-page))

## What Is 3.1.1 Language of Page?

3.1.1 Language of Page is a Level A requirement under the **Understandable** principle, in the guideline "Readable". "Default human language" means the main language the page is written in, not the programming language. "Programmatically determined" means it is in the code, where software can read it.

<figure>
  <img src="/images/wcag/3-1-1-language-of-page/screen-reader-voice.svg" width="800" height="400" loading="lazy" alt="Two versions of a French page that says Bonjour, bienvenue sur notre site. With no lang attribute, the screen reader uses its default English voice and reads it as Bon-jowr, bee-en-vee-noo, which is hard to understand. With lang fr on the html element, it switches to a French voice and pronounces it correctly.">
  <figcaption>Without a language, screen readers guess, and usually guess their default language.</figcaption>
</figure>

## Why 3.1.1 Language of Page Matters

Screen readers have different voices and pronunciation rules for each language. If a page does not say which language it is in, the screen reader uses its default. A Spanish page read by an English voice is close to unintelligible.

The language also affects:

- **Braille displays,** which use language-specific contraction rules
- **Browser translation,** which offers to translate when the page language differs from the user's
- **Hyphenation and spell checking,** which depend on the language
- **Captions and dictionaries** in some browsers and reading tools

## Who Is Affected by 3.1.1 Language of Page

- People who are blind and use screen readers or braille displays
- People with dyslexia or low vision who use text-to-speech
- People who rely on automatic translation to read a site in their own language
- People with cognitive disabilities who use reading tools that look up words

## How to Meet 3.1.1 Language of Page

### Add a lang attribute to the html element

This is the W3C technique [H57, using the language attribute on the HTML element](https://www.w3.org/WAI/WCAG22/Techniques/html/H57):

```html
<!doctype html>
<html lang="en">
```

<figure>
  <img src="/images/wcag/3-1-1-language-of-page/language-codes.svg" width="800" height="284" loading="lazy" alt="Common language codes: en English, en-US English (US), en-GB English (UK), es Spanish, fr French, de German, pt-BR Portuguese (Brazil) and zh-Hans Chinese (Simplified). The attribute goes once, on the html element, for example html lang en-US.">
  <figcaption>Use a valid language code, optionally with a region or script.</figcaption>
</figure>

### Use a valid code

Codes follow the BCP 47 standard: a two- or three-letter language code, optionally followed by a region (`en-GB`) or script (`zh-Hant`). Common mistakes include country codes used as languages (`lang="uk"` is Ukrainian, not English), made-up values such as `lang="english"`, and placeholders such as `lang="xx"`. The [W3C's guide to choosing a language tag](https://www.w3.org/International/questions/qa-choosing-language-tags) explains the format.

### Set the right language on every version of your site

On multilingual sites, each language version must set its own `lang`. The French pages need `lang="fr"`, not the English default copied from a template. In WordPress, Shopify and most site builders, the language comes from the site or store language setting, so check that it is set correctly for each locale.

### Mark passages in other languages

If a page includes a quote, product name or paragraph in another language, mark it with its own `lang` attribute. That is a separate criterion, [3.1.2 Language of Parts](/resources/wcag/3-1-2-language-of-parts).

## How to Test for 3.1.1 Language of Page

1. **View the page source** and look at the first lines. The `html` element should have a `lang` attribute.
2. **Check the value** is a valid code that matches the main language of the content.
3. **Check every template and language version,** including pages generated by apps, checkouts and help centers on subdomains.
4. **Listen with a screen reader** on a translated page. The voice should match the language.

Automated scans catch missing and invalid values reliably, so this is one of the fastest WCAG fixes you can make.

## Related Success Criteria

- [3.1.2 Language of Parts](/resources/wcag/3-1-2-language-of-parts): passages in another language are marked up.
- [1.3.1 Info and Relationships](/resources/wcag/1-3-1-info-and-relationships): structure is available in the code.
- [3.1.5 Reading Level](/resources/wcag/3-1-5-reading-level): text is written as simply as possible, at Level AAA.

[Run a free WCAG scan](/#scan) to check the language attribute on any page in seconds.

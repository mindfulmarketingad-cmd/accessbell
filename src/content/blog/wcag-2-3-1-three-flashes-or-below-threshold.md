---
title: 'WCAG 2.3.1 Three Flashes or Below Threshold Explained in Plain English'
seoTitle: 'WCAG 2.3.1 Three Flashes Explained'
description: 'WCAG 2.3.1 Three Flashes or Below Threshold explained simply: why flashing can cause seizures, the three-per-second rule and how to check video and animation.'
pubDate: 2026-10-01
category: 'WCAG Codes Explained'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-10-01
    note: 'First published. Checked against the W3C WCAG 2.2 Recommendation, the Understanding document for 2.3.1 Three Flashes or Below Threshold and the W3C techniques it lists.'
related: ['wcag-2-2-2-pause-stop-hide', 'wcag-1-4-2-audio-control', 'stories-of-web-users-with-disabilities']
faqs:
  - q: 'What level is WCAG 2.3.1 Three Flashes or Below Threshold?'
    a: 'Level A. It has been in WCAG since version 2.0, and it applies to all content on the page, because flashing anywhere on screen can affect someone.'
  - q: 'What counts as a flash?'
    a: 'A pair of opposing changes in brightness, such as light to dark and back, that is large and strong enough to matter. A flicker, a strobe effect or rapidly alternating bright images can all count.'
  - q: 'What is the red flash threshold?'
    a: 'Saturated red flashing is especially likely to trigger seizures, so WCAG treats it separately. The simplest way to avoid both the general and red flash thresholds is to never flash more than three times in any one second.'
  - q: 'Can a warning make flashing content acceptable?'
    a: 'No. A warning does not make content meet 2.3.1 Three Flashes or Below Threshold. Flashing content still fails if it exceeds the thresholds. Remove or slow down the flashing instead.'
---

**2.3.1 Three Flashes or Below Threshold** is the WCAG success criterion that protects people from content that can trigger seizures. Nothing on a page may flash more than three times in any one second, unless the flashing is small and weak enough to stay below the safety thresholds. It applies to video, animation, GIFs, games and ads. This guide explains WCAG 2.3.1 Three Flashes or Below Threshold in plain English and how to check your content.

> **The official wording:** "Web pages do not contain anything that flashes more than three times in any one second period, or the flash is below the general flash and red flash thresholds." ([W3C, WCAG 2.2](https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold))

## What Is 2.3.1 Three Flashes or Below Threshold?

2.3.1 Three Flashes or Below Threshold is a Level A requirement under the **Operable** principle, in the guideline "Seizures and Physical Reactions". A flash is a rapid change in brightness, light to dark and back. The rule has two ways to pass:

1. **Nothing flashes more than three times in any one-second period,** or
2. **The flashing is below the thresholds,** meaning it covers a small enough area of the screen and is not intensely red.

Because the effect can be so serious, this criterion applies to everything on the page, including content that otherwise does not have to be accessible.

<figure>
  <img src="/images/wcag/2-3-1-three-flashes-or-below-threshold/flash-rate.svg" width="800" height="310" loading="lazy" alt="Two timelines of one second. The failing one shows 5 flashes in one second. The passing one shows 2 flashes. More than 3 flashes in a second fails unless the flashing is below the general and red flash thresholds; the safest rule is never to flash more than 3 times a second.">
  <figcaption>Count the flashes in any one-second window. Three or fewer is the safe rule.</figcaption>
</figure>

## Why 2.3.1 Three Flashes or Below Threshold Matters

Flashing light at certain frequencies can trigger seizures in people with photosensitive epilepsy, sometimes in people who did not know they had the condition. It can also cause migraines, nausea and disorientation in others. Unlike most accessibility barriers, the harm here is physical, and it can happen before people have time to look away.

## Who Is Affected by 2.3.1 Three Flashes or Below Threshold

- People with photosensitive epilepsy
- People with other seizure disorders
- People who get migraines triggered by flashing light
- People with vestibular or sensory processing disorders

## How to Meet 2.3.1 Three Flashes or Below Threshold

### Never flash more than three times a second

The simplest approach is the W3C technique [G19, ensuring that no component of the content flashes more than three times in any 1-second period](https://www.w3.org/WAI/WCAG22/Techniques/general/G19). It does not depend on screen size or brightness, so it is safe everywhere.

### Keep any flashing area small

<figure>
  <img src="/images/wcag/2-3-1-three-flashes-or-below-threshold/flash-area.svg" width="800" height="360" loading="lazy" alt="Two animations. The failing one shows a bright red strobe effect filling the screen, which can trigger seizures. The passing one shows a small green shape that pulses gently, under 3 times a second, which cannot trigger seizures.">
  <figcaption>Large, bright and red flashing is the most dangerous combination.</figcaption>
</figure>

If something must flash faster, it must stay below the general flash and red flash thresholds. In practice that means a small flashing area. The W3C's Understanding document gives a rough guide of a flashing area no bigger than about 341 by 256 pixels on a typical screen viewed at a normal distance ([G176, keeping the flashing area small enough](https://www.w3.org/WAI/WCAG22/Techniques/general/G176)). Avoid saturated red flashing entirely.

### Check video, GIFs and animation before publishing

Common sources include strobe effects in promotional videos, lightning or explosions in game trailers, rapidly cycling banner ads and "glitch" animations. Edit them to slow down or remove the flashing. For video, photosensitivity analysis tools based on the same thresholds used in broadcasting can measure the risk.

### Respect reduced-motion settings

Honoring the `prefers-reduced-motion` media query is not required by 2.3.1, but it is good practice for any animation and helps people sensitive to motion.

```css
@media (prefers-reduced-motion: reduce) {
  .banner-animation { animation: none; }
}
```

## How to Test for 2.3.1 Three Flashes or Below Threshold

1. **Find all moving content:** videos, GIFs, animations, canvas games, ads and loading effects.
2. **Watch for rapid changes in brightness,** especially full-screen or red flashing. Step through video frame by frame where needed.
3. **Count flashes in any one-second window.** More than three needs a closer look.
4. **Measure with a photosensitivity analysis tool** for video and large animations.
5. **Check third-party ads and embeds,** which can change without your knowledge.

## Related Success Criteria

- [2.3.2 Three Flashes](/resources/wcag/2-3-2-three-flashes): no flashing more than three times a second at all, at Level AAA.
- [2.3.3 Animation from Interactions](/resources/wcag/2-3-3-animation-from-interactions): motion animation can be turned off, at Level AAA.
- [2.2.2 Pause, Stop, Hide](/resources/wcag/2-2-2-pause-stop-hide): moving content can be paused.

[Run a free WCAG scan](/#scan) for the automated checks, then review every video and animation for flashing.

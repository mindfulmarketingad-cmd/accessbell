---
title: 'WCAG 1.3.3 Sensory Characteristics Explained in Plain English'
seoTitle: 'WCAG 1.3.3 Sensory Characteristics Explained'
description: 'WCAG 1.3.3 Sensory Characteristics explained simply: why instructions cannot rely only on shape, size, position or sound, with examples and how to test.'
pubDate: 2026-10-01
category: 'WCAG Codes Explained'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-10-01
    note: 'First published. Checked against the W3C WCAG 2.2 Recommendation, the Understanding document for 1.3.3 Sensory Characteristics and the W3C techniques it lists.'
related: ['wcag-1-4-1-use-of-color', 'wcag-1-3-1-info-and-relationships', 'wcag-3-3-2-labels-or-instructions']
faqs:
  - q: 'What level is WCAG 1.3.3 Sensory Characteristics?'
    a: 'Level A. It has been in WCAG since version 2.0.'
  - q: 'Can I still say "the button on the right"?'
    a: 'Yes, as long as that is not the only way you identify it. "Select Continue, the button on the right" passes, because the button is also named. "Select the button on the right" alone fails.'
  - q: 'Is color covered by 1.3.3 Sensory Characteristics?'
    a: 'Color is listed in 1.3.3, but instructions that rely only on color are covered in more detail by 1.4.1 Use of Color. Avoid both, for example "fields in red are required".'
  - q: 'Can automated tools test 1.3.3 Sensory Characteristics?'
    a: 'No. It depends on what your instructions say, so a person needs to read them. Search your content for words like "left", "right", "above", "below", "round", "square", "large", "green" and "beep".'
---

**1.3.3 Sensory Characteristics** is the WCAG success criterion that says instructions must not depend only on how something looks, where it is or how it sounds. "Click the round button on the right" or "Start after the beep" leaves out people who cannot see the shape, whose layout is different or who cannot hear. This guide explains WCAG 1.3.3 Sensory Characteristics in plain English, with examples and how to test your content.

> **The official wording:** "Instructions provided for understanding and operating content do not rely solely on sensory characteristics of components such as shape, color, size, visual location, orientation, or sound." ([W3C, WCAG 2.2](https://www.w3.org/TR/WCAG22/#sensory-characteristics))

## What Is 1.3.3 Sensory Characteristics?

1.3.3 Sensory Characteristics is a Level A requirement under the **Perceivable** principle, in the guideline "Adaptable". It applies to instructions, the text that tells people how to understand or use something. The key word is "solely": you can mention shape or position, as long as you also name the thing in a way that does not depend on seeing or hearing it.

<figure>
  <img src="/images/wcag/1-3-3-sensory-characteristics/shape-location.svg" width="800" height="400" loading="lazy" alt="Two versions of an instruction above a panel with a round green button on the right. The failing one says Click the round button on the right to continue; round and on the right mean nothing to a screen reader or on a phone. The passing one says Select Continue to choose your delivery date, and the button is labeled Continue, which works when the layout changes or the page is read aloud.">
  <figcaption>Name the control. Its shape and position can change, or be invisible.</figcaption>
</figure>

## Why 1.3.3 Sensory Characteristics Matters

Sensory descriptions break in many common situations:

- **Screen readers** do not announce shape, size or position, so "the square icon" is meaningless.
- **Responsive layouts** move things. "The menu on the left" is at the top on a phone.
- **Zoom and magnification** show only part of the page, so "above" may be off screen.
- **Sound cues** are missed by people who are deaf, and by anyone with the sound off.

## Who Is Affected by 1.3.3 Sensory Characteristics

- People who are blind and use screen readers
- People with low vision who zoom in
- People who are deaf or hard of hearing
- People with cognitive disabilities who find spatial instructions hard to follow
- Mobile users, whose layout differs from the desktop version

## How to Meet 1.3.3 Sensory Characteristics

### Name things by their label

Refer to controls by their visible text: "Select Continue", "Use the Search field", "Open the Filters menu". If shape or position helps sighted users, add it, but not alone: "Select Continue (the green button at the bottom)". This is the W3C technique [G96, providing textual identification of items that otherwise rely only on sensory information](https://www.w3.org/WAI/WCAG22/Techniques/general/G96).

Identifying content only by its shape or location is failure [F14](https://www.w3.org/WAI/WCAG22/Techniques/failures/F14). Using a graphical symbol alone to convey information is failure [F26](https://www.w3.org/WAI/WCAG22/Techniques/failures/F26).

### Pair sounds with visible cues

<figure>
  <img src="/images/wcag/1-3-3-sensory-characteristics/sound-cue.svg" width="800" height="340" loading="lazy" alt="Two recording screens. The failing one says Start speaking after the beep, with only a sound as the cue, so deaf users never hear it. The passing one says Start when the timer reaches zero, plays a beep and also shows a Recording now label, so deaf users see when to start.">
  <figcaption>A sound can support an instruction, but a visible cue must carry the same meaning.</figcaption>
</figure>

If a sound signals something, such as a timer ending, a message arriving or recording starting, show a visible message too.

### Watch these words in your content

Review instructions, help text, error messages and video scripts for: left, right, above, below, beside, top, bottom, round, square, big, small, the icon, green, red, the beep, the chime.

### Remember color

Color is a sensory characteristic too. "Fields marked in red are required" fails. See [1.4.1 Use of Color](/resources/wcag/1-4-1-use-of-color).

## How to Test for 1.3.3 Sensory Characteristics

1. **Read every instruction** on forms, onboarding screens, help pages and error messages.
2. **Search the content** for the words listed above.
3. **For each one, ask:** could someone who cannot see the layout, or cannot hear, still follow it?
4. **Check on a phone** and at 200% zoom. Do position-based instructions still make sense?
5. **Check sound cues** have a visible equivalent.

## Related Success Criteria

- [1.4.1 Use of Color](/resources/wcag/1-4-1-use-of-color): color is not the only way to show information.
- [1.3.1 Info and Relationships](/resources/wcag/1-3-1-info-and-relationships): structure is in the code, not just the look.
- [3.3.2 Labels or Instructions](/resources/wcag/3-3-2-labels-or-instructions): forms give clear labels and instructions.

[Run a free WCAG scan](/#scan) for the code-level checks, then read through your instructions with these words in mind.

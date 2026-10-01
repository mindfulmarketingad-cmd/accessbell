---
title: 'WCAG 2.2.1 Timing Adjustable Explained in Plain English'
seoTitle: 'WCAG 2.2.1 Timing Adjustable Explained'
description: 'WCAG 2.2.1 Timing Adjustable explained simply: session timeouts and other time limits, the turn off, adjust and extend options, exceptions and how to test.'
pubDate: 2026-10-01
category: 'WCAG Codes Explained'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-10-01
    note: 'First published. Checked against the W3C WCAG 2.2 Recommendation, the Understanding document for 2.2.1 Timing Adjustable and the W3C techniques it lists.'
related: ['wcag-2-2-3-no-timing', 'wcag-2-2-2-pause-stop-hide', 'wcag-3-3-8-accessible-authentication-minimum']
faqs:
  - q: 'What level is WCAG 2.2.1 Timing Adjustable?'
    a: 'Level A. It has been in WCAG since version 2.0.'
  - q: 'Does a session timeout fail 2.2.1 Timing Adjustable?'
    a: 'Only if people cannot turn it off, adjust it or extend it. The usual fix is a warning before the session ends, with a button to stay signed in, giving at least 20 seconds to respond.'
  - q: 'What are the exceptions?'
    a: 'Real-time events such as an auction, where the time limit is part of the event; essential time limits where extending would invalidate the activity, such as a timed exam; and time limits longer than 20 hours.'
  - q: 'Do automatic page refreshes count?'
    a: 'Yes. A page that refreshes or redirects after a set time is a time limit. Using a meta refresh to reload or redirect a page on a timer is a known failure of 2.2.1.'
---

**2.2.1 Timing Adjustable** is the WCAG success criterion about time limits. If your site gives people a limited time to do something, such as a session that signs them out or a form that expires, they must be able to turn the limit off, make it longer, or extend it when warned. Otherwise people who read, type or move more slowly lose their work. This guide explains WCAG 2.2.1 Timing Adjustable in plain English, the options and exceptions, and how to test.

> **The official wording (in short):** For each time limit set by the content, people can turn it off, adjust it to at least ten times the default, or extend it after a warning, with at least 20 seconds to do so with a simple action and at least ten times, unless the limit is part of a real-time event, essential, or longer than 20 hours. ([W3C, WCAG 2.2](https://www.w3.org/TR/WCAG22/#timing-adjustable))

## What Is 2.2.1 Timing Adjustable?

2.2.1 Timing Adjustable is a Level A requirement under the **Operable** principle, in the guideline "Enough Time". It covers any time limit your content sets: session timeouts, forms that expire, timed quizzes, auto-advancing steps, and pages that refresh or redirect after a few seconds.

<figure>
  <img src="/images/wcag/2-2-1-timing-adjustable/session-timeout.svg" width="800" height="400" loading="lazy" alt="Two session timeout screens. The failing one says Session expired, please sign in again, your answers were not saved, so slow typists and screen reader users lose their work. The passing one warns Your session ends in 1:52, asks if you need more time and offers Stay signed in and Sign out buttons, with at least 20 seconds to respond.">
  <figcaption>A warning with a "Stay signed in" button is the most common way to meet 2.2.1.</figcaption>
</figure>

## Why 2.2.1 Timing Adjustable Matters

People take different amounts of time to read, understand and complete tasks. Screen reader users navigate one element at a time. People with motor disabilities type slowly. People with cognitive disabilities may need to reread instructions. Someone using a switch device can take many times longer to fill in a form. A short, fixed time limit locks these people out, often after they have done most of the work.

## Who Is Affected by 2.2.1 Timing Adjustable

- People who are blind and use screen readers
- People with motor disabilities and people using switch devices
- People with cognitive, learning or reading disabilities
- People with low vision who zoom in and read slowly
- Anyone who is interrupted while filling in a form

## How to Meet 2.2.1 Timing Adjustable

<figure>
  <img src="/images/wcag/2-2-1-timing-adjustable/options.svg" width="800" height="270" loading="lazy" alt="Every time limit needs at least one of these: Turn off, people can turn the time limit off before they meet it; Adjust, people can set it to at least 10 times the default length; Extend, a warning and at least 20 seconds to extend with a simple action, at least 10 times.">
  <figcaption>One of these three is enough, unless an exception applies.</figcaption>
</figure>

### Warn before a session ends, and let people extend it

Show a dialog before the timeout, say how long is left, and offer a single action such as "Stay signed in". Give at least 20 seconds to respond, and let people extend at least ten times. The W3C techniques [SCR16, providing a script that warns the user a time limit is about to expire](https://www.w3.org/WAI/WCAG22/Techniques/client-side-script/SCR16) and [SCR1, allowing the user to extend the default time limit](https://www.w3.org/WAI/WCAG22/Techniques/client-side-script/SCR1) describe this. Move focus to the dialog so screen reader users hear the warning.

### Let people turn limits off or make them longer

For limits that are not about security, offer a setting to turn them off ([G198](https://www.w3.org/WAI/WCAG22/Techniques/general/G198)) or set their length ([G180](https://www.w3.org/WAI/WCAG22/Techniques/general/G180)). A "Keep me signed in" checkbox at sign-in can also help ([G133](https://www.w3.org/WAI/WCAG22/Techniques/general/G133)).

### Avoid timed refreshes and redirects

Do not reload or redirect pages on a timer. Using `meta http-equiv="refresh"` to redirect after a delay is failure [F40](https://www.w3.org/WAI/WCAG22/Techniques/failures/F40), and using it to reload the page is failure [F41](https://www.w3.org/WAI/WCAG22/Techniques/failures/F41).

### Save people's work

Even when a limit applies, saving form data so people can continue after signing back in reduces the harm. See also [2.2.5 Re-authenticating](/resources/wcag/2-2-5-re-authenticating), a Level AAA criterion.

### Know the exceptions

- **Real-time:** the time limit is part of a live event, such as an auction.
- **Essential:** extending it would invalidate the activity, such as a timed test.
- **20 hours:** limits longer than 20 hours are allowed.

## How to Test for 2.2.1 Timing Adjustable

1. **List every time limit:** sessions, checkout reservations, forms, quizzes, carousels that advance steps, and auto-refreshing pages.
2. **Wait them out.** Leave a signed-in page idle and see what happens before the timeout.
3. **Check for a warning** with a simple way to extend, at least 20 seconds before the end.
4. **Use the warning with a keyboard and a screen reader.** Is it announced, and can you extend in time?
5. **Search the code** for `meta http-equiv="refresh"`.

## Related Success Criteria

- [2.2.2 Pause, Stop, Hide](/resources/wcag/2-2-2-pause-stop-hide): moving and updating content can be paused.
- [2.2.3 No Timing](/resources/wcag/2-2-3-no-timing): no time limits at all, at Level AAA.
- [2.2.5 Re-authenticating](/resources/wcag/2-2-5-re-authenticating): work is kept after signing back in, at Level AAA.
- [2.2.6 Timeouts](/resources/wcag/2-2-6-timeouts): people are told about timeouts that lose data, at Level AAA.

[Run a free WCAG scan](/#scan) to catch timed refreshes in the code, then test your session timeouts by hand.

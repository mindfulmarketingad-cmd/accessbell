---
title: 'WCAG 3.3.9 Accessible Authentication (Enhanced) Explained in Plain English'
seoTitle: 'WCAG 3.3.9 Accessible Authentication (Enhanced)'
description: 'WCAG 3.3.9 Accessible Authentication (Enhanced) explained: how it differs from 3.3.8, why image and personal-photo logins fail, fixes and how to test yours.'
pubDate: 2026-09-30
category: 'WCAG Codes Explained'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-09-30
    note: 'First published. Checked against the W3C WCAG 2.2 Recommendation and the Understanding documents for 3.3.9 Accessible Authentication (Enhanced) and 3.3.8 Accessible Authentication (Minimum).'
related: ['wcag-3-3-8-accessible-authentication-minimum', 'wcag-4-1-2-name-role-value', 'what-you-should-know-about-wcag-2-2']
faqs:
  - q: 'What level is WCAG 3.3.9 Accessible Authentication (Enhanced)?'
    a: 'Level AAA. It is new in WCAG 2.2. Most laws and contracts ask for Level AA, so 3.3.9 is usually optional, but it is a good goal for sites where login is a barrier, such as banking, health and government services.'
  - q: 'What is the difference between 3.3.8 and 3.3.9?'
    a: '3.3.8 Accessible Authentication (Minimum), Level AA, allows four exceptions: an alternative method, a supporting mechanism, recognizing objects, and recognizing content you provided yourself. 3.3.9 Accessible Authentication (Enhanced), Level AAA, keeps only the first two. Picking photos of bikes and spotting your own uploaded picture are no longer allowed as the only way in.'
  - q: 'Are passwords allowed under 3.3.9?'
    a: 'Yes, as long as people are not forced to remember and retype them. Let password managers fill the field and let people paste. That counts as a mechanism that helps with the test.'
  - q: 'Is a "click all the traffic lights" CAPTCHA acceptable?'
    a: 'Not as the only option. Under 3.3.8 it can pass through the object recognition exception, but 3.3.9 removes that exception. Offer an alternative that needs no puzzle, such as a passkey, an emailed link or a simple checkbox check with no challenge.'
  - q: 'Can an automated checker test 3.3.9?'
    a: 'Not really. A tool can find that a password field blocks pasting, but it cannot judge whether a whole sign-in flow needs a cognitive test. Walk through the flow by hand.'
---

**3.3.9 Accessible Authentication (Enhanced)** is the WCAG success criterion that says people should never have to remember, work out or recognize something just to sign in, unless there is an easier way. It tightens its Level AA sibling, 3.3.8, by removing two exceptions that let sites use picture-based tests. This guide explains WCAG 3.3.9 Accessible Authentication (Enhanced) in plain English, with examples, fixes and how to test your login.

> **The official wording (shortened):** "A cognitive function test (such as remembering a password or solving a puzzle) is not required for any step in an authentication process unless that step provides at least one of the following: Alternative: another authentication method that does not rely on a cognitive function test. Mechanism: a mechanism is available to assist the user in completing the cognitive function test." ([W3C, WCAG 2.2](https://www.w3.org/TR/WCAG22/#accessible-authentication-enhanced))

## What Is 3.3.9 Accessible Authentication (Enhanced)?

3.3.9 Accessible Authentication (Enhanced) is a Level AAA requirement under the **Understandable** principle, new in WCAG 2.2. A **cognitive function test** is a task that depends on memory, reading skill, calculation or perception: remembering a password, transcribing letters, solving a sum or a puzzle. Signing in should not depend on passing one, unless you also provide:

- **An alternative:** another way to sign in that needs no such test, or
- **A mechanism:** a tool that does the hard part, such as a password manager filling in the password.

The difference from [3.3.8 Accessible Authentication (Minimum)](/blog/wcag-3-3-8-accessible-authentication-minimum) is in the exceptions:

<figure>
  <img src="/blog/wcag-3-3-9-accessible-authentication-enhanced/exceptions-compare.svg" width="800" height="440" loading="lazy" alt="Table comparing 3.3.8 Level AA and 3.3.9 Level AAA. Alternative method: allowed in both. Mechanism such as a password manager: allowed in both. Object recognition: allowed in 3.3.8, not in 3.3.9. Personal content: allowed in 3.3.8, not in 3.3.9.">
  <figcaption>3.3.9 keeps the alternative and the mechanism, and drops the two picture-based exceptions.</figcaption>
</figure>

At Level AA, 3.3.8 lets a site ask people to **recognize objects** in pictures, or to **identify their own uploaded content**. At Level AAA, 3.3.9 does not. That is why a "select all the squares with a bus" test, or "which of these photos did you upload?", fails 3.3.9 when it is the only way in.

## Why 3.3.9 Accessible Authentication (Enhanced) Matters

Signing in is a gate. If people cannot get past it, nothing else on your site matters. Puzzle-style checks are hard for many people even when the images are clear:

- Someone with a **memory or attention disability** may not recall which photo they uploaded months ago.
- Someone with **dyslexia** may struggle with distorted text, and someone with **dyscalculia** with a sum.
- Someone with **low vision or a visual processing difference** may not be able to pick out objects in a blurry grid.
- Someone with **anxiety or fatigue** finds a timed puzzle much harder than a fresh reader would.

Removing the picture exceptions means the sign-in works for people whose difficulty is with recognition itself.

## Who Is Affected by 3.3.9 Accessible Authentication (Enhanced)

- People with cognitive, learning or memory disabilities
- People with low vision or perception differences
- People who are blind and cannot complete image challenges
- Older adults, and anyone tired, stressed or in a hurry

## How to Meet 3.3.9 Accessible Authentication (Enhanced)

First meet [3.3.8](/blog/wcag-3-3-8-accessible-authentication-minimum). Then remove any dependence on picture recognition.

### Replace picture and puzzle steps

<figure>
  <img src="/blog/wcag-3-3-9-accessible-authentication-enhanced/failing-steps.svg" width="800" height="424" loading="lazy" alt="Four login challenges: pick the pictures with a bus, which is object recognition; find the picture you uploaded, which is personal content; copy wobbly text, which is transcription; and solve 17 plus 26, which is a calculation. Each asks people to recognize, remember or work something out.">
  <figcaption>Each of these is a cognitive function test, and each needs an alternative.</figcaption>
</figure>

Do not use any of these as the only route in:

- Selecting pictures that contain an object (traffic lights, bicycles, crosswalks)
- Recognizing an image you uploaded earlier, as in "pick your security picture"
- Typing distorted text
- Solving arithmetic, puzzles or "spot the difference" tasks
- Answering security questions from memory

### Offer at least one sign-in method with no test

<figure>
  <img src="/blog/wcag-3-3-9-accessible-authentication-enhanced/passing-options.svg" width="800" height="430" loading="lazy" alt="Five sign-in options that pass: a passkey or biometric, an email or SMS link, a password manager with autofill and paste, single sign-on, and a copy-friendly one-time code that can be autofilled or pasted.">
  <figcaption>Any one of these gives people a way in that needs no cognitive test.</figcaption>
</figure>

Good options include passkeys and biometrics, a sign-in link sent by email or text, and sign-in with an existing account (single sign-on). Each must work at every step of the flow, including recovery.

### Let password managers and paste work

If you keep passwords, do not fight the browser:

```html
<label for="password">Password</label>
<input id="password" name="password" type="password" autocomplete="current-password">
```

Use the correct `autocomplete` values, such as `username`, `current-password`, `new-password` and `one-time-code`, and never block paste on a password or code field. Our guide to [3.3.8](/blog/wcag-3-3-8-accessible-authentication-minimum) covers one-time codes in more detail, and [3.3.2 Labels or Instructions](/blog/wcag-3-3-2-labels-or-instructions) covers the labels on the fields.

### If you must use a CAPTCHA

- Avoid picture-based or distorted-text CAPTCHAs.
- Prefer checks that need no user action, such as invisible risk scoring, or a simple confirmation with an easy alternative path.
- Whatever you choose, make sure a person who cannot complete it has another way in.

## How to Test for 3.3.9 Accessible Authentication (Enhanced)

Automated tools cannot judge a whole login flow, so test by hand:

1. **List every step of signing in,** including sign-up, forgotten password, two-step verification and account recovery.
2. **Mark any step that needs memory, transcription, calculation or picture recognition.**
3. **For each marked step, look for an alternative or a mechanism.** Can a password manager fill the field? Can people paste? Is there a sign-in link or passkey?
4. **Try to sign in without typing or remembering anything.** Use a password manager or a passkey, and see whether every step still works.
5. **Test with a screen reader and the keyboard,** since sign-in flows often trap both. See our [keyboard accessibility testing guide](/blog/keyboard-accessibility-testing).

Login fields with missing names or labels are a separate, easy-to-catch failure of [4.1.2 Name, Role, Value](/blog/wcag-4-1-2-name-role-value), and a [free accessibility scan](/#scan) will find those.

## Related Success Criteria

- [3.3.8 Accessible Authentication (Minimum)](/blog/wcag-3-3-8-accessible-authentication-minimum): the Level AA version, with four exceptions.
- [3.3.7 Redundant Entry](/resources/wcag/3-3-7-redundant-entry): do not ask for the same information twice in one process.
- [1.3.5 Identify Input Purpose](/resources/wcag/1-3-5-identify-input-purpose): form fields say what they collect, which helps autofill.
- [2.2.5 Re-authenticating](/resources/wcag/2-2-5-re-authenticating): when a session expires, people can continue without losing data.

Want to check your sign-in page for the issues software *can* catch? [Run a free WCAG scan](/#scan), or [start a 3-day free trial](/app/signup) to monitor up to 500 URLs per domain every day.

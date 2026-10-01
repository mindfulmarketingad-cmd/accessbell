---
title: 'WCAG 4.1.3 Status Messages Explained in Plain English'
seoTitle: 'WCAG 4.1.3 Status Messages Explained'
description: 'WCAG 4.1.3 Status Messages explained simply: what counts, how to announce it with role status, alert, progressbar or aria-live, form errors and how to test.'
pubDate: 2026-09-29
category: 'WCAG Codes Explained'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-09-29
    note: 'Added sections on progress bars, aria-live and aria-atomic, and linking form errors to fields, with two new illustrations. Checked against WAI-ARIA 1.2 and the W3C techniques ARIA19, ARIA22 and ARIA23.'
  - date: 2026-09-29
    note: 'First published. Checked against the W3C WCAG 2.2 Recommendation, the Understanding document for 4.1.3 Status Messages and WAI-ARIA 1.2.'
related: ['wcag-3-2-2-on-input', 'keyboard-accessibility-testing', 'wcag-2-aa-checklist', 'wcag-4-1-2-name-role-value']
faqs:
  - q: 'What level is WCAG 4.1.3 Status Messages?'
    a: 'Level AA. It was added in WCAG 2.1, so it applies to any site that targets WCAG 2.1 or 2.2 Level AA. It is not part of WCAG 2.0.'
  - q: 'Should I use role="status" or role="alert"?'
    a: 'Use role="status" for most messages, such as "Saved", "Added to cart" or a search result count. It waits until the screen reader has finished speaking. Save role="alert" for urgent, time-sensitive messages, because it interrupts whatever the person is listening to.'
  - q: 'Does moving focus to a message meet 4.1.3 Status Messages?'
    a: 'If a message receives focus, it is not a status message under WCAG, so 4.1.3 does not apply to it. Moving focus is sometimes right, for example to an error summary after a failed form submission. For small updates it is disruptive, because it pulls people away from what they were doing.'
  - q: 'Can an automated checker test 4.1.3 Status Messages?'
    a: 'Not reliably. A checker cannot tell which pieces of text are status messages or whether they are announced at the right moment. Test with a screen reader. AccessBell lists 4.1.3 in every report for manual review.'
---

**4.1.3 Status Messages** is the WCAG success criterion that makes sure screen reader users hear the short updates everyone else sees. Messages like "Added to cart", "12 results found", "Uploading: 60%" or "Your changes were saved" often appear on screen without moving focus. If they are not coded as status messages, a screen reader stays silent and the person has no idea anything happened. This guide explains WCAG 4.1.3 Status Messages in plain English, with code examples and how to test your pages.

> **The official wording:** "In content implemented using markup languages, status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus." ([W3C, WCAG 2.2](https://www.w3.org/TR/WCAG22/#status-messages))

## What Is 4.1.3 Status Messages?

4.1.3 Status Messages is a Level AA requirement under the **Robust** principle. It was added in WCAG 2.1. It says that when a status message appears, it must be coded with an ARIA role or property, so assistive technology can announce it **without moving focus** to it.

<figure>
  <img src="/images/wcag/4-1-3-status-messages/added-to-cart.svg" width="800" height="440" loading="lazy" alt="Two versions of a product card for a Day Pack 22L with an Add to cart button and the message Added to cart. 2 items in cart. In the failing version the message is a plain div and the screen reader stays silent. In the passing version the message has role=status and the screen reader says Added to cart. 2 items in cart.">
  <figcaption>The message looks the same on screen. Only the coded version reaches screen reader users.</figcaption>
</figure>

### What counts as a status message?

WCAG defines a status message as a change in content that is **not a change of context** and that tells people about one of these:

<figure>
  <img src="/images/wcag/4-1-3-status-messages/what-counts.svg" width="800" height="300" loading="lazy" alt="Four kinds of status message. Success after an action: Your changes were saved. Results of a search or filter: 12 results found. Progress of a slow task: Uploading 60 percent, with a progress bar. Errors after submitting a form: 3 fields need attention.">
  <figcaption>Success, results, progress and errors are the four kinds of status message WCAG describes.</figcaption>
</figure>

- **Success or results of an action:** "Saved", "Message sent", "Added to cart", "12 results found"
- **A waiting state:** "Loading…", "Searching…"
- **Progress of a process:** "Uploading: 60%", "Step 2 of 4 complete"
- **Errors:** "3 fields need attention", "That coupon code has expired"

Not everything that changes is a status message. A new page, a dialog that takes focus or content that moves focus to itself is a change of context or receives focus, so 4.1.3 Status Messages does not apply to it.

## Why 4.1.3 Status Messages Matters

A sighted person clicks "Add to cart" and sees a confirmation pop up in the corner. A screen reader user presses the same button and hears nothing. Did it work? Did they add it twice? They have to go looking for the cart to find out.

Silent status messages cause real problems:

- People **repeat actions**, such as adding an item twice or submitting a form again.
- People **miss errors** and assume a form went through.
- People **wait without knowing why**, because nothing tells them a search or upload is still running.
- People **lose their place**, if the site tries to fix the problem by moving focus to every message.

## Who Is Affected by 4.1.3 Status Messages

- People who are blind and use screen readers
- People with low vision who use screen magnifiers, who may not see a message appear outside the magnified area
- People with cognitive disabilities who use text-to-speech tools
- Anyone who relies on assistive technology to know what just happened

## How to Meet 4.1.3 Status Messages

### Use role="status" for most messages

The W3C technique [ARIA22, using role=status to present status messages](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22), is the standard fix. Put an empty container with `role="status"` in the page when it loads, then put the message text inside it when something happens:

```html
<!-- In the page from the start, empty -->
<div id="cart-status" role="status"></div>
```

```js
// Later, after the item is added
document.querySelector('#cart-status').textContent = 'Added to cart. 2 items in cart.';
```

Two details matter:

1. **The container should exist before the message.** Screen readers watch live regions that are already on the page. If you create the container and its text at the same moment, many screen readers will not announce it.
2. **Change the text inside it.** Updating `textContent` is enough. You do not need to move focus.

`role="status"` is a polite live region under [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/#status): the screen reader finishes what it is saying, then reads the message.

### Use role="alert" only for urgent messages

<figure>
  <img src="/images/wcag/4-1-3-status-messages/status-vs-alert.svg" width="800" height="400" loading="lazy" alt="Two ways to announce a message. role=status is polite and waits its turn: the screen reader finishes saying Shipping address, then says Your changes were saved. role=alert is assertive and speaks immediately: it cuts off Shipping address to say Card number is invalid.">
  <figcaption>role="status" waits for a pause. role="alert" interrupts, so keep it for messages that cannot wait.</figcaption>
</figure>

`role="alert"` is assertive: it interrupts whatever the screen reader is saying. It fits important, time-sensitive messages, such as an error that stops a payment. The W3C technique [ARIA19, using role=alert or live regions to identify errors](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA19) covers using it for errors. Overusing it is tiring, so use `role="status"` for everything else.

### Use role="log" for a stream of updates

For chat windows, activity feeds and other messages that arrive in order, use `role="log"`, as in the W3C technique [ARIA23, using role=log to identify sequential information updates](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA23). New entries are announced as they are added.

### Use role="progressbar" to show progress

For a task that takes a while, such as an upload or a multi-step import, `role="progressbar"` tells assistive technology the element is a progress indicator and exposes its value:

```html
<div role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
     aria-label="Uploading report.pdf"></div>
```

Update `aria-valuenow` as the task moves along. A progress bar is not a live region, though, and screen readers do not all speak every change to its value. So do both: keep the visual bar accurate, and also write milestones such as "Uploading, 50 percent" and "Upload complete" into your `role="status"` container.

<figure>
  <img src="/images/wcag/4-1-3-status-messages/progress-announcements.svg" width="800" height="410" loading="lazy" alt="An upload of report.pdf at 60 percent, coded as a progressbar with aria-valuenow 60. Below it, four milestone announcements a screen reader might make through a status region: Uploading 25 percent, 50 percent, 75 percent and Upload complete.">
  <figcaption>Show every step on screen, and announce the milestones.</figcaption>
</figure>

### Fine-tune with aria-live and aria-atomic

The roles above are shortcuts for two attributes. Under [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/), each role sets defaults for `aria-live` (how urgently changes are announced) and `aria-atomic` (whether the whole region or only the changed part is read):

| Role | aria-live | aria-atomic | Behavior |
| --- | --- | --- | --- |
| `status` | `polite` | `true` | Waits for a pause, then reads the whole message |
| `alert` | `assertive` | `true` | Interrupts, then reads the whole message |
| `log` | `polite` | `false` | Waits, then reads only the new entry |

When a role is not enough, you can set the attributes yourself on a container that is already in the page:

```html
<div aria-live="polite" aria-atomic="true">File has been uploaded.</div>
```

Use `aria-live="polite"` for updates that can wait and `aria-live="assertive"` for critical ones. Add `aria-atomic="true"` when the message only makes sense read as a whole, for example "3 of 12 files uploaded" where only the number changes. Support for these defaults varies between browsers and screen readers, so setting the attributes explicitly next to the role is a common precaution.

### Announce form errors and link them to their field

A validation error is a status message when it appears without moving focus. Give it a role so it is announced, and also connect it to its field so a screen reader user hears the error again when they return to the field:

```html
<input id="email" type="email" aria-invalid="true" aria-describedby="email-error">
<p id="email-error" role="alert">Enter an email address like name@example.com</p>
```

`aria-describedby` has strong support. The newer `aria-errormessage` attribute was designed for exactly this job, but support is still uneven across browsers and assistive technology, so `aria-describedby` is the safer choice today. Without either one, a person who fills in a form and presses Submit may hear nothing and assume it worked. See [3.3.1 Error Identification](/resources/wcag/3-3-1-error-identification) for the wording requirements.

<figure>
  <img src="/images/wcag/4-1-3-status-messages/error-message-link.svg" width="800" height="412" loading="lazy" alt="An email field with a red outline holds sam@example and shows the error Enter an email address like name@example.com. The input has aria-invalid true and aria-describedby email-error, which matches the id of the error paragraph, so a screen reader reads the error with the field.">
  <figcaption>The matching id ties the error to the field.</figcaption>
</figure>

### Keep messages short and clear

- Say what happened in plain words: "Saved" is better than an icon alone.
- Include the useful detail: "Added to cart. 2 items in cart."
- Do not announce every tiny change. For fast progress updates, announce milestones, such as every 25%, instead of every percent.

## How to Test for 4.1.3 Status Messages

The W3C lists missing roles as failure [F103, providing status messages that cannot be programmatically determined through role or properties](https://www.w3.org/WAI/WCAG22/Techniques/failures/F103). Automated tools cannot tell which text is a status message, so test by hand:

1. **List the messages.** Walk through key tasks, such as searching, filtering, adding to cart, saving and submitting forms, and note every message that appears without focus moving.
2. **Turn on a screen reader.** Use NVDA or JAWS on Windows, VoiceOver on a Mac or iPhone, or TalkBack on Android.
3. **Repeat each task with the keyboard.** Does the screen reader announce each message, without you moving to it?
4. **Check the code.** Each message should sit inside an element with `role="status"`, `role="alert"`, `role="log"`, `role="progressbar"` (with milestone text in a status region) or an `aria-live` attribute, and that element should be on the page before the message appears.
5. **Check the tone.** Only urgent messages should interrupt.

Our [keyboard accessibility testing guide](/blog/keyboard-accessibility-testing) covers the keyboard part of this routine. For a quick reference, see our [4.1.3 Status Messages page](/resources/wcag/4-1-3-status-messages) in the WCAG library, and the W3C's [Understanding 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

## Related Success Criteria

- [4.1.2 Name, Role, Value](/resources/wcag/4-1-2-name-role-value): controls expose their name, role and state to assistive technology.
- [3.3.1 Error Identification](/resources/wcag/3-3-1-error-identification): input errors are identified and described in text.
- [3.2.2 On Input](/resources/wcag/3-2-2-on-input): changing a setting does not cause an unexpected change of context.

Want to find the issues software *can* catch while you test status messages by hand? [Run a free WCAG scan](/#scan) of any page.

Single-page apps update content without a page load. See what to check in [React accessibility checker](/platforms/react/accessibility-checker) and [Next.js accessibility checker](/platforms/nextjs/accessibility-checker) sites.

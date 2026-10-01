---
title: 'WCAG 2.5.2 Pointer Cancellation Explained in Plain English'
seoTitle: 'WCAG 2.5.2 Pointer Cancellation Explained'
description: 'WCAG 2.5.2 Pointer Cancellation explained simply: why actions should happen on release, not on press, how people cancel accidental taps and how to test.'
pubDate: 2026-10-01
category: 'WCAG Codes Explained'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-10-01
    note: 'First published. Checked against the W3C WCAG 2.2 Recommendation, the Understanding document for 2.5.2 Pointer Cancellation and the W3C techniques it lists.'
related: ['wcag-2-5-1-pointer-gestures', 'wcag-2-5-8-target-size-minimum', 'wcag-3-2-2-on-input']
faqs:
  - q: 'What level is WCAG 2.5.2 Pointer Cancellation?'
    a: 'Level A. It was added in WCAG 2.1.'
  - q: 'What is the down-event and the up-event?'
    a: 'The down-event happens when you press a mouse button or touch the screen. The up-event happens when you let go. The standard click event fires on the up-event, inside the same element, which gives people a chance to cancel.'
  - q: 'Is it ever fine to act on the down-event?'
    a: 'Yes, when it is essential or when releasing undoes it. A piano keyboard that plays a note when pressed, or a press-and-hold button that stops when you let go, both meet 2.5.2 Pointer Cancellation.'
  - q: 'Can automated tools test 2.5.2 Pointer Cancellation?'
    a: 'No. Tools cannot tell what your event handlers do. Test by pressing a control, dragging off it and releasing, and check nothing happens.'
---

**2.5.2 Pointer Cancellation** is the WCAG success criterion that helps people recover from accidental taps and clicks. Actions should happen when people release the pointer, not the moment they press it, so they can slide off a button to cancel. If an action does run on the press, people must be able to undo it. This guide explains WCAG 2.5.2 Pointer Cancellation in plain English, with code examples and how to test.

> **The official wording (in short):** For anything operated with a single pointer, at least one is true: the down-event is not used to run the function; the function completes on the up-event and can be aborted or undone; the up-event reverses the down-event; or acting on the down-event is essential. ([W3C, WCAG 2.2](https://www.w3.org/TR/WCAG22/#pointer-cancellation))

## What Is 2.5.2 Pointer Cancellation?

2.5.2 Pointer Cancellation is a Level A requirement under the **Operable** principle, in the guideline "Input Modalities", added in WCAG 2.1. A pointer action has two moments: pressing down and releasing. If an action fires the moment the pointer goes down, there is no chance to change your mind. If it fires on release, you can move away first and nothing happens.

<figure>
  <img src="/images/wcag/2-5-2-pointer-cancellation/down-vs-up.svg" width="800" height="380" loading="lazy" alt="Two Delete account buttons. The failing one uses button.onmousedown, so the account is deleted the instant the button is pressed, and an accidental tap cannot be undone. The passing one uses button.onclick, so if pressed by mistake you can slide your finger or pointer off the button before letting go, and nothing happens.">
  <figcaption>Using click instead of mousedown gives people a way out.</figcaption>
</figure>

## Why 2.5.2 Pointer Cancellation Matters

People with tremors, limited dexterity or low vision often touch the wrong thing. People using a head pointer or eye-tracking can activate controls by accident. If a destructive action, such as deleting, buying or sending, fires on the first touch, they have no way to stop it.

## Who Is Affected by 2.5.2 Pointer Cancellation

- People with motor disabilities, such as tremors or spasms
- People with low vision who misjudge where controls are
- People with cognitive disabilities who may tap before they are sure
- Anyone using a touch screen on the move

## How to Meet 2.5.2 Pointer Cancellation

### Use standard click events

The simplest fix is to use the `click` event, which fires on release inside the element, and to use native buttons and links. This is the W3C technique [G212, using native controls to ensure functionality is triggered on the up-event](https://www.w3.org/WAI/WCAG22/Techniques/general/G212).

```js
// Fails: acts the moment the pointer goes down
deleteButton.addEventListener('mousedown', deleteAccount);
deleteButton.addEventListener('touchstart', deleteAccount);

// Passes: acts on release, and only if released over the button
deleteButton.addEventListener('click', deleteAccount);
```

Activating a function on the down-event is failure [F101](https://www.w3.org/WAI/WCAG22/Techniques/failures/F101).

<figure>
  <img src="/images/wcag/2-5-2-pointer-cancellation/cancel-steps.svg" width="800" height="240" loading="lazy" alt="How cancelling a press works: 1, press down on the button; 2, move away while still pressing; 3, release outside the button; then nothing happens and the action is cancelled. Native buttons and links already work this way because their click event fires on release, inside the element.">
  <figcaption>Pressing, moving away and releasing cancels a standard click.</figcaption>
</figure>

### Let people cancel drags

For drag and drop, let people drop an item back where it started, or press Escape, to cancel ([G210, ensuring that drag-and-drop actions can be cancelled](https://www.w3.org/WAI/WCAG22/Techniques/general/G210)).

### Offer undo for important actions

Even with up-event actions, an "Undo" option or a confirmation step for destructive actions gives extra protection.

### Know the exceptions

Acting on the down-event is fine when releasing reverses it, such as press-and-hold to talk, or when it is essential, such as playing a note on an on-screen piano.

## How to Test for 2.5.2 Pointer Cancellation

1. **Press down on each button and link,** move the pointer or finger off it, and release. Nothing should happen.
2. **Pay special attention** to custom controls, drag and drop, and anything that deletes, buys or sends.
3. **Check the code** for `mousedown`, `pointerdown` and `touchstart` handlers that trigger actions.
4. **Check drags can be cancelled** by dropping in the original place or pressing Escape.

## Related Success Criteria

- [2.5.1 Pointer Gestures](/resources/wcag/2-5-1-pointer-gestures): complex gestures have single-pointer alternatives.
- [2.5.7 Dragging Movements](/resources/wcag/2-5-7-dragging-movements): dragging has a single-pointer alternative, at Level AA.
- [2.5.8 Target Size (Minimum)](/resources/wcag/2-5-8-target-size-minimum): targets are large enough to avoid accidental taps.
- [3.3.4 Error Prevention (Legal, Financial, Data)](/resources/wcag/3-3-4-error-prevention-legal-financial-data): important actions can be checked or reversed.

[Run a free WCAG scan](/#scan) for the automated checks, then press and slide off your buttons to test cancellation.

---
title: 'WCAG 2.1.1 Keyboard Explained in Plain English'
seoTitle: 'WCAG 2.1.1 Keyboard Explained'
description: 'WCAG 2.1.1 Keyboard explained simply: why every feature must work without a mouse, the controls that most often fail, how to fix them and how to test.'
pubDate: 2026-10-01
category: 'WCAG Codes Explained'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-10-01
    note: 'First published. Checked against the W3C WCAG 2.2 Recommendation, the Understanding document for 2.1.1 Keyboard and the W3C techniques it lists.'
related: ['keyboard-accessibility-testing', 'wcag-4-1-2-name-role-value', 'wcag-2-4-12-focus-not-obscured-enhanced']
faqs:
  - q: 'What level is WCAG 2.1.1 Keyboard?'
    a: 'Level A. It has been in WCAG since version 2.0 and is one of the most important criteria, because many people cannot use a mouse at all.'
  - q: 'Does 2.1.1 Keyboard mean every element must be focusable?'
    a: 'No. Every function must work from a keyboard, which means every interactive control must be reachable and usable. Plain text, headings and images do not need to receive focus.'
  - q: 'What is the exception in 2.1.1 Keyboard?'
    a: 'Functions that depend on the path of a movement, not just where it starts and ends, such as freehand drawing or a flight simulator. Dragging an item from one place to another is not covered by the exception, because only the start and end points matter.'
  - q: 'Can automated tools test 2.1.1 Keyboard?'
    a: 'Only a little. Tools can spot some warning signs, such as scrollable areas that cannot be focused, but they cannot press keys and judge whether everything works. Test 2.1.1 Keyboard by hand, using only the keyboard.'
---

**2.1.1 Keyboard** is the WCAG success criterion that says everything on a website must work with a keyboard alone. Every link, button, menu, form, slider, carousel and dialog must be reachable with the Tab key and usable with keys such as Enter, Space and the arrow keys. This guide explains WCAG 2.1.1 Keyboard in plain English, the controls that most often fail, how to fix them and how to test your pages.

> **The official wording:** "All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes, except where the underlying function requires input that depends on the path of the user's movement and not just the endpoints." ([W3C, WCAG 2.2](https://www.w3.org/TR/WCAG22/#keyboard))

## What Is 2.1.1 Keyboard?

2.1.1 Keyboard is a Level A requirement under the **Operable** principle, in the guideline "Keyboard Accessible". "Keyboard interface" includes a physical keyboard and anything that acts like one, such as switch devices, sip-and-puff controls and on-screen keyboards. If something works with a mouse or a tap, there must be a keyboard way to do the same thing.

The phrase "without requiring specific timings" matters too: people should not have to press keys quickly or hold them for a precise time.

<figure>
  <img src="/images/wcag/2-1-1-keyboard/tab-order.svg" width="800" height="400" loading="lazy" alt="Two versions of a product page with a search field, an Add to cart button and a Size guide link, numbered in tab order. In the failing one the Add to cart control is a div with a click handler, so Tab skips it and keyboard users cannot add to cart. In the passing one it is a real button, so it is number 2 in the tab order and works with Enter and Space.">
  <figcaption>A clickable div looks like a button but never receives keyboard focus.</figcaption>
</figure>

## Why 2.1.1 Keyboard Matters

If a function only works with a mouse, some people cannot use it at all. A keyboard-only checkout cannot be completed if the "Pay now" control ignores the Enter key. A menu that only opens on hover hides every link inside it.

Keyboard access is also the foundation for other technologies. Screen readers, voice control and switch devices all work through the keyboard interface, so fixing 2.1.1 Keyboard helps far more people than keyboard users alone.

## Who Is Affected by 2.1.1 Keyboard

- People who are blind and use a screen reader, which is driven by the keyboard
- People with motor disabilities, tremors or limited hand use who cannot use a mouse precisely
- People who use switch devices, mouth sticks or sip-and-puff controls
- People who use voice control, which often sends keyboard commands
- Power users who prefer the keyboard for speed

## How to Meet 2.1.1 Keyboard

### Use native HTML controls

The most reliable fix is the simplest: use `button` for actions, `a href` for links and real form elements for input. They are focusable and respond to the right keys automatically. This is the W3C technique [H91, using HTML form controls and links](https://www.w3.org/WAI/WCAG22/Techniques/html/H91).

```html
<!-- Fails: not focusable, ignores Enter and Space -->
<div class="btn" onclick="addToCart()">Add to cart</div>

<!-- Passes -->
<button type="button" onclick="addToCart()">Add to cart</button>
```

Using only mouse events, such as `mousedown` or `mouseover`, with no keyboard equivalent is failure [F54](https://www.w3.org/WAI/WCAG22/Techniques/failures/F54). Faking links with elements that are not links, without making them focusable, is failure [F42](https://www.w3.org/WAI/WCAG22/Techniques/failures/F42).

### Make custom widgets keyboard operable

If you must build a custom control, such as a tab panel, combo box or slider, give it `tabindex="0"`, the right role and key handlers that match the [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) pattern for that widget. For example, tabs move with the arrow keys, and a dialog closes with Escape. The W3C technique [G202, ensuring keyboard control for all functionality](https://www.w3.org/WAI/WCAG22/Techniques/general/G202) describes the goal.

<figure>
  <img src="/images/wcag/2-1-1-keyboard/keyboard-keys.svg" width="800" height="300" loading="lazy" alt="The keys keyboard users rely on: Tab moves to the next control, Shift plus Tab moves back, Enter follows a link or presses a button, Space presses a button or ticks a checkbox, arrow keys work menus, radios, sliders and tabs, and Esc closes a dialog or menu.">
  <figcaption>Custom controls should respond to the same keys as their native equivalents.</figcaption>
</figure>

### Do not hide content behind hover

Menus, tooltips and "quick view" panels that open only on mouse hover need a keyboard trigger as well, such as opening on focus or on Enter. The content that appears must also be reachable with the keyboard.

### Check third-party widgets

Chat widgets, cookie banners, maps, video players and embedded booking tools are frequent sources of 2.1.1 Keyboard failures. Test them like your own code and ask vendors to fix problems, or choose an accessible alternative.

### Remember the exception

Freehand drawing and similar path-based input are exempt from 2.1.1 Keyboard. Most other interactions, including drag and drop, can be given a keyboard alternative, such as "Move up" and "Move down" buttons.

## How to Test for 2.1.1 Keyboard

Automated tools cannot test 2.1.1 Keyboard well, so test by hand. Put the mouse away and:

1. **Press Tab from the top of the page.** Every link, button and field should receive focus in turn, and you should always see where focus is.
2. **Use each control.** Press Enter on links and buttons, Space on checkboxes and buttons, arrow keys in menus, tabs, radio groups and sliders.
3. **Open and close everything:** menus, accordions, dialogs, date pickers and carousels. Check that Escape closes overlays.
4. **Complete key tasks end to end:** search, sign up, add to cart, check out, submit a form.
5. **Check that you never get stuck.** Being unable to Tab out of something is a separate failure, [2.1.2 No Keyboard Trap](/resources/wcag/2-1-2-no-keyboard-trap).

Our [keyboard accessibility testing guide](/blog/keyboard-accessibility-testing) walks through a full keyboard test step by step.

## Related Success Criteria

- [2.1.2 No Keyboard Trap](/resources/wcag/2-1-2-no-keyboard-trap): keyboard focus can always move away from a control.
- [2.1.3 Keyboard (No Exception)](/resources/wcag/2-1-3-keyboard-no-exception): the Level AAA version, with no path-based exception.
- [2.1.4 Character Key Shortcuts](/resources/wcag/2-1-4-character-key-shortcuts): single-key shortcuts can be turned off or changed.
- [2.4.3 Focus Order](/resources/wcag/2-4-3-focus-order): focus moves in a logical order.
- [2.4.7 Focus Visible](/resources/wcag/2-4-7-focus-visible): you can see which element has focus.
- [4.1.2 Name, Role, Value](/resources/wcag/4-1-2-name-role-value): custom controls expose their role and state.

[Run a free WCAG scan](/#scan) to find the code-level warning signs, then test every task with the keyboard alone.

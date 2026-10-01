---
title: 'WCAG 2.1.2 No Keyboard Trap Explained in Plain English'
seoTitle: 'WCAG 2.1.2 No Keyboard Trap Explained'
description: 'WCAG 2.1.2 No Keyboard Trap explained simply: how keyboard traps happen in widgets and embeds, why modal dialogs are not traps and how to test for them.'
pubDate: 2026-10-01
category: 'WCAG Codes Explained'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-10-01
    note: 'First published. Checked against the W3C WCAG 2.2 Recommendation, the Understanding document for 2.1.2 No Keyboard Trap and the W3C techniques it lists.'
related: ['wcag-2-1-1-keyboard', 'wcag-2-4-3-focus-order', 'keyboard-accessibility-testing']
faqs:
  - q: 'What level is WCAG 2.1.2 No Keyboard Trap?'
    a: 'Level A. It has been in WCAG since version 2.0. It is also one of four criteria that WCAG says apply to the whole page, so a trap in any part of a page means the whole page cannot conform.'
  - q: 'Is a modal dialog a keyboard trap?'
    a: 'No, as long as people can close it with the keyboard. Keeping focus inside an open modal is the correct behavior. It becomes a trap only if there is no keyboard way out, such as a close button that cannot be focused and no Escape key support.'
  - q: 'What if my widget needs a special key to exit?'
    a: 'That is allowed if you tell people. 2.1.2 No Keyboard Trap permits non-standard exit keys as long as the page explains the method, for example a code editor that says "Press Escape, then Tab, to leave the editor".'
  - q: 'Can automated tools test 2.1.2 No Keyboard Trap?'
    a: 'No. Finding a trap means moving focus into each part of the page and trying to leave it, which needs a person with a keyboard.'
---

**2.1.2 No Keyboard Trap** is the WCAG success criterion that says if keyboard users can move focus into something, they must be able to move focus out of it again. A keyboard trap is a part of a page, often an embedded map, video player, code editor or chat widget, where pressing Tab just cycles inside it forever. This guide explains WCAG 2.1.2 No Keyboard Trap in plain English, where traps come from, why modal dialogs are different and how to test.

> **The official wording:** "If keyboard focus can be moved to a component of the page using a keyboard interface, then focus can be moved away from that component using only a keyboard interface, and, if it requires more than unmodified arrow or tab keys or other standard exit methods, the user is advised of the method for moving focus away." ([W3C, WCAG 2.2](https://www.w3.org/TR/WCAG22/#no-keyboard-trap))

## What Is 2.1.2 No Keyboard Trap?

2.1.2 No Keyboard Trap is a Level A requirement under the **Operable** principle, in the guideline "Keyboard Accessible". Standard ways to move focus are Tab, Shift + Tab and the arrow keys, and Escape is a standard way to leave dialogs and menus. If a component needs anything else, the page must tell people what to press.

<figure>
  <img src="/images/wcag/2-1-2-no-keyboard-trap/trap.svg" width="800" height="400" loading="lazy" alt="Two embedded maps. In the failing one Tab cycles inside the map forever, and the only way out is to reload the page. In the passing one Tab or Escape moves on to the next link, and if a special key is needed the page says which one.">
  <figcaption>A keyboard trap leaves people stuck with no way to continue.</figcaption>
</figure>

## Why 2.1.2 No Keyboard Trap Matters

For someone who cannot use a mouse, a keyboard trap is a dead end. They cannot reach the rest of the page, cannot submit the form and often cannot even reach the browser's address bar without reloading. Because the effect is so severe, WCAG lists 2.1.2 No Keyboard Trap as one of four "non-interference" criteria: it must be met everywhere on the page, even in content that is not otherwise required to be accessible.

## Who Is Affected by 2.1.2 No Keyboard Trap

- People who use only a keyboard
- People who use switch devices, mouth sticks or other keyboard alternatives
- Screen reader users, who navigate with the keyboard
- People using voice control that sends keyboard commands

## How to Meet 2.1.2 No Keyboard Trap

### Test and fix embedded content

Traps usually come from content you did not build: maps, video players, embedded documents, rich text editors, chat widgets, payment frames and older plugins. The W3C technique [G21, ensuring that users are not trapped in content](https://www.w3.org/WAI/WCAG22/Techniques/general/G21) describes the goal. Combining content formats in a way that traps focus is failure [F10](https://www.w3.org/WAI/WCAG22/Techniques/failures/F10). Test every embed, and ask vendors to fix traps or switch to an accessible option.

### Do not override Tab without a way out

Custom components sometimes capture the Tab key, for example a code editor that inserts a tab character. That is fine only if there is a documented way to leave, such as pressing Escape first. Tell people the method right next to the component.

```html
<p id="editor-help">Press Escape, then Tab, to leave the editor.</p>
<div role="textbox" aria-multiline="true" aria-describedby="editor-help" tabindex="0">…</div>
```

### Keep modal dialogs closable

<figure>
  <img src="/images/wcag/2-1-2-no-keyboard-trap/modal-not-trap.svg" width="800" height="300" loading="lazy" alt="An open dialog titled Sign in to save your list, with Sign in and Close buttons, and focus on Close. A note explains that keeping focus inside an open dialog is expected and passes, because Close and the Escape key always let people leave.">
  <figcaption>Containing focus in a modal is correct, as long as people can always close it.</figcaption>
</figure>

Modal dialogs should keep focus inside while they are open, so people do not wander into the page behind. That is not a trap, because the dialog can be closed. Make sure:

- The close button is a real, focusable `button`.
- Escape closes the dialog.
- Focus returns to the control that opened it, which also supports [2.4.3 Focus Order](/resources/wcag/2-4-3-focus-order).

## How to Test for 2.1.2 No Keyboard Trap

1. **Tab through the entire page,** from top to bottom and back with Shift + Tab.
2. **Enter every component:** iframes, video players, maps, editors, carousels, date pickers, chat widgets and cookie banners.
3. **Try to leave each one** with Tab, Shift + Tab, the arrow keys and Escape.
4. **If a special key is needed,** check the page tells people what it is.
5. **Open and close every dialog** using only the keyboard.

Our [keyboard accessibility testing guide](/blog/keyboard-accessibility-testing) includes a full keyboard test checklist.

## Related Success Criteria

- [2.1.1 Keyboard](/resources/wcag/2-1-1-keyboard): everything works with a keyboard.
- [2.4.3 Focus Order](/resources/wcag/2-4-3-focus-order): focus moves in a logical order, including into and out of dialogs.
- [2.4.7 Focus Visible](/resources/wcag/2-4-7-focus-visible): you can see where focus is.
- [2.2.2 Pause, Stop, Hide](/resources/wcag/2-2-2-pause-stop-hide): another criterion that applies to the whole page.

[Run a free WCAG scan](/#scan) for the code-level keyboard issues, then Tab through every embed to check nothing traps you.

---
title: 'Keyboard Accessibility Testing'
seoTitle: 'Keyboard Accessibility Testing Guide'
description: 'A practical guide to keyboard accessibility testing: what to check, the exact keys to use, and a component-by-component reference table mapped to WCAG.'
pubDate: 2026-09-29
category: 'Guides'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-09-29
    note: 'First published. Keystrokes and criteria checked against the WAI-ARIA Authoring Practices Guide and the W3C WCAG 2.2 Recommendation.'
related: ['automated-vs-manual-accessibility-testing', 'wcag-2-2-checklist']
faqs:
  - q: 'What is keyboard accessibility testing?'
    a: 'Testing whether every interactive part of a page, links, buttons, forms, menus and custom widgets, can be reached and operated using only a keyboard, with no mouse, trackpad or touchscreen involved.'
  - q: 'How do I test keyboard accessibility myself?'
    a: 'Unplug your mouse, or stop touching your trackpad, and navigate your entire page using only Tab, Shift+Tab, Enter, Space, Escape and the arrow keys. If you cannot reach something, operate it or tell where you are on the page at any point, it fails.'
  - q: 'Can an automated scanner catch keyboard accessibility issues?'
    a: 'Partially. A scanner can flag some reliable signals, like a missing focus style in your CSS or a positive tabindex, but it cannot press Tab through your page and judge whether the order makes sense or a modal traps focus correctly. That needs a short manual pass.'
  - q: 'Can an accessibility overlay fix keyboard accessibility problems?'
    a: 'No. Keyboard traps, illogical focus order and missing keyboard support in custom widgets live in your page''s own JavaScript and markup. A script that runs on top of your site in the visitor''s browser cannot rewrite how your components handle focus and key events; that only gets fixed in your actual code.'
  - q: 'What is the single most common keyboard accessibility failure?'
    a: 'A missing or removed focus indicator, usually from a CSS reset that includes `outline: none` without replacing it. Without a visible focus indicator, a keyboard user has no way to see where they are on the page.'
---

A well-known complaint about [accessibility overlays](/comparisons/accessibe-vs-accessbell) sums up why keyboard testing matters: you cannot patch your way past it with a script that runs in the browser. If a custom dropdown never responds to the arrow keys, or a modal traps focus and never lets go, that is broken in your actual code, and it only gets fixed there. Keyboard accessibility testing is how you find those problems before a real keyboard user does.

## Why Keyboard Accessibility Testing Matters

- People who are blind or have low vision typically navigate by keyboard alongside a screen reader.
- People with motor disabilities may be unable to use a mouse at all, relying on a keyboard, switch device or voice-to-keyboard software.
- Power users and people with repetitive strain injuries often navigate by keyboard by choice.
- WCAG requires it directly: [2.1.1 Keyboard](/resources/wcag/2-1-1-keyboard) (Level A) requires all functionality to be operable through a keyboard interface, and [2.1.2 No Keyboard Trap](/resources/wcag/2-1-2-no-keyboard-trap) (Level A) requires that keyboard focus can always move away from any component.

Our [stories of web users with disabilities](/blog/stories-of-web-users-with-disabilities) show what this looks like for a reporter who cannot use a mouse.

## How to Test: The Basic Method

You do not need special software to start. Set your mouse aside, or disable your trackpad, and work through your page using only:

- **Tab** — move forward to the next interactive element
- **Shift + Tab** — move backward to the previous interactive element
- **Enter** — activate a link, or a button in most browsers
- **Space** — activate a button, toggle a checkbox, or scroll the page
- **Arrow keys** — move within a component, such as a radio group, menu or slider
- **Escape** — close a dialog, dropdown or menu

Start at the top of the page and press Tab repeatedly until you reach the end. At every stop, ask three questions: can I see where I am, does the order make sense, and can I do what this element is for.

## What to Check For

**A visible focus indicator.** Every interactive element needs a visible marker showing it is focused, required by [2.4.7 Focus Visible](/resources/wcag/2-4-7-focus-visible). The most common way sites break this is a CSS reset with `outline: none` and nothing put in its place. If you do restyle the default outline, keep it clearly visible against every background it can appear on, and make sure sticky headers or cookie banners never cover it, per WCAG 2.2's [2.4.11 Focus Not Obscured](/resources/wcag/2-4-11-focus-not-obscured-minimum). The stricter Level AAA version is explained in our guide to [2.4.12 Focus Not Obscured (Enhanced)](/blog/wcag-2-4-12-focus-not-obscured-enhanced).

**A logical navigation order.** Tab order should generally follow the visual reading order of the page, required by [2.4.3 Focus Order](/resources/wcag/2-4-3-focus-order). This is normally correct automatically when the underlying HTML is in a sensible order; it breaks when CSS repositions elements visually without moving them in the source, or when a positive `tabindex` value is used to force a custom order. The same mismatch also scrambles the order a screen reader reads in, which is covered by [1.3.2 Meaningful Sequence](/blog/wcag-1-3-2-meaningful-sequence).

**Nothing focusable that shouldn't be.** Elements that are not interactive, such as a `<div>` used only for layout, should not be reachable by Tab. Adding `tabindex="0"` to non-interactive elements creates confusing stops with nothing to do at them.

**No keyboard traps.** Once focus enters a component, especially a custom one like a date picker or a rich text editor, the user must always be able to leave it using standard keys. A dialog is the most common place this goes wrong: Escape should close it and return focus to whatever opened it.

**Custom widgets that behave like their native equivalent.** A `<div>` styled to look like a button is not automatically operable. If you build a custom control instead of using native HTML, it needs the keyboard behavior, and usually the ARIA role and state, that the equivalent native element would have. The [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) documents the expected keyboard interaction for every common widget pattern, and is the best reference once you go beyond native HTML controls.

## Keyboard Testing Reference Table

| Component | Keys | What to verify |
| --- | --- | --- |
| Link | `Tab` to focus, `Enter` to activate | Focus is visible; Enter follows the link |
| Button | `Tab` to focus, `Enter` or `Space` to activate | Both keys work; the action only fires once |
| Checkbox | `Tab` to focus, `Space` to toggle | State is announced and visually clear |
| Radio group | `Tab` into the group, `Arrow` keys to move and select, one `Tab` stop for the whole group | Arrow keys select within the group; the group is one stop, not one per option |
| Select / dropdown | `Tab` to focus, `Arrow` keys or typing a letter to change value, `Enter` or `Space` to open a custom version | Selecting a value does not unexpectedly submit the form |
| Combobox / autocomplete | `Arrow Down` to open and move through suggestions, `Enter` to select, `Escape` to close | Suggestions are reachable without a mouse; Escape closes without selecting |
| Modal dialog | `Tab` cycles only within the dialog, `Escape` closes it | Focus moves into the dialog on open and back to the trigger on close; background content is not reachable while open |
| Slider | `Arrow` keys to adjust, `Home` / `End` for min and max | Current value is announced as it changes |
| Menu bar | `Arrow` keys to move between items, `Enter` or `Down Arrow` to open a submenu, `Escape` to close | Only one `Tab` stop to enter the whole menu; arrow keys do the rest |
| Tabs | `Tab` to reach the tab list, `Arrow` keys to switch tabs, `Tab` again to enter the panel | Switching tabs does not require pressing Tab repeatedly |
| Tree view | `Arrow` keys to move and expand or collapse nodes | Nested items are reachable without a separate Tab stop per node |
| Scrollable region | `Tab` to focus the region if it is independently scrollable, `Arrow` keys or `Page Up` / `Page Down` to scroll | The region is reachable by keyboard at all, which is easy to miss on custom-styled scroll areas |

## Common Failures and Who Fixes Them

A free-standing scanner can catch some of this reliably: outline removed in CSS with no replacement, a positive `tabindex`, or a custom control with no keyboard event handlers and no ARIA role at all. It cannot tell you whether your tab order is logical, whether a modal traps focus correctly, or whether a custom combobox behaves the way a real one should; those need a person pressing the keys. Our guide to [automated vs. manual accessibility testing](/blog/automated-vs-manual-accessibility-testing) breaks down that split in more detail.

Either way, the fix always lives in your own code: a corrected CSS rule, an ARIA attribute, an event handler for the arrow keys. An overlay script cannot rewrite your component's JavaScript from the outside, which is exactly why keyboard problems are one of the clearest arguments for testing and fixing your actual site instead of layering something on top of it.

## A Step-by-Step Testing Checklist

1. Unplug your mouse or disable your trackpad.
2. Tab through the entire page from top to bottom, confirming a visible focus indicator at every stop.
3. Confirm the order matches the visual reading order of the page.
4. Operate every interactive element using only its expected keys, from the table above.
5. Open every modal, menu and custom widget, and confirm Escape or an equivalent lets you leave it.
6. Confirm no element traps focus and none that should not be focusable is reachable by Tab.
7. Repeat after any change to layout, CSS or custom JavaScript components, since any of the three can reintroduce a failure.

Keyboard testing takes a person, but it does not take long once it is part of your routine, and it catches issues that no automated tool, and no overlay, ever will. [Run a free scan](/#scan) to catch the automatable issues first, then work through this checklist for the rest.

Keyboard problems often come from themes and builders. See the [WordPress accessibility checker](/platforms/wordpress/accessibility-checker), [Shopify accessibility checker](/platforms/shopify/accessibility-checker) and [Elementor accessibility checker](/platforms/elementor/accessibility-checker) checkers for the usual culprits.

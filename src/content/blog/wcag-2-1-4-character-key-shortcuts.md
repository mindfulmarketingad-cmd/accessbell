---
title: 'WCAG 2.1.4 Character Key Shortcuts Explained in Plain English'
seoTitle: 'WCAG 2.1.4 Character Key Shortcuts Explained'
description: 'WCAG 2.1.4 Character Key Shortcuts explained simply: why single-key shortcuts trip up voice and keyboard users, the three ways to comply and how to test.'
pubDate: 2026-10-01
category: 'WCAG Codes Explained'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-10-01
    note: 'First published. Checked against the W3C WCAG 2.2 Recommendation, the Understanding document for 2.1.4 Character Key Shortcuts and the W3C techniques it lists.'
related: ['wcag-2-1-1-keyboard', 'wcag-2-5-3-label-in-name', 'keyboard-accessibility-testing']
faqs:
  - q: 'What level is WCAG 2.1.4 Character Key Shortcuts?'
    a: 'Level A. It was added in WCAG 2.1, so it applies to WCAG 2.1 and 2.2 targets.'
  - q: 'Are Ctrl and Alt shortcuts affected by 2.1.4?'
    a: 'No. 2.1.4 Character Key Shortcuts only covers shortcuts that use a single letter, number, punctuation or symbol key. Shortcuts that include a modifier such as Ctrl, Alt or Cmd are not covered.'
  - q: 'Does 2.1.4 apply to typing in a text field?'
    a: 'No. Typing into a focused text field is not a shortcut. The criterion is about single keys that trigger actions, such as "j" for next message or "/" to jump to search.'
  - q: 'Can automated tools test 2.1.4 Character Key Shortcuts?'
    a: 'No. Tools cannot tell which keys your scripts listen for. Check your documentation and code for single-key shortcuts, and press letter keys while focus is outside text fields to see what happens.'
---

**2.1.4 Character Key Shortcuts** is the WCAG success criterion about keyboard shortcuts that use a single character, such as pressing "s" to search or "d" to delete. These shortcuts are easy to trigger by accident, especially for people using voice control, where speaking a sentence can fire a string of shortcuts. If you use single-key shortcuts, people must be able to turn them off, remap them, or use them only when a specific component has focus. This guide explains WCAG 2.1.4 Character Key Shortcuts in plain English.

> **The official wording (in short):** If a keyboard shortcut uses only letter, punctuation, number or symbol characters, then it can be turned off, it can be remapped to include a non-printable key such as Ctrl or Alt, or it is only active when its component has focus. ([W3C, WCAG 2.2](https://www.w3.org/TR/WCAG22/#character-key-shortcuts))

## What Is 2.1.4 Character Key Shortcuts?

2.1.4 Character Key Shortcuts is a Level A requirement under the **Operable** principle, in the guideline "Keyboard Accessible", added in WCAG 2.1. It applies only to shortcuts made of a single printable character, such as `j`, `k`, `?`, `/` or `1`. Shortcuts that need a modifier key, such as Ctrl + S, are not covered.

<figure>
  <img src="/images/wcag/2-1-4-character-key-shortcuts/voice-dictation.svg" width="800" height="380" loading="lazy" alt="Two pages where a voice user dictates Search for socks. In the failing one, single-key shortcuts such as s for Search, f for Favorite, o for Open and c for Comment mean each letter spoken triggers a different action. In the passing one, a Keyboard shortcuts setting is turned off, so the words are typed and nothing else happens.">
  <figcaption>Voice control sends speech as keystrokes, so single-key shortcuts fire when people dictate.</figcaption>
</figure>

## Why 2.1.4 Character Key Shortcuts Matters

- **Voice control users** dictate text that arrives as keystrokes. If focus is not in a text field, every letter of a sentence can trigger a shortcut: archive, delete, reply.
- **Keyboard users with tremors or limited dexterity** press keys by accident more often, and a single stray key can do something unexpected.
- **People who use switch devices or on-screen keyboards** can trigger shortcuts without meaning to.

## Who Is Affected by 2.1.4 Character Key Shortcuts

- People who use speech recognition software
- People with motor disabilities who make accidental key presses
- Keyboard-only users and people using alternative keyboards

## How to Meet 2.1.4 Character Key Shortcuts

<figure>
  <img src="/images/wcag/2-1-4-character-key-shortcuts/three-options.svg" width="800" height="240" loading="lazy" alt="Three ways to meet 2.1.4: Turn off, a setting switches single-key shortcuts off; Remap, people can change a shortcut to include Ctrl, Alt or another modifier key; Only on focus, the shortcut works only while its own component, such as a list or player, has focus.">
  <figcaption>You only need one of the three, but offering a setting to turn shortcuts off is the simplest.</figcaption>
</figure>

### Option 1: Let people turn shortcuts off

Add a setting that disables single-key shortcuts and remember the choice. This is part of the W3C technique [G217, providing a mechanism to allow users to remap or turn off character key shortcuts](https://www.w3.org/WAI/WCAG22/Techniques/general/G217).

### Option 2: Let people remap shortcuts

Let people change a shortcut so it includes a modifier key, such as Ctrl + J instead of J.

### Option 3: Only listen while the component has focus

Attach the key handler to the component itself, not the whole document. Single-key commands inside a focused list, media player or menu are fine, because they only work there.

```js
// Fails: listens everywhere on the page
document.addEventListener('keydown', (e) => { if (e.key === 'd') deleteMessage(); });

// Passes: only active while the message list has focus
messageList.addEventListener('keydown', (e) => { if (e.key === 'd') deleteMessage(); });
```

Implementing character key shortcuts that cannot be turned off or remapped is failure [F99](https://www.w3.org/WAI/WCAG22/Techniques/failures/F99).

### Prefer modifier keys for new shortcuts

If you are designing shortcuts, use a modifier key from the start. Remember to document them, and make sure every shortcut action is also available through normal controls.

## How to Test for 2.1.4 Character Key Shortcuts

1. **Check documentation and code** for keyboard shortcuts, including those added by third-party scripts such as chat, search or editor widgets.
2. **Click on an empty part of the page** so no text field has focus, then press letter, number and punctuation keys. Note anything that happens.
3. **For each single-key shortcut,** check it can be turned off or remapped, or only works while its component has focus.
4. **Try voice dictation** with focus outside a text field, if you have it available.

## Related Success Criteria

- [2.1.1 Keyboard](/resources/wcag/2-1-1-keyboard): everything works with a keyboard.
- [2.1.2 No Keyboard Trap](/resources/wcag/2-1-2-no-keyboard-trap): focus can always move on.
- [2.5.3 Label in Name](/resources/wcag/2-5-3-label-in-name): another criterion that supports voice control users.
- [3.2.2 On Input](/resources/wcag/3-2-2-on-input): input does not cause unexpected changes.

[Run a free WCAG scan](/#scan) for the automated checks, then press single keys on your pages to look for shortcuts.

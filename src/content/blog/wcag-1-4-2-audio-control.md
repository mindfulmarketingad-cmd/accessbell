---
title: 'WCAG 1.4.2 Audio Control Explained in Plain English'
seoTitle: 'WCAG 1.4.2 Audio Control Explained'
description: 'WCAG 1.4.2 Audio Control explained simply: the 3-second rule for autoplaying sound, the pause, stop and volume controls required, and how to test.'
pubDate: 2026-10-01
category: 'WCAG Codes Explained'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-10-01
    note: 'First published. Checked against the W3C WCAG 2.2 Recommendation, the Understanding document for 1.4.2 Audio Control and the W3C techniques it lists.'
related: ['wcag-2-2-2-pause-stop-hide', 'wcag-1-2-2-captions-prerecorded', 'wcag-2-1-2-no-keyboard-trap']
faqs:
  - q: 'What level is WCAG 1.4.2 Audio Control?'
    a: 'Level A. It has been in WCAG since version 2.0. It is one of four criteria that apply to the whole page, so autoplaying sound anywhere on a page affects the whole page.'
  - q: 'Is a muted autoplay video a problem under 1.4.2?'
    a: 'No. 1.4.2 Audio Control is only about sound. A muted background video does not fail 1.4.2, though moving content for more than five seconds needs a pause control under 2.2.2 Pause, Stop, Hide.'
  - q: 'Does the system volume count as a control?'
    a: 'No. The volume control has to be independent of the overall system volume, because turning the system volume down also silences the screen reader. People need to quiet your audio without silencing their assistive technology.'
  - q: 'Where should the pause button go?'
    a: 'Near the start of the page, so keyboard and screen reader users reach it quickly. A control at the bottom of a long page is hard to find while audio is talking over the screen reader.'
---

**1.4.2 Audio Control** is the WCAG success criterion about sound that starts playing on its own. If audio plays automatically for more than 3 seconds, people must be able to pause it, stop it or turn its volume down independently. Autoplaying sound is especially disruptive for screen reader users, whose speech is drowned out. This guide explains WCAG 1.4.2 Audio Control in plain English, what to provide and how to test.

> **The official wording:** "If any audio on a Web page plays automatically for more than 3 seconds, either a mechanism is available to pause or stop the audio, or a mechanism is available to control audio volume independently from the overall system volume level." ([W3C, WCAG 2.2](https://www.w3.org/TR/WCAG22/#audio-control))

## What Is 1.4.2 Audio Control?

1.4.2 Audio Control is a Level A requirement under the **Perceivable** principle, in the guideline "Distinguishable". It covers any sound that starts without the user asking: background music, a hero video with sound, an autoplaying ad, an audio greeting or a chat widget that speaks.

<figure>
  <img src="/images/wcag/1-4-2-audio-control/autoplay.svg" width="800" height="400" loading="lazy" alt="Two pages with a background video playing with sound. In the failing one there is no control and the sound plays on and on, drowning out screen reader speech. In the passing one Pause video and Mute buttons come first on the page, so the sound can be paused or muted.">
  <figcaption>Put the pause or mute control first, so people can find it while the audio is playing.</figcaption>
</figure>

## Why 1.4.2 Audio Control Matters

Screen reader users hear the page through speech. When other audio plays at the same time, they cannot hear the screen reader, which makes it very hard to find the control that would stop the sound. Turning down the computer's volume does not help, because it also turns down the screen reader.

Because of this, 1.4.2 Audio Control is one of WCAG's "non-interference" criteria: it applies to all content on the page, even content that is not otherwise required to be accessible.

Autoplaying sound is also a problem for people with attention-related or sensory processing disabilities, and for anyone browsing in a quiet office.

## Who Is Affected by 1.4.2 Audio Control

- People who are blind and use screen readers
- People who are hard of hearing and struggle to separate sounds
- People with cognitive, attention-related or sensory processing disabilities
- Anyone in a quiet place, or who is surprised by sudden sound

## How to Meet 1.4.2 Audio Control

### Best: do not autoplay sound

The simplest way to meet 1.4.2 Audio Control is to play sound only when people choose to ([G171, playing sounds only on user request](https://www.w3.org/WAI/WCAG22/Techniques/general/G171)). Use the `controls` attribute and leave out `autoplay`, or autoplay with `muted`.

```html
<!-- Fails if it has sound and lasts over 3 seconds -->
<video src="/hero.mp4" autoplay loop></video>

<!-- Passes: muted autoplay, or user-started playback -->
<video src="/hero.mp4" autoplay loop muted playsinline></video>
<video src="/story.mp4" controls></video>
```

Most modern browsers block autoplay with sound by default, but you should not rely on that.

### Keep short sounds under 3 seconds

<figure>
  <img src="/images/wcag/1-4-2-audio-control/three-seconds.svg" width="800" height="230" loading="lazy" alt="A timeline showing the 3-second rule. Audio that stops within 3 seconds is OK. Audio playing for over 3 seconds needs a pause, stop or its own volume control. Best practice is never to autoplay sound.">
  <figcaption>Sounds that end within 3 seconds are allowed. Longer ones need a control.</figcaption>
</figure>

A short chime that stops within 3 seconds meets the criterion ([G60](https://www.w3.org/WAI/WCAG22/Techniques/general/G60)).

### If audio must autoplay, add a control at the top

Put a pause, stop or mute button at the very start of the page, before the main navigation if possible, so keyboard and screen reader users reach it immediately ([G170](https://www.w3.org/WAI/WCAG22/Techniques/general/G170)). The button must work with the keyboard and have a clear name. Playing a sound longer than 3 seconds with no way to turn it off is failure [F23](https://www.w3.org/WAI/WCAG22/Techniques/failures/F23).

### Check third-party content

Ads, embedded players and chat widgets can autoplay sound on your page. Test them and configure them to stay silent until people choose to play.

## How to Test for 1.4.2 Audio Control

1. **Load each page with sound on** and listen for anything that starts on its own.
2. **Time it.** If it stops within 3 seconds, it passes.
3. **If it plays longer,** look for a pause, stop or mute control near the start of the page, and use it with the keyboard.
4. **Run a screen reader** and check you can reach and use the control while the audio plays.
5. **Test with autoplay allowed** in browser settings, because some visitors have it enabled.

## Related Success Criteria

- [2.2.2 Pause, Stop, Hide](/resources/wcag/2-2-2-pause-stop-hide): moving content can be paused.
- [1.4.7 Low or No Background Audio](/resources/wcag/1-4-7-low-or-no-background-audio): background sound is quiet behind speech, at Level AAA.
- [2.1.2 No Keyboard Trap](/resources/wcag/2-1-2-no-keyboard-trap): another criterion that applies to the whole page.
- [1.2.2 Captions (Prerecorded)](/resources/wcag/1-2-2-captions-prerecorded): video with sound needs captions.

[Run a free WCAG scan](/#scan) for the automated checks, then load your pages with sound on to listen for autoplay.

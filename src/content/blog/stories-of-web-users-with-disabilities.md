---
title: 'Stories of Web Users With Disabilities: 5 Examples'
seoTitle: 'Stories of Web Users With Disabilities'
description: 'Stories of web users with disabilities: five short examples of how people with motor, autism, blindness, color blindness and deafness use the web.'
pubDate: 2026-09-29
category: 'Guides'
contributors:
  - author: joseph-edwards
    role: Author
history:
  - date: 2026-09-29
    note: 'First published. The five situations are adapted from the W3C Web Accessibility Initiative page "Stories of Web Users". The characters, names and details are fictional, and the WCAG criteria were checked against the W3C WCAG 2.2 Recommendation.'
related: ['famous-people-with-disabilities', 'keyboard-accessibility-testing', 'wcag-1-4-1-use-of-color']
faqs:
  - q: 'Are these stories about real people?'
    a: 'No. The names and details are made up. Each story is adapted from a situation described on the W3C Web Accessibility Initiative page "Stories of Web Users", which shows how different disabilities affect the way people use websites. The barriers they describe are real and common.'
  - q: 'Do these stories cover every disability?'
    a: 'No. They show five experiences out of many. Disabilities can be present from birth or develop through an accident, illness or ageing, and people with the same condition can use the web in very different ways. Use the stories to build understanding, not to make assumptions about any one person.'
  - q: 'Why do stories help more than a list of WCAG rules?'
    a: 'A rule such as "provide text alternatives" is easy to skip. A story about a blind accountant who cannot tell what an unlabeled image or button does makes the cost of skipping it clear, and helps designers and developers see why the rule exists.'
  - q: 'How can I test whether my website works for these users?'
    a: 'Start with an automated scan to catch code-level failures such as missing alt text and unlabeled fields, then test by hand: use only a keyboard, try a screen reader, turn on captions, and check that no meaning depends on color alone. Automated tools find many issues, but people confirm the rest.'
---

**Stories of web users with disabilities** show what accessibility problems feel like from the other side of the screen. A missing label or an unreachable button is a line in an audit report to a developer. To the person trying to pay a bill or book a class, it is a closed door. This guide shares five short stories, each based on a situation described by the W3C Web Accessibility Initiative, and explains what helped and which WCAG requirement covers it.

The people below are fictional. The barriers are real, and every one of them appears on live websites today.

> **Keep in mind:** these stories show some experiences, not all of them. People with the same disability can use the web in very different ways. ([W3C WAI, Stories of Web Users](https://www.w3.org/WAI/people-use-web/user-stories/))

## Why Stories of Web Users With Disabilities Matter

WCAG, the [Web Content Accessibility Guidelines](https://www.w3.org/TR/WCAG22/), is written as testable requirements. That is what makes it useful for audits, and it is also what makes it easy to treat as a checklist. Stories bring back the reason for each requirement.

They help different people on your team in different ways:

- **Designers** see why layout, color and motion choices are not just style decisions.
- **Developers** see why a native button or a properly labeled field matters.
- **Content writers** see why alt text, captions and plain language are part of the job.
- **Managers** see why accessibility reduces the risk of lost customers and legal claims. Our [ADA website compliance guide](/blog/ada-website-compliance-guide) explains the legal side.

Disabilities may be present from birth or develop through an accident, illness or ageing, so today's stories could describe any of us later on.

## Five Stories of Web Users With Disabilities

### Tomás, a reporter with limited use of his arms

Tomás was in an accident that caused a spinal cord injury and left him with limited use of his arms. He works as a newspaper reporter and often relies on the keyboard alone to navigate websites and other digital tools. He cannot use a mouse comfortably, and for him a dropdown menu that opens only on hover is not a small annoyance. It can hide the whole section of a site.

**What helps Tomás:**

- Every link, button, menu and form control works with the keyboard alone ([WCAG 2.1.1 Keyboard](/resources/wcag/2-1-1-keyboard)).
- He can always leave a pop-up or widget without getting stuck.
- A visible focus outline shows him where he is on the page.
- Buttons and links are large enough to hit accurately ([WCAG 2.5.8 Target Size](/resources/wcag/2-5-8-target-size-minimum)).

Many other assistive technologies, such as switch devices and speech recognition, also depend on pages that work through the keyboard interface, so fixing this helps far more than one reader. Our [keyboard accessibility testing guide](/blog/keyboard-accessibility-testing) shows how to check your own pages in a few minutes.

### Owen, a data entry clerk who is autistic

Owen is autistic and works as a data entry clerk. He finds it hard to understand online content and layouts that keep changing. Carousels that slide on their own, pop-up ads that appear without warning, and videos that start playing automatically all pull his attention away from the task and make the page difficult to read.

**What helps Owen:**

- Moving, blinking or auto-updating content can be paused, stopped or hidden ([WCAG 2.2.2 Pause, Stop, Hide](/resources/wcag/2-2-2-pause-stop-hide)).
- Audio does not start on its own, or it can be stopped straight away.
- Navigation and page layout stay consistent from page to page ([WCAG 3.2.3 Consistent Navigation](/resources/wcag/3-2-3-consistent-navigation)).
- Nothing important changes when he focuses on a field or types in it without warning ([WCAG 3.2.2 On Input](/resources/wcag/3-2-2-on-input)).

Clear, predictable pages help Owen, and they help everyone who is tired, distracted or reading on a small screen.

### Priya, a senior accountant who is blind

Priya is blind. She uses a screen reader on her computer and phone to work with online content, including images, form controls and navigation. A screen reader can only read what the code exposes. An image with no text alternative, an icon-only button with no name, or a form field with no label leaves Priya guessing.

**What helps Priya:**

- Images that carry meaning have text alternatives ([WCAG 1.1.1 Non-text Content](/resources/wcag/1-1-1-non-text-content)).
- Every form field has a clear label ([WCAG 3.3.2 Labels or Instructions](/resources/wcag/3-3-2-labels-or-instructions)).
- Headings and landmarks let her jump between sections instead of listening to the whole page.
- Messages such as "Item added to cart" are announced without moving focus ([WCAG 4.1.3 Status Messages](/resources/wcag/4-1-3-status-messages)).

These are the failures that automated scanners find most reliably. An accessibility checker will flag missing alt text and unlabeled fields in seconds, which makes them the best place to start.

### Renata, an online shopper with color blindness

Renata has deuteranopia, a form of red-green color blindness. Reds, greens, oranges and browns can look alike to her, which makes it hard to get meaning from those colors. On a clothing site, "select a color" swatches that are only colored circles are almost useless. On a form, an error shown only by a red border goes unnoticed.

**What helps Renata:**

- Color is never the only way to show information. Swatches carry a text name, and errors include a message and an icon ([WCAG 1.4.1 Use of Color](/resources/wcag/1-4-1-use-of-color)).
- Links inside paragraphs are underlined, not just a different color.
- Charts use labels or patterns as well as color. Our [chart color checker](/tools/chart-color-checker) can simulate common types of color blindness on your own palette.

Color vision differences are common enough that this barrier reaches many visitors.

### Walter, an older student who is deaf

Walter is deaf and studies part time in an online course. When he watches videos or other content with audio, he relies on real-time captions or transcripts of what is being said. A lecture recording with no captions, or a live session with no captioning, means he misses the lesson.

**What helps Walter:**

- Prerecorded videos have accurate captions ([WCAG 1.2.2 Captions (Prerecorded)](/resources/wcag/1-2-2-captions-prerecorded)).
- Audio-only content, such as a podcast, has a text transcript ([WCAG 1.2.1 Audio-only and Video-only (Prerecorded)](/resources/wcag/1-2-1-audio-only-and-video-only-prerecorded)).
- Live events offer real-time captions ([WCAG 1.2.4 Captions (Live)](/resources/wcag/1-2-4-captions-live)).

Captions also help people in noisy places, people watching with the sound off and people learning a language, which is why they are worth the effort even outside of legal requirements.

## What These Stories of Web Users Teach Us

Put the five stories side by side and clear patterns appear:

| Story | Main barrier | What fixes it | WCAG |
| --- | --- | --- | --- |
| Tomás | Controls that need a mouse | Full keyboard access, visible focus | 2.1.1, 2.4.7, 2.5.8 |
| Owen | Moving, changing, unpredictable pages | Pause controls, consistent layout | 2.2.2, 3.2.3, 3.2.2 |
| Priya | Content the code does not describe | Alt text, labels, headings, announced messages | 1.1.1, 3.3.2, 4.1.3 |
| Renata | Meaning carried by color alone | A second cue such as text or an icon | 1.4.1 |
| Walter | Audio with no text version | Captions and transcripts | 1.2.1, 1.2.2, 1.2.4 |

Three lessons stand out:

1. **Most barriers are design and code choices.** None of these users needed a special version of the site. They needed the standard version built properly.
2. **One fix often helps many groups.** Keyboard support helps Tomás and many other users of assistive technology. Consistent layouts help Owen and everyone else. Captions help Walter and viewers in a noisy cafe.
3. **Combinations are normal.** People often have more than one disability, or a disability and an older device. Building to the standard, not for one persona, covers those cases.

## How to Check Your Own Site for These Barriers

You do not need to guess whether your site would work for Tomás, Owen, Priya, Renata or Walter. Check it.

1. **Run an automated scan.** A [free accessibility scan](/#scan) tests a page against WCAG 2.2 and reports failures such as missing alt text, unlabeled fields and low contrast, each with the failing HTML and a fix. Our guide to [automated vs manual accessibility testing](/blog/automated-vs-manual-accessibility-testing) explains what tools can and cannot see.
2. **Unplug your mouse.** Tab through your key journeys, such as sign-up, checkout and contact, to find what Tomás would hit.
3. **Watch for motion.** Look for carousels, auto-playing video and pop-ups that Owen would struggle with.
4. **Try a screen reader.** Listen to your home page and one form the way Priya would.
5. **Look without color.** Use a grayscale or color blindness view, and ask whether meaning survives.
6. **Play a video with the sound off.** Check whether Walter could follow it.
7. **Fix and monitor.** New pages and plugins bring new issues, so recheck regularly. [Start a 3-day free trial](/app/signup) and AccessBell Pro monitors up to 500 URLs per domain every day.

To go deeper on how people with different needs use the web, the W3C publishes [How People with Disabilities Use the Web](https://www.w3.org/WAI/people-use-web/) and the full set of [user stories](https://www.w3.org/WAI/people-use-web/user-stories/).

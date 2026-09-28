// Original, per-criterion copy for the /resources/wcag pages: one entry per
// WCAG success criterion. Combined at build time with live axe-core rule
// data (src/lib/checker-coverage.ts) and fix examples, so each page mixes
// hand-written explanation with real, current tooling data.
export type WcagContent = {
  /** One or two sentences: what the criterion actually requires. */
  summary: string;
  /** One sentence: the fastest way to check it by hand. */
  howToTest: string;
  /** Two to four short, concrete ways sites typically fail it. */
  commonFailures: string[];
};

export const WCAG_CONTENT: Record<string, WcagContent> = {
  // ---------- 1.1 Text Alternatives ----------
  '1.1.1': {
    summary: 'Every image, icon, form control image and other non-text element needs a text alternative that serves the same purpose, so a screen reader can announce it or a search engine can index it.',
    howToTest: 'Turn off images or read the page with a screen reader and check that every icon, photo and image button makes sense without seeing it.',
    commonFailures: ['A meaningful image has no alt attribute, or alt text that just repeats the file name.', 'A decorative image has descriptive alt text that adds noise for screen reader users.', 'An icon-only button (a magnifying glass, a trash can) has no accessible name at all.'],
  },
  // ---------- 1.2 Time-based Media ----------
  '1.2.1': {
    summary: 'Prerecorded audio-only files (a podcast) need a transcript, and prerecorded video-only files (a silent demo) need a transcript or an audio track describing what happens.',
    howToTest: 'Check that a text transcript is linked next to any audio-only or video-only content.',
    commonFailures: ['A podcast episode is embedded with no transcript link anywhere on the page.', 'A silent product demo video has no description of what is shown.'],
  },
  '1.2.2': {
    summary: 'Prerecorded video with sound needs synchronized captions, so a deaf or hard-of-hearing visitor gets the dialogue and important sound effects.',
    howToTest: 'Turn on the video\'s captions and confirm they match the audio and appear on screen at the right time.',
    commonFailures: ['A video has no caption track at all.', 'Captions exist but are auto-generated and never corrected, so names and technical terms are wrong.'],
  },
  '1.2.3': {
    summary: 'Prerecorded video needs either an audio description track or a full text alternative that describes the visual content a blind visitor would otherwise miss.',
    howToTest: 'Watch the video with your eyes closed and see whether the audio alone (or a linked transcript) explains what is happening visually.',
    commonFailures: ['A tutorial video relies on on-screen text and cursor movement with no spoken equivalent.', 'No audio-described version and no transcript is offered as an alternative.'],
  },
  '1.2.4': {
    summary: 'Live video, such as a webinar or livestream, needs real-time captions, not just a caption track added after the fact.',
    howToTest: 'Watch a live stream and confirm live captions are available, either from the platform or a human captioner.',
    commonFailures: ['A live webinar has no captioning option turned on.', 'Captions are promised but only added to the recording afterward.'],
  },
  '1.2.5': {
    summary: 'Prerecorded video needs full audio description, narrating important visual details during natural pauses in the dialogue, not just a text alternative.',
    howToTest: 'Play the audio-described version and confirm a narrator describes on-screen actions, text and scene changes during quiet moments.',
    commonFailures: ['Only a transcript is offered where AA requires an actual audio-described track.', 'The described track exists but skips key visual information, such as on-screen data or charts.'],
  },
  '1.2.6': {
    summary: 'AAA only: prerecorded video needs a sign language interpretation track for viewers whose first language is a signed language.',
    howToTest: 'Check whether a sign-language video or picture-in-picture interpreter track is offered alongside the recording.',
    commonFailures: ['No sign language option exists for any video content.'],
  },
  '1.2.7': {
    summary: 'AAA only: when standard audio description cannot fit in the natural pauses of a video, an extended version pauses the video to fit longer descriptions.',
    howToTest: 'For dialogue-dense video, check whether an extended audio-described version is offered.',
    commonFailures: ['A fast-paced video only has standard audio description that talks over dialogue or cuts descriptions short.'],
  },
  '1.2.8': {
    summary: 'AAA only: prerecorded video needs a full text alternative (a complete script of dialogue and visual description) in addition to captions and audio description.',
    howToTest: 'Look for a downloadable or linked full-text version of the video\'s content.',
    commonFailures: ['A captioned, audio-described video has no full text version for people who prefer reading.'],
  },
  '1.2.9': {
    summary: 'AAA only: a live audio-only broadcast, such as a live podcast recording or radio-style stream, needs a text alternative describing its content.',
    howToTest: 'Check whether live audio-only content links to a live transcript or a same-day summary.',
    commonFailures: ['A live audio show has no transcript, live or after the fact.'],
  },
  // ---------- 1.3 Adaptable ----------
  '1.3.1': {
    summary: 'The relationships and structure conveyed visually, such as headings, lists, table headers and form labels, must also exist in the underlying markup, not just in visual styling.',
    howToTest: 'View the page structure with a screen reader or the browser\'s accessibility tree and confirm headings, lists and table headers are marked up as such, not just styled to look like them.',
    commonFailures: ['Headings are bold, larger text with no <h1>-<h6> tag behind them.', 'A data table uses plain <td> cells with no <th> header cells.', 'A visual list is built from styled <div> elements instead of <ul>/<ol>.'],
  },
  '1.3.2': {
    summary: 'Content must be readable in a sensible order when linearized, for example by a screen reader or with CSS turned off, even if it is visually arranged with CSS in a different order.',
    howToTest: 'Disable CSS (or use the browser\'s reader view) and check that the page still reads in a logical order.',
    commonFailures: ['CSS grid or flexbox visually reorders content in a way that reads out of order without styling.', 'A multi-column layout interleaves unrelated content when linearized.'],
  },
  '1.3.3': {
    summary: 'Instructions cannot rely only on shape, size, visual location or sound, such as "click the round green button" or "see the box on the right", because that information is not available to everyone.',
    howToTest: 'Read every instruction on the page and check that each one still makes sense described in words alone.',
    commonFailures: ['"Click the button on the right to continue" with no other way to identify the button.', 'Form errors marked only in red text or with an icon, with no text label saying what is wrong.'],
  },
  '1.3.4': {
    summary: 'Content must not be restricted to only one screen orientation, portrait or landscape, unless a specific orientation is essential, such as a piano or check-scanning app.',
    howToTest: 'Rotate a mobile device (or use the browser\'s device toolbar) and confirm the page works in both orientations.',
    commonFailures: ['A page or app is locked to portrait mode with CSS or JavaScript for no functional reason.'],
  },
  '1.3.5': {
    summary: 'Input fields that collect common information about the user, such as name, email or address, should use the correct HTML autocomplete attribute so browsers and assistive tools can help fill them in.',
    howToTest: 'Inspect common fields (name, email, phone, address) and confirm they have a matching autocomplete value from the WCAG-defined list.',
    commonFailures: ['An email field has no autocomplete="email" attribute.', 'A checkout form\'s name and address fields are missing autocomplete tokens entirely.'],
  },
  '1.3.6': {
    summary: 'AAA only: the purpose of icons, regions and UI components should be programmatically identifiable, for example through ARIA landmarks or the emerging purpose attributes, so assistive technology can adapt its presentation.',
    howToTest: 'Check that major regions (navigation, search, main content) use identifiable landmark roles beyond basic structure.',
    commonFailures: ['Icons for common actions (cart, search, account) have no identifiable purpose beyond a generic image.'],
  },
  '1.4.1': {
    summary: 'Color cannot be the only way information is conveyed, for example marking required fields, links or error states with color alone and no other visual cue.',
    howToTest: 'View the page in grayscale and confirm links, errors and status indicators are still distinguishable without color.',
    commonFailures: ['Links are distinguished from body text by color alone, with no underline.', 'A form error is shown only as a red border with no icon or text.', 'A chart uses color-only legends with no patterns or labels.'],
  },
  '1.4.2': {
    summary: 'Audio that plays automatically for more than 3 seconds needs a visible way to pause, stop or mute it, since it can drown out screen reader speech.',
    howToTest: 'Load a page with autoplaying audio and confirm a visible pause or stop control is available immediately.',
    commonFailures: ['A background music or video autoplays with no visible pause button.'],
  },
  '1.4.3': {
    summary: 'Normal text needs a contrast ratio of at least 4.5:1 against its background, and large text (18pt, or 14pt bold) needs at least 3:1, so low-vision users can read it.',
    howToTest: 'Run an automated contrast checker, or use a color picker to sample text and background colors and calculate the ratio.',
    commonFailures: ['Light gray text on a white background (a common "muted" or placeholder style) falls below 4.5:1.', 'White text over a background image or gradient drops below the ratio in lighter areas.'],
  },
  '1.4.4': {
    summary: 'Text must be resizable up to 200% using the browser\'s zoom without losing content or functionality, so people with low vision can read it at a comfortable size.',
    howToTest: 'Zoom the browser to 200% and check that no text is clipped, overlapping or cut off, and every control still works.',
    commonFailures: ['Fixed-height containers clip text when the browser is zoomed.', 'Text is set in pixel units inside a container that does not grow, so it overflows and hides content.'],
  },
  '1.4.5': {
    summary: 'Use real text styled with CSS instead of an image of text wherever possible, since images of text cannot be resized, recolored or read aloud accurately.',
    howToTest: 'Look for headings, buttons or callouts that are actually images rather than styled text.',
    commonFailures: ['A promotional banner is a single image containing the headline text, unreadable at high zoom and by screen readers.'],
  },
  '1.4.6': {
    summary: 'AAA only: an enhanced contrast ratio of 7:1 for normal text and 4.5:1 for large text, higher than the AA minimum, for visitors who need stronger contrast.',
    howToTest: 'Run a contrast checker against the enhanced 7:1 / 4.5:1 thresholds instead of the standard AA ones.',
    commonFailures: ['Text passes the standard 4.5:1 AA requirement but falls short of the stricter 7:1 AAA level.'],
  },
  '1.4.7': {
    summary: 'AAA only: background audio behind speech must be quiet enough, or removable, so the spoken content stays intelligible.',
    howToTest: 'Listen to a narrated audio track and check that background music or noise does not compete with the speech.',
    commonFailures: ['A narrated video has background music mixed too loudly relative to the narration, with no way to turn it off.'],
  },
  '1.4.8': {
    summary: 'AAA only: for blocks of text, visitors must be able to control foreground/background colors, width, spacing and justification for a more comfortable reading experience.',
    howToTest: 'Check whether the site offers reading customization controls, or whether its default styling already meets the listed AAA sub-requirements.',
    commonFailures: ['Long-form article text is fully justified, creating uneven word spacing that is harder for some readers to parse.'],
  },
  '1.4.9': {
    summary: 'AAA only: images of text are not used at all, except for decoration or where a specific visual presentation (like a logo) is essential.',
    howToTest: 'Search the page for any images that contain text serving a purpose beyond decoration or branding.',
    commonFailures: ['A pricing table is rendered as an image instead of real, styled HTML text.'],
  },
  '1.4.10': {
    summary: 'Content must reflow to a single column and remain fully usable at a 320px-wide viewport (equivalent to 400% zoom on a standard desktop) without needing to scroll in two directions.',
    howToTest: 'Resize the browser to 320px wide, or zoom to 400%, and confirm nothing requires horizontal scrolling and all content and functionality remain available.',
    commonFailures: ['A fixed-width table or layout element forces horizontal scrolling of the entire page at narrow widths.', 'A sidebar and main content sit side by side with no responsive stacking.'],
  },
  '1.4.11': {
    summary: 'Non-text elements that convey information, such as icons, form field borders, focus indicators and chart lines, need at least 3:1 contrast against adjacent colors.',
    howToTest: 'Sample the colors of icons, input borders and focus outlines against their background and check the ratio is at least 3:1.',
    commonFailures: ['A light gray input border is nearly invisible against a white background.', 'A focus outline uses a color too close to the background to be seen.'],
  },
  '1.4.12': {
    summary: 'Content must remain readable and functional when a visitor overrides text spacing (line height, paragraph spacing, letter and word spacing) to the values in the success criterion.',
    howToTest: 'Apply a text-spacing bookmarklet or browser extension that sets the WCAG 1.4.12 spacing values and check nothing is clipped or overlapping.',
    commonFailures: ['A fixed-height container clips text once line height increases.', 'Overlapping text appears in a card or button when letter spacing is increased.'],
  },
  '1.4.13': {
    summary: 'Content that appears on hover or keyboard focus (a tooltip, a dropdown preview) must be dismissible, stay visible while the visitor is pointing at it, and remain visible until dismissed or no longer relevant.',
    howToTest: 'Hover over an element that triggers a tooltip and check that you can move the mouse onto the tooltip itself without it disappearing, and that Escape dismisses it.',
    commonFailures: ['A tooltip disappears the instant the mouse moves toward it, making its content impossible to read.', 'Hover content has no way to dismiss it other than moving the mouse completely away.'],
  },
  // ---------- 2.1 Keyboard Accessible ----------
  '2.1.1': {
    summary: 'Every interactive element and all functionality must be operable using only a keyboard, with no requirement for a specific timing of individual keystrokes.',
    howToTest: 'Unplug the mouse and navigate the entire page and every interaction using only Tab, Shift+Tab, Enter, Space and arrow keys.',
    commonFailures: ['A custom dropdown or date picker built with <div> elements has no keyboard handling at all.', 'A "click" handler is attached to a non-interactive element with no keyboard equivalent.'],
  },
  '2.1.2': {
    summary: 'Once keyboard focus moves into a component, the visitor must always be able to move focus back out using only the keyboard, with no trap that requires the mouse to escape.',
    howToTest: 'Tab into every modal, widget and embedded frame and confirm Tab, Shift+Tab or Escape always lets you move focus back out.',
    commonFailures: ['A modal dialog has no Escape handler and focus cannot leave it by keyboard.', 'An embedded third-party widget (a map, a video player) traps Tab focus inside it.'],
  },
  '2.1.3': {
    summary: 'AAA only: the same as 2.1.1 keyboard accessibility, but with no exceptions at all, even for content that would require timed input.',
    howToTest: 'Confirm every single interaction on the page, including any timing-sensitive ones, works by keyboard alone.',
    commonFailures: ['A timed drag interaction has no keyboard alternative, even though a lower-level keyboard exception might otherwise apply.'],
  },
  '2.1.4': {
    summary: 'Single-key keyboard shortcuts (pressing just "s" for search, for example) must be possible to turn off, remap, or only be active while a specific component has focus, so they do not conflict with assistive technology commands.',
    howToTest: 'Check whether the page defines any single-character keyboard shortcuts and, if so, whether they can be disabled or remapped.',
    commonFailures: ['A single letter key opens a global action (like "e" for edit) anywhere on the page, with no way to turn it off, conflicting with screen reader letter navigation.'],
  },
  // ---------- 2.2 Enough Time ----------
  '2.2.1': {
    summary: 'If a page has a time limit, visitors must be able to turn it off, adjust it to at least ten times the default, or get a warning with the chance to extend it, unless the time limit is essential (like an auction).',
    howToTest: 'Find any session timeout, quiz timer or auto-advancing carousel and check for a way to extend or disable the time limit.',
    commonFailures: ['A session expires with no warning and no way to extend it before losing unsaved work.', 'A timed quiz has no option to request more time.'],
  },
  '2.2.2': {
    summary: 'Moving, blinking, scrolling or auto-updating content that starts automatically and lasts more than 5 seconds needs a way to pause, stop or hide it.',
    howToTest: 'Find any auto-rotating carousel, ticker or auto-refreshing content and check for a visible pause or stop control.',
    commonFailures: ['A homepage image carousel auto-rotates with no pause button.', 'A live-updating stock ticker or news feed has no way to stop it.'],
  },
  '2.2.3': {
    summary: 'AAA only: no timing is required for any interaction at all, except in a few real-time or essential events (like a live auction).',
    howToTest: 'Confirm the page has no time limits of any kind on any interaction.',
    commonFailures: ['A form times out after inactivity even though nothing about the task requires that time limit.'],
  },
  '2.2.4': {
    summary: 'AAA only: interruptions such as notifications or alerts can be postponed or suppressed by the visitor, except emergency alerts.',
    howToTest: 'Check whether pop-up notifications or alerts can be deferred or turned off.',
    commonFailures: ['Marketing pop-ups interrupt a task in progress with no way to suppress future interruptions.'],
  },
  '2.2.5': {
    summary: 'AAA only: if a session expires, the visitor can re-authenticate and continue without losing the data they had entered.',
    howToTest: 'Let a session expire mid-form and check whether logging back in restores the in-progress data.',
    commonFailures: ['A long checkout form is entirely cleared after a session timeout, forcing the visitor to start over.'],
  },
  '2.2.6': {
    summary: 'Visitors must be warned about any user inactivity timeout that could cause loss of data, unless the data is preserved for at least 20 hours after the timeout.',
    howToTest: 'Check whether a warning appears before a session times out, or whether entered data is preserved afterward.',
    commonFailures: ['A banking or account session silently logs the visitor out with no advance warning.'],
  },
  // ---------- 2.3 Seizures and Physical Reactions ----------
  '2.3.1': {
    summary: 'Content must not flash more than three times in any one-second period, unless the flashing is small enough or low-contrast enough to fall under the general flash and red flash thresholds, since rapid flashing can trigger seizures.',
    howToTest: 'Review any animation, video or ad for rapid flashing; when in doubt, use a photosensitive epilepsy analysis tool on the content.',
    commonFailures: ['An animated ad banner flashes rapidly to grab attention.', 'A loading animation flashes at a rate that exceeds the safe threshold.'],
  },
  '2.3.2': {
    summary: 'AAA only: content does not flash more than three times per second at all, with no exception for low-area flashes.',
    howToTest: 'Confirm no content flashes more than three times per second, regardless of size or contrast.',
    commonFailures: ['A strobe-style animation effect is used for visual emphasis.'],
  },
  '2.3.3': {
    summary: 'AAA only: motion animation triggered by interaction (like a parallax scroll effect) can be disabled, unless the motion is essential to the function.',
    howToTest: 'Check whether the site respects the operating system\'s "reduce motion" setting or offers its own toggle for interaction-triggered animation.',
    commonFailures: ['A parallax scrolling effect has no way to turn it off and does not respect prefers-reduced-motion.'],
  },
  // ---------- 2.4 Navigable ----------
  '2.4.1': {
    summary: 'Visitors need a way to skip repeated blocks of content, such as navigation menus, that appear on every page, usually with a "skip to main content" link.',
    howToTest: 'Load a page and press Tab once; the first focusable element should be a visible "skip to content" link, or landmarks should let assistive tech jump past navigation.',
    commonFailures: ['No skip link exists, forcing keyboard and screen reader users to tab through the entire navigation on every page.', 'A skip link exists in the markup but is not actually focusable or does not move focus to main content.'],
  },
  '2.4.2': {
    summary: 'Every page needs a <title> that describes its topic or purpose, so visitors can tell pages apart in browser tabs, bookmarks and search results.',
    howToTest: 'Check the browser tab and page source for a <title> tag that is unique and descriptive for each page.',
    commonFailures: ['Every page on the site shares the same generic title.', 'A page has no <title> element at all.'],
  },
  '2.4.3': {
    summary: 'When visitors tab through a page, focus must move in a meaningful order that matches the visual and logical reading order, not jump around unpredictably.',
    howToTest: 'Tab through the entire page and confirm focus moves in the same order a sighted reader would read the content.',
    commonFailures: ['CSS positioning visually reorders elements so tab order jumps around the page.', 'A positive tabindex value forces some elements ahead of others in an unpredictable order.'],
  },
  '2.4.4': {
    summary: 'A link\'s purpose must be understandable from its own text, or from its text plus the surrounding sentence or list item, not from vague text like "click here" alone.',
    howToTest: 'List every link\'s text out of context (a screen reader\'s links list does this) and check that its destination is still clear.',
    commonFailures: ['Multiple "Read more" or "Click here" links on one page with no distinguishing text or accessible name.', 'An icon-only link (a social media icon) has no accessible name describing where it goes.'],
  },
  '2.4.5': {
    summary: 'A page must be reachable in more than one way, such as through navigation, a search function, or a sitemap, not only through one single, undiscoverable path.',
    howToTest: 'Check that at least two of these exist: site navigation, a sitemap, a search feature, or a linked table of contents.',
    commonFailures: ['A page is only reachable through a single deep link with no navigation path and no way to find it through search or a sitemap.'],
  },
  '2.4.6': {
    summary: 'Headings and form labels must describe their topic or purpose clearly, so visitors scanning the page (visually or with a screen reader) can understand the structure.',
    howToTest: 'Read only the headings and form labels on the page, out of context, and confirm each one is descriptive rather than generic.',
    commonFailures: ['Multiple sections are all headed "Learn More" with no distinguishing detail.', 'A form field is labeled just "Input" instead of what it collects.'],
  },
  '2.4.7': {
    summary: 'Whichever element currently has keyboard focus must have a visible focus indicator, so keyboard users can always see where they are on the page.',
    howToTest: 'Tab through interactive elements and confirm each one shows a clearly visible outline or other focus style.',
    commonFailures: ['CSS resets or "outline: none" remove the default focus ring with no visible replacement.', 'A custom button component has no focus style at all.'],
  },
  '2.4.8': {
    summary: 'AAA only: visitors can tell where they are within a set of pages, for example through breadcrumbs, a site map, or a clearly indicated current step.',
    howToTest: 'Check for breadcrumbs, a highlighted current navigation item, or a step indicator showing the visitor\'s location.',
    commonFailures: ['A multi-step checkout has no indicator of which step the visitor is currently on.'],
  },
  '2.4.9': {
    summary: 'AAA only: a link\'s purpose can be determined from its link text alone, without needing the surrounding context that 2.4.4 (AA) allows.',
    howToTest: 'List every link\'s text alone, with no surrounding sentence, and confirm its destination is still clear.',
    commonFailures: ['A "Read more" link only makes sense with the paragraph text around it, which fails the stricter AAA standard even though it may pass AA.'],
  },
  '2.4.10': {
    summary: 'AAA only: sections of content are organized under headings, so the structure of long content is easy to scan and navigate.',
    howToTest: 'Check that long-form content is broken into sections, each introduced by a heading.',
    commonFailures: ['A long article has no subheadings breaking up its sections.'],
  },
  '2.4.11': {
    summary: 'When an element receives keyboard focus, it must not be entirely hidden by other content, such as a sticky header or cookie banner, at least partially.',
    howToTest: 'Tab through the page with a sticky header or footer present and confirm the focused element is never completely covered.',
    commonFailures: ['A sticky header covers the top of the page, hiding focused links as the visitor tabs down.', 'A cookie consent banner sits over form fields and is never dismissed before focus reaches them.'],
  },
  '2.4.12': {
    summary: 'AAA only: the stricter version of 2.4.11, where the focused element must never be even partially hidden by other content.',
    howToTest: 'Tab through the page and confirm the focused element is fully visible at all times, with no partial overlap.',
    commonFailures: ['A sticky footer partially overlaps the bottom of a focused element, which fails the stricter AAA requirement even if 2.4.11 AA passes.'],
  },
  '2.4.13': {
    summary: 'AAA only: the visible focus indicator must meet minimum size, contrast and area requirements, going beyond simply being visible at all.',
    howToTest: 'Measure a focus indicator\'s thickness, contrast and area against the specific AAA thresholds in the success criterion.',
    commonFailures: ['A thin 1px focus outline is technically visible but does not meet the minimum area and contrast the AAA level requires.'],
  },
  // ---------- 2.5 Input Modalities ----------
  '2.5.1': {
    summary: 'Functionality that uses a multi-point or path-based gesture (pinch to zoom, swipe to delete) must also be operable with a single, simple pointer action, unless the gesture is essential.',
    howToTest: 'Try operating every touch-based interaction with a single tap or click instead of a multi-point gesture.',
    commonFailures: ['A carousel can only be advanced by swiping, with no visible next/previous buttons.', 'A "swipe to delete" list item has no button-based alternative.'],
  },
  '2.5.2': {
    summary: 'For actions triggered by a single pointer press, the action should complete on the "up" event (release), not on "down", and it must be possible to abort or undo it.',
    howToTest: 'Press down on a button and drag away before releasing; the action should not fire until release, and moving away should cancel it.',
    commonFailures: ['A button fires its action on mousedown/touchstart, so an accidental press cannot be canceled by dragging away.'],
  },
  '2.5.3': {
    summary: 'When a control has a visible text label, its accessible name (what a screen reader announces) must contain that visible text, so voice control users referring to the visible label can activate it.',
    howToTest: 'Compare the visible label on a button or link to its accessible name (from the browser\'s accessibility inspector); the visible words should be part of the accessible name.',
    commonFailures: ['A button visibly reads "Submit" but has aria-label="Send form now" with no matching text, so voice control commands using the visible word fail.'],
  },
  '2.5.4': {
    summary: 'Functions triggered by device motion, such as shaking or tilting a phone, must also have a standard control-based alternative, and the motion trigger must be disableable.',
    howToTest: 'Check whether any shake-to-undo or tilt-based interaction also has an on-screen button, and whether motion triggers can be turned off.',
    commonFailures: ['A "shake to undo" feature has no equivalent undo button.'],
  },
  '2.5.5': {
    summary: 'AAA only: pointer targets should be at least 44 by 44 CSS pixels, larger than the AA minimum of 24 pixels, unless an exception applies.',
    howToTest: 'Measure interactive elements and confirm they meet at least 44x44 CSS pixels, or qualify for one of the listed exceptions.',
    commonFailures: ['A tap target is 32x32 pixels, meeting the AA 24px minimum but not the stricter AAA 44px target.'],
  },
  '2.5.6': {
    summary: 'AAA only: content does not restrict input to a single method (touch-only, mouse-only), so visitors can switch between pointer, keyboard and voice as needed.',
    howToTest: 'Try switching input methods mid-task and confirm the site continues to work.',
    commonFailures: ['A component only listens for touch events and ignores mouse or keyboard input entirely.'],
  },
  '2.5.7': {
    summary: 'Functionality that requires a dragging movement (reordering a list, adjusting a slider) must also be operable without dragging, for example with buttons or keyboard input.',
    howToTest: 'Try completing any drag-based interaction using only clicks, taps or keyboard keys instead of a drag gesture.',
    commonFailures: ['A drag-to-reorder list has no "move up" / "move down" buttons as an alternative.', 'A custom slider can only be operated by dragging its handle, with no arrow-key support.'],
  },
  '2.5.8': {
    summary: 'Pointer targets (buttons, links, form controls) must be at least 24 by 24 CSS pixels, or have enough spacing from neighboring targets, unless an exception applies (like inline text links).',
    howToTest: 'Measure small interactive elements, especially icon buttons, and confirm they are at least 24x24 pixels or have sufficient spacing from other targets.',
    commonFailures: ['A row of small icon buttons (edit, delete, share) are each smaller than 24x24 pixels with no spacing between them.'],
  },
  // ---------- 3.1 Readable ----------
  '3.1.1': {
    summary: 'The page\'s primary language must be set in the HTML lang attribute, so screen readers use the correct pronunciation rules and translation tools work correctly.',
    howToTest: 'View the page source and check that the <html> tag has a lang attribute matching the page\'s language.',
    commonFailures: ['The <html> tag has no lang attribute.', 'The lang attribute uses an invalid or incorrect language code.'],
  },
  '3.1.2': {
    summary: 'When a passage is in a different language than the rest of the page, that passage needs its own lang attribute, so assistive technology can switch pronunciation for it.',
    howToTest: 'Find any foreign-language phrases or quotes and check whether they are wrapped in an element with the correct lang attribute.',
    commonFailures: ['A quoted phrase in another language has no lang attribute marking the change.'],
  },
  '3.1.3': {
    summary: 'AAA only: unusual words, idioms or jargon have a way to look up their definition, such as a glossary link or a definition on first use.',
    howToTest: 'Check whether unusual terminology links to a definition or glossary entry.',
    commonFailures: ['Industry jargon is used with no glossary or explanation anywhere on the site.'],
  },
  '3.1.4': {
    summary: 'AAA only: abbreviations have their expanded form available, for example through a glossary or the first use of the term.',
    howToTest: 'Check whether abbreviations and acronyms are expanded on first use or link to their meaning.',
    commonFailures: ['An acronym is used repeatedly with no expansion given anywhere on the page.'],
  },
  '3.1.5': {
    summary: 'AAA only: content requiring more than a lower-secondary reading level has a simpler version available, or is supplemented with illustrations, symbols or audio.',
    howToTest: 'Check whether complex legal or technical content has a plain-language summary or alternative available.',
    commonFailures: ['Dense legal terms and conditions have no plain-language summary offered.'],
  },
  '3.1.6': {
    summary: 'AAA only: a way is available to determine the pronunciation of words where meaning is ambiguous without it, such as homographs like "read" or "lead".',
    howToTest: 'Check whether ambiguous words that change meaning based on pronunciation have their pronunciation indicated.',
    commonFailures: ['A homograph central to the content\'s meaning has no pronunciation guide.'],
  },
  '3.2.1': {
    summary: 'Simply moving keyboard focus onto an element must never trigger an unexpected change of context, such as auto-submitting a form or navigating away.',
    howToTest: 'Tab through every field and control and confirm nothing unexpected happens (a new window, a page change, a form submission) just from receiving focus.',
    commonFailures: ['A dropdown auto-submits the form the moment it receives focus, before the visitor has chosen an option.', 'Tabbing into a field opens a new browser tab or window.'],
  },
  '3.2.2': {
    summary: 'Changing the value of a form control (selecting an option, checking a box) must not automatically trigger a major change of context unless the visitor was warned in advance.',
    howToTest: 'Change the value of each dropdown, radio button and checkbox and confirm nothing unexpected happens without a clear warning first.',
    commonFailures: ['Selecting a dropdown option immediately navigates to a new page with no warning or explicit submit action.'],
  },
  '3.2.3': {
    summary: 'Navigation that repeats across multiple pages (a main menu, a footer) must appear in the same relative order each time, so visitors can build a mental model of the site.',
    howToTest: 'Compare the navigation menu across several pages and confirm the items appear in the same order.',
    commonFailures: ['The main navigation menu reorders its items differently depending on the page.'],
  },
  '3.2.4': {
    summary: 'Components that do the same thing across the site (a search field, a "log in" button) must be labeled and identified consistently, not use different names in different places.',
    howToTest: 'Compare repeated components across pages and confirm they use consistent labels and icons.',
    commonFailures: ['One page calls a component "Search" and another calls the identical component "Find".'],
  },
  '3.2.5': {
    summary: 'AAA only: changes of context (new windows, form auto-submission) only happen when the visitor requests it, with no automatic exceptions.',
    howToTest: 'Confirm no context change occurs anywhere without an explicit visitor-initiated action.',
    commonFailures: ['A timed redirect changes the page automatically with no visitor action or advance opt-out.'],
  },
  '3.2.6': {
    summary: 'A consistent way to get help, such as a contact link, chat widget or help page, must appear in the same relative place across pages where it is offered.',
    howToTest: 'Compare help or contact options across multiple pages and confirm they appear in a consistent location and order.',
    commonFailures: ['A live chat widget appears on some pages but not others, or moves to a different position without explanation.'],
  },
  // ---------- 3.3 Input Assistance ----------
  '3.3.1': {
    summary: 'When a form submission is rejected because of an input error, the error must be described in text and the specific field identified, not just marked visually.',
    howToTest: 'Submit a form with invalid data and confirm a text error message appears identifying exactly which field is wrong and why.',
    commonFailures: ['An invalid field is only highlighted with a red border, with no text describing the problem.', 'A generic "form has errors" message appears with no indication of which fields.'],
  },
  '3.3.2': {
    summary: 'Every form field that requires specific input needs a label or instructions describing what is expected, such as a required date format or password rules.',
    howToTest: 'Check that every form field has a visible label, and that any specific input requirements (format, length) are stated before the field is submitted.',
    commonFailures: ['A password field lists its complexity rules only after a failed submission, not up front.', 'A date field gives no example of the expected format.'],
  },
  '3.3.3': {
    summary: 'When an input error is detected, and a suggestion for fixing it is known, the suggestion must be provided, unless doing so would compromise security or the purpose of the content.',
    howToTest: 'Trigger a common input error (a malformed email, a mismatched password) and check whether the message suggests how to fix it.',
    commonFailures: ['An "Invalid email" error gives no example of a correctly formatted email address.'],
  },
  '3.3.4': {
    summary: 'For forms involving legal commitments, financial transactions or the deletion of user-controllable data, submissions must be reversible, checked for errors before finalizing, or confirmed before completing.',
    howToTest: 'Complete a checkout, account deletion or similar high-stakes form and check for a review or confirmation step before it finalizes.',
    commonFailures: ['A "delete account" button executes immediately with no confirmation step.', 'A purchase finalizes with no order review screen.'],
  },
  '3.3.5': {
    summary: 'AAA only: context-sensitive help is available for form fields and complex interactions, such as inline hints or a linked help article.',
    howToTest: 'Check whether complex or unusual form fields offer contextual help beyond a basic label.',
    commonFailures: ['A complex tax or legal form field has no help text or linked explanation available.'],
  },
  '3.3.6': {
    summary: 'AAA only: the review, correction and confirmation requirements of 3.3.4 apply to every form submission, not only legal, financial or data-deletion ones.',
    howToTest: 'Check that every form on the site, not just high-stakes ones, offers a way to review and correct input before submitting.',
    commonFailures: ['A simple contact form submits immediately with no review step, which is fine at AA but fails the broader AAA requirement.'],
  },
  '3.3.7': {
    summary: 'Information the visitor already entered earlier in the same process should not need to be re-entered manually; it should be auto-populated or selectable, unless re-entry is essential.',
    howToTest: 'Complete a multi-step form and check whether previously entered information (like a shipping address reused for billing) must be retyped.',
    commonFailures: ['A checkout flow asks for the same address twice with no "same as shipping" option.'],
  },
  '3.3.8': {
    summary: 'Authentication cannot rely only on a cognitive function test (remembering a password, solving a puzzle) unless an alternative is provided, such as allowing password managers, copy-paste, or a non-text alternative like a biometric option.',
    howToTest: 'Check that a login form allows pasting passwords and does not block password managers or require solving a puzzle with no alternative.',
    commonFailures: ['A login field disables paste, forcing manual retyping of a password from a password manager.', 'A CAPTCHA with no accessible alternative is the only way to prove you are human.'],
  },
  '3.3.9': {
    summary: 'AAA only: the same as 3.3.8, but with no exception at all for object recognition or personal content identification tests.',
    howToTest: 'Confirm authentication requires no cognitive test whatsoever, including image or personal-content recognition challenges.',
    commonFailures: ['A CAPTCHA that asks users to identify objects in images has no accessible or cognitive-test-free alternative.'],
  },
  // ---------- 4.1 Compatible ----------
  '4.1.1': {
    summary: 'Obsolete in WCAG 2.2: markup previously had to be free of duplicate IDs and correctly nested tags so assistive technology could parse it reliably. Modern browsers and assistive tech handle most parsing errors, so this criterion was retired, though clean markup is still good practice.',
    howToTest: 'Run an HTML validator; while no longer a WCAG 2.2 requirement, duplicate IDs and invalid nesting can still cause real assistive technology bugs.',
    commonFailures: ['Duplicate id attributes on the same page confuse label associations and ARIA references.'],
  },
  '4.1.2': {
    summary: 'Every custom UI component (built with <div> or <span> rather than native HTML) needs the correct name, role and state exposed through ARIA, so assistive technology can identify and operate it correctly.',
    howToTest: 'Inspect custom components (toggles, tabs, custom dropdowns) in the browser\'s accessibility tree and confirm each has an appropriate role, accessible name, and reflects its current state (expanded, checked, selected).',
    commonFailures: ['A custom checkbox built from a <div> has no role="checkbox" or aria-checked state.', 'A custom dropdown never updates aria-expanded when opened.'],
  },
  '4.1.3': {
    summary: 'Important status messages, such as a search result count, a form success message, or a cart update, must be announced to screen reader users without requiring their focus to move, usually via an ARIA live region.',
    howToTest: 'Trigger a status update (submit a search, add an item to a cart) with a screen reader running and confirm the change is announced automatically.',
    commonFailures: ['A "3 results found" message updates visually with no aria-live region, so screen reader users never hear it.', 'A success toast notification appears and disappears with no announcement at all.'],
  },
};

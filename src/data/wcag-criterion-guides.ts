// Deep WCAG 2.2 criterion pages at /wcag/<slug>.
//
// "full" entries are the whole page. "guide" entries supplement a WCAG Codes
// Explained article that already ranks: the article stays the body, and these
// fields add the pass/fail pair, the platform notes and the conformance note
// so the canonical /wcag page is not a second, thinner essay.

export const GUIDE_UPDATED = new Date('2026-11-17T00:00:00Z');

export type CodeSample = { caption: string; code: string };

export type PlatformNotes = {
  shopify: string;
  wordpress: string;
  wix: string;
  squarespace: string;
};

type Shared = {
  platforms: PlatformNotes;
  levelNotes: string;
  pass: CodeSample;
  fail: CodeSample;
  /** Other success criteria to link, by number. */
  related: string[];
};

export type GuideSupplement = Shared & { kind: 'guide' };

export type FullCriterion = Shared & {
  kind: 'full';
  /** Title tag before " | AccessBell". Keep it at 52 characters or fewer. */
  seoTitle: string;
  /** Meta description, 110 to 165 characters, containing the criterion name. */
  description: string;
  /** A short quotation of the normative sentence, not the whole criterion. */
  quote: string;
  /** Anchor on the WCAG 2.2 Recommendation for that quotation. */
  quoteUrl: string;
  plainEnglish: string[];
  whoItHelps: string;
  /** Steps a person can follow without a scanner. */
  manual: string[];
  /** What an automated scan can and cannot decide. No invented pass rates. */
  accessbell: string;
  faqs: { q: string; a: string }[];
};

export type CriterionGuide = GuideSupplement | FullCriterion;

const shopify = '/platforms/shopify';
const wordpress = '/platforms/wordpress';
const wix = '/platforms/wix';
const squarespace = '/platforms/squarespace';
const wixList = '/resources/wix-accessibility-checklist';
const sqList = '/resources/squarespace-accessibility-checklist';
const storeList = '/resources/wcag-2-2-checklist-for-online-stores';
const contrast = '/tools/contrast-checker';
const monitor = '/resources/website-accessibility-monitoring-tool';

export const CRITERION_GUIDES: Record<string, CriterionGuide> = {
  // ---------- Full pages: no long-form guide existed yet ----------
  '1.4.4': {
    kind: 'full',
    seoTitle: 'WCAG 1.4.4 Resize Text Explained',
    description:
      'WCAG 1.4.4 Resize Text explained: body text must scale to 200% without clipping content or breaking controls. Exceptions, failures and how to test.',
    quote:
      'Except for captions and images of text, text can be resized without assistive technology up to 200 percent without loss of content or functionality.',
    quoteUrl: 'https://www.w3.org/TR/WCAG22/#resize-text',
    plainEnglish: [
      'People enlarge text from the browser, usually with Ctrl and plus, or the Zoom command. WCAG 1.4.4 Resize Text says the page still has to work at 200% zoom. Text cannot disappear into a fixed-height box, overlap other text, or hide a button someone needs.',
      'The criterion is about the browser’s own zoom, not a separate widget that changes font size. Captions and images of text are excepted, because captions have their own rules and an image of text does not scale the way real text does. Pinch-zoom on a phone is the same idea: a viewport setting of user-scalable=no or maximum-scale=1 blocks it, and that fails 1.4.4.',
    ],
    whoItHelps:
      'People with low vision who read at a larger size and do not use a screen reader. Also anyone who zooms a page on a small laptop or in bright light. It is separate from 1.4.10 Reflow, which asks the layout to fit a narrow window without sideways scrolling.',
    manual: [
      'In a desktop browser, set zoom to 200% (Ctrl and plus, or Command and plus). Do not only change the font in an extension.',
      'Read the page from top to bottom. Look for text cut off by a fixed height, overlapping columns, or buttons pushed out of view.',
      'On a phone, try to pinch-zoom. If the page refuses to zoom, inspect the viewport meta element for user-scalable=no or maximum-scale=1.',
      'Repeat on a page with a menu, a form and a dialog. Open the dialog at 200% and confirm every control is still reachable.',
    ],
    accessbell: `A [website accessibility monitoring tool](${monitor}) can flag a viewport meta element that disables scaling. That is the axe-core rule when it applies. Zooming the page and checking that nothing is clipped still needs a person, because a scanner does not decide whether text at 200% is usable.`,
    platforms: {
      shopify: `Theme CSS often sets a fixed height on announcement bars, product cards and predictive-search panels. At 200% zoom the text inside is clipped. The theme, not the hosted checkout, is where a merchant can change that. Scan the storefront with the [Shopify checker](${shopify}).`,
      wordpress: `A theme or page builder that sets a card, hero or menu item to a fixed pixel height will clip text at 200%. Some older themes also emit a viewport tag with maximum-scale=1. Check both the meta element and the layout in the [WordPress checker](${wordpress}).`,
      wix: `Text in strips and slideshows can sit in a box that does not grow. The [Wix checklist](${wixList}) is the manual pass for layout; the Accessibility Wizard does not measure 200% zoom on every element. Confirm pinch-zoom still works on the published site, then run the [Wix checker](${wix}).`,
      squarespace: `Fluid Engine blocks can overlap when the page is zoomed, and a fixed-height text block clips a longer heading. Squarespace’s inclusive design guidance is summarized in the [Squarespace checklist](${sqList}). Test the published page at 200%, not the editor preview, then scan it with the [Squarespace checker](${squarespace}).`,
    },
    levelNotes:
      'Level AA, in WCAG since 2.0, under Distinguishable. A site that claims WCAG 2.2 Level AA has to meet 1.4.4 wherever it uses real text. It does not require text to reflow into a single column. That is 1.4.10 Reflow, also Level AA, added in WCAG 2.1.',
    pass: {
      caption: 'The viewport allows scaling, and the card grows with its text.',
      code: `<meta name="viewport" content="width=device-width, initial-scale=1">

.card { min-height: 8rem; }`,
    },
    fail: {
      caption: 'Scaling is locked, and a fixed height clips the heading.',
      code: `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

.card { height: 120px; overflow: hidden; }`,
    },
    related: ['1.4.3', '1.4.10', '1.4.11', '1.4.5'],
    faqs: [
      {
        q: 'What level is WCAG 1.4.4 Resize Text?',
        a: 'Level AA. It has been in WCAG since 2.0, so it applies when the target is WCAG 2.0, 2.1 or 2.2 at Level AA.',
      },
      {
        q: 'Is browser zoom the test for 1.4.4 Resize Text?',
        a: 'Yes. The W3C wording says text can be resized without assistive technology up to 200 percent. The usual test is the browser’s zoom, not a plugin that only changes the font.',
      },
      {
        q: 'Does a “text size” widget meet WCAG 1.4.4?',
        a: 'Not by itself. The page still has to work when someone uses the browser’s own zoom up to 200%. A widget can be an extra help. It does not replace that.',
      },
      {
        q: 'Can AccessBell prove a page passes 1.4.4 Resize Text?',
        a: 'No. The free scan can catch a viewport setting that blocks scaling. A person still has to zoom to 200% and check that content and controls are still there.',
      },
    ],
  },

  '1.4.11': {
    kind: 'full',
    seoTitle: 'WCAG 1.4.11 Non-text Contrast Explained',
    description:
      'WCAG 1.4.11 Non-text Contrast explained: icons, input borders and focus indicators need a 3:1 contrast ratio. Exceptions, examples and how to test.',
    quote:
      'The visual presentation of user interface components and graphical objects has a contrast ratio of at least 3:1 against adjacent color(s).',
    quoteUrl: 'https://www.w3.org/TR/WCAG22/#non-text-contrast',
    plainEnglish: [
      'WCAG 1.4.3 Contrast (Minimum) is about text. WCAG 1.4.11 Non-text Contrast is about the parts of the page that are not text but still carry information: the border of a text field, the outline that shows keyboard focus, an icon button, a checked state, or the lines of a chart.',
      'The minimum is 3:1 against the color next to the part that matters. A pale gray box on a white page often fails because the boundary is the only thing that shows where the field is. Inactive controls are excepted. So is a control whose look is left entirely to the browser and not restyled, and a graphic where a specific color is essential, such as a flag or a medical heat map.',
    ],
    whoItHelps:
      'People with low vision who can read text that passes 1.4.3 but still lose a faint border, a thin focus ring or a light icon. It also helps anyone using the page in glare. It does not set the contrast of the text inside a button. That remains 1.4.3.',
    manual: [
      'List the controls someone has to see in order to use the page: fields, buttons that are icon-only, checkboxes, the focus outline and meaningful chart marks.',
      'Sample the color of the informative part and the color immediately next to it. Use the [contrast checker](/tools/contrast-checker) and look for 3:1, not the 4.5:1 text threshold.',
      'Tab to each control and sample the focus indicator against the background behind it.',
      'Ignore disabled controls, and ignore a native control you have not restyled.',
    ],
    accessbell: `AccessBell’s [website accessibility monitoring tool](${monitor}) reports text contrast under 1.4.3 when axe-core can measure it. Non-text contrast is only partly automatable: a scanner cannot always tell which pixels of an icon are the meaningful ones. Treat a clean scan as a start, then sample borders, icons and focus styles by hand.`,
    platforms: {
      shopify: `Theme editors expose input and button colors, and a light “border” color on white product forms is a common miss. Icon-only header controls (search, cart, account) need 3:1 as well if the icon is the only thing that identifies them. Check the published theme with the [Shopify checker](${shopify}), then sample the focus ring.`,
      wordpress: `Block themes and form plugins restyle inputs with a 1px light-gray border and set outline: none on focus. The border and the focus style are both in scope for 1.4.11. The [WordPress checker](${wordpress}) will not replace a manual sample of those colors.`,
      wix: `The Accessibility Wizard requires Level AA and does not check every element, which the [Wix checklist](${wixList}) calls out for contrast. Input underlines and icon buttons in strips are the usual misses. Publish the page and sample them, then run the [Wix checker](${wix}).`,
      squarespace: `Site styles set field borders and button colors globally. Squarespace’s inclusive design guidance tells you to check contrast; the [Squarespace checklist](${sqList}) maps that to 1.4.3 and 1.4.11. A focus outline you cannot restyle still has to clear 3:1 against the section behind it, so change the background if the outline disappears.`,
    },
    levelNotes:
      'Level AA, added in WCAG 2.1, under Distinguishable. It is required for WCAG 2.1 AA and WCAG 2.2 AA. It is not required for a WCAG 2.0 AA target. Text inside the component is still covered by 1.4.3 Contrast (Minimum), which uses 4.5:1 for normal text.',
    pass: {
      caption: 'The field border and the focus ring both clear 3:1 on white. #595959 on white is about 7:1.',
      code: `input {
  border: 2px solid #595959;
  background: #fff;
}
input:focus-visible {
  outline: 3px solid #1f4b99;
  outline-offset: 2px;
}`,
    },
    fail: {
      caption: 'A pale border is the only sign of the field, and focus removes the outline.',
      code: `input {
  border: 1px solid #d0d0d0;
  background: #fff;
}
input:focus {
  outline: none;
}`,
    },
    related: ['1.4.3', '1.4.1', '2.4.7', '2.4.11'],
    faqs: [
      {
        q: 'What contrast ratio does WCAG 1.4.11 Non-text Contrast require?',
        a: 'At least 3:1 between the part of the component or graphic that carries the information and the adjacent color. That is lower than the 4.5:1 ratio for normal text in 1.4.3 Contrast (Minimum).',
      },
      {
        q: 'Do placeholder text and button labels fall under 1.4.11?',
        a: 'No. Text, including placeholder text and the words on a button, is 1.4.3 Contrast (Minimum). 1.4.11 covers the non-text parts: borders, icons, states and graphical objects.',
      },
      {
        q: 'Are disabled buttons required to meet 1.4.11?',
        a: 'No. Inactive user interface components are an exception. An enabled control that is merely styled to look faint is not inactive, and it still has to meet 3:1.',
      },
      {
        q: 'What level is WCAG 1.4.11 Non-text Contrast?',
        a: 'Level AA, added in WCAG 2.1. A claim of WCAG 2.2 Level AA includes it. A claim that only targets WCAG 2.0 does not.',
      },
    ],
  },

  '2.4.6': {
    kind: 'full',
    seoTitle: 'WCAG 2.4.6 Headings and Labels Explained',
    description:
      'WCAG 2.4.6 Headings and Labels explained: headings and form labels must describe the topic or purpose. What fails, how to test, and who it helps.',
    quote: 'Headings and labels describe topic or purpose.',
    quoteUrl: 'https://www.w3.org/TR/WCAG22/#headings-and-labels',
    plainEnglish: [
      'WCAG 2.4.6 Headings and Labels is short because the bar is “does this name say what is here?” A heading of “Section 2” or “Welcome” fails when it does not describe the section. A label of “Field” or “Click here” fails when it does not say what the person should enter or do.',
      'This criterion assumes the heading or label exists. Missing headings are a problem for 1.3.1 Info and Relationships, which asks for structure in the code. A label that is missing entirely is 3.3.2 Labels or Instructions and, for the accessible name, 4.1.2 Name, Role, Value. 2.4.6 is the quality of the words once the heading or label is there.',
    ],
    whoItHelps:
      'People who navigate by headings with a screen reader, people with cognitive disabilities who scan a page by its headings, and anyone using a form who needs to know what a field is for before they type. Vague labels also hurt people using voice control, because the spoken name is the label.',
    manual: [
      'Open the page’s heading list (the Headings feature in a screen reader, or the document outline in browser devtools). Read each heading with the section hidden. If you cannot predict the section, rewrite the heading.',
      'Read every form label and button out of context. “Email address” passes. “Required” or “Click here” does not.',
      'Check that two fields that collect different things do not share one vague label such as “Name” twice, unless the heading above them makes the group clear and each field is still specific (First name, Last name).',
    ],
    accessbell: `A [website accessibility monitoring tool](${monitor}) can flag a missing label or an empty heading. It cannot judge whether the words “Welcome” describe the section. AccessBell lists 2.4.6 for a person to review when automation cannot score the wording.`,
    platforms: {
      shopify: `Theme sections ship with headings such as “Featured collection” or “More” that do not name the products. Collection and product templates are the place to rewrite them. Form labels in the theme (search, newsletter) often say only “Email”. Scan the theme with the [Shopify checker](${shopify}) and read the headings yourself.`,
      wordpress: `The block editor will let a heading say anything, including “Heading”. Contact-form plugins label fields from the placeholder or from “Your field”. Rename both the visible label and the heading in the editor, then check the page with the [WordPress checker](${wordpress}).`,
      wix: `Text can be styled to look like a heading without being one, which is 1.3.1, and a real heading can still say nothing useful, which is 2.4.6. The [Wix checklist](${wixList}) covers heading structure. The wizard does not grade whether the words describe the section. Use the [Wix checker](${wix}) for the code, and read the labels.`,
      squarespace: `Squarespace’s inclusive design guidance says to use real headings in order. The [Squarespace checklist](${sqList}) maps that to 1.3.1 and page titles to 2.4.2. 2.4.6 is the next check: the heading text itself has to name the section, not just be an H2. Rewrite “Welcome” and “Read more” in the text toolbar.`,
    },
    levelNotes:
      'Level AA, in WCAG since 2.0, under Navigable. It applies to headings and to labels on controls. It does not require a heading on every section. That stronger rule is 2.4.10 Section Headings, which is Level AAA. Descriptive link text is 2.4.4 Link Purpose (In Context), Level A.',
    pass: {
      caption: 'The heading names the section, and the label names the field.',
      code: `<section>
  <h2>Shipping address</h2>
  <label for="zip">ZIP code</label>
  <input id="zip" name="zip" autocomplete="postal-code" required>
</section>`,
    },
    fail: {
      caption: 'The heading and the label do not say what the section or the field is for.',
      code: `<section>
  <h2>Section 2</h2>
  <label for="f1">Field</label>
  <input id="f1" name="f1" required>
</section>`,
    },
    related: ['1.3.1', '3.3.2', '2.4.2', '2.4.4'],
    faqs: [
      {
        q: 'What level is WCAG 2.4.6 Headings and Labels?',
        a: 'Level AA. It has been in WCAG since 2.0. A WCAG 2.2 Level AA target includes it.',
      },
      {
        q: 'Does every section need a heading under 2.4.6?',
        a: 'No. 2.4.6 says that headings and labels which are present describe the topic or purpose. Requiring headings for every section is 2.4.10 Section Headings, Level AAA.',
      },
      {
        q: 'Is placeholder text a label for 2.4.6?',
        a: 'No. A placeholder is not a label. The visible label has to name the field, and it has to stay visible while someone types. A missing label is also a failure of 3.3.2 Labels or Instructions.',
      },
    ],
  },

  '2.4.7': {
    kind: 'full',
    seoTitle: 'WCAG 2.4.7 Focus Visible Explained',
    description:
      'WCAG 2.4.7 Focus Visible explained: keyboard users need a visible focus indicator. What to remove, what to keep, and how to test it by tabbing.',
    quote: 'Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.',
    quoteUrl: 'https://www.w3.org/TR/WCAG22/#focus-visible',
    plainEnglish: [
      'When someone moves through a page with Tab, they have to be able to see which control is selected. WCAG 2.4.7 Focus Visible requires a visible keyboard focus indicator. The common failure is a stylesheet that sets outline: none on buttons and links and puts nothing in its place.',
      'The criterion does not specify the color or the thickness. Those details show up in other rules: 1.4.11 Non-text Contrast asks for 3:1 on the indicator, and 2.4.13 Focus Appearance (Level AAA, new in WCAG 2.2) sets a minimum size. 2.4.11 Focus Not Obscured (Minimum) says the focused control cannot be completely hidden under a sticky bar. 2.4.7 is the basic requirement that some indicator exists and can be seen.',
    ],
    whoItHelps:
      'People who use a keyboard because a mouse is painful or impossible, people with low vision who track a highlight rather than a small cursor, and anyone who tabs through a form. Sighted keyboard users are the group this criterion was written for. A screen reader user may not need the outline, but many people who tab can see the screen.',
    manual: [
      'Click the address bar, then press Tab repeatedly through the page. Do not use a mouse.',
      'On every stop, confirm you can see where focus is: an outline, an underline, a background change or a border that was not there before.',
      'Open menus, dialogs and the mobile navigation. Tab inside them. Focus that disappears into a dark photo fails.',
      'If the only indicator is the browser’s default outline, leave it. Do not remove it unless a custom one is at least as visible, including on dark sections.',
    ],
    accessbell: `Automated checks rarely judge 2.4.7 Focus Visible well, because “visible” depends on the colors behind the control. A [website accessibility monitoring tool](${monitor}) such as AccessBell will list the criterion for manual review when axe-core has no reliable rule. Tab the page. Do not treat a scan with no focus finding as a pass.`,
    platforms: {
      shopify: `Many themes remove the default outline and add a focus style that only appears on links, not on quantity buttons or payment-adjacent controls in the theme. Tab the header, a product form and the cart drawer on the published theme. The [Shopify checker](${shopify}) does not replace that pass.`,
      wordpress: `Themes and CSS reset stylesheets often include a:focus, button:focus { outline: none; }. Search the theme and any page-builder custom CSS for outline: none and :focus. Restore a :focus-visible style. The [WordPress checker](${wordpress}) can be the automated half of the review.`,
      wix: `Strip backgrounds and slideshows hide a thin focus ring. The [Wix checklist](${wixList}) notes the limits of the Accessibility Wizard, which does not tab the page for you. Publish, then tab. Use the [Wix checker](${wix}) for the issues it can see.`,
      squarespace: `Squarespace’s inclusive design guidance covers a visible focus indicator, and the editor may not let you restyle the outline. The [Squarespace checklist](${sqList}) says to change the background when the outline disappears into it. Tab the published page, including galleries and form blocks.`,
    },
    levelNotes:
      'Level AA, in WCAG since 2.0, under Navigable. Required for WCAG 2.2 Level AA. It requires that a visible indicator is available. It does not, at AA, set the indicator’s area or contrast. Pair it with 1.4.11 for contrast of the indicator and with 2.4.11 so a sticky header does not cover the focused item completely.',
    pass: {
      caption: 'Keyboard focus draws a clear outline. Mouse clicks do not have to show the same ring.',
      code: `:focus { outline: none; }
:focus-visible {
  outline: 3px solid #1f4b99;
  outline-offset: 2px;
}`,
    },
    fail: {
      caption: 'The default indicator is removed and nothing replaces it.',
      code: `a:focus,
button:focus,
input:focus {
  outline: none;
}`,
    },
    related: ['2.1.1', '2.4.11', '1.4.11', '2.4.3'],
    faqs: [
      {
        q: 'What level is WCAG 2.4.7 Focus Visible?',
        a: 'Level AA. It has been in WCAG since 2.0 and is part of a WCAG 2.2 Level AA target.',
      },
      {
        q: 'Is outline: none always a failure of 2.4.7?',
        a: 'It fails when nothing visible replaces the outline for keyboard focus. Removing the outline and adding a clear :focus-visible style can pass. Removing it and adding nothing does not.',
      },
      {
        q: 'Does 2.4.7 require a 3:1 focus ring?',
        a: 'The 3:1 ratio for the indicator comes from 1.4.11 Non-text Contrast, also Level AA. 2.4.7 requires the indicator to be visible. 2.4.13 Focus Appearance, Level AAA, adds size and contrast rules of its own.',
      },
    ],
  },

  '2.4.11': {
    kind: 'full',
    seoTitle: 'WCAG 2.4.11 Focus Not Obscured Explained',
    description:
      'WCAG 2.4.11 Focus Not Obscured (Minimum) explained: a focused control cannot be fully hidden by a sticky bar. How to test and how to fix it.',
    quote:
      'When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content.',
    quoteUrl: 'https://www.w3.org/TR/WCAG22/#focus-not-obscured-minimum',
    plainEnglish: [
      'WCAG 2.4.11 Focus Not Obscured (Minimum) is new in WCAG 2.2. Keyboard focus has to leave at least part of the control visible. A sticky header, a cookie bar or a chat bubble that covers the whole focused link or button fails. Covering a corner of it can still pass this minimum. The stricter rule, where no part of the control may be covered, is 2.4.12 Focus Not Obscured (Enhanced), Level AAA.',
      'The W3C notes two cases that are not failures. If the person can move the author content, only the starting position counts. And if the person opened something that covers the control, such as a menu they just activated, it is not a failure when they can reveal the focused item without moving focus forward. Content the site itself pins to the screen is in scope.',
    ],
    whoItHelps:
      'People who tab through a page and sighted people who use speech recognition and need to see the control they are about to activate. A focused link hidden under a promo bar looks as if focus has vanished, which is the same practical problem as a missing focus indicator.',
    manual: [
      'Tab from the top of the page through the last link. Watch the focused control as it goes under any sticky header, sticky footer, cookie banner or chat launcher.',
      'If the whole control disappears, the page fails 2.4.11. If a sliver remains visible, it meets this minimum and may still fail 2.4.12.',
      'Open a disclosure or menu the person asked for. If they can scroll or dismiss it and see the focused item without extra Tab presses, that overlay is allowed.',
      'Test at 200% zoom as well. Sticky bars cover more of the page when text is larger.',
    ],
    accessbell: `Sticky overlays are hard for automation to score, because the tool has to know which element is author-pinned and whether any pixel of the focused control remains. AccessBell, a [website accessibility monitoring tool](${monitor}), will show an axe-core rule when one applies and otherwise leave 2.4.11 for a manual tab through the page. Do not read a silent scan as a pass.`,
    platforms: {
      shopify: `Announcement bars, sticky add-to-cart bars and cookie apps are the usual covers. Tab a long product description and the footer with the bar present. Theme CSS can add scroll-padding-bottom so focused items clear the bar. The [Shopify checker](${shopify}) is the automated pass. The [store checklist](${storeList}) maps 2.4.11 onto a product page and a cart.`,
      wordpress: `Fixed headers and consent plugins pin content over the footer links. A theme that uses scroll-padding-top on html often fixes the header. The footer banner needs the same treatment, or a layout that is not position: fixed over the links. Check with the [WordPress checker](${wordpress}), then tab.`,
      wix: `A sticky header and a chat app are both author-created. The Accessibility Wizard’s limits are listed in the [Wix checklist](${wixList}), and it does not tab under a banner for you. Set the header to hide on scroll or add spacing, publish, and tab. Then run the [Wix checker](${wix}).`,
      squarespace: `Announcement bars and fixed promotional blocks sit over the last links in a section. Squarespace’s focus guidance is summarized in the [Squarespace checklist](${sqList}). Tab the published page with the bar open. If the focused link vanishes, shorten the bar or stop pinning it.`,
    },
    levelNotes:
      'Level AA, added in WCAG 2.2. It is not part of WCAG 2.0 or 2.1. A target of WCAG 2.2 Level AA includes it. Partial coverage can pass 2.4.11 and fail 2.4.12, which is Level AAA. The W3C introduction, with the normative sentence, is on [What’s New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/).',
    pass: {
      caption: 'Focused items scroll clear of a sticky footer. The offset matches the bar’s height.',
      code: `html {
  scroll-padding-top: 5rem;
  scroll-padding-bottom: 6rem;
}`,
    },
    fail: {
      caption: 'A fixed bar covers the bottom of the page, where the next focused link sits.',
      code: `.promo {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 96px;
}`,
    },
    related: ['2.4.7', '2.4.12', '2.4.3', '1.4.11'],
    faqs: [
      {
        q: 'What level is WCAG 2.4.11 Focus Not Obscured (Minimum)?',
        a: 'Level AA. It was added in WCAG 2.2. It is not a WCAG 2.1 requirement.',
      },
      {
        q: 'Can a sticky header partly cover a focused button?',
        a: 'Under 2.4.11, yes, as long as some of the focused component stays visible. If any part is hidden, the page fails the AAA criterion 2.4.12 Focus Not Obscured (Enhanced) and can still pass 2.4.11.',
      },
      {
        q: 'Does a cookie banner fail 2.4.11?',
        a: 'It fails when it completely hides the control that has keyboard focus and the person did not open it as the thing they are operating. A banner they can move or dismiss, used in its initial position, is what you test.',
      },
    ],
  },

  '2.5.7': {
    kind: 'full',
    seoTitle: 'WCAG 2.5.7 Dragging Movements Explained',
    description:
      'WCAG 2.5.7 Dragging Movements explained: anything you can drag also needs a single-pointer alternative, unless dragging is essential. How to test it.',
    quote:
      'All functionality that uses a dragging movement for operation can be achieved by a single pointer without dragging, unless dragging is essential or the functionality is determined by the user agent and not modified by the author.',
    quoteUrl: 'https://www.w3.org/TR/WCAG22/#dragging-movements',
    plainEnglish: [
      'WCAG 2.5.7 Dragging Movements is new in WCAG 2.2. If a person must press, hold and move the pointer to use something, the same action also has to work with a single click or tap, unless dragging is essential. A list that reorders only by dragging fails. The same list with Up and Down buttons, or a menu of positions, passes.',
      'Dragging is essential when the path itself is the point, such as a signature or a freehand drawing. A slider the browser provides and the site has not rebuilt is the user-agent exception. A map someone must drag in order to pan usually needs another way to move the view, such as arrow buttons, because panning is not the only way to offer that function. The W3C’s short version is: for any action that involves dragging, provide a simple pointer alternative.',
    ],
    whoItHelps:
      'People with tremors, limited hand strength or pain who cannot hold a pointer button down while moving. People using a head pointer or another single-tap device. Keyboard access is a separate criterion, 2.1.1 Keyboard. 2.5.7 is about pointer users who can click but cannot drag.',
    manual: [
      'Find every drag: carousels with a swipe-only next image, sliders, sortable lists, kanban boards, range inputs the theme has rebuilt, maps and “compare” image wipes.',
      'Try to do the same task with one click or tap and no hold. Buttons, a select, or a click-to-pick-up then click-to-drop pattern can pass.',
      'If the only alternative is a keyboard shortcut, that does not meet 2.5.7. The alternative has to work with a single pointer.',
      'Leave a native scrollbar and a native range input alone if the site has not restyled their behavior.',
    ],
    accessbell: `Dragging is a behavior, so a [website accessibility monitoring tool](${monitor}) cannot reliably see that a carousel only advances by a swipe. AccessBell reports 2.5.7 for manual review unless an axe-core rule matches a known pattern. Operate each draggable control with a single click before you call it done.`,
    platforms: {
      shopify: `Product galleries and “shop the look” sections often drag to the next image with no Next button. Theme carousels and cart upsells are the place to add buttons. Hosted checkout is less often the source. The [store checklist](${storeList}) includes 2.5.7. Scan the product page with the [Shopify checker](${shopify}), then try the gallery with one click.`,
      wordpress: `Slider and page-builder carousels, and WooCommerce gallery plugins, frequently support only swipe. Turn on arrow controls in the plugin, or pick a pattern that moves on click. Check the page with the [WordPress checker](${wordpress}).`,
      wix: `Slideshow strips and some store galleries drag. The Accessibility Wizard’s gaps, including galleries it does not fully cover, are in the [Wix checklist](${wixList}). Add arrows or dots that work on a single click, publish, and test. The [Wix checker](${wix}) covers what automation can see.`,
      squarespace: `Gallery blocks and background sliders can be swipe-first. Squarespace’s media guidance is cited in the [Squarespace checklist](${sqList}). Confirm the gallery has a clickable control for the next item on the published page, not only a drag.`,
    },
    levelNotes:
      'Level AA, added in WCAG 2.2, under Input Modalities. It is not in WCAG 2.1. The exception for essential dragging is narrow: the movement has to be required for the function, not merely the design the theme chose. See [What’s New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) for the W3C’s short statement of the rule.',
    pass: {
      caption: 'The same reorder works from buttons. No drag is required.',
      code: `<li>
  <span>Blue shirt</span>
  <button type="button">Move up</button>
  <button type="button">Move down</button>
</li>`,
    },
    fail: {
      caption: 'The only way to reorder is a drag handle.',
      code: `<ul class="sortable">
  <li draggable="true">Blue shirt</li>
  <li draggable="true">Red shirt</li>
</ul>`,
    },
    related: ['2.5.1', '2.1.1', '2.5.8', '2.5.2'],
    faqs: [
      {
        q: 'What level is WCAG 2.5.7 Dragging Movements?',
        a: 'Level AA. It was added in WCAG 2.2 and is not part of WCAG 2.1.',
      },
      {
        q: 'Does a carousel that only swipes fail 2.5.7?',
        a: 'Yes, if the next slide cannot also be reached with a single click or tap. Add a Next and Previous button. A keyboard alternative alone does not meet this criterion, which is about pointer input.',
      },
      {
        q: 'Is a signature pad a failure of 2.5.7?',
        a: 'Drawing a signature is a case where dragging is essential, because the path is the content. The exception is for that kind of function, not for a list that would work with buttons.',
      },
    ],
  },

  '3.3.7': {
    kind: 'full',
    seoTitle: 'WCAG 3.3.7 Redundant Entry Explained',
    description:
      'WCAG 3.3.7 Redundant Entry explained: do not make people type the same information twice in one process. Exceptions, checkout examples and how to test.',
    quote:
      'Information previously entered by or provided to the user that is required to be entered again in the same process is either auto-populated, or available for the user to select.',
    quoteUrl: 'https://www.w3.org/TR/WCAG22/#redundant-entry',
    plainEnglish: [
      'WCAG 3.3.7 Redundant Entry is new in WCAG 2.2 and it is Level A. In a single process, such as checkout or a multi-step application, do not make someone retype information the site already has. Fill it in, or let them pick it from what they entered. A shipping address that has to be typed again as the billing address fails, unless a checkbox can copy it.',
      'Three exceptions are in the criterion. Re-entry is allowed when it is essential, when it is there for security, or when the earlier value is no longer valid. Asking someone to type a password again to confirm it can be essential. Asking for the same email on step 1 and step 3 of a checkout, with no way to reuse it, is not.',
    ],
    whoItHelps:
      'People with cognitive disabilities and memory difficulties, people using switch or voice input for whom every extra field is slow, and anyone on a phone who mistypes a long address. The W3C’s reason for adding it is that some people cannot reliably remember what they entered a step earlier.',
    manual: [
      'Walk the whole process once: checkout, booking, or account creation. Write down every field.',
      'Mark any field that asks for something already provided in that process. Email, name, phone and address are the usual repeats.',
      'Confirm the second ask is either prefilled or selectable (a “same as shipping” control, a dropdown of entered values). A placeholder that shows the old value but still requires typing does not pass.',
      'If the repeat is a security check or a confirmation that is essential, note why, and do not treat it as a failure.',
    ],
    accessbell: `A [website accessibility monitoring tool](${monitor}) sees one page at a time. It cannot tell that an email field on step 3 repeats step 1. AccessBell will not mark 3.3.7 pass or fail from a single-page scan. Walk the process. Use the scan for the labels, errors and names on each step.`,
    platforms: {
      shopify: `Checkout is a hosted flow, and a merchant often cannot add a “same as shipping” control inside it. What you can check is the theme’s own multi-step flows: wholesale applications, gift options and custom forms that ask for the email twice. The [Shopify checker](${shopify}) scans a public page. The [store checklist](${storeList}) places 3.3.7 on checkout. Do not treat a page the scanner could not change as a pass.`,
      wordpress: `WooCommerce and form plugins repeat billing and shipping fields. Turn on “ship to a different address” so the billing address is the default, and avoid a second email field that is empty. Multi-page Gravity-style forms should carry values forward. Review the flow, then scan a step with the [WordPress checker](${wordpress}).`,
      wix: `Stores, bookings and custom forms are the processes to walk. The side cart and some app pages are on the wizard’s “does not support” list in the [Wix checklist](${wixList}), so a wizard score does not cover this. Prefill or offer a choice when a later step needs the same details. The [Wix checker](${wix}) still helps with labels on the page you can load.`,
      squarespace: `A custom form split across blocks, or a checkout that asks again for a detail the account already holds, is the case to test. Squarespace’s form guidance is in the [Squarespace checklist](${sqList}). If you cannot prefill a hosted checkout field, do not add a second copy of that question in a block you do control.`,
    },
    levelNotes:
      'Level A, added in WCAG 2.2, under Input Assistance. Because it is Level A, every WCAG 2.2 conformance claim includes it, including Level A, AA and AAA. It does not apply across separate visits. “The same process” means the task the person is in now. The W3C summary is on [What’s New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/).',
    pass: {
      caption: 'The billing address can be copied. The person does not type it twice.',
      code: `<label>
  <input type="checkbox" checked>
  Billing address is the same as shipping
</label>`,
    },
    fail: {
      caption: 'Step 3 asks for the email again, with no prefilled value and no way to select the one from step 1.',
      code: `<label for="email-again">Confirm your email by typing it again</label>
<input id="email-again" name="email_again" type="email" autocomplete="off">`,
    },
    related: ['3.3.2', '3.3.1', '3.3.8', '1.3.5'],
    faqs: [
      {
        q: 'What level is WCAG 3.3.7 Redundant Entry?',
        a: 'Level A. It was added in WCAG 2.2. Level AA and AAA targets include every Level A criterion, so they include 3.3.7.',
      },
      {
        q: 'Does a “type your email again” field fail 3.3.7?',
        a: 'It fails when the site already has the email from earlier in the same process and the person must retype it with no prefilled value and no selection. A security check that is essential can be an exception. A normal checkout confirmation usually is not.',
      },
      {
        q: 'Does 3.3.7 apply to a form the person abandoned and came back to later?',
        a: 'The criterion is about the same process, not a later visit. Information that is no longer valid is also an exception. A new order does not have to reuse an address from a different order if that address may have changed, but offering it as a choice is the better pattern.',
      },
    ],
  },

  // ---------- Supplements for guides that already rank at these URLs ----------
  '1.1.1': {
    kind: 'guide',
    platforms: {
      shopify: `Product photos, variant images and collection banners have an alt field in the theme or the product admin. A file name used as the alternative fails when it does not describe the photo. Decorative theme icons should have an empty alt. Scan a product page with the [Shopify checker](${shopify}).`,
      wordpress: `The media library stores alternative text separately from the caption and the title. Featured images and page-builder image blocks often publish with an empty alt. Set the alternative on the attachment, or mark the image decorative. The [WordPress checker](${wordpress}) flags images with no alt attribute.`,
      wix: `Each image has an alt setting. The Accessibility Wizard does not cover every app image, which the [Wix checklist](${wixList}) lists. Check product photos, logos used as links, and strips. Then run the [Wix checker](${wix}).`,
      squarespace: `Squarespace can fall back to the file name when no alternative is set. A name such as IMG_2044 is not a description. The [Squarespace checklist](${sqList}) cites Squarespace’s own guidance and maps it to 1.1.1. Rename the asset or add a real alternative, then scan with the [Squarespace checker](${squarespace}).`,
    },
    levelNotes:
      'Level A, in WCAG since 2.0, under Text Alternatives. Every conformance level includes it. Decorative images are excepted when assistive technology can ignore them, which in HTML means an empty alt attribute, not a missing one. The long-form guide above quotes the exceptions.',
    pass: {
      caption: 'The photo has a purpose, so the alternative describes it. The spacer does not.',
      code: `<img src="/jacket.jpg" alt="Navy wool jacket, front view, brass buttons">
<img src="/divider.svg" alt="">`,
    },
    fail: {
      caption: 'A meaningful image has no alternative, so a screen reader has nothing to announce.',
      code: `<img src="/jacket.jpg">`,
    },
    related: ['1.3.1', '4.1.2', '2.4.4'],
  },

  '1.3.1': {
    kind: 'guide',
    platforms: {
      shopify: `Themes sometimes fake a heading with a large paragraph style, and product specification “tables” are divs with no header cells. The relationship has to be in the markup. Review a product page and a blog article in the [Shopify checker](${shopify}), then check the heading outline.`,
      wordpress: `The block editor’s Heading block is the right tool. A paragraph set to a large font, or a page builder “title” that is a div, fails 1.3.1 even when it looks like a heading. Tables pasted from a document often lose header cells. Scan with the [WordPress checker](${wordpress}).`,
      wix: `A text style named “Heading 2” is not always an h2. The [Wix checklist](${wixList}) treats real heading elements as the check. The wizard does not describe the outline of every strip. Use the [Wix checker](${wix}) and a heading list.`,
      squarespace: `Squarespace’s inclusive design guidance says to format headings with the text toolbar, not by enlarging body text. The [Squarespace checklist](${sqList}) quotes that and maps it to 1.3.1. One h1, then headings in order, on the published page.`,
    },
    levelNotes:
      'Level A, in WCAG since 2.0, under Adaptable. It covers headings, lists, tables and labels: if the visual design says those relationships exist, the code has to say so too. It does not grade whether the heading text is meaningful. That is 2.4.6 Headings and Labels, Level AA.',
    pass: {
      caption: 'The heading and the list are real elements, so the structure survives without the stylesheet.',
      code: `<h2>What is in the box</h2>
<ul>
  <li>Jacket</li>
  <li>Care card</li>
</ul>`,
    },
    fail: {
      caption: 'The heading and the list are only bold text and line breaks.',
      code: `<p><strong style="font-size:2rem">What is in the box</strong></p>
<p>• Jacket<br>• Care card</p>`,
    },
    related: ['2.4.6', '3.3.2', '4.1.2', '1.3.2'],
  },

  '1.4.1': {
    kind: 'guide',
    platforms: {
      shopify: `Sale prices shown only in red, and required-field stars with no word “required”, fail when color is the only cue. Variant swatches that are color chips need a text name or a pattern, not only the hue. Check a product page with the [Shopify checker](${shopify}).`,
      wordpress: `Theme links that are a different color and not underlined fail 1.4.1 in body text. Form errors that only turn a border red fail too. Add text or an icon with a name. The [WordPress checker](${wordpress}) does not see “color is the only cue” reliably, so grayscale the page.`,
      wix: `Form success and error states in site styles are often color-only. The [Wix checklist](${wixList}) is the manual list. Add the word “required” or an error message, then scan with the [Wix checker](${wix}).`,
      squarespace: `Link and button colors come from site styles. The [Squarespace checklist](${sqList}) maps color-only cues to 1.4.1. Underline links in text blocks, and do not use a red border as the only error.`,
    },
    levelNotes:
      'Level A, in WCAG since 2.0, under Distinguishable. Color cannot be the only visual means of conveying information, indicating an action, prompting a response, or distinguishing an element. Contrast of the text is a separate criterion, 1.4.3.',
    pass: {
      caption: 'The required field is marked with the word, not only with a color.',
      code: `<label for="email">Email address (required)</label>
<input id="email" required aria-invalid="true">
<p>Enter an email address in the form name@example.com.</p>`,
    },
    fail: {
      caption: 'Red text is the only sign that the field is required. The color is not in the name.',
      code: `<label for="email" style="color:#c00">Email address</label>
<input id="email">`,
    },
    related: ['1.4.3', '1.4.11', '3.3.1'],
  },

  '1.4.3': {
    kind: 'guide',
    platforms: {
      shopify: `Theme color settings and text sitting on product photos are the usual misses. Muted gray for prices and placeholders often falls under 4.5:1. Measure the pair in the [contrast checker](${contrast}) before you save the theme color, and scan the page with the [Shopify checker](${shopify}).`,
      wordpress: `Global styles and page-builder color pickers allow body text that looks “soft” and fails 4.5:1. Placeholder text on search and comment fields is in scope. The [WordPress checker](${wordpress}) reports text contrast axe-core can compute. Sample text on photos yourself.`,
      wix: `The Accessibility Wizard requires Level AA and does not check every element. The [Wix checklist](${wixList}) says to measure contrast yourself. Site text styles and text over strip backgrounds are the pair to sample. Then run the [Wix checker](${wix}).`,
      squarespace: `Site-wide text and button colors, and text on Fluid Engine photos, are the cases the [Squarespace checklist](${sqList}) calls out for 1.4.3. Change the color, add a background, or move the text. The editor preview is not the measurement. Use the [contrast checker](${contrast}).`,
    },
    levelNotes:
      'Level AA, in WCAG since 2.0. Normal text needs at least 4.5:1. Large text, at least 18 point or 14 point bold, needs at least 3:1. Incidental text and logotypes are excepted. The guide above has the ratios and the figures. 1.4.11 covers non-text parts at 3:1.',
    pass: {
      caption: 'Body text at #1f2430 on white is far above 4.5:1. The muted color #595959 on white is about 7:1.',
      code: `body { color: #1f2430; background: #fff; }
.note { color: #595959; }`,
    },
    fail: {
      caption: 'Gray #aaaaaa on white is about 2.3:1, which fails for every text size under 1.4.3.',
      code: `p { color: #aaaaaa; background: #fff; }`,
    },
    related: ['1.4.11', '1.4.1', '1.4.4', '1.4.6'],
  },

  '2.1.1': {
    kind: 'guide',
    platforms: {
      shopify: `Cart drawers, variant pickers, predictive search and menus are the components to tab through. A control that only works on hover or click fails 2.1.1. Hosted checkout is not the theme. Test the theme with a keyboard, and scan with the [Shopify checker](${shopify}).`,
      wordpress: `Mega menus, sliders and modal popups from plugins are the usual keyboard gaps. If Tab skips a control or Enter does nothing, it fails. The [WordPress checker](${wordpress}) finds some of this and misses the rest. Tab the page.`,
      wix: `Lightboxes, slideshows and the side cart need a keyboard path. The side cart is on the wizard’s does-not-support list in the [Wix checklist](${wixList}). Tab the published site, including the menu. Use the [Wix checker](${wix}) for the automated half.`,
      squarespace: `Squarespace documents a skip link and keyboard access in its inclusive design guidance, cited in the [Squarespace checklist](${sqList}). Galleries and form widgets still need a tab test on the published page. The editor is not the test.`,
    },
    levelNotes:
      'Level A, in WCAG since 2.0, under Keyboard Accessible. All functionality has to be available from a keyboard, except where the path of the pointer is essential, such as a freehand signature. No particular timing for each keystroke is required. A visible focus indicator is the separate criterion 2.4.7.',
    pass: {
      caption: 'The disclosure opens from the keyboard because it is a real button.',
      code: `<button type="button" aria-expanded="false" aria-controls="filters">Filters</button>
<div id="filters" hidden><!-- filter fields --></div>`,
    },
    fail: {
      caption: 'A div with a click handler is not in the tab order and has no key handler.',
      code: `<div class="filter-toggle" onclick="openFilters()">Filters</div>`,
    },
    related: ['2.1.2', '2.4.7', '2.4.3', '4.1.2'],
  },

  '2.2.2': {
    kind: 'guide',
    platforms: {
      shopify: `Slideshow sections and announcement marquees that move on their own need a pause, stop or hide control if they last more than five seconds. Autoplay that cannot be stopped fails. Check the theme slideshow and scan with the [Shopify checker](${shopify}).`,
      wordpress: `Slider plugins often autoplay and hide the pause button below the fold or omit it. Turn autoplay off, or show a pause control that actually stops the timer. The [WordPress checker](${wordpress}) will not score a modern carousel. Use the keyboard and the pause button.`,
      wix: `Pro galleries and strip slideshows can advance on their own. The [Wix checklist](${wixList}) is the manual list for motion. Add a pause control or stop the autoplay, publish, and confirm it works. The [Wix checker](${wix}) does not replace that.`,
      squarespace: `Background video and gallery autoplay are the cases Squarespace’s own media guidance talks about. The [Squarespace checklist](${sqList}) maps pause, stop or hide to 2.2.2. A loop with no control fails when it runs longer than five seconds beside other content.`,
    },
    levelNotes:
      'Level A, in WCAG since 2.0, under Enough Time. Moving, blinking or scrolling that starts by itself, lasts more than five seconds and is shown with other content needs a way to pause, stop or hide it, unless the movement is essential. Auto-updating content needs that control or a way to change the update frequency. The guide above has the carousel cases.',
    pass: {
      caption: 'The carousel has a visible pause button and does not depend on a system setting the visitor may not know about.',
      code: `<section aria-roledescription="carousel">
  <button type="button">Pause slides</button>
  <!-- slides -->
</section>`,
    },
    fail: {
      caption: 'Slides advance on a timer with no pause, stop or hide control.',
      code: `<div class="slider" data-autoplay="true" data-interval="4000">
  <div>Slide 1</div>
  <div>Slide 2</div>
</div>`,
    },
    related: ['2.2.1', '2.3.1', '2.2.3'],
  },

  '2.4.1': {
    kind: 'guide',
    platforms: {
      shopify: `A theme should offer a skip link as the first focusable control, pointing at the main content. Header menus, predictive search and announcement bars are the repeated blocks. Tab once on the homepage and on a product page. Scan with the [Shopify checker](${shopify}).`,
      wordpress: `Most accessibility-ready themes include “Skip to content”. A theme or builder that removes it, and has no headings or landmarks to jump by, fails 2.4.1. Check the first Tab stop. The [WordPress checker](${wordpress}) can see a missing main landmark. It does not prove the skip link works.`,
      wix: `The site header repeats on every page. Confirm the first Tab stop bypasses it, or that landmarks and headings do. The [Wix checklist](${wixList}) covers structure the wizard misses. Test the published site, then run the [Wix checker](${wix}).`,
      squarespace: `Squarespace’s inclusive design guidance says the first Tab opens a Skip to Content link. The [Squarespace checklist](${sqList}) maps that to 2.4.1. Confirm it on the published page. The editor preview is not the test.`,
    },
    levelNotes:
      'Level A, in WCAG since 2.0, under Navigable. A mechanism must bypass blocks repeated on multiple pages. A skip link, a landmark structure with headings, or both, can meet it. The mechanism has to work, not merely exist in the code.',
    pass: {
      caption: 'The first focusable control skips the repeated header.',
      code: `<a class="skip-link" href="#main">Skip to content</a>
<header><!-- repeated navigation --></header>
<main id="main" tabindex="-1"></main>`,
    },
    fail: {
      caption: 'Every page starts with a long menu and there is no skip link, landmark or heading structure to jump past it.',
      code: `<header>
  <nav><!-- dozens of links, no skip control --></nav>
</header>`,
    },
    related: ['2.4.2', '2.1.1', '1.3.1'],
  },

  '2.4.2': {
    kind: 'guide',
    platforms: {
      shopify: `The browser title should name the product or the collection, not only the store. A homepage titled with the store name can pass if that is the topic. Duplicate titles across products fail. Check the title element, then scan with the [Shopify checker](${shopify}).`,
      wordpress: `The tag is built from the document title and, often, an SEO plugin’s title format. A title that is only “Home” or “Blog” on every post fails. Set a specific title in the editor or the plugin. The [WordPress checker](${wordpress}) flags an empty title.`,
      wix: `The SEO panel’s title is what the browser tab and screen readers use. Match it to the page’s topic. The [Wix checklist](${wixList}) includes titles. Confirm on the published page with the [Wix checker](${wix}).`,
      squarespace: `If an SEO title is set, Squarespace’s guidance says screen readers read that title rather than the page title. The [Squarespace checklist](${sqList}) maps this to 2.4.2. Put the specific words first.`,
    },
    levelNotes:
      'Level A, in WCAG since 2.0, under Navigable. Each web page needs a title that describes its topic or purpose. The title element is the usual way. A heading on the page is not a substitute for the document title.',
    pass: {
      caption: 'The title names the page and then the site.',
      code: `<title>Navy wool jacket | Northwind Supply</title>`,
    },
    fail: {
      caption: 'Every page shares one title, so the tab does not say which page this is.',
      code: `<title>Home</title>`,
    },
    related: ['2.4.6', '2.4.4', '3.1.1'],
  },

  '2.4.3': {
    kind: 'guide',
    platforms: {
      shopify: `Drawers and predictive search that do not move focus, or that close and drop focus at the top of the page, fail when the order no longer makes sense. Tab the cart drawer. CSS that visually reorders options can also break the sequence. Scan with the [Shopify checker](${shopify}), then tab.`,
      wordpress: `Flex and grid order, and menu plugins that insert items, can make Tab land in a different order from the visual one. If that changes the meaning, it fails 2.4.3. The [WordPress checker](${wordpress}) will not map the visual order. Tab the menu and a modal.`,
      wix: `Overlapping strips and lightboxes are the risk. Focus should enter the open lightbox and return to the control that opened it. The [Wix checklist](${wixList}) lists wizard gaps. Tab the published page.`,
      squarespace: `Fluid Engine can place a button visually before the text that Tab reaches later. If that order changes what the control means, reorder the blocks. The [Squarespace checklist](${sqList}) covers focus. Test the published page.`,
    },
    levelNotes:
      'Level A, in WCAG since 2.0, under Navigable. When sequential navigation order changes meaning or operation, focus has to follow an order that preserves both. A quirk that does not change meaning is not automatically a failure. Hiding and showing content must not strand focus.',
    pass: {
      caption: 'Opening the dialog moves focus into it. Closing returns focus to the button.',
      code: `<button type="button">Shipping options</button>
<!-- on open, move focus to the dialog; on close, return it to this button -->
<div role="dialog" aria-modal="true" aria-labelledby="ship-title">
  <h2 id="ship-title">Shipping options</h2>
</div>`,
    },
    fail: {
      caption: 'The dialog opens at the end of the DOM, so Tab walks the whole page before it arrives.',
      code: `<button type="button" onclick="dialog.hidden = false">Shipping options</button>
<!-- later, not focused -->
<div id="dialog" role="dialog" hidden></div>`,
    },
    related: ['2.4.7', '2.1.1', '2.4.11'],
  },

  '2.4.4': {
    kind: 'guide',
    platforms: {
      shopify: `“Quick view”, “Read more” on blog cards, and icon-only social links fail when the purpose is not in the link text or a programmatic context. Add the product or article name, visibly or as an accessible name. Scan collection and blog pages with the [Shopify checker](${shopify}).`,
      wordpress: `Archive templates and “continue reading” blocks are the classic failure. The theme can append the post title in screen-reader text. Icon links in the footer need a name. The [WordPress checker](${wordpress}) flags empty links.`,
      wix: `Buttons and text links in strips often say “Click here” or “Learn more”. Rename them in the editor. Repeated app links are outside parts of the wizard, per the [Wix checklist](${wixList}). Use the [Wix checker](${wix}) for empty links.`,
      squarespace: `Summary blocks and blog lists are where “Read more” shows up. Squarespace’s guidance says the link text should state the purpose. The [Squarespace checklist](${sqList}) maps that to 2.4.4. Rename the link or include the title.`,
    },
    levelNotes:
      'Level A, in WCAG since 2.0, under Navigable. The purpose of each link must be clear from the link text alone or from the link text plus its programmatic context, except where the purpose is ambiguous to users in general. 2.4.9 Link Purpose (Link Only) is the stricter AAA rule.',
    pass: {
      caption: 'The link text names the destination.',
      code: `<a href="/care">Read the jacket care guide</a>`,
    },
    fail: {
      caption: 'Several cards share “Read more”, and nothing programmatic says more about what.',
      code: `<a href="/care">Read more</a>`,
    },
    related: ['2.4.9', '4.1.2', '2.4.6'],
  },

  '2.5.8': {
    kind: 'guide',
    platforms: {
      shopify: `Variant swatches, quantity icons and footer policy links are often under 24 by 24 CSS pixels and closer together than the spacing exception allows. Size the hit area, not only the icon. The [store checklist](${storeList}) includes 2.5.8. Scan with the [Shopify checker](${shopify}).`,
      wordpress: `Pagination, social icons and mobile menu items are the usual small targets. A 24 CSS pixel minimum, or spacing that keeps the 24px circles from overlapping, meets the minimum. Check the theme stylesheet and the [WordPress checker](${wordpress}).`,
      wix: `Icon buttons in a strip are often smaller than 24px. The wizard does not measure target size. The [Wix checklist](${wixList}) is the manual pass. Enlarge the clickable area, then run the [Wix checker](${wix}).`,
      squarespace: `Social links, gallery controls and navigation items in a dense header are the ones to measure. The [Squarespace checklist](${sqList}) covers pointer use alongside the newer criteria. Measure on the published page at 100% zoom.`,
    },
    levelNotes:
      'Level AA, added in WCAG 2.2, under Input Modalities. The target is at least 24 by 24 CSS pixels, with exceptions for spacing, an equivalent larger control, inline links in a sentence, unmodified user-agent controls, and a presentation that is essential. The AAA rule 2.5.5 Target Size (Enhanced) uses 44 by 44 CSS pixels.',
    pass: {
      caption: 'The button’s hit area is at least 24 by 24 CSS pixels.',
      code: `button.icon {
  min-width: 24px;
  min-height: 24px;
}`,
    },
    fail: {
      caption: 'Two tiny targets sit against each other, so a 24px circle on each would overlap.',
      code: `button.icon {
  width: 12px;
  height: 12px;
  padding: 0;
}`,
    },
    related: ['2.5.7', '2.5.5', '2.5.1'],
  },

  '3.1.1': {
    kind: 'guide',
    platforms: {
      shopify: `The theme should set the html lang attribute from the store’s language. A missing lang, or lang="en" on a store whose pages are in another language, fails 3.1.1. View source on the published theme and scan with the [Shopify checker](${shopify}).`,
      wordpress: `WordPress sets lang from Settings → General → Site Language when the theme uses language_attributes() on the html element. A theme that hard-codes the element without that call can drop it. The [WordPress checker](${wordpress}) flags a missing html lang.`,
      wix: `The site language should appear on the html element of the published site. Confirm in view source, including on blog posts if the site is multilingual. The [Wix checklist](${wixList}) covers language alongside other document-level checks. Then use the [Wix checker](${wix}).`,
      squarespace: `Set the site language and confirm the published html element carries it. A language switcher does not replace the lang attribute. The [Squarespace checklist](${sqList}) includes document language. Scan with the [Squarespace checker](${squarespace}).`,
    },
    levelNotes:
      'Level A, in WCAG since 2.0, under Readable. The default human language of each page must be programmatically determined. In HTML that is the lang attribute on the html element. Passages in another language are 3.1.2 Language of Parts, Level AA.',
    pass: {
      caption: 'The page language is set on the html element.',
      code: `<html lang="en">`,
    },
    fail: {
      caption: 'There is no lang attribute, so a screen reader has to guess the language.',
      code: `<html>`,
    },
    related: ['3.1.2', '2.4.2'],
  },

  '3.3.1': {
    kind: 'guide',
    platforms: {
      shopify: `Theme forms (contact, newsletter, gift card) sometimes only turn a border red. The error has to be described in text and tied to the field. Hosted checkout has its own messages. Test the forms you edit, and scan with the [Shopify checker](${shopify}).`,
      wordpress: `Comment forms and form plugins that show a red outline and no text fail 3.3.1. The message should name the field and the problem. The [WordPress checker](${wordpress}) cannot tell that a red border is an error. Read the message.`,
      wix: `Form apps need a text error, not only a color. Some app pages are outside the wizard, as the [Wix checklist](${wixList}) lists. Submit an empty required field on the published form and read the result. Use the [Wix checker](${wix}) for names and roles.`,
      squarespace: `Form blocks should state the error in text next to the field. Squarespace’s form guidance is in the [Squarespace checklist](${sqList}). A red outline alone fails both 3.3.1 and 1.4.1.`,
    },
    levelNotes:
      'Level A, in WCAG since 2.0, under Input Assistance. If an input error is automatically detected, the item in error is identified and the error is described to the user in text. Suggesting a correction is the separate AA criterion 3.3.3 Error Suggestion.',
    pass: {
      caption: 'The error names the field and the problem, in text.',
      code: `<label for="email">Email address</label>
<input id="email" aria-invalid="true" aria-describedby="email-error">
<p id="email-error">Enter an email address in the form name@example.com.</p>`,
    },
    fail: {
      caption: 'The field turns red and nothing in text says what is wrong.',
      code: `<input id="email" style="border-color:#c00">`,
    },
    related: ['3.3.2', '3.3.3', '4.1.3', '1.4.1'],
  },

  '3.3.2': {
    kind: 'guide',
    platforms: {
      shopify: `Search, newsletter and contact fields in the theme need a visible label. A placeholder is not a label, because it disappears when someone types. Check those forms on the published theme with the [Shopify checker](${shopify}).`,
      wordpress: `Comment forms, search, and form-plugin fields often rely on a placeholder. Add a visible label element associated with the input. The [WordPress checker](${wordpress}) flags inputs with no accessible name.`,
      wix: `Form fields should keep a visible label. The [Wix checklist](${wixList}) covers forms the wizard does not fully scan, including some app flows. Do not use the placeholder as the only name. Scan with the [Wix checker](${wix}).`,
      squarespace: `Squarespace’s inclusive design guidance says each field needs a label and that placeholder text should not replace it. The [Squarespace checklist](${sqList}) maps that to 3.3.2. Leave the label on, including in checkout fields you do not rebuild.`,
    },
    levelNotes:
      'Level A, in WCAG since 2.0, under Input Assistance. Labels or instructions are required when content requires user input. The label has to be available when the person needs it, including while they are typing. A placeholder alone does not meet it.',
    pass: {
      caption: 'The label is visible, associated, and still there while the person types.',
      code: `<label for="email">Email address</label>
<input id="email" type="email" autocomplete="email">`,
    },
    fail: {
      caption: 'The placeholder is the only instruction, and it vanishes on focus.',
      code: `<input type="email" placeholder="Email address">`,
    },
    related: ['3.3.1', '1.3.1', '4.1.2', '1.3.5'],
  },

  '3.3.8': {
    kind: 'guide',
    platforms: {
      shopify: `Customer account login is largely hosted. Where you cannot change it, do not add a second login in the theme that blocks paste or requires a puzzle. The [store checklist](${storeList}) maps 3.3.8 to account and checkout. Scan public pages with the [Shopify checker](${shopify}). A page you cannot modify is not a pass you have verified.`,
      wordpress: `The login form should allow paste and password managers. Plugins that set autocomplete="off" on the password, or add a CAPTCHA with no alternative, are the failure. Allow paste. The [WordPress checker](${wordpress}) will not log in for you.`,
      wix: `Member login and checkout authentication need a path that does not rely on memory alone: paste, a password manager, or another method such as an email link. Some of those screens are outside the wizard. See the [Wix checklist](${wixList}).`,
      squarespace: `Customer account and checkout login should not block paste or require a transcription puzzle. Where the screen is hosted, do not add another gate in a page you control. The [Squarespace checklist](${sqList}) and the [store checklist](${storeList}) cover the criterion.`,
    },
    levelNotes:
      'Level AA, added in WCAG 2.2, under Input Assistance. A cognitive function test (remembering a password, transcribing, solving a puzzle) is not required at authentication unless there is an alternative method, a mechanism such as paste or a password manager, an object-recognition test, or a personal-content test. The AAA criterion 3.3.9 drops the object-recognition and personal-content exceptions.',
    pass: {
      caption: 'Paste and password managers work. The field does not block them.',
      code: `<label for="password">Password</label>
<input id="password" type="password" autocomplete="current-password">`,
    },
    fail: {
      caption: 'The script blocks paste, so a password manager cannot fill the field.',
      code: `<input id="password" type="password" autocomplete="off" onpaste="return false">`,
    },
    related: ['3.3.9', '3.3.7', '2.2.1'],
  },

  '4.1.1': {
    kind: 'guide',
    platforms: {
      shopify: `4.1.1 Parsing is obsolete in WCAG 2.2. A Shopify theme validator warning is not a 4.1.1 failure under 2.2. Duplicate ids that break a label’s for attribute still matter, under 1.3.1 and 4.1.2. Scan for those with the [Shopify checker](${shopify}).`,
      wordpress: `Broken block markup and duplicate ids from plugins still cause real bugs, but they are not a WCAG 2.2 parsing failure. Fix ids that labels and aria-labelledby point at. The [WordPress checker](${wordpress}) reports those name and label issues.`,
      wix: `You rarely edit the platform’s HTML. A validator report on generated markup is not a 2.2 failure of 4.1.1. Care about names, roles and labels instead. The [Wix checklist](${wixList}) and the [Wix checker](${wix}) are aimed at those.`,
      squarespace: `The same note applies. Do not spend the audit on making Squarespace’s generated HTML validate for 4.1.1. Spend it on alt text, headings, labels and focus, which the [Squarespace checklist](${sqList}) maps to criteria that are still in WCAG 2.2.`,
    },
    levelNotes:
      'Level A in WCAG 2.0 and 2.1. Removed from WCAG 2.2. The W3C’s [What’s New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) says 4.1.1 Parsing is obsolete and removed, and that the other 2.0 and 2.1 criteria are essentially unchanged. The guide above explains the note the W3C added for HTML and XML. Duplicate ids still fail other criteria when something references them.',
    pass: {
      caption: 'Under WCAG 2.2 there is nothing to pass for 4.1.1. This label points at a single id, which is what 1.3.1 and 4.1.2 still need.',
      code: `<label for="email">Email address</label>
<input id="email" type="email">`,
    },
    fail: {
      caption: 'Two elements share an id, so the label can point at the wrong control. That is a problem for 1.3.1 or 4.1.2, not for 4.1.1 in WCAG 2.2.',
      code: `<label for="email">Email address</label>
<input id="email" type="email">
<input id="email" type="text">`,
    },
    related: ['4.1.2', '1.3.1', '3.3.2'],
  },

  '4.1.2': {
    kind: 'guide',
    platforms: {
      shopify: `Icon buttons for cart, search and menu need an accessible name, and custom dropdowns need a role and a state. A div that acts as a button fails. The [Shopify checker](${shopify}) flags empty buttons and links. Tab the header to confirm the name is announced.`,
      wordpress: `Menu toggles, icon buttons in builders, and custom select widgets are the usual gaps. Use a button element, or add the role, the name and the expanded state. The [WordPress checker](${wordpress}) reports empty buttons and missing names.`,
      wix: `Icon buttons in the header and strips need a name in the element settings, not only a tooltip that disappears. The [Wix checklist](${wixList}) covers names the wizard misses on some apps. Scan with the [Wix checker](${wix}).`,
      squarespace: `Icon links, accordion toggles and form controls need a name and, where the state changes, a state. The [Squarespace checklist](${sqList}) maps empty controls to 4.1.2. Set the label in the block, then scan with the [Squarespace checker](${squarespace}).`,
    },
    levelNotes:
      'Level A, in WCAG since 2.0, under Compatible. For every user interface component, the name and role can be programmatically determined, and states and values the user can set can be set in the code, with notification of changes. 4.1.3 Status Messages covers messages that are not focus changes.',
    pass: {
      caption: 'The icon button has a name. The state is exposed.',
      code: `<button type="button" aria-expanded="false" aria-controls="nav">
  <svg aria-hidden="true" viewBox="0 0 24 24"><!-- icon --></svg>
  Menu
</button>`,
    },
    fail: {
      caption: 'The control is a div with no role and no name. A screen reader cannot tell what it is.',
      code: `<div class="menu-toggle" onclick="openMenu()">
  <img src="/menu.svg">
</div>`,
    },
    related: ['1.1.1', '2.1.1', '4.1.3', '2.4.4'],
  },

  '4.1.3': {
    kind: 'guide',
    platforms: {
      shopify: `An add-to-cart message that appears visually and is not a status or alert role is easy to miss. Cart count updates have the same gap. The theme can add role="status" on the message container. Test with a screen reader and scan with the [Shopify checker](${shopify}).`,
      wordpress: `WooCommerce notices and form-plugin success text often appear only visually. Put them in a container with role="status", or role="alert" when the message is important enough to interrupt. The [WordPress checker](${wordpress}) has limited coverage here. Listen to the page.`,
      wix: `Store “added to cart” and form thank-you text need to be exposed as status messages when focus does not move to them. Some of those screens are outside the wizard, per the [Wix checklist](${wixList}). Confirm with a screen reader, and run the [Wix checker](${wix}).`,
      squarespace: `Form confirmation text and commerce notices should be in the accessibility tree as a status, not only as a color change. The [Squarespace checklist](${sqList}) covers forms. If the page moves focus to the message, 4.1.3’s specific requirement is not the one in play, but the move itself has to be sensible under 2.4.3.`,
    },
    levelNotes:
      'Level AA, added in WCAG 2.1, under Compatible. Status messages must be programmatically determined through role or properties so assistive technology can present them without the message taking focus. It does not apply to a change that moves focus, such as a dialog that opens. It is not in WCAG 2.0.',
    pass: {
      caption: 'The confirmation is a status message. Focus can stay in the field.',
      code: `<div role="status">Added to bag. The bag has 2 items.</div>`,
    },
    fail: {
      caption: 'The confirmation is a div with no role, so a screen reader may not announce it.',
      code: `<div class="toast">Added to bag</div>`,
    },
    related: ['4.1.2', '3.3.1', '2.4.3'],
  },
};

// Plain-language gloss for free-scan issues. The scan still supplies the
// technical title, the count and the WCAG references. This module only
// chooses the words shown first. It does not decide what failed.

const GENERIC_WHY = 'This makes the page harder for some visitors to use.';

// Checked in order. Specific phrases come before broad ones.
const TITLE_RULES = [
  { re: /non-text contrast/i, name: 'Icons or borders are hard to see', why: 'Parts of the page, such as icons or field borders, do not stand out enough from the background.' },
  { re: /contrast ratio|color contrast|minimum contrast|enhanced contrast/i, name: 'Text is hard to read', why: 'The text and background colors are too similar, so some people cannot read it.' },
  { re: /image button|input[^.]{0,40}image|type=.image/i, name: 'A picture button has no description', why: 'Someone who cannot see the picture will not know what the button does.' },
  { re: /repeated as text|redundant alt/i, name: 'A picture description repeats nearby text', why: 'A screen reader says the same thing twice.' },
  { re: /alternative text|alt text|missing alternative|images are missing|svg images|role="img"|role=.img.|an img role/i, name: 'A picture has no description', why: 'Someone who cannot see the picture will not know what it shows.' },
  { re: /same purpose|similar purpose|equivalent purpose/i, name: 'Links with the same name do different things', why: 'When two links share a name, people expect them to go to the same place.' },
  { re: /click here|read more|vague text|link purpose/i, name: 'A link does not say where it goes', why: 'In a list of links, "click here" or "read more" does not say what will open.' },
  { re: /distinguishable without relying on color|link-in-text/i, name: 'Links are hard to spot', why: 'If a link only looks different by color, people who do not see color well can miss it.' },
  { re: /use of color|color alone/i, name: 'Color is the only clue', why: 'People who do not see color differences can miss what the color was meant to show.' },
  { re: /\bbuttons?\b/i, name: 'A button has no name', why: 'Someone using a screen reader hears "button" and cannot tell what it does.' },
  { re: /skip-link target|skip link target/i, name: 'The skip link does not go anywhere', why: 'The link that should jump past the menu has nowhere to land.' },
  { re: /skip|bypass|repeated block|one main landmark/i, name: 'There is no way to skip the menu', why: 'Keyboard and screen reader users have to move through the same navigation on every page.' },
  { re: /\blinks?\b/i, name: 'A link has no name', why: 'Someone using a screen reader hears "link" and cannot tell where it goes.' },
  { re: /autocomplete/i, name: 'A field does not say what it is for', why: 'The browser cannot offer to fill it in, which is harder for people who have trouble typing.' },
  { re: /duplicat|not unique|must be unique|ids used/i, name: 'The same ID is used more than once', why: 'A label can point at the wrong thing, so the name that gets announced is wrong.' },
  { re: /multiple label/i, name: 'A field has more than one label', why: 'A screen reader may announce the field twice, or announce the wrong name.' },
  { re: /\bforms?\b|select element|text field|input fields?|have labels|no label/i, name: 'A form field has no label', why: 'Someone hears "edit text" and cannot tell what to type. Placeholder text is not a label.' },
  { re: /language of part/i, name: 'A change of language is not marked', why: 'A phrase in another language may be read with the wrong pronunciation.' },
  { re: /page language|language of page|html[^.]{0,40}lang|lang attribute/i, name: 'The page language is not set', why: 'A screen reader may pronounce the words in the wrong language.' },
  { re: /page title|document[^.]{0,20}title|<title>|title is missing/i, name: 'The page has no title', why: 'The title is the browser tab name, and it is the first thing a screen reader says.' },
  { re: /empty heading|headings are empty|headings should not be empty/i, name: 'A heading is empty', why: 'People who jump by headings land on a blank one and lose their place.' },
  { re: /heading level|heading order|levels are skipped|increase by one/i, name: 'Headings skip a level', why: 'The outline of the page jumps, so it is harder to tell how the page is organized.' },
  { re: /level-one|level one|heading-one|main heading|no .{0,12}heading/i, name: 'The page has no main heading', why: 'There is no clear title on the page for people who move by headings.' },
  { re: /500%|reflow/i, name: 'Enlarged text does not fit the screen', why: 'When text is larger, visitors may have to scroll sideways and can miss content.' },
  { re: /zoom|scaling|user-scalable|maximum-scale|viewport/i, name: 'People cannot zoom in', why: 'The page blocks zoom, so visitors who need larger text cannot make it bigger.' },
  { re: /text spacing|letter spacing|line height/i, name: 'Text spacing cannot be changed', why: 'Some people need more space between letters or lines, and the page prevents that.' },
  { re: /target size|touch target/i, name: 'Tap targets are too small', why: 'Buttons or links are small and close together, so they are easy to miss with a finger.' },
  { re: /keyboard trap/i, name: 'Keyboard users can get stuck', why: 'Someone can tab into a part of the page and have no way to tab back out.' },
  { re: /focus visible|visible focus|focus not obscured|focus appearance/i, name: 'Keyboard focus is hard to see', why: 'When someone tabs, they cannot tell which item is selected.' },
  { re: /appropriate role/i, name: 'A keyboard control is not identified', why: 'Something people can tab to is not marked as a button, link, or other control, so software cannot explain it.' },
  { re: /focusable content must not have tabindex/i, name: 'A frame cannot be reached by keyboard', why: 'People who tab through the page skip what is inside this frame.' },
  { re: /tabindex|focus order/i, name: 'Keyboard focus jumps around', why: 'Tabbing does not follow a sensible order, so people lose their place.' },
  { re: /scrollable/i, name: 'A scrolling area is not keyboard accessible', why: 'What is inside a box that scrolls cannot be reached without a mouse.' },
  { re: /keyboard/i, name: 'A control does not work by keyboard', why: 'People who cannot use a mouse cannot reach or operate it.' },
  { re: /tested with axe/i, name: 'An embedded frame needs a closer look', why: 'Automatic checks cannot fully test what is inside this frame.' },
  { re: /iframe|\bframes?\b/i, name: 'An embedded frame has no name', why: 'A screen reader says "frame", and the person cannot tell whether to enter it.' },
  { re: /autoplay|play automatically|automatically with sound|audio control/i, name: 'Sound starts by itself', why: 'Unexpected audio talks over a screen reader and can be hard to find and stop.' },
  { re: /refresh|time limit|on a timer|timed redirect/i, name: 'The page moves on a timer', why: 'The page can refresh or leave before someone has finished reading it.' },
  { re: /blink|marquee|scrolling text|pause, stop|moving content/i, name: 'Something moves and cannot be paused', why: 'Moving text is hard to read, and some people need the page to sit still.' },
  { re: /hidden from assistive|whole page is hidden|aria-hidden=.true.|on the (document )?body/i, name: 'The page is hidden from screen readers', why: 'Assistive software is told to ignore the page, so visitors hear nothing.' },
  { re: /aria-hidden/i, name: 'Content is hidden from screen readers', why: 'Assistive software is told to skip it, even when people need that content.' },
  { re: /invalid aria|aria role|unrecognized role|roles are valid|must conform to valid/i, name: 'A control is labeled in a way software does not understand', why: 'A screen reader cannot tell the person what kind of thing they are on.' },
  { re: /label in name|visible text as part of (their |the )?accessible name|content-name/i, name: 'The visible label and the spoken name do not match', why: 'Voice-control users say the words they see, and the control does not respond.' },
  { re: /landmarks should have/i, name: 'A page region needs a name', why: 'When two regions are the same kind, people need a name to tell them apart.' },
  { re: /\bsummary elements\b/i, name: 'A collapsible section has no name', why: 'Someone cannot tell what will open when they activate it.' },
  { re: /dialog/i, name: 'A dialog has no name', why: 'When a window opens, a screen reader cannot say what it is.' },
  { re: /accessible name|discernible text/i, name: 'A control has no name', why: 'Software cannot tell the person what this control is.' },
  { re: /hidden element must not be focusable/i, name: 'Hidden content can still be focused', why: 'Keyboard users can land on something a screen reader will not announce.' },
  { re: /role="text"|role=text\b/i, name: 'Keyboard focus can land inside text', why: 'Focus should move between controls, not get stuck inside a piece of text.' },
  { re: /\baria\b|wai-aria/i, name: 'A control is marked up in a way software cannot use', why: 'Screen readers need a correct name and role to explain the control.' },
  { re: /<audio>[^.]{0,80}caption/i, name: 'Audio has no text alternative', why: 'People who cannot hear the audio need a transcript.' },
  { re: /same summary and caption|give caption to a data table/i, name: 'A table caption is confusing', why: 'The caption repeats the summary, or a cell is used as the caption, so it is announced in the wrong place.' },
  { re: /caption/i, name: 'Video is missing captions', why: 'People who are deaf or hard of hearing cannot follow what is said.' },
  { re: /audio description/i, name: 'Video has no spoken description', why: 'People who cannot see the video miss anything that is only shown on screen.' },
  { re: /header text should not be empty/i, name: 'A table header is blank', why: 'A screen reader announces an empty column or row name.' },
  { re: /scope attribute/i, name: 'A table header is marked incorrectly', why: 'A screen reader may announce the wrong column or row for a cell.' },
  { re: /table|header cell|<th\b/i, name: 'A table has no headers', why: 'A screen reader cannot say which column or row a cell belongs to.' },
  { re: /status message/i, name: 'Updates are not announced', why: 'A success or error message can appear without a screen reader saying so.' },
  { re: /orientation/i, name: 'The page locks the screen direction', why: 'People who have a device fixed in one orientation cannot turn the page to read it.' },
  { re: /nested/i, name: 'A control sits inside another control', why: 'A button or link inside another one is confusing to use by keyboard or screen reader.' },
  { re: /character key/i, name: 'A single-key shortcut can fire by accident', why: 'While someone is typing, a one-letter shortcut can activate something they did not intend.' },
  { re: /accesskey|shortcut/i, name: 'A keyboard shortcut clashes', why: 'A shortcut can fire while someone is trying to type or use their own software.' },
  { re: /image map/i, name: 'An image map is hard to use', why: 'Clickable areas on a picture can be impossible to reach by keyboard or screen reader.' },
  { re: /error identification|form error/i, name: 'A form error is not explained in words', why: 'A red border, or a vague "something went wrong", does not say what to fix.' },
  { re: /on input|change of context/i, name: 'The page changes as soon as someone answers', why: 'Choosing an option or leaving a field should not send someone to a new page unless they were told it would.' },
  { re: /images of text/i, name: 'Text is locked inside an image', why: 'People cannot resize or restyle that text the way they can with real text.' },
  { re: /hover or focus|content on hover/i, name: 'Pop-up content is hard to reach', why: 'Tips that appear on hover can be impossible to open by keyboard, or they vanish too quickly.' },
  { re: /dragging/i, name: 'An action only works by dragging', why: 'People who cannot drag need a simple click or tap to do the same thing.' },
  { re: /pointer gesture|multipoint|path-based/i, name: 'A gesture has no simple alternative', why: 'A pinch or a drawn path also needs a single click or tap that does the same thing.' },
  { re: /pointer cancellation/i, name: 'An action can fire too early', why: 'It should happen when the person releases, so they can move away to cancel.' },
  { re: /motion actuation|device motion|shaking/i, name: 'The page depends on moving the device', why: 'People who cannot shake or tilt the device need another way to do the same thing.' },
  { re: /authentication|captcha/i, name: 'Signing in depends on memory or a puzzle', why: 'People who cannot remember a password or solve a puzzle need another way to sign in, such as a password manager or a pasted code.' },
  { re: /consistent navigation|consistent identification|consistent help/i, name: 'Controls are not in a consistent place', why: 'When the same control moves or is renamed on each page, people have to relearn it.' },
  { re: /multiple ways/i, name: 'There is only one way to find pages', why: 'Some people need search or a site map, not only the menu.' },
  { re: /sensory characteristic/i, name: 'Instructions depend on sight', why: 'Directions like "click the round button on the right" fail for people who cannot see that layout.' },
  { re: /meaningful sequence|reading order/i, name: 'The reading order does not match the screen', why: 'A screen reader may say things in a different order from what a sighted person sees.' },
  { re: /three flashes|seizure|flashes/i, name: 'Something on the page flashes', why: 'Flashing content can cause seizures and needs to stay under the safe limit, or be removable.' },
  { re: /<dl>|<dt>|<dd>|<li> elements|<ul> and <ol>/i, name: 'A list is coded so screen readers stumble', why: 'List items need to sit inside a real list, or the list is announced as plain text.' },
  { re: /styled <p>|used as headings/i, name: 'A heading is only styled to look like one', why: 'It looks like a heading, but software cannot use it to move around the page.' },
  { re: /presentational/i, name: 'Something marked as decorative is still announced', why: 'Assistive software still reads an item that was meant to be ignored.' },
  { re: /landmark/i, name: 'Page regions are nested or repeated', why: 'Landmarks let people jump around the page. Nested or duplicate regions make that list noisy.' },
  { re: /hidden content/i, name: 'Hidden content was not fully checked', why: 'Content that is hidden from view can still matter. The automatic check could not decide it.' },
];

// Used when the title did not match a rule above. Keyed by success criterion.
const BY_SC = {
  '1.1.1': 'Pictures, icons, and other non-text items need a text description.',
  '1.2.1': 'Audio or video that stands alone needs a text alternative.',
  '1.2.2': 'Prerecorded video needs captions so people can read what is said.',
  '1.2.3': 'Prerecorded video needs a description of what happens on screen, or a full text alternative.',
  '1.2.4': 'Live video needs captions.',
  '1.2.5': 'Prerecorded video needs a spoken description of important visuals.',
  '1.3.1': 'The structure of the page, such as headings, labels, and tables, has to be in the code, not only in how it looks.',
  '1.3.2': 'The order a screen reader uses has to match the order that makes sense on screen.',
  '1.3.3': 'Instructions cannot rely only on shape, color, or position.',
  '1.3.4': 'The page should not force portrait or landscape.',
  '1.3.5': 'Fields that ask for common information, such as email, should say so in the code so a browser can fill them in.',
  '1.4.1': 'Color cannot be the only way to tell something.',
  '1.4.2': 'If sound plays on its own, people need a way to stop it.',
  '1.4.3': 'Text needs enough contrast with its background to be readable.',
  '1.4.4': 'People need to be able to enlarge text.',
  '1.4.5': 'Real text is better than text baked into an image, because people can resize it.',
  '1.4.10': 'When text is enlarged, the page should reflow instead of forcing sideways scrolling.',
  '1.4.11': 'Icons, borders, and other graphics that convey information need enough contrast.',
  '1.4.12': 'People need to be able to increase spacing between letters, words, and lines.',
  '1.4.13': 'Content that appears on hover or focus must be reachable and stay open long enough to read.',
  '2.1.1': 'Everything someone can do with a mouse must also work with a keyboard.',
  '2.1.2': 'Keyboard users must be able to move away from every part of the page.',
  '2.1.4': 'Single-key shortcuts need a way to turn them off or change them.',
  '2.2.1': 'Time limits need a way to turn off, adjust, or extend them.',
  '2.2.2': 'Anything that moves, blinks, or scrolls needs a way to pause or hide it.',
  '2.3.1': 'Content must not flash more than the safe limit.',
  '2.4.1': 'People need a way to skip repeated menus and jump to the main content.',
  '2.4.2': 'Each page needs a title that describes it.',
  '2.4.3': 'Tab order should follow the order of the page.',
  '2.4.4': 'Link text should say where the link goes.',
  '2.4.5': 'There should be more than one way to find a page, such as search or a site map.',
  '2.4.6': 'Headings and labels should describe the topic or the field.',
  '2.4.7': 'The item selected by keyboard should be visible.',
  '2.4.11': 'The keyboard focus should not be covered by other content.',
  '2.5.1': 'Gestures such as a pinch need a simple single-pointer alternative.',
  '2.5.2': 'Actions should complete when the person releases, so they can cancel.',
  '2.5.3': 'The name software hears should include the words people see.',
  '2.5.7': 'Dragging needs a simple alternative, such as a click or tap.',
  '2.5.8': 'Tap targets need to be large enough to hit reliably.',
  '3.1.1': 'The page needs a language set so words are pronounced correctly.',
  '3.1.2': 'A passage in another language needs to be marked.',
  '3.2.1': 'Landing on an item with the keyboard should not unexpectedly open a new page.',
  '3.2.2': 'Changing a field should not unexpectedly open a new page.',
  '3.2.3': 'Navigation should stay in the same place across pages.',
  '3.2.4': 'The same control should have the same name across pages.',
  '3.2.6': 'Help, if you offer it, should be in the same place on each page.',
  '3.3.1': 'Form errors need to be described in text, next to the field.',
  '3.3.2': 'Fields need visible labels, and any required format should be explained up front.',
  '3.3.3': 'When the system knows how to fix an error, it should suggest the correction.',
  '3.3.4': 'Legal, financial, or data submissions need a way to review or undo them.',
  '3.3.7': 'People should not have to enter the same information twice in one session.',
  '3.3.8': 'Signing in cannot depend only on memory or a puzzle.',
  '4.1.2': 'Controls need a name and a role that assistive software can understand.',
  '4.1.3': 'Status messages, such as "saved" or "error", need to be announced.',
};

const PRINCIPLE_WHY = {
  1: 'Some visitors cannot see or hear this part of the page.',
  2: 'Some visitors cannot operate this part of the page.',
  3: 'This part of the page is harder to understand than it needs to be.',
  4: 'Assistive software, such as a screen reader, cannot understand this part of the page.',
};

const JARGON = /\b(aria|wcag|tabindex|attributes?|elements?|svg|html|roles?|viewport|landmark|ratios?|thresholds?|iframes?|meta|dom|css)\b/i;

const countWord = (n) => Number(n || 0).toLocaleString('en-US');

/** One sentence on how serious a bucket is, for the summary tiles. */
export const SEVERITY_HINT = {
  critical: 'Blocks some visitors',
  serious: 'Hard to use',
  moderate: 'Gets in the way',
  minor: 'Small snag',
};

/**
 * Short verdict for the top of a free-scan result. Reports what automated
 * checks found. It does not claim compliance or predict a lawsuit.
 */
export function verdictFor(summary = {}) {
  const critical = summary.critical || 0;
  const serious = summary.serious || 0;
  const total = summary.issues || 0;
  if (critical) return { tone: 'bad', text: `${countWord(critical)} critical ${critical === 1 ? 'issue' : 'issues'} can stop some visitors from using this page.` };
  if (serious) return { tone: 'bad', text: `${countWord(serious)} serious ${serious === 1 ? 'issue makes' : 'issues make'} this page hard to use. None are critical.` };
  if (total) return { tone: 'warn', text: `${countWord(total)} smaller ${total === 1 ? 'issue' : 'issues'} on this page. None block visitors completely.` };
  return { tone: 'good', text: 'No automatic issues on this page. A scanner cannot check everything, so this is not proof the page is fully accessible.' };
}

/** "3 on this page" */
export function countLabel(count) {
  const n = Number(count) || 0;
  return n === 1 ? '1 on this page' : `${countWord(n)} on this page`;
}

/** Visible WCAG line, plus the full list when it was shortened. */
export function wcagSummary(wcag) {
  const list = (Array.isArray(wcag) ? wcag : []).filter((c) => c && c.sc);
  if (!list.length) return { short: '', full: '' };
  const format = (c) => `${c.sc}${c.name ? ` ${c.name}` : ''}`;
  const full = `WCAG ${list.map(format).join(', ')}`;
  const short = list.length === 1 ? `WCAG ${format(list[0])}` : `WCAG ${format(list[0])} + ${list.length - 1} more`;
  return { short, full };
}

function scWhy(wcag) {
  for (const c of Array.isArray(wcag) ? wcag : []) {
    if (c && BY_SC[c.sc]) return BY_SC[c.sc];
    const principle = c && c.sc && PRINCIPLE_WHY[c.sc[0]];
    if (principle) return principle;
  }
  return '';
}

/**
 * { name, why, technical } for one issue.
 * `technical` is the checker title, kept only when it adds the jargon a
 * developer may need. Empty when the plain name already says it.
 */
export function explainIssue(issue = {}) {
  const title = String(issue.title || '').replace(/\s+/g, ' ').trim();
  const rule = title ? TITLE_RULES.find((item) => item.re.test(title)) : null;
  const why = rule?.why || scWhy(issue.wcag) || GENERIC_WHY;
  const name = rule?.name || title || 'Issue on this page';
  const technical = title && title.toLowerCase() !== name.toLowerCase() && (JARGON.test(title) || title.length > 80) ? title : '';
  return { name, why, technical };
}

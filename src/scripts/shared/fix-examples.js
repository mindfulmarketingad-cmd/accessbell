// Step-by-step fixes with correct markup for the most common issues, keyed by
// rule id (axe-core ids and the HTML audit's own ids). Plain static data.

const img = {
  steps: [
    ['Describe the purpose, not the pixels', 'Write alt text that says what the image does or shows in context, for example "Download the 2026 price list" for a linked icon.'],
    ['Mark decorative images as decorative', 'Use an empty alt="" so screen readers skip images that add nothing, such as background flourishes.'],
    ['Keep it short', 'One sentence is usually enough. Put longer descriptions of charts or diagrams in nearby text.'],
  ],
  code: `<!-- Informative image: describe its purpose -->
<img src="/team.jpg" alt="Our support team at the Denver office">

<!-- Image inside a link: describe where the link goes -->
<a href="/pricing"><img src="/icon-tag.svg" alt="Pricing"></a>

<!-- Decorative image: empty alt so it is skipped -->
<img src="/divider.svg" alt="">`,
};

const label = {
  steps: [
    ['Give every field a visible label', 'Placeholder text disappears while typing and is not a label.'],
    ['Connect the label to the field', 'Use matching for and id attributes, or wrap the field inside the label.'],
    ['Use aria-label only as a last resort', 'When a visible label is impossible, for example a search box with a visible search button.'],
  ],
  code: `<!-- Correct: label connected with for/id -->
<label for="email">Email address</label>
<input id="email" type="email" autocomplete="email">

<!-- Correct: field wrapped in its label -->
<label>
  Company name
  <input type="text" autocomplete="organization">
</label>

<!-- Acceptable when no visible label fits -->
<input type="search" aria-label="Search the site">
<button type="submit">Search</button>`,
};

const buttonName = {
  steps: [
    ['Give icon-only buttons a name', 'Add visually hidden text or an aria-label that says what the button does.'],
    ['Describe the action', 'Use "Close dialog" or "Open menu", not "Icon" or "Button".'],
    ['Hide the icon itself', 'Mark decorative SVG icons with aria-hidden="true" so they are not read twice.'],
  ],
  code: `<!-- Correct: visible text -->
<button type="submit">Save changes</button>

<!-- Correct: icon button with a hidden text label -->
<button type="button" class="menu-toggle">
  <svg aria-hidden="true" focusable="false">...</svg>
  <span class="visually-hidden">Open menu</span>
</button>

<!-- Correct: aria-label when there is no text -->
<button type="button" aria-label="Close dialog">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>`,
};

const linkName = {
  steps: [
    ['Give every link text', 'Links that only contain an icon or image need an accessible name.'],
    ['Make the text describe the destination', 'Replace vague text like "Click here" or "Read more" with the page or action it leads to.'],
    ['Keep repeated links distinct', 'If several links say "Learn more", add hidden context such as the article title.'],
  ],
  code: `<!-- Correct: descriptive link text -->
<a href="/report.pdf">Download the accessibility report (PDF)</a>

<!-- Correct: icon link with a hidden name -->
<a href="https://www.linkedin.com/company/example">
  <svg aria-hidden="true" focusable="false">...</svg>
  <span class="visually-hidden">AccessBell on LinkedIn</span>
</a>

<!-- Correct: "Read more" with context -->
<a href="/blog/wcag-2-2">
  Read more<span class="visually-hidden"> about WCAG 2.2</span>
</a>`,
};

const contrast = {
  steps: [
    ['Meet the minimum ratios', 'Body text needs 4.5:1 against its background. Large text (24px, or 19px bold) needs 3:1.'],
    ['Fix the design tokens', 'Change the color variable in one place so every component that uses it is fixed together.'],
    ['Check every state', 'Hover, focus, disabled-looking and placeholder text must also be readable.'],
  ],
  code: `/* Before: #9aa0a6 on white is 2.6:1 and fails */
.card-meta { color: #9aa0a6; }

/* After: #5b6170 on white is 6.2:1 and passes */
:root { --text-muted: #5b6170; }
.card-meta { color: var(--text-muted); }

/* Text over images: add a solid backing */
.hero-caption {
  color: #fff;
  background: rgb(0 0 0 / 0.7);
}`,
};

const lang = {
  steps: [
    ['Declare the page language', 'Add a lang attribute to the html element so screen readers use the right pronunciation.'],
    ['Mark language changes', 'Wrap phrases in another language with their own lang attribute.'],
  ],
  code: `<!doctype html>
<html lang="en">
  <head>...</head>
  <body>
    <p>Our motto is <span lang="fr">savoir-faire</span>.</p>
  </body>
</html>`,
};

const title = {
  steps: [
    ['Add a title to every page', 'The title is the first thing a screen reader announces and what appears in browser tabs.'],
    ['Make each title unique', 'Put the specific page topic first and the site name last.'],
  ],
  code: `<head>
  <title>Pricing - AccessBell</title>
</head>`,
};

const frameTitle = {
  steps: [
    ['Give each frame a unique title', 'Describe the content of the frame so users know whether to enter it.'],
    ['Match the inner document', 'Give the framed document the same <title> so the two stay consistent.'],
  ],
  code: `<!-- Correct: descriptive, unique titles -->
<iframe src="https://www.youtube.com/embed/abc123"
        title="Video: How to run your first accessibility scan"></iframe>

<iframe src="/map.html" title="Map of our Denver office"></iframe>`,
};

const headings = {
  steps: [
    ['Use one h1 per page', 'It should describe the page topic.'],
    ['Do not skip levels', 'Go from h2 to h3, not from h2 to h4. Style with CSS, not by picking a smaller heading.'],
    ['Never leave headings empty', 'Remove empty heading tags or give them text.'],
  ],
  code: `<h1>Accessibility services</h1>
  <h2>Audits</h2>
    <h3>What an audit includes</h3>
    <h3>Pricing</h3>
  <h2>Monitoring</h2>

/* Want an h2 to look smaller? Use a class, not an h4 */
.section-title-sm { font-size: 1.125rem; }`,
};

const viewport = {
  steps: [
    ['Allow pinch zoom', 'Remove maximum-scale=1 and user-scalable=no from the viewport meta tag.'],
  ],
  code: `<!-- Correct -->
<meta name="viewport" content="width=device-width, initial-scale=1">`,
};

const ariaHiddenFocus = {
  steps: [
    ['Do not hide focusable content', 'Anything inside aria-hidden="true" must not be reachable with the keyboard.'],
    ['Remove it from the tab order', 'Add tabindex="-1", disable it, or hide it with CSS (display: none) instead.'],
  ],
  code: `<!-- Correct: hidden content is not focusable -->
<div aria-hidden="true">
  <a href="/" tabindex="-1">Home</a>
</div>

<!-- Correct: hidden with CSS, so it is out of the tab order -->
<div class="offscreen-menu" hidden>
  <a href="/">Home</a>
</div>`,
};

const landmarks = {
  steps: [
    ['Wrap content in landmarks', 'Use header, nav, main and footer so screen reader users can jump between regions.'],
    ['Use exactly one main', 'The main element holds the unique content of the page.'],
    ['Add a skip link', 'Let keyboard users jump past the navigation to the main content.'],
  ],
  code: `<body>
  <a class="skip-link" href="#main">Skip to main content</a>
  <header>...</header>
  <nav aria-label="Main">...</nav>
  <main id="main">
    <h1>Page title</h1>
    ...
  </main>
  <footer>...</footer>
</body>`,
};

const lists = {
  steps: [
    ['Only put li elements directly inside ul and ol', 'Wrap other elements inside the li, not between list items.'],
  ],
  code: `<!-- Correct -->
<ul>
  <li><a href="/about">About</a></li>
  <li><a href="/contact">Contact</a></li>
</ul>`,
};

const selectName = {
  ...label,
  code: `<label for="country">Country</label>
<select id="country" autocomplete="country-name">
  <option>United States</option>
  <option>Canada</option>
</select>`,
};

const duplicateId = {
  steps: [
    ['Make every id unique', 'Labels, aria-labelledby and aria-describedby point to ids. A duplicate id breaks the connection.'],
    ['Watch repeated components', 'Generate ids per instance, for example by adding the item number.'],
  ],
  code: `<!-- Correct: each field has its own id -->
<label for="qty-1">Quantity for item 1</label>
<input id="qty-1" type="number">

<label for="qty-2">Quantity for item 2</label>
<input id="qty-2" type="number">`,
};

const tabindex = {
  steps: [
    ['Avoid positive tabindex', 'Values above 0 change the natural tab order and confuse keyboard users.'],
    ['Fix the source order instead', 'Put elements in the HTML in the order they should receive focus.'],
  ],
  code: `<!-- Correct: natural order, tabindex="0" only for custom widgets -->
<div role="button" tabindex="0">Custom control</div>

<!-- Correct: remove from tab order when needed -->
<a href="#top" tabindex="-1">Back to top</a>`,
};

const targetSize = {
  steps: [
    ['Make targets at least 24 by 24 CSS pixels', 'Or leave enough space around smaller targets that a 24px circle would not overlap another one.'],
    ['Grow the hit area, not the icon', 'Padding increases the clickable area without changing the design.'],
  ],
  code: `/* Correct: 16px icon with a 24px-plus hit area */
.icon-button {
  min-width: 24px;
  min-height: 24px;
  padding: 8px;
}

/* Correct: spacing between small inline links */
.tag-list a { margin-inline: 6px; }`,
};

const autocomplete = {
  steps: [
    ['Use valid autocomplete tokens', 'They let browsers and assistive tech fill in personal details and identify the field purpose.'],
  ],
  code: `<input id="name" type="text" autocomplete="name">
<input id="email" type="email" autocomplete="email">
<input id="tel" type="tel" autocomplete="tel">
<input id="zip" type="text" autocomplete="postal-code">`,
};

const tables = {
  steps: [
    ['Mark header cells with th', 'Use scope="col" or scope="row" so each data cell is announced with its header.'],
    ['Add a caption', 'Describe what the table contains.'],
  ],
  code: `<table>
  <caption>Opening hours</caption>
  <thead>
    <tr><th scope="col">Day</th><th scope="col">Hours</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">Monday</th><td>9am to 5pm</td></tr>
  </tbody>
</table>`,
};

const ariaAttr = {
  steps: [
    ['Use the right role and attributes', 'Each ARIA role needs its required attributes, and only valid values.'],
    ['Prefer native HTML', 'A real button, checkbox or link comes with the right semantics and keyboard support for free.'],
  ],
  code: `<!-- Best: native element -->
<input type="checkbox" id="terms">
<label for="terms">I agree to the terms</label>

<!-- If a custom widget is unavoidable, include required states -->
<div role="checkbox" aria-checked="false" tabindex="0"
     aria-labelledby="terms-label"></div>
<span id="terms-label">I agree to the terms</span>`,
};

const nested = {
  steps: [
    ['Do not put interactive elements inside each other', 'A button inside a link, or a link inside a button, cannot be operated reliably.'],
    ['Split them apart', 'Place the controls side by side, or make the whole card one link and move secondary actions outside it.'],
  ],
  code: `<!-- Correct: separate controls -->
<article class="card">
  <h3><a href="/product/1">Standing desk</a></h3>
  <button type="button">Add to cart</button>
</article>`,
};

const EXAMPLES = {
  'image-alt': img,
  'input-image-alt': img,
  'role-img-alt': img,
  'svg-img-alt': img,
  'area-alt': img,
  'object-alt': img,
  label,
  'form-label': label,
  'label-title-only': label,
  'select-name': selectName,
  'button-name': buttonName,
  'input-button-name': buttonName,
  'link-name': linkName,
  'link-purpose': linkName,
  'color-contrast': contrast,
  'color-contrast-enhanced': contrast,
  'link-in-text-block': contrast,
  'html-has-lang': lang,
  'html-lang-valid': lang,
  'html-lang': lang,
  'valid-lang': lang,
  'document-title': title,
  'frame-title': frameTitle,
  'frame-title-unique': frameTitle,
  'heading-order': headings,
  'empty-heading': headings,
  'page-has-heading-one': headings,
  'page-has-h1': headings,
  'meta-viewport': viewport,
  'meta-viewport-large': viewport,
  'aria-hidden-focus': ariaHiddenFocus,
  region: landmarks,
  'landmark-one-main': landmarks,
  bypass: landmarks,
  list: lists,
  listitem: lists,
  'duplicate-id-aria': duplicateId,
  'duplicate-id-active': duplicateId,
  tabindex,
  'target-size': targetSize,
  'autocomplete-valid': autocomplete,
  'td-headers-attr': tables,
  'th-has-data-cells': tables,
  'table-headers': tables,
  'aria-required-attr': ariaAttr,
  'aria-valid-attr-value': ariaAttr,
  'aria-valid-attr': ariaAttr,
  'aria-valid-role': ariaAttr,
  'aria-roles': ariaAttr,
  'nested-interactive': nested,
};

/** { steps: [[title, text]], code } for a rule id, or null. */
export const fixExample = (ruleId) => EXAMPLES[ruleId] || null;

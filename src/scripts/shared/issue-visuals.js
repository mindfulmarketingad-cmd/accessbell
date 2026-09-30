// A simple picture of an accessibility issue: a screenshot of the problem on
// the scanned page when the scan captured one, otherwise a small diagram of
// what the problem looks like and what a screen reader hears. The diagrams are
// fixed markup written here; nothing from a scanned page is inserted as HTML.

const INK = '#22262f';
const MUTE = '#5b6170';
const RED = '#b42318';
const LINE = '#cfd4ce';
const SAGE = '#44723f';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const txt = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-family="Inter, 'Segoe UI', Roboto, Arial, sans-serif" font-size="${o.size || 13}" font-weight="${o.weight || 400}" fill="${o.fill || INK}" text-anchor="${o.anchor || 'start'}"${o.mono ? ' font-family="Menlo, Consolas, monospace"' : ''}>${esc(s)}</text>`;
const mono = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-family="'SFMono-Regular', Menlo, Consolas, monospace" font-size="${o.size || 12}" fill="${o.fill || INK}">${esc(s)}</text>`;

/** Left: what people see. Right: what assistive technology gets. */
const frame = (screen, rightTitle, rightBody) => `
  <rect x="0.5" y="0.5" width="439" height="149" rx="10" fill="#fff" stroke="${LINE}"/>
  ${txt(14, 22, 'On screen', { size: 11, weight: 700, fill: MUTE })}
  ${screen}
  <line x1="230" y1="14" x2="230" y2="136" stroke="${LINE}"/>
  ${txt(244, 22, rightTitle, { size: 11, weight: 700, fill: MUTE })}
  <rect x="244" y="34" width="182" height="96" rx="10" fill="#fdf0ef" stroke="${RED}" stroke-opacity=".35"/>
  ${rightBody}`;

const heard = (lines) => lines.map((l, i) => txt(256, 60 + i * 20, l, { size: 13.5, weight: i === 0 ? 700 : 400, fill: i === 0 ? RED : INK })).join('');
const outline = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="none" stroke="${RED}" stroke-width="2.5" stroke-dasharray="6 4"/>`;

const VISUALS = {
  alt: {
    label: 'An image with no text alternative. A screen reader can only say “image”, or reads out the file name.',
    svg: frame(
      `<rect x="30" y="36" width="160" height="92" rx="6" fill="#e8f1e7"/><path d="M42 118 L82 74 L108 100 L128 82 L178 118 Z" fill="${SAGE}" opacity=".7"/><circle cx="160" cy="58" r="10" fill="#f0c33c"/>${outline(26, 32, 168, 100)}`,
      'Screen reader hears',
      heard(['“image”', 'or “IMG_4817.jpg”', 'Nothing about what', 'the picture shows']),
    ),
  },
  contrast: {
    label: 'Light grey text on a white background. People with low vision may not be able to read it.',
    svg: frame(
      `${txt(28, 62, 'Free shipping on', { size: 17, weight: 600, fill: '#b9bec7' })}${txt(28, 86, 'orders over $50', { size: 17, weight: 600, fill: '#b9bec7' })}${outline(22, 42, 186, 56)}${txt(28, 122, 'Example: 2.1 : 1', { size: 12, fill: MUTE })}`,
      'The problem',
      heard(['Too faint to read', 'Normal text needs', 'a 4.5 : 1 contrast', 'ratio (WCAG 1.4.3)']),
    ),
  },
  label: {
    label: 'A form field with only placeholder text and no label. A screen reader says only “edit text”.',
    svg: frame(
      `<rect x="28" y="58" width="176" height="36" rx="6" fill="#fff" stroke="${MUTE}"/>${txt(40, 81, 'Email', { size: 14, fill: '#9aa0a6' })}${outline(22, 52, 188, 48)}${txt(28, 122, 'No label, placeholder only', { size: 12, fill: MUTE })}`,
      'Screen reader hears',
      heard(['“edit text”', 'Not what to type', 'in the field']),
    ),
  },
  button: {
    label: 'An icon-only button with no accessible name. A screen reader says only “button”.',
    svg: frame(
      `<rect x="92" y="54" width="48" height="44" rx="10" fill="${INK}"/><circle cx="113" cy="73" r="9" fill="none" stroke="#fff" stroke-width="2.5"/><line x1="120" y1="80" x2="127" y2="87" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>${outline(86, 48, 60, 56)}${txt(116, 124, 'An icon, no text', { size: 12, fill: MUTE, anchor: 'middle' })}`,
      'Screen reader hears',
      heard(['“button”', 'Not what the', 'button does']),
    ),
  },
  link: {
    label: 'A link that contains only an icon, with no accessible name. A screen reader says only “link”.',
    svg: frame(
      `<circle cx="80" cy="76" r="18" fill="${SAGE}"/><rect x="72" y="68" width="16" height="16" rx="4" fill="none" stroke="#fff" stroke-width="2.5"/><circle cx="130" cy="76" r="18" fill="${SAGE}"/><path d="M122 84 L138 68 M126 68 H138 V80" fill="none" stroke="#fff" stroke-width="2.5"/>${outline(58, 54, 44, 44)}${txt(116, 124, 'Icon links, no text', { size: 12, fill: MUTE, anchor: 'middle' })}`,
      'Screen reader hears',
      heard(['“link”', 'Not where the', 'link goes']),
    ),
  },
  linkcolor: {
    label: 'A link inside a paragraph that differs from the text only by color. People who cannot see the color difference will not find it.',
    svg: frame(
      `${txt(24, 60, 'Read our', { size: 14 })}${txt(96, 60, 'returns policy', { size: 14, fill: '#2b6cb0' })}${txt(24, 80, 'before you order.', { size: 14 })}${outline(91, 44, 106, 24)}${txt(24, 118, 'Link shown by color only', { size: 12, fill: MUTE })}`,
      'Without color vision',
      `${txt(256, 64, 'Read our returns policy', { size: 12.5, fill: '#555' })}${txt(256, 84, 'before you order.', { size: 12.5, fill: '#555' })}${txt(256, 114, 'The link disappears', { size: 13.5, weight: 700, fill: RED })}`,
    ),
  },
  lang: {
    label: 'A page with no language set. Screen readers may read it with the wrong voice and pronunciation.',
    svg: frame(
      `<rect x="28" y="36" width="176" height="92" rx="6" fill="#f7f8f6" stroke="${LINE}"/>${mono(40, 60, '<html>')}${mono(40, 80, '  <body>…')}${outline(34, 46, 64, 20)}${txt(40, 114, 'No lang attribute', { size: 12, fill: MUTE })}`,
      'The problem',
      heard(['Wrong voice', 'Words may be read', 'with the wrong', 'pronunciation']),
    ),
  },
  headings: {
    label: 'Headings that skip levels, from a level 1 heading straight to level 4. Screen reader users navigate by heading and lose the structure.',
    svg: frame(
      `${txt(28, 56, 'H1  Our shop', { size: 15, weight: 700 })}${txt(52, 84, 'H4  New arrivals', { size: 13, weight: 700 })}${outline(46, 68, 124, 24)}${txt(52, 112, 'H4  Best sellers', { size: 13, weight: 700 })}`,
      'Screen reader hears',
      heard(['“heading level 4”', 'Where are levels', '2 and 3?']),
    ),
  },
  ids: {
    label: 'Two elements share the same id, so a label or ARIA reference points at the wrong one.',
    svg: frame(
      `${mono(26, 60, '<input id="email">')}${mono(26, 90, '<input id="email">')}${outline(20, 74, 176, 24)}${txt(26, 120, 'Same id used twice', { size: 12, fill: MUTE })}`,
      'Screen reader hears',
      heard(['“edit text”', 'The label attaches', 'to the other field']),
    ),
  },
  target: {
    label: 'Very small targets packed close together, which are hard to tap or click accurately.',
    svg: frame(
      `${[60, 78, 96, 114].map((x, i) => `<circle cx="${x}" cy="72" r="5" fill="${i === 1 ? INK : '#b9bec7'}"/>`).join('')}<circle cx="87" cy="72" r="20" fill="none" stroke="${RED}" stroke-width="2" stroke-dasharray="4 3"/>${txt(140, 76, 'fingertip', { size: 12, fill: RED })}${txt(28, 118, 'Targets under 24 × 24 px', { size: 12, fill: MUTE })}`,
      'The problem',
      heard(['Hard to hit', 'Easy to tap the', 'wrong one']),
    ),
  },
  frame: {
    label: 'An embedded frame with no title. A screen reader says only “frame”.',
    svg: frame(
      `<rect x="28" y="38" width="176" height="86" rx="6" fill="#f7f8f6" stroke="${MUTE}"/><polygon points="106,66 106,96 130,81" fill="${MUTE}"/>${outline(22, 32, 188, 98)}`,
      'Screen reader hears',
      heard(['“frame”', 'Not what is', 'inside it']),
    ),
  },
  list: {
    label: 'Items that look like a list but are not coded as one, so screen readers do not announce the list or its length.',
    svg: frame(
      `${['• Free returns', '• Fast delivery', '• Secure checkout'].map((s, i) => txt(32, 58 + i * 24, s, { size: 14 })).join('')}${outline(24, 40, 150, 76)}`,
      'Screen reader hears',
      heard(['Plain text', 'No “list, 3 items”', 'to set expectations']),
    ),
  },
  landmark: {
    label: 'A page with no landmark regions, such as main or navigation, so screen reader users cannot jump to the content.',
    svg: frame(
      `${[['div', 44], ['div', 72], ['div', 100]].map(([t, y]) => `<rect x="28" y="${y - 14}" width="176" height="22" rx="4" fill="#f7f8f6" stroke="${LINE}"/>${mono(38, y + 1, `<${t}>…</${t}>`)}`).join('')}${outline(22, 24, 188, 104)}`,
      'Screen reader hears',
      heard(['No landmarks', 'Cannot jump to the', 'main content']),
    ),
  },
  aria: {
    label: 'A custom control with a missing or invalid ARIA role or attribute, so assistive technology announces it wrongly or not at all.',
    svg: frame(
      `${mono(26, 64, '<div role="buton"')}${mono(26, 84, '     aria-pressed>')}${outline(20, 48, 186, 44)}${txt(26, 120, 'Misspelled or missing ARIA', { size: 12, fill: MUTE })}`,
      'Screen reader hears',
      heard(['Wrong role or state', 'The control is not', 'described properly']),
    ),
  },
  generic: {
    label: 'An element with an accessibility problem that assistive technology may misread.',
    svg: frame(
      `<rect x="28" y="42" width="176" height="66" rx="6" fill="#f7f8f6" stroke="${LINE}"/>${mono(40, 70, '<element …>')}<line x1="40" y1="78" x2="140" y2="78" stroke="${RED}" stroke-width="2" stroke-dasharray="3 3"/>${outline(22, 36, 188, 78)}`,
      'The problem',
      heard(['Assistive technology', 'may misread or skip', 'this element']),
    ),
  },
};

const FAMILY = {
  'image-alt': 'alt', 'input-image-alt': 'alt', 'role-img-alt': 'alt', 'svg-img-alt': 'alt', 'area-alt': 'alt', 'object-alt': 'alt', 'img-alt': 'alt',
  'color-contrast': 'contrast', 'color-contrast-enhanced': 'contrast', 'low-contrast': 'contrast',
  label: 'label', 'select-name': 'label', 'form-label': 'label', 'label-title-only': 'label', 'aria-input-field-name': 'label', 'aria-toggle-field-name': 'label',
  'button-name': 'button', 'input-button-name': 'button', 'aria-command-name': 'button', 'empty-button': 'button',
  'link-name': 'link', 'empty-link': 'link', 'link-purpose': 'link',
  'link-in-text-block': 'linkcolor',
  'html-has-lang': 'lang', 'html-lang-valid': 'lang', 'valid-lang': 'lang', 'html-lang': 'lang', 'html-xml-lang-mismatch': 'lang',
  'heading-order': 'headings', 'empty-heading': 'headings', 'page-has-heading-one': 'headings', 'page-has-h1': 'headings',
  'duplicate-id': 'ids', 'duplicate-id-aria': 'ids', 'duplicate-id-active': 'ids',
  'target-size': 'target',
  'frame-title': 'frame', 'frame-title-unique': 'frame',
  list: 'list', listitem: 'list', dlitem: 'list', 'definition-list': 'list',
  region: 'landmark', 'landmark-one-main': 'landmark', bypass: 'landmark',
};

export const familyOf = (ruleId) => {
  if (FAMILY[ruleId]) return FAMILY[ruleId];
  if (/^aria-/.test(ruleId || '')) return 'aria';
  return 'generic';
};

const isShot = (s) => typeof s === 'string' && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(s);

/**
 * A <figure> for an issue. `issue` needs id and, optionally, shot (a JPEG
 * data URL). `where` names the page the screenshot came from, if known.
 */
export function issueVisual(issue, { where } = {}) {
  const fig = document.createElement('figure');
  fig.className = 'issue-visual';
  const cap = document.createElement('figcaption');
  if (isShot(issue.shot)) {
    const img = document.createElement('img');
    img.src = issue.shot;
    img.alt = `Screenshot of ${where || 'your page'} with the first failing element outlined in red.`;
    img.loading = 'lazy';
    img.decoding = 'async';
    fig.classList.add('issue-visual-shot');
    fig.append(img);
    cap.textContent = `On your page${where ? `, ${where}` : ''}: the first failing element is outlined in red.`;
  } else {
    const v = VISUALS[familyOf(issue.id)];
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 440 150');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', v.label);
    svg.innerHTML = v.svg;
    fig.append(svg);
    cap.textContent = 'An example of this problem. The failing code from your page is shown below.';
  }
  fig.append(cap);
  return fig;
}

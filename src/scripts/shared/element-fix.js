// Corrected markup for one failed element, so people can fix it in their own
// code without AccessBellFix. Each fixable rule adds or replaces one attribute
// on the element's opening tag (or adds a label before a form field), using
// the text the person types. Other rules return null and show instructions.

const attrEscape = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Set an attribute on the first tag in `html`, replacing it if present. */
export function setAttr(html, name, value) {
  const m = /^(\s*<[a-zA-Z][\w:-]*)([^>]*?)(\s*\/?>)/.exec(html);
  if (!m) return null;
  const [whole, open, attrs, close] = m;
  const re = new RegExp(`(\\s${name}\\s*=\\s*)("[^"]*"|'[^']*'|[^\\s>]+)`, 'i');
  const bare = new RegExp(`\\s${name}(?=[\\s/>]|$)`, 'i');
  const next = re.test(attrs)
    ? attrs.replace(re, ` ${name}="${attrEscape(value)}"`)
    : bare.test(attrs)
      ? attrs.replace(bare, ` ${name}="${attrEscape(value)}"`)
      : `${attrs} ${name}="${attrEscape(value)}"`;
  return open + next + close + html.slice(whole.length);
}

const idOf = (html) => /\sid\s*=\s*["']?([^"'\s>]+)/i.exec(html)?.[1] || null;

// rule id -> how to fix one element: the attribute, what to ask for and an example.
export const ELEMENT_FIXES = {
  'image-alt': { attr: 'alt', ask: 'Describe the image', hint: 'What the image shows or does. Leave it empty only if it is decorative.' },
  'input-image-alt': { attr: 'alt', ask: 'Describe what the button does', hint: 'For example: Search, or Submit order.' },
  'area-alt': { attr: 'alt', ask: 'Describe where the link goes', hint: 'For example: Contact page.' },
  'role-img-alt': { attr: 'aria-label', ask: 'Describe the image', hint: 'What the graphic shows.' },
  'svg-img-alt': { attr: 'aria-label', ask: 'Describe the graphic', hint: 'What the SVG shows.' },
  'button-name': { attr: 'aria-label', ask: 'Name the button', hint: 'What it does, for example: Open menu.' },
  'input-button-name': { attr: 'value', ask: 'Button text', hint: 'For example: Subscribe.' },
  'link-name': { attr: 'aria-label', ask: 'Name the link', hint: 'Where it goes, for example: Instagram (opens in a new tab).' },
  'aria-command-name': { attr: 'aria-label', ask: 'Name the control', hint: 'What it does.' },
  'aria-toggle-field-name': { attr: 'aria-label', ask: 'Name the control', hint: 'What it turns on or off.' },
  'aria-input-field-name': { attr: 'aria-label', ask: 'Name the field', hint: 'What to enter.' },
  'aria-meter-name': { attr: 'aria-label', ask: 'Name the meter', hint: 'What it measures.' },
  'aria-progressbar-name': { attr: 'aria-label', ask: 'Name the progress bar', hint: 'What is loading.' },
  'aria-tooltip-name': { attr: 'aria-label', ask: 'Tooltip text', hint: 'The text the tooltip shows.' },
  'aria-dialog-name': { attr: 'aria-label', ask: 'Name the dialog', hint: 'Its purpose, for example: Newsletter sign-up.' },
  'select-name': { label: true, ask: 'Label the menu', hint: 'For example: Country.' },
  label: { label: true, ask: 'Label the field', hint: 'For example: Email address.' },
  'frame-title': { attr: 'title', ask: 'Title the frame', hint: 'What it contains, for example: Store location map.' },
  'object-alt': { attr: 'aria-label', ask: 'Describe the object', hint: 'What it shows.' },
  'summary-name': { attr: 'aria-label', ask: 'Name the summary', hint: 'What the section contains.' },
  'html-has-lang': { attr: 'lang', ask: 'Page language code', hint: 'For example: en or en-US.' },
  'html-lang-valid': { attr: 'lang', ask: 'Page language code', hint: 'For example: en or en-US.' },
  'valid-lang': { attr: 'lang', ask: 'Language code', hint: 'For example: es for Spanish.' },
};

export const canFixInCode = (ruleId) => Boolean(ELEMENT_FIXES[ruleId]);

/** Corrected markup for one element, or null when the rule cannot be fixed this way. */
export function correctedHtml(ruleId, html, value) {
  const f = ELEMENT_FIXES[ruleId];
  if (!f || !html) return null;
  const text = String(value || '').trim();
  const placeholder = text || f.ask;
  if (f.label) {
    const id = idOf(html);
    if (id) return `<label for="${attrEscape(id)}">${attrEscape(placeholder)}</label>\n${html}`;
    const fieldId = 'field-' + Math.abs([...html].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)).toString(36).slice(0, 6);
    const withId = setAttr(html, 'id', fieldId);
    return withId ? `<label for="${fieldId}">${attrEscape(placeholder)}</label>\n${withId}` : null;
  }
  // The page's <html> tag is not captured as a snippet: show the corrected tag itself.
  const source = /^\s*<html[\s>]/i.test(html) ? html.replace(/>[\s\S]*$/, '>') : html;
  return setAttr(source, f.attr, placeholder);
}

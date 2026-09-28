// Static WCAG checks over parsed HTML.
//
// These rules inspect markup only. Checks that need a rendered page
// (color contrast, focus visibility, reflow) are out of scope for the free
// single-page scan and are reported as a note instead of a pass.
import { parse } from 'parse5';
import { criterion } from './wcag-criteria.js';

export const STANDARDS = {
  wcag22: { id: 'wcag22', label: 'WCAG 2.2 Level AA' },
  wcag21: { id: 'wcag21', label: 'WCAG 2.1 Level AA' },
  ada: { id: 'ada', label: 'ADA (WCAG 2.1 AA benchmark)' },
  section508: { id: 'section508', label: 'Section 508 (WCAG 2.0 AA)' },
  en301549: { id: 'en301549', label: 'EN 301 549 (WCAG 2.1 AA)' },
};

const SC = {
  '1.1.1': { sc: '1.1.1', name: 'Non-text Content', level: 'A' },
  '1.3.1': { sc: '1.3.1', name: 'Info and Relationships', level: 'A' },
  '1.4.2': { sc: '1.4.2', name: 'Audio Control', level: 'A' },
  '1.4.4': { sc: '1.4.4', name: 'Resize Text', level: 'AA' },
  '2.2.1': { sc: '2.2.1', name: 'Timing Adjustable', level: 'A' },
  '2.2.2': { sc: '2.2.2', name: 'Pause, Stop, Hide', level: 'A' },
  '2.4.1': { sc: '2.4.1', name: 'Bypass Blocks', level: 'A' },
  '2.4.2': { sc: '2.4.2', name: 'Page Titled', level: 'A' },
  '2.4.3': { sc: '2.4.3', name: 'Focus Order', level: 'A' },
  '2.4.4': { sc: '2.4.4', name: 'Link Purpose (In Context)', level: 'A' },
  '2.4.6': { sc: '2.4.6', name: 'Headings and Labels', level: 'AA' },
  '3.1.1': { sc: '3.1.1', name: 'Language of Page', level: 'A' },
  '4.1.2': { sc: '4.1.2', name: 'Name, Role, Value', level: 'A' },
};

const IMPACT_WEIGHT = { critical: 10, serious: 7, moderate: 4, minor: 2 };
const IMPACT_ORDER = { critical: 0, serious: 1, moderate: 2, minor: 3 };
const MAX_SAMPLES = 3;

const VALID_ROLES = new Set(
  (
    'alert alertdialog application article banner blockquote button caption cell checkbox code columnheader combobox ' +
    'comment complementary contentinfo definition deletion dialog directory document emphasis feed figure form generic ' +
    'grid gridcell group heading img image insertion link list listbox listitem log main mark marquee math menu menubar ' +
    'menuitem menuitemcheckbox menuitemradio meter navigation none note option paragraph presentation progressbar radio ' +
    'radiogroup region row rowgroup rowheader scrollbar search searchbox separator slider spinbutton status strong ' +
    'subscript suggestion superscript switch tab table tablist tabpanel term textbox time timer toolbar tooltip tree ' +
    'treegrid treeitem doc-abstract doc-acknowledgments doc-afterword doc-appendix doc-backlink doc-biblioentry ' +
    'doc-bibliography doc-biblioref doc-chapter doc-colophon doc-conclusion doc-cover doc-credit doc-credits doc-dedication ' +
    'doc-endnote doc-endnotes doc-epigraph doc-epilogue doc-errata doc-example doc-footnote doc-foreword doc-glossary ' +
    'doc-glossref doc-index doc-introduction doc-noteref doc-notice doc-pagebreak doc-pagelist doc-part doc-preface ' +
    'doc-prologue doc-pullquote doc-qna doc-subtitle doc-tip doc-toc graphics-document graphics-object graphics-symbol'
  ).split(' '),
);

const GENERIC_LINK_TEXT = new Set([
  'click here', 'here', 'click', 'more', 'read more', 'learn more', 'more info', 'more information', 'details',
  'link', 'this link', 'go', 'continue', 'this', 'view more', 'see more', 'find out more',
]);

// ---------- DOM helpers ----------

const attr = (node, name) => {
  if (!node.attrs) return null;
  for (const a of node.attrs) if (a.name === name) return a.value;
  return null;
};
const hasAttr = (node, name) => attr(node, name) !== null;
const isElement = (node) => typeof node.tagName === 'string';
const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

function walk(node, visit, hiddenAncestor = false) {
  for (const child of node.childNodes || []) {
    if (!isElement(child)) continue;
    const tag = child.tagName;
    if (tag === 'template' || tag === 'script' || tag === 'style' || tag === 'noscript') continue;
    const hidden =
      hiddenAncestor ||
      hasAttr(child, 'hidden') ||
      attr(child, 'aria-hidden') === 'true' ||
      /display\s*:\s*none|visibility\s*:\s*hidden/i.test(attr(child, 'style') || '');
    visit(child, hidden);
    walk(child, visit, hidden);
  }
}

/** Approximate name-from-content, per the accessible name computation. */
function textContent(node) {
  let out = '';
  for (const child of node.childNodes || []) {
    if (child.nodeName === '#text') {
      out += child.value;
      continue;
    }
    if (!isElement(child)) continue;
    const tag = child.tagName;
    if (tag === 'script' || tag === 'style' || tag === 'template') continue;
    if (attr(child, 'aria-hidden') === 'true' || hasAttr(child, 'hidden')) continue;
    const label = norm(attr(child, 'aria-label'));
    if (label) {
      out += ' ' + label + ' ';
      continue;
    }
    if (tag === 'img' || (tag === 'input' && attr(child, 'type') === 'image')) {
      out += ' ' + (attr(child, 'alt') || '') + ' ';
      continue;
    }
    if (tag === 'svg') {
      const title = (child.childNodes || []).find((c) => c.tagName === 'title');
      if (title) out += ' ' + textContent(title) + ' ';
      continue;
    }
    out += ' ' + textContent(child) + ' ';
  }
  return norm(out);
}

function snippet(node) {
  const attrs = (node.attrs || [])
    .filter((a) => a.name !== 'style')
    .slice(0, 8)
    .map((a) => {
      const v = a.value.length > 60 ? a.value.slice(0, 57) + '...' : a.value;
      return v === '' ? a.name : `${a.name}="${v}"`;
    });
  let s = `<${node.tagName}${attrs.length ? ' ' + attrs.join(' ') : ''}>`;
  const text = textContent(node);
  if (text && !['img', 'input', 'meta', 'html', 'iframe', 'select', 'textarea', 'video', 'audio'].includes(node.tagName)) {
    s += text.length > 50 ? text.slice(0, 47) + '...' : text;
  }
  return s.length > 220 ? s.slice(0, 217) + '...' : s;
}

// ---------- Page model ----------

function buildContext(html) {
  const doc = parse(html, { scriptingEnabled: true });
  const ctx = {
    doc,
    html: null,
    head: null,
    body: null,
    visible: [], // visible elements in document order
    all: [], // every element, including hidden
    ids: new Map(), // id -> [elements]
    labelsFor: new Map(), // id -> label text
  };
  walk(doc, (el, hidden) => {
    ctx.all.push(el);
    if (!hidden) ctx.visible.push(el);
    if (el.tagName === 'html') ctx.html = el;
    if (el.tagName === 'head') ctx.head = el;
    if (el.tagName === 'body') ctx.body = el;
    const id = attr(el, 'id');
    if (id) {
      if (!ctx.ids.has(id)) ctx.ids.set(id, []);
      ctx.ids.get(id).push(el);
    }
    if (el.tagName === 'label') {
      const f = attr(el, 'for');
      if (f) ctx.labelsFor.set(f, norm((ctx.labelsFor.get(f) || '') + ' ' + textContent(el)));
    }
  });
  return ctx;
}

function labelledByText(ctx, el) {
  const ref = attr(el, 'aria-labelledby');
  if (!ref) return '';
  return norm(
    ref
      .split(/\s+/)
      .map((id) => {
        const target = ctx.ids.get(id);
        return target ? textContent(target[0]) : '';
      })
      .join(' '),
  );
}

function ancestorLabel(el) {
  for (let p = el.parentNode; p && p.tagName; p = p.parentNode) {
    if (p.tagName === 'label') return textContent(p);
  }
  return '';
}

/** Accessible name for form controls (placeholder deliberately excluded). */
function controlName(ctx, el) {
  const id = attr(el, 'id');
  return (
    labelledByText(ctx, el) ||
    norm(attr(el, 'aria-label')) ||
    (id && ctx.labelsFor.get(id)) ||
    ancestorLabel(el) ||
    norm(attr(el, 'title'))
  );
}

/** Accessible name for links and buttons. */
function contentName(ctx, el) {
  return labelledByText(ctx, el) || norm(attr(el, 'aria-label')) || textContent(el) || norm(attr(el, 'title'));
}

// ---------- Rules ----------
// run(ctx) returns { applicable: number, failures: Node[] }

const RULES = [
  {
    id: 'html-lang',
    title: 'Page language is set',
    failTitle: 'Page language is missing',
    wcag: ['3.1.1'],
    impact: 'serious',
    description: 'Screen readers use the page language to choose the correct pronunciation. Without it, content may be read in the wrong accent or language.',
    fix: 'Add a valid lang attribute to the html element, for example <html lang="en">.',
    run(ctx) {
      const el = ctx.html;
      if (!el) return { applicable: 1, failures: [] };
      const lang = norm(attr(el, 'lang') || attr(el, 'xml:lang'));
      return { applicable: 1, failures: /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i.test(lang) ? [] : [el] };
    },
  },
  {
    id: 'document-title',
    title: 'Page has a title',
    failTitle: 'Page title is missing or empty',
    wcag: ['2.4.2'],
    impact: 'serious',
    description: 'The page title is the first thing screen reader users hear and is how every user identifies the page in tabs, bookmarks and search results.',
    fix: 'Add a unique, descriptive <title> element inside <head> that explains the page topic.',
    run(ctx) {
      const title = ctx.all.find((e) => e.tagName === 'title');
      return { applicable: 1, failures: title && textContent(title) ? [] : [title || ctx.head || ctx.html].filter(Boolean) };
    },
  },
  {
    id: 'image-alt',
    title: 'Images have alternative text',
    failTitle: 'Images are missing alternative text',
    wcag: ['1.1.1'],
    impact: 'critical',
    description: 'Images without an alt attribute are announced by file name, or not at all, so screen reader users miss the information they convey.',
    fix: 'Add an alt attribute that describes the purpose of each image. Use alt="" for purely decorative images.',
    run(ctx) {
      const imgs = ctx.visible.filter(
        (e) =>
          (e.tagName === 'img' || (e.tagName === 'input' && (attr(e, 'type') || '').toLowerCase() === 'image') || (e.tagName === 'area' && hasAttr(e, 'href'))) &&
          !['presentation', 'none'].includes(attr(e, 'role')),
      );
      const failures = imgs.filter((e) => !hasAttr(e, 'alt') && !norm(attr(e, 'aria-label')) && !labelledByText(ctx, e) && !norm(attr(e, 'title')));
      return { applicable: imgs.length, failures };
    },
  },
  {
    id: 'svg-img-alt',
    title: 'SVG images have accessible names',
    failTitle: 'SVG images with role="img" have no accessible name',
    wcag: ['1.1.1'],
    impact: 'serious',
    description: 'An SVG marked as an image needs a text alternative, otherwise assistive technology announces it as an unlabeled graphic.',
    fix: 'Add aria-label, aria-labelledby or a <title> child element to each SVG with role="img".',
    run(ctx) {
      const svgs = ctx.visible.filter((e) => e.tagName === 'svg' && attr(e, 'role') === 'img');
      const failures = svgs.filter((e) => {
        const title = (e.childNodes || []).find((c) => c.tagName === 'title');
        return !norm(attr(e, 'aria-label')) && !labelledByText(ctx, e) && !(title && textContent(title));
      });
      return { applicable: svgs.length, failures };
    },
  },
  {
    id: 'form-label',
    title: 'Form fields have labels',
    failTitle: 'Form fields have no label',
    wcag: ['1.3.1', '4.1.2'],
    impact: 'critical',
    description: 'Unlabeled fields are announced only as "edit text" or "combo box", so users cannot tell what to enter. Placeholder text is not a substitute for a label.',
    fix: 'Associate a visible <label for="..."> with each field, or wrap the field in a label. Use aria-label only when a visible label is not possible.',
    run(ctx) {
      const skip = new Set(['hidden', 'submit', 'reset', 'button', 'image']);
      const fields = ctx.visible.filter(
        (e) =>
          (e.tagName === 'input' && !skip.has((attr(e, 'type') || 'text').toLowerCase())) || e.tagName === 'select' || e.tagName === 'textarea',
      );
      const failures = fields.filter((e) => !controlName(ctx, e));
      return { applicable: fields.length, failures };
    },
  },
  {
    id: 'button-name',
    title: 'Buttons have accessible names',
    failTitle: 'Buttons have no accessible name',
    wcag: ['4.1.2'],
    impact: 'critical',
    description: 'Buttons without a name, often icon-only buttons, are announced as just "button", so users cannot tell what they do.',
    fix: 'Give every button visible text, or add an aria-label that describes its action, such as aria-label="Close menu".',
    run(ctx) {
      const buttons = ctx.visible.filter(
        (e) =>
          e.tagName === 'button' ||
          (attr(e, 'role') === 'button' && e.tagName !== 'input') ||
          (e.tagName === 'input' && ['submit', 'reset', 'button'].includes((attr(e, 'type') || '').toLowerCase())),
      );
      const failures = buttons.filter((e) => {
        if (e.tagName === 'input') {
          const type = (attr(e, 'type') || '').toLowerCase();
          // submit and reset have browser default names when value is absent
          if (type !== 'button' && attr(e, 'value') === null) return false;
          return !norm(attr(e, 'value')) && !norm(attr(e, 'aria-label')) && !labelledByText(ctx, e) && !norm(attr(e, 'title'));
        }
        return !contentName(ctx, e);
      });
      return { applicable: buttons.length, failures };
    },
  },
  {
    id: 'link-name',
    title: 'Links have accessible names',
    failTitle: 'Links have no accessible name',
    wcag: ['2.4.4', '4.1.2'],
    impact: 'serious',
    description: 'Links with no text, such as image links without alt text or icon-only links, are announced as the raw URL or just "link".',
    fix: 'Add link text, alt text to the linked image, or an aria-label that describes the destination.',
    run(ctx) {
      const links = ctx.visible.filter((e) => (e.tagName === 'a' && hasAttr(e, 'href')) || attr(e, 'role') === 'link');
      const failures = links.filter((e) => !contentName(ctx, e));
      return { applicable: links.length, failures };
    },
  },
  {
    id: 'link-purpose',
    title: 'Link text is descriptive',
    failTitle: 'Links use vague text such as "click here" or "read more"',
    wcag: ['2.4.4'],
    impact: 'minor',
    description: 'Screen reader users often navigate by a list of links. Vague link text gives no clue about the destination when read out of context.',
    fix: 'Rewrite link text to describe the destination, for example "Read the WCAG 2.2 checklist", or add visually hidden context.',
    run(ctx) {
      const links = ctx.visible.filter((e) => e.tagName === 'a' && hasAttr(e, 'href'));
      const failures = links.filter((e) => {
        if (norm(attr(e, 'aria-label')) || labelledByText(ctx, e)) return false;
        return GENERIC_LINK_TEXT.has(textContent(e).toLowerCase().replace(/[.:!>→»]+$/g, '').trim());
      });
      return { applicable: links.length, failures };
    },
  },
  {
    id: 'empty-heading',
    title: 'Headings contain text',
    failTitle: 'Headings are empty',
    wcag: ['1.3.1', '2.4.6'],
    impact: 'moderate',
    description: 'Empty headings appear in the screen reader heading list with no text, which is confusing when navigating by headings.',
    fix: 'Add meaningful text to each heading, or remove heading elements used only for spacing.',
    run(ctx) {
      const headings = ctx.visible.filter((e) => /^h[1-6]$/.test(e.tagName) || attr(e, 'role') === 'heading');
      return { applicable: headings.length, failures: headings.filter((e) => !contentName(ctx, e)) };
    },
  },
  {
    id: 'page-has-h1',
    title: 'Page has a main heading',
    failTitle: 'Page has no level-one heading',
    wcag: ['1.3.1', '2.4.6'],
    impact: 'moderate',
    description: 'A single h1 tells users what the page is about and gives screen reader users a reliable place to jump to the main content.',
    fix: 'Add one h1 element that describes the main purpose of the page.',
    run(ctx) {
      if (!ctx.body) return { applicable: 0, failures: [] };
      const h1 = ctx.visible.some((e) => e.tagName === 'h1' || (attr(e, 'role') === 'heading' && attr(e, 'aria-level') === '1'));
      return { applicable: 1, failures: h1 ? [] : [ctx.body] };
    },
  },
  {
    id: 'heading-order',
    title: 'Heading levels are sequential',
    failTitle: 'Heading levels are skipped',
    wcag: ['1.3.1'],
    impact: 'moderate',
    description: 'Jumping from an h2 to an h4 suggests missing structure and makes the outline harder to follow for screen reader users.',
    fix: 'Use heading levels in order. Change the heading level to match the structure and style it with CSS instead.',
    run(ctx) {
      const headings = ctx.visible.filter((e) => /^h[1-6]$/.test(e.tagName));
      const failures = [];
      let prev = 0;
      for (const h of headings) {
        const level = Number(h.tagName[1]);
        if (prev && level > prev + 1) failures.push(h);
        prev = level;
      }
      return { applicable: Math.max(0, headings.length - 1), failures };
    },
  },
  {
    id: 'meta-viewport',
    title: 'Zooming is allowed',
    failTitle: 'Zooming and scaling are disabled',
    wcag: ['1.4.4'],
    impact: 'critical',
    description: 'Setting user-scalable=no or a low maximum-scale stops people with low vision from zooming in on mobile devices.',
    fix: 'Remove user-scalable=no and any maximum-scale below 2 from the viewport meta tag, for example content="width=device-width, initial-scale=1".',
    run(ctx) {
      const metas = ctx.all.filter((e) => e.tagName === 'meta' && (attr(e, 'name') || '').toLowerCase() === 'viewport');
      const failures = metas.filter((e) => {
        const content = (attr(e, 'content') || '').toLowerCase().replace(/\s/g, '');
        if (/user-scalable=(no|0)(,|;|$)/.test(content)) return true;
        const m = /maximum-scale=([\d.]+)/.exec(content);
        return m ? parseFloat(m[1]) < 2 : false;
      });
      return { applicable: metas.length, failures };
    },
  },
  {
    id: 'frame-title',
    title: 'Frames have titles',
    failTitle: 'Frames and iframes have no title',
    wcag: ['4.1.2'],
    impact: 'serious',
    description: 'Screen readers announce the frame title so users can decide whether to enter it. Untitled frames are announced as just "frame".',
    fix: 'Add a title attribute that describes the frame content, for example title="Store location map".',
    run(ctx) {
      const frames = ctx.visible.filter((e) => e.tagName === 'iframe' || e.tagName === 'frame');
      const failures = frames.filter((e) => !norm(attr(e, 'title')) && !norm(attr(e, 'aria-label')) && !labelledByText(ctx, e));
      return { applicable: frames.length, failures };
    },
  },
  {
    id: 'duplicate-id-aria',
    title: 'IDs used for labels are unique',
    failTitle: 'IDs referenced by labels or ARIA are duplicated',
    wcag: ['4.1.2'],
    impact: 'serious',
    description: 'When a label or aria-labelledby points to an ID that exists more than once, assistive technology may announce the wrong text.',
    fix: 'Make every ID unique on the page, especially IDs referenced by for, aria-labelledby, aria-describedby or aria-controls.',
    run(ctx) {
      const referenced = new Set();
      for (const e of ctx.all) {
        for (const name of ['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns', 'aria-activedescendant']) {
          const v = attr(e, name);
          if (v) v.split(/\s+/).forEach((id) => id && referenced.add(id));
        }
        if (e.tagName === 'label' && attr(e, 'for')) referenced.add(attr(e, 'for'));
      }
      const failures = [];
      for (const id of referenced) {
        const els = ctx.ids.get(id);
        if (els && els.length > 1) failures.push(els[1]);
      }
      return { applicable: referenced.size, failures };
    },
  },
  {
    id: 'tabindex',
    title: 'No positive tabindex values',
    failTitle: 'Elements use a positive tabindex',
    wcag: ['2.4.3'],
    impact: 'serious',
    description: 'A tabindex greater than 0 overrides the natural keyboard order, so focus jumps around the page unpredictably.',
    fix: 'Use tabindex="0" to make an element focusable in document order, or restructure the HTML so the order is correct.',
    run(ctx) {
      const withTab = ctx.visible.filter((e) => hasAttr(e, 'tabindex'));
      return { applicable: withTab.length, failures: withTab.filter((e) => parseInt(attr(e, 'tabindex'), 10) > 0) };
    },
  },
  {
    id: 'meta-refresh',
    title: 'No timed page refresh',
    failTitle: 'Page refreshes or redirects on a timer',
    wcag: ['2.2.1'],
    impact: 'critical',
    description: 'Automatic refreshes and timed redirects can move users away before they finish reading or interacting.',
    fix: 'Remove the meta refresh. Use a server-side redirect instead, or give users control over updates.',
    run(ctx) {
      const metas = ctx.all.filter((e) => e.tagName === 'meta' && (attr(e, 'http-equiv') || '').toLowerCase() === 'refresh');
      const failures = metas.filter((e) => {
        const delay = parseFloat((attr(e, 'content') || '').split(/[;,]/)[0]);
        return Number.isFinite(delay) && delay > 0 && delay < 72000;
      });
      return { applicable: metas.length, failures };
    },
  },
  {
    id: 'media-autoplay',
    title: 'Media does not autoplay with sound',
    failTitle: 'Audio or video plays automatically with sound',
    wcag: ['1.4.2'],
    impact: 'moderate',
    description: 'Sound that starts automatically interferes with screen reader speech and can be disorienting.',
    fix: 'Remove autoplay, or add the muted attribute and provide visible controls to pause or stop the media.',
    run(ctx) {
      const media = ctx.visible.filter((e) => e.tagName === 'video' || e.tagName === 'audio');
      return { applicable: media.length, failures: media.filter((e) => hasAttr(e, 'autoplay') && !hasAttr(e, 'muted')) };
    },
  },
  {
    id: 'bypass',
    title: 'Page has a way to skip repeated content',
    failTitle: 'No main landmark or skip link',
    wcag: ['2.4.1'],
    impact: 'moderate',
    description: 'Keyboard and screen reader users need a quick way past navigation to the main content, such as a main landmark or a skip link.',
    fix: 'Wrap the primary content in a <main> element and add a "Skip to main content" link as the first focusable element.',
    run(ctx) {
      if (!ctx.body) return { applicable: 0, failures: [] };
      const hasMain = ctx.all.some((e) => e.tagName === 'main' || attr(e, 'role') === 'main');
      const firstLinks = ctx.visible.filter((e) => e.tagName === 'a' && hasAttr(e, 'href')).slice(0, 5);
      const hasSkip = firstLinks.some((e) => /^#./.test(attr(e, 'href')));
      return { applicable: 1, failures: hasMain || hasSkip ? [] : [ctx.body] };
    },
  },
  {
    id: 'aria-hidden-body',
    title: 'Page content is exposed to assistive technology',
    failTitle: 'The whole page is hidden from assistive technology',
    wcag: ['4.1.2'],
    impact: 'critical',
    description: 'aria-hidden="true" on the body element hides the entire page from screen readers.',
    fix: 'Remove aria-hidden from the body element. Hide only specific decorative elements.',
    run(ctx) {
      if (!ctx.body) return { applicable: 0, failures: [] };
      return { applicable: 1, failures: attr(ctx.body, 'aria-hidden') === 'true' ? [ctx.body] : [] };
    },
  },
  {
    id: 'aria-valid-role',
    title: 'ARIA roles are valid',
    failTitle: 'Elements use invalid ARIA roles',
    wcag: ['4.1.2'],
    impact: 'serious',
    description: 'An unrecognized role value means assistive technology cannot tell users what kind of element they are on.',
    fix: 'Use a valid WAI-ARIA role, or better, a native HTML element such as <button> or <nav>.',
    run(ctx) {
      const withRole = ctx.visible.filter((e) => norm(attr(e, 'role')));
      const failures = withRole.filter((e) => {
        // The first recognized token is used; fail only if none are valid.
        return !norm(attr(e, 'role')).toLowerCase().split(' ').some((r) => VALID_ROLES.has(r));
      });
      return { applicable: withRole.length, failures };
    },
  },
  {
    id: 'blink-marquee',
    title: 'No blinking or scrolling text elements',
    failTitle: 'Blinking or scrolling text is used',
    wcag: ['2.2.2'],
    impact: 'serious',
    description: 'The obsolete <marquee> and <blink> elements move content that users cannot pause, which is a barrier for people with attention or vision impairments.',
    fix: 'Remove <marquee> and <blink>. If motion is needed, provide a control to pause it.',
    run(ctx) {
      const els = ctx.visible.filter((e) => e.tagName === 'marquee' || e.tagName === 'blink');
      return { applicable: els.length, failures: els };
    },
  },
  {
    id: 'table-headers',
    title: 'Data tables have header cells',
    failTitle: 'Data tables have no header cells',
    wcag: ['1.3.1'],
    impact: 'minor',
    description: 'Without th elements, screen readers cannot announce which column or row a data cell belongs to.',
    fix: 'Mark header cells with <th scope="col"> or <th scope="row">. If the table is only for layout, add role="presentation".',
    run(ctx) {
      const tables = ctx.visible.filter((e) => e.tagName === 'table' && !['presentation', 'none'].includes(attr(e, 'role')));
      const failures = tables.filter((t) => {
        let rows = 0;
        let th = false;
        const scan = (n) => {
          for (const c of n.childNodes || []) {
            if (!isElement(c) || c.tagName === 'table') continue;
            if (c.tagName === 'tr') rows++;
            if (c.tagName === 'th' || attr(c, 'role') === 'columnheader' || attr(c, 'role') === 'rowheader') th = true;
            scan(c);
          }
        };
        scan(t);
        return rows > 1 && !th;
      });
      return { applicable: tables.length, failures };
    },
  },
];

// ---------- Runner ----------

export function scoreFrom(issues) {
  let penalty = 0;
  for (const i of issues) penalty += IMPACT_WEIGHT[i.impact] * (1 + Math.min(Math.log2(i.count), 2) * 0.5);
  return Math.max(0, Math.min(100, Math.round(100 - penalty)));
}

export function audit(html, { standard = 'wcag22' } = {}) {
  const std = STANDARDS[standard] || STANDARDS.wcag22;
  const ctx = buildContext(html);
  const issues = [];
  const passes = [];

  for (const rule of RULES) {
    const { applicable, failures } = rule.run(ctx);
    const wcag = rule.wcag.map((k) => ({ ...SC[k], ...criterion(k) }));
    if (failures.length) {
      issues.push({
        id: rule.id,
        title: rule.failTitle,
        description: rule.description,
        fix: rule.fix,
        impact: rule.impact,
        wcag,
        count: failures.length,
        samples: failures.slice(0, MAX_SAMPLES).map(snippet),
      });
    } else if (applicable > 0) {
      passes.push({ id: rule.id, title: rule.title, wcag });
    }
  }

  issues.sort((a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact] || b.count - a.count);

  const summary = { critical: 0, serious: 0, moderate: 0, minor: 0, issues: 0, rulesFailed: issues.length, rulesPassed: passes.length };
  for (const i of issues) {
    summary[i.impact] += i.count;
    summary.issues += i.count;
  }

  const notes = [
    'Color contrast (1.4.3), keyboard operation (2.1.1), focus visibility (2.4.7) and reflow (1.4.10) require a rendered page and are covered by full-site monitoring on the Lite plan.',
  ];
  if (standard === 'section508') {
    notes.push('Section 508 incorporates WCAG 2.0 Level AA. Every check in this report applies to WCAG 2.0.');
  }

  return { standard: std, score: scoreFrom(issues), summary, issues, passes, notes };
}

export const RULE_IDS = RULES.map((r) => r.id);

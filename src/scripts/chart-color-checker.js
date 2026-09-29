// Chart and infographic color checker. Runs entirely in the browser; nothing
// is sent anywhere. Color math is shared with the contrast checker.
import { parseHex, toHex, contrast, simulate, deltaE, suggestShade, VISION } from './shared/color.js';
import { ICONS } from '../lib/icons.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
function icon(name) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  for (const [k, v] of Object.entries({ viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false' })) svg.setAttribute(k, v);
  svg.innerHTML = ICONS[name];
  return svg;
}

const MIN_COLORS = 2;
const MAX_COLORS = 8;
const TARGET = 3; // WCAG 1.4.11 Non-text Contrast
const CONFUSABLE = 10; // CIEDE2000 rule of thumb for small chart marks
const DEFAULT_BG = 'FFFFFF';
const DEFAULT_COLORS = ['1F77B4', 'FF7F0E', '2CA02C', 'D62728', '9467BD'];

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'text') node.textContent = v;
    else if (k === 'on') for (const [evt, fn] of Object.entries(v)) node.addEventListener(evt, fn);
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  for (const child of [].concat(children)) if (child) node.append(child);
  return node;
}

const tag = (passes, yes, no) => el('span', { class: `tag ${passes ? 'tag-pass' : 'tag-fail'}`, text: passes ? yes : no });
const swatch = (rgb) => {
  const s = el('span', { class: 'ccc-chip', 'aria-hidden': 'true' });
  s.style.background = toHex(rgb);
  return s;
};

function readParams() {
  const p = new URLSearchParams(location.search);
  const bg = parseHex(p.get('bg') || '') ? p.get('bg').replace(/^#/, '') : DEFAULT_BG;
  const colors = (p.get('c') || '')
    .split(',')
    .filter((c) => parseHex(c))
    .slice(0, MAX_COLORS);
  return { bg, colors: colors.length >= MIN_COLORS ? colors : DEFAULT_COLORS };
}

function init(root) {
  const bgHex = root.querySelector('[data-bg-hex]');
  const bgPicker = root.querySelector('[data-bg-picker]');
  const list = root.querySelector('[data-series]');
  const addBtn = root.querySelector('[data-add]');
  const status = root.querySelector('[data-status]');
  const summary = root.querySelector('[data-summary]');
  const contrastRows = root.querySelector('[data-contrast-rows]');
  const cvdRows = root.querySelector('[data-cvd-rows]');
  const copyBtn = root.querySelector('[data-copy-link]');

  const params = readParams();
  bgHex.value = params.bg.toUpperCase();

  function addRow(hex, focus = false) {
    const index = list.children.length + 1;
    const id = `ccc-color-${Date.now().toString(36)}-${index}`;
    const text = el('input', { id, type: 'text', maxlength: '7', autocomplete: 'off', spellcheck: 'false', value: hex.toUpperCase(), 'data-hex': true });
    const picker = el('input', { type: 'color', value: toHex(parseHex(hex)), 'data-picker': true });
    const label = el('label', { for: id });
    const remove = el('button', { type: 'button', class: 'btn btn-outline btn-sm ccc-remove' }, [icon('x')]);
    const li = el('li', { class: 'field ccc-row' }, [label, el('div', { class: 'cc-hex-row' }, [el('span', { class: 'cc-hex-prefix', 'aria-hidden': 'true', text: '#' }), text, picker, remove])]);
    text.addEventListener('input', update);
    text.addEventListener('blur', () => {
      const rgb = parseHex(text.value);
      if (rgb) text.value = toHex(rgb).slice(1).toUpperCase();
    });
    picker.addEventListener('input', () => {
      text.value = picker.value.slice(1).toUpperCase();
      update();
    });
    remove.addEventListener('click', () => {
      const next = li.nextElementSibling || li.previousElementSibling;
      li.remove();
      renumber();
      update();
      next?.querySelector('[data-hex]')?.focus();
    });
    list.append(li);
    renumber();
    if (focus) text.focus();
  }

  function renumber() {
    [...list.children].forEach((li, i) => {
      li.querySelector('label').textContent = `Color ${i + 1}`;
      const remove = li.querySelector('.ccc-remove');
      remove.setAttribute('aria-label', `Remove color ${i + 1}`);
      remove.disabled = list.children.length <= MIN_COLORS;
      li.querySelector('[data-picker]').setAttribute('aria-label', `Pick color ${i + 1}`);
    });
    addBtn.disabled = list.children.length >= MAX_COLORS;
  }

  params.colors.forEach((c) => addRow(c));
  addBtn.addEventListener('click', () => {
    if (list.children.length < MAX_COLORS) {
      addRow('777777', true);
      update();
    }
  });

  bgHex.addEventListener('input', update);
  bgHex.addEventListener('blur', () => {
    const rgb = parseHex(bgHex.value);
    if (rgb) bgHex.value = toHex(rgb).slice(1).toUpperCase();
  });
  bgPicker.addEventListener('input', () => {
    bgHex.value = bgPicker.value.slice(1).toUpperCase();
    update();
  });

  let statusTimer;
  function announce(text) {
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => (status.textContent = text), 400);
  }

  function update() {
    const bg = parseHex(bgHex.value);
    const inputs = [...list.querySelectorAll('[data-hex]')];
    const colors = inputs.map((i) => parseHex(i.value));
    if (!bg || colors.some((c) => !c)) {
      summary.textContent = 'Enter valid hex colors, such as 1F77B4, to see the results.';
      announce(summary.textContent);
      return;
    }
    bgPicker.value = toHex(bg);
    list.querySelectorAll('[data-picker]').forEach((p, i) => (p.value = toHex(colors[i])));

    // Contrast against the background
    let lowContrast = 0;
    contrastRows.replaceChildren(
      ...colors.map((rgb, i) => {
        const ratio = contrast(rgb, bg);
        const passes = ratio >= TARGET;
        if (!passes) lowContrast++;
        let fix = el('p', { class: 'ccc-muted', text: 'No shade of this hue reaches 3:1 on this background.' });
        if (!passes) {
          const shade = suggestShade(rgb, bg, TARGET);
          if (shade) {
            const hex = toHex(shade).slice(1).toUpperCase();
            fix = el('button', {
              type: 'button',
              class: 'btn btn-outline btn-sm',
              text: `Use #${hex}`,
              'aria-label': `Replace color ${i + 1} with #${hex}, ${contrast(shade, bg).toFixed(2)} to 1`,
              on: {
                click: () => {
                  inputs[i].value = hex;
                  update();
                  inputs[i].focus();
                },
              },
            });
          }
        }
        const hex = `#${toHex(rgb).slice(1).toUpperCase()}`;
        return el('li', { class: 'ccc-result' }, [
          el('div', { class: 'ccc-result-head' }, [
            swatch(rgb),
            el('strong', { text: `Color ${i + 1}` }),
            el('span', { class: 'ccc-hex', text: hex }),
            tag(passes, 'Pass', 'Fail'),
          ]),
          el('p', { text: `Contrast ${ratio.toFixed(2)}:1 against the background.` }),
          passes ? null : fix,
        ]);
      }),
    );

    // Color vision deficiency check
    let problemVisions = 0;
    cvdRows.replaceChildren(
      ...VISION.map((v) => {
        const seen = colors.map((c) => simulate(c, v.id));
        let closest = null;
        for (let a = 0; a < seen.length; a++) {
          for (let b = a + 1; b < seen.length; b++) {
            const d = deltaE(seen[a], seen[b]);
            if (!closest || d < closest.d) closest = { a, b, d };
          }
        }
        const ok = closest.d >= CONFUSABLE;
        if (!ok) problemVisions++;
        const preview = el('span', { class: 'ccc-preview' }, seen.map((c) => swatch(c)));
        preview.style.background = toHex(simulate(bg, v.id));
        return el('li', { class: 'ccc-result' }, [
          el('div', { class: 'ccc-result-head' }, [el('strong', { text: v.label }), tag(ok, 'Distinct', 'Hard to tell apart')]),
          preview,
          el('p', { text: `Closest pair: colors ${closest.a + 1} and ${closest.b + 1}, difference ${closest.d.toFixed(1)}.` }),
        ]);
      }),
    );

    const parts = [];
    parts.push(lowContrast ? `${lowContrast} of ${colors.length} colors ${lowContrast === 1 ? 'is' : 'are'} below 3:1 against the background.` : `All ${colors.length} colors reach 3:1 against the background.`);
    parts.push(problemVisions ? `Some colors are hard to tell apart for ${problemVisions} of ${VISION.length} types of vision.` : 'Every pair of colors stays distinct for all 5 types of vision.');
    summary.textContent = parts.join(' ');
    announce(summary.textContent);

    const url = new URL(location.href);
    url.searchParams.set('bg', toHex(bg).slice(1));
    url.searchParams.set('c', colors.map((c) => toHex(c).slice(1)).join(','));
    history.replaceState(null, '', url);
  }

  copyBtn.addEventListener('click', async () => {
    const label = copyBtn.querySelector('span');
    try {
      await navigator.clipboard.writeText(location.href);
      label.textContent = 'Link copied';
    } catch {
      label.textContent = 'Copy failed. Copy the address bar instead.';
    }
    setTimeout(() => (label.textContent = 'Copy link to this palette'), 2000);
  });

  update();
}

document.querySelectorAll('[data-chart-colors]').forEach(init);

// WCAG contrast checker. Runs entirely in the browser; nothing is sent
// anywhere. Color math lives in shared/color.js so it stays in sync with
// the chart color checker's tests.
import { parseHex, toHex, contrast, suggestShade } from './shared/color.js';

const THRESHOLDS = {
  'normal-aa': 4.5,
  'normal-aaa': 7,
  'large-aa': 3,
  'large-aaa': 4.5,
  'ui-aa': 3,
};

function readParams() {
  const p = new URLSearchParams(location.search);
  return { fg: p.get('fg'), bg: p.get('bg') };
}

function init(root) {
  const fgHex = root.querySelector('[data-fg-hex]');
  const fgPicker = root.querySelector('[data-fg-picker]');
  const fgSwatch = root.querySelector('[data-fg-swatch]');
  const bgHex = root.querySelector('[data-bg-hex]');
  const bgPicker = root.querySelector('[data-bg-picker]');
  const bgSwatch = root.querySelector('[data-bg-swatch]');
  const swapBtn = root.querySelector('[data-swap]');
  const ratioEl = root.querySelector('[data-ratio]');
  const status = root.querySelector('[data-cc-status]');
  const preview = root.querySelector('[data-preview]');
  const previewNormal = root.querySelector('[data-preview-normal]');
  const previewLarge = root.querySelector('[data-preview-large]');
  const badges = Object.fromEntries(Array.from(root.querySelectorAll('[data-check]')).map((el) => [el.dataset.check, el]));
  const suggestBox = root.querySelector('[data-suggest]');
  const suggestText = root.querySelector('[data-suggest-text]');
  const suggestApply = root.querySelector('[data-suggest-apply]');
  const copyLinkBtn = root.querySelector('[data-copy-link]');

  let suggestedFg = null;

  const params = readParams();
  if (params.fg && parseHex(params.fg)) fgHex.value = params.fg.replace(/^#/, '');
  if (params.bg && parseHex(params.bg)) bgHex.value = params.bg.replace(/^#/, '');

  const readHex = (input) => parseHex(input.value);
  const tidyOnBlur = (input) => {
    const rgb = parseHex(input.value);
    if (rgb) input.value = toHex(rgb).slice(1).toUpperCase();
  };
  fgHex.addEventListener('blur', () => tidyOnBlur(fgHex));
  bgHex.addEventListener('blur', () => tidyOnBlur(bgHex));

  function update() {
    const fgRgb = readHex(fgHex);
    const bgRgb = readHex(bgHex);
    if (!fgRgb || !bgRgb) {
      ratioEl.textContent = '—';
      status.textContent = 'Enter two valid hex colors, such as 000000 and FFFFFF.';
      return;
    }

    fgPicker.value = toHex(fgRgb);
    bgPicker.value = toHex(bgRgb);
    fgSwatch.style.background = toHex(fgRgb);
    bgSwatch.style.background = toHex(bgRgb);
    preview.style.background = toHex(bgRgb);
    previewNormal.style.color = toHex(fgRgb);
    previewLarge.style.color = toHex(fgRgb);

    const ratio = contrast(fgRgb, bgRgb);
    ratioEl.textContent = `${ratio.toFixed(2)}:1`;

    let passCount = 0;
    let failCount = 0;
    for (const [key, threshold] of Object.entries(THRESHOLDS)) {
      const passes = ratio >= threshold;
      const badge = badges[key];
      badge.textContent = passes ? 'Pass' : 'Fail';
      badge.className = `tag ${passes ? 'tag-pass' : 'tag-fail'}`;
      if (passes) passCount++;
      else failCount++;
    }

    status.textContent = `Contrast ratio is ${ratio.toFixed(2)} to 1. ${passCount} of ${passCount + failCount} checks pass.`;

    if (ratio < THRESHOLDS['normal-aa']) {
      suggestedFg = suggestShade(fgRgb, bgRgb, THRESHOLDS['normal-aa']);
      if (suggestedFg) {
        suggestText.textContent = `Try ${toHex(suggestedFg).toUpperCase()} for the text color instead, which reaches 4.5:1 (Normal Text AA) against this background.`;
        suggestBox.hidden = false;
      } else {
        suggestBox.hidden = true;
      }
    } else {
      suggestBox.hidden = true;
      suggestedFg = null;
    }

    const url = new URL(location.href);
    url.searchParams.set('fg', toHex(fgRgb).slice(1));
    url.searchParams.set('bg', toHex(bgRgb).slice(1));
    history.replaceState(null, '', url);
  }

  fgHex.addEventListener('input', update);
  bgHex.addEventListener('input', update);
  fgPicker.addEventListener('input', () => {
    fgHex.value = fgPicker.value.slice(1);
    update();
  });
  bgPicker.addEventListener('input', () => {
    bgHex.value = bgPicker.value.slice(1);
    update();
  });

  swapBtn.addEventListener('click', () => {
    const a = fgHex.value;
    fgHex.value = bgHex.value;
    bgHex.value = a;
    update();
    status.textContent = 'Colors swapped. ' + status.textContent;
  });

  suggestApply.addEventListener('click', () => {
    if (!suggestedFg) return;
    fgHex.value = toHex(suggestedFg).slice(1);
    update();
    status.textContent = 'Applied the suggested text color. ' + status.textContent;
  });

  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        const label = copyLinkBtn.querySelector('span');
        const before = label.textContent;
        label.textContent = 'Copied';
        setTimeout(() => (label.textContent = before), 2000);
        status.textContent = 'Link to this result copied to the clipboard.';
      } catch {
        status.textContent = 'Copy is not available in this browser. Copy the address bar URL instead.';
      }
    });
  }

  update();
}

document.querySelectorAll('[data-contrast]').forEach(init);

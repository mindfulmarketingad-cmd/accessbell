// Code example with line numbers, a Copy button and a coloured banner.
import { el, icon } from './core.js';

/** variant: 'good' (green, "Correct markup") or 'bad' (red, "Incorrect markup"). */
export function codeBlock(code, heading, variant = 'good') {
  const status = el('span', { class: 'visually-hidden', role: 'status', 'aria-live': 'polite' });
  const copy = el('button', { type: 'button', class: 'copy-btn' }, [icon('copy'), el('span', { text: 'Copy' })]);
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code);
      copy.lastChild.textContent = 'Copied';
      status.textContent = 'Code copied to the clipboard.';
      setTimeout(() => (copy.lastChild.textContent = 'Copy'), 2000);
    } catch {
      status.textContent = 'Copy is not available. Select the code and copy it manually.';
    }
  });
  const lines = code.split('\n').map((line, i) =>
    el('span', { class: 'code-line' }, [
      el('span', { class: 'ln', 'aria-hidden': 'true', text: String(i + 1) }),
      el('span', { class: line.trim().startsWith('<!--') || line.trim().startsWith('/*') ? 'cm' : '', text: line || ' ' }),
    ]),
  );
  return el('div', { class: `code-block code-${variant}` }, [
    el('div', { class: 'code-banner' }, [icon(variant === 'bad' ? 'x' : 'check'), el('span', { text: heading })]),
    el('div', { class: 'code-head' }, [el('span', { text: 'Code example' }), copy, status]),
    el('pre', { tabindex: '0' }, [el('code', {}, lines)]),
  ]);
}

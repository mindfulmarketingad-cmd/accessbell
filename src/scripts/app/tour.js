// Spotlight product tour. The tour is a modal <dialog>: focus stays inside it,
// the page behind is inert, Escape closes it, and each step's heading and text
// label the dialog. The dimmed cut-out around the feature is decorative; the
// step text always says what is being shown.
import { el } from './core.js';

const GAP = 14;
const EDGE = 16;
const PAD = 6;

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function isVisible(node) {
  if (!node || !node.getClientRects().length) return false;
  const style = getComputedStyle(node);
  return style.visibility !== 'hidden' && style.display !== 'none';
}

/** First visible element among a step's target selectors (e.g. a sidebar link, or the menu button on phones). */
function findTarget(step) {
  const selectors = [step.target].flat().filter(Boolean);
  for (const sel of selectors) {
    const node = [...document.querySelectorAll(sel)].find(isVisible);
    if (node) return node;
  }
  return null;
}

/** Where the card goes: next to the highlighted area if it fits, otherwise docked at the bottom. */
function placeCard(card, rect, prefer) {
  const vw = innerWidth;
  const vh = innerHeight;
  const cw = card.offsetWidth;
  const ch = card.offsetHeight;
  let top = (vh - ch) / 2;
  let left = (vw - cw) / 2;
  if (rect) {
    const midX = rect.left + rect.width / 2 - cw / 2;
    const midY = rect.top + rect.height / 2 - ch / 2;
    const options = {
      bottom: vh - rect.bottom - GAP - EDGE >= ch && [rect.bottom + GAP, midX],
      top: rect.top - GAP - EDGE >= ch && [rect.top - GAP - ch, midX],
      right: vw - rect.right - GAP - EDGE >= cw && [midY, rect.right + GAP],
      left: rect.left - GAP - EDGE >= cw && [midY, rect.left - GAP - cw],
    };
    const order = [prefer, 'bottom', 'top', 'right', 'left'].filter(Boolean);
    const fit = order.map((k) => options[k]).find(Boolean);
    [top, left] = fit || [vh - ch - EDGE, (vw - cw) / 2];
  }
  card.style.top = `${Math.round(Math.max(EDGE, Math.min(top, vh - ch - EDGE)))}px`;
  card.style.left = `${Math.round(Math.max(EDGE, Math.min(left, vw - cw - EDGE)))}px`;
}

/**
 * Run a tour. Steps: { title, body (string or array of strings), target?
 * (selector or list), placement?, before?(), nextLabel?, skipLabel? }.
 * Resolves with "finished" or "dismissed".
 */
export function runTour(steps) {
  return new Promise((resolve) => {
    let index = 0;
    let target = null;
    let ended = false;

    const title = el('h2', { id: 'ob-title', class: 'ob-title', tabindex: '-1' });
    const body = el('div', { id: 'ob-body', class: 'ob-body' });
    const progress = el('p', { class: 'ob-progress' });
    const dots = el('ol', { class: 'ob-dots', 'aria-hidden': 'true' }, steps.map(() => el('li')));
    const skip = el('button', { type: 'button', class: 'ob-skip' });
    const back = el('button', { type: 'button', class: 'btn btn-outline btn-sm', text: 'Back' });
    const next = el('button', { type: 'button', class: 'btn btn-sm' });
    const card = el('div', { class: 'ob-card' }, [
      progress,
      title,
      body,
      el('div', { class: 'ob-foot' }, [dots, el('div', { class: 'ob-actions' }, [skip, back, next])]),
    ]);
    const spot = el('div', { class: 'ob-spot', 'aria-hidden': 'true' });
    // Motion stays off until the first step is placed, so the card doesn't slide in from the middle.
    const dialog = el('dialog', { class: 'ob-tour is-still', 'aria-labelledby': 'ob-title', 'aria-describedby': 'ob-body' }, [spot, card]);

    function layout() {
      const rect = target?.getBoundingClientRect();
      if (rect) {
        const top = Math.max(rect.top - PAD, 4);
        const left = Math.max(rect.left - PAD, 4);
        const bottom = Math.min(rect.bottom + PAD, innerHeight - 4);
        const right = Math.min(rect.right + PAD, innerWidth - 4);
        Object.assign(spot.style, { top: `${top}px`, left: `${left}px`, width: `${Math.max(right - left, 0)}px`, height: `${Math.max(bottom - top, 0)}px` });
        spot.classList.remove('is-center');
        placeCard(card, { top, left, bottom, right, width: right - left, height: bottom - top }, steps[index].placement);
      } else {
        Object.assign(spot.style, { top: '50%', left: '50%', width: '0px', height: '0px' });
        spot.classList.add('is-center');
        placeCard(card, null);
      }
    }

    async function show(i) {
      index = i;
      const step = steps[i];
      await step.before?.();
      target = step.target ? findTarget(step) : null;
      if (target) {
        const tall = target.getBoundingClientRect().height > innerHeight * 0.6;
        target.scrollIntoView({ block: tall ? 'start' : 'center', inline: 'nearest', behavior: 'instant' });
      }

      title.textContent = step.title;
      body.replaceChildren(...[step.body].flat().map((t) => el('p', { text: t })));
      progress.textContent = `Step ${i + 1} of ${steps.length}`;
      [...dots.children].forEach((d, n) => d.classList.toggle('is-on', n === i));
      const last = i === steps.length - 1;
      back.hidden = i === 0;
      skip.hidden = last;
      skip.textContent = step.skipLabel || 'Skip tour';
      next.textContent = step.nextLabel || (last ? 'Finish' : 'Next');

      await new Promise((r) => requestAnimationFrame(r));
      layout();
      title.focus();
      requestAnimationFrame(() => dialog.classList.toggle('is-still', reducedMotion()));
    }

    function end(result) {
      if (ended) return;
      ended = true;
      removeEventListener('resize', layout);
      document.removeEventListener('scroll', layout, true);
      dialog.close();
      dialog.remove();
      resolve(result);
    }

    next.addEventListener('click', () => (index < steps.length - 1 ? show(index + 1) : end('finished')));
    back.addEventListener('click', () => index > 0 && show(index - 1));
    skip.addEventListener('click', () => end('dismissed'));
    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      end('dismissed');
    });
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' && index < steps.length - 1) show(index + 1);
      else if (e.key === 'ArrowLeft' && index > 0) show(index - 1);
    });
    addEventListener('resize', layout);
    document.addEventListener('scroll', layout, true);

    document.body.append(dialog);
    dialog.showModal();
    show(0);
  });
}

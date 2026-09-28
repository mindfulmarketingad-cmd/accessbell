// Pricing page "How it works" tour. Each step shows its illustration; a CSS
// progress bar times the step and its animationend moves to the next one.
// Auto-advance pauses on hover, keyboard focus, when off-screen or when the
// visitor presses Pause, and never runs for prefers-reduced-motion.

export function initTour(root) {
  const steps = [...root.querySelectorAll('[data-step]')];
  const scenes = [...root.querySelectorAll('[data-scene]')];
  const toggle = root.querySelector('[data-tour-toggle]');
  if (!steps.length || steps.length !== scenes.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const holds = new Set();
  let current = 0;

  function show(index) {
    current = (index + steps.length) % steps.length;
    steps.forEach((step, i) => {
      const on = i === current;
      step.classList.toggle('is-active', on);
      const btn = step.querySelector('button');
      if (on) btn.setAttribute('aria-current', 'step');
      else btn.removeAttribute('aria-current');
    });
    scenes.forEach((scene, i) => scene.classList.toggle('is-active', i === current));
  }

  function hold(reason, on) {
    if (on) holds.add(reason);
    else holds.delete(reason);
    root.classList.toggle('is-held', holds.size > 0);
  }

  function setMode() {
    root.classList.toggle('is-auto', !reduced.matches);
    toggle.hidden = reduced.matches;
  }

  steps.forEach((step, i) => {
    // The whole card is clickable; keyboard users press the step's button,
    // whose click bubbles here.
    step.addEventListener('click', () => {
      if (i !== current) show(i);
    });
    step.querySelector('.tour-progress').addEventListener('animationend', () => {
      if (root.classList.contains('is-auto') && i === current) show(current + 1);
    });
  });

  toggle.addEventListener('click', () => {
    const paused = !holds.has('user');
    hold('user', paused);
    root.classList.toggle('is-paused', paused);
  });

  root.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && hold('hover', true));
  root.addEventListener('pointerleave', () => hold('hover', false));
  root.addEventListener('focusin', (e) => hold('focus', e.target !== toggle));
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget)) hold('focus', false);
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => hold('offscreen', !entry.isIntersecting), { threshold: 0.25 }).observe(root);
  }
  document.addEventListener('visibilitychange', () => hold('hidden', document.hidden));
  reduced.addEventListener('change', setMode);

  setMode();
  show(0);
}

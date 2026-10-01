import { C, svg, text, para, compare, caption, box, field, button, lines, code, arrow, pill, mark } from '../kit.mjs';

const W = 800;
export const images = [];
const add = (slug, name, h, body) => images.push({ slug, name, svg: svg(W, h, body) });
const optionCards = (title, cards, h = 260) => {
  let body = text(24, 40, title, { size: 20, weight: 800 });
  const n = cards.length, cw = (752 - (n - 1) * 16) / n;
  cards.forEach(([t, d, kind = 'pass'], i) => {
    const x = 24 + i * (cw + 16);
    body += box(x, 66, cw, h - 90, { fill: kind === 'pass' ? C.passBg : C.infoBg, stroke: kind === 'pass' ? C.passLine : C.infoLine, r: 12 });
    body += mark(x + 28, 98, kind, 13) + text(x + 50, 104, t, { size: 15, weight: 800, fill: kind === 'pass' ? C.pass : C.info });
    body += para(x + 20, 136, d, { chars: Math.floor(cw / 7.4), size: 13, lh: 19 });
  });
  return body;
};

// ---------- 2.1.4 Character Key Shortcuts ----------
{
  const s = '2-1-4-character-key-shortcuts';
  let { body, a, b } = compare(W, 380, 'Single keys fire shortcuts', 'Shortcuts can be turned off');
  for (const [p, good] of [[a, false], [b, true]]) {
    const x = p.x + 24, w = p.w - 48;
    body += text(x, p.y + 84, 'Voice user dictates:', { size: 13, weight: 700, fill: C.muted });
    body += box(x, p.y + 94, w, 44, { fill: '#fff', stroke: C.line, r: 10 }) + text(x + 14, p.y + 122, '"Search for socks"', { size: 15, weight: 600 });
    if (good) {
      body += box(x, p.y + 158, w, 70, { fill: '#fff', stroke: C.line, r: 10 }) + text(x + 14, p.y + 186, 'Keyboard shortcuts', { size: 14, weight: 700 });
      body += box(x + w - 66, p.y + 172, 50, 26, { fill: '#c7ccd4', stroke: 'none', r: 13 }) + `<circle cx="${x + w - 53}" cy="${p.y + 185}" r="10" fill="#fff"/>` + text(x + 14, p.y + 210, 'Off', { size: 13, fill: C.muted });
    } else {
      ['s → Search', 'f → Favorite', 'o → Open', 'c → Comment'].forEach((k, i) => (body += pill(x + (i % 2) * 150, p.y + 160 + Math.floor(i / 2) * 32, k, { fill: '#f8dcd9', color: C.fail })));
    }
    body += caption(p.x + p.w / 2, p.y + 280, good ? 'The words are typed, nothing else happens' : 'Each letter spoken triggers a different action', good ? 'pass' : 'fail');
  }
  add(s, 'voice-dictation', 380, body);
  add(s, 'three-options', 240, optionCards('Meet 2.1.4 with at least one of these', [['Turn off', 'A setting switches single-key shortcuts off.'], ['Remap', 'People can change a shortcut to include Ctrl, Alt or another modifier key.'], ['Only on focus', 'The shortcut works only while its own component, such as a list or player, has focus.']], 240));
}

// ---------- 2.2.1 Timing Adjustable ----------
{
  const s = '2-2-1-timing-adjustable';
  let { body, a, b } = compare(W, 400, 'Signed out without warning', 'Warned, with time to extend');
  for (const [p, good] of [[a, false], [b, true]]) {
    const x = p.x + 24, w = p.w - 48;
    if (good) {
      body += box(x, p.y + 76, w, 200, { fill: '#fff', stroke: C.passMid, sw: 2.5, r: 12 });
      body += text(x + 18, p.y + 108, 'Your session ends in 1:52', { size: 16, weight: 800 });
      body += para(x + 18, p.y + 134, 'You have been inactive for a while. Do you need more time?', { chars: 38, size: 13 });
      body += button(x + 18, p.y + 186, 150, 'Stay signed in', { variant: 'primary', focus: true, size: 13 }) + button(x + 180, p.y + 186, 100, 'Sign out', { variant: 'secondary', size: 13 });
      body += text(x + 18, p.y + 256, 'At least 20 seconds to respond', { size: 12, fill: C.muted });
    } else {
      body += box(x, p.y + 76, w, 200, { fill: '#fff', stroke: C.line, r: 12 });
      body += text(x + 18, p.y + 110, 'Session expired', { size: 16, weight: 800, fill: C.fail });
      body += para(x + 18, p.y + 136, 'Please sign in again. Your answers were not saved.', { chars: 38, size: 13 });
      body += button(x + 18, p.y + 186, 120, 'Sign in', { variant: 'primary', size: 13 });
    }
    body += caption(p.x + p.w / 2, p.y + 330, good ? 'One simple action gives more time, and it can be repeated' : 'Slow typists and screen reader users lose their work', good ? 'pass' : 'fail');
  }
  add(s, 'session-timeout', 400, body);
  add(s, 'options', 270, optionCards('Every time limit needs at least one of these', [['Turn off', 'People can turn the time limit off before they meet it.'], ['Adjust', 'People can set it to at least 10 times the default length.'], ['Extend', 'A warning and at least 20 seconds to extend with a simple action, at least 10 times.']], 270));
}

// ---------- 2.3.1 Three Flashes or Below Threshold ----------
{
  const s = '2-3-1-three-flashes-or-below-threshold';
  let body = text(24, 40, 'Count the flashes in any one second', { size: 20, weight: 800 });
  const row = (y, n, good) => {
    let out = mark(38, y + 24, good ? 'pass' : 'fail', 13) + text(60, y + 30, good ? '2 flashes per second' : '5 flashes per second', { size: 15, weight: 800, fill: good ? C.pass : C.fail });
    out += box(260, y, 516, 48, { fill: '#fff', stroke: C.line, r: 8 });
    for (let i = 0; i < n; i++) {
      const x = 270 + (i * 496) / n;
      out += `<rect x="${x.toFixed(1)}" y="${y + 8}" width="${(496 / n / 2).toFixed(1)}" height="32" rx="4" fill="${good ? '#9fd19a' : '#f08a80'}"/>`;
    }
    return out;
  };
  body += row(66, 5, false) + row(140, 2, true);
  body += `<path d="M260 206H776" stroke="${C.muted}" stroke-width="1.5"/>` + text(260, 224, '0 s', { size: 12, fill: C.muted }) + text(776, 224, '1 s', { size: 12, fill: C.muted, anchor: 'end' });
  body += para(400, 262, 'More than 3 flashes in a second fails, unless the flashing is below the general and red flash thresholds. The safest rule: never flash more than 3 times a second.', { chars: 96, size: 14, fill: C.muted, anchor: 'middle' });
  add(s, 'flash-rate', 310, body);

  let t = compare(W, 360, 'Large, bright, fast flashing', 'Slow, small or no flashing');
  body = t.body;
  for (const [p, good] of [[t.a, false], [t.b, true]]) {
    const x = p.x + 24, w = p.w - 48;
    body += box(x, p.y + 72, w, 180, { fill: '#2b3240', stroke: '#2b3240', r: 10 });
    if (good) body += `<rect x="${x + w / 2 - 30}" y="${p.y + 142}" width="60" height="40" rx="6" fill="#9fd19a"/>` + text(x + w / 2, p.y + 238, 'Pulses gently, under 3 times a second', { size: 12, fill: '#e6e9ee', anchor: 'middle' });
    else body += `<rect x="${x + 12}" y="${p.y + 84}" width="${w - 24}" height="156" rx="6" fill="#f08a80"/><rect x="${x + 12}" y="${p.y + 84}" width="${(w - 24) / 2}" height="156" fill="#fff" opacity="0.85"/>` + text(x + w / 2, p.y + 168, 'STROBE', { size: 22, weight: 800, fill: C.fail, anchor: 'middle' });
    body += caption(p.x + p.w / 2, p.y + 290, good ? 'Animation that cannot trigger seizures' : 'Bright red flashing filling the screen can trigger seizures', good ? 'pass' : 'fail');
  }
  add(s, 'flash-area', 360, body);
}

// ---------- 2.5.1 Pointer Gestures ----------
{
  const s = '2-5-1-pointer-gestures';
  let { body, a, b } = compare(W, 380, 'Pinch to zoom only', 'Buttons do the same thing');
  for (const [p, good] of [[a, false], [b, true]]) {
    const x = p.x + 24, w = p.w - 48;
    body += `<rect x="${x}" y="${p.y + 72}" width="${w}" height="190" rx="10" fill="#e3ecdf"/>`;
    body += `<path d="M${x + 30} ${p.y + 220}C${x + 120} ${p.y + 120} ${x + 200} ${p.y + 240} ${x + w - 30} ${p.y + 110}" fill="none" stroke="#fff" stroke-width="6"/>`;
    if (good) {
      body += box(x + w - 54, p.y + 86, 40, 40, { fill: '#fff', stroke: C.line, r: 8 }) + text(x + w - 34, p.y + 113, '+', { size: 22, weight: 800, anchor: 'middle' });
      body += box(x + w - 54, p.y + 132, 40, 40, { fill: '#fff', stroke: C.line, r: 8 }) + text(x + w - 34, p.y + 159, '−', { size: 22, weight: 800, anchor: 'middle' });
    } else {
      body += `<circle cx="${x + w / 2 - 30}" cy="${p.y + 170}" r="14" fill="${C.failMid}" opacity="0.8"/><circle cx="${x + w / 2 + 30}" cy="${p.y + 150}" r="14" fill="${C.failMid}" opacity="0.8"/>` + arrow(x + w / 2 - 34, p.y + 174, x + w / 2 - 70, p.y + 196, C.failMid) + arrow(x + w / 2 + 34, p.y + 146, x + w / 2 + 70, p.y + 124, C.failMid);
    }
    body += caption(p.x + p.w / 2, p.y + 300, good ? 'Zoom with a single tap or click' : 'Needs two fingers moving at once', good ? 'pass' : 'fail');
  }
  add(s, 'map-zoom', 380, body);

  let t = compare(W, 360, 'Swipe is the only way', 'Swipe, or tap the arrows');
  body = t.body;
  for (const [p, good] of [[t.a, false], [t.b, true]]) {
    const x = p.x + 24, w = p.w - 48;
    body += box(x + 40, p.y + 80, w - 80, 150, { fill: C.soft, stroke: C.line, r: 10 }) + text(x + w / 2, p.y + 160, 'Slide 2 of 5', { size: 14, weight: 700, fill: C.muted, anchor: 'middle' });
    if (good) {
      body += box(x, p.y + 136, 32, 40, { fill: '#fff', stroke: C.line, r: 8 }) + text(x + 16, p.y + 162, '‹', { size: 22, weight: 800, anchor: 'middle' });
      body += box(x + w - 32, p.y + 136, 32, 40, { fill: '#fff', stroke: C.line, r: 8 }) + text(x + w - 16, p.y + 162, '›', { size: 22, weight: 800, anchor: 'middle' });
    } else body += arrow(x + w / 2 + 50, p.y + 200, x + w / 2 - 50, p.y + 200, C.failMid) + `<circle cx="${x + w / 2 + 54}" cy="${p.y + 200}" r="9" fill="${C.failMid}"/>`;
    body += caption(p.x + p.w / 2, p.y + 286, good ? 'Previous and next buttons work with one tap' : 'People who cannot swipe are stuck on one slide', good ? 'pass' : 'fail');
  }
  add(s, 'carousel', 360, body);
}

// ---------- 2.5.2 Pointer Cancellation ----------
{
  const s = '2-5-2-pointer-cancellation';
  let { body, a, b } = compare(W, 380, 'Acts on press down', 'Acts on release, can be cancelled');
  for (const [p, good] of [[a, false], [b, true]]) {
    const x = p.x + 24, w = p.w - 48;
    body += button(x, p.y + 90, 170, 'Delete account', { variant: 'secondary' });
    body += code(x, p.y + 150, w, [[good ? 'button.onclick = deleteAccount' : 'button.onmousedown = deleteAccount', good ? '#b9e3b3' : '#f3b4ae']]);
    body += para(x, p.y + 222, good ? 'Pressed by mistake? Slide your finger or pointer off the button before letting go, and nothing happens.' : 'The account is deleted the instant the button is pressed, before people can change their mind.', { chars: 42, size: 13 });
    body += caption(p.x + p.w / 2, p.y + 316, good ? 'Accidental presses can be abandoned' : 'An accidental tap cannot be undone', good ? 'pass' : 'fail');
  }
  add(s, 'down-vs-up', 380, body);

  body = text(24, 40, 'How cancelling a press works', { size: 20, weight: 800 });
  const steps = [['1. Press down', 'on the button'], ['2. Move away', 'still pressing'], ['3. Release', 'outside the button'], ['Nothing happens', 'the action is cancelled']];
  steps.forEach(([t, d], i) => {
    const x = 24 + i * 192;
    body += box(x, 70, 172, 100, { fill: i === 3 ? C.passBg : C.soft, stroke: i === 3 ? C.passMid : C.line, r: 12 }) + text(x + 86, 112, t, { size: 15, weight: 800, anchor: 'middle', fill: i === 3 ? C.pass : C.ink }) + text(x + 86, 136, d, { size: 13, fill: C.muted, anchor: 'middle' });
    if (i < 3) body += arrow(x + 176, 120, x + 188, 120, C.muted);
  });
  body += para(400, 206, 'Native buttons and links already work this way: their click event fires on release, inside the element.', { chars: 96, size: 14, fill: C.muted, anchor: 'middle' });
  add(s, 'cancel-steps', 240, body);
}

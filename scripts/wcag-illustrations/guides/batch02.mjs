import { C, svg, text, para, compare, caption, box, field, button, lines, code, arrow, pill, mark } from '../kit.mjs';

const W = 800;
export const images = [];
const add = (slug, name, h, body) => images.push({ slug, name, svg: svg(W, h, body) });
const speech = (x, y, w, s, kind) => box(x, y, w, 54, { fill: '#fff', stroke: kind === 'pass' ? C.passMid : C.failMid, sw: 2, r: 14 }) + `<path d="M${x + 30} ${y + 54}l-8 14 18-14" fill="#fff" stroke="${kind === 'pass' ? C.passMid : C.failMid}" stroke-width="2" stroke-linejoin="round"/>` + text(x + 16, y + 33, s, { size: 15, weight: 600 });

// ---------- 3.1.1 Language of Page ----------
{
  const s = '3-1-1-language-of-page';
  let { body, a, b } = compare(W, 400, 'No language set', 'lang="fr" on the page');
  for (const [p, good] of [[a, false], [b, true]]) {
    const x = p.x + 24, w = p.w - 48;
    body += code(x, p.y + 70, w, [[good ? '<html lang="fr">' : '<html>', good ? '#b9e3b3' : '#f3b4ae']]);
    body += text(x, p.y + 140, 'Bonjour, bienvenue sur notre site.', { size: 15, weight: 600 });
    body += lines(x, p.y + 154, w, 2);
    body += text(x, p.y + 214, good ? 'Screen reader voice: French' : 'Screen reader voice: English (default)', { size: 13, weight: 700, fill: C.muted });
    body += speech(x, p.y + 226, w, good ? '"Bonjour, bienvenue…" (French)' : '"Bon-jowr, bee-en-vee-noo…"', good ? 'pass' : 'fail');
    body += caption(p.x + p.w / 2, p.y + 330, good ? 'Spoken with French pronunciation, and translation tools know the language' : 'French text read with English rules, so it is hard to understand', good ? 'pass' : 'fail');
  }
  add(s, 'screen-reader-voice', 400, body);

  body = text(24, 40, 'Common language codes', { size: 20, weight: 800 });
  const codes = [['en', 'English'], ['en-US', 'English (US)'], ['en-GB', 'English (UK)'], ['es', 'Spanish'], ['fr', 'French'], ['de', 'German'], ['pt-BR', 'Portuguese (Brazil)'], ['zh-Hans', 'Chinese (Simplified)']];
  codes.forEach(([c, n], i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = 24 + col * 190, y = 66 + row * 72;
    body += box(x, y, 176, 58, { fill: C.soft, stroke: C.soft, r: 10 }) + text(x + 14, y + 26, c, { size: 16, weight: 800, mono: true }) + text(x + 14, y + 46, n, { size: 12, fill: C.muted });
  });
  body += code(24, 224, 752, [['<html lang="en-US">  <!-- one attribute, on the html element -->', '#b9e3b3']]);
  add(s, 'language-codes', 284, body);
}

// ---------- 3.3.1 Error Identification ----------
{
  const s = '3-3-1-error-identification';
  let { body, a, b } = compare(W, 380, 'A red border only', 'The error is described in text');
  for (const [p, good] of [[a, false], [b, true]]) {
    const x = p.x + 24, w = p.w - 48;
    body += field(x, p.y + 92, w, 'Email', { value: 'sam@example', state: 'error' });
    if (good) body += mark(x + 9, p.y + 162, 'fail', 9) + text(x + 26, p.y + 167, 'Enter a full email address', { size: 13, weight: 700, fill: C.fail });
    body += field(x, p.y + 202, w, 'Phone', { value: '07700 900123' });
    body += caption(p.x + p.w / 2, p.y + 300, good ? 'Text says which field is wrong and what to do, and is tied to the field' : 'Which field is wrong, and why? Color-only cues are lost on many people', good ? 'pass' : 'fail');
  }
  add(s, 'field-error', 380, body);

  body = mark(38, 40, 'pass') + text(62, 47, 'An error summary for longer forms', { size: 19, weight: 700, fill: C.pass });
  body += box(24, 70, 752, 120, { fill: '#fff', stroke: C.failMid, sw: 2.5, r: 12 });
  body += text(44, 102, 'There are 2 problems with your details', { size: 17, weight: 800, fill: C.fail });
  body += text(44, 134, 'Enter a full email, like sam@example.com', { size: 14, weight: 600, fill: C.info }) + `<path d="M44 138H330" stroke="${C.info}" stroke-width="1.5"/>`;
  body += text(44, 164, 'Choose a delivery speed', { size: 14, weight: 600, fill: C.info }) + `<path d="M44 168H205" stroke="${C.info}" stroke-width="1.5"/>`;
  body += text(470, 134, 'Each link moves focus', { size: 13, fill: C.muted }) + text(470, 154, 'to the field in error', { size: 13, fill: C.muted });
  body += code(24, 210, 752, [['<input id="email" aria-invalid="true" aria-describedby="email-error">'], ['<p id="email-error">Enter a full email, like sam@example.com</p>', '#b9e3b3']]);
  add(s, 'error-summary', 286, body);
}

// ---------- 2.4.3 Focus Order ----------
{
  const s = '2-4-3-focus-order';
  let { body, a, b } = compare(W, 400, 'Focus jumps around', 'Focus follows the layout');
  for (const [p, good] of [[a, false], [b, true]]) {
    const x = p.x + 24, w = p.w - 48, half = (w - 16) / 2;
    const order = good ? [1, 2, 3, 4, 5] : [1, 4, 2, 5, 3];
    const pos = [[x, p.y + 80, half, 'First name'], [x + half + 16, p.y + 80, half, 'Last name'], [x, p.y + 160, w, 'Street address'], [x, p.y + 240, half, 'City'], [x + half + 16, p.y + 240, half, 'Postcode']];
    pos.forEach(([fx, fy, fw, l], i) => {
      body += field(fx, fy, fw, l);
      body += `<circle cx="${fx + fw - 18}" cy="${fy + 27}" r="12" fill="${good ? C.passMid : C.failMid}"/>` + text(fx + fw - 18, fy + 32, String(order[i]), { size: 13, weight: 800, fill: '#fff', anchor: 'middle' });
    });
    body += caption(p.x + p.w / 2, p.y + 330, good ? 'Source order matches the visual order' : 'Positive tabindex values send focus all over the form', good ? 'pass' : 'fail');
  }
  add(s, 'form-order', 400, body);

  body = text(24, 40, 'Dialogs: move focus in, then back', { size: 20, weight: 800 });
  body += box(24, 66, 330, 220, { fill: C.soft, stroke: C.line, r: 12 }) + lines(44, 90, 290, 3) + button(44, 150, 150, 'Delete list', { variant: 'secondary', focus: true });
  body += text(44, 228, '1. Focus is on the button', { size: 13, weight: 700, fill: C.muted });
  body += arrow(366, 176, 430, 176, C.passMid);
  body += box(446, 66, 330, 220, { fill: '#fff', stroke: C.passMid, sw: 2.5, r: 12 }) + text(466, 98, 'Delete this list?', { size: 17, weight: 800 }) + lines(466, 114, 290, 2);
  body += button(466, 162, 120, 'Delete', { variant: 'primary', focus: true }) + button(600, 162, 120, 'Cancel', { variant: 'secondary' });
  body += text(466, 236, '2. Focus moves into the dialog', { size: 13, weight: 700, fill: C.muted }) + text(466, 256, '3. On close, it returns to the button', { size: 13, weight: 700, fill: C.muted });
  add(s, 'dialog-focus', 306, body);
}

// ---------- 2.1.2 No Keyboard Trap ----------
{
  const s = '2-1-2-no-keyboard-trap';
  let { body, a, b } = compare(W, 400, 'Focus cannot leave', 'A standard key gets you out');
  for (const [p, good] of [[a, false], [b, true]]) {
    const x = p.x + 24, w = p.w - 48;
    body += box(x, p.y + 76, w, 160, { fill: '#fff', stroke: C.line, r: 10 });
    body += text(x + 16, p.y + 102, 'Embedded map', { size: 14, weight: 800 });
    body += `<rect x="${x + 16}" y="${p.y + 114}" width="${w - 32}" height="104" rx="8" fill="#e3ecdf"/>`;
    body += `<circle cx="${x + w / 2}" cy="${p.y + 166}" r="26" fill="none" stroke="${good ? C.passMid : C.failMid}" stroke-width="3"/>`;
    if (good) body += arrow(x + w / 2 + 28, p.y + 166, x + w - 4, p.y + 166, C.passMid) + text(x + w / 2, p.y + 266, 'Tab or Esc moves on to the next link', { size: 13, weight: 700, fill: C.pass, anchor: 'middle' });
    else body += `<path d="M${x + w / 2 + 18} ${p.y + 148}a26 26 0 1 1-6-6" fill="none" stroke="${C.failMid}" stroke-width="3"/>` + text(x + w / 2, p.y + 266, 'Tab cycles inside the map forever', { size: 13, weight: 700, fill: C.fail, anchor: 'middle' });
    body += caption(p.x + p.w / 2, p.y + 316, good ? 'If a special key is needed, the page says which one' : 'The only way out is to reload the page', good ? 'pass' : 'fail');
  }
  add(s, 'trap', 400, body);

  body = mark(38, 40, 'info') + text(62, 47, 'A modal dialog is not a trap', { size: 19, weight: 700, fill: C.info });
  body += box(24, 72, 752, 170, { fill: C.soft, stroke: C.line, r: 12 });
  body += box(220, 92, 360, 130, { fill: '#fff', stroke: C.info, sw: 2.5, r: 12 }) + text(240, 122, 'Sign in to save your list', { size: 16, weight: 800 }) + button(240, 150, 110, 'Sign in', { variant: 'primary' }) + button(362, 150, 110, 'Close', { variant: 'secondary', focus: true });
  body += para(400, 268, 'Keeping focus inside an open dialog is expected. It passes because Close and the Escape key always let people leave.', { chars: 90, size: 14, fill: C.muted, anchor: 'middle' });
  add(s, 'modal-not-trap', 300, body);
}

// ---------- 2.5.3 Label in Name ----------
{
  const s = '2-5-3-label-in-name';
  let { body, a, b } = compare(W, 400, 'Name differs from label', 'Name contains the label');
  for (const [p, good] of [[a, false], [b, true]]) {
    const x = p.x + 24, w = p.w - 48;
    body += button(x, p.y + 80, 140, 'Search', { variant: 'primary' });
    body += code(x, p.y + 136, w, [[good ? 'aria-label="Search products"' : 'aria-label="Find items"', good ? '#b9e3b3' : '#f3b4ae']]);
    body += text(x, p.y + 208, 'Voice control user says:', { size: 13, weight: 700, fill: C.muted });
    body += speech(x, p.y + 218, w, '"Click Search"', good ? 'pass' : 'fail');
    body += text(x, p.y + 310, good ? 'Button pressed' : 'Nothing happens', { size: 13, weight: 700, fill: good ? C.pass : C.fail });
  }
  add(s, 'voice-control', 400, body);

  body = text(24, 40, 'Start the accessible name with the visible text', { size: 20, weight: 800 });
  const rows = [['Buy now', 'Buy now, 2-person tent', true], ['Buy now', '2-person tent, buy now', 'partial'], ['Buy now', 'Purchase', false]];
  rows.forEach(([vis, name, ok], i) => {
    const y = 70 + i * 74;
    body += button(24, y, 130, vis, { variant: 'secondary' });
    body += text(174, y + 24, `Accessible name: "${name}"`, { size: 15, weight: 600, mono: true });
    const k = ok === true ? 'pass' : ok === 'partial' ? 'info' : 'fail';
    body += mark(752, y + 19, k, 13);
    body += text(736, y + 24, ok === true ? 'Best' : ok === 'partial' ? 'Passes, not ideal' : 'Fails', { size: 13, weight: 700, fill: k === 'pass' ? C.pass : k === 'fail' ? C.fail : C.info, anchor: 'end' });
  });
  add(s, 'name-patterns', 300, body);
}

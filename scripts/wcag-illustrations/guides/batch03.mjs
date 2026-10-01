import { C, svg, text, para, compare, caption, box, field, button, lines, code, arrow, pill, mark } from '../kit.mjs';

const W = 800;
export const images = [];
const add = (slug, name, h, body) => images.push({ slug, name, svg: svg(W, h, body) });
const player = (x, y, w, h, { label = '', playing = false } = {}) => {
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#2b3240"/>`;
  out += `<circle cx="${x + w / 2}" cy="${y + h / 2 - 10}" r="22" fill="rgba(255,255,255,0.18)"/>`;
  out += playing ? `<rect x="${x + w / 2 - 8}" y="${y + h / 2 - 21}" width="6" height="22" fill="#fff"/><rect x="${x + w / 2 + 3}" y="${y + h / 2 - 21}" width="6" height="22" fill="#fff"/>` : `<path d="M${x + w / 2 - 7} ${y + h / 2 - 22}l18 12-18 12z" fill="#fff"/>`;
  out += `<rect x="${x + 12}" y="${y + h - 18}" width="${w - 24}" height="5" rx="2.5" fill="rgba(255,255,255,0.25)"/><rect x="${x + 12}" y="${y + h - 18}" width="${(w - 24) * 0.35}" height="5" rx="2.5" fill="#9fd19a"/>`;
  if (label) out += text(x + 14, y + 24, label, { size: 12, weight: 700, fill: '#e6e9ee' });
  return out;
};

// ---------- 1.2.1 Audio-only and Video-only (Prerecorded) ----------
{
  const s = '1-2-1-audio-only-and-video-only-prerecorded';
  let { body, a, b } = compare(W, 380, 'A podcast with no transcript', 'A podcast with a transcript');
  for (const [p, good] of [[a, false], [b, true]]) {
    const x = p.x + 24, w = p.w - 48;
    body += box(x, p.y + 72, w, 70, { fill: '#2b3240', stroke: '#2b3240', r: 12 });
    body += `<circle cx="${x + 36}" cy="${p.y + 107}" r="20" fill="#9fd19a"/><path d="M${x + 30} ${p.y + 96}l16 11-16 11z" fill="#2b3240"/>`;
    body += text(x + 68, p.y + 102, 'Episode 12: Choosing a tent', { size: 14, weight: 700, fill: '#fff' }) + text(x + 68, p.y + 122, '24 min · audio only', { size: 12, fill: '#c9ced7' });
    if (good) {
      body += text(x, p.y + 172, 'Transcript', { size: 14, weight: 800 }) + lines(x, p.y + 186, w, 4);
      body += text(x, p.y + 256, 'Download transcript (TXT)', { size: 13, weight: 600, fill: C.info });
    } else body += text(x, p.y + 186, 'No text version of the episode', { size: 13, fill: C.muted });
    body += caption(p.x + p.w / 2, p.y + 300, good ? 'Deaf and hard of hearing visitors can read every word' : 'People who cannot hear get nothing from the page', good ? 'pass' : 'fail');
  }
  add(s, 'podcast-transcript', 380, body);

  let t = compare(W, 380, 'A silent video, no description', 'A text or audio alternative');
  body = t.body;
  for (const [p, good] of [[t.a, false], [t.b, true]]) {
    const x = p.x + 24, w = p.w - 48;
    body += player(x, p.y + 70, w, 130, { label: 'How to pitch a tent (no sound)' });
    if (good) body += text(x, p.y + 226, 'What the video shows:', { size: 13, weight: 800 }) + para(x, p.y + 246, '1. Lay out the tent body. 2. Clip on the poles. 3. Stake each corner.', { chars: 44, size: 13 });
    body += caption(p.x + p.w / 2, p.y + 316, good ? 'Blind visitors get the same steps in text or narration' : 'Blind visitors cannot follow the steps', good ? 'pass' : 'fail');
  }
  add(s, 'video-only', 380, body);
}

// ---------- 1.2.2 Captions (Prerecorded) ----------
{
  const s = '1-2-2-captions-prerecorded';
  let { body, a, b } = compare(W, 400, 'No captions, or wrong ones', 'Accurate, complete captions');
  for (const [p, good] of [[a, false], [b, true]]) {
    const x = p.x + 24, w = p.w - 48;
    body += player(x, p.y + 70, w, 190, { playing: true });
    body += box(x + 20, p.y + 192, w - 40, good ? 46 : 28, { fill: 'rgba(0,0,0,0.78)', stroke: 'none', r: 4 });
    if (good) body += text(x + w / 2, p.y + 211, 'MAYA: The fly sheet goes on last.', { size: 13, weight: 600, fill: '#fff', anchor: 'middle' }) + text(x + w / 2, p.y + 230, '[rain hammering on the tent]', { size: 13, weight: 600, fill: '#fff', anchor: 'middle' });
    else body += text(x + w / 2, p.y + 211, 'the fly she goes on vast', { size: 13, weight: 600, fill: '#fff', anchor: 'middle' });
    body += caption(p.x + p.w / 2, p.y + 300, good ? 'Speaker names, accurate words and important sounds' : 'Unchecked auto-captions miss words, speakers and sounds', good ? 'pass' : 'fail');
  }
  add(s, 'captions', 400, body);

  body = text(24, 40, 'Add a caption file to the video element', { size: 20, weight: 800 });
  body += code(24, 64, 370, [['WEBVTT', '#9fd19a'], [''], ['00:00:04.000 --> 00:00:07.000'], ['<v Maya>The fly sheet goes on last.'], [''], ['00:00:07.500 --> 00:00:09.000'], ['[rain hammering on the tent]']]);
  body += code(410, 64, 366, [['<video controls>'], ['  <source src="tent.mp4"'], ['          type="video/mp4">'], ['  <track kind="captions"', '#b9e3b3'], ['         src="tent.en.vtt"', '#b9e3b3'], ['         srclang="en"', '#b9e3b3'], ['         label="English">', '#b9e3b3'], ['</video>']]);
  add(s, 'webvtt', 260, body);
}

// ---------- 1.2.3 Audio Description or Media Alternative (Prerecorded) ----------
{
  const s = '1-2-3-audio-description-or-media-alternative-prerecorded';
  let body = text(24, 40, 'Audio description fills the pauses with what is on screen', { size: 20, weight: 800 });
  const y = 80;
  body += box(24, y, 752, 44, { fill: C.soft, stroke: C.soft, r: 8 }) + text(36, y + 27, 'Dialogue', { size: 13, weight: 800, fill: C.muted });
  [[130, 230, 'Maya: "Ready?"'], [420, 560, 'Sam: "Let\'s go."']].forEach(([x1, x2, l]) => (body += box(x1, y + 8, x2 - x1, 28, { fill: '#cfd6e0', stroke: 'none', r: 6 }) + text(x1 + 10, y + 27, l, { size: 12, weight: 600 })));
  body += box(24, y + 60, 752, 44, { fill: C.passBg, stroke: C.passLine, r: 8 }) + text(36, y + 87, 'Description', { size: 13, weight: 800, fill: C.pass });
  [[240, 410, 'She zips the tent shut.'], [570, 760, 'They walk into the storm.']].forEach(([x1, x2, l]) => (body += box(x1, y + 68, x2 - x1, 28, { fill: '#cfe7c9', stroke: 'none', r: 6 }) + text(x1 + 10, y + 87, l, { size: 12, weight: 700, fill: C.pass })));
  body += `<path d="M24 ${y + 124}H776" stroke="${C.line}" stroke-width="1.5"/>`;
  ['0:00', '0:05', '0:10', '0:15'].forEach((t, i) => (body += text(24 + i * 245, y + 142, t, { size: 11, fill: C.muted })));
  body += para(400, y + 180, 'Narration describes actions, scene changes and on-screen text that the dialogue does not mention, without talking over it.', { chars: 96, size: 14, fill: C.muted, anchor: 'middle' });
  add(s, 'description-track', 290, body);

  body = text(24, 40, 'Two ways to meet 1.2.3', { size: 20, weight: 800 });
  const opt = (x, title, sub, rows) => box(x, 66, 364, 190, { fill: C.passBg, stroke: C.passLine, r: 12 }) + mark(x + 30, 100, 'pass', 13) + text(x + 52, 106, title, { size: 16, weight: 800, fill: C.pass }) + text(x + 22, 136, sub, { size: 13, fill: C.muted }) + rows.map((r, i) => text(x + 22, 168 + i * 24, '• ' + r, { size: 13 })).join('');
  body += opt(24, 'Audio description', 'Narration of key visuals', ['A described version of the video', 'Or a second, selectable audio track', 'Required again at Level AA (1.2.5)']);
  body += opt(412, 'Media alternative', 'A full text version', ['Dialogue and all key visual details', 'In the order they happen', 'Also helps deafblind users']);
  add(s, 'two-options', 280, body);
}

// ---------- 1.3.3 Sensory Characteristics ----------
{
  const s = '1-3-3-sensory-characteristics';
  let { body, a, b } = compare(W, 400, 'Instructions by shape and place', 'Instructions name the control');
  for (const [p, good] of [[a, false], [b, true]]) {
    const x = p.x + 24, w = p.w - 48;
    body += box(x, p.y + 72, w, 64, { fill: '#fff', stroke: C.line, r: 10 });
    body += para(x + 14, p.y + 98, good ? 'Select Continue to choose your delivery date.' : 'Click the round button on the right to continue.', { chars: 34, size: 14, weight: 600 });
    body += box(x, p.y + 156, w, 110, { fill: '#fff', stroke: C.line, r: 10 }) + lines(x + 16, p.y + 176, w * 0.5, 3);
    body += `<circle cx="${x + w - 52}" cy="${p.y + 211}" r="36" fill="${C.passMid}"/>` + text(x + w - 52, p.y + 216, good ? 'Continue' : '→', { size: good ? 11 : 20, weight: 800, fill: '#fff', anchor: 'middle' });
    body += caption(p.x + p.w / 2, p.y + 310, good ? 'Works when the layout changes or the page is read aloud' : '"Round" and "on the right" mean nothing to a screen reader or on a phone', good ? 'pass' : 'fail');
  }
  add(s, 'shape-location', 400, body);

  let t = compare(W, 340, 'A sound is the only cue', 'Sound plus a visible message');
  body = t.body;
  for (const [p, good] of [[t.a, false], [t.b, true]]) {
    const x = p.x + 24, w = p.w - 48;
    body += box(x, p.y + 72, w, 60, { fill: '#fff', stroke: C.line, r: 10 }) + text(x + 14, p.y + 108, good ? '"Start when the timer reaches zero."' : '"Start speaking after the beep."', { size: 13, weight: 600 });
    body += `<path d="M${x + 14} ${p.y + 160}h10l12-10v40l-12-10h-10z" fill="${C.muted}"/>` + text(x + 48, p.y + 178, 'beep', { size: 13, fill: C.muted });
    if (good) body += pill(x + 110, p.y + 160, 'Recording now', { fill: C.failBg, color: C.fail, size: 13 });
    body += caption(p.x + p.w / 2, p.y + 260, good ? 'Deaf users see when to start' : 'Deaf users never hear the cue', good ? 'pass' : 'fail');
  }
  add(s, 'sound-cue', 340, body);
}

// ---------- 1.4.2 Audio Control ----------
{
  const s = '1-4-2-audio-control';
  let { body, a, b } = compare(W, 400, 'Sound starts, no way to stop it', 'Pause and mute come first');
  for (const [p, good] of [[a, false], [b, true]]) {
    const x = p.x + 24, w = p.w - 48;
    if (good) body += button(x, p.y + 70, 150, 'Pause video', { variant: 'secondary', size: 13 }) + button(x + 162, p.y + 70, 110, 'Mute', { variant: 'secondary', size: 13 });
    body += player(x, p.y + (good ? 122 : 70), w, 140, { playing: true, label: 'Background video with sound' });
    const sy = p.y + (good ? 290 : 238);
    body += `<path d="M${x} ${sy}h10l12-10v40l-12-10h-10z" fill="${good ? C.passMid : C.failMid}"/>`;
    body += [0, 1, 2].map((i) => `<path d="M${x + 32 + i * 9} ${sy - 6 - i * 4}q${8 + i * 3} ${16 + i * 4} 0 ${32 + i * 8}" fill="none" stroke="${good ? C.passMid : C.failMid}" stroke-width="2.5"/>`).join('');
    body += text(x + 70, sy + 15, good ? 'Can be paused or muted' : 'Plays on and on', { size: 13, weight: 700, fill: good ? C.pass : C.fail });
    if (!good) body += caption(p.x + p.w / 2, p.y + 310, 'Screen reader speech is drowned out by the soundtrack', 'fail');
  }
  add(s, 'autoplay', 400, body);

  body = text(24, 40, 'The 3-second rule', { size: 20, weight: 800 });
  body += `<path d="M24 120H776" stroke="${C.line}" stroke-width="2"/>`;
  body += box(24, 96, 120, 48, { fill: C.passBg, stroke: C.passMid, sw: 2, r: 8 }) + text(84, 126, '≤ 3 s: OK', { size: 14, weight: 800, fill: C.pass, anchor: 'middle' });
  body += box(156, 96, 620, 48, { fill: C.failBg, stroke: C.failMid, sw: 2, r: 8 }) + text(466, 126, 'Over 3 seconds: needs pause, stop or its own volume control', { size: 14, weight: 800, fill: C.fail, anchor: 'middle' });
  body += para(400, 190, 'Best practice: never autoplay sound. Let people press play, which also avoids the problem entirely.', { chars: 96, size: 14, fill: C.muted, anchor: 'middle' });
  add(s, 'three-seconds', 230, body);
}

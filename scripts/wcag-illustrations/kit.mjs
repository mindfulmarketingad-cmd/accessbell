// Small SVG kit for the illustrations in the "WCAG Codes Explained" guides.
// Every drawing uses the same palette and shapes: a failing panel (red) next
// to a passing panel (green), simple UI parts (fields, buttons, text lines),
// code boxes and captions. Usage: npm run wcag-illustrations
export const C = {
  ink: '#1f2430', muted: '#5b6270', line: '#c7ccd4', soft: '#eef0f3',
  failBg: '#fdf0ef', failLine: '#f4c7c3', fail: '#b42318', failMid: '#d64545',
  passBg: '#f4f8f3', passLine: '#cfe1ce', pass: '#365c32', passMid: '#44723f',
  infoBg: '#eef4f8', infoLine: '#c9dce8', info: '#2f6272',
  focus: '#1f5fbf', code: '#1f2430', codeText: '#e6e9ee',
};
const FONT = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const MONO = "'SFMono-Regular', Menlo, Consolas, monospace";
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="${FONT}">\n<rect width="${w}" height="${h}" fill="#fff"/>\n${body}\n</svg>\n`;

export const text = (x, y, s, { size = 14, weight = 400, fill = C.ink, anchor = 'start', mono = false } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${mono ? ` font-family="${MONO}" xml:space="preserve"` : ''}>${esc(s)}</text>`;

/** Wrap text to lines of about `chars` characters. */
export function wrap(s, chars) {
  const out = [];
  let line = '';
  for (const word of String(s).split(/\s+/)) {
    if ((line + ' ' + word).trim().length > chars && line) {
      out.push(line);
      line = word;
    } else line = (line + ' ' + word).trim();
  }
  if (line) out.push(line);
  return out;
}
export const para = (x, y, s, { chars = 40, lh = 19, ...o } = {}) => wrap(s, chars).map((l, i) => text(x, y + i * lh, l, o)).join('\n');

const tick = (cx, cy) => `<path d="M${cx - 7} ${cy}l5 5 10-11" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
const cross = (cx, cy) => `<path d="M${cx - 6} ${cy - 6}l12 12M${cx + 6} ${cy - 6}l-12 12" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;
export const mark = (cx, cy, kind, r = 15) =>
  kind === 'pass'
    ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.passMid}"/>${tick(cx, cy)}`
    : kind === 'fail'
      ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.fail}"/>${cross(cx, cy)}`
      : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.info}"/><text x="${cx}" y="${cy + 5}" font-size="15" font-weight="800" fill="#fff" text-anchor="middle">i</text>`;

/** A titled panel. kind: fail | pass | info. */
export function panel(x, y, w, h, kind, title) {
  const bg = { fail: C.failBg, pass: C.passBg, info: C.infoBg }[kind];
  const ln = { fail: C.failLine, pass: C.passLine, info: C.infoLine }[kind];
  const tc = { fail: C.fail, pass: C.pass, info: C.info }[kind];
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${bg}" stroke="${ln}" stroke-width="2"/>
${mark(x + 34, y + 38, kind)}
${text(x + 58, y + 45, title, { size: Math.min(19, Math.floor((w - 74) / (title.length * 0.6))), weight: 700, fill: tc })}`;
}

/** Two side-by-side panels, failing then passing. Returns body and the inner boxes. */
export function compare(w, h, failTitle, passTitle, { top = 20, gap = 24, pad = 24 } = {}) {
  const pw = (w - pad * 2 - gap) / 2;
  const a = { x: pad, y: top, w: pw, h: h - top - 20 };
  const b = { x: pad + pw + gap, y: top, w: pw, h: h - top - 20 };
  return { body: panel(a.x, a.y, a.w, a.h, 'fail', failTitle) + '\n' + panel(b.x, b.y, b.w, b.h, 'pass', passTitle), a, b };
}

export const caption = (x, y, s, kind = 'fail', o = {}) =>
  para(x, y, s, { size: 14, weight: 700, fill: kind === 'pass' ? C.pass : kind === 'fail' ? C.fail : C.info, anchor: 'middle', chars: 42, ...o });

export const box = (x, y, w, h, { fill = '#fff', stroke = C.line, sw = 1.5, r = 8, dash } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

/** A form field with an optional label above and value inside. state: normal | error | focus */
export function field(x, y, w, label, { value = '', placeholder = '', state = 'normal', hint = '', h = 38 } = {}) {
  let out = '';
  let fy = y;
  if (label) {
    out += text(x, y, label, { size: 14, weight: 700 }) + '\n';
    fy = y + 8;
  }
  if (hint) {
    out += text(x, fy + 10, hint, { size: 12, fill: C.muted }) + '\n';
    fy += 18;
  }
  const stroke = state === 'error' ? C.failMid : state === 'focus' ? C.focus : C.line;
  out += box(x, fy, w, h, { stroke, sw: state === 'normal' ? 1.5 : 2.5 });
  if (state === 'focus') out += box(x - 4, fy - 4, w + 8, h + 8, { fill: 'none', stroke: C.focus, sw: 2, r: 11 });
  if (value) out += text(x + 12, fy + h / 2 + 5, value, { size: 14 });
  else if (placeholder) out += text(x + 12, fy + h / 2 + 5, placeholder, { size: 14, fill: '#9aa1ad' });
  return out;
}

/** A button. variant: primary | secondary | ghost. */
export function button(x, y, w, label, { h = 38, variant = 'primary', focus = false, size = 14 } = {}) {
  const fill = variant === 'primary' ? C.passMid : '#fff';
  const stroke = variant === 'primary' ? C.passMid : C.line;
  const tc = variant === 'primary' ? '#fff' : C.ink;
  let out = box(x, y, w, h, { fill, stroke, r: 8 }) + text(x + w / 2, y + h / 2 + 5, label, { size, weight: 700, fill: tc, anchor: 'middle' });
  if (focus) out += box(x - 4, y - 4, w + 8, h + 8, { fill: 'none', stroke: C.focus, sw: 3, r: 11 });
  return out;
}

/** Grey placeholder text lines. */
export const lines = (x, y, w, n, { gap = 14, h = 7, last = 0.6, fill = '#d5d9df' } = {}) =>
  Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * gap}" width="${i === n - 1 ? w * last : w}" height="${h}" rx="3.5" fill="${fill}"/>`).join('');

/** A dark code box with monospace lines. */
export function code(x, y, w, rows, { size = 13, lh = 20, pad = 14 } = {}) {
  const h = rows.length * lh + pad * 2 - 6;
  return (
    box(x, y, w, h, { fill: C.code, stroke: C.code, r: 10 }) +
    rows
      .map((r, i) => {
        const [s, col = C.codeText] = Array.isArray(r) ? r : [r];
        return text(x + pad, y + pad + 10 + i * lh, s, { size, fill: col, mono: true });
      })
      .join('')
  );
}

export const arrow = (x1, y1, x2, y2, color = C.muted) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hx = x2 - 10 * Math.cos(a - 0.45), hy = y2 - 10 * Math.sin(a - 0.45);
  const kx = x2 - 10 * Math.cos(a + 0.45), ky = y2 - 10 * Math.sin(a + 0.45);
  return `<path d="M${x1} ${y1}L${x2} ${y2}M${hx.toFixed(1)} ${hy.toFixed(1)}L${x2} ${y2}L${kx.toFixed(1)} ${ky.toFixed(1)}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
};

/** A small rounded label. */
export function pill(x, y, s, { fill = C.soft, color = C.ink, size = 12 } = {}) {
  const w = s.length * size * 0.62 + 20;
  return box(x, y, w, size + 12, { fill, stroke: fill, r: (size + 12) / 2 }) + text(x + w / 2, y + size + 3, s, { size, weight: 700, fill: color, anchor: 'middle' });
}

/** A browser window frame with a title bar; returns body and the content box. */
export function browser(x, y, w, h, url = 'example.com') {
  const bar = 34;
  return {
    body:
      box(x, y, w, h, { fill: '#fff', stroke: C.line, r: 12 }) +
      `<path d="M${x} ${y + bar}H${x + w}" stroke="${C.line}" stroke-width="1.5"/>` +
      [0, 1, 2].map((i) => `<circle cx="${x + 18 + i * 14}" cy="${y + 17}" r="4.5" fill="#d5d9df"/>`).join('') +
      box(x + 66, y + 8, Math.min(260, w - 90), 18, { fill: C.soft, stroke: C.soft, r: 9 }) +
      text(x + 76, y + 21, url, { size: 11, fill: C.muted }),
    inner: { x: x + 14, y: y + bar + 14, w: w - 28, h: h - bar - 28 },
  };
}

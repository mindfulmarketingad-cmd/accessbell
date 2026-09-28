// Dashboard charts drawn as inline SVG: the score donut and the scan history
// line chart. Every chart has a text alternative.
import { el, svg, fmtDate } from './core.js';

const BAND_COLOR = { high: '#44723f', mid: '#b7791f', low: '#c0392b', none: '#cfd4ce' };
const bandOf = (score) => (score === null || score === undefined ? 'none' : score >= 90 ? 'high' : score >= 60 ? 'mid' : 'low');

/** Donut showing a 0-100 score. */
export function scoreRing(score, { size = 148, label = true } = {}) {
  const stroke = Math.max(8, Math.round(size * 0.13));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = score === null || score === undefined ? 0 : Math.max(0, Math.min(100, score));
  const ring = svg('svg', { viewBox: `0 0 ${size} ${size}`, width: size, height: size, 'aria-hidden': 'true' }, [
    svg('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', stroke: '#e8ebe7', 'stroke-width': stroke }),
    svg('circle', {
      cx: size / 2,
      cy: size / 2,
      r,
      fill: 'none',
      stroke: BAND_COLOR[bandOf(score)],
      'stroke-width': stroke,
      'stroke-dasharray': `${((pct / 100) * c).toFixed(2)} ${c.toFixed(2)}`,
      transform: `rotate(-90 ${size / 2} ${size / 2})`,
    }),
  ]);
  const text = score === null || score === undefined ? 'n/a' : String(score);
  return el('div', { class: `ring ring-${size > 100 ? 'lg' : 'sm'}`, role: 'img', 'aria-label': score === null || score === undefined ? 'No score yet' : `Score ${score} out of 100` }, [
    ring,
    el('span', { class: 'ring-value', 'aria-hidden': 'true' }, [el('strong', { text }), label && score !== null && score !== undefined ? el('small', { text: 'score' }) : null]),
  ]);
}

export const SERIES = [
  { key: 'score', label: 'Score', color: '#44723f', max: () => 100 },
  { key: 'issues', label: 'Open issues', color: '#c0392b' },
  { key: 'pages', label: 'Pages scanned', color: '#4f6d9a' },
];

/**
 * Scan history: one point per day. Each series is scaled to its own range so
 * trends are comparable; the tooltip shows the real values.
 */
export function historyChart(points, { caption }) {
  const W = 640;
  const H = 240;
  const pad = { l: 12, r: 12, t: 14, b: 28 };
  const hidden = new Set();
  let active = points.length - 1;

  const wrap = el('div', { class: 'hchart' });
  const legend = el('div', { class: 'hchart-legend', role: 'group', 'aria-label': 'Show or hide lines' });
  const plot = el('div', { class: 'hchart-plot', tabindex: '0', role: 'img' });
  const tip = el('div', { class: 'hchart-tip', 'aria-hidden': 'true' });
  const table = el('table', {}, [
    el('caption', { text: caption }),
    el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'Day' }), ...SERIES.map((s) => el('th', { scope: 'col', text: s.label }))])]),
    el('tbody', {}, points.map((p) => el('tr', {}, [el('th', { scope: 'row', text: fmtDate(p.day) }), ...SERIES.map((s) => el('td', { text: String(p[s.key] ?? '') }))]))),
  ]);

  for (const s of SERIES) {
    const b = el('button', { type: 'button', class: 'hchart-key', 'aria-pressed': 'true' }, [el('i', { 'data-series': s.key }), s.label]);
    b.addEventListener('click', () => {
      if (hidden.has(s.key)) hidden.delete(s.key);
      else if (hidden.size < SERIES.length - 1) hidden.add(s.key);
      b.setAttribute('aria-pressed', String(!hidden.has(s.key)));
      draw();
    });
    legend.append(b);
  }

  const x = (i) => pad.l + (points.length === 1 ? (W - pad.l - pad.r) / 2 : (i / (points.length - 1)) * (W - pad.l - pad.r));
  const maxOf = (s) => (s.max ? s.max() : Math.max(1, ...points.map((p) => p[s.key] || 0)) * 1.15);
  const y = (s, v) => H - pad.b - ((v || 0) / maxOf(s)) * (H - pad.t - pad.b);

  function draw() {
    const node = svg('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none', 'aria-hidden': 'true' });
    for (let g = 0; g <= 4; g++) {
      const gy = pad.t + (g / 4) * (H - pad.t - pad.b);
      node.append(svg('line', { class: 'grid', x1: pad.l, x2: W - pad.r, y1: gy, y2: gy }));
    }
    const ticks = Math.min(6, points.length);
    for (let t = 0; t < ticks; t++) {
      const i = ticks === 1 ? 0 : Math.round((t / (ticks - 1)) * (points.length - 1));
      const label = new Date(points[i].day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      node.append(svg('text', { class: 'tick', x: x(i), y: H - 8, 'text-anchor': t === 0 ? 'start' : t === ticks - 1 ? 'end' : 'middle' }, [document.createTextNode(label)]));
    }
    node.append(svg('line', { class: 'cursor', x1: x(active), x2: x(active), y1: pad.t, y2: H - pad.b }));
    for (const s of SERIES) {
      if (hidden.has(s.key)) continue;
      const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(s, p[s.key]).toFixed(1)}`).join(' ');
      node.append(svg('path', { d, fill: 'none', stroke: s.color, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke' }));
      node.append(svg('circle', { cx: x(active), cy: y(s, points[active][s.key]), r: 4.5, fill: '#fff', stroke: s.color, 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' }));
    }
    plot.replaceChildren(node, tip);

    const p = points[active];
    tip.replaceChildren(
      el('strong', { text: fmtDate(p.day) }),
      ...SERIES.filter((s) => !hidden.has(s.key)).map((s) => el('span', {}, [el('i', { 'data-series': s.key }), `${s.label}: `, el('b', { text: String(p[s.key] ?? 0) })])),
    );
    const left = (x(active) / W) * 100;
    tip.classList.toggle('flip', left > 60);
    tip.style.setProperty('--x', `${left}%`);
    plot.setAttribute('aria-label', `${caption}. ${fmtDate(p.day)}: score ${p.score}, ${p.issues} open issues, ${p.pages} pages scanned. Use the arrow keys to move between days.`);
  }

  const pick = (clientX) => {
    const r = plot.getBoundingClientRect();
    const rel = ((clientX - r.left) / r.width) * W;
    let best = 0;
    points.forEach((_, i) => {
      if (Math.abs(x(i) - rel) < Math.abs(x(best) - rel)) best = i;
    });
    if (best !== active) {
      active = best;
      draw();
    }
  };
  plot.addEventListener('pointermove', (e) => pick(e.clientX));
  plot.addEventListener('keydown', (e) => {
    const next = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: points.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    active = Math.max(0, Math.min(points.length - 1, next));
    draw();
  });

  draw();
  // Tables ignore the visually-hidden sizing, so hide a wrapper instead.
  wrap.append(legend, plot, el('div', { class: 'visually-hidden' }, [table]));
  return wrap;
}

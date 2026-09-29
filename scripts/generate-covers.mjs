// Builds a featured image for every blog post:
//   public/blog/covers/<slug>.webp  1200x630 illustration shown on the post and blog cards
//   public/blog/og/<slug>.png       1200x630 social share image with the title
// Illustrations use the site's own icon artwork. Usage: npm run covers
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { ICONS } from '../src/lib/icons.js';
import { ACCESSIBILITY_ICONS } from '../src/data/accessibility-icons.js';
import { COVER_TOPICS, CATEGORY_THEMES } from '../src/data/blog-covers.js';

const root = resolve(import.meta.dirname, '..');
const blogDir = resolve(root, 'src/content/blog');
const coverDir = resolve(root, 'public/blog/covers');
const ogDir = resolve(root, 'public/blog/og');
mkdirSync(coverDir, { recursive: true });
mkdirSync(ogDir, { recursive: true });

const FONT = "'DejaVu Sans', 'Liberation Sans', Arial, sans-serif";
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const a11y = Object.fromEntries(ACCESSIBILITY_ICONS.map((i) => [i.slug, i.body]));

function frontmatter(md) {
  const fm = md.match(/^---\n([\s\S]*?)\n---/)[1];
  const get = (key) => {
    const line = (fm.match(new RegExp(`^${key}: (.*)$`, 'm')) || [])[1]?.trim() || '';
    if (line.startsWith("'")) return line.slice(1, -1).replace(/''/g, "'");
    if (line.startsWith('"')) return JSON.parse(line);
    return line;
  };
  return { title: get('title'), category: get('category') };
}

/** The topic icon, drawn at `size` px with its top-left corner at (x, y). */
function iconAt(topic, x, y, size, color) {
  if (topic.a11y) {
    const body = a11y[topic.a11y].replace(/currentColor/g, color);
    return `<g transform="translate(${x} ${y}) scale(${size / 48})" color="${color}">${body}</g>`;
  }
  return `<g transform="translate(${x} ${y}) scale(${size / 24})" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[topic.ui]}</g>`;
}

/** Soft background shapes, shifted per post so covers in a grid do not look identical. */
function backdrop(theme, seed) {
  const r = (n) => ((seed * 9301 + n * 49297) % 233280) / 233280;
  return `<rect width="1200" height="630" fill="${theme.bg}"/>
  <circle cx="${980 + r(1) * 120}" cy="${80 + r(2) * 80}" r="${190 + r(3) * 60}" fill="${theme.soft}"/>
  <circle cx="${120 + r(4) * 160}" cy="${560 + r(5) * 40}" r="${150 + r(6) * 60}" fill="${theme.soft}"/>
  <circle cx="${560 + r(7) * 200}" cy="${600}" r="${60 + r(8) * 40}" fill="${theme.soft}" opacity="0.7"/>`;
}

const pill = (x, y, text, theme) => {
  const w = Math.round(text.length * 13.6 + 48);
  return `<rect x="${x}" y="${y}" width="${w}" height="44" rx="22" fill="${theme.accent}"/>
  <text x="${x + w / 2}" y="${y + 29}" font-family="${FONT}" font-size="19" font-weight="700" fill="#fff" text-anchor="middle" letter-spacing="0.5">${esc(text.toUpperCase())}</text>`;
};

function wrap(text, maxChars) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if ((line + ' ' + word).trim().length > maxChars && line) {
      lines.push(line);
      line = word;
    } else line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);
  return lines;
}

function coverSvg(slug, meta, topic, theme, seed) {
  const big = topic.label.length <= 6;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  ${backdrop(theme, seed)}
  ${pill(64, 56, meta.category, theme)}
  <rect x="120" y="150" width="360" height="360" rx="48" fill="#fff"/>
  <rect x="120" y="150" width="360" height="360" rx="48" fill="none" stroke="${theme.line}" stroke-width="3"/>
  ${iconAt(topic, 180, 210, 240, theme.accent)}
  <text x="560" y="${big ? 360 : 330}" font-family="${FONT}" font-size="${big ? 150 : 68}" font-weight="800" fill="${theme.ink}" letter-spacing="-2">${esc(topic.label)}</text>
  <text x="562" y="${big ? 430 : 400}" font-family="${FONT}" font-size="34" font-weight="600" fill="${theme.muted}">${esc(topic.caption)}</text>
  <text x="64" y="590" font-family="${FONT}" font-size="24" font-weight="800" fill="${theme.ink}">Access<tspan fill="${theme.accent}">Bell</tspan></text>
</svg>`;
}

function ogSvg(slug, meta, topic, theme, seed) {
  const size = meta.title.length > 70 ? 46 : meta.title.length > 45 ? 54 : 62;
  const lines = wrap(meta.title, Math.floor(1300 / size));
  const lh = Math.round(size * 1.18);
  const top = 190 + Math.max(0, (4 - lines.length) * lh * 0.5);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  ${backdrop(theme, seed)}
  ${pill(64, 64, meta.category, theme)}
  ${lines.map((l, i) => `<text x="64" y="${top + i * lh}" font-family="${FONT}" font-size="${size}" font-weight="800" fill="${theme.ink}" letter-spacing="-1">${esc(l)}</text>`).join('\n  ')}
  <text x="64" y="574" font-family="${FONT}" font-size="28" font-weight="800" fill="${theme.ink}">Access<tspan fill="${theme.accent}">Bell</tspan></text>
  <text x="252" y="574" font-family="${FONT}" font-size="28" font-weight="600" fill="${theme.muted}">accessbell.co</text>
  <rect x="862" y="186" width="276" height="276" rx="40" fill="#fff"/>
  <rect x="862" y="186" width="276" height="276" rx="40" fill="none" stroke="${theme.line}" stroke-width="3"/>
  ${iconAt(topic, 910, 234, 180, theme.accent)}
</svg>`;
}

const slugs = readdirSync(blogDir).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)).sort();
const missing = slugs.filter((s) => !COVER_TOPICS[s]);
if (missing.length) {
  console.error(`Add a cover topic in src/data/blog-covers.js for: ${missing.join(', ')}`);
  process.exit(1);
}

for (const [i, slug] of slugs.entries()) {
  const meta = frontmatter(readFileSync(resolve(blogDir, `${slug}.md`), 'utf8'));
  const topic = COVER_TOPICS[slug];
  const theme = CATEGORY_THEMES[meta.category] || CATEGORY_THEMES.Guides;
  await sharp(Buffer.from(coverSvg(slug, meta, topic, theme, i + 1))).webp({ quality: 82 }).toFile(resolve(coverDir, `${slug}.webp`));
  await sharp(Buffer.from(ogSvg(slug, meta, topic, theme, i + 1))).png({ compressionLevel: 9, palette: true }).toFile(resolve(ogDir, `${slug}.png`));
}
console.log(`Wrote ${slugs.length} covers and social images.`);

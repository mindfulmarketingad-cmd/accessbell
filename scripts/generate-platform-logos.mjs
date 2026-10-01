// Writes public/platform-logos/<slug>.svg for every platform that has a logo in
// the open-source Simple Icons set (src/data/platform-logos.json maps slug -> icon).
// Platforms without an entry show a plain initial instead. Logos are trademarks
// of their owners and are used only to identify the platform.
// Usage: npm run logos
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as icons from 'simple-icons';
import { svgPathBbox } from 'svg-path-bbox';

const root = join(import.meta.dirname, '..');
const map = JSON.parse(readFileSync(join(root, 'src/data/platform-logos.json'), 'utf8'));
const out = join(root, 'public/platform-logos');
mkdirSync(out, { recursive: true });

for (const [slug, key] of Object.entries(map)) {
  const icon = icons[key];
  if (!icon) throw new Error(`simple-icons has no ${key} (for ${slug})`);
  // Crop to the artwork, so wide wordmarks and tall marks both fill the space they are shown in.
  const [x0, y0, x1, y1] = svgPathBbox(icon.path);
  const r = (n) => Math.round(n * 100) / 100;
  const pad = 0.2;
  const viewBox = [r(x0 - pad), r(y0 - pad), r(x1 - x0 + pad * 2), r(y1 - y0 + pad * 2)].join(' ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" fill="#${icon.hex}"><title>${icon.title}</title><path d="${icon.path}"/></svg>\n`;
  writeFileSync(join(out, `${slug}.svg`), svg);
}
console.log(`Wrote ${Object.keys(map).length} platform logos`);

// Writes every guide illustration to public/images/wcag/<criterion-slug>/<name>.svg.
// Each file in ./guides exports `images`: [{ slug, name, svg }].
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const here = import.meta.dirname;
const out = resolve(here, '../../public/images/wcag');
let n = 0;
for (const file of readdirSync(resolve(here, 'guides')).filter((f) => f.endsWith('.mjs')).sort()) {
  const { images } = await import(resolve(here, 'guides', file));
  for (const img of images) {
    mkdirSync(resolve(out, img.slug), { recursive: true });
    writeFileSync(resolve(out, img.slug, `${img.name}.svg`), img.svg);
    n++;
  }
}
console.log(`Wrote ${n} WCAG guide illustrations.`);

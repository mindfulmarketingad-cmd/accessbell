// After the build, wrap every table in blog and help articles in a labelled,
// keyboard-focusable scroll region, so wide tables scroll on small screens
// and keyboard users can scroll them too (WCAG 2.1.1).
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function wrapTables(html) {
  return html.replace(/<table>([\s\S]*?)<\/table>/g, (match, inner) => {
    const headers = [...inner.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].slice(0, 3).map((m) => strip(m[1]));
    const label = headers.length ? `Table: ${headers.join(', ')}` : 'Table';
    return `<div class="table-scroll" tabindex="0" role="region" aria-label="${escapeAttr(label)}">${match}</div>`;
  });
}

export default function accessibleTables() {
  return {
    name: 'accessible-tables',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        for (const section of ['blog', 'resources']) {
          const root = join(fileURLToPath(dir), section);
          let files = [];
          try {
            files = (await readdir(root, { recursive: true })).filter((f) => f.endsWith('.html'));
          } catch {
            continue;
          }
          for (const f of files) {
            const path = join(root, f);
            const html = await readFile(path, 'utf8');
            const out = wrapTables(html);
            if (out !== html) await writeFile(path, out);
          }
        }
      },
    },
  };
}

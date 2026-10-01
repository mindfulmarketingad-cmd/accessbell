// Adds a /blog/wcag-* -> /resources/wcag/* redirect to vercel.json for every
// WCAG Codes Explained guide that does not have one yet. Run after adding guides.
import fs from 'node:fs';
import { resolve } from 'node:path';
import { CRITERIA } from '../../server/wcag-criteria.js';

const root = resolve(import.meta.dirname, '../..');
const kebab = (s) => s.toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const ids = fs.readdirSync(resolve(root, 'src/content/blog')).map((f) => f.replace(/\.md$/, '')).filter((id) => /^wcag-\d+-\d+-\d+-/.test(id));
const file = resolve(root, 'vercel.json');
const v = JSON.parse(fs.readFileSync(file, 'utf8'));
const have = new Set(v.redirects.map((r) => r.source));
const added = [];
for (const id of ids) {
  if (have.has(`/blog/${id}`)) continue;
  const sc = id.match(/^wcag-(\d+)-(\d+)-(\d+)-/).slice(1).join('.');
  added.push({ source: `/blog/${id}`, destination: `/resources/wcag/${sc.replace(/\./g, '-')}-${kebab(CRITERIA[sc].name)}`, permanent: true });
}
v.redirects = [...added, ...v.redirects];
fs.writeFileSync(file, JSON.stringify(v, null, 2) + '\n');
console.log(`Added ${added.length} guide redirects.`);

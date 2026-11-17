// Link the first descriptive mention of each WCAG success criterion in markdown
// to its library page. Bare numbers are left alone. Existing links, code and
// front matter are left alone. A guide does not link to the criterion it is.
//
// Usage: node scripts/link-wcag-mentions.mjs [--write]
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { CRITERIA } from '../server/wcag-criteria.js';

const kebab = (s) => s.toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const write = process.argv.includes('--write');

const CRITERION_LIST = Object.values(CRITERIA).map((c) => ({
  sc: c.sc,
  name: c.name,
  href: `/resources/wcag/${c.sc.replace(/\./g, '-')}-${kebab(c.name)}`,
  re: new RegExp(`(?:\\bWCAG\\s+${esc(c.sc)}|\\b${esc(c.sc)})(?!\\d)(?:\\s+${esc(c.name)})?`, 'i'),
}));

const files = (dir) => readdirSync(dir).flatMap((f) => {
  const path = join(dir, f);
  return statSync(path).isDirectory() ? files(path) : path.endsWith('.md') ? [path] : [];
});

function linkMentions(markdown, selfSc) {
  const fence = [];
  const mask = (text, re) => text.replace(re, (m) => `\u0000${fence.push(m) - 1}\u0000`);
  let body = markdown;
  const front = body.match(/^---\n[\s\S]*?\n---\n/);
  const head = front ? front[0] : '';
  body = front ? body.slice(head.length) : body;
  body = mask(body, /```[\s\S]*?```/g);
  body = mask(body, /`[^`\n]+`/g);
  body = mask(body, /<[^>]+>/g);
  body = mask(body, /!\[[^\]]*\]\([^)]*\)/g);
  body = mask(body, /\[[^\]]*\]\([^)]*\)/g);

  let added = 0;
  for (const c of CRITERION_LIST) {
    if (c.sc === selfSc) continue;
    if (markdown.includes(`](${c.href})`) || markdown.includes(`](${c.href} `)) continue;
    const m = c.re.exec(body);
    if (!m) continue;
    const raw = m[0];
    const descriptive = /^wcag\s/i.test(raw) || raw.length > c.sc.length + 1;
    if (!descriptive) continue;
    const hasName = raw.toLowerCase().includes(c.name.toLowerCase());
    const label = hasName ? raw : `WCAG ${c.sc} ${c.name}`;
    body = body.slice(0, m.index) + `[${label}](${c.href})` + body.slice(m.index + raw.length);
    added++;
  }
  // Masks can nest (inline code inside a link), so restore until no tokens remain.
  let restored = body;
  for (let i = 0; i < 6; i++) {
    const next = restored.replace(/\u0000(\d+)\u0000/g, (_, n) => fence[Number(n)]);
    if (next === restored) break;
    restored = next;
  }
  if (restored.includes('\u0000')) throw new Error('unmask failed');
  return { markdown: head + restored, added };
}

let total = 0;
let touched = 0;
for (const path of [...files('src/content/blog'), ...files('src/content/help')]) {
  const self = (path.match(/wcag-(\d+)-(\d+)-(\d+)-/) || []).slice(1).join('.');
  const original = readFileSync(path, 'utf8');
  const { markdown, added } = linkMentions(original, self);
  if (!added || markdown === original) continue;
  touched++;
  total += added;
  console.log(`${added}\t${path}`);
  if (write) writeFileSync(path, markdown);
}
console.log(`${total} links in ${touched} files${write ? '' : ' (dry run)'}`);

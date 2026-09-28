// Regenerates raster brand assets from the SVG mark.
// Usage: node scripts/generate-assets.mjs  (needs Playwright + Chromium available)
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require(resolve(process.execPath, '../../lib/node_modules/playwright')));
}

const root = resolve(import.meta.dirname, '..');
const out = (p) => resolve(root, 'public', p);
const mark = readFileSync(out('favicon.svg'), 'utf8');
const fontDir = resolve(root, 'node_modules/@fontsource-variable/inter/files');
const font = readFileSync(resolve(fontDir, 'inter-latin-wght-normal.woff2')).toString('base64');
const fontFace = `@font-face{font-family:Inter;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:100 900}`;

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });

async function shot(html, width, height, file, transparent = false) {
  await page.setViewportSize({ width, height });
  await page.setContent(`<!doctype html><html><head><style>${fontFace}html,body{margin:0;padding:0}</style></head><body>${html}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.screenshot({ type: 'png', omitBackground: transparent, clip: { x: 0, y: 0, width, height } });
  if (file) writeFileSync(out(file), buf);
  return buf;
}

const markAt = (size, pad = 0) =>
  `<div style="width:${size}px;height:${size}px;display:grid;place-items:center">${mark.replace('<svg ', `<svg width="${size - pad * 2}" height="${size - pad * 2}" `)}</div>`;

// Square icons (full-bleed tile)
const png16 = await shot(markAt(16), 16, 16, null, true);
const png32 = await shot(markAt(32), 32, 32, null, true);
const png48 = await shot(markAt(48), 48, 48, null, true);
await shot(markAt(192), 192, 192, 'icon-192.png', true);
await shot(markAt(512), 512, 512, 'icon-512.png', true);
await shot(markAt(512), 512, 512, 'logo.png', true);
// Apple touch icons are shown on a white background with their own rounding
await shot(`<div style="background:#353A47">${markAt(180, 0)}</div>`, 180, 180, 'apple-touch-icon.png');

// favicon.ico containing PNG-encoded 16, 32 and 48 px images
const images = [
  [16, png16],
  [32, png32],
  [48, png48],
];
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = 6 + 16 * images.length;
const entries = images.map(([size, data]) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(size, 0);
  e.writeUInt8(size, 1);
  e.writeUInt8(0, 2);
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(data.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += data.length;
  return e;
});
writeFileSync(out('favicon.ico'), Buffer.concat([header, ...entries, ...images.map(([, d]) => d)]));

// Horizontal logo lockup
const lockup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 48" width="220" height="48" role="img" aria-label="AccessBell">
  <g transform="translate(0 4) scale(1.25)">${mark.replace(/^<svg[^>]*>|<\/svg>\s*$/g, '')}</g>
  <text x="52" y="33" font-family="Inter, 'Segoe UI', Roboto, Arial, sans-serif" font-size="26" font-weight="700" letter-spacing="-0.5" fill="#22262F">Access<tspan fill="#44723F">Bell</tspan></text>
</svg>
`;
writeFileSync(out('logo.svg'), lockup);

// Open Graph image
const og = `
<div style="width:1200px;height:630px;box-sizing:border-box;padding:80px 88px;font-family:Inter;color:#fff;
  background:radial-gradient(70% 90% at 100% 0%, rgba(132,176,130,.45), transparent 60%), linear-gradient(135deg,#2A2E38,#353A47);
  display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden">
  <div style="position:absolute;inset:0;background-image:linear-gradient(to right,rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.05) 1px,transparent 1px);background-size:56px 56px"></div>
  <div style="display:flex;align-items:center;gap:18px;position:relative">
    ${mark.replace('<svg ', '<svg width="64" height="64" style="border-radius:14px;box-shadow:0 0 0 2px rgba(132,176,130,.6)" ')}
    <span style="font-size:40px;font-weight:700;letter-spacing:-1px">Access<span style="color:#84B082">Bell</span></span>
  </div>
  <div style="position:relative">
    <div style="font-size:26px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#84B082;margin-bottom:18px">Website Accessibility Checker</div>
    <div style="font-size:68px;font-weight:700;line-height:1.08;letter-spacing:-2px;max-width:960px">Find out if your website is accessible and compliant</div>
  </div>
  <div style="display:flex;gap:14px;position:relative;font-size:22px;font-weight:600">
    ${['WCAG 2.2', 'ADA', 'Section 508', 'EN 301 549'].map((s) => `<span style="padding:10px 20px;border:1px solid rgba(255,255,255,.3);border-radius:999px;color:#E6E9EE">${s}</span>`).join('')}
    <span style="margin-left:auto;color:#C9CED7;align-self:center">accessbell.co</span>
  </div>
</div>`;
await shot(og, 1200, 630, 'og-default.png');

await browser.close();
console.log('assets written');

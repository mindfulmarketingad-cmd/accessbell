// Builds the downloadable Free Accessibility Icon Set from
// src/data/accessibility-icons.js: one SVG and one 512 px PNG per icon, plus
// a ZIP of each format. Usage: npm run icons
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { deflateRawSync, crc32 } from 'node:zlib';
import sharp from 'sharp';
import { ACCESSIBILITY_ICONS, ICON_SET, iconSvg } from '../src/data/accessibility-icons.js';

const COLOR = '#1f3a2d';
const PNG_SIZE = 512;
const root = resolve(import.meta.dirname, '..', 'public', ICON_SET.basePath.replace(/^\//, ''));

const LICENSE = `${ICON_SET.name}
https://www.accessbell.co/tools/free-accessibility-icon-set

Licensed under ${ICON_SET.license}: ${ICON_SET.licenseUrl}
You may use, change and share these icons, including commercially, as long as
you credit "Accessibility icons by AccessBell (accessbell.co)".
`;

/** Minimal ZIP writer (deflate), enough for a handful of small files. */
function zip(files) {
  const local = [];
  const central = [];
  let offset = 0;
  for (const { name, data } of files) {
    const nameBuf = Buffer.from(name);
    const deflated = deflateRawSync(data);
    const crc = crc32(data);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0, 6);
    header.writeUInt16LE(8, 8);
    header.writeUInt32LE(0, 10);
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(deflated.length, 18);
    header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(nameBuf.length, 26);
    header.writeUInt16LE(0, 28);
    local.push(header, nameBuf, deflated);
    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(20, 4);
    entry.writeUInt16LE(20, 6);
    entry.writeUInt16LE(0, 8);
    entry.writeUInt16LE(8, 10);
    entry.writeUInt32LE(0, 12);
    entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(deflated.length, 20);
    entry.writeUInt32LE(data.length, 24);
    entry.writeUInt16LE(nameBuf.length, 28);
    entry.writeUInt32LE(offset, 42);
    central.push(entry, nameBuf);
    offset += 30 + nameBuf.length + deflated.length;
  }
  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, centralBuf, end]);
}

rmSync(root, { recursive: true, force: true });
mkdirSync(resolve(root, 'svg'), { recursive: true });
mkdirSync(resolve(root, 'png'), { recursive: true });

const svgFiles = [];
const pngFiles = [];
for (const icon of ACCESSIBILITY_ICONS) {
  const svg = Buffer.from(iconSvg(icon, COLOR));
  const png = await sharp(svg, { density: (72 * PNG_SIZE) / 48 }).resize(PNG_SIZE, PNG_SIZE).png().toBuffer();
  writeFileSync(resolve(root, 'svg', `${icon.slug}.svg`), svg);
  writeFileSync(resolve(root, 'png', `${icon.slug}.png`), png);
  svgFiles.push({ name: `accessbell-accessibility-icons-svg/${icon.slug}.svg`, data: svg });
  pngFiles.push({ name: `accessbell-accessibility-icons-png/${icon.slug}.png`, data: png });
}
const license = { data: Buffer.from(LICENSE) };
writeFileSync(resolve(root, ICON_SET.svgZip), zip([...svgFiles, { name: 'accessbell-accessibility-icons-svg/LICENSE.txt', ...license }]));
writeFileSync(resolve(root, ICON_SET.pngZip), zip([...pngFiles, { name: 'accessbell-accessibility-icons-png/LICENSE.txt', ...license }]));
console.log(`${ACCESSIBILITY_ICONS.length} icons written to ${root}`);

// Renders public/demo/accessbell-demo.{mp4,webm} and the poster from demo.html.
// Each frame is drawn with window.render(t) and captured, so timing is exact.
// Needs ffmpeg on PATH (or FFMPEG=/path/to/ffmpeg). Usage: node scripts/demo-video/render.mjs
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright-core';

const here = import.meta.dirname;
const out = resolve(here, '../../public/demo');
const ffmpeg = process.env.FFMPEG || 'ffmpeg';
const FPS = 30;
const frames = await mkdtemp(join(tmpdir(), 'ab-demo-'));

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
await page.goto(`file://${join(here, 'demo.html')}`);
await page.evaluate(() => document.fonts.ready);
const total = Math.round((await page.evaluate(() => window.DURATION)) * FPS);
for (let i = 0; i < total; i++) {
  await page.evaluate((t) => window.render(t), i / FPS);
  await page.screenshot({ path: join(frames, `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 95 });
}
await browser.close();

const input = ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(frames, 'f%05d.jpg')];
execFileSync(ffmpeg, [...input, '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-tune', 'animation', '-movflags', '+faststart', join(out, 'accessbell-demo.mp4')]);
execFileSync(ffmpeg, [...input, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36', '-row-mt', '1', '-pix_fmt', 'yuv420p', join(out, 'accessbell-demo.webm')]);
execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', join(frames, 'f00690.jpg'), '-vf', 'scale=1280:-1', '-q:v', '4', join(out, 'accessbell-demo-poster.jpg')]);
await rm(frames, { recursive: true });
console.log(`Rendered ${total} frames to ${out}`);

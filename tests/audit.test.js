import { test } from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../server/audit.js';

const ids = (r) => r.issues.map((i) => i.id).sort();

const GOOD = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Good page</title></head>
<body><a href="#main">Skip to content</a><main id="main"><h1>Welcome</h1><h2>Section</h2>
<img src="a.png" alt="Company logo"><img src="d.png" alt="">
<form><label for="e">Email</label><input id="e" type="email"><label>Name <input type="text"></label>
<button type="submit">Send</button><input type="submit"></form>
<a href="/pricing">See pricing plans</a><a href="/x"><svg role="img" aria-label="Home"></svg></a>
<iframe src="/map" title="Office map"></iframe></main></body></html>`;

test('a well-built page has no issues and a perfect score', () => {
  const r = audit(GOOD);
  assert.deepEqual(ids(r), []);
  assert.equal(r.score, 100);
  assert.ok(r.passes.length >= 8);
});

test('detects the common failures', () => {
  const html = `<html><head><meta name="viewport" content="width=device-width, user-scalable=no"><meta http-equiv="refresh" content="5"></head>
  <body><img src="x.png"><input type="text" placeholder="Search"><button><svg></svg></button>
  <a href="/a"></a><a href="/b">Click here</a><h2></h2><h2>Ok</h2><h4>Skip</h4>
  <iframe src="/f"></iframe><div tabindex="3">x</div><div role="buton">x</div><marquee>hi</marquee>
  <video autoplay src="v.mp4"></video><table><tr><td>a</td></tr><tr><td>b</td></tr></table></body></html>`;
  const r = audit(html);
  for (const id of [
    'html-lang', 'document-title', 'image-alt', 'form-label', 'button-name', 'link-name', 'link-purpose',
    'empty-heading', 'page-has-h1', 'heading-order', 'meta-viewport', 'frame-title', 'tabindex', 'meta-refresh',
    'media-autoplay', 'bypass', 'aria-valid-role', 'blink-marquee', 'table-headers',
  ]) {
    assert.ok(ids(r).includes(id), `expected ${id}`);
  }
  assert.ok(r.score < 30);
  assert.equal(r.issues[0].impact, 'critical', 'issues are sorted by impact');
});

test('hidden content is ignored', () => {
  const r = audit('<html lang="en"><head><title>t</title></head><body><main><h1>x</h1><div hidden><img src="a"></div><span aria-hidden="true"><img src="b"></span></main></body></html>');
  assert.deepEqual(ids(r), []);
});

test('aria-hidden on body hides the whole page, including its h1', () => {
  const r = audit('<html lang="en"><head><title>t</title></head><body aria-hidden="true"><main><h1>x</h1></main></body></html>');
  assert.deepEqual(ids(r), ['aria-hidden-body', 'page-has-h1']);
});

test('duplicate ids referenced by labels are reported', () => {
  const r = audit('<html lang="en"><head><title>t</title></head><body><main><h1>x</h1><label for="a">A</label><input id="a"><span id="a"></span></main></body></html>');
  assert.ok(ids(r).includes('duplicate-id-aria'));
});

test('snippets are truncated and samples capped at three', () => {
  const imgs = Array.from({ length: 6 }, (_, i) => `<img src="${'x'.repeat(200)}${i}.png">`).join('');
  const r = audit(`<html lang="en"><head><title>t</title></head><body><main><h1>x</h1>${imgs}</main></body></html>`);
  const issue = r.issues.find((i) => i.id === 'image-alt');
  assert.equal(issue.count, 6);
  assert.equal(issue.samples.length, 3);
  assert.ok(issue.samples.every((s) => s.length <= 220));
});

test('unknown standard falls back to WCAG 2.2', () => {
  assert.equal(audit(GOOD, { standard: 'nope' }).standard.id, 'wcag22');
  assert.match(audit(GOOD, { standard: 'section508' }).notes.join(' '), /WCAG 2\.0/);
});

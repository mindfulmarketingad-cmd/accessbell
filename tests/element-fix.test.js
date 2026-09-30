// Corrected markup for failed elements, used to fix issues in code without AccessBellFix.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { correctedHtml, setAttr, canFixInCode } from '../src/scripts/shared/element-fix.js';

test('adds or replaces one attribute on the opening tag', () => {
  assert.equal(correctedHtml('image-alt', '<img src="/hero.jpg" class="hero">', 'A tent by a lake'), '<img src="/hero.jpg" class="hero" alt="A tent by a lake">');
  assert.equal(correctedHtml('image-alt', '<img src="a.png" alt="">', 'Logo'), '<img src="a.png" alt="Logo">');
  assert.equal(correctedHtml('image-alt', '<img src="a.png" alt>', 'Logo'), '<img src="a.png" alt="Logo">');
  assert.equal(correctedHtml('image-alt', '<img src="a.png"/>', 'Logo'), '<img src="a.png" alt="Logo"/>');
  assert.equal(correctedHtml('button-name', '<button class="nav__toggle" aria-expanded="false"></button>', 'Open menu'), '<button class="nav__toggle" aria-expanded="false" aria-label="Open menu"></button>');
  assert.equal(correctedHtml('link-name', '<a href="https://x.com"><svg></svg></a>', 'X (Twitter)'), '<a href="https://x.com" aria-label="X (Twitter)"><svg></svg></a>');
});

test('escapes the text and falls back to a prompt when empty', () => {
  assert.equal(correctedHtml('image-alt', '<img src="a.png">', 'He said "hi" <b>'), '<img src="a.png" alt="He said &quot;hi&quot; &lt;b>">');
  assert.equal(correctedHtml('image-alt', '<img src="a.png">', ''), '<img src="a.png" alt="Describe the image">');
});

test('labels form fields, reusing an existing id', () => {
  assert.equal(correctedHtml('label', '<input type="email" id="news-email">', 'Email address'), '<label for="news-email">Email address</label>\n<input type="email" id="news-email">');
  const out = correctedHtml('label', '<input type="email" class="newsletter">', 'Email address');
  const id = /id="([^"]+)"/.exec(out)[1];
  assert.match(out, new RegExp(`^<label for="${id}">Email address</label>\\n<input type="email" class="newsletter" id="${id}">$`));
});

test('the page language is set on the html tag', () => {
  assert.equal(correctedHtml('html-has-lang', '<html class="no-js"><head>...', 'en'), '<html class="no-js" lang="en">');
  assert.equal(correctedHtml('html-lang-valid', '<html lang="english">', 'en'), '<html lang="en">');
});

test('rules that need design or content changes are not rewritten', () => {
  assert.equal(canFixInCode('color-contrast'), false);
  assert.equal(correctedHtml('color-contrast', '<p class="x">Hi</p>', 'x'), null);
  assert.equal(setAttr('not html', 'alt', 'x'), null);
});

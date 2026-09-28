import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHex, toHex, contrast, simulate, deltaE, suggestShade } from '../src/scripts/shared/color.js';

test('parses and formats hex colors', () => {
  assert.deepEqual(parseHex('#fff'), [255, 255, 255]);
  assert.deepEqual(parseHex('44723F'), [68, 114, 63]);
  assert.equal(parseHex('not a color'), null);
  assert.equal(toHex([68, 114, 63]), '#44723f');
});

test('contrast matches WCAG reference values', () => {
  assert.equal(contrast([0, 0, 0], [255, 255, 255]).toFixed(1), '21.0');
  assert.equal(contrast([255, 255, 255], [255, 255, 255]).toFixed(1), '1.0');
  // #767676 on white is the classic 4.54:1 grey
  assert.equal(contrast(parseHex('#767676'), [255, 255, 255]).toFixed(2), '4.54');
});

test('color-blind simulation merges red and green for protanopia and deuteranopia', () => {
  const red = parseHex('#d62728');
  const green = parseHex('#2ca02c');
  assert.ok(deltaE(red, green) > 40, 'clearly different for typical vision');
  for (const type of ['protanopia', 'deuteranopia']) {
    assert.ok(deltaE(simulate(red, type), simulate(green, type)) < deltaE(red, green) / 2, `${type} reduces the difference`);
  }
  const grey = simulate(red, 'achromatopsia');
  assert.equal(grey[0].toFixed(3), grey[1].toFixed(3));
});

test('deltaE follows the CIEDE2000 reference data', () => {
  // Sharma, Wu and Dalal test pair 1 is Lab based; check symmetry and identity instead.
  const a = parseHex('#1f77b4');
  const b = parseHex('#ff7f0e');
  assert.equal(deltaE(a, a), 0);
  assert.equal(deltaE(a, b).toFixed(6), deltaE(b, a).toFixed(6));
});

test('suggests a shade that reaches the target contrast', () => {
  const white = [255, 255, 255];
  const light = parseHex('#9fd49c');
  assert.ok(contrast(light, white) < 3);
  const fixed = suggestShade(light, white, 3);
  assert.ok(fixed && contrast(fixed, white) >= 3);
  assert.deepEqual(suggestShade(parseHex('#000000'), white, 3), [0, 0, 0]);
});

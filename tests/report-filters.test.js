import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CRITERIA, withinTarget } from '../server/wcag-criteria.js';
import { matches, scopeOf } from '../src/scripts/shared/report-view.js';

const all = new Set(['critical', 'serious', 'moderate', 'minor']);
const f = (over = {}) => ({ version: '2.2', level: 'AA', principle: '', sc: '', impacts: all, ...over });
const issue = (sc, impact = 'serious') => ({ impact, wcag: [{ sc }] });

test('criteria table matches the WCAG 2.2 counts', () => {
  const list = Object.values(CRITERIA);
  assert.equal(list.length, 87);
  assert.equal(list.filter((c) => c.version === '2.1').length, 17);
  assert.equal(list.filter((c) => c.version === '2.2').length, 9);
  assert.equal(CRITERIA['2.5.8'].level, 'AA');
  assert.equal(CRITERIA['1.4.11'].principle, 'Perceivable');
});

test('version and level targets are cumulative', () => {
  assert.equal(withinTarget(CRITERIA['1.4.3'], '2.1', 'AA'), true);
  assert.equal(withinTarget(CRITERIA['2.5.8'], '2.1', 'AA'), false, '2.2 criterion excluded from 2.1');
  assert.equal(withinTarget(CRITERIA['1.4.6'], '2.2', 'AA'), false, 'AAA excluded from AA');
  assert.equal(withinTarget(CRITERIA['1.1.1'], '2.0', 'A'), true);
});

test('issues filter by version, level, criterion, principle and severity', () => {
  assert.equal(matches(issue('2.5.8'), f({ version: '2.1' })), false);
  assert.equal(matches(issue('1.4.11'), f({ version: '2.1' })), true);
  assert.equal(matches(issue('1.4.3'), f({ level: 'A' })), false);
  assert.equal(matches(issue('1.4.3'), f({ sc: '1.4.3' })), true);
  assert.equal(matches(issue('1.1.1'), f({ sc: '1.4.3' })), false);
  assert.equal(matches(issue('2.5.8'), f({ principle: 'Operable' })), true);
  assert.equal(matches(issue('1.1.1'), f({ principle: 'Operable' })), false);
  assert.equal(matches(issue('1.1.1', 'minor'), f({ impacts: new Set(['critical']) })), false);
  assert.equal(matches(issue('1.1.1', 'minor'), f({ impacts: new Set(['critical']) }), { useImpact: false }), true);
});

test('scan scope is read from free-scan ids and stored labels', () => {
  assert.deepEqual(scopeOf({ id: 'wcag21', label: 'WCAG 2.1 Level AA' }), { version: '2.1', level: 'AA' });
  assert.deepEqual(scopeOf({ id: 'section508', label: 'Section 508 (WCAG 2.0 AA)' }), { version: '2.0', level: 'AA' });
  assert.deepEqual(scopeOf({ id: 'wcag22-AAA', label: 'WCAG 2.2 Level AAA' }), { version: '2.2', level: 'AAA' });
  assert.deepEqual(scopeOf('WCAG 2.1 Level A'), { version: '2.1', level: 'A' });
});

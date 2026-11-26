import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeRamp, formatLength } from '../src/scripts/ramp-calculator.js';

test('a 24 inch rise at 1:12 needs 24 feet, one run and handrails', () => {
  const r = computeRamp({ rise: 24 });
  assert.equal(r.ok, true);
  assert.equal(r.minimumRun, '288 in (24 ft)');
  assert.equal(r.runs, '1');
  assert.equal(r.intermediate, '0');
  assert.equal(r.landings, '2');
  assert.equal(r.landingEach, '60 in (5 ft) minimum');
  assert.equal(r.totalLength, '408 in (34 ft)');
  assert.equal(r.handrails, true);
  assert.equal(r.slope, null);
  assert.match(r.summary, /minimum run at 1:12 is 288 in/);
  assert.match(r.summary, /needs handrails on both sides/);
});

test('a 6 inch rise does not require handrails', () => {
  const r = computeRamp({ rise: 6 });
  assert.equal(r.handrails, false);
  assert.equal(r.minimumRun, '72 in (6 ft)');
  assert.equal(r.runs, '1');
  assert.match(r.handrailText, /not required by section 405\.8/);
});

test('a rise just over 6 inches requires handrails', () => {
  const r = computeRamp({ rise: 6.1 });
  assert.equal(r.handrails, true);
  assert.equal(r.runs, '1');
});

test('a rise over 30 inches splits into runs with an intermediate landing', () => {
  const at30 = computeRamp({ rise: 30 });
  assert.equal(at30.runs, '1');
  assert.equal(at30.intermediate, '0');
  assert.equal(at30.minimumRun, '360 in (30 ft)');

  const over = computeRamp({ rise: 30.1 });
  assert.equal(over.runs, '2');
  assert.equal(over.intermediate, '1');
  assert.equal(over.landings, '3');
  assert.equal(over.handrails, true);

  const two = computeRamp({ rise: 36 });
  assert.equal(two.runs, '2');
  assert.equal(two.minimumRun, '432 in (36 ft)');
  assert.equal(two.perRun, '18 in (1 ft 6 in)');
  assert.equal(two.landingTotal, '180 in (15 ft)');
  assert.equal(two.totalLength, '612 in (51 ft)');
});

test('an entered run is checked against 1:12, 1:20 and Table 405.2', () => {
  const exact = computeRamp({ rise: 24, run: 288 });
  assert.equal(exact.slope.state, 'pass');
  assert.equal(exact.slope.tag, 'Meets 1:12');

  const gentle = computeRamp({ rise: 24, run: 480 });
  assert.equal(gentle.slope.state, 'walk');
  assert.equal(gentle.slope.tag, 'Walking surface');

  const shortSteep = computeRamp({ rise: 6, run: 60 });
  assert.equal(shortSteep.slope.state, 'existing');
  assert.equal(shortSteep.slope.tag, 'Existing site only');

  const tallSteep = computeRamp({ rise: 24, run: 240 });
  assert.equal(tallSteep.slope.tag, 'Steeper than 1:12');
  assert.match(tallSteep.slope.text, /taller than 6 inches/);

  const threeInch = computeRamp({ rise: 3, run: 24 });
  assert.equal(threeInch.slope.tag, 'Existing site only');

  const tooSteep = computeRamp({ rise: 24, run: 180 });
  assert.equal(tooSteep.slope.state, 'fail');
  assert.equal(tooSteep.slope.tag, 'Not permitted');
});

test('cross slope passes at 1:48 and fails when steeper', () => {
  assert.equal(computeRamp({ rise: 24, cross: 48 }).cross.tag, 'Meets 1:48');
  assert.equal(computeRamp({ rise: 24, cross: 96 }).cross.state, 'pass');
  const fail = computeRamp({ rise: 24, cross: 47 });
  assert.equal(fail.cross.state, 'fail');
  assert.match(fail.summary, /Steeper than 1:48/);
});

test('blank and invalid measurements are rejected', () => {
  assert.equal(computeRamp({}).ok, false);
  assert.equal(computeRamp({ rise: 0 }).field, 'rise');
  assert.equal(computeRamp({ rise: -2 }).ok, false);
  assert.equal(computeRamp({ rise: 'abc' }).ok, false);
  assert.equal(computeRamp({ rise: 24, run: 0 }).field, 'run');
  assert.equal(computeRamp({ rise: 24, cross: -1 }).field, 'cross');
});

test('lengths under a foot stay in inches', () => {
  assert.equal(formatLength(6), '6 in');
  assert.equal(formatLength(36), '36 in (3 ft)');
});

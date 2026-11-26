// ADA ramp slope calculator. Every limit is a number from the 2010 ADA
// Standards for Accessible Design (sections 403, 405 and 505). A ratio is
// inches of horizontal run per 1 inch of rise. A larger ratio is gentler.
// Nothing here is a measurement from a real ramp, and nothing is sent anywhere.

export const LIMITS = {
  running: 12, // 405.2, not steeper than 1:12
  walk: 20, // 403.3, a walking surface is not steeper than 1:20
  cross: 48, // 405.3, 403.3 and 405.7.1, not steeper than 1:48
  risePerRun: 30, // 405.6
  handrailAbove: 6, // 405.8, required when the rise is greater than 6 inches
  clearWidth: 36, // 405.5
  landingLength: 60, // 405.7.3
  existingTo10: 10, // Table 405.2, steeper than 1:12 but not steeper than 1:10
  existingTo8: 8, // Table 405.2, steeper than 1:10 but not steeper than 1:8
  existingRise6: 6,
  existingRise3: 3,
};

const MAX_RISE = 10000;
const MAX_RUN = 200000;
const MAX_CROSS = 1000;

function parsePositive(raw, { max, name, unit }) {
  if (raw === undefined || raw === null || String(raw).trim() === '') return { empty: true };
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n)) return { error: `Enter the ${name} as a number of ${unit}.` };
  if (n <= 0) return { error: `Enter a ${name} greater than 0.` };
  if (n > max) return { error: `Enter a ${name} of ${max.toLocaleString('en-US')} ${unit} or less.` };
  return { value: n };
}

export function formatNumber(n) {
  const rounded = Math.round((n + Number.EPSILON) * 100) / 100;
  return rounded.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/** Inches, plus feet when the length is at least a foot. */
export function formatLength(inches) {
  const total = Math.round((inches + Number.EPSILON) * 100) / 100;
  const feet = Math.floor((total + 1e-9) / 12);
  const rem = Math.round((total - feet * 12) * 100) / 100;
  const inchesLabel = `${formatNumber(total)} in`;
  if (feet <= 0) return inchesLabel;
  if (Math.abs(rem) < 0.005) return `${inchesLabel} (${formatNumber(feet)} ft)`;
  return `${inchesLabel} (${formatNumber(feet)} ft ${formatNumber(rem)} in)`;
}

function runsFor(rise) {
  return Math.max(1, Math.ceil(rise / LIMITS.risePerRun - 1e-9));
}

/** True when `ratio` is gentler than or equal to `limit` (not steeper). */
function within(ratio, limit) {
  return ratio + 1e-9 >= limit;
}

function slopeCheck(riseIn, runIn) {
  const ratio = runIn / riseIn;
  const percent = (riseIn / runIn) * 100;
  const ratioText = `1:${formatNumber(ratio)} (about ${formatNumber(percent)} percent)`;
  if (within(ratio, LIMITS.walk)) {
    return {
      state: 'walk',
      tag: 'Walking surface',
      text: `This run is ${ratioText}. That is not steeper than 1:20, so it is a walking surface under section 403.3, not a ramp. Section 405 landings and handrails are not required on it. The cross slope of a walking surface still cannot be steeper than 1:48.`,
    };
  }
  if (within(ratio, LIMITS.running)) {
    return {
      state: 'pass',
      tag: 'Meets 1:12',
      text: `This run is ${ratioText}. That is not steeper than 1:12, so it meets section 405.2. A gentler slope is easier to use where you have the room.`,
    };
  }
  if (within(ratio, LIMITS.existingTo10)) {
    const withinRise = riseIn <= LIMITS.existingRise6 + 1e-9;
    return {
      state: 'existing',
      tag: withinRise ? 'Existing site only' : 'Steeper than 1:12',
      text: withinRise
        ? `This run is ${ratioText}. It is steeper than 1:12, so it does not meet section 405.2 for new construction. Table 405.2 allows a slope steeper than 1:12 but not steeper than 1:10 in an existing site, building or facility only where space limitations make it necessary, and only for a rise of 6 inches or less. This rise is within that 6-inch limit.`
        : `This run is ${ratioText}. It is steeper than 1:12, so it does not meet section 405.2 for new construction. Table 405.2 allows this slope in an existing site only where space limitations make it necessary, and the rise at this slope is limited to 6 inches. This rise is taller than 6 inches. The 1:12 design below meets 405.2.`,
    };
  }
  if (within(ratio, LIMITS.existingTo8)) {
    const withinRise = riseIn <= LIMITS.existingRise3 + 1e-9;
    return {
      state: 'existing',
      tag: withinRise ? 'Existing site only' : 'Steeper than 1:12',
      text: withinRise
        ? `This run is ${ratioText}. It is steeper than 1:10, so it does not meet section 405.2 for new construction. Table 405.2 allows a slope steeper than 1:10 but not steeper than 1:8 in an existing site only where space limitations make it necessary, and only for a rise of 3 inches or less. This rise is within that 3-inch limit.`
        : `This run is ${ratioText}. It is steeper than 1:10, so it does not meet section 405.2. Table 405.2 allows this slope in an existing site only where space limitations make it necessary, and the rise at this slope is limited to 3 inches. This rise is taller than 3 inches. The 1:12 design below meets 405.2.`,
    };
  }
  return {
    state: 'fail',
    tag: 'Not permitted',
    text: `This run is ${ratioText}. Table 405.2 says a slope steeper than 1:8 is not permitted. The 1:12 design below is the maximum running slope in section 405.2.`,
  };
}

function crossCheck(crossRatio) {
  const pass = within(crossRatio, LIMITS.cross);
  return {
    state: pass ? 'pass' : 'fail',
    tag: pass ? 'Meets 1:48' : 'Steeper than 1:48',
    text: pass
      ? `A cross slope of 1:${formatNumber(crossRatio)} is not steeper than 1:48, so it meets section 405.3. Section 403.3 sets the same limit for a walking surface, and section 405.7.1 sets it for a landing.`
      : `A cross slope of 1:${formatNumber(crossRatio)} is steeper than 1:48. Section 405.3 does not allow that on a ramp run. Section 403.3 sets the same limit for a walking surface, and section 405.7.1 sets it for a landing.`,
  };
}

/**
 * @param {{ rise?: string|number, run?: string|number, cross?: string|number }} input
 * rise: total vertical rise, inches. run: proposed horizontal ramp length, inches, optional.
 * cross: cross-slope ratio as the run in a 1:X slope, optional (48 means 1:48).
 */
export function computeRamp({ rise, run, cross } = {}) {
  const riseParsed = parsePositive(rise, { max: MAX_RISE, name: 'rise', unit: 'inches' });
  if (riseParsed.empty) return { ok: false, field: 'rise', error: 'Enter the total rise in inches.' };
  if (riseParsed.error) return { ok: false, field: 'rise', error: riseParsed.error };

  const runParsed = parsePositive(run, { max: MAX_RUN, name: 'run', unit: 'inches' });
  if (runParsed.error) return { ok: false, field: 'run', error: runParsed.error };

  const crossParsed = parsePositive(cross, { max: MAX_CROSS, name: 'cross slope', unit: 'inches of run per inch of rise' });
  if (crossParsed.error) return { ok: false, field: 'cross', error: crossParsed.error };

  const riseIn = riseParsed.value;
  const runs = runsFor(riseIn);
  const perRun = riseIn / runs;
  const minRun = riseIn * LIMITS.running;
  const intermediate = runs - 1;
  const landings = runs + 1;
  const landingTotal = landings * LIMITS.landingLength;
  const totalLength = minRun + landingTotal;
  const handrails = perRun > LIMITS.handrailAbove + 1e-9;
  const slope = runParsed.empty ? null : slopeCheck(riseIn, runParsed.value);
  const crossResult = crossParsed.empty ? null : crossCheck(crossParsed.value);

  const runSentence = runs === 1
    ? `Built at 1:12, this is 1 ramp run rising ${formatLength(perRun)}.`
    : `Built at 1:12, this is ${runs} ramp runs so that no run rises more than 30 inches. Each run rises ${formatLength(perRun)}.`;
  const handrailText = handrails
    ? `${runSentence} Handrails are required on both sides, because each run rises more than 6 inches (405.8). Handrails have to meet section 505, including a top of the gripping surface 34 to 38 inches above the ramp (505.4) and a 12-inch horizontal extension at the top and bottom of each run (505.10.1).`
    : `${runSentence} Handrails are not required by section 405.8, because the run does not rise more than 6 inches. Section 505 still applies if handrails are installed.`;

  const summary = [
    `For a rise of ${formatLength(riseIn)}, the minimum run at 1:12 is ${formatLength(minRun)}.`,
    `${runs} ramp run${runs === 1 ? '' : 's'}, ${intermediate} intermediate landing${intermediate === 1 ? '' : 's'}, plus a landing at the top and the bottom.`,
    handrails
      ? 'A 1:12 ramp for this rise needs handrails on both sides.'
      : 'A 1:12 ramp for this rise does not need handrails under section 405.8.',
    slope ? `${slope.tag}. ${slope.text}` : '',
    crossResult ? `${crossResult.tag}. ${crossResult.text}` : '',
  ].filter(Boolean).join(' ');

  return {
    ok: true,
    minimumRun: formatLength(minRun),
    runs: String(runs),
    perRun: formatLength(perRun),
    intermediate: String(intermediate),
    landings: String(landings),
    landingEach: `${formatLength(LIMITS.landingLength)} minimum`,
    landingTotal: formatLength(landingTotal),
    totalLength: formatLength(totalLength),
    clearWidth: `${formatLength(LIMITS.clearWidth)} minimum`,
    handrails,
    handrailTag: handrails ? 'Handrails required' : 'Handrails not required',
    handrailText,
    slope,
    cross: crossResult,
    summary,
  };
}

function init() {
  const root = document.querySelector('[data-ramp]');
  if (!root) return;
  const form = root.querySelector('form');
  const live = root.querySelector('[data-ramp-live]');
  const heading = root.querySelector('[data-ramp-heading]');
  let timer = 0;

  const setText = (name, text) => {
    const el = root.querySelector(`[data-ramp-${name}]`);
    if (el) el.textContent = text;
  };
  const setStatus = (name, status) => {
    const tag = root.querySelector(`[data-ramp-${name}-tag]`);
    const text = root.querySelector(`[data-ramp-${name}-text]`);
    if (!tag || !text) return;
    if (!status) {
      tag.hidden = true;
      tag.textContent = '';
      text.textContent = name === 'slope'
        ? 'Enter a run length to check it against 1:12.'
        : 'Enter a cross slope to check it against 1:48. Leave it blank to skip.';
      return;
    }
    tag.hidden = false;
    tag.textContent = status.tag;
    const tone = status.state === 'pass' ? 'tag-pass' : status.state === 'fail' ? 'tag-fail' : status.state === 'existing' ? 'tag-moderate' : '';
    tag.className = `tag${tone ? ` ${tone}` : ''}`;
    text.textContent = status.text;
  };

  const showError = (field, message) => {
    for (const name of ['rise', 'run', 'cross']) {
      const input = form.elements[name];
      const box = root.querySelector(`[data-error="${name}"]`);
      const on = Boolean(message) && name === field;
      if (on) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
      if (box) {
        box.textContent = on ? message : '';
        box.hidden = !on;
      }
    }
  };

  const paint = (announce) => {
    const result = computeRamp({
      rise: form.elements.rise.value,
      run: form.elements.run.value,
      cross: form.elements.cross.value,
    });
    if (!result.ok) {
      showError(result.field, result.error);
      if (announce) live.textContent = result.error;
      return;
    }
    showError('', '');
    setText('min-run', result.minimumRun);
    setText('runs', result.runs);
    setText('per-run', result.perRun);
    setText('intermediate', result.intermediate);
    setText('landings', result.landings);
    setText('landing-each', result.landingEach);
    setText('landing-total', result.landingTotal);
    setText('total', result.totalLength);
    setText('width', result.clearWidth);
    const handTag = root.querySelector('[data-ramp-hand-tag]');
    handTag.textContent = result.handrailTag;
    handTag.className = `tag ${result.handrails ? 'tag-moderate' : 'tag-pass'}`;
    setText('hand-text', result.handrailText);
    setStatus('slope', result.slope);
    setStatus('cross', result.cross);
    if (announce) live.textContent = result.summary;
  };

  form.addEventListener('input', () => {
    paint(false);
    window.clearTimeout(timer);
    timer = window.setTimeout(() => paint(true), 500);
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    window.clearTimeout(timer);
    paint(true);
    heading.focus();
  });
  paint(true);
}

if (typeof document !== 'undefined') init();

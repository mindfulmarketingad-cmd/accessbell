// Every WCAG 2.2 success criterion with the version that introduced it, its
// conformance level and its principle. Plain data, shared by the server and
// the browser (report filters). 4.1.1 Parsing is obsolete in WCAG 2.2.
export const PRINCIPLES = { 1: 'Perceivable', 2: 'Operable', 3: 'Understandable', 4: 'Robust' };

export const GUIDELINES = {
  '1.1': 'Text Alternatives',
  '1.2': 'Time-based Media',
  '1.3': 'Adaptable',
  '1.4': 'Distinguishable',
  '2.1': 'Keyboard Accessible',
  '2.2': 'Enough Time',
  '2.3': 'Seizures and Physical Reactions',
  '2.4': 'Navigable',
  '2.5': 'Input Modalities',
  '3.1': 'Readable',
  '3.2': 'Predictable',
  '3.3': 'Input Assistance',
  '4.1': 'Compatible',
};

// [success criterion, name, level, version]
const DATA = [
  ['1.1.1', 'Non-text Content', 'A', '2.0'],
  ['1.2.1', 'Audio-only and Video-only (Prerecorded)', 'A', '2.0'],
  ['1.2.2', 'Captions (Prerecorded)', 'A', '2.0'],
  ['1.2.3', 'Audio Description or Media Alternative (Prerecorded)', 'A', '2.0'],
  ['1.2.4', 'Captions (Live)', 'AA', '2.0'],
  ['1.2.5', 'Audio Description (Prerecorded)', 'AA', '2.0'],
  ['1.2.6', 'Sign Language (Prerecorded)', 'AAA', '2.0'],
  ['1.2.7', 'Extended Audio Description (Prerecorded)', 'AAA', '2.0'],
  ['1.2.8', 'Media Alternative (Prerecorded)', 'AAA', '2.0'],
  ['1.2.9', 'Audio-only (Live)', 'AAA', '2.0'],
  ['1.3.1', 'Info and Relationships', 'A', '2.0'],
  ['1.3.2', 'Meaningful Sequence', 'A', '2.0'],
  ['1.3.3', 'Sensory Characteristics', 'A', '2.0'],
  ['1.3.4', 'Orientation', 'AA', '2.1'],
  ['1.3.5', 'Identify Input Purpose', 'AA', '2.1'],
  ['1.3.6', 'Identify Purpose', 'AAA', '2.1'],
  ['1.4.1', 'Use of Color', 'A', '2.0'],
  ['1.4.2', 'Audio Control', 'A', '2.0'],
  ['1.4.3', 'Contrast (Minimum)', 'AA', '2.0'],
  ['1.4.4', 'Resize Text', 'AA', '2.0'],
  ['1.4.5', 'Images of Text', 'AA', '2.0'],
  ['1.4.6', 'Contrast (Enhanced)', 'AAA', '2.0'],
  ['1.4.7', 'Low or No Background Audio', 'AAA', '2.0'],
  ['1.4.8', 'Visual Presentation', 'AAA', '2.0'],
  ['1.4.9', 'Images of Text (No Exception)', 'AAA', '2.0'],
  ['1.4.10', 'Reflow', 'AA', '2.1'],
  ['1.4.11', 'Non-text Contrast', 'AA', '2.1'],
  ['1.4.12', 'Text Spacing', 'AA', '2.1'],
  ['1.4.13', 'Content on Hover or Focus', 'AA', '2.1'],
  ['2.1.1', 'Keyboard', 'A', '2.0'],
  ['2.1.2', 'No Keyboard Trap', 'A', '2.0'],
  ['2.1.3', 'Keyboard (No Exception)', 'AAA', '2.0'],
  ['2.1.4', 'Character Key Shortcuts', 'A', '2.1'],
  ['2.2.1', 'Timing Adjustable', 'A', '2.0'],
  ['2.2.2', 'Pause, Stop, Hide', 'A', '2.0'],
  ['2.2.3', 'No Timing', 'AAA', '2.0'],
  ['2.2.4', 'Interruptions', 'AAA', '2.0'],
  ['2.2.5', 'Re-authenticating', 'AAA', '2.0'],
  ['2.2.6', 'Timeouts', 'AAA', '2.1'],
  ['2.3.1', 'Three Flashes or Below Threshold', 'A', '2.0'],
  ['2.3.2', 'Three Flashes', 'AAA', '2.0'],
  ['2.3.3', 'Animation from Interactions', 'AAA', '2.1'],
  ['2.4.1', 'Bypass Blocks', 'A', '2.0'],
  ['2.4.2', 'Page Titled', 'A', '2.0'],
  ['2.4.3', 'Focus Order', 'A', '2.0'],
  ['2.4.4', 'Link Purpose (In Context)', 'A', '2.0'],
  ['2.4.5', 'Multiple Ways', 'AA', '2.0'],
  ['2.4.6', 'Headings and Labels', 'AA', '2.0'],
  ['2.4.7', 'Focus Visible', 'AA', '2.0'],
  ['2.4.8', 'Location', 'AAA', '2.0'],
  ['2.4.9', 'Link Purpose (Link Only)', 'AAA', '2.0'],
  ['2.4.10', 'Section Headings', 'AAA', '2.0'],
  ['2.4.11', 'Focus Not Obscured (Minimum)', 'AA', '2.2'],
  ['2.4.12', 'Focus Not Obscured (Enhanced)', 'AAA', '2.2'],
  ['2.4.13', 'Focus Appearance', 'AAA', '2.2'],
  ['2.5.1', 'Pointer Gestures', 'A', '2.1'],
  ['2.5.2', 'Pointer Cancellation', 'A', '2.1'],
  ['2.5.3', 'Label in Name', 'A', '2.1'],
  ['2.5.4', 'Motion Actuation', 'A', '2.1'],
  ['2.5.5', 'Target Size (Enhanced)', 'AAA', '2.1'],
  ['2.5.6', 'Concurrent Input Mechanisms', 'AAA', '2.1'],
  ['2.5.7', 'Dragging Movements', 'AA', '2.2'],
  ['2.5.8', 'Target Size (Minimum)', 'AA', '2.2'],
  ['3.1.1', 'Language of Page', 'A', '2.0'],
  ['3.1.2', 'Language of Parts', 'AA', '2.0'],
  ['3.1.3', 'Unusual Words', 'AAA', '2.0'],
  ['3.1.4', 'Abbreviations', 'AAA', '2.0'],
  ['3.1.5', 'Reading Level', 'AAA', '2.0'],
  ['3.1.6', 'Pronunciation', 'AAA', '2.0'],
  ['3.2.1', 'On Focus', 'A', '2.0'],
  ['3.2.2', 'On Input', 'A', '2.0'],
  ['3.2.3', 'Consistent Navigation', 'AA', '2.0'],
  ['3.2.4', 'Consistent Identification', 'AA', '2.0'],
  ['3.2.5', 'Change on Request', 'AAA', '2.0'],
  ['3.2.6', 'Consistent Help', 'A', '2.2'],
  ['3.3.1', 'Error Identification', 'A', '2.0'],
  ['3.3.2', 'Labels or Instructions', 'A', '2.0'],
  ['3.3.3', 'Error Suggestion', 'AA', '2.0'],
  ['3.3.4', 'Error Prevention (Legal, Financial, Data)', 'AA', '2.0'],
  ['3.3.5', 'Help', 'AAA', '2.0'],
  ['3.3.6', 'Error Prevention (All)', 'AAA', '2.0'],
  ['3.3.7', 'Redundant Entry', 'A', '2.2'],
  ['3.3.8', 'Accessible Authentication (Minimum)', 'AA', '2.2'],
  ['3.3.9', 'Accessible Authentication (Enhanced)', 'AAA', '2.2'],
  ['4.1.1', 'Parsing (obsolete in WCAG 2.2)', 'A', '2.0'],
  ['4.1.2', 'Name, Role, Value', 'A', '2.0'],
  ['4.1.3', 'Status Messages', 'AA', '2.1'],
];

export const CRITERIA = Object.fromEntries(
  DATA.map(([sc, name, level, version]) => [
    sc,
    { sc, name, level, version, principle: PRINCIPLES[sc[0]], guideline: GUIDELINES[sc.split('.').slice(0, 2).join('.')] },
  ]),
);

/** Full metadata for a success criterion, or null for best-practice rules. */
export const criterion = (sc) => CRITERIA[sc] || null;

export const LEVEL_RANK = { A: 1, AA: 2, AAA: 3 };
export const VERSION_RANK = { '2.0': 1, '2.1': 2, '2.2': 3 };

/** True when a criterion is part of the given WCAG version and level target. */
export const withinTarget = (c, version, level) =>
  Boolean(c) && VERSION_RANK[c.version] <= VERSION_RANK[version] && LEVEL_RANK[c.level] <= LEVEL_RANK[level];

/** Criteria in a WCAG version and level target, in document order. 4.1.1 is left out of 2.2. */
export const criteriaFor = (version, level) =>
  Object.values(CRITERIA).filter((c) => withinTarget(c, version, level) && !(c.sc === '4.1.1' && version === '2.2'));

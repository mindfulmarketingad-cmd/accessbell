// AccessBell Free Accessibility Icon Set: original icons on a 48 x 48 grid.
// Strokes and fills use currentColor so the icons can be recolored.
// Downloadable files are generated from this list by scripts/generate-icons.mjs.

export const ICON_SET = {
  name: 'AccessBell Free Accessibility Icon Set',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  basePath: '/downloads/accessibility-icons',
  svgZip: 'accessbell-accessibility-icons-svg.zip',
  pngZip: 'accessbell-accessibility-icons-png.zip',
};

const S = 'fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
const F = 'fill="currentColor"';

export const ACCESSIBILITY_ICONS = [
  {
    slug: 'universal-access',
    name: 'Universal Access',
    description: 'A person with open arms inside a circle. The most widely used symbol for accessibility in general, ideal for accessibility statements and settings menus.',
    body: `<circle cx="24" cy="24" r="20" ${S}/><circle cx="24" cy="13.5" r="3.5" ${F}/><path d="M13 19l11 2.5 11-2.5M24 21.5V29M24 29l-5.5 9M24 29l5.5 9" ${S}/>`,
  },
  {
    slug: 'wheelchair',
    name: 'Wheelchair Access',
    description: 'A person using a wheelchair in motion. Marks step-free routes, accessible entrances, seating and facilities for people with mobility disabilities.',
    body: `<circle cx="27" cy="8" r="3.5" ${F}/><path d="M26 14l-2 12h9l4 10h3M25 19h8" ${S}/><path d="M15.5 22.5A9.5 9.5 0 1 0 29 34.5" ${S}/>`,
  },
  {
    slug: 'blind',
    name: 'Blind or Low Vision',
    description: 'An eye with a line through it. Identifies content, services or features for people who are blind or have low vision.',
    body: `<path d="M4 24c5-8 12-12 20-12s15 4 20 12c-5 8-12 12-20 12S9 32 4 24z" ${S}/><circle cx="24" cy="24" r="5" ${S}/><path d="M8 40L40 8" ${S}/>`,
  },
  {
    slug: 'low-vision',
    name: 'Low Vision and Magnification',
    description: 'An eye inside a magnifying glass. Represents screen magnification, zoom and large-print options for people with low vision.',
    body: `<circle cx="20" cy="20" r="14" ${S}/><path d="M30 30l12 12" ${S}/><path d="M11 20c2.5-4 5.5-6 9-6s6.5 2 9 6c-2.5 4-5.5 6-9 6s-6.5-2-9-6z" ${S}/><circle cx="20" cy="20" r="2.5" ${F}/>`,
  },
  {
    slug: 'hearing-loss',
    name: 'Deaf or Hard of Hearing',
    description: 'An ear with a line through it. Identifies services and content for people who are deaf or hard of hearing.',
    body: `<path d="M15 21a10 10 0 0 1 20 0c0 5-4 7-5.5 10.5S28 40 23.5 40c-2.5 0-4.5-1.5-5-3.5" ${S}/><path d="M21 21a4 4 0 0 1 8 0c0 2.5-2.5 3.5-2.5 6" ${S}/><path d="M8 40L40 8" ${S}/>`,
  },
  {
    slug: 'assistive-listening',
    name: 'Assistive Listening',
    description: 'An ear with sound waves. Marks assistive listening systems, hearing loops and amplified audio.',
    body: `<path d="M8 21a10 10 0 0 1 20 0c0 5-4 7-5.5 10.5S21 40 16.5 40c-2.5 0-4.5-1.5-5-3.5" ${S}/><path d="M14 21a4 4 0 0 1 8 0c0 2.5-2.5 3.5-2.5 6" ${S}/><path d="M34 17a8 8 0 0 1 0 12M39 12a15 15 0 0 1 0 22" ${S}/>`,
  },
  {
    slug: 'sign-language',
    name: 'Sign Language',
    description: 'A signing hand with motion lines. Indicates sign language interpretation is available, for example for events, videos or support.',
    body: `<path d="M19 27V13a2.5 2.5 0 0 1 5 0v10M24 23V9.5a2.5 2.5 0 0 1 5 0V23M29 23V12a2.5 2.5 0 0 1 5 0v13M34 25v-6a2.5 2.5 0 0 1 5 0v10c0 7-5 13-12 13h-2c-4 0-7-2-9.5-5l-6-7.5a2.6 2.6 0 0 1 4-3.3L19 31" ${S}/><path d="M4 17a13 13 0 0 1 7-11M10 19a7 7 0 0 1 4-7" ${S}/>`,
  },
  {
    slug: 'audio-description',
    name: 'Audio Description',
    description: 'The letters AD with sound waves. Shows that a video or performance has spoken narration of important visual details.',
    body: `<path d="M3 34l7-20 7 20M5.5 27.5h9M21 14v20h4c6 0 10-4 10-10s-4-10-10-10h-4z" ${S}/><path d="M39 19a7 7 0 0 1 0 10M43 15a13 13 0 0 1 0 18" ${S}/>`,
  },
  {
    slug: 'closed-captions',
    name: 'Closed Captions',
    description: 'The letters CC in a screen. Shows that video or audio content has captions that can be turned on.',
    body: `<rect x="4" y="10" width="40" height="28" rx="5" ${S}/><path d="M21 20.5a5 5 0 1 0 0 7M33 20.5a5 5 0 1 0 0 7" ${S}/>`,
  },
  {
    slug: 'braille',
    name: 'Braille',
    description: 'Two braille cells of raised and unraised dots. Marks braille signage, documents and menus.',
    body: `${[[12, 12, 1], [12, 24, 1], [12, 36, 0], [20, 12, 0], [20, 24, 1], [20, 36, 1], [30, 12, 1], [30, 24, 0], [30, 36, 1], [38, 12, 1], [38, 24, 1], [38, 36, 0]]
      .map(([x, y, on]) => (on ? `<circle cx="${x}" cy="${y}" r="3.5" ${F}/>` : `<circle cx="${x}" cy="${y}" r="3" fill="none" stroke="currentColor" stroke-width="2"/>`))
      .join('')}`,
  },
  {
    slug: 'keyboard',
    name: 'Keyboard Accessible',
    description: 'A keyboard. Indicates that every feature can be used with a keyboard alone, without a mouse.',
    body: `<rect x="3" y="13" width="42" height="24" rx="4" ${S}/><path d="M9 20h2M16 20h2M23 20h2M30 20h2M37 20h2M9 26h2M16 26h2M23 26h2M30 26h2M37 26h2M15 31.5h18" ${S}/>`,
  },
  {
    slug: 'screen-reader',
    name: 'Screen Reader Friendly',
    description: 'A screen with text and sound waves. Represents content that works with screen readers and other text-to-speech tools.',
    body: `<rect x="3" y="8" width="30" height="22" rx="3" ${S}/><path d="M9 15h16M9 20h12M9 25h8M18 30v6M12 40h12" ${S}/><path d="M38 13a8 8 0 0 1 0 12M42.5 9a14 14 0 0 1 0 20" ${S}/>`,
  },
  {
    slug: 'voice-control',
    name: 'Voice Control',
    description: 'A microphone with sound waves. Represents speech input, voice commands and dictation.',
    body: `<rect x="18" y="5" width="12" height="22" rx="6" ${S}/><path d="M11 22a13 13 0 0 0 26 0M24 35v7M17 42h14" ${S}/><path d="M5 15v6M43 15v6" ${S}/>`,
  },
  {
    slug: 'cognitive',
    name: 'Cognitive Accessibility',
    description: 'A head with a lightbulb. Represents clear, predictable design for people with cognitive, learning and neurological disabilities.',
    body: `<path d="M31 43v-7h3a3 3 0 0 0 3-3v-5l4-1.5-4-6.5C37 11 31 5 22.5 5S7 11.5 7 20.5c0 6 3 10 7 13V43" ${S}/><path d="M18.5 22.5a5.5 5.5 0 1 1 7 0c-1 .8-1.5 2-1.5 3.5h-4c0-1.5-.5-2.7-1.5-3.5zM20 30h4" ${S}/>`,
  },
  {
    slug: 'text-resize',
    name: 'Text Resize',
    description: 'A small and a large letter A. Represents adjustable text size and support for zoom up to 200 percent.',
    body: `<path d="M4 36l6-15 6 15M6.5 30.5h7M20 39l10-29 10 29M23.5 30h13" ${S}/>`,
  },
  {
    slug: 'high-contrast',
    name: 'High Contrast',
    description: 'A circle that is half dark and half light. Represents high-contrast display modes and color settings.',
    body: `<circle cx="24" cy="24" r="19" ${S}/><path d="M24 5a19 19 0 0 0 0 38z" ${F}/>`,
  },
  {
    slug: 'plain-language',
    name: 'Plain Language',
    description: 'A document with a checkmark. Represents easy-to-read and plain-language versions of content.',
    body: `<path d="M11 5h18l9 9v29H11z" ${S}/><path d="M29 5v9h9M17 21h14M17 27h10" ${S}/><path d="M18 35l3.5 3.5L29 31" ${S}/>`,
  },
];

/** A standalone SVG file for an icon, in the given color. */
export function iconSvg(icon, color = '#1f3a2d') {
  // Files use the literal color: some design tools render currentColor as black.
  const body = icon.body.replaceAll('currentColor', color);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" role="img" aria-labelledby="t"><title id="t">${icon.name} icon</title>${body}</svg>\n`;
}

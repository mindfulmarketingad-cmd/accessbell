/**
 * Every free tool on the site, for the /tools hub and the "More free tools"
 * list on each tool page. `keyword` is the tool's H1 keyword and is used as
 * the anchor text of every link to it.
 */
import { CHECKERS, checkerPath } from './checkers';

export type Tool = {
  href: string;
  /** H1 keyword: the anchor text for links to this tool. */
  keyword: string;
  icon: string;
  tag: string;
  text: string;
  group: 'scan' | 'design' | 'documents';
};

export const TOOLS: Tool[] = [
  {
    href: '/',
    keyword: 'Website Accessibility Checker',
    icon: 'scan',
    tag: 'Free scan',
    text: 'Scan any public page against WCAG 2.2, 2.1, ADA, Section 508 or EN 301 549 and see every issue it finds in seconds.',
    group: 'scan',
  },
  ...CHECKERS.map((c) => ({
    href: checkerPath(c),
    keyword: c.name,
    icon: 'check-circle',
    tag: `WCAG ${c.version} Level ${c.level}`,
    text: `${c.lead.split('. ')[0]}.`,
    group: 'scan' as const,
  })),
  {
    href: '/tools/contrast-checker',
    keyword: 'WCAG Color Contrast Checker',
    icon: 'eye',
    tag: 'Free tool',
    text: 'Check any two colors against WCAG 2.2 contrast requirements for normal text, large text and UI components.',
    group: 'design',
  },
  {
    href: '/tools/chart-color-checker',
    keyword: 'Chart and Infographic Color Checker',
    icon: 'chart',
    tag: 'Free tool',
    text: 'Check chart and infographic colors for 3:1 contrast and see whether people with color blindness can tell them apart.',
    group: 'design',
  },
  {
    href: '/tools/free-accessibility-icon-set',
    keyword: 'Free Accessibility Icon Set',
    icon: 'layers',
    tag: 'Free download',
    text: '17 original accessibility icons for wheelchair access, captions, sign language, braille and more, as SVG and PNG.',
    group: 'design',
  },
  {
    href: '/tools/pdf-accessibility-checker',
    keyword: 'PDF Accessibility Checker',
    icon: 'doc',
    tag: 'Free tool',
    text: 'Check any PDF for tags, title, language, alt text, scanned pages and form labels against WCAG and PDF/UA. Runs in your browser.',
    group: 'documents',
  },
  {
    href: '/tools/statement-generator',
    keyword: 'Generate Free Custom Accessibility Statement',
    icon: 'doc',
    tag: 'Free generator',
    text: 'Create a custom accessibility statement for your website, then copy it or download it as an HTML page.',
    group: 'documents',
  },
];

export const TOOL_GROUPS: { id: Tool['group']; title: string; text: string }[] = [
  { id: 'scan', title: 'Free Website Accessibility Checkers', text: 'Scan a live page against the standard you need to meet.' },
  { id: 'design', title: 'Free Color and Design Accessibility Tools', text: 'Check colors and graphics before they ship.' },
  { id: 'documents', title: 'Free Accessibility Tools for Documents and Statements', text: 'Check PDFs and publish your accessibility statement.' },
];

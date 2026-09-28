// Minimal, safe inline Markdown for short frontmatter text (FAQ answers):
// escapes HTML, then supports **bold** and [links](/path or https://...).
const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function inlineMarkdown(text: string) {
  return escape(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(((?:\/|https:\/\/)[^)\s"]*)\)/g, (_, label, href) => {
      const external = href.startsWith('https://');
      return `<a href="${href}"${external ? ' rel="noopener noreferrer"' : ''}>${label}</a>`;
    });
}

/** Plain text version for structured data. */
export const stripMarkdown = (text: string) => text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

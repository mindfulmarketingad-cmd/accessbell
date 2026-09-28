// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://accessbell.co',
  trailingSlash: 'never',
  build: {
    // /about -> about.html, served at /about via Vercel cleanUrls
    format: 'file',
    // External CSS only, so the Content-Security-Policy can forbid inline styles
    inlineStylesheets: 'never',
  },
  markdown: {
    // Shiki writes inline style attributes, which the CSP blocks
    syntaxHighlight: false,
  },
  compressHTML: true,
  devToolbar: { enabled: false },
});

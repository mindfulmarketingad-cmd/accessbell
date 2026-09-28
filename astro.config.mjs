// @ts-check
import { defineConfig } from 'astro/config';
import accessibleTables from './src/integrations/accessible-tables.mjs';

export default defineConfig({
  site: 'https://www.accessbell.co',
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
  vite: {
    // Never inline scripts or assets: the Content-Security-Policy forbids inline scripts
    build: { assetsInlineLimit: 0 },
  },
  compressHTML: true,
  devToolbar: { enabled: false },
  integrations: [accessibleTables()],
});

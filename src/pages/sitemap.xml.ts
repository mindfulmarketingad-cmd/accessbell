import type { APIRoute } from 'astro';
import { getRoutes } from '../lib/routes';
import { absoluteUrl } from '../config/site';
import { toIsoDate } from '../lib/format';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: APIRoute = async () => {
  const routes = await getRoutes();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) => `  <url>\n    <loc>${esc(absoluteUrl(r.path))}</loc>\n    <lastmod>${toIsoDate(r.lastmod)}</lastmod>\n  </url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

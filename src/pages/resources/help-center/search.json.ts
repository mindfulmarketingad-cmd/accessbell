import type { APIRoute } from 'astro';
import { helpByCategory, articlePath, plainText } from '../../../lib/help';

/** Search index for the Help Center, fetched by the search box on first use. */
export const GET: APIRoute = async () => {
  const groups = await helpByCategory();
  const items = groups.flatMap((g) =>
    g.articles.map((a) => ({
      title: a.data.title,
      description: a.data.description,
      url: articlePath(a),
      category: g.title,
      headings: [...(a.body ?? '').matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1]),
      text: plainText(a.body ?? '').slice(0, 4000),
    })),
  );
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};

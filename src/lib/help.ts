import { getCollection, type CollectionEntry } from 'astro:content';
import { HELP_BASE, HELP_CATEGORIES, categoryOf } from '../data/help';

export type HelpArticle = CollectionEntry<'help'>;

export const articlePath = (a: HelpArticle) => `${HELP_BASE}/${a.id}`;
export const categoryPath = (id: string) => `${HELP_BASE}/${id}`;

/** Every article, grouped by category in display order, each sorted by `order`. */
export async function helpByCategory() {
  const all = await getCollection('help');
  return HELP_CATEGORIES.map((c) => ({
    ...c,
    articles: all.filter((a) => categoryOf(a.id) === c.id).sort((a, b) => a.data.order - b.data.order),
  }));
}

/** Plain text from Markdown, for search and word counts. */
export const plainText = (md: string) =>
  md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^[#>|\-*\d.\s]+/gm, ' ')
    .replace(/[*_|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

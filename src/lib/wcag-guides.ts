import { getCollection } from 'astro:content';
import { guideSlug } from './posts';

export const WCAG_GUIDES_CATEGORY = 'WCAG Codes Explained';

/** "WCAG 1.3.2 Meaningful Sequence Explained in Plain English" -> "1.3.2 Meaningful Sequence" */
const shortName = (title: string) => title.replace(/^WCAG\s+/, '').replace(/\s+Explained.*$/, '');

/** Every "WCAG Codes Explained" post, in success criterion order (1.1.1 before 1.2.9 before 2.2.2). */
export async function getWcagGuides() {
  const posts = await getCollection('blog', ({ data }) => !data.draft && data.category === WCAG_GUIDES_CATEGORY);
  return posts
    .map((p) => {
      const sc = (p.id.match(/^wcag-(\d+)-(\d+)-(\d+)-/) || []).slice(1).map(Number);
      return { id: p.id, href: `/resources/wcag/${guideSlug(p.id)}`, name: shortName(p.data.title), sc };
    })
    .sort((a, b) => a.sc[0] - b.sc[0] || a.sc[1] - b.sc[1] || a.sc[2] - b.sc[2]);
}

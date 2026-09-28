import type { CollectionEntry } from 'astro:content';
import { SITE } from '../config/site';

export type Author = CollectionEntry<'authors'>;

export const authorPath = (a: Author) => `/authors/${a.id}`;

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

/** Person (or Organization, for a team byline) structured data for an author. */
export function authorSchema(a: Author) {
  const base = {
    '@id': `${SITE.url}${authorPath(a)}#author`,
    name: a.data.name,
    url: `${SITE.url}${authorPath(a)}`,
    description: a.data.shortBio,
    ...(a.data.sameAs.length ? { sameAs: a.data.sameAs } : {}),
  };
  return a.data.type === 'team'
    ? { '@type': 'Organization', ...base, parentOrganization: { '@id': `${SITE.url}/#organization` } }
    : {
        '@type': 'Person',
        ...base,
        jobTitle: a.data.jobTitle,
        knowsAbout: a.data.expertise,
        worksFor: { '@id': `${SITE.url}/#organization` },
      };
}

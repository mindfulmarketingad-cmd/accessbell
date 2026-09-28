export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

/** Minutes to read at ~225 words per minute. */
export const readingTime = (text: string) => Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 225));

/** YYYY-MM-DD for sitemaps. */
export const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);

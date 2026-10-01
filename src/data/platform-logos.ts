import map from './platform-logos.json';

/** Path of the platform's logo, or undefined when there is none (an initial is shown instead). */
export const platformLogo = (slug: string): string | undefined => ((map as Record<string, string>)[slug] ? `/platform-logos/${slug}.svg` : undefined);

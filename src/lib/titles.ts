/** Title tags must be 65 characters or fewer (see CLAUDE.md). */
export const TITLE_MAX = 65;

/** The first candidate that fits within the title limit, or the last one if none do. */
export function fitTitle(...candidates: string[]) {
  return candidates.find((t) => t.length <= TITLE_MAX) ?? candidates[candidates.length - 1];
}

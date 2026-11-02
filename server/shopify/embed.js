// Is the AccessBell app embed turned on in the live theme? Two signals:
// the theme's settings (needs read_themes), and fix.js having called home in
// the last 7 days (domains.fix_seen_at). Either one counts.
export const EMBED_QUERY = `query AccessBellEmbed {
  themes(first: 1, roles: [MAIN]) {
    nodes { id files(filenames: ["config/settings_data.json"], first: 1) { nodes { body { ... on OnlineStoreThemeFileBodyText { content } } } } }
  }
}`;

/** settings_data.json content -> true/false (null if it can't be read). */
export function embedEnabledInSettings(content, handle = 'accessbell-fix') {
  if (!content) return null;
  let data;
  try {
    data = JSON.parse(String(content).replace(/^\uFEFF?\s*\/\*[\s\S]*?\*\/\s*/, ''));
  } catch {
    return null;
  }
  const current = typeof data?.current === 'string' ? data?.presets?.[data.current] : data?.current;
  const blocks = Object.values(current?.blocks || {});
  return blocks.some((b) => String(b?.type || '').includes(`/blocks/${handle}/`) && b.disabled !== true);
}

export function embedFromTheme(data) {
  const content = data?.themes?.nodes?.[0]?.files?.nodes?.[0]?.body?.content;
  return embedEnabledInSettings(content);
}

const SEEN_MS = 7 * 86_400_000;
export const fixSeenRecently = (fixSeenAt, now = Date.now()) => Boolean(fixSeenAt && now - new Date(fixSeenAt).getTime() < SEEN_MS);

/** Theme editor deep link that opens App embeds with ours selected. */
export const activateEmbedUrl = (shop, apiKey, handle = 'accessbell-fix') =>
  `https://${shop}/admin/themes/current/editor?context=apps&activateAppId=${encodeURIComponent(apiKey)}/${handle}`;

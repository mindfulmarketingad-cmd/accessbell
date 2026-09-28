// Fixed-window, in-memory rate limiter.
//
// State lives per serverless instance, so this is a first line of defense.
// For hard global limits, add a Vercel WAF rate-limit rule on /api/* as well
// (see README).
export function createRateLimiter({ limit, windowMs, maxKeys = 10_000 }) {
  const hits = new Map();

  return function check(key, now = Date.now()) {
    let entry = hits.get(key);
    if (!entry || now >= entry.reset) {
      if (!entry && hits.size >= maxKeys) {
        // Evict expired entries; if still full, drop the oldest.
        for (const [k, v] of hits) if (now >= v.reset) hits.delete(k);
        if (hits.size >= maxKeys) hits.delete(hits.keys().next().value);
      }
      entry = { count: 0, reset: now + windowMs };
      hits.set(key, entry);
    }
    entry.count++;
    return {
      allowed: entry.count <= limit,
      remaining: Math.max(0, limit - entry.count),
      retryAfter: Math.ceil((entry.reset - now) / 1000),
    };
  };
}

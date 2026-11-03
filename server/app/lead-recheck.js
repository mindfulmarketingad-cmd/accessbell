// Re-check a free-scan lead's page for the follow-up emails. Uses the
// HTML-only audit (no browser), so it is cheap enough to run per email.
// Never throws: a page that cannot be fetched returns null and the email
// falls back to the counts logged at scan time.
import { audit } from '../audit.js';
import { fetchPage } from '../fetch-page.js';

const RANK = { critical: 0, serious: 1, moderate: 2, minor: 3 };

export async function recheckLeadPage(url) {
  if (!url) return null;
  try {
    const page = await fetchPage(url);
    const report = audit(page.html, { standard: 'wcag22' });
    const s = report.summary || {};
    const issues = [...(report.issues || [])].sort((a, b) => (RANK[a.impact] ?? 9) - (RANK[b.impact] ?? 9) || (b.count || 0) - (a.count || 0));
    const top = issues[0];
    return {
      issues: Number.isFinite(s.issues) ? s.issues : issues.length,
      critical: s.critical || 0,
      serious: s.serious || 0,
      topIssue: top
        ? {
            title: String(top.title || '').slice(0, 200),
            impact: top.impact,
            count: Number.isFinite(top.count) ? top.count : 0,
            wcag: (top.wcag || []).filter((c) => c && c.sc).slice(0, 3),
            fix: String(top.fix || '').slice(0, 600),
            helpUrl: typeof top.helpUrl === 'string' ? top.helpUrl : undefined,
          }
        : null,
    };
  } catch {
    return null;
  }
}

# Indexing queue

Pages waiting for a manual Google Search Console request. Each growth run: resubmit `/sitemap.xml`, run URL Inspection → Request Indexing on that day's new page first, then spend the rest of the ~10/day quota on this backlog, oldest first. Mark each row `requested` with the date, or `indexed` once URL Inspection says "URL is on Google".

Statuses: `queued` → `requested` → `indexed` (or `error` with a note).

Last run (2026-11-23): sitemap resubmitted, GSC showed 467 discovered pages (pre-refresh). Confirmed indexed ("URL is on Google") on Nov 23 and removed from the table: `/blog/ada-lawsuit-what-to-do`, `/blog/ada-website-lawsuits-by-industry`, `/blog/ada-lawsuits-2026`, `/blog/ada-lawsuit-process`. `/blog/how-to-look-up-ada-lawsuits` was "Discovered – currently not indexed"; Request Indexing succeeded Nov 23. 1 Request Indexing call used, no quota error.

Previous run (2026-11-20): sitemap resubmitted, 467 discovered; all 19 earlier backlog URLs confirmed indexed; Request Indexing hit "Quota Exceeded".

| URL | added | status | requested on | notes |
| --- | --- | --- | --- | --- |
| https://www.accessbell.co/blog/how-to-look-up-ada-lawsuits | 2026-11-23 | requested | 2026-11-23 | New page (Nov 23 growth run). Supports /blog/ada-lawsuit-what-to-do (pos 28.6, 122 impr). Nov 23: URL Inspection = "Discovered – currently not indexed"; Request Indexing done. Re-inspect next run. |

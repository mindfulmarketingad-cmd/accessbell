# Indexing queue

Pages waiting for a manual Google Search Console request. Each growth run: resubmit `/sitemap.xml`, run URL Inspection → Request Indexing on that day's new page first, then spend the rest of the ~10/day quota on this backlog, oldest first. Mark each row `requested` with the date, or `indexed` once URL Inspection says "URL is on Google".

Statuses: `queued` → `requested` → `indexed` (or `error` with a note).

Last run (2026-11-26): sitemap resubmitted, 469 discovered pages. Confirmed indexed ("URL is on Google") on Nov 26 and removed from the table: `/blog/how-to-look-up-ada-lawsuits`.

Previous run (2026-11-23): sitemap resubmitted, GSC showed 467 discovered pages (pre-refresh). Confirmed indexed ("URL is on Google") on Nov 23 and removed from the table: `/blog/ada-lawsuit-what-to-do`, `/blog/ada-website-lawsuits-by-industry`, `/blog/ada-lawsuits-2026`, `/blog/ada-lawsuit-process`. `/blog/how-to-look-up-ada-lawsuits` was "Discovered – currently not indexed"; Request Indexing succeeded Nov 23. 1 Request Indexing call used, no quota error.

Previous run (2026-11-20): sitemap resubmitted, 467 discovered; all 19 earlier backlog URLs confirmed indexed; Request Indexing hit "Quota Exceeded".

| URL | added | status | requested on | notes |
| --- | --- | --- | --- | --- |
| https://www.accessbell.co/tools/ada-ramp-slope-calculator | 2026-11-26 | queued | | New page (Nov 26 growth run). Supports /blog/ada-requirements-for-ramps (pos 11.1, 58 impr, 1 click, Oct 28–Nov 24). Request Indexing after deploy. |
| https://www.accessbell.co/blog/ada-requirements-for-ramps | 2026-11-26 | queued | | Updated Nov 26 with a link to the ADA ramp slope calculator. |

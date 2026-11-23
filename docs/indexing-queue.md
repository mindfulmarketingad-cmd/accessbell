# Indexing queue

Pages waiting for a manual Google Search Console request. Each growth run: resubmit `/sitemap.xml`, run URL Inspection → Request Indexing on that day's new page first, then spend the rest of the ~10/day quota on this backlog, oldest first. Mark each row `requested` with the date, or `indexed` once URL Inspection says "URL is on Google".

Statuses: `queued` → `requested` → `indexed` (or `error` with a note).

Last run (2026-11-20): sitemap resubmitted, GSC "Success", 467 discovered pages, last read Nov 20. All 19 previous backlog URLs were inspected and confirmed indexed ("URL is on Google") on Nov 20, so they were removed from the table. `/blog/ada-website-lawsuits-by-industry` is "URL is unknown to Google" and Request Indexing failed with "Quota Exceeded"; `/blog/ada-lawsuits-2026` was not inspected (quota). 0 Request Indexing calls succeeded. Both stay `queued`.

Nov 23 run: indexing results for today will follow (to be filled in by the separate GSC run).

| URL | added | status | requested on | notes |
| --- | --- | --- | --- | --- |
| https://www.accessbell.co/blog/ada-website-lawsuits-by-industry | 2026-11-20 | queued | | New page (Nov 20 growth run). Supports /blog/ada-lawsuits-2026. Nov 20: URL Inspection = "URL is unknown to Google"; Request Indexing failed ("Quota Exceeded"). Retry first on next run. |
| https://www.accessbell.co/blog/ada-lawsuits-2026 | 2026-11-20 | queued | | Ranking page (pos 9.0); updated Nov 20 with industry split and link to the new page. Nov 20: not inspected (quota). Retry next run. |
| https://www.accessbell.co/blog/how-to-look-up-ada-lawsuits | 2026-11-23 | queued | | New page (Nov 23 growth run). Supports /blog/ada-lawsuit-what-to-do (pos 28.6, 122 impr). Request today. |
| https://www.accessbell.co/blog/ada-lawsuit-what-to-do | 2026-11-23 | queued | | Ranking page; updated Nov 23 (Step 6 link to the new page, related list, updatedDate). Request today. |
| https://www.accessbell.co/blog/ada-lawsuit-process | 2026-11-23 | queued | | Ranking page (pos 10.3); Nov 23 added a Stage 1 link to the new page. Request if quota allows. |

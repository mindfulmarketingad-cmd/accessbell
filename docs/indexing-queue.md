# Indexing queue

Pages waiting for a manual Google Search Console request. Each growth run: resubmit `/sitemap.xml`, run URL Inspection → Request Indexing on that day's new page first, then spend the rest of the ~10/day quota on this backlog, oldest first. Mark each row `requested` with the date, or `indexed` once URL Inspection says "URL is on Google".

Statuses: `queued` → `requested` → `indexed` (or `error` with a note).

Last run (2026-11-19): sitemap resubmitted, GSC "Success", 467 discovered pages. Request Indexing quota was already exceeded, so 0 requests went through. All 19 URLs stay `queued`; only `/blog/ada-lawsuit-mootness` was inspected, the other 18 were not checked.

| URL | added | status | requested on | notes |
| --- | --- | --- | --- | --- |
| https://www.accessbell.co/blog/ada-website-lawsuits-by-industry | 2026-11-20 | queued | | New page (Nov 20 growth run). Supports /blog/ada-lawsuits-2026. |
| https://www.accessbell.co/blog/ada-lawsuits-2026 | 2026-11-20 | queued | | Ranking page (pos 9.0); updated Nov 20 with industry split and link to the new page. |
| https://www.accessbell.co/blog/ada-lawsuit-mootness | 2026-11-19 | queued | | New page (Nov 19 growth run). Supports /blog/ada-lawsuit-process. Nov 19: URL Inspection = "Discovered - currently not indexed"; Request Indexing failed (daily quota already exceeded). Retry first on Nov 20. |
| https://www.accessbell.co/blog/ada-lawsuit-process | 2026-11-19 | queued | | Ranking page (pos 10.6); updated Nov 19 with links to the new page. |
| https://www.accessbell.co/industries/restaurants | 2026-11-02 | queued | | Growth log Nov 2. |
| https://www.accessbell.co/industries/hotels | 2026-11-03 | queued | | Growth log Nov 3. |
| https://www.accessbell.co/industries/dental-practices | 2026-11-04 | queued | | Growth log Nov 4. |
| https://www.accessbell.co/industries/law-firms | 2026-11-05 | queued | | Growth log Nov 5. |
| https://www.accessbell.co/industries/gyms | 2026-11-06 | queued | | Growth log Nov 6. |
| https://www.accessbell.co/resources/website-accessibility-monitoring-tool | 2026-11-10 | queued | | Growth log Nov 10. Main keyword page. |
| https://www.accessbell.co/resources/wcag-2-2-checklist-for-online-stores | 2026-11-11 | queued | | Growth log Nov 11. |
| https://www.accessbell.co/resources/squarespace-accessibility-checklist | 2026-11-12 | queued | | Growth log Nov 12. |
| https://www.accessbell.co/resources/wix-accessibility-checklist | 2026-11-13 | queued | | Growth log Nov 13. |
| https://www.accessbell.co/wcag | 2026-11-17 | queued | | WCAG 2.2 hub launch (commit 403fc4b). |
| https://www.accessbell.co/wcag/1-4-4-resize-text | 2026-11-17 | queued | | New full criterion page, /wcag launch. |
| https://www.accessbell.co/wcag/1-4-11-non-text-contrast | 2026-11-17 | queued | | New full criterion page, /wcag launch. |
| https://www.accessbell.co/wcag/2-4-6-headings-and-labels | 2026-11-17 | queued | | New full criterion page, /wcag launch. |
| https://www.accessbell.co/wcag/2-4-7-focus-visible | 2026-11-17 | queued | | New full criterion page, /wcag launch. |
| https://www.accessbell.co/wcag/2-4-11-focus-not-obscured-minimum | 2026-11-17 | queued | | New full criterion page, /wcag launch. |
| https://www.accessbell.co/wcag/2-5-7-dragging-movements | 2026-11-17 | queued | | New full criterion page, /wcag launch. GSC pos 20.0 (old /resources/wcag path). |
| https://www.accessbell.co/wcag/3-3-7-redundant-entry | 2026-11-17 | queued | | New full criterion page, /wcag launch. |

---
title: 'Find and Monitor Pages'
description: 'Use Found Pages to see every page AccessBell found on your domain, open each one, choose up to 500 to scan and monitor, and add missing pages by hand.'
order: 1
updatedDate: 2026-09-29
sources: ['sitemaps']
---

Each domain scans and monitors up to 500 pages. Monitored pages are scanned when you start a scan and automatically every day. The **Found Pages** screen is where you choose them.

## Open Found Pages

- On a new domain, select **Select pages & Scan** on [Your Domains](/app).
- For any domain, open the ⋮ menu on its row, or at the top right of the domain, and select **Manage domain pages**.

The first time it opens, AccessBell crawls the site: it reads your XML sitemap (the one you entered, those listed in `robots.txt` and `/sitemap.xml`, including sitemap index files) and follows the links on your home page. Up to 2,000 pages are kept per domain. Links to files such as PDFs and images are skipped, and only pages on the same domain are included, or its subdomains if you turned that on.

## Choose Pages to Scan

1. Tick the pages you want to scan, up to 500. Select **Open** on any row to view the page in a new tab first.
2. Use **Search pages** to find a page quickly. The checkbox at the top selects the pages shown, up to 500; **Clear selection** starts again.
3. Select **Start Scan**.

A **Scanning in progress** window shows how many pages are done. Keep the tab open until it finishes. When it does, Your Domains shows the domain's score, active and resolved issues and scan dates.

The pages you select become the domain's monitored pages. Pages you unselect stop being monitored, but their scan history is kept.

Good pages to choose first:

- The home page and main landing pages
- Pages with forms: sign-up, contact, checkout and account pages
- One example of each template, such as a product page, a blog post and a category page
- Pages that change often

Because most sites reuse templates, fixing an issue on one product page usually fixes it on all of them. [Component grouping](/resources/help-center/fixing-issues/component-grouping) shows you where this applies.

## If Pages Are Missing

- **Add pages by hand:** select **Add Pages**, enter one address per line (a full address or a path such as `/pricing`) and select **Add pages**.
- **Add your sitemap:** enter it under **XML sitemap** in [Scan settings](/resources/help-center/domains/scan-settings).
- **Password-protected pages:** add a login header in Settings. See [Scan staging and protected sites](/resources/help-center/domains/scan-staging-and-protected-sites).
- To leave out sections such as tag archives, use [URL rules](/resources/help-center/domains/include-and-exclude-url-rules).

## Who Can Do This

Members, Admins and the Owner can choose pages and start scans. Viewers can see the list but not change it.

## PDFs on Your Pages

Links to PDF files are not added as pages. AccessBell lists them on the **Documents** tab instead, where you can [check and fix PDF accessibility](/resources/help-center/scans-and-reports/pdf-accessibility-scanning).

For an overview of choosing and monitoring up to 500 URLs under one domain, see [URL monitoring](/solutions/url-monitoring).

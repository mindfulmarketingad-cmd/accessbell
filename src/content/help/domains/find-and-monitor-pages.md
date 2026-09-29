---
title: 'Find and Monitor Pages'
description: 'Discover the pages on your domain from its sitemap and links, choose up to 25 URLs to monitor, add URLs by hand and stop monitoring pages.'
order: 1
updatedDate: 2026-09-28
sources: ['sitemaps']
---

Each domain monitors up to 25 URLs. Monitored pages are scanned when you select Re-Scan and automatically every day. AccessBell helps you find the pages that matter most.

## Find Pages Automatically

1. Open the domain.
2. Open the menu (the three dots at the top right) and select **Find pages**.
3. AccessBell reads your XML sitemap and follows the links on your home page. It looks for sitemaps listed in `robots.txt` and at `/sitemap.xml`, including sitemap index files.
4. When it finishes, it tells you how many pages it found and how many are new.

Discovered pages appear in the **Pages** tab under **Discovered pages**, with where each one was found: Sitemap or Crawl. Up to 200 discovered pages are kept per domain. Links to files such as PDFs, images and documents are skipped.

Only pages on the same domain are included. To include subdomains such as `blog.example.com`, turn on **Include subdomains** in [Settings](/resources/help-center/domains/scan-settings). To leave out sections such as tag archives, use [URL rules](/resources/help-center/domains/include-and-exclude-url-rules).

## Choose Which Pages to Monitor

In **Discovered pages**, select **Monitor** next to a page. It moves to **Monitored URLs**.

Good pages to monitor first:

- The home page and main landing pages
- Pages with forms: sign-up, contact, checkout and account pages
- One example of each template, such as a product page, a blog post and a category page
- Pages that change often

Because most sites reuse templates, fixing an issue on one product page usually fixes it on all of them. [Component grouping](/resources/help-center/fixing-issues/component-grouping) shows you where this applies.

## Add a URL by Hand

1. Go to the **Pages** tab.
2. Under **Monitored URLs**, enter the page in **Add a URL**. You can type a full address or just the path, such as `/pricing`.
3. Select **Add and monitor**. The page is scanned straight away.

The page must be on the same domain, or a subdomain when subdomains are included.

## Stop Monitoring a Page

Select **Stop monitoring** next to the page. It moves back to Discovered pages and frees up one of your 25 slots. Its scan history is kept.

## Who Can Do This

Members, Admins and the Owner can find, add and monitor pages. Viewers can see them but not change them.

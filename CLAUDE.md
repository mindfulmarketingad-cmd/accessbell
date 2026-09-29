# AccessBell project notes

## SEO rules for every new page

Apply these to every new blog post, resource page or landing page. Pick one primary keyword per page first.

- **H1:** contains the keyword.
- **H2s:** the keyword (or a close variant) appears in several H2s, worded naturally.
- **First 100 words:** the keyword appears in the opening paragraph.
- **Title tag:** contains the keyword (`seoTitle` for blog posts, max 47 characters; `title` otherwise).
- **Meta description:** contains the keyword (blog `description`: 110 to 165 characters).
- **Body:** the keyword recurs naturally through the content. No stuffing.
- **Internal links:** link out to related pages, and add links *to* the new page from existing related pages, so nothing is orphaned. Run `npm run build && npm run audit:links`; it must report 0 orphan pages, 0 pages without internal links and 0 pages without outbound links.
- **Outbound links:** cite authoritative primary sources (W3C, ADA.gov, vendor pricing pages). Never invent sources, reviews, statistics or test results.

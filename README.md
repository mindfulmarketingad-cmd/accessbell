# AccessBell

Marketing site and free **website accessibility checker** for [accessbell.co](https://accessbell.co).

- **Site:** Astro 7, fully static HTML, no framework JavaScript (15 KB of plain scripts, loaded only on the pages that need them), self-hosted Inter font
- **Checker API:** Vercel serverless functions in `api/` (`/api/scan`, `/api/contact`)
- **Hosting target:** Vercel (`vercel.json` holds headers, redirects and function config)

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies (Node 22.12+) |
| `npm run dev` | Astro dev server at `localhost:4321` (pages only, no `/api`) |
| `npm run preview` | Production build plus a local server that mirrors `vercel.json` (headers, clean URLs, redirects) **and** runs the `/api` functions |
| `npm test` | Unit tests: SSRF guard, audit rules, contact validation, origin checks |
| `npm run assets` | Regenerate favicon, icons, `logo.png`, `logo.svg` and `og-default.png` from `public/favicon.svg` (needs Playwright) |

## Project layout

```
api/                 Vercel functions (thin handlers)
server/              Checker engine and security helpers
  audit.js           WCAG rules over parsed HTML (parse5)
  fetch-page.js      Size/time-limited page fetcher, manual redirects
  net-guard.js       SSRF protection (private IP ranges, connect-time DNS check)
  rate-limit.js      Per-instance rate limiter
  contact.js         Contact form validation and delivery (Resend)
  http.js            JSON responses, origin check, body limits
src/
  config/site.ts     Name, URL, nav, footer, social links
  data/pricing.ts    Plans, prices, comparison table
  data/reviews.ts    Verified reviews (empty until you add real ones)
  content/blog/      Blog posts (Markdown)
  lib/routes.ts      Single list of URLs feeding /sitemap and /sitemap.xml
  pages/             Routes
public/js/           Client scripts (external files so CSP can block inline JS)
tests/               node:test suites
```

## Deploying to Vercel

1. Import the repository in Vercel. The framework is detected as Astro; no adapter is needed.
2. Add the domain `accessbell.co` and `www.accessbell.co` (www redirects to the apex in `vercel.json`).
3. Set environment variables for the contact form (see `.env.example`):
   - `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` (verify the sending domain in Resend)
   - Without them the form shows a friendly error and points people to the email address.
4. In **Firewall**, add a rate-limit rule for `/api/*` (for example 20 requests per minute per IP). The built-in limiter is per instance only.

## Security

- **Strict CSP** with no `unsafe-inline`: every script and stylesheet is an external same-origin file. JSON-LD is a data block and is not executed.
- HSTS (preload-ready), `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff`, strict referrer policy, locked-down `Permissions-Policy`, COOP.
- **SSRF protection** on the scanner: only http/https on ports 80/443, no credentials in URLs, internal hostnames rejected, and every resolved IP is checked against private, loopback, link-local, metadata, CGNAT, multicast and reserved ranges (IPv4 and IPv6, including IPv4-mapped forms). The check runs inside the socket's DNS lookup, so DNS rebinding cannot swap in a private address. Redirects are followed manually and re-validated at every hop.
- Fetch limits: 12 s total, 5 redirects, 3 MB after decompression (compression bombs are cut off), HTML content types only.
- Scan results are rendered with `textContent` only, so hostile pages cannot inject markup.
- API: POST only, JSON only, body size caps, same-origin `Origin` check, per-IP rate limits, `Cache-Control: no-store`, generic error messages.
- Contact form: honeypot, minimum fill time, strict validation, CR/LF stripping (no header injection), plain-text email only.
- `/.well-known/security.txt` for vulnerability reports. `npm audit` reports 0 vulnerabilities.

## SEO

- Main keyword **website accessibility checker** in the homepage title, H1, meta description, intro, FAQ and as internal anchor text from every blog post.
- One H1 per page, titles under 60 characters, descriptions 138-160 characters, self-referencing canonicals, clean lowercase URLs without trailing slashes (`/Blog` 308-redirects to `/blog`).
- Structured data (`@graph`): Organization, WebSite, WebPage and BreadcrumbList on every page, plus SoftwareApplication with offers (home, pricing), FAQPage (home, pricing), Blog, BlogPosting, AboutPage and ContactPage. Review markup is only emitted once `src/data/reviews.ts` contains real reviews.
- `/sitemap.xml` with `lastmod`, `/robots.txt`, `/rss.xml`, HTML sitemap at `/sitemap`, Open Graph and Twitter cards with a 1200x630 image, web manifest and full favicon set.
- Accessibility: every page passes axe-core (WCAG 2.2 AA plus best practices) at desktop and mobile widths.

### Internal linking structure

```
Home (/)
├── Pricing (/pricing)            hub: plans, FAQ, links to disclaimer and contact
├── Blog (/blog)                  hub: lists every post
│   └── /blog/[slug]              each post links up to Blog and Home (breadcrumbs),
│                                 to Home with "website accessibility checker" anchor text,
│                                 to Pricing, and sideways to 2 related posts
├── Reviews (/reviews)
├── About (/about)                links to Home, Pricing, Blog and two cornerstone posts
└── Contact, Disclaimer, Privacy, Terms, Sitemap (footer on every page)
```

Every page links back up through breadcrumbs and the header. The homepage links down to the three newest posts and to every hub. Recommended next step: add a **Standards** hub (`/standards` with `/standards/wcag-2-2`, `/standards/ada`, `/standards/section-508`, `/standards/en-301-549`). The homepage legislation tabs and blog posts would link into it, giving each regulation keyword its own ranking page instead of competing blog posts.

## Adding a blog post

Create `src/content/blog/my-post-slug.md`:

```md
---
title: 'Post title (max 70 characters)'
seoTitle: 'Optional shorter <title> (max 60)'
description: '110-165 character meta description.'
pubDate: 2026-10-01
category: 'Guides'
related: ['wcag-2-2-checklist', 'ada-website-compliance-guide']
---
```

It appears automatically on `/blog`, the homepage (if among the newest three), `/sitemap`, `/sitemap.xml` and `/rss.xml`. Link to `/` with the anchor text "website accessibility checker" at least once.

## Before launch

- Replace the social profile URLs in `src/config/site.ts` with your real accounts.
- Configure the contact form env vars and the Vercel firewall rule.
- The plan buttons send visitors to `/contact?topic=trial&plan=...`; point them at your signup flow when it exists.
- Have a lawyer review `/privacy`, `/terms` and `/disclaimer`, and set the governing-law jurisdiction.
- Verify the site in Google Search Console and submit `https://accessbell.co/sitemap.xml`.
- After the site has been live on HTTPS for a while, submit the domain at hstspreload.org.

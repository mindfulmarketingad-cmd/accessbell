---
title: 'AccessBellFix Is Blocked by a Content Security Policy'
description: 'If your site has a Content-Security-Policy, allow www.accessbell.co in script-src and connect-src so AccessBellFix can load and apply your fixes.'
order: 5
updatedDate: 2026-09-30
sources: ['mdn-csp', 'w3c-csp']
---

A **Content Security Policy** (CSP) is a security setting that tells browsers which websites your pages may load scripts from and send requests to. If your site has one, it can block [AccessBellFix](/resources/help-center/getting-started/install-accessbellfix) until you allow AccessBell in it.

Many sites have no CSP, and AccessBellFix works on them without any change. This guide is for sites that do.

## Signs That a CSP Is Blocking AccessBellFix

- **Validate connection** says AccessBellFix is connected, but your fixes do not appear on the page and your next scan still reports the same issues. The connection check reads your page's code, so it finds the snippet even when the browser is not allowed to run it.
- Your browser's developer console shows a message such as `Refused to load the script 'https://www.accessbell.co/fix.js'` or `Refused to connect to 'https://www.accessbell.co/api/app/fix'`, mentioning `Content Security Policy`.

To open the console, right-click your page, choose **Inspect**, then select the **Console** tab and reload the page.

## What to Allow

AccessBellFix needs two things from your policy:

| Directive | Why | Add |
| --- | --- | --- |
| `script-src` | Loads the script, `fix.js` | `https://www.accessbell.co` |
| `connect-src` | Fetches the fixes you approved | `https://www.accessbell.co` |

If your policy has no `script-src` or `connect-src`, browsers use `default-src` instead. In that case, add `https://www.accessbell.co` to `default-src`, or add the two directives above.

Add AccessBell to what is already there. Do not remove your existing sources. For example, this policy:

```text
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com; connect-src 'self'
```

becomes:

```text
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com https://www.accessbell.co; connect-src 'self' https://www.accessbell.co
```

AccessBellFix does not need `style-src`, `img-src`, `unsafe-inline` or `unsafe-eval`. It only changes attributes such as `alt`, `aria-label` and `lang` on your existing elements.

## Where Your Policy Is Set

A CSP is either sent as an HTTP response header or written into the page as a `<meta http-equiv="Content-Security-Policy">` tag. Look in these places:

- **In the page:** search your site template for `Content-Security-Policy`. Edit the `content` value of the `<meta>` tag.
- **Cloudflare:** check **Rules** > **Transform Rules** for a response header rule that sets `Content-Security-Policy`.
- **Netlify:** the `_headers` file or the `[[headers]]` section of `netlify.toml`.
- **Vercel:** the `headers` section of `vercel.json` or `next.config.js`.
- **Nginx:** an `add_header Content-Security-Policy` line in your server configuration.
- **Apache:** a `Header set Content-Security-Policy` line in `.htaccess` or your virtual host.
- **WordPress:** a security plugin's HTTP headers settings, or your host's control panel.

Hosted builders such as Shopify, Wix, Squarespace and Webflow do not usually add a strict policy to your storefront. If you are unsure where yours comes from, send this page to your developer or hosting provider.

## Policies That Use a Nonce or strict-dynamic

Some policies allow only scripts that carry a one-time `nonce` value, often together with `'strict-dynamic'`. In that case, adding a domain is not enough for the script. Add your site's nonce to the snippet instead, the same way your other scripts get it:

```html
<script src="https://www.accessbell.co/fix.js" data-site="YOUR-SITE-KEY" nonce="YOUR-PAGE-NONCE" async></script>
```

You still need `https://www.accessbell.co` in `connect-src` so the script can fetch your fixes.

## Check That It Works

1. Save and publish the change, and clear any cache or CDN.
2. Reload a page with a fix, open the console and confirm there are no `Content Security Policy` messages about `accessbell.co`.
3. Run a new scan from your dashboard. Fixed issues move to **Fixed Elements** on the issue page.

If you use `Content-Security-Policy-Report-Only` to test changes first, the report-only header never blocks anything, so check the enforced `Content-Security-Policy` header too.

Still stuck? [Contact support](/resources/help-center/troubleshooting/contact-support) with your site address and a screenshot of the console message.

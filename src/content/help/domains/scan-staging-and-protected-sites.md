---
title: 'Scan Staging and Password-Protected Sites'
description: 'Use custom HTTP headers to scan staging environments and pages behind basic authentication or a login, and how AccessBell keeps those values safe.'
order: 4
updatedDate: 2026-09-29
sources: ['mdn-auth']
---

Testing on staging lets you catch accessibility issues before they go live. AccessBell can send custom HTTP headers with every request to your domain, which is how most staging and preview environments grant access.

## Add a Staging Domain

Add the staging address as its own domain, for example `staging.example.com`. See [Add your first domain](/resources/help-center/getting-started/add-your-first-domain).

## Add Custom Headers

1. Open the domain and go to **Settings**.
2. Under **Custom HTTP headers**, select **Add header**.
3. Enter the header name and value. Common examples:
   - **Basic authentication**: name `Authorization`, value `Basic` followed by a space and your base64-encoded `username:password`
   - **A bypass token**: for example `x-vercel-protection-bypass` with your token, or the header your host documents
   - **A session cookie**: name `Cookie`, value `session=...` copied from a signed-in browser
4. Select **Save settings**, then **Scan now**.

## How We Keep Header Values Safe

- Headers are only sent to your domain, never to third-party sites the page loads.
- Saved values are never shown again in the dashboard. They appear as asterisks. To change a value, type a new one. To keep it, leave the asterisks as they are.
- Only Admins and the Owner can view and change settings.

Use a dedicated test account or a token you can revoke, rather than a personal password.

## Pages Behind a Sign-in Form

If your site uses a sign-in form rather than headers, copy the session cookie from a signed-in browser into a `Cookie` header. Sessions expire, so you may need to update it from time to time. If scans of those pages start returning your sign-in page, the cookie has expired.

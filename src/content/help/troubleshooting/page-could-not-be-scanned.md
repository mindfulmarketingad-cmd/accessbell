---
title: 'A Page Could Not Be Scanned'
description: 'Common reasons an AccessBell scan fails, from bot protection and slow pages to private addresses and redirects, with the error messages and how to fix each one.'
order: 2
updatedDate: 2026-09-28
---

When a scan fails, the error message explains why. Failed scans appear in a page's history marked **Failed**. Here is what each message means.

## "The page took too long to respond"

The page did not finish loading within about 20 seconds. Check the page loads quickly in your browser, then scan again. Very heavy pages may need optimizing.

## "The website responded with HTTP 403" or Another Code

The server refused the request. Common causes:

- **Bot protection or a firewall**, such as Cloudflare, blocking automated visitors. Allow AccessBell in your firewall settings, or add a bypass header in [custom headers](/resources/help-center/domains/scan-staging-and-protected-sites).
- **A login or password** protects the page. Use custom headers.
- **404 Not Found**: the page no longer exists. Stop monitoring it or update the address.

## "That address points to a private network"

For security, AccessBell only scans public websites. Addresses such as `localhost`, `192.168.x.x` or internal company hostnames cannot be scanned. Publish a staging site on a public address protected by a header or password instead.

## "Only standard web ports (80 and 443) can be checked"

Addresses with a port number, such as `example.com:8080`, cannot be scanned. Use the standard address.

## "We could not find that domain"

The domain name does not exist or DNS is not set up. Check the spelling.

## "The site has an invalid or expired TLS certificate"

The site's HTTPS certificate has a problem. Browsers show a warning too. Renew or fix the certificate.

## "The page redirected too many times"

A redirect loop, often between `www` and non-`www`, or `http` and `https`. Fix the redirect rules on your server.

## The Scan Finished but Shows My Sign-in Page or a Cookie Wall

The scan tested what an anonymous visitor sees. Use custom headers to sign in, or accept cookies with a header your consent tool supports. A [page load delay](/resources/help-center/domains/scan-settings) can help if a banner loads late.

Still failing? [Contact support](/contact?topic=support) with the page address and the time of the scan.

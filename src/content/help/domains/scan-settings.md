---
title: 'Choose WCAG Version, Level and Devices'
description: 'Set the WCAG version and conformance level each domain is tested against, scan on desktop and mobile, and use page load delay and scrolling.'
order: 2
updatedDate: 2026-09-28
sources: ['new-in-22', 'understanding']
---

Every domain has its own scan settings. They apply to every scan of that domain, including scheduled monitoring. Open the domain and go to the **Settings** tab. Only Admins and the Owner can change settings.

## WCAG Version and Level

Choose the target you are held to:

- **WCAG version**: 2.2, 2.1 or 2.0
- **Conformance level**: A, AA or AAA

The default is **WCAG 2.2 Level AA**, which most organizations aim for today. Scans only run the rules inside your target, so if you choose WCAG 2.1 AA, rules that only exist in 2.2 or at Level AAA are not run. The [coverage table](/resources/help-center/scans-and-reports/wcag-coverage-table) also lists only the criteria in your target.

Not sure which to pick? See the WCAG comparison on our [homepage](/#versions-title), or use WCAG 2.2 AA. Meeting 2.2 AA also meets 2.1 AA and 2.0 AA.

## Devices

Choose **Desktop**, **Mobile** or both.

- Desktop scans use a 1280 by 900 pixel window.
- Mobile scans use a 390 by 844 pixel phone screen with touch enabled.

Some issues only appear on one layout, such as a mobile menu button with no name. Scanning both gives you the full picture, and each device counts as its own scan.

## Coverage Options

- **Include subdomains** lets you monitor pages such as `shop.example.com` under `example.com`, and includes them when finding pages.
- **Scroll the page before testing** scrolls to the bottom and back before the scan, so content that loads as you scroll is included.

## Page Load Delay

If your pages load content after a delay, such as a cookie banner, a chat widget or animations, set a delay in milliseconds, from 0 to 10,000. AccessBell waits this long after the page loads before testing. 2,000 (two seconds) is a good starting point for busy pages.

## Save

Select **Save settings**. The new settings apply to the next scan. Select **Re-Scan** to see the effect straight away.

Related: [Include and exclude URL rules](/resources/help-center/domains/include-and-exclude-url-rules) and [Scan staging and protected sites](/resources/help-center/domains/scan-staging-and-protected-sites).

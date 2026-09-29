---
title: 'Security and Your Data'
description: 'How AccessBell protects your account and scan data: secure sessions, what we store, how custom headers are handled, and signing out.'
order: 3
updatedDate: 2026-09-28
sources: ['stripe-security']
---

## Your Sign-in

- Your session is kept in secure, HTTP-only cookies that page scripts cannot read.
- Sessions refresh automatically while you are active. Select **Sign out** from the menu next to your name at the bottom of the sidebar to end one.
- Repeated sign-in attempts are rate limited to protect against password guessing.

## What We Store

For each domain we store its address, settings, the pages you add or we discover, and the results of every scan: scores, issues, failing code snippets and passed checks. We do not store full copies of your pages.

## Custom HTTP Headers

Header values you add for [staging and protected sites](/resources/help-center/domains/scan-staging-and-protected-sites) are only sent to your own domain, and they are never shown again in the dashboard after you save them.

## Scanning Is Safe for Your Site

A scan loads a page the way a visitor's browser does. It does not submit forms, click buttons or change anything on your site. Scans only reach public web addresses on standard ports, never private networks.

## Access Within Your Team

Everyone on a team can see all of its domains and results. Use the Viewer role for people who should not change anything. See [Invite teammates and set roles](/resources/help-center/account-and-team/invite-teammates-and-set-roles).

Read our [Privacy Policy](/privacy) for full details.

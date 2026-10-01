---
title: 'Use the Compliance Vault for Legal Evidence'
description: 'Export a Legal Evidence Package, browse 12 months of scan snapshots, keep a fix log with remediation notes, and verify a package has not been altered.'
order: 9
updatedDate: 2026-09-30
sources: ['ada-web', 'wai-evaluate']
---

The **Compliance Vault** tab on each domain keeps a dated record of your accessibility work. If you receive a demand letter or a lawsuit, it gives you and your lawyer evidence of what you tested, what you fixed and when. Open a domain and select **Compliance Vault**.

## Legal Evidence Package

Select **Export Evidence Package**, choose the period (the last 12 months by default) and select **Generate evidence package**. The package includes:

- Your testing program: the WCAG version and level, devices and daily scan schedule
- Every scan in the period, with monthly results
- Your score and open issues at the start and end of the period
- A remediation log: each issue found in one scan and gone in the next scan of the same page, with both dates
- Changes made in AccessBell and your remediation notes
- Fixes applied with AccessBellFix
- Your accessibility statement and the issues still open

Select **Save as PDF** to print it, or **Download ZIP bundle** for the complete record (`record.json`) plus spreadsheet-ready CSV files.

## Verify a Package

Each package is stored exactly as issued, with a record ID and a SHA-256 fingerprint of its `record.json` file. Anyone you share it with can check it has not been changed at the verification link printed on the package, or by computing the SHA-256 of `record.json` themselves.

## Historical Scan Archive

**View Scan History** shows one snapshot per month for the last 12 months: scans run, pages scanned, average score and average issues. Open a page on the **Pages** tab for its full scan history. See [scan history](/resources/help-center/scans-and-reports/scan-history).

## Proof of Fixes

**View Fix Log** lists every issue a scan confirmed as fixed, with the date it was last seen and the date it was confirmed gone. Use **Add a remediation note** to record work done outside AccessBell, such as a code change or a screen reader test, with the date it happened. Notes are included in every evidence package from then on.

## Accessibility Statement and Certificate

The **Accessibility Statement** card shows whether your statement is published and opens it for editing. See [create your accessibility statement](/resources/help-center/getting-started/create-your-accessibility-statement).

The **Accessibility Certificate** unlocks when every scanned page scores 100 in its latest scan. It states that the site passed every automated check on that date. It is not a certification of full WCAG conformance, which also needs manual testing.

## What the Vault Cannot Do

Automated testing detects many, but not all, WCAG failures, and an issue that is no longer detected may have been fixed or removed from the page. The vault documents your effort. It is not legal advice or a guarantee against claims.

PDFs linked from your site are checked separately. See [Check and fix PDF accessibility](/resources/help-center/scans-and-reports/pdf-accessibility-scanning).

To see how the vault fits with monitoring and fixes, read about the [Compliance Vault solution](/solutions/compliance-vault) and [continuous website accessibility monitoring](/solutions/continuous-monitoring).

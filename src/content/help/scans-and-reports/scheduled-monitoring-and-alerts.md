---
title: 'Scheduled Monitoring and Email Alerts'
description: 'How AccessBell rescans monitored pages every day, who receives email alerts about new serious issues, and what pauses monitoring.'
order: 7
updatedDate: 2026-09-28
---

Websites change all the time, and every change can introduce a new barrier. AccessBell rescans your monitored pages automatically so you hear about problems quickly.

## When Scans Run

Every monitored page on every domain is rescanned once a day, starting at 06:00 UTC. A domain's Overview shows the **Next scheduled scan**. Scheduled scans use the domain's current [settings](/resources/help-center/domains/scan-settings), including devices and custom headers.

You can also scan at any time with **Re-Scan**. Rescans are unlimited under fair use.

## Email Alerts

After a scheduled scan, AccessBell compares the results with the page's previous scan. If a **critical** or **serious** issue appears that was not there before, we email the account's **Owner** and **Admins** with the page and the new issues.

You are not emailed about issues that were already there, or about moderate and minor issues, so alerts stay meaningful.

To receive alerts, ask the Owner to give you the Admin role. See [Invite teammates and set roles](/resources/help-center/account-and-team/invite-teammates-and-set-roles).

## What Pauses Monitoring

- The subscription is not active, for example after cancelling or when a payment has failed. See [Failed payments](/resources/help-center/billing/failed-payments).
- The page is no longer monitored.

Monitoring restarts on the next daily run once the subscription is active again.

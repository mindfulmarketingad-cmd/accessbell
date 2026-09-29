---
title: 'Fix Once With Component Grouping'
description: 'How AccessBell groups the same failing element found on several pages, so you can fix a shared header, footer or template once and clear every page.'
order: 3
updatedDate: 2026-09-29
sources: ['apg']
---

Most websites are built from shared components: a header, a footer, a product card, a newsletter form. When one of them has an accessibility issue, it fails on every page that uses it.

## How Grouping Works

AccessBell looks at each failing element's tag and classes, for example `button.nav__toggle`, and groups identical elements with the same issue across your monitored pages. When the same element fails on two or more pages, it appears under **Component grouping** at the bottom of the domain's Overview, with the number of pages affected.

## How to Use It

1. Start with the group that affects the most pages.
2. Find the component in your code by searching for its class name.
3. Fix it once, deploy, and select **Scan now**.

One fix can clear dozens of failing elements. It is the fastest way to raise your score.

## Tips

- Groups are based on the pages you monitor. Monitoring one example of each template gives you a clear picture without using all 25 slots.
- If a component has no class names, it may be grouped only by its tag. Look at the code example in the Issues tab to identify it.

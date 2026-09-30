---
title: 'Add the PageAssist Accessibility Toolbar to Your Site'
description: 'Turn on the PageAssist accessibility toolbar so visitors can change text size, contrast, spacing, fonts, link highlighting and animations to suit their needs.'
order: 7
updatedDate: 2026-09-30
sources: ['resize-text', 'text-spacing', 'mdn-reduced-motion', 'understanding']
---

The **PageAssist accessibility toolbar** is a small button that appears in a corner of your website. Visitors open it to change how your pages look for them: bigger text, stronger contrast, more space between lines, an easier font, highlighted links or no animations. Each visitor's choices are saved in their own browser and apply only to them.

The PageAssist accessibility toolbar comes with your plan. It runs through [AccessBellFix](/resources/help-center/getting-started/install-accessbellfix), so there is nothing extra to install once the snippet is on your site.

## What the PageAssist Accessibility Toolbar Offers Visitors

| Setting | What it changes |
| --- | --- |
| **Text size** | Makes the whole page larger in four steps, up to 160%. |
| **Colors** | High contrast, Dark or Grayscale. Images and video keep their normal colors in Dark mode. |
| **Text spacing** | Line height, paragraph, letter and word spacing set to the values in [WCAG 1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html). |
| **Readable font** | Switches body text to a plain, wide sans-serif font. |
| **Highlight links** | Underlines and outlines links and gives them a yellow background so they are easy to spot. |
| **Stop animations** | Pauses CSS animations, transitions and smooth scrolling. |

**Reset all** returns everything to normal. Visitors can open and use the toolbar with a keyboard or a screen reader, and **Escape** closes it.

## Turn On the PageAssist Accessibility Toolbar

1. [Install AccessBellFix](/resources/help-center/getting-started/install-accessbellfix) on your site, if you have not already.
2. Open your domain and select the **Settings** tab.
3. Under **PageAssist toolbar**, tick **Show the PageAssist toolbar on my site**.
4. Choose **Bottom right** or **Bottom left**, then select **Save toolbar settings**.

Reload your site. The toolbar button appears within a few seconds. Owners and admins can change this setting. See [roles](/resources/help-center/account-and-team/invite-teammates-and-set-roles).

To remove it, untick the box and save. The button disappears on the next page load.

## What the Toolbar Does Not Do

The PageAssist accessibility toolbar is a comfort tool for visitors. It does **not** fix your code, and it does not make your website conform to WCAG or the ADA. A missing form label, an image without alt text or a menu that does not work with a keyboard is still broken for everyone, with or without the toolbar.

Keep fixing the issues AccessBell finds. [Read an issue](/resources/help-center/fixing-issues/read-an-issue) to see the failing code and how to change it, and use the [Compliance Vault](/resources/help-center/scans-and-reports/compliance-vault) to record your fixes. Your own site should also respect the visitor's system settings, such as [reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) and [text resized to 200%](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), without needing the toolbar.

## Sites With a Content Security Policy

The toolbar needs the same permissions as AccessBellFix and nothing more. If your site has a strict policy, follow [AccessBellFix and Content Security Policy](/resources/help-center/troubleshooting/accessbellfix-content-security-policy).

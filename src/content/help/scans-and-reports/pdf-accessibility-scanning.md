---
title: 'Check and Fix PDF Accessibility'
description: 'AccessBell finds the PDFs linked from your website, runs PDF accessibility checks on each one and fixes the title and language for you. Learn what each check means.'
order: 10
updatedDate: 2026-09-30
sources: ['pdf-techniques', 'pdf-title', 'pdf-lang', 'pdf-alt', 'understanding']
---

Menus, price lists, forms and policies are often shared as PDF files, and WCAG applies to them just as it does to web pages. To check a single file without an account, try the free [PDF accessibility checker](/resources/pdf-accessibility-checker). **PDF accessibility** checks in AccessBell find the PDFs linked from your website, test each file and show you what to fix. Some fixes AccessBell can make for you.

## Where AccessBell Finds PDFs

Each time AccessBell crawls or scans your pages, it notes every link to a PDF on the same website. They are listed on your domain's **Documents** tab, with the page each one was linked from. You can also add a PDF yourself: paste its address into **Add a PDF by address**.

PDFs are checked when you ask, not on the daily schedule. Select **Check all PDFs** after a scan to check any new or changed files, or **View** on one PDF and then **Check now**.

## The PDF Accessibility Checks

| Check | Severity | What it looks for |
| --- | --- | --- |
| **Tagged PDF** | Critical | The file has a tag structure, so screen readers can tell headings, lists, tables and reading order apart. |
| **Real text** | Critical | Pages contain text, not only a scanned image. A scanned page is a picture of words, which screen readers cannot read. |
| **Alt text on figures** | Critical | Tagged images have alternative text ([W3C technique PDF1](https://www.w3.org/WAI/WCAG22/Techniques/pdf/PDF1)). |
| **Not locked** | Critical | Security settings do not block assistive technology from reading the content. |
| **Document title** | Serious | The file has a title ([PDF18](https://www.w3.org/WAI/WCAG22/Techniques/pdf/PDF18)). |
| **Document language** | Serious | The file says which language it is written in ([PDF16](https://www.w3.org/WAI/WCAG22/Techniques/pdf/PDF16)). |
| **Form field labels** | Serious | Every form field has a name that is read out. |
| **Title shown in the window** | Moderate | PDF readers show the title rather than the file name. |
| **Tab order** | Moderate | Pages with links or fields follow the document structure when a keyboard user presses Tab. |
| **Bookmarks** | Moderate | Longer documents have bookmarks for moving between sections. |

Each result links to the WCAG success criteria it relates to and explains how to fix it. Like any automated check, these tests cannot confirm that tags are in the right order or that alt text is accurate. Open the file with a screen reader, or in Adobe Acrobat's accessibility checker, before you rely on it. The [W3C PDF techniques](https://www.w3.org/WAI/WCAG22/Techniques/#pdf) describe each requirement in detail.

## Fix PDF Accessibility Issues With AccessBell

AccessBell can fix three things for you: the **document title**, the **language** and **showing the title in the window**.

1. On the **Documents** tab, select **View** next to the PDF.
2. Under **Fix this PDF**, check the suggested title and language. Use a language code such as `en`, `en-US` or `es`.
3. Select **Download fixed PDF**. You get a copy named `<file name>-accessible.pdf`.
4. Replace the file on your website with the fixed copy, keeping the same address, then select **Check again**.

The fix happens in your browser. Nothing else in the file changes, and the file is never stored by AccessBell.

AccessBell reads the file from your website for you when it is up to 3 MB. For a larger file, or one that is not public, choose your own copy in **Your copy of the PDF (optional)** first.

## PDF Accessibility Issues You Fix in the Source

Tags, alt text, form labels, tab order and bookmarks need the original document. Fix them where the PDF was made, then export it again:

- **Microsoft Word:** add alt text to images and use built-in heading styles. Then choose **File** > **Save As** > **PDF**, open **Options** and tick **Document structure tags for accessibility**.
- **Google Docs:** use heading styles and add alt text, then download as PDF. Check the downloaded file for tags, since not every editor exports them.
- **Adobe Acrobat Pro:** use **Accessibility** > **Autotag Document**, then review the tags, add alt text and set the reading order.
- **Scanned documents:** run text recognition (OCR), or better, publish the content as a web page.

Record what you changed in the [Compliance Vault](/resources/help-center/scans-and-reports/compliance-vault) so your fix history includes your documents. For issues on web pages rather than PDFs, see [how to read an issue](/resources/help-center/fixing-issues/read-an-issue).

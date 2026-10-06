---
title: 'How to Create a Website Accessibility Report (What to Include)'
seoTitle: 'How to Create a Website Accessibility Report'
description: 'How to create a website accessibility report: what to include, the W3C report template, VPAT and ACR formats, and how to generate a report from scan results.'
pubDate: 2026-10-06
category: 'Guides'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-10-06
    note: 'First published. Report structure checked against the W3C WCAG-EM methodology, the WAI report template and the WCAG-EM Report Tool. VPAT editions and conformance levels checked against ITI and Section508.gov.'
related: ['how-to-check-if-website-is-ada-compliant', 'automated-vs-manual-accessibility-testing', 'what-is-a-website-accessibility-checker']
faqs:
  - q: 'What is a website accessibility report?'
    a: 'A document that records how a website was tested for accessibility, which pages were checked, which WCAG success criteria were met or failed, and what needs fixing. It is used by developers to fix issues and by managers, clients, auditors and lawyers as evidence of the testing.'
  - q: 'Is there a free accessibility report generator?'
    a: 'Yes. The W3C WCAG-EM Report Tool is free and builds a structured report from your answers as you follow the WCAG-EM steps. It does not test the site for you. Automated checkers, including AccessBell, can export scan results that you add to the report.'
  - q: 'What is the difference between an accessibility report and a VPAT?'
    a: 'A VPAT is a template from the Information Technology Industry Council. Once it is filled in with test results, it becomes an Accessibility Conformance Report (ACR), a standard format buyers ask for, especially in government purchasing. An accessibility audit report is usually more detailed and aimed at fixing issues.'
  - q: 'Can I write an accessibility report from an automated scan alone?'
    a: 'You can report the automated results, but the report should say clearly that automated testing covers only part of WCAG. A report that claims full conformance needs manual testing of the criteria a scanner cannot judge.'
---

A website accessibility report records how you tested a site, what you found and what you are doing about it. Clients ask for one before they sign off a project, procurement teams ask for one before they buy, and an attorney will ask for one the moment a demand letter arrives. This guide explains how to create a website accessibility report that people can trust: what to include, which formats are standard, and how to generate a report from your scan results instead of starting from a blank page.

## What a Website Accessibility Report Is For

The same testing can produce different reports for different readers:

- **An audit report** for your developers and content team, listing each issue, where it is and how to fix it.
- **A summary report** for managers and clients: the scope, the overall result, the most serious problems and the plan.
- **A conformance report**, such as a VPAT-based Accessibility Conformance Report, for buyers who need to compare products in a standard format.
- **An evidence record** showing what was tested and fixed, and when, in case you ever face a complaint.

Decide who the report is for before you start. It changes how much detail you need and which format to use.

## What to Include in a Website Accessibility Report

The W3C's [Website Accessibility Conformance Evaluation Methodology (WCAG-EM)](https://www.w3.org/WAI/test-evaluate/conformance/wcag-em/) sets out five steps for an evaluation: define the scope, explore the website, select a representative sample, evaluate the sample, and report the findings. A good website accessibility report follows the same structure.

### 1. Scope and Conformance Target

State exactly what was tested and against what:

- The website or section (for example "www.example.com, excluding the staff intranet")
- The standard and level, such as WCAG 2.2 Level AA or WCAG 2.1 Level AA
- The dates of testing and who did it
- The browsers, devices and assistive technology used, such as Chrome on Windows with NVDA, or Safari on iPhone with VoiceOver

### 2. The Pages and Processes You Tested

List the pages in your sample and why you picked them. Include each template (home page, product page, article, form) and every complete process a user has to finish, such as checkout or account sign-up. WCAG-EM also recommends adding a few randomly chosen pages to check that your sample is representative.

### 3. Results by WCAG Success Criterion

For each success criterion, record whether it passed, failed or does not apply, with notes on any failure. A table works well:

| Criterion | Result | Where | Notes |
| --- | --- | --- | --- |
| [1.1.1 Non-text Content](/resources/wcag/1-1-1-non-text-content) | Fail | Product pages | 14 product photos have no alt text |
| [1.4.3 Contrast (Minimum)](/resources/wcag/1-4-3-contrast-minimum) | Fail | Footer | Gray footer links on white are 3.2:1 |
| [2.1.1 Keyboard](/resources/wcag/2-1-1-keyboard) | Pass | All pages | Checked with keyboard only |
| 1.2.2 Captions (Prerecorded) | Not applicable | | No video on the site |

The figures in that table are examples to show the format, not real results.

### 4. Issue Details for Developers

For each failure, give enough detail to fix it: the page URL, the element (a CSS selector or a code snippet), what is wrong, the WCAG criterion and how serious it is. Grouping repeated issues by template saves a lot of time, because one fix to a shared header or product card fixes every page that uses it.

### 5. Method and Limitations

Say which parts were tested automatically and which by hand. Automated tools cannot judge every WCAG criterion, so be clear about what was checked by a person. Our guide to [automated vs manual accessibility testing](/blog/automated-vs-manual-accessibility-testing) explains where each fits.

### 6. Summary and Next Steps

End with a plain-English summary: the overall result, the most serious problems, who will fix them and by when, and the date of the next test.

## Free Website Accessibility Report Templates and Generators

You do not have to design a report format from scratch:

- **W3C report template.** The W3C publishes a free [template for accessibility evaluation reports](https://www.w3.org/WAI/test-evaluate/report-template/) that follows WCAG-EM.
- **WCAG-EM Report Tool.** The free [WCAG-EM Report Tool](https://www.w3.org/WAI/news/2020-01-22/wcag-em-report-tool/) is a report generator from the W3C. It walks you through the five WCAG-EM steps and builds a structured report from your answers. It does not test the website for you, so you still need to do the testing.
- **VPAT.** The Information Technology Industry Council publishes the free [Voluntary Product Accessibility Template (VPAT)](https://www.itic.org/policy/accessibility/vpat).

## Website Accessibility Reports in VPAT and ACR Format

If you sell software or a web service to government agencies, universities or large companies, they will often ask for an Accessibility Conformance Report (ACR). An ACR is a VPAT filled in with your test results. Section508.gov has a guide on [how to create an ACR with a VPAT](https://www.section508.gov/sell/how-to-create-acr-with-vpat/).

ITI publishes the VPAT in four editions: **508** for the US Section 508 standards, **EU** for EN 301 549, **WCAG** for the WCAG guidelines alone, and **INT**, which combines them. For each criterion you choose one of four conformance levels:

- **Supports.** The product meets the criterion without known defects, or meets it with equivalent facilitation.
- **Partially Supports.** Some functionality does not meet the criterion.
- **Does Not Support.** Most functionality does not meet the criterion.
- **Not Applicable.** The criterion does not apply to the product.

An ACR is only as good as the testing behind it. Buyers increasingly check them, so "Supports" should mean you tested it, not that you assumed it.

## How to Generate a Website Accessibility Report From Scan Results

Writing up every failure by hand is slow. A faster way to create a website accessibility report is to start from automated results and add your manual findings:

1. **Scan every page in your sample.** The free [Website Accessibility Checker](/#scan) scans one URL at a time against WCAG 2.2, WCAG 2.1, ADA, Section 508 or EN 301 549. Use the [WCAG 2.2 AA Checker](/tools/wcag-2-2-aa-checker) if WCAG 2.2 is your target.
2. **Do the manual checks** for keyboard use, zoom, forms, alt text quality and captions. Our step-by-step guide on [how to check if your website is ADA compliant](/blog/how-to-check-if-website-is-ada-compliant) covers each one.
3. **Combine both into the report structure above,** and mark which results came from automated testing and which from manual testing.
4. **Check any PDFs** linked from the site with the free [PDF Accessibility Checker](/tools/pdf-accessibility-checker) and add them to the report.

### Reports in AccessBell

With an AccessBell subscription, the report builds itself as you monitor your site. You can:

- **Export a CSV** of every issue with its severity, WCAG criteria, affected pages and how to fix it, ready for Excel, Google Sheets or your issue tracker
- **Save a PDF summary** with the overview, scan history, the WCAG coverage table and every issue with its fix
- **Export a Legal Evidence Package** from the [Compliance Vault](/solutions/compliance-vault), with your testing program, every scan in the period, a log of fixes with dates, your remediation notes and your accessibility statement. Each package has a record ID and a SHA-256 fingerprint so anyone can check it has not been changed.

AccessBell helps you spot accessibility issues, fix them and document the work. Like any automated tool, it cannot confirm full WCAG conformance on its own, so add your manual testing to the report. [Start a 3-day free trial](/app/signup) to scan up to 500 URLs per domain and export your first report today.

## How to Prioritize Issues in Your Accessibility Report

A long list of failures is hard to act on. Rank the issues in the report so the team fixes what matters most first:

1. **Blockers in key tasks.** Anything that stops someone completing checkout, a booking, a sign-up or a contact form. A checkout button that cannot be reached with a keyboard comes before a decorative image with no alt text.
2. **Critical and serious issues on shared templates.** One fix to a header, footer or product card template removes the issue from every page that uses it.
3. **Issues on your most visited pages.** Use your analytics to see which pages people actually use.
4. **Everything else, by severity.** Work through moderate and minor issues on a schedule.

Most automated tools, including AccessBell, label each issue as critical, serious, moderate or minor. Keep those labels in your report and add a target fix date and an owner for each group of issues, so the report doubles as a plan.

## Common Mistakes in Website Accessibility Reports

- **Claiming full compliance from an automated scan.** Automated tools cannot test every criterion. Say what was tested by hand.
- **No scope or dates.** A report without a date, a standard and a list of pages tested is hard for anyone to rely on.
- **Listing issues without locations.** "Some images lack alt text" does not help a developer. Give the page and the element.
- **Never updating it.** A report describes the site on the day it was tested. Retest after major changes and keep the history.

---
title: 'The European Accessibility Act: Technical Aspects of Compliance'
seoTitle: 'European Accessibility Act Technical Guide'
description: 'The European Accessibility Act for technical teams: who it covers, EN 301 549 and WCAG requirements, exemptions, national rules and a compliance checklist.'
pubDate: 2026-10-01
category: 'Compliance'
contributors:
  - author: anton-stewart
    role: Author
history:
  - date: 2026-10-01
    note: 'First published. Checked against Directive (EU) 2019/882, the EN 301 549 V4.1.1 publication notice and national transposition sources as of October 2026. This article is general information, not legal advice.'
related: ['ada-website-compliance-guide', 'what-you-should-know-about-wcag-2-2', 'ada-website-accessibility']
faqs:
  - q: 'What is the European Accessibility Act?'
    a: 'The European Accessibility Act (EAA), Directive (EU) 2019/882, is an EU law that sets common accessibility requirements for key products and services, such as e-commerce, consumer banking, e-books, passenger transport services, computers, smartphones and self-service terminals. It has applied since June 28, 2025, through each member state''s national law.'
  - q: 'Does the European Accessibility Act apply to US and other non-EU companies?'
    a: 'Yes, if they sell covered products or provide covered services to consumers in the EU. Where a business is based does not matter; where its customers are does.'
  - q: 'Which technical standard should I follow for EAA compliance?'
    a: 'EN 301 549, the European standard for ICT accessibility. For websites and apps, it is built on WCAG. Version 3.2.1 uses WCAG 2.1 Level AA, and the new version 4.1.1, published in September 2026 for the EAA, uses WCAG 2.2 Level AA. Testing to WCAG 2.2 AA covers both.'
  - q: 'Are small businesses exempt from the EAA?'
    a: 'Microenterprises that provide services, meaning fewer than 10 employees and annual turnover or balance sheet of no more than 2 million euros, are exempt from the service requirements. Microenterprises that make or sell covered products are not exempt, although they have lighter obligations.'
  - q: 'What are the penalties for not complying with the EAA?'
    a: 'Each member state sets its own penalties, which must be effective, proportionate and dissuasive. Germany''s law, for example, allows fines of up to 100,000 euros for certain breaches, and authorities can also order non-compliant products or services off the market.'
---

**The European Accessibility Act** (EAA) is the EU law that requires many everyday products and digital services, from online shops and banking apps to e-readers and ticket machines, to be accessible to people with disabilities. It has applied since June 28, 2025. Meeting it is mostly a technical job: building and testing websites, apps and devices against a European standard, documenting the result and keeping it up to date. This guide covers the technical aspects of compliance with the European Accessibility Act for developers, product owners and compliance teams, and how [AccessBell](/) helps with the web and document parts.

> This article is general information, not legal advice. National laws differ, so confirm the rules in each country where you sell.

<figure>
  <img src="/blog/european-accessibility-act-technical-compliance/eaa-timeline.svg" width="960" height="330" alt="European Accessibility Act timeline: April 2019, Directive (EU) 2019/882 adopted. June 28, 2022, deadline for member states to write it into national law. June 28, 2025, the EAA applies to new products and services. September 2, 2026, EN 301 549 version 4.1.1 published, based on WCAG 2.2. End of 2026, version 4.1.1 expected to be cited in the Official Journal. June 28, 2030, the main transition period for existing service contracts and products ends.">
  <figcaption>Key dates for European Accessibility Act compliance.</figcaption>
</figure>

## What Is the European Accessibility Act?

The European Accessibility Act is [Directive (EU) 2019/882](https://eur-lex.europa.eu/eli/dir/2019/882/oj), adopted in 2019. As a directive, it does not apply on its own: each member state wrote it into national law, such as Germany's Barrierefreiheitsstärkungsgesetz (BFSG). The goal is one set of accessibility requirements across the EU, instead of 27 different ones, so that businesses can build once and sell everywhere.

The EAA sits alongside the [Web Accessibility Directive](https://eur-lex.europa.eu/eli/dir/2016/2102/oj), which has covered public sector websites and apps since 2018. The EAA extends similar requirements to the private sector.

## Who and What the European Accessibility Act Covers

The EAA applies to businesses that place covered products on the EU market or provide covered services to consumers in the EU, wherever the business is based.

**Products** include:

- Computers, laptops, tablets and their operating systems
- Smartphones and other consumer devices for electronic communications
- Self-service terminals such as ATMs, ticket machines and check-in kiosks
- E-readers and TV equipment for digital television services

**Services** include:

- E-commerce: selling products or services to consumers online
- Consumer banking services, including online and mobile banking
- E-books and the software used to read them
- Electronic communications, such as phone and messaging services, and access to audiovisual media services
- Websites, mobile apps, e-tickets and travel information for air, bus, rail and waterborne passenger transport

For most businesses reading this, the website and app are the heart of it: if you sell to EU consumers online, your online store is an e-commerce service under the European Accessibility Act.

**Microenterprises** that provide services, with fewer than 10 employees and annual turnover or balance sheet of no more than 2 million euros, are exempt from the service requirements. The exemption does not cover products.

## European Accessibility Act Technical Requirements

The EAA's accessibility requirements, in Annex I of the directive, are written as outcomes rather than code-level rules. They follow the same four principles as the Web Content Accessibility Guidelines (WCAG): products and services must be **perceivable, operable, understandable and robust**. In practice, that means:

- **Websites and apps** work with screen readers, keyboards and other assistive technology, have text alternatives for images, sufficient contrast, clear labels and a logical structure.
- **Information about the service** is accessible too, including how it works, its accessibility features and how it connects with assistive technology.
- **Documents and media** that are part of the service, such as e-tickets, statements and contracts, are accessible, and video has captions where needed.
- **Products** offer more than one way to interact, for example speech output on a ticket machine for people who cannot see the screen.
- **Support services,** such as help desks and call centers, give information about accessibility features in accessible formats.

## EN 301 549: The Technical Standard Behind EAA Compliance

The directive says what must be achieved. The European standard **EN 301 549** says how to test it. Products and services that meet a harmonised standard cited in the EU's Official Journal are presumed to meet the matching EAA requirements, which is why EN 301 549 is the technical benchmark for compliance.

For web content, EN 301 549 reuses WCAG:

| EN 301 549 version | Published | Web requirements | Status |
| --- | --- | --- | --- |
| **V3.2.1** | 2021 | WCAG 2.1 Level A and AA | Cited in the Official Journal under the Web Accessibility Directive |
| **V4.1.1** | September 2, 2026 | WCAG 2.2 Level A and AA | Written for the EAA; citation in the Official Journal expected around the end of 2026 |

Version 4.1.1 is the first edition developed specifically for the European Accessibility Act, with an annex mapping its clauses to the EAA's requirements ([National Disability Authority, Ireland](https://nda.ie/news/en301549-published)). For web teams, the main change is the six new WCAG 2.2 Level A and AA success criteria, such as [target size](/blog/wcag-2-5-8-target-size-minimum) and [accessible authentication](/blog/wcag-3-3-8-accessible-authentication-minimum). Our guide to [what you should know about WCAG 2.2](/blog/what-you-should-know-about-wcag-2-2) covers each one.

The practical advice: **test to WCAG 2.2 Level AA now.** It meets the new version and covers WCAG 2.1 AA as well. EN 301 549 also has clauses beyond the web, including documents (Clause 10), software and mobile apps (Clause 11) and documentation and support (Clause 12). See our [EN 301 549 checker](/resources/en-301-549-checker) for an overview.

## The Accessibility Information Requirement

Service providers must explain how their service meets the accessibility requirements, under Annex V of the directive. This usually goes in your general terms and conditions or an accessibility statement on your website, and should include:

- A general description of the service in accessible formats
- How the service meets the relevant accessibility requirements
- Information a person needs to understand how the service works

Our free [accessibility statement generator](/resources/statement-generator) creates a starting point you can adapt, and AccessBell can keep it updated from your scan results.

## Exceptions and Transition Periods

The European Accessibility Act allows a few exceptions, but they are narrow and must be justified:

- **Fundamental alteration:** a requirement does not apply if meeting it would fundamentally change the nature of the product or service.
- **Disproportionate burden:** a business may claim that a requirement would impose a disproportionate burden, based on a documented assessment of costs and benefits. Product makers must notify the market surveillance authorities. The assessment must be renewed periodically.
- **Transition periods:** service contracts agreed before June 28, 2025 may continue unchanged until they end, for no more than five years. Member states may also allow self-service terminals already in use to continue until the end of their economic life, up to 20 years.

Keep in mind that an exception covers only the specific requirement concerned, not the whole product or service, and that you need written evidence for it.

## Country-Specific Requirements

Because the EAA is a directive, each member state has its own law, enforcement authority and penalties. The core requirements are the same, but details differ:

- **Germany:** the Barrierefreiheitsstärkungsgesetz (BFSG) allows fines of up to 100,000 euros for certain breaches, and authorities can order a non-compliant service to stop.
- **Other member states** have their own national acts and market surveillance authorities, with different penalty levels and complaint procedures.

If you sell across the EU, follow the strictest common technical standard, EN 301 549, and check each country's enforcement rules with local counsel.

## EAA Technical Compliance Checklist

1. **Map what is in scope.** List your consumer-facing products, websites, apps, documents and support channels in the EU.
2. **Audit against EN 301 549.** [Run a free scan](/#scan) for a first view, then test every page against WCAG 2.2 AA, plus a manual review with a keyboard and screen reader. Our [EN 301 549 checker](/resources/en-301-549-checker) runs the web checks.
3. **Fix the critical barriers first,** starting with checkout, sign-up, log-in and payment journeys.
4. **Check your documents,** such as PDF terms, invoices and e-tickets, with the free [PDF accessibility checker](/resources/pdf-accessibility-checker).
5. **Publish accessibility information** and a way for users to report problems.
6. **Document any exception,** with the assessment behind it.
7. **Train your teams,** including designers, developers, content editors and support staff.
8. **Monitor continuously.** Every release can add new barriers, so test on a schedule and keep dated records.

## How AccessBell Helps With European Accessibility Act Compliance

AccessBell covers the web and document parts of EAA compliance:

- **An EN 301 549 preset,** or WCAG 2.2 or 2.1 at Level A, AA or AAA, applied to every page of your site, up to 500 URLs per domain.
- **Code-level fixes** for each issue, with the failing HTML, the WCAG success criterion and a corrected example.
- **PDF checks** for documents linked from your pages, with title and language fixes.
- **Scheduled monitoring** so new releases are checked, with email alerts.
- **The Compliance Vault,** with dated scan records, a fix log and exportable evidence for regulators or customers.
- **An accessibility statement** that updates from your results.

It does not test hardware, native mobile apps or phone support, and automated testing cannot check every requirement, so pair it with manual testing. Watch the [AccessBell demo](/pricing) on the pricing page, then [start your 3-day free trial](/app/signup).

## Challenges and Opportunities of EAA Compliance

The hardest parts are usually legacy systems, third-party components such as payment widgets and booking engines, and keeping new releases compliant. Plan for them early, and ask your vendors for their own EN 301 549 conformance information.

The upside is real. The European Commission estimates that around 87 million people in the EU have some form of disability ([EU Strategy for the Rights of Persons with Disabilities](https://op.europa.eu/webpub/empl/together-for-rights/en)), and accessible design also helps older customers and anyone on a small screen or a slow connection. Teams that build to EN 301 549 once can serve the whole EU market with one product.

For the U.S. side of the same work, see our [ADA website compliance guide](/blog/ada-website-compliance-guide) and [ADA website accessibility](/blog/ada-website-accessibility) workflow.

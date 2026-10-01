---
title: 'Received an ADA Demand Letter? Here Is What to Do First'
seoTitle: 'ADA Demand Letter: What to Do First'
description: 'Got an ADA website demand letter? Here is exactly what to do in the first week, what it typically costs to resolve, and how to avoid the next one.'
pubDate: 2026-09-28
category: 'Compliance'
contributors:
  - author: joseph-edwards
    role: Author
history:
  - date: 2026-09-28
    note: 'First published. Lawsuit filing counts checked against Seyfarth Shaw''s ADA Title III tracker; settlement figures checked against multiple independent sources and given as ranges.'
related: ['ada-lawsuit-process', 'ada-title-iii-law-for-businesses']
faqs:
  - q: 'What is an ADA demand letter?'
    a: 'A letter, usually from an attorney representing someone with a disability, stating that they tried to use your website and could not because of specific accessibility barriers, and demanding that you fix them and often pay a settlement, before a lawsuit is filed.'
  - q: 'Should I respond directly to the person who sent the demand letter?'
    a: 'Not without legal advice. A quick reply promising to fix things, or arguing about the claims, can be used as evidence later. Have an attorney review the letter and handle the response.'
  - q: 'Does installing an overlay widget make the demand letter go away?'
    a: 'No, and it can work against you. Overlays run in the browser and do not change your site''s code, so the underlying barriers the letter describes are usually still there. Many settlements specifically require overlays to be removed. See our breakdown of the FTC''s findings on accessiBe for why regulators and courts have taken a skeptical view of overlay-only fixes.'
  - q: 'How much does it typically cost to resolve a demand letter?'
    a: 'Figures vary by source and case, but industry data commonly puts demand-letter-stage resolutions in the range of a few thousand to about $20,000, often $5,000 to $15,000 for small businesses, plus a commitment to fix the issues within 90 to 180 days. Costs rise sharply if the matter proceeds to a filed lawsuit, and rise further still for a class action. Treat any figure as a rough range: your attorney will give you a number based on your actual situation.'
  - q: 'Can I fix my website myself instead of hiring a developer?'
    a: 'For many common issues, yes, especially with a report that shows the exact failing code. For anything involving legal strategy, the response to the sender, or a settlement agreement, that is a job for an attorney, not a developer.'
---

If you just opened an email or letter claiming your website has accessibility barriers and demanding you fix them, you are not alone (see what [ADA Title III law for businesses](/blog/ada-title-iii-law-for-businesses) requires): website accessibility lawsuits hit 3,117 in federal court in 2025 alone, a 27% jump from 2024, and many cases start with a demand letter like yours ([Seyfarth Shaw's ADA Title III tracker](https://www.adatitleiii.com/2026/03/federal-court-website-accessibility-lawsuit-filings-bounce-back-in-2025/)). Here is what to actually do about it, in order.

## What a Demand Letter Is

A demand letter is usually sent by an attorney on behalf of someone with a disability who says they tried to use your website and hit specific barriers, for example a checkout form with no labels, images with no [alt text](/blog/wcag-1-1-1-non-text-content), or a menu that cannot be operated by keyboard. It states that this violates the Americans with Disabilities Act, lists the problems, and demands that you fix them, often alongside a monetary settlement demand, before a lawsuit is filed.

It is not a lawsuit. It is usually an attempt to resolve the claim, and the payment demanded, before either side spends money on litigation.

## What to Do in the First Week

1. **Do not panic-reply.** Do not respond directly to the sender promising fixes, arguing your site is fine, or ignoring it and hoping it goes away. Anything you say can become part of the record later.
2. **Read the letter closely and note the deadline.** Most give you a window, often two to four weeks, to respond before the sender says they will file suit.
3. **Get an attorney who handles ADA/website accessibility matters.** This is the single most important step. They will evaluate the specific claims, your exposure, and how to respond, and they will handle communication with the sender so you do not have to.
4. **Run a real accessibility scan of your site immediately.** You need to know, independent of what the letter claims, what is actually wrong. [Run a free scan](/#scan) against WCAG 2.2 or 2.1 AA (the standard most ADA claims reference) to get a concrete list of issues mapped to the specific success criteria.
5. **Do not install an overlay widget and call it done.** An overlay patches the browser at runtime; it does not change your site's code. Settlements routinely require overlays to be removed because the underlying barriers are still there. See what the [FTC found when it fined accessiBe](/comparisons/accessibe-vs-accessbell) for making similar claims.
6. **Build a real remediation plan with dates.** A documented plan, ideally with a developer already making fixes, is one of the strongest things your attorney can point to in a response. Prioritize whatever the letter specifically named, then work through the rest by severity.
7. **Let your attorney respond, not you.** A professional response typically acknowledges the letter, outlines the remediation already underway, and negotiates from there, whether that is a smaller settlement, a compliance timeline, or both.

## What This Typically Costs

Costs vary a lot by case, but the pattern across independent sources is consistent: **resolving things at the demand letter stage is dramatically cheaper than letting it become a lawsuit.**

| Stage | Commonly cited range |
| --- | --- |
| Demand letter resolved directly | Roughly $1,000–$25,000, often cited around $5,000 on average |
| Out-of-court settlement (small business) | Often $5,000–$20,000, plus a 90–180 day fix commitment |
| Filed lawsuit that settles | Tens of thousands higher once legal fees are included |
| Class action | Commonly cited averages around $400,000 |

On top of any settlement, legal defense fees are commonly cited in the $30,000–$175,000 range for cases that are actively litigated ([industry cost analysis](https://accessible.org/ada-website-compliance-lawsuit-settlement-amounts/)). Treat every figure here as a rough industry range, not legal advice about your specific case — your attorney will give you real numbers.

This is the financial case for fixing real issues now: the cost of a scan, developer time, and monitoring is a small fraction of even the low end of a settlement, and it addresses the actual risk instead of papering over it.

## What Happens if You Ignore It

Sources consistently describe the same pattern: the sender escalates to a filed lawsuit if a demand letter goes unanswered. Once a complaint is filed, you are on a legal clock (commonly 21 days to answer), the costs above increase, and you lose the leniency that comes from moving early. If you have already been served with a lawsuit rather than a demand letter, see our [ADA lawsuit process guide](/blog/ada-lawsuit-process) for the deadlines involved, and [one small store's story of being sued for violating ADA website compliance](/blog/what-happens-after-being-sued-for-ada-website-compliance) for what it cost them.

## After the Letter: Staying Out of the Next One

Once the immediate matter is resolved, the goal shifts to not receiving another one:

1. **Fix the code, not just the symptom.** Work through your scan results by severity, starting with forms, navigation and any checkout or account flow.
2. **Monitor continuously.** New pages and new code introduce new issues; a one-time fix does not stay fixed. [AccessBell Pro](/pricing) rescans your monitored pages automatically and alerts you when something regresses.
3. **Publish an accessibility statement.** A dated, honest statement naming the standard you target and how people can report barriers is something plaintiffs' attorneys and courts both look for. [Generate one free](/resources/statement-generator) in a few minutes.
4. **Keep a record.** Scan reports, fix commits and monitoring history are exactly what your attorney wants to show if this ever comes up again.

None of this is legal advice, and nothing here replaces talking to an attorney about your specific letter. It is the practical, concrete part: knowing what is actually broken on your site, and having a documented plan to fix it, is what makes every other step in this process go faster and cost less.

To reduce the chance of another letter, follow our [ADA website accessibility](/blog/ada-website-accessibility) workflow.

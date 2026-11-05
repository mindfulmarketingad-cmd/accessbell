/**
 * Five-column cost and feature matrix for /comparisons.
 * Competitor figures come only from the public sources in MATRIX_SOURCES,
 * checked November 2026. Where a vendor does not publish a price, the cell
 * says so and quotes a labeled public reference range. Do not add a price
 * that is not in those sources.
 */
import { ONE_TIME, PLAN } from './pricing';

export type VendorKey = 'accessbell' | 'audioeye' | 'aaardvark' | 'siteimprove' | 'levelAccess';

export type MatrixVendor = {
  key: VendorKey;
  name: string;
  /** In-site page for this column. AccessBell goes to pricing; the others go to their write-up. */
  href: string;
  us?: boolean;
};

export type MatrixRow = {
  label: string;
  cells: Record<VendorKey, string[]>;
};

export type MatrixGroup = {
  title: string;
  rows: MatrixRow[];
};

export const MATRIX_CHECKED = 'November 2026';

export const MATRIX_VENDORS: MatrixVendor[] = [
  { key: 'accessbell', name: 'AccessBell', href: '/pricing', us: true },
  { key: 'audioeye', name: 'AudioEye', href: '/comparisons/audioeye-vs-accessbell' },
  { key: 'aaardvark', name: 'AAArdvark', href: '/comparisons/aaardvark-vs-accessbell' },
  { key: 'siteimprove', name: 'Siteimprove', href: '/comparisons/siteimprove-vs-accessbell' },
  { key: 'levelAccess', name: 'Level Access', href: '/comparisons/level-access-vs-accessbell' },
];

const price = `$${PLAN.price} per domain per month, or $${PLAN.annualPrice} per domain per year`;

export const MATRIX_GROUPS: MatrixGroup[] = [
  {
    title: 'Pricing',
    rows: [
      {
        label: 'Cost and entry price',
        cells: {
          accessbell: [
            `Pro is ${price}, published on the AccessBell pricing page.`,
            `One-time options, which do not renew: Page Report $${ONE_TIME.pageReport.price}, and Domain Audit $${ONE_TIME.domainAudit.price} for up to ${PLAN.urlsPerDomain} pages.`,
          ],
          audioeye: [
            'AudioEye does not publish dollar amounts on its own plans page. Self-Managed and Managed both say “Talk to an Expert.”',
            'Directories (GetApp, Capterra and SoftwareAdvice) list the Automated tier at about $49 per month. That is a third-party directory figure, not a price AudioEye publishes.',
          ],
          aaardvark: [
            'Published monthly prices on AAArdvark’s pricing page: Free $0 (1 site, 1 page); One Site / Starter $49 (1 site, 100 pages); A Few Sites $99 (5 sites, 1,000 pages); Several Sites $249 (20 sites, 3,000 pages); High Capacity $499 (50 sites, 10,000 pages).',
            'Annual prices on the same page, for the paid tiers: $549, $1,099, $2,749 and $5,499.',
          ],
          siteimprove: [
            'Siteimprove does not publish a self-serve price on siteimprove.com. You contact sales.',
            'Public reference ranges, not a checkout price: Texas DIR list price for the Accessibility Complete Package is $7,100 per year for 1,000 pages, then $11,600 (5,000), $15,300 (10,000), $22,800 (25,000), $34,100 (50,000) and $51,300 (100,000). UK G-Cloud Inclusivity is £8,000 to £28,700 per licence.',
          ],
          levelAccess: [
            'Level Access sells the enterprise platform by custom quote. It does not publish a self-serve price list.',
            'Public reference ranges: AWS Marketplace Basic is $5,000 for 12 months (scanning, an accessibility widget, asset dashboards, automated remediation and issue reporting). Higher tiers are a private offer. Missouri MOCAP lists AMP SaaS for up to 5 users at $13,495 per year, Access Advisor Enterprise managed service at $14,995 per year, and audits at $160 per hour.',
          ],
        },
      },
      {
        label: 'Billing model',
        cells: {
          accessbell: ['Per domain, monthly or yearly. One-time Page Reports and Domain Audits do not renew. Each extra domain is the same per-domain price.'],
          audioeye: ['Three tiers: Automated, Self-Managed and Managed. Automated is the directory-listed entry tier. Self-Managed and Managed are quoted.'],
          aaardvark: ['Monthly, or a discounted annual price. The plan price rises with the number of sites and pages. Every paid plan includes the full feature set and unlimited users.'],
          siteimprove: ['Annual licence or contract, quoted by pages and modules. UK G-Cloud prices Inclusivity per licence, with no free trial, and implementation is often separate. SEO, QA and analytics modules are sold separately.'],
          levelAccess: ['Annual contract or a marketplace subscription. AWS Basic is a 12-month price. Enterprise programs are custom. UserWay, which Level Access owns, is a separate product.'],
        },
      },
      {
        label: 'Free trial or money-back',
        cells: {
          accessbell: [`3-day free trial. 14-day money-back guarantee after the first charge. A one-page scan is free, with no account.`],
          audioeye: ['The plans page we checked does not publish a free-trial length or a money-back term for these tiers.'],
          aaardvark: ['Free plan at $0 for 1 site and 1 page. The pricing page does not publish a money-back window for paid plans.'],
          siteimprove: ['The UK G-Cloud Inclusivity listing says there is no free trial. siteimprove.com does not offer a self-serve trial.'],
          levelAccess: ['No published self-serve trial. The AWS Marketplace and Missouri MOCAP listings are paid contracts.'],
        },
      },
      {
        label: 'Published price or quote',
        cells: {
          accessbell: ['Published. You can start on the pricing page without a sales call.'],
          audioeye: ['Not published on AudioEye’s own page. The about $49 per month figure is a directory listing. Self-Managed and Managed are “Talk to an Expert.”'],
          aaardvark: ['Published, including the free plan and the annual prices.'],
          siteimprove: ['Quote on siteimprove.com. Texas DIR and UK G-Cloud publish list or framework prices for public-sector buyers. They are not a self-serve checkout price. Vendr-observed contracts are about $15,000 to $150,000 or more per year, depending on modules and pages.'],
          levelAccess: ['Quote for the enterprise platform. AWS Marketplace publishes the Basic tier; other tiers are private offers. Vendr reports a median of about $33,735 per year, with typical ranges of about $25,000 to $50,000 (Essentials), $60,000 to $100,000 (Accelerate) and $100,000 or more (Enterprise). TestParty and other industry write-ups put full programs, including manual audits, VPAT, training and legal support, at about $50,000 to $500,000 or more.'],
        },
      },
    ],
  },
  {
    title: 'Features',
    rows: [
      {
        label: 'Overlay widget',
        cells: {
          accessbell: ['Not an overlay. AccessBell scans, monitors and keeps evidence. The optional PageAssist toolbar lets visitors change text size, contrast, spacing and motion. It does not claim to make a site compliant. AccessBellFix applies only fixes you approve.'],
          audioeye: ['Listed on the Overlay Fact Sheet. Hybrid model: a script applies automated fixes, and higher tiers add expert services.'],
          aaardvark: ['Not an overlay. AAArdvark’s FAQ says it is a testing tool, not a quick-fix overlay.'],
          siteimprove: ['Not an overlay. It is an automated testing and digital governance platform.'],
          levelAccess: ['Not primarily an overlay. Level Access owns UserWay, an overlay sold separately. AWS Marketplace Basic includes an accessibility widget.'],
        },
      },
      {
        label: 'Automated scanning',
        cells: {
          accessbell: ['Yes. Real Chrome scans on desktop and mobile, with guided fix suggestions.'],
          audioeye: ['Yes on Automated and Managed (automated monitoring and fixes). Self-Managed includes an accessibility scanner. AudioEye says its automated tools address about 50% of issues, and that Automated does not include expert testing for the rest.'],
          aaardvark: ['Yes. Automated testing, a visual mode that shows issues on the page, issue grouping, and a manual testing log.'],
          siteimprove: ['Yes. Automated WCAG testing, remediation guidance and severity prioritization. Siteimprove’s testing services page says automated scanning identifies roughly 30% of WCAG issues. Public citations of Siteimprove’s own figure put that share at about 30% to 40%.'],
          levelAccess: ['Yes. AWS Marketplace Basic includes scanning and issue reporting. The broader platform is sold with expert services.'],
        },
      },
      {
        label: 'Continuous monitoring',
        cells: {
          accessbell: [`Yes. Continuous monitoring and unlimited rescans, up to ${PLAN.urlsPerDomain} URLs per domain.`],
          audioeye: ['Continuous monitoring is listed on Automated and Managed. It is not listed on Self-Managed.'],
          aaardvark: ['Scheduled scans. The pricing page describes ongoing testing and audit management, not a published “scan every URL every day” limit.'],
          siteimprove: ['Ongoing automated monitoring is part of the platform, including across sites and teams. It is sold inside the governance suite, not as a flat self-serve monitor.'],
          levelAccess: ['Monitoring is part of the platform. AWS Basic includes scanning and issue reporting. How often a given contract scans is not published on that listing.'],
        },
      },
      {
        label: 'Guided or source fixes vs overlay fixes',
        cells: {
          accessbell: ['Guided fix suggestions that show what to change in your code. AccessBellFix is opt-in: it applies specific fixes you approve, such as alt text, and is not sold as an overlay that makes a site compliant.'],
          audioeye: ['Automated applies fixes from its script (AudioEye says about 50% of issues). Managed adds custom-written fixes and agentic audits. Self-Managed is guidance, developer tools and expert audit so your team fixes at the source. It does not include automated fixes.'],
          aaardvark: ['Remediation guidance inside a testing tool: assign and verify issues, visual mode, and branded PDF reports. Not overlay fixes. AAArdvark does not replace a full audit. Consulting and audit services are separate.'],
          siteimprove: ['Remediation guidance, severity prioritization, multi-team workflows and CMS pre-publish checks. Not overlay fixes. PDF and document checks are included in the accessibility module. SEO, QA and analytics are separate modules.'],
          levelAccess: ['Platform guidance plus expert services. AWS Basic includes automated remediation and a widget. Managed programs add human remediation. That widget is not the same product as the separate UserWay overlay.'],
        },
      },
      {
        label: 'Evidence or compliance record',
        cells: {
          accessbell: ['Compliance Vault evidence packages: a dated record of scans and confirmed fixes you can export. This documents work. It is not a legal compliance guarantee.'],
          audioeye: ['Expert audit and reporting on Self-Managed and Managed. The plans page does not describe a self-serve evidence vault.'],
          aaardvark: ['Issue tracking with assign and verify, a manual testing log, and branded PDF reports.'],
          siteimprove: ['Dashboards, severity prioritization and multi-team workflows inside the governance suite. A self-serve legal evidence package is not described on the public pages we checked.'],
          levelAccess: ['Issue reporting on AWS Basic. Expert audits, VPAT and program records are part of service engagements, which are quoted.'],
        },
      },
      {
        label: 'Accessibility statement',
        cells: {
          accessbell: ['Yes. An accessibility statement that updates from your monitoring.'],
          audioeye: ['Not stated on the plans page we checked.'],
          aaardvark: ['Not stated on the pricing page or FAQ we checked.'],
          siteimprove: ['Not described as an auto-updating statement on the public pages we checked. Siteimprove does offer a separate free statement generator in its toolkit.'],
          levelAccess: ['Not described as an auto-updating statement on the AWS Marketplace or Missouri MOCAP listings.'],
        },
      },
      {
        label: 'WCAG versions and levels',
        cells: {
          accessbell: ['Selectable, up to WCAG 2.2 AAA: WCAG 2.0, 2.1 and 2.2 at Levels A, AA and AAA.'],
          audioeye: ['The plans page describes accessibility coverage and says automated tools address about 50% of issues. It does not publish a WCAG version and level picker.'],
          aaardvark: ['WCAG Levels A, AA and AAA for versions 2.0, 2.1 and 2.2, per AAArdvark’s FAQ.'],
          siteimprove: ['Automated WCAG testing. The UK G-Cloud Inclusivity listing says the service supports WCAG 2.1 AA and Section 508.'],
          levelAccess: ['Standards testing is part of the platform and of expert audits. The AWS Basic and Missouri MOCAP listings do not publish a WCAG version picker.'],
        },
      },
      {
        label: 'Page or URL limits',
        cells: {
          accessbell: [`Up to ${PLAN.urlsPerDomain} URLs per domain.`],
          audioeye: ['Not published on the plans page.'],
          aaardvark: ['By plan: 1 page on Free, then 100, 1,000, 3,000 or 10,000 pages, on 1, 5, 20 or 50 sites.'],
          siteimprove: ['Priced by pages crawled. The Texas DIR list runs from 1,000 to 100,000 pages. UK G-Cloud Inclusivity is also tiered by page count inside the £8,000 to £28,700 licence band.'],
          levelAccess: ['No self-serve page cap is published. Missouri MOCAP prices AMP for up to 5 users, not by a page count. Enterprise scope is in the quote.'],
        },
      },
      {
        label: 'PDF scanning',
        cells: {
          accessbell: ['Yes. PDFs linked from monitored pages are checked, including title and language fixes.'],
          audioeye: ['Document remediation is listed on the Managed plan. It is not listed on Automated or Self-Managed.'],
          aaardvark: ['Not stated on the pricing page or FAQ we checked.'],
          siteimprove: ['Yes. PDF and document checks are part of Inclusivity, including on the UK G-Cloud feature list. Siteimprove’s current platform page also describes a PDF remediation agent.'],
          levelAccess: ['Not listed in the AWS Marketplace Basic feature line. Vendr describes PDF testing credits as an add-on on typical contracts, not as part of the published Basic tier.'],
        },
      },
      {
        label: 'Human expert audit included',
        cells: {
          accessbell: ['No. You get automated monitoring, manual testing procedures and a record of your work. A full human expert audit is not included.'],
          audioeye: ['Not on Automated. Expert audit and reporting are on Self-Managed and Managed. Managed also lists agentic audits.'],
          aaardvark: ['No. AAArdvark says it does not replace a full audit. Consulting and audit services are sold separately.'],
          siteimprove: ['Not included in the software price. Siteimprove sells expert accessibility testing as a separate professional service.'],
          levelAccess: ['Expert audits are a core service, quoted on their own or inside a program. Missouri MOCAP lists audits at $160 per hour. AWS Basic does not say a human audit is included.'],
        },
      },
      {
        label: 'Legal assurance or indemnity',
        cells: {
          accessbell: ['None. AccessBell does not guarantee legal compliance and does not promise that you will not be sued. The Compliance Vault is evidence of testing and fixes, not an indemnity.'],
          audioeye: ['AudioEye Assurance is listed on Managed only. It is not listed on Automated or Self-Managed. The plans page does not publish the dollar terms of that assurance.'],
          aaardvark: ['Not offered as a legal assurance or indemnity in the pricing page or FAQ we checked.'],
          siteimprove: ['No published legal indemnity. Framework copy about reducing compliance risk is not an indemnity.'],
          levelAccess: ['No published self-serve indemnity. Industry write-ups of full programs include legal support inside the quoted services. UserWay’s separate legal-support claims are a different product.'],
        },
      },
      {
        label: 'Self-serve signup',
        cells: {
          accessbell: ['Yes. Start a trial online. No sales call.'],
          audioeye: ['Automated has a “Get Started” path. Self-Managed and Managed are “Talk to an Expert.”'],
          aaardvark: ['Yes. Plans, including Free, are on the public pricing page.'],
          siteimprove: ['No. Contact sales.'],
          levelAccess: ['No for the enterprise platform. AWS Marketplace is a procurement checkout for Basic. Higher tiers are private offers.'],
        },
      },
      {
        label: 'Best fit',
        cells: {
          accessbell: ['Small and mid-size sites, including storefronts, that want a published price for scanning, monitoring and evidence, and will fix issues in their own code. Not a fit if you need a human expert audit or a legal indemnity in the same contract.'],
          audioeye: ['Teams that want automated in-browser fixes on the entry tier, or a vendor to run expert remediation on Managed. Confirm the tier, because the plans page does not show a dollar price.'],
          aaardvark: ['Teams and agencies that want published multi-site testing plans, manual audit workflow and no overlay. Less of a fit if you need one domain monitored with code fixes and a legal evidence package at a single low price.'],
          siteimprove: ['Large organizations that want accessibility inside a digital governance suite and can buy by quote. A poor fit if you only need accessibility scanning and do not want SEO, QA or analytics modules.'],
          levelAccess: ['Enterprises that want a platform plus expert audits, VPAT, training or a managed program, and can buy by quote. The AWS Basic tier is the published starter, and it includes a widget.'],
        },
      },
    ],
  },
];

export const MATRIX_SOURCES: { label: string; href: string; external?: boolean }[] = [
  { label: 'AccessBell pricing', href: '/pricing' },
  { label: 'AccessBell: PDF accessibility scanning', href: '/resources/help-center/scans-and-reports/pdf-accessibility-scanning' },
  { label: 'AccessBell: Compliance Vault', href: '/solutions/compliance-vault' },
  { label: 'AudioEye: plans and pricing', href: 'https://www.audioeye.com/plans-and-pricing/', external: true },
  { label: 'Capterra: AudioEye (directory price, not AudioEye-published)', href: 'https://www.capterra.com/p/214283/Audioeye/', external: true },
  { label: 'Software Advice: AudioEye (directory price, not AudioEye-published)', href: 'https://www.softwareadvice.com/compliance/audioeye-profile/', external: true },
  { label: 'Overlay Fact Sheet', href: 'https://overlayfactsheet.com/en/', external: true },
  { label: 'AAArdvark: pricing', href: 'https://aaardvarkaccessibility.com/pricing/', external: true },
  { label: 'AAArdvark: FAQ (WCAG coverage and overlay)', href: 'https://aaardvarkaccessibility.com/faq/', external: true },
  { label: 'Siteimprove pricing page (no self-serve price)', href: 'https://www.siteimprove.com/pricing/', external: true },
  { label: 'Siteimprove toolkit, including the free statement generator', href: 'https://www.siteimprove.com/toolkit/', external: true },
  { label: 'Siteimprove: accessibility testing services (about 30% caught by automation)', href: 'https://www.siteimprove.com/testing-services/', external: true },
  { label: 'UK G-Cloud 14: Siteimprove Inclusivity', href: 'https://www.applytosupply.digitalmarketplace.service.gov.uk/g-cloud/services/271405559589250', external: true },
  { label: 'UK G-Cloud 14: Siteimprove Inclusivity pricing document', href: 'https://assets.applytosupply.digitalmarketplace.service.gov.uk/g-cloud-14/documents/702601/271405559589250-pricing-document-2024-05-07-1300.pdf', external: true },
  { label: 'Texas DIR contract DIR-CPO-5112 (Siteimprove). List prices in the table are from the public Accessibility Complete Package price sheet, not from this contract landing page.', href: 'https://dir.texas.gov/contracts/dir-cpo-5112', external: true },
  { label: 'Vendr: Siteimprove buyer-reported contracts', href: 'https://www.vendr.com/marketplace/siteimprove', external: true },
  { label: 'Level Access on AWS Marketplace (Basic, $5,000 for 12 months)', href: 'https://aws.amazon.com/marketplace/pp/prodview-v5ysxfyyrupw6', external: true },
  { label: 'Missouri MOCAP: Level Access evaluator fees', href: 'https://mocap.mo.gov/levelaccess-eval/', external: true },
  { label: 'Vendr: Level Access buyer-reported contracts', href: 'https://www.vendr.com/marketplace/level-access', external: true },
  { label: 'TestParty: Level Access program ranges (industry write-up)', href: 'https://testparty.ai/blog/level-access-pricing', external: true },
  { label: 'Level Access: acquisition of UserWay', href: 'https://www.levelaccess.com/blog/level-access-completes-acquisition-of-userway/', external: true },
  { label: 'W3C: WCAG 2.2', href: 'https://www.w3.org/TR/WCAG22/', external: true },
];

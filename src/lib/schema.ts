import { SITE } from '../config/site';
import { PLAN } from '../data/pricing';

export type FaqItem = { q: string; a: string };

const stripTags = (s: string) => s.replace(/<[^>]+>/g, '');

/** FAQPage structured data built from the same items rendered on the page. */
export function faqSchema(items: FaqItem[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: stripTags(i.a) },
    })),
  };
}

/** SoftwareApplication with the published plan prices as offers. */
export function softwareSchema() {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${SITE.url}/#software`,
    name: 'AccessBell Website Accessibility Monitoring Tool',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Website accessibility monitoring',
    operatingSystem: 'Web',
    url: SITE.url,
    description: SITE.description,
    publisher: { '@id': `${SITE.url}/#organization` },
    offers: [
      { '@type': 'Offer', name: 'Free scan', price: '0', priceCurrency: 'USD', url: `${SITE.url}/#scan` },
      {
        '@type': 'Offer',
        name: `${PLAN.name} plan`,
        description: `Website accessibility monitoring tool: up to ${PLAN.urlsPerDomain} URLs per domain, daily monitoring, and fixes you approve such as alt text, button names and the page language`,
        price: String(PLAN.price),
        priceCurrency: PLAN.currency,
        url: `${SITE.url}/pricing`,
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: String(PLAN.price),
          priceCurrency: PLAN.currency,
          unitText: 'per domain per month',
          billingDuration: 'P1M',
        },
      },
      {
        '@type': 'Offer',
        name: `${PLAN.name} plan, billed annually`,
        description: `Website accessibility monitoring tool: up to ${PLAN.urlsPerDomain} URLs per domain, daily monitoring, and fixes you approve such as alt text, button names and the page language`,
        price: String(PLAN.annualPrice),
        priceCurrency: PLAN.currency,
        url: `${SITE.url}/pricing`,
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: String(PLAN.annualPrice),
          priceCurrency: PLAN.currency,
          unitText: 'per domain per year',
          billingDuration: 'P1Y',
        },
      },
    ],
  };
}


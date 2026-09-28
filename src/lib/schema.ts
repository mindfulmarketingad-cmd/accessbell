import { SITE } from '../config/site';
import { PLANS, ANNUAL_DISCOUNT } from '../data/pricing';

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
    name: 'AccessBell Website Accessibility Checker',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Web accessibility testing',
    operatingSystem: 'Web',
    url: SITE.url,
    description: SITE.description,
    publisher: { '@id': `${SITE.url}/#organization` },
    offers: [
      { '@type': 'Offer', name: 'Free scan', price: '0', priceCurrency: 'USD', url: `${SITE.url}/#scan` },
      ...PLANS.filter((p) => p.monthly !== null).map((p) => ({
        '@type': 'Offer',
        name: `${p.name} plan`,
        price: String(p.monthly),
        priceCurrency: 'USD',
        url: `${SITE.url}/pricing`,
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: String(p.monthly),
          priceCurrency: 'USD',
          unitText: 'MONTH',
          billingDuration: 'P1M',
        },
      })),
    ],
  };
}

export const annualMonthly = (monthly: number) => Math.round(monthly * (1 - ANNUAL_DISCOUNT));

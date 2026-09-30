/**
 * Public website accessibility cases shown on /pricing. Every figure comes from
 * the linked source. `paid` is only set where the amount was actually paid, so
 * the "years of Pro" comparison never uses proposed, stayed or confidential sums.
 */
export type Lawsuit = {
  company: string;
  year: string;
  what: string;
  cost: string;
  paid?: number;
  source: { label: string; url: string };
};

export const LAWSUITS: Lawsuit[] = [
  {
    company: 'Target',
    year: '2008',
    what: 'Blind shoppers could not use Target.com with a screen reader. Settled as a class action.',
    cost: '$6 million in class damages plus about $3.7 million in the plaintiffs’ attorney fees and costs.',
    paid: 9_738_865,
    source: { label: 'W3C WAI case study', url: 'https://www.w3.org/WAI/business-case/archive/target-case-study' },
  },
  {
    company: 'Netflix',
    year: '2012',
    what: 'Streaming video had no captions. Settled with the National Association of the Deaf.',
    cost: '$755,000 in attorney fees and costs and $40,000 for compliance monitoring.',
    paid: 795_000,
    source: { label: 'Seyfarth Shaw, ADA Title III', url: 'https://www.adatitleiii.com/2012/10/netflix-settles-massachusetts-web-video-captioning-action/' },
  },
  {
    company: 'H&R Block',
    year: '2014',
    what: 'A U.S. Department of Justice consent decree over its website and mobile apps.',
    cost: '$45,000 to two plaintiffs and a $55,000 civil penalty.',
    paid: 100_000,
    source: { label: 'U.S. Department of Justice', url: 'https://www.justice.gov/opa/pr/2014/March/14-crt-239.html' },
  },
  {
    company: 'Winn-Dixie',
    year: '2017',
    what: 'Lost at trial over its website. Won on appeal in 2021, and that ruling was later vacated as moot.',
    cost: 'Years in court, fixes it estimated at $250,000 or more, and about $100,000 in fees awarded before the appeal.',
    source: { label: 'Hunton Andrews Kurth', url: 'https://www.hunton.com/hunton-employment-labor-perspectives/the-eleventh-circuit-court-of-appeals-issues-its-highly-anticipated-decision-on-website-accessibility' },
  },
  {
    company: 'A small online store',
    year: '2022',
    what: 'Sued in a class action along with its local competitors, by the same plaintiff.',
    cost: '$5,000 settlement plus a shared flat legal fee of about $2,000, then the cost of fixing the site.',
    paid: 7_000,
    source: { label: 'The owner’s account, in our blog post', url: '/blog/what-happens-after-being-sued-for-ada-website-compliance' },
  },
  {
    company: 'Fashion Nova',
    year: '2025',
    what: 'Agreed a class settlement over a website blind shoppers could not use.',
    cost: 'A proposed $5.15 million fund. The DOJ opposed it in 2026 and final approval was still pending in early 2026.',
    source: { label: 'U.S. Department of Justice', url: 'https://www.justice.gov/crt/case/alcazar-v-fashion-nova-inc' },
  },
];

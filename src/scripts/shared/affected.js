// Who a WCAG success criterion mainly helps, summarised from the "Intent"
// and "Benefits" sections of the W3C's Understanding WCAG 2.2 documents.
const B = 'Blind and screen reader users';
const LV = 'Low vision';
const CB = 'Color blindness';
const D = 'Deaf or hard of hearing';
const M = 'Motor and mobility';
const C = 'Cognitive and learning';
const S = 'Seizures and vestibular';

const BY_SC = {
  '1.1.1': [B, LV, C],
  '1.2.1': [B, D], '1.2.2': [D], '1.2.3': [B], '1.2.4': [D], '1.2.5': [B], '1.2.6': [D], '1.2.7': [B], '1.2.8': [B, D], '1.2.9': [D],
  '1.3.1': [B, C], '1.3.2': [B], '1.3.3': [B, LV], '1.3.4': [M, LV], '1.3.5': [C, M], '1.3.6': [C],
  '1.4.1': [CB, LV], '1.4.2': [B, C], '1.4.3': [LV, CB], '1.4.4': [LV], '1.4.5': [LV, C], '1.4.6': [LV, CB], '1.4.7': [D], '1.4.8': [LV, C],
  '1.4.9': [LV, C], '1.4.10': [LV], '1.4.11': [LV, CB], '1.4.12': [LV, C], '1.4.13': [LV, C, M],
  '2.1.1': [M, B], '2.1.2': [M, B], '2.1.3': [M, B], '2.1.4': [M],
  '2.2.1': [C, M, B], '2.2.2': [C, B], '2.2.3': [C, M], '2.2.4': [C], '2.2.5': [C], '2.2.6': [C],
  '2.3.1': [S], '2.3.2': [S], '2.3.3': [S],
  '2.4.1': [B, M], '2.4.2': [B, C], '2.4.3': [B, M], '2.4.4': [B, C], '2.4.5': [C, B], '2.4.6': [C, B], '2.4.7': [M, LV],
  '2.4.8': [C, B], '2.4.9': [B, C], '2.4.10': [B, C], '2.4.11': [M, LV], '2.4.12': [M, LV], '2.4.13': [M, LV],
  '2.5.1': [M], '2.5.2': [M, C], '2.5.3': [M, B], '2.5.4': [M], '2.5.5': [M, LV], '2.5.6': [M], '2.5.7': [M], '2.5.8': [M, LV],
  '3.1.1': [B, C], '3.1.2': [B, C], '3.1.3': [C], '3.1.4': [C], '3.1.5': [C], '3.1.6': [B, C],
  '3.2.1': [C, B, LV], '3.2.2': [C, B, LV], '3.2.3': [C, LV], '3.2.4': [C, B], '3.2.5': [C, B], '3.2.6': [C],
  '3.3.1': [C, B], '3.3.2': [C, B], '3.3.3': [C], '3.3.4': [C], '3.3.5': [C], '3.3.6': [C], '3.3.7': [C, M], '3.3.8': [C], '3.3.9': [C],
  '4.1.1': [B], '4.1.2': [B, M], '4.1.3': [B, LV],
};

/** Groups most affected by failures of these criteria, in a stable order. */
export function affectedBy(wcag) {
  const order = [B, LV, CB, D, M, C, S];
  const set = new Set((wcag || []).flatMap((w) => BY_SC[w.sc] || []));
  return order.filter((g) => set.has(g));
}

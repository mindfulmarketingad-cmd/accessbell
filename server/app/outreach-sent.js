// Permanent guard: addresses that already got owner-approved outreach,
// stored as SHA-256 of the lowercased address (the repo is public).
// runOutreach skips these forever, so a rerun cannot double-send.
// Batch 1: 2026-11-02 08:16 ET, 17 sent. Batch 2: 08:27 ET, 7 sent.
import crypto from 'node:crypto';

const HASHES = new Set([
  '6b3eb7fe26401011e1a682e2b5fc53ff6a7da3efb3e401b8f8a2a95fd8042480',
  '972aba052e9affb8ec7e110eddce1001ad58036f383ecf50d2ae68b9427bf0dd',
  '8d6a2b9ba78d86d6aeb0cdbf1f67df77c534be9992587e480734c150e09ecced',
  '97a9a5d2ea8650fda54aab60e5dbdb449b5fb4a4a2306ae9d6af6e0a0778feed',
  'e8108da0677ad3dbea681213b7e264d6b641f70f112c86789ae7c3e6bab1b8df',
  '00857fc15fd11ac36a3a6abd405966e49e9f36ab82eff26f81c561994ab5fc7a',
  '608188bd059c07e77e0ba1f4115ded688e90db2ed57334e4b3185e55e524d595',
  '6592cacdd32f9fbb17f791ec8059cd17c2354ec1fbc58ffda0dd471afd542ac8',
  'bb11e540a0b9e0f5036b72c53ac2dc664a2aad998fc9e256ffe87212dcbf6353',
  '0ae4bc478c58a8a9cb7008cab06981b64300732eea9c59e5c52b72dbd1bc90e0',
  '838aa3854fbc81a7c0dc3ef6e92e4b810db51ddc57665e8a3fda826635e3ba8a',
  '7084a5ab528d160f7364aef67057645e63f402ae369cba4ddea9fa895abe6400',
  'bc67a5aeeac68cb3598b516c5187ffa6ee745eed967bf4b052613e73d35bcf14',
  'd4e05da4b1f3a2458922909272738b4fc0c27e86410db20d66ce2bdea420a1a6',
  'a8f98c8b2e13b618aae0a3edfc10c339c76e7acda432471ab92914e1fecd7561',
  '59c132604f47e1b4157268cffb84beb5f1af5fec941c1c6982f3419d605c0d00',
  'cf3a9fc4d55d28e5fd4108928f704240884fed1032805366bb7dadabba353e63',
  // Batch 2: 2026-11-02 08:27 ET, 7 sent.
  'd167f65a88b8122c9bbeea292e848b64d310fb6328f6bae023e7f8aae33b1852',
  '21584d63ec1e525e2644103277515e4d18c7146dac4af98c0ed99df714c590ac',
  '6bd6ba144dd3e95bc4c31f0a156151a84fb2a23927389ee0200c2968e80e891b',
  '373669d357ab1886ec075e5a1ebb4979322a999d5effd0a2b9a2330572183045',
  '28bc1ad512015130e664086cecc9cfa35cf9600b651b3640259898bf4d550607',
  'f7d28cbbd90c35f3b52f48df94af2d655e9144d9ec0c748bdbc4589b49b06672',
  '2579183898168db7d8d1c14f209be9d6ef71dc60b166c7efae69722ee638f0c0',
]);

const hash = (email) => crypto.createHash('sha256').update(String(email || '').trim().toLowerCase()).digest('hex');

export const OUTREACH_ALREADY_SENT = { has: (email) => HASHES.has(hash(email)), size: HASHES.size };
export const outreachSentHash = hash;

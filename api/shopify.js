// /api/shopify/* and /shopify -> Shopify App Store version (server/shopify/handler.js)
import { createShopifyHandler } from '../server/shopify/handler.js';

const handle = createShopifyHandler();
export const GET = handle;
export const POST = handle;

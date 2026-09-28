// /api/inngest -> Inngest calls this endpoint to run background functions.
// Requests are verified with INNGEST_SIGNING_KEY (added by the Vercel integration).
import { serve } from 'inngest/edge';
import { inngest, functions } from '../server/inngest/functions.js';

const handler = serve({ client: inngest, functions });

export const GET = handler;
export const POST = handler;
export const PUT = handler;

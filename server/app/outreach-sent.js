// Permanent guard: addresses that already got owner-approved outreach.
// runOutreach skips these forever, so a rerun of a batch cannot double-send.
// Add every successfully sent address here after each batch.
// Batch 1: 2026-11-02 08:16 ET, 17 sent (Resend ids in /workspace/outreach-sent.csv).
export const OUTREACH_ALREADY_SENT = new Set([
  'build@sisystems.site',
  'contact@advanceconstructionpros.com',
  'ed@sandslawoffice.com',
  'fd@napadentalofabq.com',
  'hello@chess-suite.co.uk',
  'info@central-provisions.com',
  'info@elleluxejasper.com',
  'info@ghoflmarket.com',
  'info@hitchcockpaper.com',
  'info@howardcpas.com',
  'info@pollyplumbing.com',
  'info@savagebee-ches.boutique',
  'info@threeriversdentalmt.com',
  'office@ariatroofing.com',
  'orders.costumesbystormy@gmail.com',
  'sales@brandlabsusa.com',
  'theplumberinc@hotmail.com',
]);

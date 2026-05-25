import { corsHeaders } from 'jsr:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({
  opportunity_id: z.string().uuid().optional(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return json({ error: 'Invalid body', details: parsed.error.flatten() }, 400);
  }

  return json(
    {
      delivered: false,
      reason: 'whatsapp_disabled_for_launch',
      message: 'WhatsApp lead alerts are paused while Sjoh moves fully off Lovable. Email and browser push alerts remain available.',
    },
    200,
  );
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

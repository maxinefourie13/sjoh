// Founder daily digest — emails a one-glance summary of the day's platform
// activity to the founder. Invoked once a day by pg_cron. Sends directly via
// Resend (bypasses the customer email queue/suppression) so it always lands.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

const SITE_URL = 'https://sjoh.co.za';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: stats, error } = await admin.rpc('admin_platform_stats_service');
    if (error) throw new Error(error.message);

    const s = stats as Record<string, number>;
    const founderEmail = Deno.env.get('FOUNDER_EMAIL') || 'maxinefourie13@gmail.com';
    const from = Deno.env.get('EMAIL_FROM') || 'Sjoh <hello@sjoh.co.za>';
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) throw new Error('RESEND_API_KEY not configured');

    const today = new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' });

    const row = (label: string, value: number, hot = false) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:15px;color:#3a3a3d;">${label}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:18px;font-weight:800;text-align:right;color:${hot && value > 0 ? '#0B6E3A' : '#0f0f10'};">${value}</td>
      </tr>`;

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;padding:28px 24px;">
        <p style="font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#e8665a;margin:0 0 6px;">Sjoh · Founder digest</p>
        <h1 style="font-size:24px;font-weight:900;color:#0f0f10;margin:0 0 4px;">Today on Sjoh</h1>
        <p style="font-size:14px;color:#888;margin:0 0 20px;">${today}</p>
        <table style="width:100%;border-collapse:collapse;">
          ${row('New businesses today', s.businesses_today ?? 0, true)}
          ${row('New job requests today', s.job_requests_today ?? 0, true)}
          ${row('Quotes sent today', s.quotes_today ?? 0)}
          ${row('Reviews today', s.reviews_today ?? 0)}
        </table>
        <table style="width:100%;border-collapse:collapse;margin-top:18px;">
          ${row('Businesses total', s.businesses_total ?? 0)}
          ${row('Paid subscriptions', s.subs_paid ?? 0)}
          ${row('Active trials', s.subs_trialing ?? 0)}
        </table>
        <div style="text-align:center;margin-top:24px;">
          <a href="${SITE_URL}/admin" style="background:#0f0f10;color:#fff;font-weight:800;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;display:inline-block;">Open your ops dashboard</a>
        </div>
        <p style="font-size:11px;color:#aaa;margin-top:20px;text-align:center;">Private founder email · Sjoh</p>
      </div>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: founderEmail,
        subject: `Sjoh today: ${s.businesses_today ?? 0} new business${(s.businesses_today ?? 0) === 1 ? '' : 'es'}, ${s.job_requests_today ?? 0} job${(s.job_requests_today ?? 0) === 1 ? '' : 's'}`,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend error ${res.status}: ${body.slice(0, 200)}`);
    }

    return new Response(JSON.stringify({ ok: true, sent_to: founderEmail, stats: s }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('founder-daily-digest failed', msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

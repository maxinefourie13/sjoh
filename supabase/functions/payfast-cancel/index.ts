// Cancels the caller's PayFast subscription via the PayFast API.
// PayFast stops future charges and then sends a CANCELLED ITN to
// payfast-webhook, which lapses the subscription in the database.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';
import { createHash } from 'node:crypto';

const PF_API_LIVE = 'https://api.payfast.co.za';

function md5(input: string): string {
  return createHash('md5').update(input).digest('hex');
}

function encodePayFastValue(value: string): string {
  return encodeURIComponent(value.trim())
    .replace(/[!'()*~]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, '+');
}

// PayFast API signature: md5 over header/body params sorted
// alphabetically by key, with the passphrase included as a param.
function apiSignature(params: Record<string, string>, passphrase: string): string {
  const all = { ...params, passphrase };
  const paramString = Object.keys(all)
    .sort()
    .map((key) => `${key}=${encodePayFastValue(all[key])}`)
    .join('&');
  return md5(paramString);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const MERCHANT_ID = Deno.env.get('PAYFAST_MERCHANT_ID');
    const PASSPHRASE = Deno.env.get('PAYFAST_PASSPHRASE');
    const IS_SANDBOX = Deno.env.get('PAYFAST_SANDBOX') === '1';
    if (!MERCHANT_ID || !PASSPHRASE) {
      throw new Error('PAYFAST_MERCHANT_ID / PAYFAST_PASSPHRASE not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: balance } = await admin
      .from('provider_balances')
      .select('payfast_subscription_token, tier')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    const token = balance?.payfast_subscription_token;
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'No active PayFast subscription found for this account.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');
    const headerParams = {
      'merchant-id': MERCHANT_ID,
      timestamp,
      version: 'v1',
    };
    const signature = apiSignature(headerParams, PASSPHRASE);

    const cancelUrl = `${PF_API_LIVE}/subscriptions/${encodeURIComponent(token)}/cancel${IS_SANDBOX ? '?testing=true' : ''}`;
    const res = await fetch(cancelUrl, {
      method: 'PUT',
      headers: {
        ...headerParams,
        signature,
        'Content-Type': 'application/json',
      },
    });

    const body = await res.text();
    if (!res.ok) {
      console.error('PayFast cancel API failed', { status: res.status, body: body.slice(0, 500) });
      return new Response(
        JSON.stringify({ error: 'PayFast could not cancel the subscription. Please try again or email hello@sjoh.co.za.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('PayFast subscription cancelled', { user_id: userData.user.id, tier: balance?.tier });
    return new Response(
      JSON.stringify({ ok: true, message: 'Subscription cancelled. No further charges will be made.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('payfast-cancel failed', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

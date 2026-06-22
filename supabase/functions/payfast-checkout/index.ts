// Generates a PayFast checkout for Sjoh subscriptions.
// Returns the form action URL + signed fields so the client
// can build and submit a <form> to PayFast for payment.
//
// PayFast uses a form POST (not a JSON API redirect like Paystack),
// so we send the fields + signature and let the client submit.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';
import { createHash } from 'node:crypto';

const PAYFAST_LIVE = 'https://www.payfast.co.za/eng/process';
const PAYFAST_TEST = 'https://sandbox.payfast.co.za/eng/process';

// Accept both legacy and current tier names
type Tier = 'basic' | 'verified_pro' | 'hustler' | 'main-oke';
type BillingCycle = 'monthly' | 'annual';

function normalize(t: Tier): 'basic' | 'verified_pro' {
  if (t === 'hustler') return 'basic';
  if (t === 'main-oke') return 'verified_pro';
  return t;
}

function md5(input: string): string {
  return createHash('md5').update(input).digest('hex');
}

function encodePayFastValue(value: string): string {
  return encodeURIComponent(value.trim()).replace(/%20/g, '+');
}

function cleanPayload(data: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value != null && String(value).trim() !== '')
  );
}

function toPayFastParamString(data: Record<string, string>, passphrase?: string): string {
  const paramString = Object.entries(cleanPayload(data))
    .map(([key, value]) => `${key}=${encodePayFastValue(value)}`)
    .join('&');

  return passphrase?.trim()
    ? `${paramString}&passphrase=${encodePayFastValue(passphrase)}`
    : paramString;
}

function signPayload(data: Record<string, string>, passphrase: string): string {
  return md5(toPayFastParamString(data, passphrase));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const MERCHANT_ID = Deno.env.get('PAYFAST_MERCHANT_ID');
    const MERCHANT_KEY = Deno.env.get('PAYFAST_MERCHANT_KEY');
    const PASSPHRASE = Deno.env.get('PAYFAST_PASSPHRASE');
    const IS_SANDBOX = Deno.env.get('PAYFAST_SANDBOX') === '1';
    const PAYFAST_PROCESS_URL = IS_SANDBOX ? PAYFAST_TEST : PAYFAST_LIVE;
    const SITE_URL = Deno.env.get('PUBLIC_SITE_URL') || 'https://sjoh.co.za';
    if (!MERCHANT_ID || !MERCHANT_KEY || !PASSPHRASE) {
      throw new Error('PAYFAST_MERCHANT_ID / PAYFAST_MERCHANT_KEY / PAYFAST_PASSPHRASE not configured');
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
    const userId = userData.user.id;
    const userEmail = userData.user.email ?? '';

    const body = await req.json().catch(() => ({}));
    const rawTier = body.tier as Tier;
    const rawCycle = (body.billing_cycle ?? 'monthly') as BillingCycle;
    const trialDays = Math.max(0, Math.min(90, Number.parseInt(String(body.trial_days ?? '0'), 10) || 0));
    const callbackUrl = String(body.callback_url ?? `${SITE_URL}/dashboard?paid=1`);

    if (!['basic', 'verified_pro', 'hustler', 'main-oke'].includes(rawTier)) {
      return new Response(JSON.stringify({ error: 'Invalid tier' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (rawCycle !== 'monthly' && rawCycle !== 'annual') {
      return new Response(JSON.stringify({ error: 'Invalid billing_cycle' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const tier = normalize(rawTier);

    // PayFast amounts in Rands (not cents like Paystack)
    const AMOUNTS: Record<string, Record<string, string>> = {
      basic:        { monthly: '50.00',  annual: '540.00' },
      verified_pro: { monthly: '250.00', annual: '2700.00' },
    };

    const recurringAmount = AMOUNTS[tier][rawCycle];
    const amount = trialDays > 0 ? '0.00' : recurringAmount;
    const trialLabel = trialDays > 0 ? ` - ${trialDays}-Day Trial` : '';

    // Build form fields for PayFast
    const fields = cleanPayload({
      merchant_id: MERCHANT_ID,
      merchant_key: MERCHANT_KEY,
      return_url: callbackUrl,
      cancel_url: `${SITE_URL}/pricing?payment=cancelled`,
      notify_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payfast-webhook`,
      email_address: userEmail,
      m_payment_id: `${userId}_${Date.now()}`,
      amount: amount,
      item_name: `Sjoh ${tier === 'verified_pro' ? 'Verified Pro' : 'Basic Listing'}${trialLabel} - ${rawCycle === 'annual' ? 'Yearly' : 'Monthly'}`,
      item_description: trialDays > 0
        ? `Sjoh service provider subscription - ${trialDays}-day trial, then ${tier} (${rawCycle})`
        : `Sjoh service provider subscription - ${tier} (${rawCycle})`,
      custom_str1: userId,
      custom_str2: tier,
      custom_str3: rawCycle,
      custom_str4: trialDays > 0 ? `trial_${trialDays}` : '',
      subscription_type: '1',
      recurring_amount: recurringAmount,
      frequency: rawCycle === 'annual' ? '6' : '3',
      cycles: '0',
    });

    const signature = signPayload(fields, PASSPHRASE);

    const redirectParams = { ...fields, signature };
    const queryString = toPayFastParamString(redirectParams);
    const redirectUrl = `${PAYFAST_PROCESS_URL}?${queryString}`;

    return new Response(JSON.stringify({
      redirect_url: redirectUrl,
      form_action: PAYFAST_PROCESS_URL,
      fields: { ...fields, signature },
      m_payment_id: fields.m_payment_id,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('payfast-checkout failed', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// PayFast ITN (Instant Transaction Notification) webhook handler.
// Receives payment notifications from PayFast, validates them,
// then processes subscription charges and events.
//
// ITN flow:
// 1. PayFast POSTs form-encoded data to this endpoint
// 2. We re-POST the raw data to PayFast's validation endpoint
// 3. If "VALID" back, process the transaction
// 4. Subscriptions: store token, update balances, handle cancellations
//
// Webhook is public — verify_jwt is false in supabase/config.toml

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { createHash } from 'node:crypto';

const PF_VALIDATE = 'https://www.payfast.co.za/eng/query/validate';
const PF_SANDBOX_VALIDATE = 'https://sandbox.payfast.co.za/eng/query/validate';

function formEncode(data: Record<string, string>): string {
  return Object.entries(cleanPayload(data, true))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

function md5(input: string): string {
  return createHash('md5').update(input).digest('hex');
}

function encodePayFastValue(value: string): string {
  return encodeURIComponent(value.trim())
    .replace(/[!'()*~]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, '+');
}

function cleanPayload(data: Record<string, string>, includeSignature = false): Record<string, string> {
  return Object.fromEntries(
    Object.entries(data).filter(([key, value]) => {
      if (!includeSignature && key === 'signature') return false;
      return value != null && String(value).trim() !== '';
    })
  );
}

function toSignatureString(data: Record<string, string>, passphrase: string): string {
  const paramString = Object.entries(cleanPayload(data))
    .map(([key, value]) => `${key}=${encodePayFastValue(value)}`)
    .join('&');

  return `${paramString}&passphrase=${encodePayFastValue(passphrase)}`;
}

function expectedAmountFor(tier: string, billingCycle: 'monthly' | 'annual', isTrialSetup = false): number {
  if (isTrialSetup) return 0;
  if (tier === 'basic') {
    return billingCycle === 'annual' ? 540 : 50;
  }
  return billingCycle === 'annual' ? 2700 : 250;
}

function amountsMatch(actual: string, expected: number): boolean {
  const parsed = Number.parseFloat(actual || '0');
  return Number.isFinite(parsed) && Math.abs(parsed - expected) < 0.01;
}

async function validateItn(rawData: Record<string, string>): Promise<boolean> {
  // Send the raw POST data back to PayFast for validation
  // PayFast returns "VALID" or "INVALID"
  const body = formEncode(rawData);
  try {
    const validationUrl = Deno.env.get('PAYFAST_SANDBOX') === '1' ? PF_SANDBOX_VALIDATE : PF_VALIDATE;
    const res = await fetch(validationUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const text = await res.text();
    return text.trim() === 'VALID';
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const MERCHANT_ID = Deno.env.get('PAYFAST_MERCHANT_ID');
  const PASSPHRASE = Deno.env.get('PAYFAST_PASSPHRASE');
  if (!MERCHANT_ID || !PASSPHRASE) {
    console.error('PAYFAST_MERCHANT_ID / PAYFAST_PASSPHRASE not configured');
    return new Response('Server misconfigured', { status: 500 });
  }

  // Parse the incoming form data
  const formData = await req.formData();
  const data: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    data[key] = String(value);
  }

  console.log('PayFast ITN received', JSON.stringify({
    pf_payment_id: data.pf_payment_id,
    payment_status: data.payment_status,
    m_payment_id: data.m_payment_id,
    token: data.token ? 'present' : 'absent',
    amount_gross: data.amount_gross,
  }));

  // 1. Validate with PayFast
  const isValid = await validateItn(data);
  if (!isValid) {
    console.warn('PayFast ITN validation FAILED', { pf_payment_id: data.pf_payment_id });
    return new Response('INVALID ITN', { status: 403 });
  }

  // 2. Verify merchant_id matches ours
  if (data.merchant_id !== MERCHANT_ID) {
    console.warn('Merchant ID mismatch', { got: data.merchant_id, expected: MERCHANT_ID });
    return new Response('Merchant ID mismatch', { status: 403 });
  }

  // 3. Verify signature
  if (PASSPHRASE) {
    const receivedSig = data.signature;
    if (!receivedSig) {
      console.warn('Missing signature in ITN');
      return new Response('Missing signature', { status: 403 });
    }
    const computedSig = md5(toSignatureString(data, PASSPHRASE));
    if (computedSig.toLowerCase() !== receivedSig.toLowerCase()) {
      console.warn('Signature mismatch in ITN');
      return new Response('Signature mismatch', { status: 403 });
    }
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Extract data
  const pfPaymentId = data.pf_payment_id || `pf-${Date.now()}`;
  const paymentStatus = data.payment_status || 'UNKNOWN';
  const mPaymentId = data.m_payment_id || '';
  const userId = data.custom_str1 || '';
  const rawTier = data.custom_str2 || 'verified_pro';
  const tier = rawTier === 'basic' ? 'basic' : 'verified_pro';
  const billingCycle: 'monthly' | 'annual' = (data.custom_str3 === 'annual' ? 'annual' : 'monthly');
  const trialMatch = (data.custom_str4 || '').match(/^trial_(\d+)$/);
  const trialDays = trialMatch ? Number.parseInt(trialMatch[1], 10) : 0;
  const amount = data.amount_gross || data.amount || '0';
  const isTrialSetup = trialDays > 0 && trialDays <= 90 && amountsMatch(amount, 0);
  const token = data.token || ''; // subscription token (for recurring)
  const pfSubscriptionId = data.subscription_id || '';

  // Determine event kind before any business-rule validation.
  let kind = 'other';
  const failedStatuses = new Set(['FAILED', 'DECLINED', 'LOCKED', 'PAUSED']);

  if (paymentStatus === 'COMPLETE' && token) {
    kind = 'subscription_charge';
  } else if (paymentStatus === 'COMPLETE') {
    // One-time payment (no subscription token)
    kind = 'subscription_charge';
  } else if (paymentStatus === 'CANCELLED') {
    kind = 'subscription_cancelled';
  } else if (failedStatuses.has(paymentStatus)) {
    kind = 'subscription_payment_failed';
  } else {
    // Log but don't fail — could be a new PayFast event type
    console.log('Unknown PayFast payment_status', { paymentStatus, pf_payment_id: pfPaymentId });
  }

  if (kind === 'subscription_charge') {
    const expectedAmount = expectedAmountFor(tier, billingCycle, isTrialSetup);
    if (!amountsMatch(amount, expectedAmount)) {
      console.warn('PayFast amount mismatch', {
        pf_payment_id: pfPaymentId,
        got: amount,
        expected: expectedAmount,
        tier,
        billingCycle,
        isTrialSetup,
      });
      return new Response('Amount mismatch', { status: 403 });
    }
  }

  // Deduplicate by pf_payment_id
  const { data: existing } = await admin
    .from('payment_events')
    .select('id')
    .eq('payfast_pf_payment_id', pfPaymentId)
    .maybeSingle();

  if (existing) {
    console.log('Duplicate ITN, already processed', { pf_payment_id: pfPaymentId });
    return new Response('ok', { status: 200 });
  }

  // Insert payment event
  const { data: insertedEvent, error: insErr } = await admin
    .from('payment_events')
    .insert({
      user_id: userId || null,
      payfast_pf_payment_id: pfPaymentId,
      payfast_payment_status: paymentStatus,
      provider: 'payfast',
      kind,
      amount_cents: Math.round(parseFloat(amount) * 100),
      currency: 'ZAR',
      billing_cycle: kind === 'subscription_charge' ? billingCycle : null,
      raw: { data, headers: Object.fromEntries(req.headers.entries()) },
    })
    .select()
    .single();

  if (insErr) {
    if ((insErr as any).code === '23505') {
      return new Response('ok', { status: 200 });
    }
    console.error('payment_events insert failed', insErr);
    return new Response('insert failed', { status: 500 });
  }

  // Process based on event kind
  let processError: string | null = null;
  try {
    if (kind === 'subscription_charge' && userId) {
      const renewalMs = billingCycle === 'annual'
        ? 365 * 24 * 60 * 60 * 1000
        : 30  * 24 * 60 * 60 * 1000;
      const trialMs = isTrialSetup ? trialDays * 24 * 60 * 60 * 1000 : 0;

      // If PayFast sent next billing date, use it; otherwise estimate
      const nextBillingDate = data.billing_date || new Date(Date.now() + (trialMs || renewalMs)).toISOString();

      if (token) {
        // This is the initial or a recurring subscription charge with a token
        const { error } = await admin.rpc('apply_subscription_payment', {
          _user_id: userId,
          _tier: tier,
          _payfast_token: token,
          _payfast_subscription_token: pfSubscriptionId || token,
          _next_renewal: nextBillingDate,
          _billing_cycle: billingCycle,
        });
        if (error) processError = error.message;
      } else {
        // One-time payment or legacy — still try to apply
        const { error } = await admin.rpc('apply_subscription_payment', {
          _user_id: userId,
          _tier: tier,
          _payfast_token: pfPaymentId,
          _payfast_subscription_token: '',
          _next_renewal: nextBillingDate,
          _billing_cycle: billingCycle,
        });
        if (error) processError = error.message;
      }
    } else if (kind === 'subscription_cancelled' || kind === 'subscription_payment_failed') {
      // Use token or subscription_id to lapse
      const subToken = token || pfSubscriptionId;
      if (subToken) {
        const { error } = await admin.rpc('lapse_subscription', {
          _subscription_token: subToken,
        });
        if (error) processError = error.message;
      }
    }
  } catch (err) {
    processError = err instanceof Error ? err.message : 'Unknown';
  }

  // Mark event as processed
  await admin
    .from('payment_events')
    .update({
      processed: !processError,
      processed_at: new Date().toISOString(),
      error_message: processError,
    })
    .eq('id', insertedEvent.id);

  console.log('PayFast ITN processed', {
    pf_payment_id: pfPaymentId,
    kind,
    status: paymentStatus,
    error: processError,
  });

  return new Response('ok', { status: 200 });
});

// Daily lifecycle sweep:
//  - sends renewal reminders 3 days before PayFast renewal
//  - hides lapsed/cancelled listings
//  - reminds lapsed businesses after 10 days hidden
//  - archives lapsed listings after 30 days hidden
//  - sends an archive notice once
// Triggered daily by pg_cron (see migration in lovable.md / supabase scheduled jobs).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

const SITE_URL = 'https://sjoh.co.za';

function dateOnly(value: string | Date): string {
  return new Date(value).toISOString().slice(0, 10);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

async function getPrimaryBusiness(admin: ReturnType<typeof createClient>, userId: string) {
  const { data } = await admin
    .from('businesses')
    .select('id, name, slug, listing_status')
    .eq('owner_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  return data as { id: string; name: string | null; slug: string | null; listing_status: string | null } | null;
}

async function getUserEmail(admin: ReturnType<typeof createClient>, userId: string): Promise<string | null> {
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error) {
    console.error('Could not read user email for billing lifecycle', { userId, error: error.message });
    return null;
  }
  return data.user?.email ?? null;
}

async function markNotification(
  admin: ReturnType<typeof createClient>,
  userId: string,
  kind: 'renewal_3d' | 'lapsed_10d' | 'archived_30d',
  anchorDate: string,
  metadata: Record<string, unknown>,
): Promise<boolean> {
  const { error } = await admin.from('billing_lifecycle_notifications').insert({
    user_id: userId,
    kind,
    anchor_date: anchorDate,
    metadata,
  });
  if (!error) return true;
  if ((error as { code?: string }).code === '23505') return false;
  console.error('Could not mark billing lifecycle notification', { userId, kind, anchorDate, error });
  return false;
}

async function sendBillingEmail(
  supabaseUrl: string,
  serviceKey: string,
  templateName: string,
  recipientEmail: string,
  templateData: Record<string, unknown>,
) {
  const response = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      template_name: templateName,
      recipient_email: recipientEmail,
      idempotency_key: `${templateName}:${recipientEmail}:${templateData.anchorDate ?? dateOnly(new Date())}`,
      template_data: templateData,
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    console.error('Billing lifecycle email failed', { templateName, recipientEmail, status: response.status, body });
    return false;
  }
  await response.json().catch(() => null);
  return true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(
      supabaseUrl,
      serviceKey,
    );

    let renewalReminders = 0;
    let lapsedReminders = 0;
    let archivedReminders = 0;

    const now = new Date();
    const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const { data: renewals } = await admin
      .from('provider_balances')
      .select('user_id, tier, next_renewal_at, billing_cycle')
      .in('tier', ['basic', 'verified_pro'])
      .not('next_renewal_at', 'is', null)
      .gte('next_renewal_at', now.toISOString())
      .lte('next_renewal_at', inThreeDays.toISOString());

    for (const row of renewals ?? []) {
      const userId = String(row.user_id);
      const anchorDate = dateOnly(String(row.next_renewal_at));
      const business = await getPrimaryBusiness(admin, userId);
      const shouldSend = await markNotification(admin, userId, 'renewal_3d', anchorDate, {
        next_renewal_at: row.next_renewal_at,
        tier: row.tier,
      });
      if (!shouldSend) continue;
      const email = await getUserEmail(admin, userId);
      if (!email) continue;
      const sent = await sendBillingEmail(supabaseUrl, serviceKey, 'billing-renewal-reminder', email, {
        anchorDate,
        businessName: business?.name ?? 'your business',
        renewalDate: formatDate(String(row.next_renewal_at)),
        amount: row.tier === 'basic' ? 'R50' : 'R250',
      });
      if (sent) renewalReminders++;
    }

    const { data, error } = await admin.rpc('run_lifecycle_sweep');
    if (error) throw error;

    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const { data: lapsedRows } = await admin
      .from('provider_balances')
      .select('user_id, tier_expires_at')
      .eq('tier', 'locked')
      .not('tier_expires_at', 'is', null)
      .lte('tier_expires_at', tenDaysAgo.toISOString())
      .gt('tier_expires_at', thirtyDaysAgo.toISOString());

    for (const row of lapsedRows ?? []) {
      const userId = String(row.user_id);
      const lapsedAt = String(row.tier_expires_at);
      const anchorDate = dateOnly(lapsedAt);
      const business = await getPrimaryBusiness(admin, userId);
      const archiveAt = new Date(new Date(lapsedAt).getTime() + 30 * 24 * 60 * 60 * 1000);
      const daysLeft = Math.max(0, Math.ceil((archiveAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
      const shouldSend = await markNotification(admin, userId, 'lapsed_10d', anchorDate, {
        lapsed_at: lapsedAt,
        archive_at: archiveAt.toISOString(),
      });
      if (!shouldSend) continue;
      const email = await getUserEmail(admin, userId);
      if (!email) continue;
      const sent = await sendBillingEmail(supabaseUrl, serviceKey, 'billing-profile-hidden', email, {
        anchorDate,
        businessName: business?.name ?? 'your business profile',
        daysLeft,
      });
      if (sent) lapsedReminders++;
    }

    const { data: archivedRows } = await admin
      .from('provider_balances')
      .select('user_id, tier_expires_at')
      .eq('tier', 'locked')
      .not('tier_expires_at', 'is', null)
      .lte('tier_expires_at', thirtyDaysAgo.toISOString());

    for (const row of archivedRows ?? []) {
      const userId = String(row.user_id);
      const anchorDate = dateOnly(String(row.tier_expires_at));
      const business = await getPrimaryBusiness(admin, userId);
      if (business?.listing_status !== 'archived') continue;
      const shouldSend = await markNotification(admin, userId, 'archived_30d', anchorDate, {
        lapsed_at: row.tier_expires_at,
        profile_url: business?.slug ? `${SITE_URL}/business/${business.slug}` : null,
      });
      if (!shouldSend) continue;
      const email = await getUserEmail(admin, userId);
      if (!email) continue;
      const sent = await sendBillingEmail(supabaseUrl, serviceKey, 'billing-profile-archived', email, {
        anchorDate,
        businessName: business?.name ?? 'your business profile',
      });
      if (sent) archivedReminders++;
    }

    console.log('lifecycle-tick result', data);
    return new Response(JSON.stringify({
      ok: true,
      result: data,
      reminders: {
        renewal_3d: renewalReminders,
        lapsed_10d: lapsedReminders,
        archived_30d: archivedReminders,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('lifecycle-tick failed', msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

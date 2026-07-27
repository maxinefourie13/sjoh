// Sends emails AND web push notifications to providers in the same category + city
// when a new job is posted.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID");
const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");

const MAX_RECIPIENTS = 200;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes } = await userClient.auth.getUser();
    if (!userRes?.user) {
      return new Response(JSON.stringify({ error: "unauthenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const opportunityId = String(body?.opportunity_id ?? "");
    const explicitUrgent = body?.urgent === true;
    if (!opportunityId) {
      return new Response(JSON.stringify({ error: "opportunity_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: opp } = await admin
      .from("opportunities")
      .select("id, title, description, category_slug, category_name, city, budget, client_id, is_urgent")
      .eq("id", opportunityId)
      .maybeSingle();
    if (!opp) {
      return new Response(JSON.stringify({ error: "opportunity not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isUrgent = explicitUrgent || !!opp.is_urgent;

    // Find matching businesses (same category + city, exclude the poster's own businesses).
    // Urgent notifications are restricted to active Verified Pro plans downstream.
    const matchQuery = admin
      .from("businesses")
      .select("id, name, owner_id")
      .eq("category_slug", opp.category_slug)
      .ilike("city", opp.city)
      .neq("owner_id", opp.client_id)
      .limit(MAX_RECIPIENTS);

    const { data: matches } = await matchQuery;

    if (!matches || matches.length === 0) {
      return new Response(JSON.stringify({ ok: true, recipients: 0, urgent: isUrgent }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ownerIds = [...new Set(matches.map((b: any) => b.owner_id))];

    // Pull notification preferences + tier in one go.
    // Urgent jobs require an active Verified Pro tier.
    const { data: balances } = await admin
      .from("provider_balances")
      .select("user_id, email_alerts_optin, push_alerts_optin, onesignal_player_id, tier, tier_expires_at, trial_ends_at")
      .in("user_id", ownerIds);

    const prefMap = new Map<string, any>();
    for (const b of balances ?? []) prefMap.set(b.user_id, b);

    const isVerifiedProActive = (b: any) => {
      if (!b) return false;
      const now = Date.now();
      if (b.tier === "verified_pro") {
        return !b.tier_expires_at || new Date(b.tier_expires_at).getTime() > now;
      }
      if (b.tier === "verified_pro_trial") {
        return !!b.trial_ends_at && new Date(b.trial_ends_at).getTime() > now;
      }
      return false;
    };

    const jobUrl = `https://sjoh.co.za/opportunities/${opp.id}`;
    let emailsSent = 0;
    const pushIds: string[] = [];

    for (const ownerId of ownerIds) {
      const prefs = prefMap.get(ownerId) ?? { email_alerts_optin: true };
      if (isUrgent && !isVerifiedProActive(prefs)) continue;

      // Email path
      if (prefs.email_alerts_optin !== false) {
        const { data: u } = await admin.auth.admin.getUserById(ownerId);
        const email = u?.user?.email;
        if (email) {
          const { error: sendErr } = await admin.functions.invoke("send-transactional-email", {
            body: {
              templateName: "new-job-in-area",
              recipientEmail: email,
              idempotencyKey: `new-job-${opp.id}-${ownerId}`,
              templateData: {
                jobTitle: opp.title,
                description: (opp.description ?? "").slice(0, 240),
                categoryName: opp.category_name,
                city: opp.city,
                budget: opp.budget,
                jobUrl,
              },
            },
          });
          if (!sendErr) emailsSent++;
          else console.error("send err", ownerId, sendErr);
        }
      }

      // Push path — collect player IDs
      if (prefs.push_alerts_optin && prefs.onesignal_player_id) {
        pushIds.push(prefs.onesignal_player_id);
      }
    }

    // Send push in one batch
    let pushSent = 0;
    if (pushIds.length > 0 && ONESIGNAL_APP_ID && ONESIGNAL_REST_API_KEY) {
      try {
        const r = await fetch("https://api.onesignal.com/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
          },
          body: JSON.stringify({
            app_id: ONESIGNAL_APP_ID,
            include_player_ids: pushIds,
            headings: { en: "🔥 Fresh Graft!" },
            contents: {
              en: `A ${opp.category_name} job was just posted in ${opp.city}. Send your quote!`,
            },
            url: jobUrl,
          }),
        });
        if (r.ok) pushSent = pushIds.length;
        else console.error("OneSignal", await r.text());
      } catch (e) {
        console.error("OneSignal err", e);
      }
    }

    return new Response(
      JSON.stringify({ ok: true, recipients: ownerIds.length, emailsSent, pushSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("notify-new-job", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

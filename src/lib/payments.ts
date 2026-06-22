import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Tier = "basic" | "verified_pro";
export type BillingCycle = "monthly" | "annual";
export interface TrialCodeRedemption {
  tier: "basic_trial" | "basic" | "verified_pro_trial" | "verified_pro";
  trial_ends_at: string;
  code: string;
}

async function startPayFastCheckout(
  tier: Tier,
  billing_cycle: BillingCycle = "monthly",
  options: { trialDays?: number; callbackPath?: string } = {},
) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    toast({ title: "Sign in first, boet", description: "Log in to continue with payment.", variant: "destructive" });
    return null;
  }

  toast({
    title: "Taking you to PayFast",
    description: options.trialDays
      ? "Add your card securely. You will not be charged today."
      : "Sorting the payment gateway…",
  });

  const { data, error } = await supabase.functions.invoke("payfast-checkout", {
    body: {
      tier,
      billing_cycle,
      trial_days: options.trialDays,
      callback_url: window.location.origin + (options.callbackPath ?? "/dashboard?paid=1"),
    },
  });

  if (error || (!data?.form_action && !data?.redirect_url)) {
    toast({
      title: "Aikona!",
      description: "Payment setup failed. The system might still be waking up — try again.",
      variant: "destructive",
    });
    return null;
  }

  if (data.form_action && data.fields && typeof data.fields === "object") {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = data.form_action;
    form.style.display = "none";

    for (const [name, value] of Object.entries(data.fields as Record<string, string>)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = String(value);
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  } else {
    window.location.href = data.redirect_url;
  }

  return data.m_payment_id as string;
}

export const payments = {
  startSubscription: (tier: Tier, billing_cycle: BillingCycle = "monthly") =>
    startPayFastCheckout(tier, billing_cycle),
  startTrialSubscription: (tier: Tier, billing_cycle: BillingCycle = "monthly", trialDays = 30) =>
    startPayFastCheckout(tier, billing_cycle, {
      trialDays,
      callbackPath: "/dashboard?paid=1&trial_started=1",
    }),
  redeemTrialCode: async (code: string): Promise<TrialCodeRedemption | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: "Sign in first", description: "Create your Sjoh account before redeeming a trial code." });
      return null;
    }

    const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    // Cast through any: the generated types file lags behind newer RPCs
    // (redeem_trial_code is deployed but not in src/integrations/supabase/types.ts yet).
    const { data, error } = await (supabase.rpc as any)("redeem_trial_code", { _code: normalized });

    if (error) {
      toast({
        title: "Trial code did not work",
        description: error.message || "Check the code and try again.",
        variant: "destructive",
      });
      return null;
    }

    const redemption = data?.[0] ?? null;
    if (!redemption) {
      toast({
        title: "Trial code did not work",
        description: "No redemption came back from Sjoh. Please try again.",
        variant: "destructive",
      });
      return null;
    }

    const days = Math.max(
      1,
      Math.round((new Date(redemption.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    );
    const isPaidStyleAccess = redemption.tier === "basic" || redemption.tier === "verified_pro";
    const durationLabel = days >= 360 ? "1-year" : `${days}-day`;

    toast({
      title: `${redemption.code} unlocked`,
      description: isPaidStyleAccess
        ? `Your ${durationLabel} Verified Pro access is live. Go build that profile properly.`
        : `Your ${durationLabel} Verified Pro trial is live. Go build that profile properly.`,
    });

    return redemption as TrialCodeRedemption;
  },
};

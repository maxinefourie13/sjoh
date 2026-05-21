import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Tier = "basic" | "verified_pro";
export type BillingCycle = "monthly" | "annual";
export interface TrialCodeRedemption {
  tier: "verified_pro_trial";
  trial_ends_at: string;
  code: string;
}

async function startPayFastCheckout(
  tier: Tier,
  billing_cycle: BillingCycle = "monthly",
) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    toast({ title: "Sign in first, boet", description: "Log in to continue with payment.", variant: "destructive" });
    return null;
  }

  toast({ title: "Taking you to PayFast", description: "Sorting the payment gateway…" });

  const { data, error } = await supabase.functions.invoke("payfast-checkout", {
    body: {
      tier,
      billing_cycle,
      callback_url: window.location.origin + "/dashboard?paid=1",
    },
  });

  if (error || !data?.redirect_url) {
    toast({
      title: "Aikona!",
      description: "Payment setup failed. The system might still be waking up — try again.",
      variant: "destructive",
    });
    return null;
  }

  // PayFast supports both GET redirect and form POST.
  // The edge function returns a full redirect URL with all signed params.
  window.location.href = data.redirect_url;
  return data.m_payment_id as string;
}

export const payments = {
  startSubscription: (tier: Tier, billing_cycle: BillingCycle = "monthly") =>
    startPayFastCheckout(tier, billing_cycle),
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

    toast({
      title: `${redemption.code} unlocked`,
      description: "Your 30-day Verified Pro trial is live. Go build that profile properly.",
    });

    return redemption as TrialCodeRedemption;
  },
};

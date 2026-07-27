import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Tier = "none" | "basic_trial" | "basic" | "verified_pro_trial" | "verified_pro" | "locked";
export type ProviderStatus = "trialing" | "active" | "locked" | "none";

export interface ProviderAccess {
  loading: boolean;
  tier: Tier;
  /** Derived high-level state: trialing | active | locked | none. */
  status: ProviderStatus;
  trialEndsAt: string | null;
  tierExpiresAt: string | null;
  nextRenewalAt: string | null;
  /** Pro is on a paid plan or active trial → listed publicly. */
  hasListingAccess: boolean;
  /** Pro can apply for jobs with an active Verified Pro paid plan or trial. */
  hasVerifiedProAccess: boolean;
  /** True while the trial is still ticking. */
  isOnTrial: boolean;
  /** True if account auto-locked after a lapsed trial without a payment method. */
  isLocked: boolean;
  /** Days left of trial (0 if not on trial / expired). */
  trialDaysLeft: number;
  /** Days until archived after a payment lapse/cancellation, when known. */
  graceDaysLeft: number | null;
  archiveAt: string | null;
  /** Founding-member perk fields */
  isFoundingMember: boolean;
  /** True if founding member AND hasn't used their 1 free proposal this calendar month. */
  foundingProposalAvailable: boolean;
  /** First day of next calendar month — when the credit resets. */
  foundingProposalsResetAt: Date | null;
}

const DEFAULT: ProviderAccess = {
  loading: true,
  tier: "none",
  status: "none",
  trialEndsAt: null,
  tierExpiresAt: null,
  nextRenewalAt: null,
  hasListingAccess: false,
  hasVerifiedProAccess: false,
  isOnTrial: false,
  isLocked: false,
  trialDaysLeft: 0,
  graceDaysLeft: null,
  archiveAt: null,
  isFoundingMember: false,
  foundingProposalAvailable: false,
  foundingProposalsResetAt: null,
};

function nextMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

function currentMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

const DEV_OVERRIDE = import.meta.env.DEV && import.meta.env.VITE_TIER_OVERRIDE === "verified_pro";
const DEV_OVERRIDE_ACCESS: ProviderAccess = {
  loading: false,
  tier: "verified_pro",
  status: "active",
  trialEndsAt: null,
  tierExpiresAt: null,
  nextRenewalAt: null,
  hasListingAccess: true,
  hasVerifiedProAccess: true,
  isOnTrial: false,
  isLocked: false,
  trialDaysLeft: 0,
  graceDaysLeft: null,
  archiveAt: null,
  isFoundingMember: false,
  foundingProposalAvailable: false,
  foundingProposalsResetAt: null,
};

export function useProviderAccess(): ProviderAccess {
  const { user } = useAuth();
  const [state, setState] = useState<ProviderAccess>(DEFAULT);

  useEffect(() => {
    if (DEV_OVERRIDE) {
      setState(DEV_OVERRIDE_ACCESS);
      return;
    }
    if (!user) { setState({ ...DEFAULT, loading: false }); return; }
    (async () => {
      const [{ data: bal }, { data: foundingFlag }] = await Promise.all([
        supabase
          .from("provider_balances")
          .select("tier, trial_ends_at, tier_expires_at, next_renewal_at, founding_proposals_used_this_month, founding_proposals_period_start")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase.rpc("is_founding_member", { _user_id: user.id }),
      ]);

      const isFoundingMember = !!foundingFlag;

      if (!bal) {
        setState({
          ...DEFAULT,
          loading: false,
          isFoundingMember,
          foundingProposalAvailable: isFoundingMember,
          foundingProposalsResetAt: isFoundingMember ? nextMonthStart() : null,
        });
        return;
      }

      const tier = (bal.tier ?? "none") as Tier;
      const trialEndsAt = bal.trial_ends_at ?? null;
      const tierExpiresAt = bal.tier_expires_at ?? null;
      const nextRenewalAt = bal.next_renewal_at ?? null;

      const now = Date.now();
      const trialLive = !!trialEndsAt && new Date(trialEndsAt).getTime() > now;
      const tierLive = !tierExpiresAt || new Date(tierExpiresAt).getTime() > now;

      const isLocked = tier === "locked";
      const isPaidBasic = tier === "basic" && tierLive;
      const isPaidPro = tier === "verified_pro" && tierLive;
      const isTrialBasic = tier === "basic_trial" && trialLive;
      const isTrialPro = tier === "verified_pro_trial" && trialLive;

      const trialDaysLeft = trialLive
        ? Math.max(0, Math.ceil((new Date(trialEndsAt!).getTime() - now) / (1000 * 60 * 60 * 24)))
        : 0;
      const archiveAtDate = isLocked && tierExpiresAt
        ? new Date(new Date(tierExpiresAt).getTime() + 30 * 24 * 60 * 60 * 1000)
        : null;
      const graceDaysLeft = archiveAtDate
        ? Math.max(0, Math.ceil((archiveAtDate.getTime() - now) / (1000 * 60 * 60 * 24)))
        : null;

      const status: ProviderStatus = isLocked
        ? "locked"
        : (isPaidBasic || isPaidPro)
          ? "active"
          : (isTrialBasic || isTrialPro)
            ? "trialing"
            : "none";

      const periodStart = bal.founding_proposals_period_start
        ? new Date(bal.founding_proposals_period_start)
        : null;
      const periodIsCurrent = periodStart && periodStart >= currentMonthStart();
      const usedThisMonth = periodIsCurrent ? (bal.founding_proposals_used_this_month ?? 0) : 0;
      const foundingProposalAvailable = isFoundingMember && usedThisMonth < 1;

      setState({
        loading: false,
        tier,
        status,
        trialEndsAt,
        tierExpiresAt,
        nextRenewalAt,
        hasListingAccess: isPaidBasic || isPaidPro || isTrialBasic || isTrialPro,
        hasVerifiedProAccess: isPaidPro || isTrialPro,
        isOnTrial: isTrialBasic || isTrialPro,
        isLocked,
        trialDaysLeft,
        graceDaysLeft,
        archiveAt: archiveAtDate?.toISOString() ?? null,
        isFoundingMember,
        foundingProposalAvailable,
        foundingProposalsResetAt: isFoundingMember ? nextMonthStart() : null,
      });
    })();
  }, [user]);

  return DEV_OVERRIDE ? DEV_OVERRIDE_ACCESS : state;
}

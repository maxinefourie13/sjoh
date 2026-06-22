import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { useProviderAccess } from "@/hooks/useProviderAccess";

/**
 * Shown on the dashboard when an owner's listing is hidden (workshop) or
 * archived because their trial ended or their subscription lapsed.
 */
export const SubscriptionGapBanner = () => {
  const { business } = useMyBusiness();
  const access = useProviderAccess();
  if (!business) return null;
  const status = business.listing_status;
  if (status !== "workshop" && status !== "archived") return null;

  const isArchived = status === "archived";
  const graceCopy = access.graceDaysLeft !== null && access.graceDaysLeft > 0
    ? ` We keep it saved for ${access.graceDaysLeft} more day${access.graceDaysLeft === 1 ? "" : "s"} before it moves to archive.`
    : "";

  return (
    <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-start gap-3 flex-1">
        <span className="size-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shrink-0">
          <AlertCircle className="size-4" strokeWidth={2.5} />
        </span>
        <div>
          <p className="font-display text-sm font-semibold">
            {isArchived ? "Your business profile is archived" : "Your business profile is hidden"}
          </p>
          <p className="text-xs text-ink-2 mt-0.5">
            {isArchived
              ? "Customers cannot see it and quoting tools are locked. Reactivate Verified Pro to bring the profile back."
              : `Customers cannot see it right now, and quoting tools are locked until billing is sorted.${graceCopy}`}
          </p>
        </div>
      </div>
      <Link
        to="/pricing"
        className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-accent hover:underline shrink-0"
      >
        Reactivate <ArrowRight className="size-3.5" strokeWidth={2.5} />
      </Link>
    </div>
  );
};

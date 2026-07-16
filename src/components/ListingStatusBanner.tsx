import { useState } from "react";
import { MoonStar, Archive, Loader2 } from "lucide-react";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Single banner that swaps copy + colour based on the owner's
 * listing_status. Shown above SiteHeader for any signed-in pro.
 *
 * - workshop  → coral, pre-launch messaging
 * - dormant   → amber, "your listing is paused" + reactivate button
 * - archived  → slate, "your listing is archived" + reactivate button
 * - active    → nothing
 */
export const ListingStatusBanner = () => {
  const { business, loading, refresh } = useMyBusiness();
  const [reactivating, setReactivating] = useState(false);

  if (loading || !business) return null;
  if (business.listing_status === "active") return null;

  const handleReactivate = async () => {
    setReactivating(true);
    const { error } = await supabase.rpc("reactivate_listing", {
      _business_id: business.id,
    });
    setReactivating(false);

    if (error) {
      toast.error("Couldn't reactivate. Try again now-now.");
      return;
    }
    toast.success("Sorted — your listing is live again.");
    await refresh();
  };

  // Sjoh is live — the pre-launch "workshop" state is retired. Any stray
  // workshop rows behave like active (no banner).
  if (business.listing_status === "workshop") return null;

  if (business.listing_status === "dormant") {
    return (
      <div className="w-full bg-amber-500 text-amber-950">
        <div className="container py-2.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm">
          <div className="flex items-center gap-3 flex-1">
            <MoonStar className="size-4 shrink-0" strokeWidth={2.5} />
            <p className="font-semibold leading-tight">
              Your listing is paused{" "}
              <span className="font-normal opacity-90">
                — no activity for 60 days, so customers can't find you right
                now. One click brings it back.
              </span>
            </p>
          </div>
          <button
            onClick={handleReactivate}
            disabled={reactivating}
            className="shrink-0 bg-amber-950 text-amber-50 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-amber-900 transition-colors disabled:opacity-60 inline-flex items-center gap-1.5"
          >
            {reactivating && <Loader2 className="size-3 animate-spin" />}
            Reactivate listing
          </button>
        </div>
      </div>
    );
  }

  // archived
  return (
    <div className="w-full bg-slate-800 text-slate-100">
      <div className="container py-2.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm">
        <div className="flex items-center gap-3 flex-1">
          <Archive className="size-4 shrink-0" strokeWidth={2.5} />
          <p className="font-semibold leading-tight">
            Your listing is archived{" "}
            <span className="font-normal opacity-80">
              — it's been a while. Hit reactivate and we'll bring it back
              exactly as it was.
            </span>
          </p>
        </div>
        <button
          onClick={handleReactivate}
          disabled={reactivating}
          className="shrink-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-60 inline-flex items-center gap-1.5"
        >
          {reactivating && <Loader2 className="size-3 animate-spin" />}
          Reactivate listing
        </button>
      </div>
    </div>
  );
};

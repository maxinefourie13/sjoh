import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ListingStatus = "workshop" | "active" | "dormant" | "archived";

export interface MyBusiness {
  id: string;
  name: string;
  slug: string;
  category_slug: string;
  city: string;
  province: string;
  pre_launch: boolean;
  listing_status: ListingStatus;
  last_active_at: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  image_url: string | null;
  logo_url: string | null;
  google_place_id: string | null;
  google_maps_url: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  google_reviews_last_fetched_at: string | null;
}

/**
 * Fetches the logged-in provider's business record (first one if they own multiple).
 * Returns `null` while loading or if the user doesn't have a business yet.
 */
export function useMyBusiness() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<MyBusiness | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setBusiness(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("businesses")
      .select("id, name, slug, category_slug, city, province, pre_launch, listing_status, last_active_at, phone, email, website, description, image_url, logo_url, google_place_id, google_maps_url, google_rating, google_review_count, google_reviews_last_fetched_at")
      .eq("owner_id", user.id)
      .limit(1)
      .maybeSingle();
    setBusiness((data as MyBusiness) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      await refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return { business, loading, refresh };
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Business } from "@/lib/mockData";
import { mapBusinessRow, mapServiceRow, mapReviewRow } from "@/lib/businessAdapter";

interface GoogleReview {
  id: string;
  authorName: string;
  authorPhotoUrl: string | null;
  rating: number;
  text: string | null;
  relativeTime: string | null;
}

interface State {
  business: Business | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  googleMapsUrl: string | null;
  googleReviews: GoogleReview[];
  loading: boolean;
  isFallback: boolean;
}

const empty: State = {
  business: null,
  googleRating: null,
  googleReviewCount: null,
  googleMapsUrl: null,
  googleReviews: [],
  loading: true,
  isFallback: false,
};

export function useBusinessBySlug(slug: string | undefined): State {
  const [state, setState] = useState<State>(empty);

  useEffect(() => {
    if (!slug) {
      setState({ ...empty, loading: false });
      return;
    }
    let cancelled = false;
    (async () => {
      // Try the safe public view first.
      const { data: pub } = await supabase
        .from("businesses_public")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (cancelled) return;

      if (!pub) {
        setState({ ...empty, business: null, loading: false, isFallback: false });
        return;
      }

      // Pull google fields + reviews + services in parallel.
      const [{ data: meta }, { data: services }, { data: reviews }, { data: gReviews }] = await Promise.all([
        supabase
          .from("businesses")
          .select("google_rating, google_review_count, google_maps_url")
          .eq("id", pub.id)
          .maybeSingle(),
        supabase.from("services").select("*").eq("business_id", pub.id).order("sort_order"),
        supabase
          .from("reviews")
          .select("*")
          .eq("business_id", pub.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("business_google_reviews")
          .select("*")
          .eq("business_id", pub.id)
          .order("time", { ascending: false }),
      ]);

      if (cancelled) return;

      const business = mapBusinessRow(pub);
      business.services = (services ?? []).map(mapServiceRow);
      business.reviews = (reviews ?? []).map(mapReviewRow);

      setState({
        business,
        googleRating: meta?.google_rating ?? null,
        googleReviewCount: meta?.google_review_count ?? null,
        googleMapsUrl: meta?.google_maps_url ?? null,
        googleReviews: (gReviews ?? []).map((r: any) => ({
          id: r.id,
          authorName: r.author_name,
          authorPhotoUrl: r.author_photo_url,
          rating: r.rating,
          text: r.text,
          relativeTime: r.relative_time,
        })),
        loading: false,
        isFallback: false,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
}

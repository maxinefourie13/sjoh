import type { Business, Province } from "@/lib/mockData";

/** Sentinel id used everywhere we need to detect the placeholder card. */
export const EXAMPLE_BUSINESS_ID = "example-listing";

/**
 * Build the preview listing card. Used while the directory is still
 * thin — gives visitors a sense of what a real listing looks like without
 * pretending to be a bookable pro. Remove this file + its three injection
 * points once we have enough real verified pros per category.
 */
export function buildExampleBusiness(opts?: {
  category?: string;
  categorySlug?: string;
  province?: Province;
  city?: string;
}): Business {
  return {
    id: EXAMPLE_BUSINESS_ID,
    slug: EXAMPLE_BUSINESS_ID,
    name: "Preview Listing",
    category: opts?.category ?? "Your category",
    categorySlug: opts?.categorySlug ?? "example",
    province: (opts?.province ?? "Gauteng") as Province,
    city: opts?.city ?? "Your city",
    address: "",
    phone: "",
    email: "",
    website: "",
    description:
      "This is what your listing will look like — your name, photo, services and reviews live here. List your business to claim your spot.",
    tags: ["Sample listing", "Preview"],
    isVerified: false,
    hasPromo: false,
    rating: 0,
    reviewCount: 0,
    followers: 0,
    plan: "free",
    gradient: "bg-grad-3",
    image: undefined,
    responseRate: 0,
    hours: "",
    services: [],
    reviews: [],
  };
}

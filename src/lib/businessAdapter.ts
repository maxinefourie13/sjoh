import type { Business, Province } from "@/lib/mockData";

const grads = ["bg-grad-1", "bg-grad-2", "bg-grad-3", "bg-grad-4", "bg-grad-5", "bg-grad-6"];

/** Map a row from `businesses_public` (or `businesses`) to the UI's Business shape. */
export function mapBusinessRow(row: any, idx = 0): Business {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category_name,
    categorySlug: row.category_slug,
    province: row.province as Province,
    city: row.city,
    address: row.address ?? "",
    // contact details only present when reading the owner-scoped row
    phone: row.phone ?? "",
    email: row.email ?? "",
    website: row.website ?? "",
    description: row.description ?? "",
    tags: row.tags ?? [],
    isVerified: !!row.is_verified,
    hasPromo: false,
    rating: Number(row.rating ?? 0),
    reviewCount: row.review_count ?? 0,
    followers: row.followers_count ?? 0,
    plan: (row.plan ?? "free") as Business["plan"],
    gradient: grads[idx % grads.length],
    image: row.image_url ?? undefined,
    responseRate: row.response_rate ?? 0,
    hours: row.hours ?? "",
    services: [],
    reviews: [],
    preLaunch: !!row.pre_launch,
  };
}

export function mapServiceRow(row: any) {
  return {
    name: row.name,
    description: row.description ?? "",
    priceFrom: Number(row.price_from ?? 0),
    priceType: (row.price_type ?? "from") as "fixed" | "from" | "quote",
  };
}

export function mapReviewRow(row: any) {
  return {
    id: row.id,
    reviewerName: row.reviewer_name,
    reviewerCompany: row.reviewer_company ?? undefined,
    rating: row.rating,
    body: row.body,
    date: relativeDate(row.created_at),
    isVerifiedHire: !!row.is_verified_hire,
    source: (row.source as string) ?? "standard",
  };
}

function relativeDate(iso: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days < 1) return "today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

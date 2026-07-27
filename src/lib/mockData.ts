export const PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Limpopo",
  "Mpumalanga",
  "Free State",
  "North West",
  "Northern Cape",
  "Remote (South Africa)",
] as const;

export type Province = (typeof PROVINCES)[number];

export const formatRand = (n: number) =>
  "R " + n.toLocaleString("en-ZA", { maximumFractionDigits: 0 });

export interface CategoryGroup {
  slug: string;
  name: string;
  emoji: string;
}

export interface Category {
  slug: string;
  name: string;
  groupSlug: string;
  emoji: string;
  count: number;
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  { slug: "home-maintenance", name: "Home & Maintenance", emoji: "🏠" },
  { slug: "cleaning-domestic", name: "Cleaning & Domestic", emoji: "🧽" },
  { slug: "garden-outdoor", name: "Garden & Outdoor", emoji: "🌿" },
  { slug: "automotive", name: "Automotive", emoji: "🚗" },
  { slug: "construction-renovation", name: "Construction & Renovation", emoji: "🏗️" },
  { slug: "events-occasions", name: "Events & Occasions", emoji: "🎉" },
  { slug: "business-digital", name: "Business & Digital Services", emoji: "💼" },
  { slug: "personal-lifestyle", name: "Personal & Lifestyle", emoji: "💆" },
  { slug: "moving-logistics", name: "Moving & Logistics", emoji: "📦" },
  { slug: "pet-services", name: "Pet Services", emoji: "🐾" },
  { slug: "specialist-ondemand", name: "Specialist & On-Demand", emoji: "🛠️" },
];

export const CATEGORIES: Category[] = [
  // Home & Maintenance
  { slug: "plumbing", name: "Plumbing", groupSlug: "home-maintenance", emoji: "🔧", count: 942 },
  { slug: "electrical", name: "Electrical", groupSlug: "home-maintenance", emoji: "⚡", count: 1284 },
  { slug: "handyman", name: "Handyman", groupSlug: "home-maintenance", emoji: "🛠️", count: 638 },
  { slug: "roofing", name: "Roofing", groupSlug: "home-maintenance", emoji: "🏚️", count: 287 },
  { slug: "painting", name: "Painting", groupSlug: "home-maintenance", emoji: "🎨", count: 412 },
  { slug: "carpentry", name: "Carpentry", groupSlug: "home-maintenance", emoji: "🪚", count: 341 },
  { slug: "appliance-repair", name: "Appliance Repair", groupSlug: "home-maintenance", emoji: "🧰", count: 254 },
  { slug: "other-home-maintenance", name: "Other", groupSlug: "home-maintenance", emoji: "✨", count: 0 },

  // Cleaning & Domestic
  { slug: "home-cleaning", name: "Home Cleaning", groupSlug: "cleaning-domestic", emoji: "🧹", count: 567 },
  { slug: "deep-cleaning", name: "Deep Cleaning", groupSlug: "cleaning-domestic", emoji: "🪣", count: 218 },
  { slug: "carpet-cleaning", name: "Carpet Cleaning", groupSlug: "cleaning-domestic", emoji: "🧶", count: 167 },
  { slug: "laundry-ironing", name: "Laundry & Ironing", groupSlug: "cleaning-domestic", emoji: "👕", count: 142 },
  { slug: "window-cleaning", name: "Window Cleaning", groupSlug: "cleaning-domestic", emoji: "🪟", count: 124 },
  { slug: "post-construction-cleaning", name: "Post-Construction Cleaning", groupSlug: "cleaning-domestic", emoji: "🧽", count: 98 },
  { slug: "other-cleaning-domestic", name: "Other", groupSlug: "cleaning-domestic", emoji: "✨", count: 0 },

  // Garden & Outdoor
  { slug: "lawn-mowing", name: "Lawn Mowing", groupSlug: "garden-outdoor", emoji: "🌱", count: 312 },
  { slug: "garden-services", name: "Garden Services", groupSlug: "garden-outdoor", emoji: "🌿", count: 421 },
  { slug: "tree-felling", name: "Tree Felling", groupSlug: "garden-outdoor", emoji: "🌳", count: 187 },
  { slug: "landscaping", name: "Landscaping", groupSlug: "garden-outdoor", emoji: "🏞️", count: 234 },
  { slug: "irrigation", name: "Irrigation Systems", groupSlug: "garden-outdoor", emoji: "💧", count: 142 },
  { slug: "pool-maintenance", name: "Pool Maintenance", groupSlug: "garden-outdoor", emoji: "🏊", count: 198 },
  { slug: "other-garden-outdoor", name: "Other", groupSlug: "garden-outdoor", emoji: "✨", count: 0 },

  // Automotive
  { slug: "mobile-car-wash", name: "Mobile Car Wash", groupSlug: "automotive", emoji: "🧼", count: 174 },
  { slug: "mechanics", name: "Mechanics", groupSlug: "automotive", emoji: "🔧", count: 421 },
  { slug: "panel-beating", name: "Panel Beating", groupSlug: "automotive", emoji: "🚙", count: 198 },
  { slug: "tire-services", name: "Tire Services", groupSlug: "automotive", emoji: "🛞", count: 167 },
  { slug: "vehicle-detailing", name: "Vehicle Detailing", groupSlug: "automotive", emoji: "✨", count: 142 },
  { slug: "roadside-assistance", name: "Roadside Assistance", groupSlug: "automotive", emoji: "🛻", count: 138 },
  { slug: "other-automotive", name: "Other", groupSlug: "automotive", emoji: "✨", count: 0 },

  // Construction & Renovation
  { slug: "builders", name: "Builders", groupSlug: "construction-renovation", emoji: "👷", count: 624 },
  { slug: "renovations", name: "Renovations", groupSlug: "construction-renovation", emoji: "🏘️", count: 487 },
  { slug: "tiling", name: "Tiling", groupSlug: "construction-renovation", emoji: "🧱", count: 287 },
  { slug: "bricklaying", name: "Bricklaying", groupSlug: "construction-renovation", emoji: "🧱", count: 234 },
  { slug: "paving", name: "Paving", groupSlug: "construction-renovation", emoji: "⬜", count: 198 },
  { slug: "steelwork-fabrication", name: "Steelwork & Fabrication", groupSlug: "construction-renovation", emoji: "🔩", count: 264 },
  { slug: "other-construction-renovation", name: "Other", groupSlug: "construction-renovation", emoji: "✨", count: 0 },

  // Events & Occasions
  { slug: "event-planning", name: "Event Planning", groupSlug: "events-occasions", emoji: "📅", count: 287 },
  { slug: "catering", name: "Catering", groupSlug: "events-occasions", emoji: "🍽️", count: 738 },
  { slug: "decor-hiring", name: "Decor & Hiring", groupSlug: "events-occasions", emoji: "🎀", count: 198 },
  { slug: "photography", name: "Photography", groupSlug: "events-occasions", emoji: "📷", count: 612 },
  { slug: "djs-entertainment", name: "DJs & Entertainment", groupSlug: "events-occasions", emoji: "🎧", count: 224 },
  { slug: "kids-party-services", name: "Kids Party Services", groupSlug: "events-occasions", emoji: "🎈", count: 142 },
  { slug: "other-events-occasions", name: "Other", groupSlug: "events-occasions", emoji: "✨", count: 0 },

  // Business & Digital Services
  { slug: "web-design", name: "Web Design", groupSlug: "business-digital", emoji: "🌐", count: 524 },
  { slug: "graphic-design", name: "Graphic Design", groupSlug: "business-digital", emoji: "✏️", count: 489 },
  { slug: "social-media-management", name: "Social Media Management", groupSlug: "business-digital", emoji: "📣", count: 367 },
  { slug: "copywriting", name: "Copywriting", groupSlug: "business-digital", emoji: "📝", count: 187 },
  { slug: "virtual-assistants", name: "Virtual Assistants", groupSlug: "business-digital", emoji: "💬", count: 142 },
  { slug: "it-support", name: "IT Support", groupSlug: "business-digital", emoji: "💻", count: 1102 },
  { slug: "other-business-digital", name: "Other", groupSlug: "business-digital", emoji: "✨", count: 0 },

  // Personal & Lifestyle
  { slug: "personal-training", name: "Personal Training", groupSlug: "personal-lifestyle", emoji: "🏋️", count: 156 },
  { slug: "hair-beauty", name: "Hair & Beauty", groupSlug: "personal-lifestyle", emoji: "💇", count: 612 },
  { slug: "makeup-artists", name: "Makeup Artists", groupSlug: "personal-lifestyle", emoji: "💄", count: 198 },
  { slug: "life-coaching", name: "Life Coaching", groupSlug: "personal-lifestyle", emoji: "🧭", count: 87 },
  { slug: "tutoring", name: "Tutoring", groupSlug: "personal-lifestyle", emoji: "📚", count: 387 },
  { slug: "babysitting", name: "Babysitting", groupSlug: "personal-lifestyle", emoji: "🧒", count: 142 },
  { slug: "other-personal-lifestyle", name: "Other", groupSlug: "personal-lifestyle", emoji: "✨", count: 0 },

  // Moving & Logistics
  { slug: "furniture-removal", name: "Furniture Removal", groupSlug: "moving-logistics", emoji: "🛋️", count: 312 },
  { slug: "delivery-services", name: "Delivery Services", groupSlug: "moving-logistics", emoji: "🚚", count: 524 },
  { slug: "courier-services", name: "Courier Services", groupSlug: "moving-logistics", emoji: "📮", count: 287 },
  { slug: "storage-solutions", name: "Storage Solutions", groupSlug: "moving-logistics", emoji: "📦", count: 142 },
  { slug: "packing-services", name: "Packing Services", groupSlug: "moving-logistics", emoji: "📋", count: 98 },
  { slug: "other-moving-logistics", name: "Other", groupSlug: "moving-logistics", emoji: "✨", count: 0 },

  // Pet Services
  { slug: "pet-grooming", name: "Pet Grooming", groupSlug: "pet-services", emoji: "🐩", count: 187 },
  { slug: "pet-sitting", name: "Pet Sitting", groupSlug: "pet-services", emoji: "🐈", count: 142 },
  { slug: "dog-walking", name: "Dog Walking", groupSlug: "pet-services", emoji: "🐕", count: 124 },
  { slug: "boarding", name: "Boarding", groupSlug: "pet-services", emoji: "🏡", count: 98 },
  { slug: "training", name: "Training", groupSlug: "pet-services", emoji: "🦮", count: 76 },
  { slug: "other-pet-services", name: "Other", groupSlug: "pet-services", emoji: "✨", count: 0 },

  // Specialist & On-Demand
  { slug: "locksmiths", name: "Locksmiths", groupSlug: "specialist-ondemand", emoji: "🔐", count: 162 },
  { slug: "security", name: "Security (CCTV, Alarms)", groupSlug: "specialist-ondemand", emoji: "🛡️", count: 489 },
  { slug: "pest-control", name: "Pest Control", groupSlug: "specialist-ondemand", emoji: "🐜", count: 217 },
  { slug: "emergency-repairs", name: "Emergency Repairs", groupSlug: "specialist-ondemand", emoji: "🚨", count: 198 },
  { slug: "inspection-services", name: "Inspection Services", groupSlug: "specialist-ondemand", emoji: "🔍", count: 134 },
  { slug: "other", name: "Other", groupSlug: "specialist-ondemand", emoji: "✨", count: 0 },
];

export interface Service {
  name: string;
  description: string;
  priceFrom: number;
  priceType: "fixed" | "from" | "quote";
}

export interface Promotion {
  id: string;
  businessId: string;
  businessName: string;
  title: string;
  description: string;
  expiresAt: string;
  discountPercent?: number;
  gradient: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  reviewerCompany?: string;
  rating: number;
  body: string;
  date: string;
  isVerifiedHire?: boolean;
}

export interface Business {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  province: Province;
  city: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  tags: string[];
  isVerified: boolean;
  hasPromo: boolean;
  rating: number;
  reviewCount: number;
  followers: number;
  plan: "free" | "standard" | "featured";
  gradient: string;
  /** Optional wide profile banner URL. Falls back to a gradient when omitted. */
  image?: string;
  /** Optional square business logo. Falls back to the banner/initial treatment. */
  logo?: string;
  responseRate: number;
  hours: string;
  services: Service[];
  reviews: Review[];
  /** True while the business is in pre-launch (Workshop Mode) and hidden from the public directory. */
  preLaunch?: boolean;
  /** ISO timestamp the listing was created — used to sort the "newly listed" rail. */
  createdAt?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  categorySlug: string;
  emoji: string;
  postedBy: string;
  province: Province;
  city: string;
  budget: number;
  budgetType: "fixed" | "estimate" | "negotiable";
  deadline: string;
  isUrgent: boolean;
  status: "open" | "closed";
  applicants: number;
  postedAt: string;
  /** ISO timestamp of when the lead was posted — used for live freshness badges. */
  createdAt?: string;
  requirements: string[];
  /** Client (owner) user id — only present from live data. */
  clientId?: string;
  /** When the urgent boost was paid; if within 72h, treated as boosted. */
  urgentBoostPaidAt?: string | null;
  /** Sjoh-sourced lead from outside the platform (Facebook, WhatsApp, etc.) */
  isConciergeLead?: boolean;
  /** Where the original lead lives (FB post URL, wa.me link, etc.) */
  externalContactUrl?: string | null;
  /** Photos / PDFs the customer attached to give pros visual context for accurate quotes. */
  attachments?: Array<{ url: string; name: string; type: string; size: number }>;
}

export const BUSINESSES: Business[] = [];

export const OPPORTUNITIES: Opportunity[] = [];

export const PROMOTIONS: Promotion[] = [];

// Factual, defensible stats only — derived from the static directory taxonomy
// (not from inflated business counts). Update when we add categories/groups.
export const STATS = {
  categories: CATEGORIES.length,
  categoryGroups: CATEGORY_GROUPS.length,
  provinces: 9,
  commission: "0%",
};

// =====================================================
// Sjoh subscription tiers (real source-of-truth model)
// =====================================================

export interface SjohTier {
  slug: "verified_pro" | "verified_pro_founder";
  name: string;
  price: number;
  period: string;
  blurb: string;
  features: string[];
  popular?: boolean;
  featured?: boolean;
  founderPrice?: number;
}

export const SJOH_TIERS: SjohTier[] = [
  {
    slug: "verified_pro",
    name: "Verified Pro",
    price: 250,
    period: "/month",
    blurb: "Everything you need to get leads, send quotes, and grow your business. No commission. Ever.",
    popular: true,
    founderPrice: 150,
    features: [
      "30-day PayFast-backed trial — R5 card check today",
      "Listed in the Sjoh directory",
      "Receive & apply to customer job requests",
      "Send unlimited branded PDF quotations",
      "Invoice generator with your logo",
      "WhatsApp lead notifications",
      "Top placement in local search results",
      "Google Reviews import",
      "Response time & Trust Index score",
      "0% commission — keep every cent you earn",
      "Cancel anytime",
    ],
  },
];

export const BUSINESS_VERIFICATION: Record<string, { certifiedPro: boolean; certifications: string[]; strikes: number }> = {};

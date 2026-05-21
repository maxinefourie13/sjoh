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
  /** Optional cover/profile image URL (imported asset). Falls back to gradient when omitted. */
  image?: string;
  responseRate: number;
  hours: string;
  services: Service[];
  reviews: Review[];
  /** True while the business is in pre-launch (Workshop Mode) and hidden from the public directory. */
  preLaunch?: boolean;
}

const grads = ["bg-grad-1", "bg-grad-2", "bg-grad-3", "bg-grad-4", "bg-grad-5", "bg-grad-6"];

import imgSolar from "@/assets/solar-installer.jpg";
import imgSteelwork from "@/assets/business/steelwork.jpg";
import imgPhotographer from "@/assets/business/photographer.jpg";
import imgBaker from "@/assets/business/baker.jpg";
import imgItSupport from "@/assets/business/it-support.jpg";
import imgMovers from "@/assets/business/movers.jpg";

export const BUSINESSES: Business[] = [
  {
    id: "b1",
    slug: "khumalo-electrical",
    name: "Khumalo Electrical Contractors",
    category: "Electrical",
    categorySlug: "electrical",
    province: "Gauteng",
    city: "Johannesburg",
    address: "12 Rivonia Road, Sandton",
    phone: "+27 11 234 5678",
    email: "hello@khumaloelec.co.za",
    website: "khumaloelec.co.za",
    description:
      "Master electricians serving Gauteng since 2009. Certified installations, COC inspections, solar PV, and 24/7 emergency callouts. We work with homes, retail, and light industrial sites across Joburg and Pretoria.",
    tags: ["COC Certified", "Solar PV", "Emergency"],
    isVerified: true,
    hasPromo: true,
    rating: 4.8,
    reviewCount: 142,
    followers: 318,
    plan: "featured",
    gradient: grads[0],
    image: imgSolar,
    responseRate: 98,
    hours: "Mon–Fri 7:00–17:00, Sat 8:00–13:00",
    services: [
      { name: "COC Inspection", description: "Certificate of Compliance for property transfer", priceFrom: 850, priceType: "from" },
      { name: "Solar PV Installation", description: "Grid-tied or hybrid systems, 3kW–20kW", priceFrom: 65000, priceType: "from" },
      { name: "Emergency Callout", description: "24/7 fault finding within Gauteng", priceFrom: 650, priceType: "fixed" },
      { name: "Distribution Board Upgrade", description: "Full DB rewire and certification", priceFrom: 4200, priceType: "quote" },
    ],
    reviews: [
      { id: "r1", reviewerName: "Thandi Nkosi", reviewerCompany: "Property24", rating: 5, body: "Absolute professionals. Sorted our office DB in one afternoon and gave us a clean COC. Will use again.", date: "2 weeks ago" },
      { id: "r2", reviewerName: "Pieter van Wyk", rating: 5, body: "Solar install came in on quote and on time. Honest pricing, no surprises.", date: "1 month ago" },
      { id: "r3", reviewerName: "Naledi M.", rating: 4, body: "Quick response on a callout at 9pm. Had us back on power inside an hour.", date: "2 months ago" },
    ],
  },
  {
    id: "b2",
    slug: "cape-steel-works",
    name: "Cape Steel Works",
    category: "Steelwork & Fabrication",
    categorySlug: "steelwork-fabrication",
    province: "Western Cape",
    city: "Cape Town",
    address: "8 Marine Drive, Paarden Eiland",
    phone: "+27 21 511 9988",
    email: "info@capesteelworks.co.za",
    website: "capesteelworks.co.za",
    description:
      "Custom steel fabrication for architects, builders, and homeowners. Staircases, balustrades, security gates, and structural steel. Workshop in Paarden Eiland, install across the Cape Peninsula.",
    tags: ["Fabrication", "Custom", "Install"],
    isVerified: true,
    hasPromo: false,
    rating: 4.7,
    reviewCount: 89,
    followers: 204,
    plan: "featured",
    gradient: grads[1],
    image: imgSteelwork,
    responseRate: 94,
    hours: "Mon–Fri 7:30–16:30",
    services: [
      { name: "Steel Staircase", description: "Custom design and install", priceFrom: 18000, priceType: "from" },
      { name: "Security Gate", description: "Sliding or swing, motorised optional", priceFrom: 6500, priceType: "from" },
      { name: "Structural Beams", description: "Cut, weld, and deliver to site", priceFrom: 0, priceType: "quote" },
    ],
    reviews: [
      { id: "r4", reviewerName: "Liam Petersen", rating: 5, body: "Beautiful staircase, finished to spec. Workshop team really knows their craft.", date: "3 weeks ago" },
      { id: "r5", reviewerName: "Sarah du Plessis", reviewerCompany: "Du Plessis Architects", rating: 5, body: "Reliable supplier for our residential projects. Quality is consistent.", date: "1 month ago" },
    ],
  },
  {
    id: "b3",
    slug: "lerato-photography",
    name: "Lerato Mokoena Photography",
    category: "Photography",
    categorySlug: "photography",
    province: "Gauteng",
    city: "Pretoria",
    address: "Hatfield, Pretoria",
    phone: "+27 82 445 7721",
    email: "hello@leratoshoots.co.za",
    website: "leratoshoots.co.za",
    description:
      "Editorial and event photographer based in Pretoria. Specialising in weddings, corporate launches, and brand campaigns. Featured in House and Leisure and TimesLIVE.",
    tags: ["Weddings", "Brand", "Editorial"],
    isVerified: true,
    hasPromo: true,
    rating: 4.9,
    reviewCount: 67,
    followers: 1240,
    plan: "standard",
    gradient: grads[2],
    image: imgPhotographer,
    responseRate: 92,
    hours: "By appointment",
    services: [
      { name: "Wedding Day", description: "Full-day coverage, edited gallery", priceFrom: 18500, priceType: "from" },
      { name: "Brand Campaign", description: "Half-day shoot with usage rights", priceFrom: 9500, priceType: "from" },
      { name: "Corporate Event", description: "Up to 4 hours coverage", priceFrom: 4500, priceType: "fixed" },
    ],
    reviews: [
      { id: "r6", reviewerName: "Nomvula B.", rating: 5, body: "Lerato made our wedding feel intimate and the photos are unreal. Worth every rand.", date: "1 month ago" },
      { id: "r7", reviewerName: "Brandstack ZA", rating: 5, body: "Pro from start to finish. Great brief intake and quick turnaround.", date: "2 months ago" },
    ],
  },
  {
    id: "b4",
    slug: "ubuntu-catering",
    name: "Ubuntu Catering Co.",
    category: "Catering",
    categorySlug: "catering",
    province: "KwaZulu-Natal",
    city: "Durban",
    address: "Glenwood, Durban",
    phone: "+27 31 202 4456",
    email: "orders@ubuntucatering.co.za",
    website: "ubuntucatering.co.za",
    description:
      "Authentic South African catering for events of 20 to 500. From traditional shisanyama to contemporary canapés. HACCP-certified kitchen.",
    tags: ["HACCP", "Halaal Available", "Events"],
    isVerified: false,
    hasPromo: false,
    rating: 4.6,
    reviewCount: 54,
    followers: 187,
    plan: "standard",
    gradient: grads[3],
    image: imgBaker,
    responseRate: 88,
    hours: "Mon–Sat 8:00–18:00",
    services: [
      { name: "Canapé Function", description: "Per person, min 30 guests", priceFrom: 180, priceType: "from" },
      { name: "Traditional Buffet", description: "Per person, min 50 guests", priceFrom: 295, priceType: "from" },
      { name: "Corporate Lunch Drop-off", description: "Boxed meals delivered", priceFrom: 95, priceType: "from" },
    ],
    reviews: [
      { id: "r8", reviewerName: "Sipho D.", rating: 5, body: "Catered our 200-person event flawlessly. The oxtail was a hit.", date: "3 weeks ago" },
    ],
  },
  {
    id: "b5",
    slug: "northcoast-it",
    name: "Northcoast IT Partners",
    category: "IT Support",
    categorySlug: "it-support",
    province: "KwaZulu-Natal",
    city: "Umhlanga",
    address: "Ridgeside, Umhlanga",
    phone: "+27 31 566 1100",
    email: "support@northcoastit.co.za",
    website: "northcoastit.co.za",
    description:
      "Outsourced IT support and Microsoft 365 specialists for SMBs along the KZN North Coast. Same-day on-site response, monthly retainers from R 2,500.",
    tags: ["Microsoft 365", "Networks", "Support"],
    isVerified: true,
    hasPromo: false,
    rating: 4.7,
    reviewCount: 38,
    followers: 92,
    plan: "standard",
    gradient: grads[4],
    image: imgItSupport,
    responseRate: 96,
    hours: "Mon–Fri 8:00–17:00",
    services: [
      { name: "Monthly IT Retainer", description: "Per user, includes M365 management", priceFrom: 350, priceType: "from" },
      { name: "Network Setup", description: "Office networks, Wi-Fi mesh, switches", priceFrom: 0, priceType: "quote" },
      { name: "Cybersecurity Audit", description: "POPIA-aligned review", priceFrom: 8500, priceType: "fixed" },
    ],
    reviews: [
      { id: "r9", reviewerName: "Adam K.", reviewerCompany: "Coastline Logistics", rating: 5, body: "Picked us up after our previous IT firm dropped the ball. Night and day difference.", date: "1 month ago" },
    ],
  },
  {
    id: "b6",
    slug: "mzansi-movers",
    name: "Mzansi Movers",
    category: "Furniture Removal",
    categorySlug: "furniture-removal",
    province: "Gauteng",
    city: "Centurion",
    address: "Lyttelton, Centurion",
    phone: "+27 12 654 0099",
    email: "book@mzansimovers.co.za",
    website: "mzansimovers.co.za",
    description:
      "Household and office removals across South Africa. Insured loads, GIT cover, packing service available. Fleet of 12 trucks.",
    tags: ["Insured", "National", "Packing"],
    isVerified: true,
    hasPromo: true,
    rating: 4.5,
    reviewCount: 211,
    followers: 156,
    plan: "free",
    gradient: grads[5],
    image: imgMovers,
    responseRate: 85,
    hours: "Mon–Sat 7:00–18:00",
    services: [
      { name: "Local Move", description: "Within metro, 3-bed home", priceFrom: 4500, priceType: "from" },
      { name: "National Move", description: "JHB to CPT, full container", priceFrom: 16500, priceType: "from" },
    ],
    reviews: [
      { id: "r10", reviewerName: "Zinhle M.", rating: 4, body: "Smooth move from Joburg to PE. Crew was friendly and on time.", date: "2 weeks ago" },
    ],
  },
];

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

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "o1",
    title: "Office solar PV installation — 8kW system",
    description:
      "Looking for an accredited installer for a grid-tied 8kW solar system at our offices in Midrand. Roof inspection done, north-facing tile roof. Need full quote including inverter and labour.",
    category: "Electrical",
    categorySlug: "electrical",
    emoji: "⚡",
    postedBy: "Naledi Properties",
    province: "Gauteng",
    city: "Midrand",
    budget: 120000,
    budgetType: "estimate",
    deadline: "15 May 2026",
    isUrgent: false,
    status: "open",
    applicants: 7,
    postedAt: "2 days ago",
    requirements: ["Solar PV accreditation", "References from 3 commercial installs", "COC included"],
  },
  {
    id: "o2",
    title: "Wedding photographer — 180 guests, Stellenbosch",
    description:
      "Saturday 12 December wedding at a wine estate. Need full-day coverage, two shooters preferred, edited gallery within 6 weeks. Style: warm, documentary, not heavily filtered.",
    category: "Photography",
    categorySlug: "photography",
    emoji: "📷",
    postedBy: "Emma & Jaco",
    province: "Western Cape",
    city: "Stellenbosch",
    budget: 28000,
    budgetType: "fixed",
    deadline: "30 April 2026",
    isUrgent: true,
    status: "open",
    applicants: 14,
    postedAt: "5 hours ago",
    requirements: ["Two shooters", "Portfolio of weddings", "Online gallery delivery"],
  },
  {
    id: "o3",
    title: "Custom steel balustrade — 18 metres",
    description:
      "Architectural project in Camps Bay. Powder-coated black steel balustrade for upstairs balcony. Drawings ready, need fabrication and install.",
    category: "Steelwork & Fabrication",
    categorySlug: "steelwork-fabrication",
    emoji: "🏗️",
    postedBy: "Studio Verde Architects",
    province: "Western Cape",
    city: "Cape Town",
    budget: 45000,
    budgetType: "estimate",
    deadline: "20 June 2026",
    isUrgent: false,
    status: "open",
    applicants: 4,
    postedAt: "1 week ago",
    requirements: ["Workshop in Western Cape", "Insured install team"],
  },
  {
    id: "o4",
    title: "Monthly IT support for 14-person agency",
    description:
      "Creative agency in Bryanston needs reliable IT partner. Currently on M365 Business Standard. Looking for monthly retainer covering helpdesk, backups, and basic security.",
    category: "IT Support",
    categorySlug: "it-support",
    emoji: "💻",
    postedBy: "Make Studio",
    province: "Gauteng",
    city: "Sandton",
    budget: 8000,
    budgetType: "negotiable",
    deadline: "10 May 2026",
    isUrgent: false,
    status: "open",
    applicants: 9,
    postedAt: "3 days ago",
    requirements: ["M365 expertise", "On-site within 2 hours", "POPIA-aware"],
  },
  {
    id: "o5",
    title: "Halaal catering for corporate launch — 120 guests",
    description:
      "Product launch evening in Umhlanga, mid-June. Canapés and bowl food, fully halaal. Looking for 3 quotes.",
    category: "Catering",
    categorySlug: "catering",
    emoji: "🍽️",
    postedBy: "Coastline Brands",
    province: "KwaZulu-Natal",
    city: "Umhlanga",
    budget: 24000,
    budgetType: "estimate",
    deadline: "1 June 2026",
    isUrgent: false,
    status: "open",
    applicants: 6,
    postedAt: "4 days ago",
    requirements: ["Halaal certification", "Onsite chef"],
  },
  {
    id: "o6",
    title: "Burst geyser — 9pm emergency callout",
    description:
      "Geyser burst in roof, water everywhere. Need a plumber NOW. Centurion area, will pay emergency rates.",
    category: "Plumbing",
    categorySlug: "plumbing",
    emoji: "🚨",
    postedBy: "Sarah du Toit",
    province: "Gauteng",
    city: "Centurion",
    budget: 3500,
    budgetType: "estimate",
    deadline: "Tonight",
    isUrgent: true,
    status: "open",
    applicants: 3,
    postedAt: "12 minutes ago",
    requirements: ["After-hours availability", "Own equipment", "PIRB registered"],
  },
  {
    id: "o7",
    title: "Locked out of house — need locksmith ASAP",
    description:
      "Front door slammed shut, keys inside. Standing outside in PJs. Cape Town CBD.",
    category: "Locksmiths",
    categorySlug: "locksmiths",
    emoji: "🔐",
    postedBy: "James M.",
    province: "Western Cape",
    city: "Cape Town",
    budget: 850,
    budgetType: "fixed",
    deadline: "Today",
    isUrgent: true,
    status: "open",
    applicants: 5,
    postedAt: "30 minutes ago",
    requirements: ["Within 30 min", "Cash payment OK"],
  },
];

export const PROMOTIONS: Promotion[] = [
  {
    id: "p1",
    businessId: "b1",
    businessName: "Khumalo Electrical Contractors",
    title: "20% off COC inspections this month",
    description: "Property transfer? Get your Certificate of Compliance for less. Bookings before 30 April.",
    expiresAt: "30 April 2026",
    discountPercent: 20,
    gradient: "from-emerald-700 to-emerald-500",
  },
  {
    id: "p2",
    businessId: "b3",
    businessName: "Lerato Mokoena Photography",
    title: "Free engagement shoot with wedding bookings",
    description: "Book your 2026 wedding before May and receive a complimentary 1-hour engagement session.",
    expiresAt: "31 May 2026",
    gradient: "from-rose-600 to-orange-500",
  },
  {
    id: "p3",
    businessId: "b6",
    businessName: "Mzansi Movers",
    title: "Half-price packing on national moves",
    description: "Long-distance move booked this autumn? We'll pack your home for 50% off the standard rate.",
    expiresAt: "15 May 2026",
    discountPercent: 50,
    gradient: "from-violet-700 to-fuchsia-500",
  },
];

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
      "SORTED30 launch code — 30 days free, no card",
      "Listed in the Sjoh directory",
      "Receive & apply to customer job requests",
      "Send unlimited branded PDF quotations",
      "Coral Checkmark — Sjoh ID Check badge",
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

// Per-business verification overlay (mock). Defaults to false for missing entries.
export const BUSINESS_VERIFICATION: Record<string, { idVerified: boolean; certifiedPro: boolean; certifications: string[]; strikes: number }> = {
  b1: { idVerified: true, certifiedPro: true, certifications: ["Wireman's Licence", "PIRB"], strikes: 0 },
  b2: { idVerified: true, certifiedPro: true, certifications: ["SAISC Member"], strikes: 0 },
  b3: { idVerified: true, certifiedPro: false, certifications: [], strikes: 0 },
  b4: { idVerified: false, certifiedPro: false, certifications: [], strikes: 1 },
  b5: { idVerified: true, certifiedPro: true, certifications: ["MCSE"], strikes: 0 },
  b6: { idVerified: true, certifiedPro: false, certifications: [], strikes: 0 },
};

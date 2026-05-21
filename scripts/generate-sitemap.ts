// Runs before `vite dev` and `vite build`; writes public/sitemap.xml.
// Generates programmatic location URLs (category × province × top cities)
// so Google can discover and rank pages like "plumbers in Gauteng" or
// "wedding photographers in Cape Town" served by CategoryLocationPage.

import { writeFileSync } from "fs";
import { resolve } from "path";

// Inlined to avoid pulling .jpg/.png imports from src/lib/mockData.ts at build time.
const PROVINCES = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Limpopo",
  "Mpumalanga", "Free State", "North West", "Northern Cape",
] as const;

const CATEGORY_SLUGS: string[] = [
  "plumbing", "electrical", "handyman", "roofing", "painting", "carpentry", "appliance-repair",
  "home-cleaning", "deep-cleaning", "carpet-cleaning", "laundry-ironing", "window-cleaning", "post-construction-cleaning",
  "lawn-mowing", "garden-services", "tree-felling", "landscaping", "irrigation", "pool-maintenance",
  "mobile-car-wash", "mechanics", "panel-beating", "tire-services", "vehicle-detailing", "roadside-assistance",
  "builders", "renovations", "tiling", "bricklaying", "paving", "steelwork-fabrication",
  "event-planning", "catering", "decor-hiring", "photography", "djs-entertainment", "kids-party-services",
  "web-design", "graphic-design", "social-media-management", "copywriting", "virtual-assistants", "it-support",
  "personal-training", "hair-beauty", "makeup-artists", "life-coaching", "tutoring", "babysitting",
  "furniture-removal", "delivery-services", "courier-services", "storage-solutions", "packing-services",
  "pet-grooming", "pet-sitting",
];

const BASE_URL = "https://sjoh.co.za";

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Top cities per province — focused on real search demand. Extend over time.
const CITIES_BY_PROVINCE: Record<string, string[]> = {
  Gauteng: [
    "Johannesburg", "Sandton", "Pretoria", "Centurion", "Midrand", "Randburg",
    "Roodepoort", "Soweto", "Benoni", "Boksburg", "Kempton Park", "Edenvale",
    "Krugersdorp", "Alberton", "Germiston", "Vereeniging",
  ],
  "Western Cape": [
    "Cape Town", "Stellenbosch", "Paarl", "Somerset West", "Bellville",
    "Durbanville", "Hermanus", "George", "Knysna", "Mossel Bay", "Worcester",
  ],
  "KwaZulu-Natal": [
    "Durban", "Umhlanga", "Pinetown", "Pietermaritzburg", "Ballito",
    "Hillcrest", "Westville", "Amanzimtoti", "Richards Bay", "Newcastle",
  ],
  "Eastern Cape": [
    "Port Elizabeth", "Gqeberha", "East London", "Mthatha", "Uitenhage",
    "Grahamstown", "Makhanda", "Jeffreys Bay",
  ],
  Limpopo: ["Polokwane", "Tzaneen", "Mokopane", "Thohoyandou", "Bela-Bela"],
  Mpumalanga: ["Nelspruit", "Mbombela", "Witbank", "eMalahleni", "Secunda", "Middelburg"],
  "Free State": ["Bloemfontein", "Welkom", "Bethlehem", "Sasolburg"],
  "North West": ["Rustenburg", "Klerksdorp", "Potchefstroom", "Mahikeng", "Brits"],
  "Northern Cape": ["Kimberley", "Upington", "Kuruman"],
  "Remote (South Africa)": [],
};

interface Entry {
  path: string;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: string;
}

const entries: Entry[] = [];

const STATIC: Entry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/directory", changefreq: "daily", priority: "0.9" },
  { path: "/requests", changefreq: "daily", priority: "0.8" },
  { path: "/leads", changefreq: "daily", priority: "0.8" },
  { path: "/for-businesses", changefreq: "weekly", priority: "0.9" },
  { path: "/for-businesses/trades", changefreq: "weekly", priority: "0.9" },
  { path: "/for-businesses/home-care", changefreq: "weekly", priority: "0.9" },
  { path: "/for-businesses/creative", changefreq: "weekly", priority: "0.9" },
  { path: "/for-businesses/creatives", changefreq: "weekly", priority: "0.9" },
  { path: "/for-businesses/side-hustle", changefreq: "weekly", priority: "0.9" },
  { path: "/for-businesses/customer", changefreq: "weekly", priority: "0.8" },
  { path: "/pricing", changefreq: "monthly", priority: "0.7" },
  { path: "/list", changefreq: "monthly", priority: "0.7" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/acceptable-use", changefreq: "yearly", priority: "0.3" },
  { path: "/shipping", changefreq: "yearly", priority: "0.3" },
  { path: "/returns", changefreq: "yearly", priority: "0.3" },
];
entries.push(...STATIC);

// Skip the placeholder "Other" categories — they're not real search terms.
for (const slug of CATEGORY_SLUGS) {
  // Category landing
  entries.push({ path: `/${slug}`, changefreq: "weekly", priority: "0.8" });

  for (const province of PROVINCES) {
    const provSlug = slugify(province);
    // Category × Province
    entries.push({
      path: `/${slug}/${provSlug}`,
      changefreq: "weekly",
      priority: "0.7",
    });

    // Category × Province × City
    const cities = CITIES_BY_PROVINCE[province] ?? [];
    for (const city of cities) {
      entries.push({
        path: `/${slug}/${provSlug}/${slugify(city)}`,
        changefreq: "weekly",
        priority: "0.6",
      });
    }
  }
}

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      `    <changefreq>${e.changefreq}</changefreq>`,
      `    <priority>${e.priority}</priority>`,
      `  </url>`,
    ].join("\n"),
  ),
  `</urlset>`,
  ``,
].join("\n");

writeFileSync(resolve("public/sitemap.xml"), xml);
console.log(`sitemap.xml written (${entries.length} entries)`);

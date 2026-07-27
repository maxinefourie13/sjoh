import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SiteLayout } from "@/components/SiteLayout";
import { SeoHead } from "@/components/SeoHead";
import { SjohSpinner } from "@/components/SjohSpinner";
import NotFound from "@/pages/NotFound";
import { supabase } from "@/integrations/supabase/client";
import {
  categoryFromSlug,
  provinceFromSlug,
  titleFromSlug,
  slugify,
  buildLocationCanonical,
  buildLocationJsonLd,
  isReservedSlug,
  categoryKeyword,
  type BusinessForJsonLd,
} from "@/lib/seo";
import { CATEGORIES, PROVINCES } from "@/lib/mockData";
import { Star, MapPin, ShieldCheck } from "lucide-react";

interface BizRow {
  id: string;
  slug: string;
  name: string;
  city: string;
  province: string;
  category_name: string;
  category_slug: string;
  description: string | null;
  rating: number;
  review_count: number;
  address: string | null;
  website: string | null;
  is_verified: boolean;
}

const CategoryLocationPage = () => {
  const { categorySlug, provinceSlug, citySlug } = useParams<{
    categorySlug: string;
    provinceSlug?: string;
    citySlug?: string;
  }>();

  const isKnownCategory = !!categorySlug && !!categoryFromSlug(categorySlug);
  const isInvalidCategory = !!categorySlug && (isReservedSlug(categorySlug) || !isKnownCategory);

  const category = categorySlug ? categoryFromSlug(categorySlug) : undefined;
  const provinceName = provinceSlug ? provinceFromSlug(provinceSlug) : undefined;
  const cityName = citySlug ? titleFromSlug(citySlug) : undefined;

  const [rows, setRows] = useState<BizRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [siblingCities, setSiblingCities] = useState<string[]>([]);

  useEffect(() => {
    if (!categorySlug || isInvalidCategory) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    (async () => {
      // Use the businesses_public view: it strips PII (phone, email, etc.)
      // so anonymous visitors and SSR-style scrapes never see contact details.
      let query = supabase
        .from("businesses_public" as any)
        .select(
          "id,slug,name,city,province,category_name,category_slug,description,rating,review_count,address,website,is_verified",
        )
        .eq("category_slug", categorySlug)
        .eq("is_verified", true)
        .order("rating", { ascending: false })
        .order("review_count", { ascending: false })
        .limit(100);

      if (provinceName) query = query.eq("province", provinceName);

      const { data, error } = await query;
      if (cancelled) return;
      if (error) {
        setRows([]);
        setLoading(false);
        return;
      }

      let list = ((data ?? []) as unknown) as BizRow[];
      if (cityName) {
        list = list.filter((b) => slugify(b.city) === citySlug);
      }
      setRows(list);

      // Build sibling-city links for internal crawl depth
      if (provinceName) {
        const cities = Array.from(
          new Set(list.map((b) => b.city).filter(Boolean)),
        ).slice(0, 12);
        setSiblingCities(cities);
      } else {
        setSiblingCities([]);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [categorySlug, provinceName, cityName, citySlug, isInvalidCategory]);

  const categoryName = category?.name ?? (categorySlug ? titleFromSlug(categorySlug) : "Services");
  // Search-friendly noun (e.g. "Plumber" instead of "Plumbing") for headings + meta.
  const keyword = categoryKeyword(categorySlug);
  const locationLabel = cityName
    ? `${cityName}`
    : provinceName
    ? `${provinceName}`
    : "South Africa";

  const heading = `Need a ${keyword.toLowerCase()} in ${locationLabel}? Let's help you find one.`;
  const title = `${keyword}s in ${locationLabel} | Find a Verified Pro | Sjoh`;
  const description = `Looking for a professional ${keyword.toLowerCase()} in ${locationLabel}? Sjoh connects you directly with available South African pros — the possibilities are endless. No commission, no ghosters, just someone who can do it properly.`;
  const canonical = buildLocationCanonical(categorySlug ?? "", provinceSlug, citySlug);

  const jsonLd = useMemo<BusinessForJsonLd[]>(
    () =>
      rows.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        city: b.city,
        province: b.province,
        rating: b.rating,
        review_count: b.review_count,
        // No phone in JSON-LD — bot scraping prevention.
        address: b.address,
        website: b.website,
      })),
    [rows],
  );

  const ld = buildLocationJsonLd(
    categoryName,
    cityName ?? provinceName ?? "South Africa",
    provinceName ?? "South Africa",
    jsonLd,
  );

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Sjoh", item: window.location.origin },
      { "@type": "ListItem", position: 2, name: categoryName, item: buildLocationCanonical(categorySlug ?? "") },
      ...(provinceName
        ? [{ "@type": "ListItem", position: 3, name: provinceName, item: buildLocationCanonical(categorySlug ?? "", provinceSlug) }]
        : []),
      ...(cityName
        ? [{ "@type": "ListItem", position: 4, name: cityName, item: canonical }]
        : []),
    ],
  };

  // Guard: if the top-level slug is reserved (e.g. someone hits /api or /admin)
  // OR isn't a known category, fall through to the 404 page. This prevents the
  // root-level SEO route from accidentally swallowing real app paths.
  if (isInvalidCategory) {
    return <NotFound />;
  }

  return (
    <SiteLayout>
      <SeoHead title={title} description={description} canonical={canonical} jsonLd={[ld, breadcrumbLd]} />

      <div className="container py-12 md:py-16 max-w-5xl">
        {/* Breadcrumbs */}
        <nav className="text-xs text-muted-foreground mb-4 flex flex-wrap gap-1.5">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to={`/${categorySlug}`} className="hover:text-foreground">{categoryName}</Link>
          {provinceName && (
            <>
              <span>/</span>
              <Link to={`/${categorySlug}/${provinceSlug}`} className="hover:text-foreground">
                {provinceName}
              </Link>
            </>
          )}
          {cityName && (
            <>
              <span>/</span>
              <span className="text-foreground font-semibold">{cityName}</span>
            </>
          )}
        </nav>

        <header className="mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {category?.emoji ?? "🛠️"} Verified Pros
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight mt-2 text-balance">
            {heading}
          </h1>
          <p className="mt-3 text-lg text-ink-2 max-w-2xl">
            Real, verified {categoryName.toLowerCase()} pros in {locationLabel}. Direct contact, no
            commission, no chommies of chommies. Just okes who can do it properly.
          </p>
        </header>

        {loading ? (
          <div className="py-20 flex justify-center">
            <SjohSpinner />
          </div>
        ) : (
          <>
            {rows.length === 0 && (
              <div className="bg-card border border-border rounded-2xl p-6 mb-6 text-center">
                <p className="font-display text-lg font-semibold">
                  Eish, no verified okes here yet — be the first.
                </p>
                <p className="text-ink-2 text-sm mt-1">
                  We’re onboarding this area now. Know a proper pro? Send them to Sjoh.
                </p>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              {rows.map((b) => (
                <Link
                  key={b.id}
                  to={`/business/${b.slug}`}
                  className="block bg-card border border-border rounded-xl p-5 hover:border-primary transition-colors shadow-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-display text-lg font-semibold leading-tight">{b.name}</h2>
                    {b.is_verified && (
                      <ShieldCheck className="size-4 text-primary shrink-0" strokeWidth={2.5} />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="size-3" /> {b.city}, {b.province}
                  </p>
                  {b.description && (
                    <p className="text-sm text-ink-2 mt-3 line-clamp-2">{b.description}</p>
                  )}
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <Star className="size-4 fill-accent text-accent" />
                    <span className="font-semibold tabular-nums">{b.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground text-xs">
                      ({b.review_count} review{b.review_count === 1 ? "" : "s"})
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Internal links: sibling cities + sibling categories for SEO depth */}
        <section className="mt-16 grid md:grid-cols-2 gap-8">
          {siblingCities.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                {categoryName} in other cities
              </h2>
              <ul className="flex flex-wrap gap-2">
                {siblingCities.map((c) => (
                  <li key={c}>
                    <Link
                      to={`/${categorySlug}/${provinceSlug}/${slugify(c)}`}
                      className="inline-block text-sm bg-card border border-border rounded-full px-3 py-1 hover:border-primary"
                    >
                      {c}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!provinceName && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Browse by province
              </h2>
              <ul className="flex flex-wrap gap-2">
                {PROVINCES.map((p) => (
                  <li key={p}>
                    <Link
                      to={`/${categorySlug}/${slugify(p)}`}
                      className="inline-block text-sm bg-card border border-border rounded-full px-3 py-1 hover:border-primary"
                    >
                      {p}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Other services {cityName ? `in ${cityName}` : provinceName ? `in ${provinceName}` : ""}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c.slug !== categorySlug)
                .slice(0, 12)
                .map((c) => (
                  <li key={c.slug}>
                    <Link
                      to={
                        cityName
                          ? `/${c.slug}/${provinceSlug}/${citySlug}`
                          : provinceName
                          ? `/${c.slug}/${provinceSlug}`
                          : `/${c.slug}`
                      }
                      className="inline-block text-sm bg-card border border-border rounded-full px-3 py-1 hover:border-primary"
                    >
                      {c.emoji} {c.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
};

export default CategoryLocationPage;

import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { SeoHead } from "@/components/SeoHead";
import { BusinessCard } from "@/components/BusinessCard";
import { CATEGORIES, CATEGORY_GROUPS, PROVINCES } from "@/lib/mockData";
import { useBusinesses } from "@/hooks/useDirectory";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCategoryGroupIcon } from "@/lib/categoryIcons";
import { EarlyAccessNotice } from "@/components/EarlyAccessNotice";

const DirectoryPage = () => {
  const { data: businesses } = useBusinesses();
  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const initialCat = params.get("category");
  const initialGroup = params.get("group");
  const initialProv = params.get("province");

  // If a group is selected via URL, pre-select all its sub-cats.
  const groupSubSlugs = (groupSlug: string) =>
    CATEGORIES.filter((c) => c.groupSlug === groupSlug).map((c) => c.slug);

  const [keyword, setKeyword] = useState(initialQ);
  const [cats, setCats] = useState<string[]>(
    initialCat ? [initialCat] : initialGroup ? groupSubSlugs(initialGroup) : [],
  );
  const [provs, setProvs] = useState<string[]>(initialProv ? [initialProv] : []);
  const [promoOnly, setPromoOnly] = useState(false);
  const [topRated, setTopRated] = useState(false);
  const [sort, setSort] = useState<"featured" | "rating" | "newest">("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    initialGroup ? { [initialGroup]: true } : {},
  );

  const toggle = (arr: string[], v: string, setter: (a: string[]) => void) => {
    setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  const toggleGroup = (groupSlug: string) => {
    const subs = groupSubSlugs(groupSlug);
    const allSelected = subs.every((s) => cats.includes(s));
    setCats(allSelected ? cats.filter((c) => !subs.includes(c)) : [...new Set([...cats, ...subs])]);
  };

  const activeGroup = initialGroup
    ? CATEGORY_GROUPS.find((g) => g.slug === initialGroup)
    : null;

  const filtered = useMemo(() => {
    let list = businesses.filter((b) => {
      if (keyword && !b.name.toLowerCase().includes(keyword.toLowerCase()) && !b.category.toLowerCase().includes(keyword.toLowerCase())) return false;
      if (cats.length && !cats.includes(b.categorySlug)) return false;
      if (provs.length && !provs.includes(b.province)) return false;
      if (promoOnly && !b.hasPromo) return false;
      if (topRated && b.rating < 4.5) return false;
      return true;
    });
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sort === "newest") list = [...list].reverse();
    else
      list = [...list].sort((a, b) => {
        const order = { featured: 0, standard: 1, free: 2 } as const;
        return order[a.plan] - order[b.plan];
      });
    return list;
  }, [businesses, keyword, cats, provs, promoOnly, topRated, sort]);

  return (
    <SiteLayout>
      <SeoHead
        title="Browse the Sjoh directory of South African pros"
        description="Search available South African service providers by category and province. Plumbers, electricians, designers, tutors and more — available, contactable, no commission."
        canonical="https://sjoh.co.za/directory"
      />
      <div className="bg-[#050505] text-white">
      <div className="container py-10 md:py-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-white/45 mb-4">
          <Link to="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link to="/directory" className="hover:text-white">Directory</Link>
          {activeGroup && (
            <>
              <span>/</span>
              <span className="text-white font-medium">{activeGroup.name}</span>
            </>
          )}
        </nav>

        <header className="mb-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-sa-gold">Sjoh directory</span>
          <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
            {activeGroup ? activeGroup.name : "Find someone who can do it properly"}
          </h1>
          <p className="mt-3 text-white/60">
            {activeGroup
              ? `Browse trusted ${activeGroup.name.toLowerCase()} businesses across all 9 provinces.`
              : `Try: wedding photographer, electrician, steel fabrication. Trusted businesses across all 9 provinces.`}
          </p>
        </header>

        <EarlyAccessNotice
          className="mb-8"
          title="Some categories are still filling up."
          body="You’re seeing Sjoh in early access. We’re onboarding available South African pros now, so if your area looks quiet today, it won’t stay that way for long."
          ctaLabel="Know a good pro? Send them here"
          ctaTo="/list"
        />

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <Button variant="outline" onClick={() => setFiltersOpen((o) => !o)} className="w-full bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white">
            <SlidersHorizontal className="size-4" />
            {filtersOpen ? "Hide filters" : "Show filters"}
          </Button>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          {/* Filters */}
          <aside className={`${filtersOpen ? "block" : "hidden"} lg:block space-y-8 rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-card`}>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/45 mb-3 font-sans">Category</h3>
              <ul className="space-y-1 max-h-[420px] overflow-auto pr-1">
                {CATEGORY_GROUPS.map((g) => {
                  const subs = CATEGORIES.filter((c) => c.groupSlug === g.slug);
                  const isOpen = openGroups[g.slug] ?? false;
                  const selectedCount = subs.filter((s) => cats.includes(s.slug)).length;
                  const allSelected = selectedCount === subs.length && subs.length > 0;
                  const Icon = getCategoryGroupIcon(g.slug);
                  return (
                    <li key={g.slug}>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = selectedCount > 0 && !allSelected;
                          }}
                          onChange={() => toggleGroup(g.slug)}
                          className="size-4 accent-sa-gold"
                          aria-label={`Select all ${g.name}`}
                        />
                        <button
                          type="button"
                          onClick={() => setOpenGroups((o) => ({ ...o, [g.slug]: !isOpen }))}
                          className="flex-1 flex items-center justify-between gap-2 py-1.5 text-sm font-semibold text-left text-white/88 hover:text-sa-gold transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span className="size-7 rounded-lg bg-white/10 text-sa-gold flex items-center justify-center shrink-0">
                              <Icon className="size-3.5" strokeWidth={2.3} />
                            </span>
                            {g.name}
                          </span>
                          <ChevronDown className={cn("size-3.5 text-white/45 transition-transform", isOpen && "rotate-180")} />
                        </button>
                      </div>
                      {isOpen && (
                        <ul className="mt-1 ml-9 space-y-1.5 border-l border-white/10 pl-3">
                          {subs.map((c) => (
                            <li key={c.slug}>
                              <label className="flex items-center gap-2.5 text-sm cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={cats.includes(c.slug)}
                                  onChange={() => toggle(cats, c.slug, setCats)}
                                  className="size-3.5 accent-sa-gold"
                                />
                                <span className="flex-1 text-white/70 group-hover:text-sa-gold transition-colors">{c.name}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/45 mb-3 font-sans">Province</h3>
              <ul className="space-y-2">
                {PROVINCES.map((p) => (
                  <li key={p}>
                    <label className="flex items-center gap-2.5 text-sm text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={provs.includes(p)}
                        onChange={() => toggle(provs, p, setProvs)}
                        className="size-4 accent-sa-gold"
                      />
                      <span>{p}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/45 mb-3 font-sans">Status</h3>
              <ul className="space-y-2">
                <li>
                  <label className="flex items-center gap-2.5 text-sm text-white/80 cursor-pointer">
                    <input type="checkbox" checked={promoOnly} onChange={(e) => setPromoOnly(e.target.checked)} className="size-4 accent-sa-gold" />
                    <span>Has active promo</span>
                  </label>
                </li>
                <li>
                  <label className="flex items-center gap-2.5 text-sm text-white/80 cursor-pointer">
                    <input type="checkbox" checked={topRated} onChange={(e) => setTopRated(e.target.checked)} className="size-4 accent-sa-gold" />
                    <span>Rated 4.5 and above</span>
                  </label>
                </li>
              </ul>
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="bg-white border-2 border-sa-gold/60 rounded-xl p-3 flex flex-col md:flex-row gap-3 mb-6 shadow-card">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="size-4 text-sa-pink" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search businesses…"
                  className="w-full py-2 bg-transparent outline-none text-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {filtered.length} results
                </span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as "featured" | "rating" | "newest")}
                  className="text-sm font-medium border border-border rounded-md px-3 py-2 bg-background cursor-pointer"
                >
                  <option value="featured">Sort: Featured first</option>
                  <option value="rating">Sort: Highest rated</option>
                  <option value="newest">Sort: Newest</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white border border-white/10 rounded-xl p-12 text-center">
                <p className="text-ink-2">No businesses match your filters.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((b) => (
                  <BusinessCard key={b.id} business={b} />
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
      </div>
    </SiteLayout>
  );
};

export default DirectoryPage;

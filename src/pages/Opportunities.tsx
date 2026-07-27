import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, MapPin, Clock, Siren, ArrowRight, UserPlus } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/JobCard";
import { CATEGORIES, PROVINCES } from "@/lib/mockData";
import { useOpportunities } from "@/hooks/useDirectory";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { cn } from "@/lib/utils";

type SortMode = "nearest" | "newest" | "urgent";

const Opportunities = () => {
  const location = useLocation();
  const isProView = location.pathname.startsWith("/leads");
  const { data: opportunities } = useOpportunities();
  const { business: myBiz } = useMyBusiness();
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [province, setProvince] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>(isProView && myBiz?.city ? "nearest" : "newest");

  const proCity = isProView ? myBiz?.city : undefined;
  const proProvince = isProView ? myBiz?.province : undefined;

  const filtered = useMemo(() => {
    const list = opportunities.filter((o) => {
      if (keyword && !o.title.toLowerCase().includes(keyword.toLowerCase())) return false;
      if (category && o.categorySlug !== category) return false;
      if (province && o.province !== province) return false;
      return true;
    });

    // Sort: nearest first uses Pro's city/province match; tie-broken by recency.
    const ts = (o: { createdAt?: string }) => (o.createdAt ? new Date(o.createdAt).getTime() : 0);
    const score = (o: { city: string; province: string }) => {
      if (proCity && o.city.trim().toLowerCase() === proCity.trim().toLowerCase()) return 2;
      if (proProvince && o.province === proProvince) return 1;
      return 0;
    };

    if (sortMode === "urgent") {
      return [...list].sort((a, b) => {
        const ua = a.urgentBoostPaidAt ? 1 : 0;
        const ub = b.urgentBoostPaidAt ? 1 : 0;
        if (ua !== ub) return ub - ua;
        return ts(b) - ts(a);
      });
    }
    if (sortMode === "nearest" && (proCity || proProvince)) {
      return [...list].sort((a, b) => {
        const sa = score(a);
        const sb = score(b);
        if (sa !== sb) return sb - sa;
        return ts(b) - ts(a);
      });
    }
    // newest (default)
    return [...list].sort((a, b) => ts(b) - ts(a));
  }, [opportunities, keyword, category, province, sortMode, proCity, proProvince]);

  return (
    <SiteLayout>
      <SeoHead
        title={isProView ? "Find leads near you on Sjoh" : "Post a job on Sjoh — get real quotes"}
        description={
          isProView
            ? "Browse fresh customer jobs across South Africa. Filter by category, province, and urgency — quote directly, no commission."
            : "Tell us what you need and get quotes from available South African pros. Posting is always free."
        }
        canonical={`https://sjoh.co.za${isProView ? "/leads" : "/requests"}`}
      />
      <div className="container py-12">
        <header className="mb-8 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {isProView ? "Business opportunities" : "Customer requests"}
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mt-2">
            {isProView ? "Find jobs worth quoting." : "Tell pros what you need done."}
          </h1>
          <p className="mt-3 text-ink-2">
            {isProView
              ? "Real customer job requests from people looking for help now. Quote the right jobs, wait for the customer to accept, then contact details unlock — no commission."
              : "Post a request and pros will quote you in your Sjoh dashboard. Or browse the directory and contact someone yourself — no middleman, no commission."}
          </p>
        </header>

        {isProView && !myBiz && (
          <div className="rounded-2xl border border-sa-gold/40 bg-sa-gold/10 p-6 md:p-8 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <span className="size-11 rounded-xl bg-sa-gold text-sa-dark flex items-center justify-center shrink-0">
                <UserPlus className="size-5" strokeWidth={2.5} />
              </span>
              <div>
                <h2 className="font-display text-lg font-extrabold">Create your business profile before you quote.</h2>
                <p className="text-sm text-ink-2 mt-1.5">
                  Customers need to compare your service area, reviews, and trust signals before accepting. Setup takes a few minutes and you can polish it later.
                </p>
              </div>
            </div>
            <Button asChild className="rounded-full bg-sa-dark text-white hover:bg-sa-dark/90">
              <Link to="/list">List your business <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        )}

        {/* Post CTA banner — customer view only */}
        {!isProView && (
          <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-glow text-primary-foreground p-6 md:p-8 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-extrabold tracking-tight">Need work done?</h2>
              <p className="text-primary-foreground/85 text-sm mt-1">
                Post a request — pros will send you quotes. Or use the filters below to browse what's already on offer.
              </p>
            </div>
            <Button variant="ink" size="lg" asChild>
              <Link to="/requests/new">Post a Job</Link>
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-3 flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex-1 flex items-center gap-2 px-3">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={isProView ? "Search job requests, services, or city…" : "Search requests…"}
              className="w-full py-2 bg-transparent outline-none text-sm"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-sm font-medium border border-border rounded-md px-3 py-2 bg-background cursor-pointer min-w-[180px]"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="text-sm font-medium border border-border rounded-md px-3 py-2 bg-background cursor-pointer min-w-[180px]"
          >
            <option value="">All provinces</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Filter + sort chips */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {isProView && (
            <div className="ml-auto inline-flex rounded-full border border-border bg-card p-0.5 text-xs font-bold uppercase tracking-widest">
              {([
                { key: "nearest", label: "Nearest", icon: MapPin, disabled: !proCity && !proProvince },
                { key: "newest", label: "Newest", icon: Clock, disabled: false },
                { key: "urgent", label: "Urgent", icon: Siren, disabled: false },
              ] as const).map((s) => (
                <button
                  key={s.key}
                  onClick={() => !s.disabled && setSortMode(s.key)}
                  disabled={s.disabled}
                  title={s.disabled ? "Set your business city to sort by nearest" : `Sort by ${s.label.toLowerCase()}`}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors disabled:opacity-40",
                    sortMode === s.key ? "bg-foreground text-background" : "text-ink-2 hover:text-foreground",
                  )}
                >
                  <s.icon className="size-3.5" strokeWidth={2.5} />
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-sm text-muted-foreground mb-4 tabular-nums flex items-center gap-2">
          <span>{filtered.length} {isProView
            ? `job request${filtered.length === 1 ? "" : "s"} to quote`
            : `open request${filtered.length === 1 ? "" : "s"}`}</span>
          {isProView && sortMode === "nearest" && proCity && (
            <span className="text-ink-2">· nearest to <span className="font-semibold text-foreground">{proCity}</span></span>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-ink-2">Aikona — nothing matches your filters yet.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-5">
            {filtered.map((o) => (
              <JobCard
                key={o.id}
                job={o}
                isProView={isProView}
                proCity={proCity}
              />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
};

export default Opportunities;

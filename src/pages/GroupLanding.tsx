import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Gavel, Star } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { BusinessCard } from "@/components/BusinessCard";
import { JobCard } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_GROUPS,
  CATEGORIES,
} from "@/lib/mockData";
import { useBusinesses, useOpportunities } from "@/hooks/useDirectory";

const GroupLanding = () => {
  const { groupSlug } = useParams<{ groupSlug: string }>();
  const { data: allBusinesses } = useBusinesses();
  const { data: allOpps } = useOpportunities();
  const group = CATEGORY_GROUPS.find((g) => g.slug === groupSlug);

  if (!group) {
    return (
      <SiteLayout>
        <div className="container py-24 text-center">
          <h1 className="font-display text-3xl font-medium">Category not found</h1>
          <Link to="/directory" className="text-primary hover:underline mt-4 inline-block">
            Back to directory
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const subs = CATEGORIES.filter((c) => c.groupSlug === group.slug);
  const subSlugs = subs.map((s) => s.slug);
  const featured = allBusinesses.filter((b) => subSlugs.includes(b.categorySlug)).slice(0, 3);
  const jobs = allOpps.filter((o) => subSlugs.includes(o.categorySlug)).slice(0, 3);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="container py-12 md:py-16">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/directory" className="hover:text-foreground">Directory</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{group.name}</span>
          </nav>
          <div className="flex items-start gap-5">
            <span className="text-5xl md:text-6xl shrink-0">{group.emoji}</span>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
                {group.name}
              </h1>
              <p className="mt-2 text-ink-2 max-w-2xl">
                {subs.length} services from verified pros ready to graft.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to={`/directory?group=${group.slug}`}>Browse all in {group.name}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/requests/new">Post a Job</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* No Tjops promise */}
      <section className="border-b border-border bg-background">
        <div className="container py-6">
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="size-9 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <p className="font-semibold">Verified IDs</p>
                <p className="text-xs text-muted-foreground">ID document checked before quoting.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="size-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                <Gavel className="size-4" />
              </span>
              <div>
                <p className="font-semibold">Sjoh's Law — 3 strikes</p>
                <p className="text-xs text-muted-foreground">Flake or scam? Banned for life.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="size-9 rounded-lg bg-secondary text-foreground flex items-center justify-center">
                <Star className="size-4" />
              </span>
              <div>
                <p className="font-semibold">Real reviews only</p>
                <p className="text-xs text-muted-foreground">From paying clients, no fakes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-category tiles */}
      <section className="container py-14">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-medium tracking-tight">
            What do you need done?
          </h2>
          <Link to={`/directory?group=${group.slug}`} className="text-sm font-semibold text-primary hover:underline hidden md:inline-block">
            See all listings →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {subs.map((c) => (
            <Link
              key={c.slug}
              to={`/directory?category=${c.slug}`}
              className="group bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary hover:shadow-card transition-all"
            >
              <span className="text-3xl shrink-0">{c.emoji}</span>
              <div className="min-w-0">
                <p className="font-semibold text-sm group-hover:text-primary transition-colors leading-snug">{c.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured providers */}
      {featured.length > 0 && (
        <section className="bg-card border-y border-border">
          <div className="container py-14">
            <div className="flex items-end justify-between mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-medium tracking-tight">
                Featured in {group.name}
              </h2>
              <Link to={`/directory?group=${group.slug}`} className="text-sm font-semibold text-primary hover:underline hidden md:inline-block">
                See all →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest jobs in group */}
      {jobs.length > 0 && (
        <section className="container py-14">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-medium tracking-tight">
              Latest jobs in {group.name}
            </h2>
            <Link to="/requests" className="text-sm font-semibold text-primary hover:underline hidden md:inline-block">
              View board →
            </Link>
          </div>
          <div className="grid lg:grid-cols-3 gap-5">
            {jobs.map((o) => (
              <JobCard key={o.id} job={o} />
            ))}
          </div>
        </section>
      )}

      <div className="container pb-16">
        <Link to="/directory" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to all categories
        </Link>
      </div>
    </SiteLayout>
  );
};

export default GroupLanding;

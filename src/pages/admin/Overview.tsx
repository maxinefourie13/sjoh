import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Shield, RefreshCw, Building2, Briefcase, FileText, Star, CreditCard, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { useUserRoles } from "@/hooks/useUserRoles";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  generated_at: string;
  businesses_total: number;
  businesses_today: number;
  businesses_7d: number;
  businesses_active: number;
  pros_verified: number;
  subs_paid: number;
  subs_trialing: number;
  founding_pros_claimed: number;
  job_requests_total: number;
  job_requests_today: number;
  job_requests_open: number;
  quotes_total: number;
  quotes_today: number;
  reviews_total: number;
  reviews_today: number;
  recent_businesses: Array<{ name: string; city: string; province: string; category_name: string; listing_status: string; created_at: string }>;
  recent_job_requests: Array<{ title: string; category_name: string; city: string; status: string; created_at: string }>;
}

const FOUNDING_CAP = 500;

const AdminOverview = () => {
  const { loading: rolesLoading, isAdmin } = useUserRoles();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_platform_stats");
    if (error) setError(error.message);
    else { setStats(data as unknown as Stats); setError(null); }
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) void load(); }, [isAdmin]);

  if (rolesLoading) {
    return <div className="min-h-dvh grid place-items-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!isAdmin) return <Navigate to="/" replace />;

  const when = (iso: string) => new Date(iso).toLocaleString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <SiteLayout>
      <SeoHead title="Sjoh · Ops" description="Private founder dashboard" />
      <div className="container py-10">
        <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              <Shield className="size-3.5" /> Private · Founder
            </span>
            <h1 className="font-display text-3xl font-extrabold tracking-tight mt-2">Platform pulse</h1>
            <p className="text-sm text-ink-2 mt-1">
              Live snapshot of everything on Sjoh. {stats && <span className="text-muted-foreground">Updated {when(stats.generated_at)}.</span>}
            </p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading} className="gap-1.5">
            <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} /> Refresh
          </Button>
        </header>

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive mb-6">{error}</div>
        )}

        {stats && (
          <>
            {/* Today */}
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-ink-2 mb-3">Today</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <Stat icon={Building2} label="New businesses" value={stats.businesses_today} accent />
              <Stat icon={Briefcase} label="New job requests" value={stats.job_requests_today} accent />
              <Stat icon={FileText} label="Quotes sent" value={stats.quotes_today} />
              <Stat icon={Star} label="Reviews" value={stats.reviews_today} />
            </div>

            {/* Totals */}
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-ink-2 mb-3">All time</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <Stat icon={Building2} label="Businesses" value={stats.businesses_total} sub={`${stats.businesses_active} active · ${stats.businesses_7d} this week`} />
              <Stat icon={ShieldCheck} label="ID-verified pros" value={stats.pros_verified} />
              <Stat icon={CreditCard} label="Paid subscriptions" value={stats.subs_paid} sub={`${stats.subs_trialing} on trial`} />
              <Stat icon={Shield} label="Founding spots" value={`${stats.founding_pros_claimed} / ${FOUNDING_CAP}`} sub={`${Math.max(0, FOUNDING_CAP - stats.founding_pros_claimed)} left`} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
              <Stat icon={Briefcase} label="Job requests" value={stats.job_requests_total} sub={`${stats.job_requests_open} open`} />
              <Stat icon={FileText} label="Quotes sent" value={stats.quotes_total} />
              <Stat icon={Star} label="Reviews" value={stats.reviews_total} />
            </div>

            {/* Recent feeds */}
            <div className="grid md:grid-cols-2 gap-6">
              <Feed title="Latest businesses" empty="No businesses yet.">
                {stats.recent_businesses.map((b, i) => (
                  <FeedRow key={i} title={b.name} meta={`${b.category_name} · ${b.city}, ${b.province}`} tag={b.listing_status} time={when(b.created_at)} />
                ))}
              </Feed>
              <Feed title="Latest job requests" empty="No job requests yet.">
                {stats.recent_job_requests.map((o, i) => (
                  <FeedRow key={i} title={o.title} meta={`${o.category_name} · ${o.city}`} tag={o.status} time={when(o.created_at)} />
                ))}
              </Feed>
            </div>
          </>
        )}
      </div>
    </SiteLayout>
  );
};

const Stat = ({ icon: Icon, label, value, sub, accent }: { icon: typeof Building2; label: string; value: number | string; sub?: string; accent?: boolean }) => (
  <div className={`rounded-2xl border p-5 ${accent && Number(value) > 0 ? "border-sa-green/40 bg-sa-green/5" : "border-border bg-card"}`}>
    <Icon className="size-4 text-muted-foreground" />
    <p className="font-display text-3xl font-black tabular-nums mt-2">{value}</p>
    <p className="text-xs font-semibold text-ink-2 mt-1">{label}</p>
    {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

const Feed = ({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) => {
  const items = Array.isArray(children) ? children : [children];
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-display text-base font-bold tracking-tight mb-3">{title}</h3>
      {items.filter(Boolean).length === 0
        ? <p className="text-sm text-muted-foreground">{empty}</p>
        : <div className="space-y-1">{children}</div>}
    </div>
  );
};

const FeedRow = ({ title, meta, tag, time }: { title: string; meta: string; tag: string; time: string }) => (
  <div className="flex items-center gap-3 py-2 border-b border-border/60 last:border-0">
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold truncate">{title}</p>
      <p className="text-xs text-muted-foreground truncate">{meta}</p>
    </div>
    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">{tag}</span>
    <span className="text-[11px] text-muted-foreground shrink-0 w-20 text-right">{time}</span>
  </div>
);

export default AdminOverview;

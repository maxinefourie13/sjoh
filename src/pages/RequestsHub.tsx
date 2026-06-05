import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ClipboardList,
  Send,
  Handshake,
  ShieldCheck,
  CheckCircle2,
  Siren,
  Search,
  Sparkles,
  HeartHandshake,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobCard } from "@/components/JobCard";
import { EarlyAccessNotice } from "@/components/EarlyAccessNotice";
import { useOpportunities } from "@/hooks/useDirectory";
import { CATEGORIES, PROVINCES } from "@/lib/mockData";
import { SeoHead } from "@/components/SeoHead";
import heroGroup2 from "@/assets/hero-group-2.jpg";
import heroGroup3 from "@/assets/hero-group-3.jpg";

type TabKey = "quote" | "pros";

const RequestsHub = () => {
  const [params, setParams] = useSearchParams();
  const initialTab = (params.get("tab") as TabKey) || "quote";
  const [tab, setTab] = useState<TabKey>(initialTab);

  const handleTabChange = (v: string) => {
    setTab(v as TabKey);
    const next = new URLSearchParams(params);
    if (v === "quote") next.delete("tab");
    else next.set("tab", v);
    setParams(next, { replace: true });
  };

  return (
    <SiteLayout>
      <SeoHead
        title="Get Quotes from Vetted SA Pros — Free | Sjoh"
        description="Tell us the job — vetted South African pros come back with quotes. Free for customers. No commission. No middleman."
        canonical="https://sjoh.co.za/requests"
      />
      <div
        className="text-sa-dark"
        style={{
          background:
            "linear-gradient(180deg, #fbfcff 0%, #f5f7fc 100%)",
        }}
      >
      <div className="container py-10 md:py-14">
        <header className="relative mb-8 overflow-hidden rounded-[2rem] border border-black/10 bg-[#f7f8fc] p-6 md:p-10 shadow-[0_24px_54px_-42px_rgba(16,24,40,0.35)]">
          <img src={heroGroup3} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-10 grayscale" />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, rgba(247,248,252,0.97) 0%, rgba(247,248,252,0.92) 52%, rgba(247,248,252,0.76) 100%)" }}
          />
          <div className="relative max-w-3xl text-sa-dark">
            <span className="text-xs font-bold uppercase tracking-widest text-sa-dark/65">
              Post a Job
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mt-2">
              Need someone who can do it properly?
            </h1>
            <p className="mt-3 text-sa-dark/72 text-lg">
              Tell us what you need once. Vetted SA pros send quotes back to your Sjoh dashboard, then you choose who to contact.
            </p>
          </div>
        </header>

        <EarlyAccessNotice
          className="mb-8"
          title="Requests help us bring the right pros in."
          body="Because Sjoh is still early, posting a job also shows us where demand is strongest. If there aren’t many pros in your area yet, we can use that signal to recruit the right ones next."
          ctaLabel="Post your job"
          ctaTo="/requests/new"
        />

        <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid h-auto w-full max-w-2xl grid-cols-2 mb-8 rounded-full border border-black/10 bg-white p-1.5 text-sa-dark/55 shadow-[0_12px_26px_-22px_rgba(16,24,40,0.4)]">
            <TabsTrigger value="quote" className="rounded-full py-3 font-extrabold hover:text-sa-dark data-[state=active]:bg-sa-gold data-[state=active]:text-sa-dark data-[state=active]:shadow-none">
              <Sparkles className="size-4 mr-1.5" />
              Tell us what you need
            </TabsTrigger>
            <TabsTrigger value="pros" className="rounded-full py-3 font-extrabold hover:text-sa-dark data-[state=active]:bg-sa-green data-[state=active]:text-white data-[state=active]:shadow-none">
              <Send className="size-4 mr-1.5" />
              For businesses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quote" className="mt-0">
            <GetQuotePanel />
          </TabsContent>

          <TabsContent value="pros" className="mt-0">
            <QuoteOnJobsPanel />
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </SiteLayout>
  );
};

export default RequestsHub;

// ============================================================
// Tab 1: Get an instant quote
// ============================================================

const STEPS = [
  {
    icon: ClipboardList,
    title: "1. Tell us the job",
    body: "Pick a category, your suburb, and what needs doing. Add photos if you've got them so pros can quote properly.",
  },
  {
    icon: Send,
    title: "2. Vetted pros quote you",
    body: "Real SA businesses in your area send quotes to your Sjoh dashboard. Your contact details stay private until you accept.",
  },
  {
    icon: Handshake,
    title: "3. Pick your pro, chat direct",
    body: "Compare price, scope, reviews and timing. Accept the best quote, then contact details unlock so you can get it sorted.",
  },
];

const CHECKLIST = [
  "What needs doing (one line is fine)",
  "Where you are — suburb + city",
  "When you need it — ASAP, this week, flexible",
  "Rough budget guide (or 'not sure')",
  "Photos if you have them",
];

const PROMISES = [
  { icon: CheckCircle2, text: "Quotes from verified pros" },
  { icon: HeartHandshake, text: "Free for you, always — no obligation" },
  { icon: ShieldCheck, text: "We vet every pro before they can quote" },
];

const GetQuotePanel = () => {
  const { data: opportunities } = useOpportunities();
  const recent = opportunities.slice(0, 3);

  return (
    <div className="space-y-12">
      {/* Hero CTA card */}
      <section className="rounded-[2rem] bg-[#101010] text-white p-8 md:p-12 shadow-pop relative overflow-hidden border border-white/10">
        <img src={heroGroup2} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-24" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/72 to-black/34" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute -bottom-10 right-10 h-3 w-60 rotate-[-8deg] bg-sa-gold pointer-events-none" />
        <div className="absolute right-8 top-8 hidden rounded-[1.4rem] border-2 border-black bg-sa-red px-5 py-4 text-sm font-black text-white shadow-[8px_8px_0_rgba(255,255,255,0.16)] md:block">
          Post once.<br />Compare properly.
        </div>
        <div className="relative max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            Tell us what you need. Pros come to you.
          </h2>
          <p className="mt-3 text-white/90 text-base md:text-lg">
            Post your job in under 2 minutes. Vetted pros in your area will quote you back — free, no obligation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" asChild className="rounded-full bg-sa-gold font-bold text-sa-dark hover:bg-sa-gold/90">
              <Link to="/requests/new">
                Post your request <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" asChild className="rounded-full border border-white/20 text-white hover:bg-white/15 hover:text-white">
              <Link to="/directory">Or browse pros yourself</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Three-step explainer */}
      <section>
        <h3 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight mb-6">
          How it works
        </h3>
        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((s) => (
            <div
              key={s.title}
              className="lift-card rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-card"
            >
              <div
                className="size-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: s.title.startsWith("1") ? "var(--sa-gold)" : s.title.startsWith("2") ? "var(--sa-red)" : "var(--sa-green)", color: s.title.startsWith("1") ? "var(--sa-dark)" : "#fff" }}
              >
                <s.icon className="size-6" strokeWidth={2.25} />
              </div>
              <h4 className="font-display text-lg font-extrabold tracking-tight">
                {s.title}
              </h4>
              <p className="text-white/62 text-sm mt-2 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What you'll need + What you get back, side-by-side */}
      <section className="grid lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-sa-gold/30 bg-sa-gold/10 p-6 md:p-8">
          <span className="text-xs font-bold uppercase tracking-widest text-sa-pink">
            Before you start
          </span>
          <h4 className="font-display text-xl md:text-2xl font-extrabold tracking-tight mt-2">
            What you'll need to send
          </h4>
          <p className="text-ink-2 text-sm mt-2">
            Have these ready — it'll take you 2 minutes, tops.
          </p>
          <ul className="mt-5 space-y-3">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="size-5 rounded-full bg-sa-green/15 text-sa-green flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="size-3.5" strokeWidth={2.5} />
                </span>
                <span className="text-sm font-medium text-ink">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-sa-green/35 bg-sa-green/15 p-6 md:p-8">
          <span className="text-xs font-bold uppercase tracking-widest text-sa-green">
            What you get back
          </span>
          <h4 className="font-display text-xl md:text-2xl font-extrabold tracking-tight mt-2">
            Quotes from vetted pros, in your dashboard
          </h4>
          <p className="text-ink-2 text-sm mt-2">
            We keep the quote trail tidy, then you pay the business directly. Sjoh never takes commission.
          </p>
          <ul className="mt-5 space-y-3">
            {PROMISES.map((p) => (
              <li key={p.text} className="flex items-start gap-3">
                <span className="size-5 rounded-full bg-sa-green text-white flex items-center justify-center shrink-0 mt-0.5">
                  <p.icon className="size-3.5" strokeWidth={2.5} />
                </span>
                <span className="text-sm font-semibold text-ink">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Urgent strip */}
      <section className="rounded-2xl border border-sa-red/40 bg-sa-red/15 p-6 md:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="size-11 rounded-xl bg-sa-red text-white flex items-center justify-center shrink-0">
            <Siren className="size-5" strokeWidth={2.5} />
          </span>
          <div>
            <h4 className="font-display text-lg font-extrabold tracking-tight">
              In a hurry? Mark it Urgent.
            </h4>
            <p className="text-sm text-white/62 mt-1">
              For <strong>R50</strong>, your post jumps to the top of every pro's feed and pings our top operators direct. Use it for burst pipes, locked-out emergencies, last-minute jobs.
            </p>
          </div>
        </div>
      </section>

      {/* Big CTA again */}
      <section className="rounded-2xl border-2 border-sa-gold bg-sa-gold text-sa-dark p-6 md:p-8 text-center">
        <h3 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">
          Ready? Post your request — it's free.
        </h3>
        <p className="text-ink-2 mt-2 max-w-xl mx-auto">
          Takes about 2 minutes. You'll start getting quotes shortly after.
        </p>
        <Button size="lg" asChild className="mt-5 rounded-full bg-sa-dark font-bold text-white hover:bg-sa-dark/90">
          <Link to="/requests/new">
            Post your request <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>

      {/* Recent requests strip — social proof */}
      {recent.length > 0 && (
        <section className="rounded-[2rem] border border-black/10 bg-white p-6 md:p-8 shadow-[0_24px_54px_-42px_rgba(16,24,40,0.24)]">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-sa-dark/68">
                Live on Sjoh right now
              </span>
              <h3 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-sa-dark">
                Recent requests from other Saffas
              </h3>
            </div>
          </div>
          <div className="rounded-[1.4rem] border border-black/8 bg-[#f2f5fc] p-4 md:p-5">
            <div className="grid gap-4 md:grid-cols-3">
            {recent.map((o) => (
              <JobCard key={o.id} job={o} mixedColors />
            ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

// ============================================================
// Tab 2: For businesses
// ============================================================

const QuoteOnJobsPanel = () => {
  const { data: opportunities } = useOpportunities();
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [province, setProvince] = useState("");

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      if (keyword) {
        const k = keyword.toLowerCase();
        if (
          !o.title.toLowerCase().includes(k) &&
          !o.category.toLowerCase().includes(k) &&
          !o.city.toLowerCase().includes(k)
        )
          return false;
      }
      if (category && o.categorySlug !== category) return false;
      if (province && o.province !== province) return false;
      return true;
    });
  }, [opportunities, keyword, category, province]);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 md:p-7">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-sa-green/20 blur-3xl" />
        <div className="flex items-start gap-4">
          <span className="size-11 rounded-xl bg-sa-gold text-sa-dark flex items-center justify-center shrink-0">
            <Send className="size-5" strokeWidth={2.5} />
          </span>
          <div>
            <h3 className="font-display text-xl md:text-2xl font-extrabold tracking-tight">
              Find work worth quoting
            </h3>
            <p className="text-white/62 text-sm mt-1">
              Browse live customer requests, choose the jobs that fit your service area, and send a quote from your Sjoh business profile.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-sa-gold rounded-[1.2rem] p-3 flex flex-col md:flex-row gap-3 shadow-[8px_8px_0_rgba(255,178,38,0.18)]">
        <div className="flex-1 flex items-center gap-2 px-3">
          <Search className="size-4 text-sa-pink" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search job requests, services, or city..."
            className="w-full py-2 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-sm font-medium border border-border rounded-md px-3 py-2 bg-background text-foreground cursor-pointer min-w-[180px]"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          className="text-sm font-medium border border-border rounded-md px-3 py-2 bg-background text-foreground cursor-pointer min-w-[180px]"
        >
          <option value="">All provinces</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="text-sm text-white/50 tabular-nums">
        {filtered.length} live job {filtered.length === 1 ? "request" : "requests"}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <p className="text-ink-2">Aikona — no customer requests match your filters yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((o) => (
            <JobCard key={o.id} job={o} isProView />
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="rounded-2xl bg-sa-green border border-sa-green text-white p-6 md:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
        <div>
          <h4 className="font-display text-lg md:text-xl font-extrabold tracking-tight">
            Want to quote on these jobs?
          </h4>
          <p className="text-white/85 text-sm mt-1">
            Create a business profile first so customers can compare your quote, reviews, service area, and trust signals.
          </p>
        </div>
        <Button asChild className="shrink-0 rounded-full bg-sa-gold font-bold text-sa-dark hover:bg-sa-gold/90">
          <Link to="/list">
            List your business <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Star, ArrowRight, ShieldCheck, Zap, CheckCircle2, UsersRound } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { FlameButton } from "@/components/ui/flame-button";
import { JobCard } from "@/components/JobCard";
import { Typewriter } from "@/components/Typewriter";
import { FoundingSpotsBanner } from "@/components/FoundingSpotsBanner";
import { EarlyAccessNotice } from "@/components/EarlyAccessNotice";
import { BUSINESSES, CATEGORIES, CATEGORY_GROUPS, OPPORTUNITIES, PROVINCES } from "@/lib/mockData";
import { useBusinesses } from "@/hooks/useDirectory";
import { getCategoryGroupIcon } from "@/lib/categoryIcons";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";
import heroGroup1 from "@/assets/hero-group-1.jpg";
import heroGroup2 from "@/assets/hero-group-2.jpg";
import heroGroup3 from "@/assets/hero-group-3.jpg";
import heroGroup4 from "@/assets/hero-group-4.jpg";

const HERO_PHRASES = [
  "Sjoh! Your husband's DIY is a crime scene. Hire an actual professional.",
  "Sjoh! Cousin's wiring giving you static shocks? Get a vetted sparky.",
  "Sjoh! Kitchen looking like a swimming pool? Dala a plumber.",
  "Sjoh! Don't let a mampara tile your bathroom. Get a tiler.",
  "Sjoh! Locked out in your old PJs? Find a locksmith.",
  "Sjoh! The 'I know a guy' guy ghosted you? Find a pro who shows up.",
  "Sjoh! Company logo looks like MS Paint? Hire a real designer.",
  "Sjoh! Spreadsheets making you cry? Dala an Excel pro.",
  "Sjoh! The dog ate your garden... again. Find a landscaper.",
  "Sjoh! Braai area looks like a construction site? Get a stone-mason.",
  "Sjoh! Geyser acting like a steam engine? Get it sorted now.",
  "Sjoh! Gate motor has given up the ghost? Find a technician.",
  "Sjoh! Paving looking like a 4x4 track? Find a paving specialist.",
  "Sjoh! Finding someone who can do it properly. Start here.",
];

const MARQUEE_ITEMS = [
  "Get found",
  "Vetted pros",
  "All 9 provinces",
  "240+ categories",
  "Real South Africans",
  "No middleman",
  "Lekker service",
];

const HOW_STEPS = [
  { n: "01", Icon: Search, title: "Post the job", body: "Describe what you need in 60 seconds.", bg: "var(--sa-gold)", color: "var(--sa-dark)", rot: "-1.5deg" },
  { n: "02", Icon: UsersRound, title: "Get real quotes", body: "Vetted local businesses send quotes to your dashboard.", bg: "var(--sa-red)", color: "#fff", rot: "1.2deg" },
  { n: "03", Icon: Star, title: "Check the reviews", body: "Browse profiles, work history, and the Sjoh Trust Index.", bg: "var(--sa-navy)", color: "#fff", rot: "-0.8deg" },
  { n: "04", Icon: CheckCircle2, title: "Get it sorted", body: "Contact them directly, compare proof, and choose who feels right.", bg: "var(--sa-green)", color: "#fff", rot: "1.5deg" },
];

const HERO_SERVICE_CARDS = [
  { title: "Wedding photographer", meta: "Cape Town · ready to book", color: "var(--sa-pink)" },
  { title: "Electrical COC", meta: "Pretoria · quote requested", color: "var(--sa-gold)" },
  { title: "Website refresh", meta: "Remote · budget shared", color: "var(--sa-peri)" },
  { title: "Garden service", meta: "Durban · this week", color: "var(--sa-green)" },
];

const CATEGORY_TILE_STYLES = [
  "var(--sa-gold)",
  "var(--sa-red)",
  "var(--sa-green)",
  "var(--sa-peri)",
  "var(--sa-pink)",
  "var(--sa-navy)",
];

type CountingStatProps = {
  value: number;
  suffix?: string;
  label: string;
  color: string;
  active: boolean;
};

const CountingStat = ({ value, suffix = "", label, color, active }: CountingStatProps) => {
  const [displayValue, setDisplayValue] = useState(active ? value : 0);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!active) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(value);
      return;
    }

    const duration = 1200;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [active, value]);

  return (
    <div className="flex flex-col items-center text-center pt-4 md:pt-0">
      <span className="font-display-bold text-5xl md:text-6xl tabular-nums" style={{ color }}>
        {displayValue.toLocaleString()}{suffix}
      </span>
      <span className="text-sm font-medium text-white/55 mt-2">{label}</span>
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [province, setProvince] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (province) params.set("province", province);
    navigate(`/directory?${params.toString()}`);
  };

  const { data: allBusinesses } = useBusinesses();
  const featuredRailRef = useRef<HTMLDivElement | null>(null);
  const featured = [...allBusinesses, ...BUSINESSES]
    .filter((business, index, businesses) => businesses.findIndex((item) => item.slug === business.slug) === index)
    .sort((a, b) => (b.reviewCount - a.reviewCount) || (b.rating - a.rating))
    .slice(0, 8);
  const latest = OPPORTUNITIES.slice(0, 3);
  const popularCatSlugs = ["plumbing", "electrical", "home-cleaning", "garden-services", "mechanics", "web-design"];
  const popularCats = popularCatSlugs
    .map((s) => CATEGORIES.find((c) => c.slug === s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const groupCounts = CATEGORY_GROUPS.map((g) => ({
    ...g,
    subCount: CATEGORIES.filter((c) => c.groupSlug === g.slug).length,
  }));
  const { ref: statsRef, visible: statsVisible } = useReveal<HTMLElement>(0.35);
  const stats = useMemo(
    () => [
      { value: 0, suffix: "%", label: "Commission on jobs", color: "var(--sa-red)" },
      { value: 240, suffix: "+", label: "Service categories", color: "var(--sa-navy)" },
      { value: 11, label: "Industry groups", color: "var(--sa-green)" },
      { value: 9, label: "Provinces covered", color: "var(--sa-pink)" },
    ],
    [],
  );

  return (
    <SiteLayout>
      <SeoHead
        title="Sjoh — Find someone who can do it properly"
        description="South Africa's service marketplace for customers who need proper local pros, and service businesses that want to be found without website building or social media admin."
        canonical="https://sjoh.co.za/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Sjoh",
            url: "https://sjoh.co.za/",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://sjoh.co.za/directory?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Sjoh",
            url: "https://sjoh.co.za/",
            description: "South African service marketplace where customers find trusted local pros and proper businesses build an online reputation.",
            areaServed: "ZA",
          },
        ]}
      />
      {/* ========== HERO ========== */}
      <section
        className="relative overflow-hidden border-b border-white/10 bg-[#050505]"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="container relative pt-14 pb-12 lg:pt-18 lg:pb-16">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/8 border border-white/15 text-xs font-semibold text-white/85">
                <span className="size-2 rounded-full" style={{ background: "var(--sa-pink)" }} />
                Find the skill. Check the proof. Get it sorted.
              </span>
              <div className="max-w-md">
                <FoundingSpotsBanner />
              </div>
            </div>

            <div className="mx-auto flex min-h-[11.5rem] max-w-5xl items-center justify-center sm:min-h-[10rem] lg:min-h-[12rem]">
              <h1 className="font-display-bold text-4xl sm:text-5xl md:text-6xl leading-[1.03] text-balance text-white">
                <span className="text-sa-gold">Sjoh!</span>{" "}
                <Typewriter
                  phrases={HERO_PHRASES.map((phrase) => phrase.replace(/^Sjoh!\s*/, ""))}
                  randomize
                  typingSpeed={75}
                  erasingSpeed={35}
                  holdDuration={3200}
                  accentRotation={["text-sa-pink", "text-sa-gold", "text-sa-peri", "text-sa-red"]}
                />
              </h1>
            </div>

            <p className="mt-4 mb-3 text-sm md:text-base font-semibold uppercase tracking-widest text-white/55">
              What can we help you sort out?
            </p>

            <form
              onSubmit={onSearch}
              className="mx-auto w-full max-w-4xl bg-card p-2 rounded-[1.35rem] shadow-card border border-border flex flex-col md:flex-row gap-2 transition-shadow focus-within:shadow-pop"
            >
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search className="size-4 text-muted-foreground shrink-0" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  type="text"
                  placeholder="Try 'Sparky', 'Tiler' or 'Graphic Designer'..."
                  className="w-full py-3.5 bg-transparent outline-none text-base placeholder:text-muted-foreground font-medium"
                />
              </div>
              <div className="hidden md:block w-px bg-border my-2" />
              <div className="relative md:min-w-[190px]">
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full pl-4 pr-10 py-3.5 bg-transparent outline-none text-base font-medium appearance-none cursor-pointer text-foreground"
                >
                  <option value="">All Provinces</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs">▾</span>
              </div>
              <FlameButton type="submit" size="lg">Find a Pro</FlameButton>
            </form>

            <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-white/55 self-center mr-1">
                Popular:
              </span>
              {popularCats.map((c) => (
                <Link
                  key={c.slug}
                  to={`/directory?category=${c.slug}`}
                  className="text-sm font-medium px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 hover:-translate-y-0.5 transition-all duration-200 ease-out"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-12 hidden lg:grid grid-cols-[0.8fr_1.2fr_0.8fr] gap-6 items-end">
            {/* Column 1: Left details */}
            <div className="space-y-4 pb-6">
              {/* Symmetrical Frosted Glass "Fast match" card */}
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 shadow-card backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-sa-gold">
                  <Zap className="size-4 fill-sa-gold" /> Fast match
                </div>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-white/90">
                  Find the right pro fast, then compare reviews before you choose.
                </p>
              </div>

              {/* Matching Frosted Glass "Live searches" card */}
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 shadow-card backdrop-blur-md">
                <div className="pb-3 text-[10px] font-black uppercase tracking-widest text-white/40">
                  Live searches
                </div>
                <div className="space-y-3">
                  {HERO_SERVICE_CARDS.map((card) => (
                    <div key={card.title} className="flex items-center justify-between gap-3 border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-bold text-white">{card.title}</p>
                        <p className="text-[11px] text-white/50">{card.meta}</p>
                      </div>
                      <span className="size-2 rounded-full" style={{ background: card.color }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Center Showcase */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-3 shadow-pop">
              <img src={heroGroup2} alt="South Africans using Sjoh" className="h-[430px] w-full rounded-[1.45rem] object-cover" />
              <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/45 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                Real people. Real work. All over SA.
              </div>
              <div className="absolute bottom-5 left-5 right-5 rounded-[1.25rem] border border-white/15 bg-black/55 p-4 text-white shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Search in progress</div>
                    <div className="mt-0.5 font-display text-lg font-black">Compare trusted pros</div>
                  </div>
                  <span className="rounded-full bg-sa-gold px-3 py-1 text-xs font-black text-sa-dark shadow-sm">9 provinces</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-white/80">
                  <ShieldCheck className="size-4 text-sa-green" />
                  Reviews, verified badges, clear job details
                </div>
              </div>
            </div>

            {/* Column 3: Right details */}
            <div className="space-y-4 pb-6">
              {/* Cohesive Frosted Glass Rating capsule */}
              <div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-bold text-white shadow-md backdrop-blur-md">
                <Star className="size-3.5 fill-sa-gold text-sa-gold" /> 4.9 average rating
              </div>

              {/* Symmetrical Frosted Glass "Proof before you call" card */}
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 text-white shadow-card backdrop-blur-md">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Proof before you call</span>
                  <span className="rounded-full bg-sa-pink/20 border border-sa-pink/30 text-sa-pink px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider">Reviews</span>
                </div>
                <p className="text-xl font-black leading-snug">
                  Profiles that show the work, the area, and the trust signals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-8">
        <div className="container">
          <EarlyAccessNotice
            title="Sjoh is open early, while the marketplace fills up."
            body="That’s why some areas may look quiet right now. We’re onboarding proper South African pros category by category, and founding businesses can claim early visibility while the community grows."
            ctaLabel="Get on early"
            ctaTo="/list"
          />
        </div>
      </section>

      {/* ========== MARQUEE STRIP ========== */}
      <div
        aria-hidden
        className="relative overflow-hidden whitespace-nowrap border-y border-black/10 bg-white py-5"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-20 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-20 bg-gradient-to-l from-white to-transparent" />
        <div className="inline-flex sa-marquee-track items-center">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((t, i) => (
            <span
              key={i}
              className="font-display-bold inline-flex items-center gap-4 px-7 text-[15px] text-sa-dark/78 md:text-[17px]"
            >
              {t}
              <span
                className="size-2.5 rotate-45 rounded-[2px]"
                style={{
                  background:
                    i % 5 === 0 ? "var(--sa-gold)" :
                    i % 5 === 1 ? "var(--sa-red)" :
                    i % 5 === 2 ? "var(--sa-peri)" :
                    i % 5 === 3 ? "var(--sa-green)" :
                    "var(--sa-pink)",
                }}
              />
            </span>
          ))}
        </div>
      </div>

      {/* ========== PHOTO BAND — local work, product cards ========== */}
      <section className="bg-[#050505] py-16">
          <div className="relative min-h-[620px] overflow-hidden border-y border-white/10">
            <img src={heroGroup1} alt="South Africans using Sjoh" className="absolute inset-0 h-full w-full object-cover" />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.84) 0%, rgba(0,0,0,0.54) 36%, rgba(0,0,0,0.16) 72%, rgba(0,0,0,0.06) 100%)" }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.08) 48%, rgba(0,0,0,0.22) 100%)" }}
            />
            <div className="relative z-[1] flex min-h-[620px] items-end px-5 py-12 md:px-10 md:py-16 lg:px-14 xl:px-20">
              <div className="max-w-3xl">
                <div className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-white/78 drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
                  ● Real help, close by
                </div>
                <h2 className="mb-4 font-display-bold text-5xl leading-[0.98] text-white drop-shadow-[0_6px_34px_rgba(0,0,0,0.95)] md:text-7xl">
                  Find the skill.<br />Check the reviews.<br />Get it <span className="text-sa-gold">sorted.</span>
                </h2>
                <p className="max-w-xl text-lg font-medium leading-relaxed text-white/86 drop-shadow-[0_3px_18px_rgba(0,0,0,0.95)]">
                  Search the directory, post a request, or list your business where people are already looking for exactly what you do.
                </p>
              </div>
            </div>
          </div>
          <div className="border-b border-white/10 bg-[#050505] px-5 py-5 md:px-10 lg:px-14 xl:px-20">
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { title: "Post a request", body: "Share the job once and let interested pros come back to you.", cta: "Start here", to: "/requests/new" },
                  { title: "Browse vetted pros", body: "Compare profiles, reviews, work areas, and services across SA.", cta: "Open directory", to: "/directory" },
                  { title: "List your business", body: "Look legitimate online without building a website or running ads.", cta: "List your business", to: "/list" },
                ].map((card) => (
                  <Link
                    key={card.title}
                    to={card.to}
                    className="group min-h-[160px] rounded-[1.25rem] border border-white/12 bg-white/[0.055] p-5 text-white transition hover:-translate-y-1 hover:border-sa-gold/50 hover:bg-white/[0.09]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest text-white/55">{card.cta}</span>
                      <span className="grid size-9 place-items-center rounded-full bg-sa-gold text-sa-dark transition group-hover:rotate-[-12deg]">
                        <ArrowRight className="size-4" />
                      </span>
                    </div>
                    <h3 className="mt-8 font-display text-2xl font-extrabold">{card.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/68">{card.body}</p>
                  </Link>
                ))}
              </div>
          </div>
      </section>

      {/* ========== HOW IT WORKS — rotated colored cards ========== */}
      <section className="bg-[#101010] py-20">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
            <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05]">
              <img src={heroGroup4} alt="South Africans using Sjoh to find local services" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/86 via-black/42 to-black/10" />
              <div className="relative z-[1] flex h-full min-h-[520px] flex-col justify-end p-6 md:p-8">
                <div className="max-w-md rounded-[1.35rem] border border-white/15 bg-black/52 p-5 backdrop-blur-sm">
                  <div className="mb-4 w-fit rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                    How Sjoh works
                  </div>
                  <h2 className="font-display-bold text-4xl md:text-5xl leading-[1.03] text-white">
                    Search once.<br />Choose properly.
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-white/80">
                    Browse the directory, compare the trust signals, and move from “who do I call?” to “this is the right person.”
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {HOW_STEPS.map((s) => (
                <div
                  key={s.n}
                  className="rounded-[1.65rem] p-7 flex flex-col gap-3.5 min-h-[250px] transition-transform duration-200 hover:translate-y-[-4px]"
                  style={{ background: s.bg, color: s.color, transform: `rotate(${s.rot})` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="font-display-bold text-4xl opacity-24">{s.n}</div>
                    <div className="size-11 rounded-xl bg-black/10 grid place-items-center">
                      <s.Icon className="size-5" strokeWidth={2.4} />
                    </div>
                  </div>
                  <h3 className="font-display-bold text-lg mt-auto leading-tight">{s.title}</h3>
                  <p className="text-[13px] leading-snug opacity-75">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== STATS BAR ========== */}
      <section ref={statsRef} className="bg-[#050505] border-y border-white/10">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {stats.map((s) => (
              <CountingStat
                key={s.label}
                value={s.value}
                suffix={s.suffix}
                label={s.label}
                color={s.color}
                active={statsVisible}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========== CATEGORIES GRID ========== */}
      <section className="bg-[#101010] border-b border-white/10">
        <div className="container py-20">
          <div className="flex items-end justify-between mb-10">
            <div className="max-w-xl">
              <h2 className="font-display-bold text-3xl md:text-5xl leading-[1.03] text-white">
                Browse by category
              </h2>
              <p className="mt-3 text-white/55">From electricians to event planners — everything you need.</p>
            </div>
            <Link to="/directory" className="text-sm font-semibold hover:underline hidden md:inline-block text-sa-gold">
              Browse all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {groupCounts.map((g, index) => {
              const Icon = getCategoryGroupIcon(g.slug);
              const accent = CATEGORY_TILE_STYLES[index % CATEGORY_TILE_STYLES.length];
              return (
                <Link
                  key={g.slug}
                  to={`/directory/g/${g.slug}`}
                  className="group relative overflow-hidden rounded-xl bg-white/[0.06] p-5 flex items-center gap-4 border hover:bg-white/[0.1] hover:-translate-y-1 hover:shadow-card transition-all duration-300 ease-out"
                  style={{ borderColor: `color-mix(in srgb, ${accent} 45%, transparent)` }}
                >
                  <span className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-25" style={{ background: accent }} />
                  <span
                    className="relative size-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
                    style={{ color: accent }}
                  >
                    <Icon className="size-5" strokeWidth={2} />
                  </span>
                  <div className="relative min-w-0">
                    <p className="font-semibold text-sm text-white transition-colors leading-snug group-hover:text-white">{g.name}</p>
                    <p className="text-xs text-white/45 mt-0.5 tabular-nums">{g.subCount} services</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== FEATURED PROS RAIL ========== */}
      <section className="bg-[#050505] py-20 overflow-hidden">
        <div className="container">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="text-[11px] font-bold tracking-[0.1em] uppercase mb-3 text-sa-gold">
                ● Pros of the month
              </div>
              <h2 className="font-display-bold text-4xl md:text-6xl leading-[1.02] text-white">
                Local pros people keep recommending.
              </h2>
              <p className="mt-3 max-w-xl text-white/58">
                Featured spots are picked from reviews, response rate, and profile quality. For now, these are example listings while Sjoh fills up.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                aria-label="Scroll featured pros left"
                onClick={() => featuredRailRef.current?.scrollBy({ left: -360, behavior: "smooth" })}
                className="grid size-10 place-items-center rounded-full bg-white text-sa-dark font-black transition hover:-translate-x-0.5 hover:bg-sa-peri"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Scroll featured pros right"
                onClick={() => featuredRailRef.current?.scrollBy({ left: 360, behavior: "smooth" })}
                className="grid size-10 place-items-center rounded-full bg-sa-gold text-sa-dark font-black transition hover:translate-x-0.5 hover:bg-white"
              >
                →
              </button>
            </div>
          </div>

          <div
            ref={featuredRailRef}
            className="-mx-4 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex w-max gap-5">
              {featured.map((b, index) => (
                <Link
                  key={b.id}
                  to={`/business/${b.slug}`}
                  className="group w-[282px] shrink-0 overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.06] p-4 text-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-sa-gold hover:shadow-pop md:w-[330px]"
                >
                  <div
                    className="mb-4 rounded-[1.35rem] p-5 min-h-[210px] flex flex-col"
                    style={{
                      background:
                        index % 4 === 0 ? "var(--sa-gold)" :
                        index % 4 === 1 ? "var(--sa-red)" :
                        index % 4 === 2 ? "var(--sa-navy)" :
                        "var(--sa-green)",
                      color: index % 4 === 0 ? "var(--sa-dark)" : "#fff",
                    }}
                  >
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-sa-dark">
                          #{index + 1}
                        </span>
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-sa-dark">
                          {b.category}
                        </span>
                      </div>
                      <span className="grid size-9 place-items-center rounded-full bg-white text-sa-dark transition group-hover:rotate-[-12deg]">
                        <ArrowRight className="size-4" strokeWidth={3} />
                      </span>
                    </div>
                    <h3 className="mt-auto font-display text-3xl font-black leading-[0.95]">
                      {b.name}
                    </h3>
                    <p className="mt-3 text-sm font-semibold opacity-78">
                      {b.city}, {b.province}
                    </p>
                  </div>
                  <div className="relative h-48 overflow-hidden rounded-[1.35rem] bg-white/10">
                    {b.image ? (
                      <img
                        src={b.image}
                        alt={`${b.name} work preview`}
                        className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className={cn("absolute inset-0", b.gradient)} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
                      <div className="rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                        {b.rating.toFixed(1)} rating · {b.reviewCount} reviews
                      </div>
                      <div className="grid size-12 place-items-center rounded-full border-[7px] border-[#050505] bg-sa-gold text-sa-dark">
                        <ArrowRight className="size-4" strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {b.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-[11px] font-bold text-white/70">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== LATEST CUSTOMER REQUESTS ========== */}
      <section className="bg-[#101010] border-y border-white/10">
        <div className="container py-20">
          <div className="flex items-end justify-between mb-10">
            <div className="max-w-xl">
              <h2 className="font-display-bold text-3xl md:text-5xl leading-[1.03] text-white">
                Latest customer requests
              </h2>
              <p className="mt-3 text-white/55">Example jobs showing the kinds of requests customers can post on Sjoh.</p>
            </div>
            <Link to="/requests" className="text-sm font-semibold hover:underline hidden md:inline-block text-sa-gold">
              View all requests
            </Link>
          </div>
          <div className="grid lg:grid-cols-3 gap-5">
            {latest.map((o) => (
              <JobCard key={o.id} job={o} />
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA — green section with tilted stat cards ========== */}
      <section className="relative overflow-hidden grid md:grid-cols-2 gap-12 px-8 md:px-14 py-20" style={{ background: "var(--sa-green)" }}>
        <img
          aria-hidden
          src={heroGroup3}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none mix-blend-luminosity"
        />
        <div
          className="absolute pointer-events-none rounded-full opacity-15"
          style={{ width: 500, height: 500, background: "var(--sa-gold)", top: -200, right: -100 }}
        />
        <div
          className="absolute pointer-events-none rounded-full opacity-10"
          style={{ width: 300, height: 300, background: "var(--sa-navy)", bottom: -100, left: "30%" }}
        />
        <div className="relative z-[1]">
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>
            ● For service providers
          </div>
          <h2 className="font-display-bold text-white text-5xl md:text-6xl leading-[1.02] mb-5">
            Do the work.<br />We help customers<br />
            <span className="px-3 py-1 rounded-lg" style={{ background: "var(--sa-gold)", color: "var(--sa-dark)" }}>
              find you.
            </span>
          </h2>
          <p className="text-white/75 text-base leading-relaxed max-w-md mb-8">
            Sjoh gives proper service businesses a professional online reputation: profile, work photos, reviews, quotes, and invoices, without website building, social media admin, or Google Ads confusion.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button size="lg" asChild className="font-bold rounded-full" style={{ background: "var(--sa-gold)", color: "var(--sa-dark)" }}>
              <Link to="/list">List your business <ArrowRight className="size-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="font-bold rounded-full bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Link to="/pricing">See pro pricing</Link>
            </Button>
          </div>
        </div>
        <div className="relative z-[1] flex flex-col gap-4">
          {[
            { num: "1", lbl: "Professional profile", bg: "var(--sa-gold)", color: "var(--sa-dark)", rot: "-1.5deg" },
            { num: "240+", lbl: "Service categories", bg: "var(--sa-navy)", color: "#fff", rot: "1.2deg" },
            { num: "0%", lbl: "Founding commission bonus", bg: "var(--sa-pink)", color: "#fff", rot: "-0.8deg" },
          ].map((s) => (
            <div
              key={s.lbl}
              className="rounded-3xl px-7 py-6 flex items-center gap-6"
              style={{ background: s.bg, color: s.color, transform: `rotate(${s.rot})` }}
            >
              <div className="font-display-bold text-5xl tabular-nums shrink-0">{s.num}</div>
              <div className="text-sm font-semibold opacity-75">{s.lbl}</div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
};

export default HomePage;

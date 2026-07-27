import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search, Star, ArrowRight, CheckCircle2, UsersRound } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { SeoHead } from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { FlameButton } from "@/components/ui/flame-button";
import { JobCard } from "@/components/JobCard";
import { Typewriter } from "@/components/Typewriter";
import { FoundingSpotsBanner } from "@/components/FoundingSpotsBanner";
import { EarlyAccessNotice } from "@/components/EarlyAccessNotice";
import { CATEGORIES, CATEGORY_GROUPS, PROVINCES } from "@/lib/mockData";
import { useBusinesses, useOpportunities } from "@/hooks/useDirectory";
import { getCategoryGroupIcon } from "@/lib/categoryIcons";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import heroGroup1 from "@/assets/optimized/hero-group-1.webp";
import earlyAccessAbstractFrame from "@/assets/optimized/early-access-abstract-frame.webp";
import heroGroup3 from "@/assets/optimized/hero-group-3.webp";
import heroGroup4 from "@/assets/optimized/hero-group-4.webp";

const HERO_PHRASES = [
  "Sjoh! Your husband's DIY is a crime scene. Hire an actual professional.",
  "Sjoh! Cousin's wiring giving you static shocks? Get a real sparky.",
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
  "Find help",
  "Get prices",
  "Choose with confidence",
  "Local businesses",
  "All 9 provinces",
  "Real South Africans",
  "No middleman",
];

const HOW_STEPS = [
  {
    n: "01",
    Icon: Search,
    title: "Tell us what you need",
    body: "Describe the job in a few words.",
    bg: "linear-gradient(150deg, #f7bb3a 0%, #e79b05 100%)",
    glow: "rgba(247, 187, 58, 0.34)",
    color: "#fff",
    rot: "-1.5deg",
  },
  {
    n: "02",
    Icon: UsersRound,
    title: "See local businesses",
    body: "Businesses that can help send you a price.",
    bg: "linear-gradient(150deg, #ef3340 0%, #d9202d 100%)",
    glow: "rgba(239, 51, 64, 0.34)",
    color: "#fff",
    rot: "1.2deg",
  },
  {
    n: "03",
    Icon: Star,
    title: "Check their work",
    body: "Look at photos, reviews, and where they work.",
    bg: "linear-gradient(150deg, #4f79f6 0%, #355edc 100%)",
    glow: "rgba(79, 121, 246, 0.36)",
    color: "#fff",
    rot: "-0.8deg",
  },
  {
    n: "04",
    Icon: CheckCircle2,
    title: "Choose who to call",
    body: "Pick the business that feels right for you.",
    bg: "linear-gradient(150deg, #149a59 0%, #0f7e47 100%)",
    glow: "rgba(20, 154, 89, 0.34)",
    color: "#fff",
    rot: "1.5deg",
  },
];

const FAQ_ITEMS = [
  {
    question: "Do I pay Sjoh to find a business?",
    answer: "No. You contact the business directly and agree on the work and price.",
  },
  {
    question: "What can I use Sjoh for?",
    answer: "Almost any job — from plumbing and cleaning to photography, building, and design.",
  },
  {
    question: "What does a business get?",
    answer: "A simple page where customers can see its work and ask for a price.",
  },
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

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [province, setProvince] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("verified") !== "1") return;

    const needsSignIn = params.get("signin") === "1";
    toast({
      title: "You're in",
      description: needsSignIn
        ? "Your email is confirmed. Log in once to finish opening Sjoh on this device."
        : "Your email is confirmed. Welcome to Sjoh.",
    });

    navigate("/", { replace: true });
  }, [location.search, navigate]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (province) params.set("province", province);
    navigate(`/directory?${params.toString()}`);
  };

  const { data: allBusinesses } = useBusinesses();
  const { data: allOpportunities } = useOpportunities();
  // "Newly listed" rail: strictly newest-first (the directory query sorts
  // verified-first, so re-sort by created_at here), capped at 25. As new
  // businesses join they take the top spot and the 26th-oldest drops off.
  const featured = [...allBusinesses]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 25);
  const latest = allOpportunities.slice(0, 3);
  const popularCatSlugs = ["plumbing", "electrical", "home-cleaning", "garden-services", "mechanics", "web-design"];
  const popularCats = popularCatSlugs
    .map((s) => CATEGORIES.find((c) => c.slug === s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const groupCounts = CATEGORY_GROUPS.map((g) => ({
    ...g,
    subCount: CATEGORIES.filter((c) => c.groupSlug === g.slug).length,
  }));
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
        className="relative overflow-hidden border-b border-white/10"
        style={{
          background:
            "radial-gradient(circle at 12% -18%, rgba(107,124,232,0.2), transparent 36%), radial-gradient(circle at 84% -10%, rgba(232,62,140,0.14), transparent 34%), #050505",
        }}
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
                  className="sjoh-select w-full pl-4 pr-10 py-3.5 text-base font-medium appearance-none"
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

        </div>
      </section>

      <EarlyAccessNotice
        fullBleed
        className="my-0"
        backgroundImage={earlyAccessAbstractFrame}
        title="We’re adding more local businesses."
        body="Sjoh is open early, so some areas may look quiet today. New businesses are joining category by category, and early businesses get extra visibility."
        ctaLabel="Show your business"
        ctaTo="/list"
      />

      {/* ========== SIMPLE EXPLANATION ========== */}
      <section className="border-b border-black/10 bg-[#f6f8fc]">
        <div className="container py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 text-[11px] font-black uppercase tracking-[0.16em] text-sa-green">What is Sjoh?</div>
            <h2 className="font-display-bold text-3xl leading-tight text-sa-dark md:text-5xl">
              Find help. Get prices. Choose with confidence.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-sa-dark/65 md:text-lg">
              Sjoh connects people who need work done with local businesses who can do it.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-2">
            <div className="rounded-[1.5rem] border-2 border-sa-peri/35 bg-white p-6 shadow-card md:p-8">
              <div className="mb-5 inline-flex rounded-full bg-sa-peri/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-sa-peri">If you need help</div>
              <h3 className="font-display-bold text-2xl text-sa-dark md:text-3xl">Find someone for the job.</h3>
              <ol className="mt-6 grid gap-3 text-sm font-medium text-sa-dark/72">
                <li className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-sa-peri text-xs font-black text-white">1</span>Tell us what you need.</li>
                <li className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-sa-peri text-xs font-black text-white">2</span>See local businesses and their prices.</li>
                <li className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-sa-peri text-xs font-black text-white">3</span>Check their work, then choose who to call.</li>
              </ol>
              <Button asChild className="mt-7 rounded-full bg-sa-peri text-white hover:bg-sa-peri/90">
                <Link to="/requests/new">I need help <ArrowRight className="size-4" /></Link>
              </Button>
            </div>

            <div className="rounded-[1.5rem] border-2 border-sa-green/35 bg-white p-6 shadow-card md:p-8">
              <div className="mb-5 inline-flex rounded-full bg-sa-green/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-sa-green">If you run a business</div>
              <h3 className="font-display-bold text-2xl text-sa-dark md:text-3xl">Help new customers find you.</h3>
              <ol className="mt-6 grid gap-3 text-sm font-medium text-sa-dark/72">
                <li className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-sa-green text-xs font-black text-white">1</span>Make your Sjoh page.</li>
                <li className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-sa-green text-xs font-black text-white">2</span>Add your work, services, and areas.</li>
                <li className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-sa-green text-xs font-black text-white">3</span>Get found and receive new requests.</li>
              </ol>
              <Button asChild className="mt-7 rounded-full bg-sa-green text-white hover:bg-sa-green/90">
                <Link to="/list">I run a business <ArrowRight className="size-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== MARQUEE STRIP ========== */}
      <div
        aria-hidden
        className="relative max-w-full overflow-hidden whitespace-nowrap border-y border-black/10 bg-white py-6 md:py-7"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-24 bg-gradient-to-l from-white to-transparent" />
        <div className="inline-flex sa-marquee-track items-center">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((t, i) => (
            <span
              key={i}
              className="font-display-bold inline-flex items-center gap-5 px-8 text-[23px] leading-none tracking-tight text-sa-dark/92 md:text-[29px]"
            >
              {t}
              <span
                className="size-3.5 rotate-45 rounded-[2px] shadow-[0_0_0_2px_rgba(0,0,0,0.04)]"
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
      <section
        className="py-16"
        style={{
          background:
            "radial-gradient(circle at 80% 8%, rgba(107,124,232,0.12), transparent 34%), radial-gradient(circle at 18% 90%, rgba(232,62,140,0.1), transparent 36%), #050505",
        }}
      >
          <div className="relative min-h-[620px] overflow-hidden border-y border-white/10">
            <img
              src={heroGroup1}
              alt="South Africans using Sjoh"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
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
                <div className="mb-4 inline-flex items-center rounded-full border border-white/22 bg-black/55 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-white/95 backdrop-blur-sm drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
                  <span className="mr-2 text-sa-gold">●</span>Real help, close by
                </div>
                  <h2 className="mb-4 font-display-bold text-5xl leading-[0.98] text-white drop-shadow-[0_6px_34px_rgba(0,0,0,0.95)] md:text-7xl">
                  Find help nearby.<br />Choose with <span className="animate-brand-flicker">confidence.</span>
                  </h2>
                  <p className="mt-4 inline-block max-w-xl rounded-xl border border-white/18 bg-black/58 px-4 py-3 text-lg font-medium leading-relaxed text-white/95 backdrop-blur-sm drop-shadow-[0_3px_18px_rgba(0,0,0,0.95)]">
                  Tell us what you need, compare local businesses, and contact the one that feels right.
                </p>
              </div>
            </div>
          </div>
          <div
            className="border-b border-white/10 px-5 py-5 md:px-10 lg:px-14 xl:px-20"
            style={{
              background:
                "linear-gradient(180deg, rgba(7,10,18,0.98) 0%, rgba(5,5,5,0.98) 100%)",
            }}
          >
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { title: "Ask for help", body: "Tell local businesses what job you need done.", cta: "Start here", to: "/requests/new" },
                  { title: "Find a business", body: "Compare work photos, reviews, services, and areas.", cta: "Open directory", to: "/directory" },
                  { title: "Show your business", body: "Make a simple page so new customers can find you.", cta: "List your business", to: "/list" },
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
      <section
        className="py-20"
        style={{
          background:
            "radial-gradient(circle at 15% 6%, rgba(107,124,232,0.11), transparent 36%), radial-gradient(circle at 88% 82%, rgba(11,110,58,0.1), transparent 38%), #101010",
        }}
      >
        <div className="container">
          <div className="mb-10 max-w-2xl">
            <div className="mb-4 w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur-md">
              How to find help
            </div>
            <h2 className="font-display-bold text-4xl leading-[1.03] text-white md:text-6xl">
              Tell us what you need.<br />Choose properly.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/76">
              See local businesses, compare their work and reviews, and move from “who do I call?” to “this is the right person.”
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
            <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05]">
              <img
                src={heroGroup4}
                alt="South Africans using Sjoh to find local services"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/86 via-black/42 to-black/10" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {HOW_STEPS.map((s) => (
                <div
                  key={s.n}
                  className="group relative overflow-hidden rounded-[1.65rem] p-7 flex flex-col gap-3.5 min-h-[250px] border border-white/5 transition-all duration-300 hover:brightness-110 hover:saturate-[1.08] hover:shadow-[0_28px_42px_-24px_rgba(0,0,0,0.9)]"
                  style={{ background: s.bg, color: s.color, transform: `rotate(${s.rot})` }}
                >
                  <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ boxShadow: `inset 0 0 80px ${s.glow}` }} />
                  <span className="pointer-events-none absolute -top-14 -left-14 size-36 rounded-full bg-white/12 blur-2xl opacity-20 transition-opacity duration-300 group-hover:opacity-35" />
                  <div className="flex items-start justify-between">
                    <div className="font-display-bold text-4xl opacity-24">{s.n}</div>
                    <div className="size-11 rounded-xl bg-black/10 grid place-items-center transition-transform duration-300 group-hover:scale-110">
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

      {/* ========== WHAT YOU CAN CHECK + FAQ ========== */}
      <section className="border-y border-white/10 bg-[#050505]">
        <div className="container py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <div className="mb-4 w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                Know before you choose
              </div>
              <h2 className="font-display-bold text-4xl leading-[1.03] text-white md:text-5xl">
                See the things that matter.
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
                Every business page shows the basics, so you can make a better choice before you call.
              </p>
              <div className="mt-7 grid grid-cols-2 gap-3 text-sm font-semibold text-white/80">
                {["Their services", "Their work photos", "Their reviews", "Their service area"].map((item, index) => (
                  <div key={item} className="rounded-xl border border-white/12 bg-white/[0.06] px-3 py-3">
                    <span className="mr-2 text-sa-gold">0{index + 1}</span>{item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {FAQ_ITEMS.map((item) => (
                <details key={item.question} className="group rounded-2xl border border-white/12 bg-white/[0.06] p-5 text-white">
                  <summary className="cursor-pointer list-none pr-5 font-display text-lg font-bold leading-tight marker:hidden group-open:text-sa-gold">
                    {item.question}
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-white/65">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== CATEGORIES GRID ========== */}
      <section
        className="border-b border-black/10"
        style={{
          background:
            "radial-gradient(circle at 10% 10%, rgba(245,166,35,0.13), transparent 30%), radial-gradient(circle at 92% 84%, rgba(107,124,232,0.14), transparent 34%), #f6f8fc",
        }}
      >
        <div className="container py-20">
          <div className="flex items-end justify-between mb-10">
            <div className="max-w-xl">
              <h2 className="font-display-bold text-3xl md:text-5xl leading-[1.03] text-sa-dark">
                Find the right kind of help
              </h2>
              <p className="mt-3 text-sa-dark/65">Search by service, from plumbers and cleaners to photographers and designers.</p>
            </div>
            <Link to="/directory" className="text-sm font-semibold hover:underline hidden md:inline-block text-sa-dark">
              Browse all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {groupCounts.map((g, index) => {
              const Icon = getCategoryGroupIcon(g.slug);
              const accent = CATEGORY_TILE_STYLES[index % CATEGORY_TILE_STYLES.length];
              return (
                <Link
                  key={g.slug}
                  to={`/directory/g/${g.slug}`}
                  className="group relative grid min-h-[172px] overflow-hidden rounded-2xl border p-4 shadow-[0_18px_34px_-24px_rgba(16,24,40,0.45)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_28px_48px_-20px_rgba(16,24,40,0.5)] sm:min-h-0 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-4 sm:p-5"
                  style={{
                    borderColor: `color-mix(in srgb, ${accent} 55%, rgba(255,255,255,0.14))`,
                    background: `linear-gradient(150deg, color-mix(in srgb, ${accent} 88%, white) 0%, color-mix(in srgb, ${accent} 72%, var(--sa-peri)) 58%, color-mix(in srgb, ${accent} 82%, white) 100%)`,
                  }}
                >
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-1.5 opacity-95" style={{ background: `linear-gradient(90deg, ${accent} 0%, color-mix(in srgb, ${accent} 35%, transparent) 65%, transparent 100%)` }} />
                  <span className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full opacity-24 blur-2xl transition-all duration-300 group-hover:opacity-45 group-hover:scale-110" style={{ background: accent }} />
                  <span className="pointer-events-none absolute -bottom-12 -left-12 size-28 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-30" style={{ background: accent }} />
                  <span className="relative flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-all duration-300 group-hover:-rotate-3 group-hover:scale-110">
                    <Icon className="size-5" strokeWidth={2} />
                  </span>
                  <div className="relative mt-3 min-w-0 self-end sm:mt-0 sm:self-auto">
                    <p className="max-w-full break-words pr-1 text-[1.08rem] font-semibold leading-tight text-white transition-colors sm:leading-snug">{g.name}</p>
                    <p className="mt-1.5 inline-flex w-fit items-center rounded-full border border-white/24 bg-white/10 px-2.5 py-0.5 text-[12px] font-semibold text-white/85 tabular-nums">
                      {g.subCount} services
                    </p>
                  </div>
                  <span className="absolute right-4 top-4 text-white/45 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white/80 sm:static sm:ml-auto">→</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== FEATURED PROS RAIL ========== */}
      {featured.length > 0 && (
        <section
          className="py-20 overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 12% 8%, rgba(11,110,58,0.1), transparent 32%), radial-gradient(circle at 88% 12%, rgba(107,124,232,0.12), transparent 34%), #050505",
          }}
        >
          <div className="container">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div className="max-w-3xl">
                <div className="text-[11px] font-bold tracking-[0.1em] uppercase mb-3 text-sa-gold">
                  ● New businesses on Sjoh
                </div>
                <h2 className="font-display-bold text-4xl md:text-6xl leading-[1.02] text-white">
                  Meet businesses that just joined.
                </h2>
                <p className="mt-3 max-w-xl text-white/58">
                  See local businesses that recently made a page on Sjoh.
                </p>
              </div>
            </div>

            <div className="-mx-4 overflow-hidden px-4 pb-4">
              <div className="flex w-max gap-5 biz-gallery-track">
                {[...featured, ...featured].map((b, index) => (
                  <Link
                    key={`${b.id}-${index}`}
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
                          New
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
                        {b.reviewCount > 0
                          ? `${b.rating.toFixed(1)} rating · ${b.reviewCount} review${b.reviewCount === 1 ? "" : "s"}`
                          : "New on Sjoh"}
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
      )}

      {/* ========== LATEST CUSTOMER REQUESTS ========== */}
      {latest.length > 0 && (
        <section
          className="border-y border-black/10"
          style={{
            background:
              "linear-gradient(180deg, #ffffff 0%, #f7f9ff 100%)",
          }}
        >
          <div className="container py-20">
            <div className="mb-9 flex items-end justify-between">
              <div className="max-w-xl">
                <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-sa-dark/70">
                  ● Jobs people need help with
                </div>
                <h2 className="font-display-bold text-3xl md:text-5xl leading-[1.03] text-sa-dark">
                  Jobs people need help with
                </h2>
                <p className="mt-3 text-sa-dark/62">Customers have shared these jobs and are looking for local businesses.</p>
              </div>
              <Link to="/requests" className="text-sm font-semibold hover:underline hidden md:inline-block text-sa-dark">
                View all requests
              </Link>
            </div>
            <div className="rounded-[2rem] border border-black/10 bg-[#f1f4fb] p-4 md:p-5 shadow-[0_24px_54px_-46px_rgba(16,24,40,0.32)]">
              <div className="grid lg:grid-cols-3 gap-5">
                {latest.map((o) => (
                  <JobCard key={o.id} job={o} mixedColors />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========== CTA — green section with tilted stat cards ========== */}
      <section
        className="relative overflow-hidden grid md:grid-cols-2 gap-12 px-8 md:px-14 py-20"
        style={{
          background:
            "linear-gradient(140deg, #060606 0%, #0f1012 48%, #18191c 100%)",
        }}
      >
        <img
          aria-hidden
          src={heroGroup3}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-62 pointer-events-none contrast-110 brightness-85"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/70 pointer-events-none" />
        <div
          className="absolute pointer-events-none rounded-full opacity-12 blur-3xl"
          style={{ width: 520, height: 520, background: "rgba(255,255,255,0.32)", top: -220, right: -120 }}
        />
        <div
          className="absolute pointer-events-none rounded-full opacity-10 blur-3xl"
          style={{ width: 340, height: 340, background: "rgba(255,255,255,0.24)", bottom: -120, left: "30%" }}
        />
        <div className="relative z-[1]">
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>
            ● For businesses
          </div>
          <h2 className="font-display-bold text-white text-5xl md:text-6xl leading-[1.02] mb-5">
            Do the work.<br />Let customers<br />
            <span className="px-3 py-1 rounded-lg" style={{ background: "var(--sa-red)", color: "#fff" }}>
              find you.
            </span>
          </h2>
          <p className="text-white/75 text-base leading-relaxed max-w-md mb-8">
            Sjoh gives your business one simple page for your services, work photos, reviews, prices, and customer requests — without building a website or running ads.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button size="lg" asChild className="font-bold rounded-full" style={{ background: "var(--sa-green)", color: "#fff" }}>
              <Link to="/list">Create your business page <ArrowRight className="size-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="font-bold rounded-full bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Link to="/pricing">See business pricing</Link>
            </Button>
          </div>
        </div>
        <div className="relative z-[1] flex flex-col gap-4">
          {[
            {
              num: "1",
              lbl: "Simple business page",
              bg: "var(--sa-gold)",
              gradient: "linear-gradient(90deg, var(--sa-gold) 0%, #d8a24f 100%)",
              color: "#fff",
              rot: "-1.5deg",
            },
            {
              num: "240+",
              lbl: "Ways customers can find you",
              bg: "var(--sa-navy)",
              gradient: "linear-gradient(90deg, var(--sa-navy) 0%, #0f2f7e 100%)",
              color: "#fff",
              rot: "1.2deg",
            },
            {
              num: "0%",
              lbl: "Commission on jobs",
              bg: "var(--sa-pink)",
              gradient: "linear-gradient(90deg, var(--sa-pink) 0%, #c93482 100%)",
              color: "#fff",
              rot: "-0.8deg",
            },
          ].map((s) => (
            <div
              key={s.lbl}
              className="rounded-3xl px-7 py-6 flex items-center gap-6"
              style={{ background: s.gradient ?? s.bg, color: s.color, transform: `rotate(${s.rot})` }}
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

import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  HandCoins,
  Images,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { SeoHead } from "@/components/SeoHead";
import { LAUNCH_TRIAL_CODE, TrialCodeRedeemer } from "@/components/TrialCodeRedeemer";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/business-landing-hero.jpg";
import phoneImage from "@/assets/business-landing-phone.jpg";
import moneyImage from "@/assets/business-landing-money.jpg";
import workImage from "@/assets/business-landing-work.jpg";
import cityImage from "@/assets/business-landing-city.jpg";

type AvatarLandingConfig = {
  slug: string;
  audience: string;
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  headline: string;
  subhead: string;
  agitationTitle: string;
  agitation: string;
  offerTitle: string;
  offerIntro: string;
  bullets: Array<{ title: string; body: string }>;
  scarcity: string;
  guarantee: string;
  cta: string;
  secondaryCta?: string;
  routeTarget: string;
  image: string;
  accent: string;
  quoteDemo: {
    businessName: string;
    clientName: string;
    quoteTitle: string;
    quoteTotal: string;
    invoiceTotal: string;
    lineItems: Array<[string, string]>;
  };
};

const businessCommon = {
  routeTarget: "/list",
  guarantee:
    "Cancel anytime. No lock-in contracts. Sjoh is for businesses that want to show up properly, quote clearly, and build a reputation customers can trust.",
};

export const AVATAR_LANDING_PAGES: Record<string, AvatarLandingConfig> = {
  trades: {
    slug: "trades",
    audience: "Heavy Trades",
    seoTitle: "Sjoh for plumbers, builders and electricians — get found locally",
    seoDescription:
      "A founding member landing page for South African trade pros who want a professional online reputation, quote tools, invoices and local visibility without tech admin.",
    eyebrow: "Founding member special",
    headline:
      "You do the hard work. We make sure local customers can actually find you.",
    subhead:
      "Sjoh gives proper tradespeople a professional online reputation without the website building, Facebook posting or Google Ads confusion.",
    agitationTitle: "Thirty years of experience should beat a shiny Facebook page.",
    agitation:
      "You might be the most skilled person in your area, but if customers search on their phones and cannot find proof of your work, younger less-experienced operators win the call. Sjoh helps customers see your skill before they ever pick up the phone.",
    offerTitle: "Your R250/month trade toolkit",
    offerIntro:
      "A done-for-you digital reputation: profile, work photos, service areas, quotes, invoices and trust signals built for South African service work.",
    bullets: [
      { title: "Professional profile", body: "Show service areas, photos, credentials, reviews and proof of previous work." },
      { title: "Zero tech-stress", body: "No website building, no social media admin, no local SEO homework. Sjoh gives customers a clean place to find you." },
      { title: "Founding bonus", body: "Because you join early, Sjoh does not take commission from your jobs. You keep the full quote." },
    ],
    scarcity:
      "Founding visibility is limited by category and area while Sjoh opens the marketplace suburb by suburb.",
    cta: "Lock in my trade profile",
    image: workImage,
    accent: "var(--sa-gold)",
    quoteDemo: {
      businessName: "Local Electrical Team",
      clientName: "M. Naidoo",
      quoteTitle: "DB board upgrade + COC",
      quoteTotal: "R 18,750",
      invoiceTotal: "R 18,750",
      lineItems: [
        ["Site assessment and fault tracing", "R 1,250"],
        ["DB board upgrade labour", "R 7,500"],
        ["Materials and compliance certificate", "R 10,000"],
      ],
    },
    ...businessCommon,
  },
  "home-care": {
    slug: "home-care",
    audience: "Home & Care Pros",
    seoTitle: "Sjoh for cleaners, gardeners and pet sitters — build local trust",
    seoDescription:
      "A founding member landing page for South African home and care pros who want a professional online reputation, reviews, quote tools and local visibility.",
    eyebrow: "Early access",
    headline:
      "You already do careful work. Sjoh helps local families find someone they can trust.",
    subhead:
      "Build a simple, professional profile with your services, areas, photos and reviews, without trying to become a marketing person.",
    agitationTitle: "Trust is the job before the job starts.",
    agitation:
      "You can be brilliant at what you do, but customers hesitate when your reputation is trapped in WhatsApp referrals. Sjoh gives your work a proper home so people can see why you are worth booking.",
    offerTitle: "Your R250/month trust engine",
    offerIntro:
      "Make your service easier to find, easier to understand and easier to book, without needing a website or daily social media posts.",
    bullets: [
      { title: "Review-led profile", body: "Show ratings, customer feedback, service areas and repeat-friendly packages." },
      { title: "Local visibility", body: "Appear when people search for cleaners, gardeners, pet sitters and care pros near them." },
      { title: "Founding bonus", body: "Keep the full quote on every job. Sjoh does not take a cut from founding businesses." },
    ],
    scarcity:
      "Early visibility is limited so the first strong providers in each area are easier for customers to notice.",
    cta: "Claim my local profile",
    image: phoneImage,
    accent: "var(--sa-green)",
    quoteDemo: {
      businessName: "Moyo Garden Care",
      clientName: "A. van Wyk",
      quoteTitle: "Weekly garden maintenance",
      quoteTotal: "R 1,850",
      invoiceTotal: "R 1,850",
      lineItems: [
        ["Initial garden cleanup", "R 950"],
        ["Lawn, beds and edging", "R 650"],
        ["Green waste removal", "R 250"],
      ],
    },
    ...businessCommon,
  },
  creatives: {
    slug: "creatives",
    audience: "Creative & Digital Freelancers",
    seoTitle: "Sjoh for photographers, designers and event pros — get found locally",
    seoDescription:
      "A founding member landing page for South African creatives who want local clients, portfolio visibility, professional quotes and invoices.",
    eyebrow: "Exclusive launch",
    headline:
      "Your work is good. Sjoh helps local clients see it, trust it and book it.",
    subhead:
      "Create a local portfolio presence that shows your style, packages, reviews and quote-ready professionalism.",
    agitationTitle: "A great portfolio is useless if local clients never see it.",
    agitation:
      "You can be brilliant and still lose work to someone with better online proof. Sjoh gives South African creatives a clean place to show their work, explain their services and turn interest into a proper quote.",
    offerTitle: "Your R250/month local portfolio system",
    offerIntro:
      "A visual profile, local discovery, quote tools and invoices that help you look polished before the client says yes.",
    bullets: [
      { title: "Portfolio-first profile", body: "Put your best visuals, packages and reviews in front of local buyers." },
      { title: "Professional quoting", body: "Send itemised quotes for shoots, design packages, event work or digital projects." },
      { title: "Founding bonus", body: "Quote the work, deliver the work and keep the full amount. Sjoh does not take commission." },
    ],
    scarcity:
      "Founding creative categories are opening area by area, so early pros get more room to stand out.",
    cta: "Claim my creative market",
    image: heroImage,
    accent: "var(--sa-pink)",
    quoteDemo: {
      businessName: "Langa Studio",
      clientName: "Cape Bloom Events",
      quoteTitle: "Event photography package",
      quoteTotal: "R 7,800",
      invoiceTotal: "R 7,800",
      lineItems: [
        ["4-hour event coverage", "R 4,500"],
        ["Edited gallery delivery", "R 2,300"],
        ["Travel and backup archive", "R 1,000"],
      ],
    },
    ...businessCommon,
  },
  creative: {
    slug: "creative",
    audience: "Creative & Digital Freelancers",
    seoTitle: "Sjoh for photographers, designers and event pros — get found locally",
    seoDescription:
      "A founding member landing page for South African creatives who want local clients, portfolio visibility, professional quotes and invoices.",
    eyebrow: "Exclusive launch",
    headline:
      "Your work is good. Sjoh helps local clients see it, trust it and book it.",
    subhead:
      "Create a local portfolio presence that shows your style, packages, reviews and quote-ready professionalism.",
    agitationTitle: "A great portfolio is useless if local clients never see it.",
    agitation:
      "You can be brilliant and still lose work to someone with better online proof. Sjoh gives South African creatives a clean place to show their work, explain their services and turn interest into a proper quote.",
    offerTitle: "Your R250/month local portfolio system",
    offerIntro:
      "A visual profile, local discovery, quote tools and invoices that help you look polished before the client says yes.",
    bullets: [
      { title: "Portfolio-first profile", body: "Put your best visuals, packages and reviews in front of local buyers." },
      { title: "Professional quoting", body: "Send itemised quotes for shoots, design packages, event work or digital projects." },
      { title: "Founding bonus", body: "Quote the work, deliver the work and keep the full amount. Sjoh does not take commission." },
    ],
    scarcity:
      "Founding creative categories are opening area by area, so early pros get more room to stand out.",
    cta: "Claim my creative market",
    image: heroImage,
    accent: "var(--sa-pink)",
    quoteDemo: {
      businessName: "Langa Studio",
      clientName: "Cape Bloom Events",
      quoteTitle: "Event photography package",
      quoteTotal: "R 7,800",
      invoiceTotal: "R 7,800",
      lineItems: [
        ["4-hour event coverage", "R 4,500"],
        ["Edited gallery delivery", "R 2,300"],
        ["Travel and backup archive", "R 1,000"],
      ],
    },
    ...businessCommon,
  },
  "side-hustle": {
    slug: "side-hustle",
    audience: "Side-Hustlers",
    seoTitle: "Sjoh for side-hustlers — launch a real service profile for R250/month",
    seoDescription:
      "A landing page for South African side-hustlers who want a professional profile, quote tools, invoice tools and local visibility.",
    eyebrow: "Fast-action special",
    headline:
      "Turn your side hustle into something people can actually trust enough to book.",
    subhead:
      "Get a professional Sjoh profile, simple quote tools and invoice-ready credibility without building a whole website first.",
    agitationTitle: "A WhatsApp status is not a business system.",
    agitation:
      "You know you can do the work, but people need proof before they pay. Sjoh gives your side hustle a proper front door, so your first clients can understand what you do and request a quote.",
    offerTitle: "Your R250/month launchpad",
    offerIntro:
      "Start with the basics that make you look real: a profile, photos, service areas, quotes, invoices and reviews.",
    bullets: [
      { title: "Instant credibility", body: "Look like a proper business from day one, even while you are still building." },
      { title: "Quote templates", body: "Respond faster with clean quote and invoice examples instead of awkward back-and-forth." },
      { title: "Local visibility", body: "Get listed where people are already searching for the skill you offer." },
    ],
    scarcity:
      "Early spots are limited by service and suburb while Sjoh builds local demand carefully.",
    cta: "Start my verified business",
    image: moneyImage,
    accent: "var(--sa-peri)",
    quoteDemo: {
      businessName: "After Hours Fix",
      clientName: "T. Mokoena",
      quoteTitle: "Weekend handyman repairs",
      quoteTotal: "R 2,450",
      invoiceTotal: "R 2,450",
      lineItems: [
        ["Door hinge and cupboard repairs", "R 950"],
        ["Wall mounting and patch work", "R 1,100"],
        ["Materials allowance", "R 400"],
      ],
    },
    ...businessCommon,
  },
  customer: {
    slug: "customer",
    audience: "Customers",
    seoTitle: "Find verified local pros on Sjoh — get the job sorted",
    seoDescription:
      "Find South African plumbers, cleaners, builders, creatives and local service pros. Compare profiles, reviews and quotes in one place.",
    eyebrow: "For customers",
    headline:
      "Find the right local pro fast, compare the proof, and get it sorted.",
    subhead:
      "Search by service and area, browse profiles, post a request and compare quotes without chasing five WhatsApp groups.",
    agitationTitle: "Finding someone reliable should not feel like detective work.",
    agitation:
      "Random referrals, vague Facebook replies and disappearing contractors make simple jobs stressful. Sjoh gives you one place to see who does what, where they work and why other people trust them.",
    offerTitle: "Your simpler way to find help",
    offerIntro:
      "Search the directory, post one request and compare local pros before choosing who to contact.",
    bullets: [
      { title: "Browse by service", body: "Find plumbers, cleaners, builders, creatives and more across South Africa." },
      { title: "Compare profiles", body: "Look at reviews, photos, work areas and clear service details before you choose." },
      { title: "Request quotes", body: "Tell Sjoh what you need once, then compare responses from interested pros." },
    ],
    scarcity:
      "The best local pros book out fast. Start building your shortlist before the next urgent job lands.",
    guarantee:
      "The Sjoh Standard: profiles, reviews and trust signals are designed to make choosing easier. Poor-quality providers can lose visibility or be removed.",
    cta: "Search for a pro",
    secondaryCta: "Post a job",
    routeTarget: "/directory",
    image: cityImage,
    accent: "var(--sa-gold)",
    quoteDemo: {
      businessName: "Example local pro",
      clientName: "You",
      quoteTitle: "Quote comparison preview",
      quoteTotal: "R 3,500",
      invoiceTotal: "R 3,500",
      lineItems: [
        ["Labour and callout", "R 1,500"],
        ["Materials estimate", "R 1,650"],
        ["Cleanup and handover", "R 350"],
      ],
    },
  },
};

const palette = ["var(--sa-gold)", "var(--sa-green)", "var(--sa-peri)", "var(--sa-red)", "var(--sa-pink)"];

const QuoteInvoiceDemo = ({ quoteDemo: demo, accent }: Pick<AvatarLandingConfig, "quoteDemo" | "accent">) => (
  <div className="grid gap-4 lg:grid-cols-2">
    <div className="rounded-[1.75rem] border border-white/12 bg-white p-5 text-sa-dark shadow-[0_18px_70px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between gap-4 border-b border-sa-dark/10 pb-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: accent }}>
            Quote
          </p>
          <h3 className="mt-2 text-2xl font-black">{demo.quoteTitle}</h3>
          <p className="mt-1 text-sm text-sa-dark/55">Prepared by {demo.businessName}</p>
        </div>
        <span className="rounded-full bg-sa-dark px-3 py-1.5 text-xs font-black text-white">Draft</span>
      </div>
      <div className="mt-5 space-y-3">
        {demo.lineItems.map(([item, amount]) => (
          <div key={item} className="flex items-center justify-between gap-3 rounded-2xl bg-sa-dark/[0.04] px-4 py-3">
            <span className="text-sm font-semibold">{item}</span>
            <span className="text-sm font-black">{amount}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-end justify-between rounded-2xl px-4 py-4 text-white" style={{ background: accent }}>
        <span className="text-xs font-black uppercase tracking-[0.18em]">Quote total</span>
        <span className="text-3xl font-black">{demo.quoteTotal}</span>
      </div>
    </div>

    <div className="rounded-[1.75rem] border border-white/12 bg-[#111] p-5 text-white shadow-[0_18px_70px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sa-green">Invoice</p>
          <h3 className="mt-2 text-2xl font-black">Ready to email</h3>
          <p className="mt-1 text-sm text-white/50">To {demo.clientName}</p>
        </div>
        <FileText className="size-8" style={{ color: accent }} />
      </div>
      <div className="mt-5 rounded-3xl bg-white/[0.06] p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/58">Amount due</span>
          <span className="text-4xl font-black">{demo.invoiceTotal}</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-white/[0.06] p-3">
            <p className="text-white/45">Status</p>
            <p className="mt-1 font-black text-sa-gold">Awaiting payment</p>
          </div>
          <div className="rounded-2xl bg-white/[0.06] p-3">
            <p className="text-white/45">Sent via</p>
            <p className="mt-1 font-black">Email link</p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-white/55">
        The customer receives the quote or invoice by email with a secure view link, so the business stays polished without manual attachments.
      </p>
    </div>
  </div>
);

const AvatarLanding = () => {
  const { avatarSlug } = useParams();
  const config = avatarSlug ? AVATAR_LANDING_PAGES[avatarSlug] : null;

  if (!config) return <Navigate to="/for-businesses" replace />;

  const isCustomer = config.slug === "customer";

  return (
    <SiteLayout>
      <SeoHead
        title={config.seoTitle}
        description={config.seoDescription}
        canonical={`https://sjoh.co.za/for-businesses/${config.slug}`}
      />
      <div className="bg-[#050505] text-white">
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="absolute left-[-10rem] top-20 size-[30rem] rounded-full blur-3xl" style={{ background: `${config.accent}33` }} />
          <div className="container relative grid min-h-[calc(100vh-9rem)] items-center gap-12 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-black/30 px-4 py-2 text-xs font-black uppercase tracking-[0.2em]" style={{ borderColor: `${config.accent}88`, color: config.accent }}>
                <Sparkles className="size-4" />
                {config.eyebrow}
              </div>
              <h1 className="mt-7 max-w-4xl font-display text-5xl font-black leading-[0.92] tracking-normal text-balance md:text-7xl xl:text-8xl">
                {config.headline}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70 md:text-xl">{config.subhead}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button size="xl" asChild className="rounded-full text-sa-dark hover:brightness-95" style={{ background: config.accent }}>
                  <Link to={config.routeTarget}>
                    {config.cta}
                    <ArrowRight className="size-5" />
                  </Link>
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  asChild
                  className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to={isCustomer ? "/requests/new" : "#quote-demo"}>{config.secondaryCta || "See quote demo"}</Link>
                </Button>
              </div>
              <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-5">
                {["R250/month", `${LAUNCH_TRIAL_CODE} trial`, "Profile", "Quotes", "Invoices"].map((item, index) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white/80"
                    style={{ borderTopColor: palette[index] }}
                  >
                    {isCustomer && index < 2 ? ["Search fast", "Compare proof"][index] : item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
                <img src={config.image} alt="" className="aspect-[4/3] w-full rounded-[1.45rem] object-cover" />
              </div>
              <div className="absolute -bottom-7 right-4 max-w-xs rounded-3xl border border-white/20 bg-[#111]/90 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur md:right-8">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl text-sa-dark" style={{ background: config.accent }}>
                    <CheckCircle2 className="size-6" />
                  </span>
                  <div>
                    <p className="text-2xl font-black">{isCustomer ? "Fast" : "0%"}</p>
                    <p className="text-sm text-white/65">{isCustomer ? "find the right pro" : "local customers can find you"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 py-20">
          <div className="container grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid grid-cols-2 gap-4">
              <img src={phoneImage} alt="" className="h-72 w-full rounded-3xl object-cover" />
              <img src={moneyImage} alt="" className="mt-10 h-72 w-full rounded-3xl object-cover" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: config.accent }}>
                Why this matters
              </p>
              <h2 className="mt-4 max-w-3xl font-display text-4xl font-black leading-none md:text-6xl">
                {config.agitationTitle}
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">{config.agitation}</p>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 py-20">
          <div className="container">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: config.accent }}>
                {config.offerTitle}
              </p>
              <h2 className="mt-4 font-display text-4xl font-black leading-none md:text-6xl">
                {config.offerIntro}
              </h2>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {config.bullets.map((item, index) => (
                <div key={item.title} className="rounded-3xl border bg-white/[0.035] p-6" style={{ borderColor: `${palette[index + 1]}aa` }}>
                  <span className="flex size-12 items-center justify-center rounded-2xl border bg-black" style={{ borderColor: palette[index + 1], color: palette[index + 1] }}>
                    {[Search, Images, HandCoins][index] ? (() => {
                      const Icon = [Search, Images, HandCoins][index];
                      return <Icon className="size-6" />;
                    })() : <BadgeCheck className="size-6" />}
                  </span>
                  <h3 className="mt-6 text-2xl font-black text-white">{item.title}</h3>
                  <p className="mt-3 leading-7 text-white/62">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="quote-demo" className="border-b border-white/10 py-20">
          <div className="container">
            <div className="mb-10 max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: config.accent }}>
                Quote and invoice demo
              </p>
              <h2 className="mt-4 font-display text-4xl font-black leading-none md:text-6xl">
                Show up like a proper business before the customer says yes.
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/62">
                Every page includes a realistic example of how a quote can become an invoice inside Sjoh.
                No awkward PDF chasing, no messy screenshots, just a secure email link.
              </p>
            </div>
            <QuoteInvoiceDemo quoteDemo={config.quoteDemo} accent={config.accent} />
          </div>
        </section>

        <section className="relative overflow-hidden border-b border-white/10 py-20">
          <img src={cityImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/90 to-[#050505]/70" />
          <div className="container relative grid gap-8 lg:grid-cols-[1fr_26rem]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: config.accent }}>
                Founding window
              </p>
              <h2 className="mt-4 max-w-4xl font-display text-4xl font-black leading-none md:text-6xl">
                {config.scarcity}
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">{config.guarantee}</p>
            </div>
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur">
              <p className="text-sm font-black uppercase tracking-[0.18em]" style={{ color: config.accent }}>
                {config.audience}
              </p>
              <div className="mt-5 flex items-end gap-2">
                <span className="font-display text-6xl font-black">{isCustomer ? "Free" : "R250"}</span>
                {!isCustomer && <span className="mb-3 text-white/62">/month</span>}
              </div>
              {!isCustomer && <TrialCodeRedeemer className="mt-5" compact />}
              <div className="mt-5 space-y-3">
                {[
                  isCustomer ? "Search local pros" : "Professional profile",
                  isCustomer ? "Compare reviews" : "Done-for-you visibility",
                  isCustomer ? "Post one request" : "Quote request access",
                  isCustomer ? "Choose who you trust" : "0% commission bonus",
                ].map((item) => (
                  <p key={item} className="flex items-center gap-3 text-sm font-semibold text-white/78">
                    <ShieldCheck className="size-5 text-sa-green" />
                    {item}
                  </p>
                ))}
              </div>
              <Button size="xl" asChild className="mt-8 w-full rounded-full text-sa-dark hover:brightness-95" style={{ background: config.accent }}>
                <Link to={config.routeTarget}>
                  {config.cta}
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                [BriefcaseBusiness, "Profile"],
                [FileText, "Quotes"],
                [Star, "Reviews"],
                [UsersRound, "Local demand"],
              ].map(([Icon, label], index) => {
                const TypedIcon = Icon as typeof BriefcaseBusiness;
                return (
                  <div key={label as string} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                    <TypedIcon className="size-7" style={{ color: palette[index] }} />
                    <p className="mt-5 text-xl font-black">{label as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
};

export default AvatarLanding;

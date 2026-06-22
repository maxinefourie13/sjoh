import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  HandCoins,
  Images,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { SeoHead } from "@/components/SeoHead";
import { TrialCodeRedeemer } from "@/components/TrialCodeRedeemer";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/optimized/business-landing-hero.webp";
import phoneImage from "@/assets/optimized/business-landing-phone.webp";
import moneyImage from "@/assets/optimized/business-landing-money.webp";
import workImage from "@/assets/optimized/business-landing-work.webp";
import cityImage from "@/assets/optimized/business-landing-city.webp";

const included = [
  {
    icon: Search,
    title: "A searchable business profile",
    body: "Show your services, areas, photos, badges, and contact details in one clean place.",
    color: "text-sa-gold border-sa-gold",
  },
  {
    icon: BriefcaseBusiness,
    title: "Real quote requests",
    body: "Customers tell Sjoh what they need, then relevant local pros can respond from the dashboard.",
    color: "text-sa-red border-sa-red",
  },
  {
    icon: FileText,
    title: "Quotes and invoices",
    body: "Create professional documents that match the job and send them through the platform by email.",
    color: "text-sa-peri border-sa-peri",
  },
  {
    icon: Star,
    title: "Reviews that build trust",
    body: "Collect proof of good work so customers can compare you with confidence.",
    color: "text-sa-pink border-sa-pink",
  },
  {
    icon: Images,
    title: "Portfolio space",
    body: "Add the work that sells you best, from before-and-after photos to finished projects.",
    color: "text-sa-green border-sa-green",
  },
  {
    icon: HandCoins,
    title: "Founding bonus",
    body: "Join early and keep the full quote on every job. Sjoh does not take commission.",
    color: "text-sa-gold border-sa-gold",
  },
];

const earlyReasons = [
  "Get visible before your category gets crowded.",
  "Build reviews while the marketplace is still opening up.",
  "Help customers learn to search for proper pros instead of begging WhatsApp groups.",
  "Lock into the first wave while Sjoh is still onboarding founding businesses.",
];

const faqs = [
  {
    q: "What happens after I sign up?",
    a: "You create your business profile, choose your service categories and areas, add work photos, and start appearing in the Sjoh directory. When customer requests match your work, you can respond with a quote.",
  },
  {
    q: "Is it really 0% commission?",
    a: "Yes. Sjoh does not take a cut from your jobs. Your monthly plan gives you the tools and visibility; the money from the work stays with you.",
  },
  {
    q: "Why join while Sjoh is still early?",
    a: "Because early businesses get more room to stand out. You can claim your place in your category, build trust signals, and be ready when customer demand grows.",
  },
  {
    q: "Do I need a website already?",
    a: "No. Your Sjoh profile can work like a simple business page with your services, areas, gallery, reviews, and contact details.",
  },
];

const BusinessLanding = () => {
  return (
    <SiteLayout>
      <SeoHead
        title="List your business on Sjoh — get found by local customers"
        description="Get your South African service business found on Sjoh. R250/month for a professional profile, quote requests, reviews, invoices, and early category visibility."
        canonical="https://sjoh.co.za/for-businesses"
      />
      <div className="bg-[#050505] text-white">
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="absolute left-[-12rem] top-20 size-[28rem] rounded-full bg-sa-pink/20 blur-3xl" />
          <div className="absolute right-[-10rem] bottom-0 size-[30rem] rounded-full bg-sa-peri/20 blur-3xl" />

          <div className="container relative grid min-h-[calc(100vh-9rem)] items-center gap-12 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sa-gold/50 bg-sa-gold/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-sa-gold">
                <Sparkles className="size-4" />
                Founding business offer
              </div>
              <h1 className="mt-7 max-w-4xl font-display text-4xl font-black leading-[0.98] tracking-normal text-balance sm:text-5xl md:text-7xl md:leading-[0.92] xl:text-8xl">
                You do the hard work. We make sure local customers can actually find you.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70 md:text-xl">
                Sjoh gives proper service businesses a professional online reputation without the
                website building, Facebook posting, local SEO homework, or Google Ads confusion.
                Get listed early with a <strong className="text-white">30-day PayFast-backed trial</strong> and claim
                visibility while your category is still opening up. After that, Verified Pro is <strong className="text-white">R250/month</strong>.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button size="xl" asChild className="rounded-full bg-sa-gold text-sa-dark hover:bg-sa-gold/90">
                  <Link to="/list">
                    Claim your early spot
                    <ArrowRight className="size-5" />
                  </Link>
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  asChild
                  className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <a href="#included">See what you get</a>
                </Button>
              </div>

              <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-5">
                {["R0 today", "30-day trial", "Quotes", "Invoices", "Reviews"].map((item, index) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white/80"
                    style={{
                      borderTopColor: ["var(--sa-gold)", "var(--sa-green)", "var(--sa-peri)", "var(--sa-red)", "var(--sa-pink)"][index],
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
              <TrialCodeRedeemer className="mt-5 max-w-2xl" compact />
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-12 z-10 hidden rotate-[-6deg] rounded-3xl border border-black bg-sa-gold px-5 py-4 text-sa-dark shadow-[8px_8px_0_rgba(0,0,0,0.45)] md:block">
                <p className="text-xs font-black uppercase tracking-[0.18em]">First wave</p>
                <p className="mt-1 max-w-40 text-lg font-black leading-tight">
                  Build your presence before the rush.
                </p>
              </div>
              <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
                <img
                  src={heroImage}
                  alt="A cheerful group representing the Sjoh South African community"
                  className="aspect-[4/3] w-full rounded-[1.45rem] object-cover"
                  decoding="async"
                />
              </div>
              <div className="absolute -bottom-7 right-4 max-w-xs rounded-3xl border border-white/20 bg-[#111]/90 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur md:right-8">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-sa-green text-white">
                    <CheckCircle2 className="size-6" />
                  </span>
                  <div>
                    <p className="text-2xl font-black">0%</p>
                    <p className="text-sm text-white/65">commission founding bonus</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 py-20">
          <div className="container grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid grid-cols-2 gap-4">
              <img src={phoneImage} alt="" className="h-72 w-full rounded-3xl object-cover" loading="lazy" decoding="async" />
              <img src={moneyImage} alt="" className="mt-10 h-72 w-full rounded-3xl object-cover" loading="lazy" decoding="async" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-sa-pink">The shift</p>
              <h2 className="mt-4 max-w-3xl font-display text-4xl font-black leading-none md:text-6xl">
                South African services are moving from “I know a guy” to “I found the right pro.”
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
                Customers are tired of asking five WhatsApp groups. Good pros are tired of being
                invisible unless someone forwards their number. Sjoh gives your skill a proper
                digital home so people can see your work, your area, your reviews and your quote
                process before they call.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {earlyReasons.map((reason) => (
                  <div key={reason} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <BadgeCheck className="mt-0.5 size-5 shrink-0 text-sa-gold" />
                    <p className="text-sm font-semibold leading-6 text-white/78">{reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="included" className="border-b border-white/10 py-20">
          <div className="container">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-sa-gold">For R250/month</p>
              <h2 className="mt-4 font-display text-4xl font-black leading-none md:text-6xl">
                Everything you need to look legitimate online without becoming a marketing person.
              </h2>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {included.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className={`rounded-3xl border bg-white/[0.035] p-6 ${item.color}`}>
                    <span className={`flex size-12 items-center justify-center rounded-2xl border bg-black ${item.color}`}>
                      <Icon className="size-6" />
                    </span>
                    <h3 className="mt-6 text-2xl font-black text-white">{item.title}</h3>
                    <p className="mt-3 leading-7 text-white/62">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 py-20">
          <div className="container grid gap-10 lg:grid-cols-[1fr_0.95fr]">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
              <img src={workImage} alt="" className="h-[28rem] w-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div className="self-center">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-sa-green">How it feels</p>
              <h2 className="mt-4 font-display text-4xl font-black leading-none md:text-6xl">
                Less chasing. More quoting. Better proof.
              </h2>
              <div className="mt-8 grid gap-4">
                {[
                  ["Old way", "Your reputation lives in screenshots, referrals, and missed calls."],
                  ["Sjoh way", "Your profile, reviews, work photos, quotes, invoices, and service areas work together."],
                  ["Customer benefit", "They understand what you do and why they can trust you before they contact you."],
                  ["Business benefit", "You spend less time explaining from scratch and more time winning the right jobs."],
                ].map(([title, body], index) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: ["var(--sa-red)", "var(--sa-gold)", "var(--sa-peri)", "var(--sa-green)"][index] }}>
                      {title}
                    </p>
                    <p className="mt-2 text-lg font-semibold leading-7 text-white/82">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-b border-white/10 py-20">
          <img src={cityImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/88 to-[#050505]/65" />
          <div className="container relative grid gap-8 lg:grid-cols-[1fr_26rem]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-sa-peri">Founding window</p>
              <h2 className="mt-4 max-w-4xl font-display text-4xl font-black leading-none md:text-6xl">
                We are onboarding the first serious service businesses before the customer push gets louder.
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
                This is for plumbers, electricians, photographers, mechanics, cleaners, designers,
                movers, landscapers, and every proper pro who wants to be easy to find and easy to trust.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-sa-gold">Founding business plan</p>
              <div className="mt-5 flex items-end gap-2">
                <span className="font-display text-6xl font-black">R250</span>
                <span className="mb-3 text-white/62">/month</span>
              </div>
              <div className="mt-5 space-y-3">
                {["Professional profile", "Directory listing", "Quote request access", "Quotes and invoices", "0% commission founding bonus"].map((item) => (
                  <p key={item} className="flex items-center gap-3 text-sm font-semibold text-white/78">
                    <ShieldCheck className="size-5 text-sa-green" />
                    {item}
                  </p>
                ))}
              </div>
              <Button size="xl" asChild className="mt-8 w-full rounded-full bg-sa-gold text-sa-dark hover:bg-sa-gold/90">
                <Link to="/list">
                  List your business
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
              <p className="mt-4 text-center text-xs leading-5 text-white/48">
                Early access marketplace. Some categories may look quiet while founding businesses join.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 py-20">
          <div className="container">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-sa-pink">Quick answers</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                  <h3 className="text-xl font-black text-white">{faq.q}</h3>
                  <p className="mt-3 leading-7 text-white/62">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white text-sa-dark">
              <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                <div className="p-8 md:p-12">
                  <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-sa-pink">
                    <UsersRound className="size-5" />
                    Built for local pros
                  </div>
                  <h2 className="mt-5 font-display text-4xl font-black leading-none md:text-6xl">
                    Get found before your competitors do.
                  </h2>
                  <p className="mt-5 text-lg leading-8 text-sa-dark/70">
                    R250/month. Professional online visibility. Built for South African service
                    businesses that are ready to be seen, compared, chosen, and reviewed properly.
                  </p>
                  <Button size="xl" asChild className="mt-8 rounded-full bg-sa-dark text-white hover:bg-sa-dark/90">
                    <Link to="/list">
                      Claim your spot
                      <ArrowRight className="size-5" />
                    </Link>
                  </Button>
                </div>
                <div className="relative min-h-[24rem] bg-sa-gold">
                  <img src={phoneImage} alt="" className="absolute inset-0 h-full w-full object-cover mix-blend-multiply opacity-70" loading="lazy" decoding="async" />
                  <div className="absolute left-6 top-6 rounded-full bg-white px-4 py-2 text-sm font-black text-sa-dark">
                    <MapPin className="mr-2 inline size-4" />
                    All 9 provinces
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
};

export default BusinessLanding;

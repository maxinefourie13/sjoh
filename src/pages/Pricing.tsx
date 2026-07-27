import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  CreditCard,
  FileText,
  HandCoins,
  Images,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { SeoHead } from "@/components/SeoHead";
import { TrialCodeRedeemer } from "@/components/TrialCodeRedeemer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SJOH_TIERS, formatRand } from "@/lib/mockData";
import { payments } from "@/lib/payments";
import { useAuth } from "@/hooks/useAuth";

const stack = [
  {
    icon: Search,
    title: "Verified public profile",
    value: "Profile setup value",
    body: "A searchable business page with your services, areas, photos, badges, reviews and contact details in one place.",
    color: "var(--sa-gold)",
  },
  {
    icon: FileText,
    title: "Quote and invoice toolkit",
    value: "Admin toolkit",
    body: "Send professional quotes and invoices that make you look organised before the customer says yes.",
    color: "var(--sa-peri)",
  },
  {
    icon: Star,
    title: "Review and trust engine",
    value: "Reputation builder",
    body: "Collect proof of good work so customers can choose you for more than just the cheapest price.",
    color: "var(--sa-pink)",
  },
  {
    icon: HandCoins,
    title: "Founding 0% commission bonus",
    value: "Locked in early",
    body: "Clients pay you directly for the job. Sjoh does not take a cut of your quote, invoice or payout.",
    color: "var(--sa-green)",
  },
];

const included = [
  "Public business profile customers can actually find",
  "Service categories, work areas and portfolio photos",
  "Customer job requests and opportunity browsing",
  "Professional quotes and invoices",
  "Review collection and reputation signals",
  "PayFast subscription billing",
  "Founding-business 0% commission bonus",
];

const proofPoints = [
  { label: "Monthly plan", value: "R250", color: "var(--sa-gold)" },
  { label: "Commission on jobs", value: "0%", color: "var(--sa-green)" },
  { label: "Card-backed trial", value: "30d", color: "var(--sa-peri)" },
  { label: "Founding spots", value: "500", color: "var(--sa-pink)" },
];

const faqs = [
  {
    q: "What am I actually paying for?",
    a: "You are paying for your Sjoh Verified Pro access: a public profile, customer discovery, opportunity access, quotes, invoices, trust signals and review tools. The job money itself stays between you and the customer.",
  },
  {
    q: "Do I need to understand websites, SEO or ads?",
    a: "No. That is the point. Sjoh gives your business a proper online presence without asking you to build a website, run Google Ads or become a social media person.",
  },
  {
    q: "How does the 30-day trial work?",
    a: "Create your account and set up your card securely through PayFast. We charge just R5 today to confirm your card works. Sjoh starts charging R250/month after 30 days unless you cancel before then.",
  },
  {
    q: "Do you take commission on the work I do?",
    a: "No. Customers pay you directly for the work. Sjoh does not receive, hold, split or disburse the money for the underlying service job.",
  },
  {
    q: "Why is this limited to founding businesses?",
    a: "Sjoh is opening category by category and area by area. We are limiting the first wave so early businesses have room to stand out while customer demand grows.",
  },
  {
    q: "Can I cancel any time?",
    a: "Yes. It is month-to-month. Cancel from your dashboard or contact support. Your listing remains active until the end of the paid billing period.",
  },
];

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const tier = SJOH_TIERS[0];

  const handleStart = () => {
    if (!user) {
      navigate(`/register?next=${encodeURIComponent("/pricing")}`);
      return;
    }

    payments.startTrialSubscription("verified_pro", "monthly", 30);
  };

  return (
    <SiteLayout>
      <SeoHead
        title="Sjoh pricing — R250/month for Verified Pro"
        description="Sjoh Verified Pro is R250/month for South African service businesses: profile, quotes, invoices, reviews, local visibility and 0% commission on jobs."
        canonical="https://sjoh.co.za/pricing"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      <div className="bg-[#050505] text-white">
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="container relative grid min-h-[calc(100vh-9rem)] items-center gap-10 py-14 md:py-20 lg:grid-cols-[1fr_0.92fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sa-gold/45 bg-sa-gold/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-sa-gold">
                <Sparkles className="size-4" />
                Founding business pricing
              </div>

              <h1 className="mt-7 max-w-5xl font-display text-4xl font-black leading-[0.98] tracking-normal text-balance sm:text-5xl md:text-7xl md:leading-[0.92] xl:text-8xl">
                You do the work. We make sure local customers can find you.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68 md:text-xl">
                Sjoh gives South African service providers a professional online reputation, quote tools,
                invoices and trust signals without the website building, Facebook admin or Google Ads confusion.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button size="xl" onClick={handleStart} className="rounded-full bg-sa-gold text-sa-dark hover:bg-sa-gold/90">
                  Start 30-day trial
                  <ArrowRight className="size-5" />
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  asChild
                  className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to="/list">Create profile first</Link>
                </Button>
              </div>

              <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {proofPoints.map((point) => (
                  <div key={point.label} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                    <p className="font-display text-2xl font-black" style={{ color: point.color }}>
                      {point.value}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/52">
                      {point.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="relative">
              <div className="rounded-[2rem] border border-white/15 bg-white/[0.06] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur">
                <div className="rounded-[1.5rem] bg-[#101010] p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-sa-peri">Verified Pro</p>
                      <h2 className="mt-2 font-display text-3xl font-black">Local Authority Launchpad</h2>
                    </div>
                    <span className="rounded-full bg-sa-green px-3 py-1 text-xs font-black text-white">
                      0% cut
                    </span>
                  </div>

                  <div className="mt-7 rounded-3xl bg-white text-sa-dark p-6">
                    <div className="flex items-end gap-2">
                      <span className="font-display text-6xl font-black tracking-tight">
                        {formatRand(tier.price)}
                      </span>
                      <span className="mb-2 text-sm font-semibold text-ink-2">/month</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-2">
                      Month-to-month access. No commission on jobs. Customers pay you directly.
                    </p>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {included.slice(0, 6).map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-white/78">
                        <Check className="mt-0.5 size-4 shrink-0 text-sa-gold" strokeWidth={3} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <TrialCodeRedeemer className="mt-7" compact />

                  <Button size="lg" className="mt-7 h-14 w-full rounded-full text-base font-black" onClick={handleStart}>
                    Start 30-day trial with PayFast
                  </Button>

                  <p className="mt-3 text-center text-xs text-white/45">
                    R5 today to check your card. PayFast stores it securely and starts R250/month after 30 days.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-b border-white/10 py-16 md:py-20">
          <div className="container">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-sa-pink">The real offer</p>
              <h2 className="mt-4 font-display text-4xl font-black leading-none md:text-6xl">
                Not a listing. A working business presence.
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/64">
                Your skill might already be solid. The problem is that customers need to see proof before they call.
                Sjoh turns that proof into a profile, a quote trail and a cleaner way to get hired.
              </p>
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-4">
              {stack.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 transition hover:-translate-y-1 hover:bg-white/[0.07]">
                    <span
                      className="flex size-12 items-center justify-center rounded-2xl text-sa-dark"
                      style={{ backgroundColor: item.color }}
                    >
                      <Icon className="size-6" strokeWidth={2.5} />
                    </span>
                    <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-white/42">
                      {item.value}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-black leading-tight">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/62">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 py-16 md:py-20">
          <div className="container grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-7 md:p-9">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-sa-gold">Why founding pricing matters</p>
              <h2 className="mt-4 font-display text-4xl font-black leading-none md:text-5xl">
                We are keeping the first wave tight on purpose.
              </h2>
              <p className="mt-5 text-base leading-7 text-white/64">
                The goal is not to flood every category with random listings. Sjoh is opening carefully so early
                businesses can build visibility, reviews and trust while the marketplace fills up.
              </p>
              <div className="mt-7 rounded-3xl border border-sa-gold/40 bg-sa-gold/10 p-5">
                <p className="font-display text-3xl font-black text-sa-gold">500 founding businesses</p>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  Once a category or area is full, new businesses may need to wait while we balance supply and demand.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: BriefcaseBusiness, title: "For established pros", body: "You already do good work. Sjoh helps people find it and trust it before they call.", color: "var(--sa-green)" },
                { icon: Images, title: "For visual work", body: "Show before-and-after photos, event galleries, project images and packages in one place.", color: "var(--sa-pink)" },
                { icon: MapPin, title: "For local demand", body: "Tie your profile to the areas you actually serve, instead of shouting into the whole internet.", color: "var(--sa-peri)" },
                { icon: ShieldCheck, title: "For trust", body: "Reviews, portfolio photos and profile details help serious pros separate from fly-by-night operators.", color: "var(--sa-gold)" },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
                    <span className="flex size-11 items-center justify-center rounded-2xl text-sa-dark" style={{ backgroundColor: item.color }}>
                      <Icon className="size-5" strokeWidth={2.5} />
                    </span>
                    <h3 className="mt-5 font-display text-2xl font-black">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/62">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 py-16 md:py-20">
          <div className="container grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-sa-peri">What it looks like in practice</p>
              <h2 className="mt-4 font-display text-4xl font-black leading-none md:text-6xl">
                Quote properly. Invoice clearly. Keep the whole job.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/64">
                Sjoh does not need to touch the customer’s job payment. The platform helps you look professional,
                document the work and win trust. The money for the service stays direct between you and the client.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={handleStart} className="rounded-full bg-sa-gold text-sa-dark hover:bg-sa-gold/90">
                  Get Verified Pro
                  <ArrowRight className="size-5" />
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  <Link to="/for-businesses">See business landing page</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/12 bg-white/[0.06] p-4">
              <div className="rounded-[1.5rem] bg-white p-5 text-sa-dark">
                <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Quote preview</p>
                    <h3 className="mt-1 font-display text-2xl font-black">Gate motor repair</h3>
                    <p className="text-sm text-ink-2">Northcliff customer</p>
                  </div>
                  <div className="rounded-2xl bg-sa-gold px-4 py-3 text-right">
                    <p className="text-[10px] font-black uppercase tracking-wider">Total</p>
                    <p className="font-display text-2xl font-black">R3 500</p>
                  </div>
                </div>

                <div className="space-y-3 py-5">
                  {[
                    ["Call-out and inspection", "R650"],
                    ["Motor repair and parts", "R2 350"],
                    ["Testing and handover", "R500"],
                  ].map(([label, price]) => (
                    <div key={label} className="flex items-center justify-between rounded-2xl bg-[#F7F8FC] px-4 py-3 text-sm">
                      <span className="font-semibold">{label}</span>
                      <span className="font-display font-black">{price}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-sa-green/10 p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-sa-green">Sjoh commission</p>
                    <p className="mt-1 font-display text-3xl font-black">R0</p>
                  </div>
                  <div className="rounded-2xl bg-sa-peri/10 p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-sa-peri">Client pays</p>
                    <p className="mt-1 font-display text-3xl font-black">You</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-sa-gold">Simple start</p>
              <h2 className="mt-4 font-display text-4xl font-black leading-none md:text-5xl">
                Try it for 30 days. Then decide if you want to stay.
              </h2>
              <p className="mt-5 text-base leading-7 text-white/64">
                Add your card securely through PayFast, build your profile, test the tools and see the flow.
                Sjoh only starts charging R250/month after the 30-day trial.
              </p>
              <div className="mt-7 rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                <div className="flex items-start gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sa-peri text-white">
                    <CreditCard className="size-6" strokeWidth={2.5} />
                  </span>
                  <div>
                    <p className="font-display text-xl font-black">Card now. Charge later.</p>
                    <p className="mt-1 text-sm leading-6 text-white/62">
                      PayFast handles the card securely. Have a Sjoh-issued launch code? You can still redeem it after signup.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Accordion type="single" collapsible className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.045]">
                {faqs.map((f, i) => (
                  <AccordionItem key={f.q} value={`faq-${i}`} className="border-b border-white/10 px-5 last:border-0">
                    <AccordionTrigger className="py-5 text-left font-bold text-white hover:no-underline">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 leading-7 text-white/62">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          <div className="container mt-14">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 text-center md:p-10">
              <BadgeCheck className="mx-auto size-10 text-sa-gold" />
              <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-black leading-none md:text-6xl">
                Ready to stop being the best-kept secret in your suburb?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-white/64">
                Claim your founding spot, build your profile, and start looking like the pro you already are.
              </p>
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Button size="xl" onClick={handleStart} className="rounded-full bg-sa-gold text-sa-dark hover:bg-sa-gold/90">
                  Start 30-day trial
                  <ArrowRight className="size-5" />
                </Button>
                <Button size="xl" variant="outline" asChild className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  <Link to="/list">Create profile first</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
};

export default Pricing;

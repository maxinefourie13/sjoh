import { useNavigate } from "react-router-dom";
import { Check, CreditCard, Sparkles, Zap } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { SeoHead } from "@/components/SeoHead";
import { LAUNCH_TRIAL_CODE, TrialCodeRedeemer } from "@/components/TrialCodeRedeemer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SJOH_TIERS, formatRand } from "@/lib/mockData";
import { payments } from "@/lib/payments";
import { useAuth } from "@/hooks/useAuth";

const FAQS = [
  {
    q: "How does the launch trial code work?",
    a: `Use ${LAUNCH_TRIAL_CODE} after signup to unlock a 3-day Verified Pro trial. No card is needed for the code, and it can only be redeemed once per user. After that, choose R250/month to keep your Verified Pro access.`,
  },
  {
    q: "Do you take commission on the work I do?",
    a: "Never. As a Founding Business, your 0% commission lock-in means clients pay you directly and Sjoh does not take a cut of your invoice, quote, or payout.",
  },
  {
    q: "What does the Coral Checkmark actually mean?",
    a: "It means Sjoh has checked your uploaded ID document against the name and SA ID number you submitted. Customers know there is a real person behind the profile.",
  },
  {
    q: "Why do I need to verify my ID to get the Checkmark?",
    a: "Because customers are letting strangers into their homes. The Checkmark tells them your ID document was checked by Sjoh, not just self-registered, and it sets you apart from unverified competitors.",
  },
  {
    q: "What is the Eish! Urgent Boost?",
    a: "Posting a job is always free for customers. If it's a real emergency — burst geyser, locked out, no power — they can boost their job to Eish! Urgent for R50. It pins to the top of the feed for 72 hours, gets a flashing coral border, and pings every Verified Pro within 10km on WhatsApp.",
  },
  {
    q: "What is Sjoh's Law?",
    a: "Three strikes and you're out. Flake on a job, do dangerous work, or refuse to pay for completed work — that's a strike. Three strikes and your ID is permanently banned from the platform.",
  },
  {
    q: "Can I cancel any time?",
    a: "Yes. Cancel from your dashboard whenever you want. No contracts, no cancellation fees, no hard feelings. Your listing stays active until the end of your billing period.",
  },
  {
    q: "I already have a good reputation. Why do I need Sjoh?",
    a: "Because your reputation is probably stuck in your phone, WhatsApp chats, and word of mouth. Sjoh gives it a proper home: a verified profile, photos, reviews, quote tools, invoices, and trust signals customers can see before they call.",
  },
];

const OFFER_STACK = [
  {
    name: "The Sjoh Verified Public Profile",
    value: "Value: R1,500 setup",
    body: "A proper local profile customers can find, with your services, photos, trust signals, reviews, and work areas in one place.",
  },
  {
    name: "The Zero Middleman Quote & Invoice System",
    value: "Value: R350/month",
    body: "Send professional quotes and invoices without looking like a tiny WhatsApp side-hustle. Less back-and-forth, more confidence before the job starts.",
  },
  {
    name: "The Local Trust Builder",
    value: "Value: R750/month",
    body: "Collect reviews, build proof, and show customers why your work is worth choosing over the cheaper mampara with a louder Facebook page.",
  },
  {
    name: "Lifetime 0% Commission Lock-In",
    value: "Value: Priceless",
    body: "Founding Businesses keep 100% of the job money. Quote the work, do the work, get paid directly.",
  },
];

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const tier = SJOH_TIERS[0];

  const handleStart = () => {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent("/pricing")}`);
      return;
    }
    payments.startSubscription("verified_pro", "monthly");
  };

  return (
    <SiteLayout>
      <SeoHead
        title="Sjoh Founding Member Accelerator — R250/month for service pros"
        description="Claim the Sjoh Founding Member Accelerator: a verified public profile, quote and invoice tools, reviews, local visibility, and 0% commission lock-in for service businesses."
        canonical="https://sjoh.co.za/pricing"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <div className="bg-[#050505] text-white">
      <div className="container py-16 md:py-20">

        <header className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-sa-gold">Founding business offer</span>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight mt-3 text-balance">
            The Sjoh Founding Member Accelerator.
          </h1>
          <p className="mt-5 text-lg text-white/68">
            For proper South African service businesses that want local customers to find them,
            trust them, and hire them, without building a website or becoming a social media person.
          </p>
        </header>

        <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="relative bg-white text-sa-dark border-2 border-sa-gold rounded-3xl p-8 md:p-10 shadow-pop">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-sa-gold text-sa-dark text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full animate-soft-bob">
              First 500 founding businesses
            </span>

            <div className="mt-2 mb-6">
              <h2 className="font-display text-3xl font-bold">Local Authority Launchpad</h2>
              <p className="text-ink-2 mt-2">
                Get a professional online reputation, quote tools, invoice tools, customer reviews,
                and founding-business perks in one monthly plan.
              </p>
            </div>

            <div className="pb-7 border-b border-border">
              <div className="flex items-end gap-1">
                <span className="font-display text-6xl font-medium tracking-tight">
                  {formatRand(tier.price)}
                </span>
                <span className="text-muted-foreground mb-2 text-base">/month</span>
              </div>
              <p className="mt-2 text-sm text-ink-2">
                Use {LAUNCH_TRIAL_CODE} for 3 days free, or subscribe for R250/month when you are ready.
              </p>
            </div>

            <ul className="mt-7 space-y-3.5">
              {[
                "Verified public profile customers can actually find",
                "Professional quotes and invoices",
                "Reviews and trust signals in one place",
                "Local category and suburb visibility",
                "Founding-business 0% commission lock-in",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="size-4 text-sa-green mt-0.5 shrink-0" strokeWidth={3} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <TrialCodeRedeemer className="mt-7" />

            <div className="mt-8">
              <Button size="lg" className="w-full text-base font-bold h-14" onClick={handleStart}>
                Subscribe with PayFast — R250/month
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">
              R250/month, cancel anytime. Limited to 500 Founding Businesses. Trial code is optional.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 md:p-7">
              <span className="text-[10px] font-bold uppercase tracking-widest text-sa-pink">What you actually get</span>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
                A proper business presence, not just a listing.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/62">
                The point is not to “be in another directory.” The point is to stop being invisible
                when a customer searches from their phone, and to look like the trusted professional
                you already are.
              </p>
            </div>

            {OFFER_STACK.map((item, index) => (
              <div key={item.name} className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
                <div className="flex items-start gap-4">
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-xl font-display font-black text-sa-dark"
                    style={{
                      background:
                        index % 4 === 0 ? "var(--sa-gold)" :
                        index % 4 === 1 ? "var(--sa-peri)" :
                        index % 4 === 2 ? "var(--sa-green)" :
                        "var(--sa-pink)",
                    }}
                  >
                    {index === 0 ? "✓" : `+${index}`}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-extrabold text-white">{item.name}</h3>
                      <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/55">
                        {item.value}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-white/62">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-sa-green/30 bg-sa-green/15 p-6 md:p-8 flex items-start gap-5 hover:border-sa-green hover:shadow-pop transition-all duration-300">
            <span className="size-14 rounded-xl bg-sa-green text-white flex items-center justify-center shrink-0 font-display font-extrabold text-xl animate-pulse-ring">
              0%
            </span>
            <div>
              <p className="font-display font-extrabold tracking-tight text-lg text-white">
                Lifetime 0% commission lock-in.
              </p>
              <p className="text-white/62 mt-2 text-sm md:text-base">
                Founding Businesses keep every cent of the work they win through Sjoh. Clients pay you directly.
                We do not take a cut of your invoice, quote, or payout.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-sa-gold/35 bg-sa-gold/12 p-6 md:p-8 flex items-start gap-5">
            <span className="size-14 rounded-xl bg-sa-gold text-sa-dark flex items-center justify-center shrink-0 font-display font-extrabold text-xl">
              500
            </span>
            <div>
              <p className="font-display font-extrabold tracking-tight text-lg text-white">
                Honest scarcity: only 500 founding spots.
              </p>
              <p className="text-white/62 mt-2 text-sm md:text-base">
                We are limiting early access so founding businesses have room to stand out while customer demand grows.
                When a category or suburb fills up, the next business waits.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-10 max-w-5xl mx-auto rounded-3xl p-8 md:p-10 bg-[#101010] border border-white/10 text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <span className="size-12 rounded-xl bg-sa-peri text-white flex items-center justify-center shrink-0">
              <CreditCard className="size-6" strokeWidth={2.5} />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-sa-gold">Simple start</span>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
                Try Verified Pro for 3 days, then keep going for R250/month.
              </h2>
              <p className="mt-3 text-white/68 text-sm md:text-base leading-relaxed">
                Redeem {LAUNCH_TRIAL_CODE} once per user to build your profile, add proof, test the quote tools,
                and see how Sjoh works. No card is needed for the trial code.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-14 max-w-3xl mx-auto grid sm:grid-cols-3 gap-4 text-center">
          {[
            { icon: <Zap className="size-5" />, title: "No hidden fees", body: "R250/month is the plan. No listing fee, no per-quote charge, no surprise platform cut." },
            { icon: <Check className="size-5" />, title: "Cancel anytime", body: "Month-to-month. No contracts. Stop whenever you like — no penalty." },
            { icon: <Sparkles className="size-5" />, title: "Built for SA", body: "ZAR pricing, SA ID verification, WhatsApp-first comms. Made here, for here." },
          ].map((s) => (
            <div key={s.title} className="bg-white/[0.06] border border-white/10 rounded-xl p-5">
              <span className="size-9 rounded-lg bg-sa-peri/15 text-sa-peri flex items-center justify-center mx-auto mb-3">
                {s.icon}
              </span>
              <p className="font-semibold text-sm text-white">{s.title}</p>
              <p className="text-xs text-white/62 mt-1.5 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-24 max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-medium tracking-tight text-center mb-10">
            Frequently asked
          </h2>
          <Accordion type="single" collapsible className="bg-white/[0.06] border border-white/10 rounded-2xl overflow-hidden">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`f-${i}`} className="border-b border-white/10 last:border-0 px-5">
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-5 text-white">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-white/62 pb-5">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-20 text-center">
          <p className="text-white/60 text-sm mb-4">Ready to stop being a secret?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            <Button size="lg" className="h-14 w-full max-w-sm px-4 text-sm font-bold sm:w-auto sm:px-10 sm:text-base" onClick={handleStart}>
              Subscribe with PayFast
            </Button>
          </div>
        </div>

      </div>
      </div>
    </SiteLayout>
  );
};

export default Pricing;

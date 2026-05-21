import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { markEarlyAccessSeen } from "@/components/EarlyAccessGate";
import { SeoHead } from "@/components/SeoHead";
import { Typewriter } from "@/components/Typewriter";
import { FoundingSpotsBanner } from "@/components/FoundingSpotsBanner";
import { SjohWordmark } from "@/components/SjohWordmark";
import { LAUNCH_TRIAL_CODE } from "@/components/TrialCodeRedeemer";
import sjohMascot from "@/assets/sjoh-mascot-hoodie.png";
import { Award, Gift, Handshake, ShieldCheck, Hammer, Search, ArrowRight, CheckCircle2, Star, MapPin } from "lucide-react";

type Mode = "pro" | "customer";

const HERO_PHRASES = [
  "Find the right pro fast.",
  "Post the job. Compare properly.",
  "No commission. No middleman.",
  "Vetted local businesses.",
  "Real reviews. Real work.",
  "Get found by better-fit clients.",
];

const PERKS = [
  { Icon: Award, title: "Founder badge", body: "First 500 pros get a permanent Founder badge on their profile." },
  { Icon: Gift, title: "30 days free", body: `Use ${LAUNCH_TRIAL_CODE} once to unlock a no-card Verified Pro trial.` },
  { Icon: Handshake, title: "Keep the whole quote", body: "No commission on jobs. Clients contact you directly." },
  { Icon: ShieldCheck, title: "Vetted marketplace", body: "Profiles, reviews, and trust signals help good pros stand out." },
];

const EarlyAccessLanding = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("pro");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const goBrowse = () => {
    markEarlyAccessSeen();
    navigate("/directory");
  };

  const goPostJob = () => {
    markEarlyAccessSeen();
    navigate("/requests/new");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      toast({ title: "Tick the box, boet", description: "Agree to the Terms before claiming your spot.", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: displayName },
      },
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Couldn't create account", description: error.message, variant: "destructive" });
      return;
    }

    markEarlyAccessSeen();
    toast({ title: "Founding spot locked in", description: "Welcome to Sjoh. Check your email to confirm." });
    navigate("/", { replace: true });
  };

  const skipToBrowse = () => {
    markEarlyAccessSeen();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-dvh w-full overflow-hidden bg-[#050505] text-white">
      <SeoHead
        title="Sjoh — Claim your founding spot"
        description={`Join Sjoh as a founding member. South Africa's no-commission directory of vetted pros. First 500 get a Founder badge, and ${LAUNCH_TRIAL_CODE} unlocks 30 days free with no card.`}
      />

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div aria-hidden className="pointer-events-none fixed -right-56 top-6 size-[520px] rounded-full bg-sa-peri/12 blur-3xl" />
      <div aria-hidden className="pointer-events-none fixed -left-48 bottom-0 size-[460px] rounded-full bg-sa-green/12 blur-3xl" />

      {/* Top bar */}
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <button onClick={skipToBrowse} aria-label="Sjoh home">
            <SjohWordmark className="text-4xl" />
          </button>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm font-bold text-white/70 hover:text-white sm:inline">
              Log in
            </Link>
            <span className="rounded-full border border-sa-gold/40 bg-sa-gold px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-sa-dark">
              Founding members open
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-14">
        {/* Pitch + mascot */}
        <section>
          {/* Typewriter eyebrow */}
          <div className="mb-5 min-h-[1.5em] text-sm font-black uppercase tracking-widest text-sa-pink sm:text-base">
            <Typewriter
              phrases={HERO_PHRASES}
              randomize
              accentClassName="text-sa-gold"
              className="inline"
            />
          </div>

          <h1 className="font-display-bold text-5xl leading-[0.96] tracking-tight text-white sm:text-6xl lg:text-7xl">
            South Africa’s shortcut to the{" "}
            <span className="text-sa-gold">right pro.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/72">
            Search, post a job, or list your business. Sjoh connects people with vetted local service pros, without taking a cut of the work.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <FoundingSpotsBanner />
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/7 px-3.5 py-1.5 text-sm font-bold text-white/78">
              <CheckCircle2 className="size-4 text-sa-green" strokeWidth={2.5} />
              {LAUNCH_TRIAL_CODE}: 30 days free
            </span>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {PERKS.map((p) => (
              <div key={p.title} className="rounded-[1.15rem] border border-white/10 bg-white/[0.055] p-4 backdrop-blur-md transition hover:border-sa-gold/50 hover:bg-white/[0.08]">
                <span className="flex size-10 items-center justify-center rounded-xl bg-sa-gold text-sa-dark">
                  <p.Icon className="size-5" strokeWidth={2.25} aria-hidden />
                </span>
                <div className="mt-3">
                  <div className="font-display text-base font-black text-white">{p.title}</div>
                  <div className="mt-1 text-sm leading-snug text-white/62">{p.body}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2 text-sm font-bold text-white/78">
            {["Browse profiles", "Check reviews", "Post a job", "Quote direct"].map((item) => (
              <span key={item} className="rounded-full border border-white/12 bg-black/30 px-3 py-1.5">
                {item}
              </span>
            ))}
          </div>

          <div className="mt-8 hidden items-center gap-3 text-xs text-white/60 lg:flex">
            <span>Already have an account?</span>
            <Link to="/login" className="font-bold text-sa-gold hover:underline">Log in →</Link>
          </div>
        </section>

        <section className="space-y-5">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.06] p-4 shadow-2xl backdrop-blur-xl">
            <div className="relative min-h-[360px] overflow-hidden rounded-[1.55rem] bg-[radial-gradient(circle_at_25%_10%,rgba(255,180,31,.32),transparent_30%),linear-gradient(135deg,rgba(18,47,120,.86),rgba(5,5,5,.92)_55%,rgba(0,123,65,.55))]">
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.18]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.24) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.24) 1px, transparent 1px)",
                  backgroundSize: "38px 38px",
                }}
              />
              <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-white/82 backdrop-blur-md">
                Founder preview
              </div>
              <div className="absolute right-5 top-5 rounded-full bg-sa-gold px-3 py-1.5 text-xs font-black text-sa-dark">
                0% commission
              </div>
              <img
                src={sjohMascot}
                alt="Sjoh mascot"
                className="absolute bottom-[-38px] right-[-8px] w-[310px] max-w-[78%] select-none drop-shadow-2xl sm:w-[370px]"
                draggable={false}
              />
              <div className="absolute bottom-5 left-5 max-w-[270px] rounded-[1.2rem] border border-white/20 bg-white/82 p-4 text-sa-dark shadow-card backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-sa-dark/55">Sample profile</p>
                    <p className="font-display text-xl font-black">Khumalo Electrical</p>
                  </div>
                  <span className="grid size-11 place-items-center rounded-full bg-sa-gold text-sa-dark">
                    <ArrowRight className="size-4" strokeWidth={3} />
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                  <span className="rounded-xl bg-sa-dark px-2 py-2 text-white">
                    <Star className="mx-auto mb-1 size-3 fill-sa-gold text-sa-gold" /> 4.8
                  </span>
                  <span className="rounded-xl bg-sa-green px-2 py-2 text-white">
                    <ShieldCheck className="mx-auto mb-1 size-3" /> Vetted
                  </span>
                  <span className="rounded-xl bg-sa-peri px-2 py-2 text-white">
                    <MapPin className="mx-auto mb-1 size-3" /> SA
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mode chooser — Pro vs Customer */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setMode("pro")}
              className={`text-left rounded-xl border p-3.5 transition-all ${
                mode === "pro"
                  ? "border-sa-gold bg-sa-gold text-sa-dark ring-2 ring-sa-gold/35"
                  : "border-white/15 bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
              aria-pressed={mode === "pro"}
            >
              <div className="flex items-center gap-2">
                <span className={`size-7 rounded-lg flex items-center justify-center ${
                  mode === "pro" ? "bg-sa-dark text-white" : "bg-white/10 text-white/70"
                }`}>
                  <Hammer className="size-3.5" strokeWidth={2.5} />
                </span>
                <span className={`text-sm font-black ${mode === "pro" ? "text-sa-dark" : "text-white"}`}>I'm a Pro</span>
              </div>
              <p className={`mt-1.5 text-[11px] leading-snug ${mode === "pro" ? "text-sa-dark/72" : "text-white/60"}`}>
                Get leads. No commission. Founding badge.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setMode("customer")}
              className={`text-left rounded-xl border p-3.5 transition-all ${
                mode === "customer"
                  ? "border-sa-gold bg-sa-gold text-sa-dark ring-2 ring-sa-gold/35"
                  : "border-white/15 bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
              aria-pressed={mode === "customer"}
            >
              <div className="flex items-center gap-2">
                <span className={`size-7 rounded-lg flex items-center justify-center ${
                  mode === "customer" ? "bg-sa-dark text-white" : "bg-white/10 text-white/70"
                }`}>
                  <Search className="size-3.5" strokeWidth={2.5} />
                </span>
                <span className={`text-sm font-black ${mode === "customer" ? "text-sa-dark" : "text-white"}`}>I need a Pro</span>
              </div>
              <p className={`mt-1.5 text-[11px] leading-snug ${mode === "customer" ? "text-sa-dark/72" : "text-white/60"}`}>
                Find someone vetted. No middleman.
              </p>
            </button>
          </div>

          {mode === "pro" ? (
            <div className="rounded-[1.6rem] border border-white/12 bg-white/[0.075] p-6 shadow-2xl backdrop-blur-xl sm:p-7">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display-bold text-2xl tracking-tight text-white">Claim your founding spot</h2>
                  <p className="mt-1 text-sm leading-relaxed text-white/65">
                    Founder badge, {LAUNCH_TRIAL_CODE} 30-day trial, and 0% commission.
                  </p>
                </div>
                <span className="hidden rounded-full bg-sa-green px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white sm:inline-flex">
                  Pro launch
                </span>
              </div>

              <div className="mb-5 grid grid-cols-3 gap-2 text-center">
                {[
                  ["0%", "commission"],
                  ["500", "founders"],
                  ["30d", "trial code"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-black/25 px-2 py-3">
                    <div className="font-display-bold text-2xl text-sa-gold">{value}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">{label}</div>
                  </div>
                ))}
              </div>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-white/80">What does your Ma call you?</label>
                  <input
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="First name + surname"
                    className="w-full rounded-lg border border-white/15 bg-white/5 text-white placeholder:text-white/35 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-gold/50 focus:border-sa-gold/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-white/80">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@business.co.za"
                    className="w-full rounded-lg border border-white/15 bg-white/5 text-white placeholder:text-white/35 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-gold/50 focus:border-sa-gold/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-white/80">Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full rounded-lg border border-white/15 bg-white/5 text-white placeholder:text-white/35 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sa-gold/50 focus:border-sa-gold/50"
                  />
                </div>

                <label className="flex items-start gap-2.5 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    required
                    className="mt-0.5 size-4 rounded border-white/30 text-sa-gold focus:ring-sa-gold cursor-pointer shrink-0"
                  />
                  <span className="text-white/65">
                    I agree to the{" "}
                    <Link to="/terms" className="text-sa-gold font-semibold hover:underline">Terms</Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-sa-gold font-semibold hover:underline">Privacy Policy</Link>.
                  </span>
                </label>

                <Button type="submit" size="lg" className="w-full rounded-full bg-sa-gold text-sa-dark hover:bg-white" disabled={submitting}>
                  {submitting ? "Locking in your spot…" : "Claim my founding spot →"}
                </Button>

                <p className="text-center text-[11px] text-white/55 leading-relaxed">
                  Use {LAUNCH_TRIAL_CODE} after signup for 30 days free. No card needed for the code.
                </p>

                <p className="text-center text-xs text-white/55">
                  Already have an account?{" "}
                  <Link to="/login" className="text-sa-gold font-semibold hover:underline">Log in</Link>
                </p>
              </form>
            </div>
          ) : (
            <div className="rounded-[1.6rem] border border-white/12 bg-white/[0.075] p-6 shadow-2xl backdrop-blur-xl sm:p-7">
              <div className="rounded-[1.25rem] border border-white/10 bg-black/25 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-sa-pink">
                  <Search className="size-4" strokeWidth={2.5} />
                  Customer route
                </div>
                <h2 className="font-display-bold text-2xl tracking-tight text-white">
                  Tell us what you need. The right pros come to you.
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/68">
                  Browse now, or post a job and let vetted local businesses quote through Sjoh. Free for customers.
                </p>
              </div>

              <ul className="mt-5 grid gap-2.5 text-sm text-white/78">
                {[
                  "Search by trade, city, category, or province.",
                  "Compare profiles, reviews, and trust signals.",
                  "Contact the pro directly when you’re ready.",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5 rounded-xl border border-white/8 bg-white/[0.04] p-3">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sa-green" strokeWidth={2.5} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Button onClick={goPostJob} size="lg" className="rounded-full bg-sa-gold text-sa-dark hover:bg-white">
                  Post a job <ArrowRight className="ml-2 size-4" strokeWidth={3} />
                </Button>
                <Button onClick={goBrowse} size="lg" variant="outline" className="rounded-full border-white/18 bg-white/8 text-white hover:bg-white hover:text-sa-dark">
                  Browse pros
                </Button>
              </div>

              <div className="mt-4 rounded-2xl border border-sa-peri/25 bg-sa-peri/10 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-sa-peri">Example search</p>
                <p className="mt-1 font-display text-lg font-black text-white">
                  “Need a tiler in Durban this week”
                </p>
                <p className="mt-1 text-xs text-white/55">
                  Sjoh helps you move from “who do I call?” to a shortlist you can actually trust.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={skipToBrowse}
            className="w-full text-center text-xs text-white/45 underline-offset-4 hover:text-white/80 hover:underline"
          >
            Just want to peek? Browse without signing up.
          </button>
        </section>
      </main>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-12">
        <div className="grid overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.055] backdrop-blur-xl md:grid-cols-3">
          {[
            ["For customers", "Find the skill, check the reviews, get it sorted."],
            ["For pros", "Get found by people already looking for your service."],
            ["For Sjoh", "A proper local marketplace, built for South Africans."],
          ].map(([title, body], index) => (
            <div key={title} className="border-white/10 p-5 md:border-r md:last:border-r-0">
              <div
                className="mb-4 size-10 rounded-xl"
                style={{
                  background: index === 0 ? "var(--sa-gold)" : index === 1 ? "var(--sa-green)" : "var(--sa-peri)",
                }}
              />
              <h3 className="font-display text-lg font-black text-white">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/58">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-5 py-6 text-xs text-white/45">
          <span>© {new Date().getFullYear()} Sjoh. Proudly South African.</span>
          <span className="flex gap-4">
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default EarlyAccessLanding;

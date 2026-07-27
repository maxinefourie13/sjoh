import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ArrowRight, ArrowLeft, CheckCircle2, Loader2, CreditCard, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { TrialCodeRedeemer } from "@/components/TrialCodeRedeemer";
import { BusinessBrandImagesCard } from "@/components/BusinessBrandImagesCard";
import { Button } from "@/components/ui/button";
import { CATEGORIES, CATEGORY_GROUPS, PROVINCES } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { payments } from "@/lib/payments";
import { placeholderAvatar } from "@/lib/placeholderAvatar";
import { BIO_TRAITS, composeBio } from "@/lib/listingDefaults";

/**
 * Signup is deliberately one question per screen.
 *
 * Pros were abandoning a single seven-field form, most often because they had
 * no logo ready. Brand images are offered as a fully optional step, a generated
 * initials avatar stands in if they skip, the bio is tap-to-build rather than a
 * blank textarea, and no screen asks for more than two things at once.
 */
const STEPS = ["Trade", "Area", "Name", "About", "Photos", "Go live"] as const;

const PLANS = [
  {
    id: "verified_pro",
    name: "Verified Pro",
    price: "R250/mo",
    desc: "Build a profile customers can find, send quotes, generate invoices, collect reviews, and keep the whole quote.",
    recommended: true,
  },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);

const getTrialChargeDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
};

/**
 * The flow is public, so a pro can answer everything before they have an
 * account. We persist their answers in localStorage for 30 days, so if they
 * stop mid-signup — or drop off at PayFast before paying — everything is still
 * here when they come back, on this device, with nothing to retype. The draft
 * is cleared only once their plan/trial is actually active (see the mount
 * effect below).
 */
const DRAFT_KEY = "sjoh_listing_draft";
const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const REGISTER_LIST_URL = `/register?next=${encodeURIComponent("/list")}`;

type Draft = {
  step: number;
  groupSlug: string;
  categorySlug: string;
  name: string;
  province: string;
  city: string;
  phone: string;
  email: string;
  description: string;
  traits: string[];
  useEmailInstead: boolean;
  logoUrl: string;
  coverUrl: string;
};

type StoredDraft = Draft & { savedAt: number };

const loadDraft = (): Partial<Draft> => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<StoredDraft>;
    // Expire anything older than 30 days rather than resurrecting stale answers.
    if (!parsed.savedAt || Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
      localStorage.removeItem(DRAFT_KEY);
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
};

const clearDraft = () => {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
};

const ListBusiness = () => {
  const draft = useRef<Partial<Draft>>(loadDraft()).current;
  const [step, setStep] = useState(draft.step ?? 0);
  const [plan, setPlan] = useState("verified_pro");
  const [groupSlug, setGroupSlug] = useState(draft.groupSlug ?? "");
  const [categorySlug, setCategorySlug] = useState(draft.categorySlug ?? "");
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState(draft.name ?? "");
  const [province, setProvince] = useState(draft.province ?? "");
  const [city, setCity] = useState(draft.city ?? "");
  const [phone, setPhone] = useState(draft.phone ?? "");
  const [email, setEmail] = useState(draft.email ?? "");
  const [description, setDescription] = useState(draft.description ?? "");
  const [traits, setTraits] = useState<string[]>(draft.traits ?? []);
  const [useEmailInstead, setUseEmailInstead] = useState(draft.useEmailInstead ?? false);
  const [logoUrl, setLogoUrl] = useState(draft.logoUrl ?? "");
  const [coverUrl, setCoverUrl] = useState(draft.coverUrl ?? "");

  const nameInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const subCats = groupSlug ? CATEGORIES.filter((c) => c.groupSlug === groupSlug) : [];
  const selectedCategory = CATEGORIES.find((c) => c.slug === categorySlug);
  const selectedGroup = CATEGORY_GROUPS.find((g) => g.slug === groupSlug);

  // City/suburb is optional — plenty of pros work across a whole province
  // (photographers, movers, remote services). They add an exact area later
  // from the dashboard. Province is the only location we insist on.
  const basicsValid =
    name.trim().length > 1 &&
    !!groupSlug &&
    !!categorySlug &&
    !!province &&
    (phone.trim().length > 5 || email.trim().length > 5);

  const canContinue = (() => {
    if (step === 0) return !!categorySlug;
    if (step === 1) return !!province;
    if (step === 2) return name.trim().length > 1 && (phone.trim().length > 5 || email.trim().length > 5);
    if (step === 3) return true; // bio is always optional — we compose one if skipped
    if (step === 4) return !submitting; // brand images are optional
    if (step === 5) return whatsappConsent && !submitting;
    return true;
  })();

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  // Autofocus the one field that matters on each screen — saves a tap on mobile.
  useEffect(() => {
    if (step === 1 && province) cityInputRef.current?.focus();
    if (step === 2) nameInputRef.current?.focus();
  }, [step, province]);

  // Persist a 30-day draft so stopping mid-signup — or dropping off at PayFast
  // before paying — never costs them their answers on this device.
  useEffect(() => {
    if (step >= STEPS.length) return;
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          savedAt: Date.now(),
          step,
          groupSlug,
          categorySlug,
          name,
          province,
          city,
          phone,
          email,
          description,
          traits,
          useEmailInstead,
          logoUrl,
          coverUrl,
        }),
      );
    } catch { /* private browsing — the flow still works, just without recovery */ }
  }, [step, groupSlug, categorySlug, name, province, city, phone, email, description, traits, useEmailInstead, logoUrl, coverUrl]);

  // Once their plan or trial is actually active, the draft has served its
  // purpose — drop it so a returning paid pro doesn't land back in signup.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("provider_balances")
        .select("tier, trial_ends_at")
        .eq("user_id", user.id)
        .maybeSingle();
      const tier = data?.tier ?? "none";
      const paid =
        tier === "basic" ||
        tier === "verified_pro" ||
        ((tier === "basic_trial" || tier === "verified_pro_trial") &&
          !!data?.trial_ends_at &&
          new Date(data.trial_ends_at).getTime() > Date.now());
      if (paid && !cancelled) clearDraft();
    })();
    return () => { cancelled = true; };
  }, [user]);

  const toggleTrait = (t: string) =>
    setTraits((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t].slice(0, 4)));

  const previewBio =
    description.trim().length > 20
      ? description.trim()
      : composeBio({ categoryName: selectedCategory?.name, city, province, traits });

  // City is optional, so fall back to the province rather than showing a
  // trailing "· " with nothing after it.
  const locationLabel = city.trim() ? `${city.trim()}, ${province}` : province;

  const saveListing = async () => {
    if (!user) {
      // The draft is already persisted, so account creation can happen now
      // without losing any answers or making a new user guess a password.
      toast({
        title: "Create your account first",
        description: "Your answers are saved — we'll bring you straight back here.",
      });
      navigate(REGISTER_LIST_URL);
      return false;
    }
    if (!whatsappConsent || !selectedCategory || !basicsValid) return false;

    setSubmitting(true);
    try {
      const baseSlug = slugify(name);
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

      const { data: existingListing, error: existingErr } = await supabase
        .from("businesses")
        .select("id, image_url, logo_url")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingErr) throw existingErr;

      const listingPayload = {
        name: name.trim(),
        category_slug: selectedCategory.slug,
        category_name: selectedCategory.name,
        province,
        city: city.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        website: null,
        // Never null: composeBio guarantees the >20 char minimum the public
        // directory view enforces, so the listing is visible immediately.
        description: previewBio,
        tags: traits,
        // A real cover takes priority. Existing images are preserved when a
        // returning pro skips this optional step; new profiles get a visible
        // initials stand-in until they upload their banner.
        image_url: coverUrl || existingListing?.image_url || placeholderAvatar(name.trim()),
        logo_url: logoUrl || existingListing?.logo_url || null,
        listing_status: "active",
        pre_launch: false,
      };

      const { error } = existingListing
        ? await supabase.from("businesses").update(listingPayload).eq("id", existingListing.id)
        : await supabase.from("businesses").insert([{ ...listingPayload, owner_id: user.id, slug }]);

      if (error) throw error;

      // Deliberately NOT clearing the draft here: the pro is about to be sent
      // to PayFast and may bail before paying. The draft is cleared only once
      // their plan/trial actually goes active (see the mount effect above).
      toast({
        title: "You're live on Sjoh",
        description: "Now add your card on PayFast to start the trial.",
      });
      return true;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Please try again in a moment.";
      toast({ title: "Couldn't save your listing", description: message, variant: "destructive" });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartTrial = async () => {
    const saved = await saveListing();
    if (!saved) return;
    setSubmitting(true);
    await payments.startTrialSubscription("verified_pro", "monthly", 30);
    setSubmitting(false);
  };

  const handlePrimaryClick = () => {
    if (step === 5) void handleStartTrial();
    else next();
  };

  // Endowed progress: the bar never reads empty, so the first screen already
  // feels like progress worth protecting rather than a blank commitment.
  const progressPct = Math.round(((step + 0.7) / STEPS.length) * 100);

  return (
    <SiteLayout>
      <div className="container py-10 max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-4" /> Back home
        </Link>

        {step < STEPS.length && (
          <div className="mb-8">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm font-bold">{STEPS[step]}</span>
              <span className="text-xs text-ink-2 tabular-nums">
                Step {step + 1} of {STEPS.length} · about {Math.max(1, STEPS.length - step) * 15}s left
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-sa-green transition-[width] duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-card border-2 border-sa-peri/25 rounded-2xl p-6 md:p-8 shadow-card">
          {/* ---------------------------------------------------------- 0 · Trade */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-semibold">What do you do?</h2>
                <p className="text-sm text-ink-2 mt-1">Tap your trade. Nothing to type.</p>
              </div>

              {!groupSlug ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CATEGORY_GROUPS.map((g) => (
                    <button
                      key={g.slug}
                      type="button"
                      onClick={() => setGroupSlug(g.slug)}
                      className="border-2 border-border rounded-xl p-3 text-left hover:border-sa-green hover:bg-sa-green/5 transition-all active:scale-[0.97]"
                    >
                      <span className="text-2xl block">{g.emoji}</span>
                      <span className="text-sm font-semibold leading-tight block mt-1.5">{g.name}</span>
                    </button>
                  ))}
                  {/* Catch-all so a pro who doesn't fit any group can still sail
                      through. Maps to the generic "other" service and advances. */}
                  <button
                    type="button"
                    onClick={() => { setGroupSlug("specialist-ondemand"); setCategorySlug("other"); setTimeout(next, 180); }}
                    className="border-2 border-dashed border-border rounded-xl p-3 text-left hover:border-sa-green hover:bg-sa-green/5 transition-all active:scale-[0.97]"
                  >
                    <span className="text-2xl block">🤔</span>
                    <span className="text-sm font-semibold leading-tight block mt-1.5">Other / Not sure</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => { setGroupSlug(""); setCategorySlug(""); }}
                    className="text-sm text-sa-peri font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="size-3.5" /> {selectedGroup?.name}
                  </button>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {subCats.map((c) => (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => { setCategorySlug(c.slug); setTimeout(next, 180); }}
                        className={cn(
                          "border-2 rounded-xl p-3 text-left transition-all active:scale-[0.97]",
                          categorySlug === c.slug
                            ? "border-sa-green bg-sa-green/10"
                            : "border-border hover:border-sa-green hover:bg-sa-green/5",
                        )}
                      >
                        <span className="text-2xl block">{c.emoji}</span>
                        <span className="text-sm font-semibold leading-tight block mt-1.5">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------- 1 · Area */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-semibold">Where do you work?</h2>
                <p className="text-sm text-ink-2 mt-1">So customers nearby find you first.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {PROVINCES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProvince(p)}
                    className={cn(
                      "px-3.5 py-2 rounded-full border-2 text-sm font-semibold transition-all active:scale-[0.97]",
                      province === p
                        ? "border-sa-green bg-sa-green text-white"
                        : "border-border hover:border-sa-green",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              {province && (
                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-semibold mb-1.5">
                    City or suburb
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-2 bg-secondary px-1.5 py-0.5 rounded">Optional</span>
                  </span>
                  <input
                    ref={cityInputRef}
                    className="input"
                    placeholder={province === "Remote (South Africa)" ? "e.g. work anywhere in SA" : "e.g. Sandton"}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && canContinue) next(); }}
                  />
                  <span className="block text-xs text-ink-2 mt-1.5">
                    Work across the whole province? Leave this blank — you can pin an exact area later.
                  </span>
                </label>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------- 2 · Name */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-semibold">What's your business called?</h2>
                <p className="text-sm text-ink-2 mt-1">This is the name customers will see.</p>
              </div>

              <input
                ref={nameInputRef}
                className="input text-lg"
                placeholder="e.g. Sizwe Plumbing"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              {/* Live payoff — their listing card assembling itself as they type. */}
              {name.trim().length > 1 && (
                <div className="rounded-xl border-2 border-sa-green/30 bg-sa-green/5 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-sa-green mb-2.5">
                    Your listing so far
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={placeholderAvatar(name.trim())}
                      alt=""
                      className="size-14 rounded-xl shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-display font-bold truncate">{name.trim()}</p>
                      <p className="text-xs text-ink-2 truncate">
                        {selectedCategory?.name} · {locationLabel}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-ink-2 mt-3 leading-relaxed">
                    We made you a profile picture from your initials so you can go live today.
                    Swap it for your logo whenever you're ready.
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-sm font-semibold">
                    {useEmailInstead ? "Your email" : "Your WhatsApp / phone number"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setUseEmailInstead((v) => !v)}
                    className="text-xs text-sa-peri font-semibold hover:underline"
                  >
                    {useEmailInstead ? "Use a phone number" : "Use email instead"}
                  </button>
                </div>
                {useEmailInstead ? (
                  <input
                    type="email"
                    className="input"
                    placeholder="hello@yourbiz.co.za"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                ) : (
                  <input
                    type="tel"
                    inputMode="tel"
                    className="input"
                    placeholder="082 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                )}
                <p className="text-xs text-ink-2 mt-1.5">This is how customers reach you about jobs.</p>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------- 3 · About */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-semibold">What's true about you?</h2>
                <p className="text-sm text-ink-2 mt-1">
                  Tap any that apply — we'll write your profile blurb from them. Skip if you'd rather.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {BIO_TRAITS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTrait(t)}
                    className={cn(
                      "px-3.5 py-2 rounded-full border-2 text-sm font-semibold transition-all active:scale-[0.97]",
                      traits.includes(t)
                        ? "border-sa-green bg-sa-green text-white"
                        : "border-border hover:border-sa-green",
                    )}
                  >
                    {traits.includes(t) && <Check className="size-3.5 inline mr-1" strokeWidth={3} />}
                    {t}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-sa-peri/40 bg-sa-peri/5 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-sa-peri mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="size-3.5" /> Your profile blurb
                </p>
                <p className="text-sm leading-relaxed">{previewBio}</p>
              </div>

              <details className="group">
                <summary className="text-sm font-semibold text-sa-peri cursor-pointer hover:underline list-none">
                  Prefer to write it yourself?
                </summary>
                <textarea
                  rows={4}
                  className="input resize-none mt-2.5"
                  placeholder="What you do, who you serve, what makes you good."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </details>
            </div>
          )}

          {/* --------------------------------------------------------- 4 · Photos */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-semibold">Make the profile look like yours</h2>
                <p className="text-sm text-ink-2 mt-1">
                  Add your real logo and a wide banner image. You can skip this for now, but we’ll keep reminding you until both are added.
                </p>
              </div>

              {!user && (
                <div className="rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-bold">Create your account to upload</p>
                  <p className="mt-1">Your setup answers are saved. Create a password first, then add your logo and banner.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => navigate(REGISTER_LIST_URL)}
                  >
                    Create account to add images
                  </Button>
                </div>
              )}

              <BusinessBrandImagesCard
                variant="onboarding"
                logoUrl={logoUrl || null}
                coverUrl={coverUrl || null}
                onRequireAuth={() => {
                  toast({ title: "Create your account first", description: "Your answers are saved — then you can add your images." });
                  navigate(REGISTER_LIST_URL);
                }}
                onChange={(images) => {
                  setLogoUrl(images.logoUrl ?? "");
                  setCoverUrl(images.coverUrl ?? "");
                }}
              />

              <p className="text-center text-xs text-ink-2">
                JPG, PNG, WebP or HEIC. We compress large files automatically.
              </p>
            </div>
          )}

          {/* -------------------------------------------------------- 5 · Go live */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-semibold">Last step — go live</h2>
                <p className="text-sm text-ink-2 mt-1">
                  30 days free, backed by PayFast. Just R5 today to check your card; your first R250 is on {getTrialChargeDate()}.
                </p>
              </div>

              <div className="rounded-xl border-2 border-sa-green/30 bg-sa-green/5 p-4">
                <div className="flex items-center gap-3">
                  <img src={logoUrl || placeholderAvatar(name.trim())} alt="" className="size-14 rounded-xl object-contain shrink-0" />
                  <div className="min-w-0">
                    <p className="font-display font-bold truncate">{name.trim() || "—"}</p>
                    <p className="text-xs text-ink-2 truncate">
                      {selectedCategory?.name ?? "—"} · {locationLabel || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {PLANS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlan(p.id)}
                  className={cn(
                    "w-full text-left border rounded-xl p-4 flex items-center gap-4 transition-all",
                    plan === p.id ? "border-sa-green bg-sa-green/10 shadow-soft" : "border-border hover:border-sa-green/40",
                  )}
                >
                  <span className={cn("size-5 rounded-full border-2 shrink-0 flex items-center justify-center", plan === p.id ? "border-sa-green bg-sa-green" : "border-border")}>
                    {plan === p.id && <Check className="size-3 text-white" strokeWidth={3} />}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{p.name}</span>
                      {p.recommended && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-sa-dark bg-sa-gold px-2 py-0.5 rounded">Recommended</span>
                      )}
                    </div>
                    <p className="text-xs text-ink-2 mt-0.5">{p.desc}</p>
                  </div>
                  <span className="font-display font-semibold whitespace-nowrap">{p.price}</span>
                </button>
              ))}

              <div className="rounded-xl border border-sa-green/30 bg-sa-green/10 p-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sa-green text-white">
                    <CreditCard className="size-5" strokeWidth={2.5} />
                  </span>
                  <div>
                    <p className="font-display text-base font-extrabold">R5 card check today.</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-2">
                      We charge R5 today just to make sure your card works — PayFast stores it securely. Sjoh starts charging R250/month on {getTrialChargeDate()}, unless you cancel first.
                    </p>
                  </div>
                </div>
              </div>

              <TrialCodeRedeemer tone="light" />

              {!user && (
                <div className="rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">
                  Create your account before PayFast opens. We’ll ask you to set a password first, then bring you back here to finish your listing and trial.
                </div>
              )}

              {/* Mandatory WhatsApp consent — POPIA-compliant, NOT pre-checked */}
              <label className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/40 transition-colors">
                <input
                  type="checkbox"
                  checked={whatsappConsent}
                  onChange={(e) => setWhatsappConsent(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-border accent-primary cursor-pointer shrink-0"
                />
                <span className="text-sm text-ink-2 leading-relaxed">
                  <strong className="text-foreground">I explicitly consent</strong> to receive lead alerts via WhatsApp from Sjoh,
                  and I understand I can opt out at any time from my dashboard. Standard message rates may apply.
                </span>
              </label>
            </div>
          )}

          {/* ----------------------------------------------------------- 5 · Done */}
          {step === STEPS.length && (
            <div className="text-center py-8">
              <div className="size-16 rounded-full bg-sa-green/10 text-sa-green mx-auto flex items-center justify-center mb-6">
                <CheckCircle2 className="size-8" />
              </div>
              <h2 className="font-display text-3xl font-medium tracking-tight">You're live on Sjoh.</h2>
              <p className="mt-3 text-ink-2 max-w-md mx-auto">
                Customers can find you right now. Swap your placeholder picture for a real logo and add
                a few job photos whenever you have a minute — profiles with photos get contacted more.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate("/dashboard?section=profile")}>Add my logo & banner</Button>
                <Button variant="outline" onClick={() => navigate("/leads")}>Browse Opportunities</Button>
              </div>
            </div>
          )}

          {step < STEPS.length && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button variant="ghost" onClick={prev} disabled={step === 0 || submitting}>
                <ArrowLeft className="size-4" /> Back
              </Button>
              <div className="flex items-center gap-2">
                {step === 3 && traits.length === 0 && !description.trim() && (
                  <Button variant="ghost" onClick={next}>Skip</Button>
                )}
                <Button onClick={handlePrimaryClick} disabled={!canContinue}>
                  {step === 5 ? (
                    submitting ? (
                      <><Loader2 className="size-4 animate-spin" /> Opening PayFast…</>
                    ) : (
                      <>Go live <ArrowRight className="size-4" /></>
                    )
                  ) : step === 4 && (!logoUrl || !coverUrl) ? (
                    <>Skip for now <ArrowRight className="size-4" /></>
                  ) : (
                    <>Continue <ArrowRight className="size-4" /></>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .input {
          width: 100%; padding: 0.625rem 0.875rem;
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius);
          font-size: 0.875rem; font-family: inherit; color: hsl(var(--foreground));
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus { outline: none; border-color: var(--sa-peri); box-shadow: 0 0 0 3px rgba(107, 124, 232, 0.18); }
      `}</style>
    </SiteLayout>
  );
};

export default ListBusiness;

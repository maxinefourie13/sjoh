import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ArrowRight, ArrowLeft, CheckCircle2, Upload, Loader2, X } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { LAUNCH_TRIAL_CODE, TrialCodeRedeemer } from "@/components/TrialCodeRedeemer";
import { Button } from "@/components/ui/button";
import { CATEGORIES, CATEGORY_GROUPS, PROVINCES } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { compressIfImage } from "@/lib/compressImage";

const STEPS = ["Basics", "Profile", "Founding Perks", "Review", "Done"] as const;

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

const ListBusiness = () => {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState("verified_pro");
  const [groupSlug, setGroupSlug] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [servicesText, setServicesText] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const subCats = groupSlug ? CATEGORIES.filter((c) => c.groupSlug === groupSlug) : [];
  const selectedCategory = CATEGORIES.find((c) => c.slug === categorySlug);

  const basicsValid =
    name.trim().length > 1 &&
    !!groupSlug &&
    !!categorySlug &&
    !!province &&
    city.trim().length > 1 &&
    (phone.trim().length > 5 || email.trim().length > 5);

  const canContinue = (() => {
    if (step === 0) return basicsValid;
    if (step === 1) return description.trim().length > 10;
    if (step === 3) return whatsappConsent && !submitting;
    return true;
  })();

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleImageUpload = async (
    file: File,
    type: "logo" | "cover",
    userId: string,
  ) => {
    const setter = type === "logo" ? setLogoUrl : setCoverUrl;
    const loadingSetter = type === "logo" ? setUploadingLogo : setUploadingCover;
    loadingSetter(true);
    try {
      const compressed = await compressIfImage(file);
      const ext = compressed.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${type}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("business-images")
        .upload(path, compressed, { contentType: compressed.type, upsert: true });
      if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }
      const { data } = supabase.storage.from("business-images").getPublicUrl(path);
      setter(data.publicUrl);
    } finally {
      loadingSetter(false);
    }
  };

  const handleConfirm = async () => {
    if (!user) {
      toast({
        title: "Almost there",
        description: "Sign in or create an account to save your listing.",
      });
      navigate(`/login?next=${encodeURIComponent("/list")}`);
      return;
    }
    if (!whatsappConsent || !selectedCategory || !basicsValid) return;

    setSubmitting(true);
    try {
      const baseSlug = slugify(name);
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;
      const tags = servicesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 20);

      const { error } = await supabase.from("businesses").insert([{
        owner_id: user.id,
        name: name.trim(),
        slug,
        category_slug: selectedCategory.slug,
        category_name: selectedCategory.name,
        province,
        city: city.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        website: website.trim() || null,
        description: description.trim() || null,
        tags,
        image_url: logoUrl ?? coverUrl ?? null,
        listing_status: "workshop",
        pre_launch: true,
      }]);

      if (error) throw error;

      toast({
        title: "You're on the founding-member list",
        description: "We've saved your listing in workshop mode. Polish it from your dashboard anytime.",
      });
      next();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Please try again in a moment.";
      toast({
        title: "Couldn't save your listing",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrimaryClick = () => {
    if (step === 3) {
      void handleConfirm();
    } else {
      next();
    }
  };

  return (
    <SiteLayout>
      <div className="container py-12 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-4" /> Back home
        </Link>

        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between gap-1">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-3 flex-1 last:flex-none">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center text-xs font-bold tabular-nums",
                      i < step ? "bg-sa-green text-white" : i === step ? "bg-sa-navy text-white" : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {i < step ? <Check className="size-4" /> : i + 1}
                  </span>
                  <span className={cn("text-sm font-semibold hidden sm:inline", i === step ? "text-foreground" : "text-muted-foreground")}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("h-px flex-1 mx-1", i < step ? "bg-sa-green" : "bg-border")} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border-2 border-sa-peri/25 rounded-2xl p-6 md:p-8 shadow-card">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-semibold">Start your business profile</h2>
                <p className="text-sm text-ink-2 mt-1">This creates your online reputation on Sjoh. Keep it simple now — you can polish the proof, photos, and services later.</p>
              </div>
              <Field label="Business name">
                <input
                  className="input"
                  placeholder="e.g. Khumalo Electrical Contractors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Category group">
                  <select
                    className="input cursor-pointer"
                    value={groupSlug}
                    onChange={(e) => {
                      setGroupSlug(e.target.value);
                      setCategorySlug("");
                    }}
                  >
                    <option value="">Select a group</option>
                    {CATEGORY_GROUPS.map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
                  </select>
                </Field>
                <Field label="Service">
                  <select
                    className="input cursor-pointer"
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    disabled={!groupSlug}
                  >
                    <option value="">{groupSlug ? "Select a service" : "Pick a group first"}</option>
                    {subCats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Province">
                  <select
                    className="input cursor-pointer"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                  >
                    <option value="">Select a province</option>
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="City / Suburb">
                  <input
                    className="input"
                    placeholder="e.g. Sandton"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </Field>
                <Field label="Phone">
                  <input
                    className="input"
                    placeholder="+27 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    className="input"
                    placeholder="hello@yourbiz.co.za"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field label="Website (optional)">
                  <input
                    className="input"
                    placeholder="yourbiz.co.za"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-semibold">Show why customers should trust you</h2>
                <p className="text-sm text-ink-2 mt-1">Add enough detail so customers understand what you do, where you work, and why you are worth choosing before they call.</p>
              </div>
              <Field label="Description">
                <textarea
                  rows={4}
                  className="input resize-none"
                  placeholder="What you do, who you serve, what makes you good."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>

              <div className="rounded-xl border border-dashed border-sa-gold/70 bg-sa-gold/10 p-4">
                <p className="text-sm font-bold text-foreground">
                  Make it look the part — when you're ready.
                </p>
                <p className="text-xs text-ink-2 mt-1 leading-relaxed">
                  Logo, cover and gallery are <strong>optional</strong>. Skip them now and add them anytime from your dashboard.{" "}
                  Don't have a logo yet?{" "}
                  <Link to="/directory?category=graphic-design" className="text-sa-pink font-semibold hover:underline">
                    Find a designer on Sjoh
                  </Link>{" "}
                  for that too.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Logo upload */}
                <div>
                  <span className="flex items-center gap-2 text-sm font-semibold mb-1.5">
                    Logo <span className="text-[10px] font-bold uppercase tracking-wider text-sa-pink bg-sa-pink/10 px-1.5 py-0.5 rounded">Optional · recommended</span>
                  </span>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f && user) handleImageUpload(f, "logo", user.id); }} />
                  {logoUrl ? (
                    <div className="relative rounded-lg overflow-hidden border border-border aspect-square">
                      <img src={logoUrl} className="w-full h-full object-cover" alt="Logo" />
                      <button onClick={() => setLogoUrl(null)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"><X className="size-3" /></button>
                    </div>
                  ) : (
                    <div onClick={() => logoInputRef.current?.click()} className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-sa-pink/60 cursor-pointer transition-colors">
                      {uploadingLogo ? <Loader2 className="size-5 mx-auto animate-spin text-muted-foreground" /> : <><Upload className="size-5 mx-auto text-muted-foreground" /><p className="text-xs text-muted-foreground mt-2">Click to upload — or skip for now</p></>}
                    </div>
                  )}
                </div>
                {/* Cover image upload */}
                <div>
                  <span className="flex items-center gap-2 text-sm font-semibold mb-1.5">
                    Cover image <span className="text-[10px] font-bold uppercase tracking-wider text-sa-peri bg-sa-peri/10 px-1.5 py-0.5 rounded">Optional · recommended</span>
                  </span>
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f && user) handleImageUpload(f, "cover", user.id); }} />
                  {coverUrl ? (
                    <div className="relative rounded-lg overflow-hidden border border-border aspect-video">
                      <img src={coverUrl} className="w-full h-full object-cover" alt="Cover" />
                      <button onClick={() => setCoverUrl(null)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"><X className="size-3" /></button>
                    </div>
                  ) : (
                    <div onClick={() => coverInputRef.current?.click()} className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-sa-peri/60 cursor-pointer transition-colors">
                      {uploadingCover ? <Loader2 className="size-5 mx-auto animate-spin text-muted-foreground" /> : <><Upload className="size-5 mx-auto text-muted-foreground" /><p className="text-xs text-muted-foreground mt-2">Click to upload — or skip for now</p></>}
                    </div>
                  )}
                </div>
              </div>
              <Field label="Services offered (comma separated)">
                <input
                  className="input"
                  placeholder="e.g. COC inspections, solar PV, emergency callouts"
                  value={servicesText}
                  onChange={(e) => setServicesText(e.target.value)}
                />
                <span className="block text-xs text-ink-2 mt-1.5">You can refine this list later from your dashboard.</span>
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-semibold">Founding-member perks</h2>
                <p className="text-sm text-ink-2 mt-1">Get in early while Sjoh fills the marketplace. Build visibility, collect reviews, and look professional before the first call.</p>
              </div>
              <div className="space-y-3">
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
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-semibold">Review and confirm</h2>
                <p className="text-sm text-ink-2 mt-1">
                  Founding businesses can use {LAUNCH_TRIAL_CODE} once for a 30-day Verified Pro trial. No card needed for the code.
                </p>
              </div>
              <div className="rounded-xl border border-border p-5 bg-secondary/40 space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Listing</p>
                  <p className="font-display text-lg font-semibold">{name || "—"}</p>
                  <p className="text-xs text-ink-2">
                    {selectedCategory?.name ?? "—"} · {city || "—"}{province ? `, ${province}` : ""}
                  </p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan</p>
                  <p className="font-display text-lg font-semibold">
                    {PLANS.find((p) => p.id === plan)?.name ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    R250/month when you are ready to keep Verified Pro. Build a public profile, respond to quote requests, generate invoices, and collect verified reviews.
                  </p>
                </div>
              </div>
              <TrialCodeRedeemer tone="light" />
              <div className="rounded-xl border border-dashed border-sa-peri/60 bg-sa-peri/10 p-5 text-sm text-ink-2 leading-relaxed">
                <strong className="text-foreground">Heads up — early access.</strong> We'll save your listing in workshop mode so you can keep editing it from your dashboard. The Sjoh team will reach out within 24 hours to verify details and switch it live.
              </div>

              {!user && (
                <div className="rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">
                  You'll be asked to sign in or create a free account when you tap Confirm — that's how we tie the listing to you.
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
                  and I understand I can opt out at any time from my dashboard. Standard
                  message rates may apply.
                </span>
              </label>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-8">
              <div className="size-16 rounded-full bg-sa-green/10 text-sa-green mx-auto flex items-center justify-center mb-6">
                <CheckCircle2 className="size-8" />
              </div>
              <h2 className="font-display text-3xl font-medium tracking-tight">Your business profile is saved.</h2>
              <p className="mt-3 text-ink-2 max-w-md mx-auto">
                Sharp! Next, add a few portfolio photos and trust signals so customers feel confident before they contact you. We'll verify your details before switching the listing live.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate("/dashboard?section=profile")}>Polish my profile</Button>
                <Button variant="secondary" asChild>
                  <Link to="/pricing">Subscribe for R250/month</Link>
                </Button>
                <Button variant="outline" onClick={() => navigate("/leads")}>Browse Opportunities</Button>
              </div>
            </div>
          )}

          {step < 4 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button variant="ghost" onClick={prev} disabled={step === 0 || submitting}>
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button onClick={handlePrimaryClick} disabled={!canContinue}>
                {step === 3 ? (
                  submitting ? (
                    <><Loader2 className="size-4 animate-spin" /> Saving…</>
                  ) : (
                    <>Confirm — join the founding list</>
                  )
                ) : (
                  <>Continue <ArrowRight className="size-4" /></>
                )}
              </Button>
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

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="block text-sm font-semibold mb-1.5">{label}</span>
    {children}
  </label>
);

const UploadField = ({ label, optional = false }: { label: string; optional?: boolean }) => (
  <label className="block">
    <span className="flex items-center gap-2 text-sm font-semibold mb-1.5">
      {label}
      {optional && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-light px-1.5 py-0.5 rounded">
          Optional · recommended
        </span>
      )}
    </span>
    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 cursor-pointer transition-colors">
      <Upload className="size-5 mx-auto text-muted-foreground" />
      <p className="text-xs text-muted-foreground mt-2">
        {optional ? "Click to upload — or skip for now" : "Click to upload"}
      </p>
    </div>
  </label>
);

export default ListBusiness;

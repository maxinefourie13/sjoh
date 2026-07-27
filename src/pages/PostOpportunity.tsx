import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Siren, ImagePlus, X, FileText, Loader2, HardHat } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { LiabilityDisclaimer } from "@/components/LiabilityDisclaimer";
import { CATEGORIES, CATEGORY_GROUPS, PROVINCES } from "@/lib/mockData";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { findProhibited, PROHIBITED_MESSAGE } from "@/lib/prohibitedKeywords";
import { compressIfImage } from "@/lib/compressImage";
import { ShieldCheck } from "lucide-react";

interface Attachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

const MAX_FILES = 6;
const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif,image/heic,application/pdf";

const PostOpportunity = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [groupSlug, setGroupSlug] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [supplyCount, setSupplyCount] = useState<number | null>(null);
  const [supplyChecking, setSupplyChecking] = useState(false);

  const subCats = groupSlug ? CATEGORIES.filter((c) => c.groupSlug === groupSlug) : [];
  const isOtherCategory = categorySlug.startsWith("other");
  const selectedCategoryName = isOtherCategory
    ? (customCategory || "this service")
    : (subCats.find((c) => c.slug === categorySlug)?.name || "this service");

  // Supply transparency — quietly check how many active Pros match the
  // category + province (and optionally city) the customer has chosen.
  // If supply is thin, we'll show a friendly "still recruiting" notice.
  useEffect(() => {
    if (!categorySlug || !province) {
      setSupplyCount(null);
      return;
    }
    let cancelled = false;
    setSupplyChecking(true);
    const t = setTimeout(async () => {
      const { data, error } = await supabase.rpc("count_active_pros", {
        _category_slug: categorySlug,
        _province: province,
        _city: city || null,
      });
      if (cancelled) return;
      setSupplyChecking(false);
      if (error) {
        setSupplyCount(null);
        return;
      }
      setSupplyCount(typeof data === "number" ? data : null);
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [categorySlug, province, city]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !user) return;
    const remaining = MAX_FILES - attachments.length;
    if (remaining <= 0) {
      toast({ title: "Limit reached", description: `You can upload up to ${MAX_FILES} files.`, variant: "destructive" });
      return;
    }
    const picked = Array.from(files).slice(0, remaining);
    setUploading(true);
    const uploaded: Attachment[] = [];
    for (const rawFile of picked) {
      // Compress images >2MB on the client; PDFs/non-images pass through.
      const file = await compressIfImage(rawFile);
      if (file.size > MAX_BYTES) {
        toast({ title: "File too big", description: `"${file.name}" is over 10MB even after compression.`, variant: "destructive" });
        continue;
      }
      const safeName = file.name.replace(/[^\w.-]+/g, "_");
      const path = `${user.id}/${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage
        .from("request-attachments")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) {
        toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
        continue;
      }
      const { data: pub } = supabase.storage.from("request-attachments").getPublicUrl(path);
      uploaded.push({ url: pub.publicUrl, name: file.name, type: file.type, size: file.size });
    }
    setAttachments((prev) => [...prev, ...uploaded]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate(`/register?next=${encodeURIComponent("/requests/new")}`);
      return;
    }
    if (!agreeTerms) {
      toast({ title: "Tick the box, boet", description: "You need to agree to the Terms before posting.", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    const form = new FormData(e.currentTarget as HTMLFormElement);
    const titleVal = String(form.get("title") ?? "");
    const descVal = String(form.get("description") ?? "");
    const reqVal = String(form.get("requirements") ?? "");

    const banned = findProhibited(`${titleVal}\n${descVal}\n${reqVal}`);
    if (banned) {
      toast({ title: "Aikona!", description: PROHIBITED_MESSAGE, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const category = CATEGORIES.find((c) => c.slug === categorySlug);
    const group = CATEGORY_GROUPS.find((g) => g.slug === groupSlug);

    const payload = {
      client_id: user.id,
      title: titleVal,
      description: descVal,
      category_slug: categorySlug,
      category_name: isOtherCategory ? (customCategory || "Other") : (category?.name ?? group?.name ?? "Uncategorised"),
      province: String(form.get("province") ?? ""),
      city: String(form.get("city") ?? ""),
      budget: Number(form.get("budget") ?? 0),
      budget_type: "estimate" as const,
      deadline: form.get("deadline") ? String(form.get("deadline")) : null,
      requirements: reqVal ? [reqVal] : [],
      posted_by_name: user.email?.split("@")[0] ?? null,
      is_urgent: isUrgent,
      attachments: attachments as unknown as Json,
      client_phone: String(form.get("client_phone") ?? "").trim() || null,
      client_email: String(form.get("client_email") ?? "").trim() || (user.email ?? null),
      contact_preference: String(form.get("contact_preference") ?? "whatsapp").toLowerCase(),
    };

    const { data: opp, error } = await supabase
      .from("opportunities")
      .insert([payload])
      .select()
      .single();

    if (error) {
      toast({ title: "Couldn't post your request", description: error.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // Save/update customer profile so they appear in the database.
    const clientPhone = String(form.get("client_phone") ?? "").trim() || null;
    supabase.from("profiles").upsert({
      id: user.id,
      display_name: user.email?.split("@")[0] ?? null,
      phone: clientPhone,
      city: String(form.get("city") ?? "").trim() || null,
      province: String(form.get("province") ?? "").trim() || null,
    }, { onConflict: "id" }).then(({ error }) => { if (error) console.error("[profile upsert]", error); });

    // Notify all matching pros (email + push). Fire and forget.
    supabase.functions
      .invoke("notify-new-job", { body: { opportunity_id: opp.id } })
      .catch((err) => console.error("[notify-new-job]", err));

    setSubmitted(true);
    toast({
      title: "Sharp-sharp!",
      description: "Your request is live. Pros will start sending quotes shortly.",
    });
    setTimeout(() => navigate("/requests"), 1500);
  };

  if (submitted) {
    return (
      <SiteLayout>
        <div className="container py-24 max-w-lg text-center">
          <div className="size-16 rounded-full bg-primary-light text-primary mx-auto flex items-center justify-center mb-6">
            <CheckCircle2 className="size-8" />
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Sharp-sharp!</h1>
          <p className="mt-3 text-ink-2">Your request is live. Pros will start sending quotes shortly.</p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container py-12 max-w-2xl">
        <Link to="/requests" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-4" /> Back to requests
        </Link>
        <header className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Post a Job</span>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-2">
            Tell us what you need.
          </h1>
          <p className="mt-2 text-ink-2">Pros in your area will send you quotes. You contact them directly — no commission.</p>
        </header>

        <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-5 shadow-card">
          <Field label="What can we help you sort out?" required>
            <input required name="title" className="input" placeholder="e.g. Replace a burst geyser in Sandton" />
          </Field>
          <Field label="Describe the job" required>
            <textarea required name="description" rows={4} className="input resize-none" placeholder="Tell pros exactly what's going on. The more detail, the more accurate the quote." />
          </Field>

          {/* Photo / file upload */}
          <div>
            <span className="block text-sm font-semibold mb-1.5">
              Add photos or files <span className="text-muted-foreground font-normal">(optional)</span>
            </span>
            <p className="text-xs text-ink-2 mb-3 leading-relaxed">
              Showing pros exactly what you need helps you get more accurate quotes. Up to {MAX_FILES} images or PDFs, max 10MB each.
            </p>

            {attachments.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                {attachments.map((a, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg border border-border overflow-hidden bg-muted">
                    {a.type.startsWith("image/") ? (
                      <img src={a.url} alt={a.name} className="absolute inset-0 size-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center gap-1.5">
                        <FileText className="size-7 text-muted-foreground" strokeWidth={2} />
                        <span className="text-[10px] font-medium text-ink-2 truncate w-full">{a.name}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="absolute top-1.5 right-1.5 size-6 rounded-full bg-foreground/80 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Remove ${a.name}`}
                    >
                      <X className="size-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED}
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
              disabled={uploading || attachments.length >= MAX_FILES}
            />
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || attachments.length >= MAX_FILES}
              className="gap-2"
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
              {uploading ? "Uploading…" : attachments.length === 0 ? "Add photos or files" : `Add more (${attachments.length}/${MAX_FILES})`}
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Category group" required>
              <select
                required
                className="sjoh-select input"
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
            <Field label="Service" required>
              <select
                required
                className="sjoh-select input"
                value={categorySlug}
                onChange={(e) => { setCategorySlug(e.target.value); setCustomCategory(""); }}
                disabled={!groupSlug}
              >
                <option value="">{groupSlug ? "Select a service" : "Pick a group first"}</option>
                {subCats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </Field>
            {isOtherCategory && (
              <Field label="Describe the service" required>
                <input
                  required
                  className="input"
                  placeholder="e.g. Aquarium cleaning"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </Field>
            )}
            <Field label="Province" required>
              <select
                required
                name="province"
                className="sjoh-select input"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              >
                <option value="">Select a province</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="City / suburb" required>
              <CityAutocomplete required name="city" value={city} onChange={setCity} />
            </Field>
            <Field label="Budget (R)" required>
              <input required name="budget" type="number" min="0" className="input" placeholder="What are you willing to spend?" />
            </Field>
            <Field label="Deadline">
              <input name="deadline" type="date" className="input" />
            </Field>
            <Field label="Contact preference">
              <select name="contact_preference" defaultValue="whatsapp" className="sjoh-select input">
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Phone call</option>
                <option value="email">Email</option>
              </select>
            </Field>
          </div>

          {/* Supply transparency — only show when we know we're thin on the ground. */}
          {categorySlug && province && supplyCount !== null && supplyCount < 5 && !supplyChecking && (
            <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 md:p-5 flex items-start gap-3">
              <span className="size-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <HardHat className="size-5" strokeWidth={2.5} />
              </span>
              <div className="text-sm">
                <div className="font-display font-bold text-base">
                  Sjoh! We're still recruiting top-tier {selectedCategoryName.toLowerCase()} pros in {city ? `${city}, ${province}` : province}.
                </div>
                <p className="text-ink-2 mt-1 leading-relaxed">
                  {supplyCount === 0
                    ? "No matching pros are listed in your area yet — but go ahead and post. We're hustling to bring more on board, and your request helps us prioritise."
                    : `Only ${supplyCount} pro${supplyCount === 1 ? "" : "s"} match right now, so quotes might take a little longer to land. Hang tight — if nothing arrives in 24 hours, we'll suggest top pros from nearby areas.`}
                </p>
              </div>
            </div>
          )}

          {/* Contact details — privacy-promise block */}
          <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-4 md:p-5 space-y-4">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-display font-bold text-base">We take your privacy seriously</div>
                <p className="text-ink-2 mt-1 leading-relaxed">
                  Your phone number and email are <span className="font-semibold text-foreground">never shared with businesses</span> until you explicitly accept their quote. Pros only see the job description and photos.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Phone (for WhatsApp / call)" required>
                <input
                  required
                  name="client_phone"
                  type="tel"
                  className="input"
                  placeholder="082 123 4567"
                  pattern="[0-9+\s\-()]{8,}"
                />
              </Field>
              <Field label="Email">
                <input
                  name="client_email"
                  type="email"
                  className="input"
                  defaultValue={user?.email ?? ""}
                  placeholder="you@email.com"
                />
              </Field>
            </div>
          </div>

          <Field label="Specific requirements">
            <textarea name="requirements" rows={3} className="input resize-none" placeholder="Certifications, references, insurance, etc." />
          </Field>

          <label
            className={`flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer select-none transition-colors ${
              isUrgent ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
            }`}
          >
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="mt-0.5 size-4 rounded border-border text-accent focus:ring-accent cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Siren className="size-4 text-accent" strokeWidth={2.5} />
                <span className="font-display font-bold text-base">Eish! Urgent <span className="text-accent">(Free)</span></span>
              </div>
              <p className="text-sm text-ink-2 mt-1 leading-relaxed">
                Pin this to the top of the feed for 72 hours and instantly alert all Verified Pros within 10km. No charge — just for real emergencies.
              </p>
            </div>
          </label>

          <LiabilityDisclaimer />

          <label className="flex items-start gap-2.5 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              required
            />
            <span className="text-ink-2 leading-relaxed">
              I agree to the <Link to="/terms" className="text-primary font-semibold hover:underline">Terms of Service</Link> and confirm I will not offer or request illegal services.
            </span>
          </label>

          <label className="flex items-start gap-2.5 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              required
              className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
            <span className="text-ink-2 leading-relaxed">
              I understand that Sjoh! will save my contact details and request information to match me with service providers, in accordance with the <Link to="/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</Link>. My phone number and email will only be shared with a pro once I accept their quote.
            </span>
          </label>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button type="submit" size="lg" className="flex-1" disabled={submitting || !agreeTerms || uploading}>
              {submitting ? "Posting your request…" : "Post a Job"}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius);
          font-size: 0.875rem;
          font-family: inherit;
          color: hsl(var(--foreground));
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus {
          outline: none;
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15);
        }
      `}</style>
    </SiteLayout>
  );
};

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <label className="block">
    <span className="block text-sm font-semibold mb-1.5">
      {label} {required && <span className="text-primary">*</span>}
    </span>
    {children}
  </label>
);

export default PostOpportunity;

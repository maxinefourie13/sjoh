import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  LayoutGrid, User, Sparkles, Briefcase, Users, CreditCard, Plus,
  ShieldCheck, Bell, Mail, FileText, MessageCircle, Lock, ArrowUpRight,
  Search, CheckCircle2, Upload, Loader2, AlertCircle,
} from "lucide-react";
import { QuotesSection } from "@/components/dashboard/QuotesSection";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRand } from "@/lib/mockData";
import { useMyBusinessStats } from "@/hooks/useMyBusinessStats";
import { useRecentActivity, timeAgo } from "@/hooks/useRecentActivity";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { VerificationBadges } from "@/components/VerificationBadges";
import { toast } from "@/hooks/use-toast";
import { useVerification } from "@/hooks/useVerification";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { payments } from "@/lib/payments";
import { requestPushPermission, disablePush, isPushConfigured } from "@/lib/push";
import { GoogleReviewsCard } from "@/components/dashboard/GoogleReviewsCard";
import { SubscriptionGapBanner } from "@/components/SubscriptionGapBanner";
import { ProfileVisibilityWarning } from "@/components/ProfileVisibilityWarning";
import { LAUNCH_TRIAL_CODE, TrialCodeRedeemer } from "@/components/TrialCodeRedeemer";
import { ReferAProCard } from "@/components/dashboard/ReferAProCard";
import { SecondaryCategoriesCard } from "@/components/dashboard/SecondaryCategoriesCard";
import { BusinessGalleryCard } from "@/components/dashboard/BusinessGalleryCard";
import { PrivacySection } from "@/components/dashboard/PrivacySection";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { cn } from "@/lib/utils";

type SectionKey = "overview" | "quotes" | "verification" | "profile" | "promotions" | "opportunities" | "followers" | "billing" | "privacy";
const SECTIONS: { key: SectionKey; label: string; icon: typeof LayoutGrid }[] = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "quotes", label: "Quotes I sent", icon: FileText },
  { key: "verification", label: "Verification", icon: ShieldCheck },
  { key: "profile", label: "My Profile", icon: User },
  { key: "promotions", label: "Promotions", icon: Sparkles },
  { key: "opportunities", label: "Job pipeline", icon: Briefcase },
  { key: "followers", label: "Followers", icon: Users },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "privacy", label: "Data & Privacy", icon: Lock },
];

const Dashboard = () => {
  const [section, setSection] = useState<SectionKey>("overview");
  const { user } = useAuth();
  const { business } = useMyBusiness();
  const access = useProviderAccess();
  const [params, setParams] = useSearchParams();
  const sectionParam = params.get("section");

  useEffect(() => {
    if (params.get("paid") === "1") {
      toast({
        title: "Sharp! Plan sorted.",
        description: "Your subscription is active. Back to work!",
      });
      params.delete("paid");
      setParams(params, { replace: true });
    }
    if (params.get("boost") === "success") {
      toast({
        title: "Boosted, boet!",
        description: "Your job is now pinned to the top of the feed for 72 hours.",
      });
      params.delete("boost");
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  useEffect(() => {
    if (sectionParam && SECTIONS.some((s) => s.key === sectionParam)) {
      setSection(sectionParam as SectionKey);
    }
  }, [sectionParam]);

  const jumpToSection = (next: SectionKey) => {
    setSection(next);
    const nextParams = new URLSearchParams(params);
    nextParams.set("section", next);
    setParams(nextParams, { replace: true });
  };

  const sidebarName =
    business?.name ||
    (user?.user_metadata?.display_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Your account";
  const sidebarRole =
    access.tier === "verified_pro" || access.tier === "verified_pro_trial" ? "Verified Pro"
    : access.tier === "basic" || access.tier === "basic_trial" ? "Basic listing"
    : "No active plan";
  const sidebarInitial = sidebarName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-dvh flex-col bg-[#e9ecef] text-sa-dark">
      <SiteHeader />
      <div className="flex-1 container py-8">
        <div className="grid lg:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar */}
          <aside>
            <div className="sticky top-36 rounded-[2rem] border border-white/70 bg-white/62 p-4 shadow-[0_24px_70px_-45px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="size-12 rounded-2xl flex items-center justify-center font-display font-black text-sa-dark bg-sa-gold border-[5px] border-[#e9ecef] shadow-lg">
                  {sidebarInitial}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black truncate">{sidebarName}</p>
                  <p className="text-xs text-sa-dark/55 truncate">{sidebarRole}</p>
                </div>
              </div>
              <nav className="mt-3 space-y-0.5">
                {SECTIONS.map((s) => {
                  const Icon = s.icon;
                  const active = section === s.key;
                  return (
                    <button
                      key={s.key}
                      onClick={() => jumpToSection(s.key)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold rounded-full transition-colors text-left",
                        active ? "bg-sa-dark text-white shadow-sm" : "text-sa-dark/62 hover:bg-white/75 hover:text-sa-dark",
                      )}
                    >
                      <Icon className="size-4" />
                      {s.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="space-y-6">
            {section === "overview" && <OverviewSection onJump={jumpToSection} />}
            {section === "quotes" && <QuotesSection />}
            {section === "verification" && <VerificationSection />}
            {section === "profile" && <ProfileSection />}
            {section === "promotions" && <PromotionsSection />}
            {section === "opportunities" && <OpportunitiesSection />}
            {section === "followers" && <FollowersSection />}
            {section === "billing" && <BillingSection />}
            {section === "privacy" && <PrivacySection />}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="rounded-[1.5rem] border border-white/70 bg-white/65 p-5 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.45)] backdrop-blur-xl">
    <div className="flex items-center justify-between">
      <span className="text-xs font-black uppercase tracking-widest text-sa-dark/45">{label}</span>
      {hint && <span className="text-xs text-sa-green font-bold">{hint}</span>}
    </div>
    <p className="font-display text-4xl font-black tabular-nums mt-4">{value}</p>
  </div>
);

const OverviewSection = ({ onJump }: { onJump: (s: SectionKey) => void }) => {
  const { user } = useAuth();
  const access = useProviderAccess();
  const { business } = useMyBusiness();
  const stats = useMyBusinessStats(business?.id);
  const activity = useRecentActivity(business?.id);
  const firstName =
    (user?.user_metadata?.display_name as string | undefined)?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "boet";

  const planLabel =
    access.tier === "verified_pro" ? "Verified Pro"
    : access.tier === "basic" ? "Basic Listing"
    : access.tier === "verified_pro_trial" ? "Verified Pro · Trial"
    : access.tier === "basic_trial" ? "Basic · Trial"
    : access.tier === "locked" ? "Account paused"
    : "No plan";

  const profileUrl = business ? `${window.location.origin}/business/${business.slug}` : null;
  const copyProfileLink = async () => {
    if (!profileUrl) return;
    await navigator.clipboard.writeText(profileUrl);
    toast({ title: "Link copied", description: "Paste it into WhatsApp, Insta bio, or wherever your customers hang out." });
  };

  return (
    <>
      <SubscriptionGapBanner />
      <ProfileVisibilityWarning />
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight">
            Howzit, {firstName}. Ready to dala what you must?
          </h1>
          <p className="text-sm text-sa-dark/58 mt-1">Your activity over the last 30 days.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-full bg-sa-dark text-white hover:bg-sa-dark/90">
            <Link to="/leads"><Search className="size-4" />Browse opportunities</Link>
          </Button>
          <Button onClick={() => onJump("promotions")} variant="outline" className="rounded-full bg-white/60">
            <Plus className="size-4" />Add Promotion
          </Button>
        </div>
      </header>

      {/* Plan highlight */}
      <button
        onClick={() => onJump("billing")}
        className="relative w-full overflow-hidden text-left text-white rounded-[2rem] p-6 flex items-center justify-between gap-5 hover:opacity-95 transition-opacity shadow-[0_24px_70px_-45px_rgba(0,0,0,0.65)]"
        style={{ background: "linear-gradient(135deg, #050505 0%, #0f2d1d 54%, var(--sa-green) 100%)" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(255,178,38,0.28),transparent_28%)]" />
        <div className="flex items-center gap-4">
          <span className="relative size-12 rounded-2xl bg-sa-gold text-sa-dark flex items-center justify-center">
            <CreditCard className="size-6" strokeWidth={2.5} />
          </span>
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">Your plan</p>
            <p className="font-display text-3xl font-semibold mt-1">
              {planLabel}
              {access.isOnTrial && (
                <span className="text-base text-white/60 font-normal"> · {access.trialDaysLeft}d left</span>
              )}
            </p>
          </div>
        </div>
        <span className="relative grid size-11 place-items-center rounded-full bg-white text-sa-dark">
          <ArrowUpRight className="size-4" strokeWidth={3} />
        </span>
      </button>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.profileViews !== null && (
          <StatCard
            label="Profile views"
            value={stats.profileViews.toLocaleString("en-ZA")}
          />
        )}
        <StatCard
          label="Enquiries (30d)"
          value={stats.loading ? "…" : stats.enquiries30d.toLocaleString("en-ZA")}
        />
        <StatCard
          label="Followers"
          value={stats.loading ? "…" : stats.followers.toLocaleString("en-ZA")}
        />
      </div>

      <div className="rounded-[2rem] border border-white/70 bg-white/65 p-6 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-sa-gold">Your next best steps</p>
            <h2 className="font-display text-xl font-black mt-1">Get found, quote, get paid, build trust.</h2>
            <p className="text-sm text-sa-dark/60 mt-1 max-w-2xl">
              Sjoh works best when your profile is ready before you send quotes. Then accepted jobs move into your pipeline for invoices and reviews.
            </p>
          </div>
        </div>
        <div className="mt-5 grid md:grid-cols-4 gap-3">
          {[
            { label: "1. Finish profile", body: "Add services, photos and service areas.", action: "Profile", onClick: () => onJump("profile") },
            { label: "2. Build trust", body: "Verify your ID and connect review proof.", action: "Verify", onClick: () => onJump("verification") },
            { label: "3. Quote jobs", body: "Find customer requests worth replying to.", action: "Browse", href: "/leads" },
            { label: "4. Close the loop", body: "Invoice accepted work and collect reviews.", action: "Pipeline", onClick: () => onJump("opportunities") },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-sa-dark/10 bg-white/70 p-4">
              <p className="font-black text-sm">{item.label}</p>
              <p className="text-xs text-sa-dark/58 mt-1 min-h-8">{item.body}</p>
              {item.href ? (
                <Button asChild size="sm" variant="outline" className="mt-3 rounded-full">
                  <Link to={item.href}>{item.action}</Link>
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="mt-3 rounded-full" onClick={item.onClick}>
                  {item.action}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/70 bg-white/65 p-6 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <h2 className="font-display text-xl font-black mb-4">Recent activity</h2>
        {activity.loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : activity.items.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-ink-2">No activity yet, boet.</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Once customers follow you, reveal your contact, or you send a quote — you'll see it here.
            </p>
            {profileUrl && (
              <Button size="sm" variant="outline" onClick={copyProfileLink}>
                Copy your profile link
              </Button>
            )}
          </div>
        ) : (
          <ul className="space-y-3 text-sm">
            {activity.items.map((it) => (
              <li key={it.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span>{it.label}</span>
                <span className="text-xs text-sa-dark/45">{timeAgo(it.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ReferAProCard />
    </>
  );
};

const VerificationSection = () => {
  const verification = useVerification();
  const { business } = useMyBusiness();
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const verifyLabel: Record<typeof verification.status, string> = {
    not_required: "Start ID check",
    required: "Start ID check",
    pending: "Checking…",
    processing: "Checking…",
    verified: "✓ Verified",
    failed: "Try again",
    needs_review: "Upload clearer photo",
    expired: "Re-verify",
  };

  const verifyHint: Record<typeof verification.status, string> = {
    not_required: "Upload your ID document when you're ready. You can still set up your profile before verification clears.",
    required: "Upload your ID document to unlock quoting and job applications.",
    pending: "Your ID check is queued. Keep setting up your profile while we process it.",
    processing: "Sjoh is checking the document. You can keep editing your profile while you wait.",
    verified: verification.expiresAt
      ? `Re-verify by ${new Date(verification.expiresAt).toLocaleDateString("en-ZA")}`
      : "ID document checked by Sjoh. You can apply for jobs and send quotes.",
    failed: verification.latestSubmission?.failure_reason ?? "We couldn't match the details. Try again with a clearer ID photo.",
    needs_review: verification.latestSubmission?.failure_reason ?? "We couldn't read the document clearly. Upload a sharper photo.",
    expired: "Your ID check expired. Re-verify to bring back your badge.",
  };

  const canSubmit =
    Boolean(business?.id) &&
    Boolean(fullName.trim()) &&
    idNumber.replace(/\D/g, "").length === 13 &&
    Boolean(file) &&
    !submitting &&
    verification.status !== "pending" &&
    verification.status !== "processing" &&
    verification.status !== "verified";

  const handleSubmit = async () => {
    if (!business?.id || !file) return;
    setSubmitting(true);
    await verification.submitDocumentCheck({
      businessId: business.id,
      fullName,
      idNumber,
      file,
    });
    setSubmitting(false);
  };

  return (
    <>
      <header>
        <h1 className="font-display text-3xl font-medium tracking-tight">Verification</h1>
        <p className="text-sm text-ink-2 mt-1">Your trust badge, visible on every listing.</p>
      </header>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" /> Sjoh ID Check
            </h2>
            <p className="text-sm text-ink-2 mt-1">
              We match your typed name and SA ID number to your uploaded ID document. No selfie. No complicated portal.
            </p>
          </div>
          {verification.status === "verified" && (
            <span className="inline-flex items-center gap-2 rounded-full bg-sa-green/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-sa-green">
              <CheckCircle2 className="size-3.5" /> Checked
            </span>
          )}
        </div>
        <div className="mt-5">
          <VerificationBadges
            idVerified={verification.isIdVerified}
            certifiedPro={false}
            certifications={[]}
          />
        </div>
        <div className="mt-5 grid lg:grid-cols-[1.3fr_0.7fr] gap-3">
          <div className="border border-border rounded-lg p-4">
            <p className="text-sm font-semibold">ID document check</p>
            <p className="text-xs text-muted-foreground mt-1">{verifyHint[verification.status]}</p>

            {["failed", "needs_review"].includes(verification.status) && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>Make sure the name and ID number are readable and match what you type below.</span>
              </div>
            )}

            <div className="mt-4 grid gap-3">
              <Input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Full name as it appears on your ID"
                disabled={verification.status === "pending" || verification.status === "processing" || verification.status === "verified"}
              />
              <Input
                value={idNumber}
                onChange={(event) => setIdNumber(event.target.value.replace(/\D/g, "").slice(0, 13))}
                inputMode="numeric"
                maxLength={13}
                placeholder="13-digit South African ID number"
                disabled={verification.status === "pending" || verification.status === "processing" || verification.status === "verified"}
              />
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-background px-3 py-3 text-sm">
                <span className="min-w-0 truncate text-muted-foreground">
                  {file ? file.name : "Upload a clear ID photo"}
                </span>
                <Upload className="size-4 shrink-0 text-primary" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  className="sr-only"
                  disabled={verification.status === "pending" || verification.status === "processing" || verification.status === "verified"}
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <Button
              size="sm"
              variant={verification.status === "verified" ? "outline" : "default"}
              className="mt-3"
              disabled={verification.loading || !canSubmit}
              onClick={handleSubmit}
            >
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {verifyLabel[verification.status]}
            </Button>
            {!business?.id && (
              <p className="mt-2 text-xs text-muted-foreground">List your business first, then run the ID check.</p>
            )}
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="text-sm font-semibold">Trade certificates</p>
            <p className="text-xs text-muted-foreground mt-1">
              Got a Wireman's Licence, PIRB, or trade qualification? Certificate uploads are landing soon so you can claim your Certified Pro badge too.
            </p>
          </div>
        </div>
      </div>

      <NotificationPrefsCard />
    </>
  );
};

const ProfileSection = () => {
  const { user } = useAuth();
  const { business, refresh } = useMyBusiness();
  const [myBiz, setMyBiz] = useState<{ id: string; category_slug: string } | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", website: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [galleryCount, setGalleryCount] = useState(0);
  const hasContact = Boolean(form.phone.trim() || form.email.trim());
  const hasDescription = form.description.trim().length >= 40;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("businesses")
        .select("id, category_slug")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (data) setMyBiz({ id: data.id, category_slug: data.category_slug });
    })();
  }, [user]);

  useEffect(() => {
    if (business) {
      setForm({
        name: business.name ?? "",
        phone: business.phone ?? "",
        email: business.email ?? "",
        website: business.website ?? "",
        description: business.description ?? "",
      });
    }
  }, [business]);

  const onSave = async () => {
    if (!business?.id) return;
    setSaving(true);
    const { error } = await supabase
      .from("businesses")
      .update({
        name: form.name,
        phone: form.phone || null,
        email: form.email || null,
        website: form.website || null,
        description: form.description || null,
      })
      .eq("id", business.id);
    setSaving(false);
    if (error) {
      toast({ title: "Aikona, couldn't save.", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Sharp! Profile updated.", description: "Your changes are live." });
    refresh?.();
  };

  if (!business) {
    return (
      <>
        <header>
          <h1 className="font-display text-3xl font-medium tracking-tight">My Profile</h1>
          <p className="text-sm text-ink-2 mt-1">Edit how your business appears on Sjoh.</p>
        </header>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-sm text-ink-2">
            You haven't listed your business yet.
          </p>
          <Button asChild className="mt-4"><Link to="/list">List your business</Link></Button>
        </div>
        <DbStyle />
      </>
    );
  }

  return (
    <>
      <header>
        <h1 className="font-display text-3xl font-medium tracking-tight">Profile & portfolio</h1>
        <p className="text-sm text-ink-2 mt-1">Make the page customers see after your quote feel trustworthy and ready to hire.</p>
      </header>
      <div className="grid md:grid-cols-4 gap-3">
        {[
          { label: "Business basics", body: "Name, location and contact details.", done: Boolean(form.name.trim() && hasContact) },
          { label: "Clear intro", body: "Tell customers what you do and where you work.", done: hasDescription },
          { label: "Work photos", body: "Add finished jobs, team shots or before/after photos below.", done: galleryCount > 0 },
          { label: "Trust proof", body: "Connect reviews and finish verification next.", done: Boolean(business.google_place_id) },
        ].map((item) => (
          <div
            key={item.label}
            className={cn(
              "rounded-2xl border p-4",
              item.done ? "border-sa-green/30 bg-sa-green/10" : "border-border bg-card",
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn("size-5 rounded-full flex items-center justify-center", item.done ? "bg-sa-green text-white" : "bg-secondary text-muted-foreground")}>
                {item.done ? <CheckCircle2 className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
              </span>
              <p className="text-sm font-black">{item.label}</p>
            </div>
            <p className="text-xs text-ink-2 mt-2 leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div>
          <h2 className="font-display text-xl font-black tracking-tight">Business details</h2>
          <p className="text-sm text-ink-2 mt-1">This copy appears on your public profile and beside your quotes.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Business name">
            <input className="db-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Phone">
            <input className="db-input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </Field>
          <Field label="Email">
            <input className="db-input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </Field>
          <Field label="Website">
            <input className="db-input" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
          </Field>
        </div>
        <Field label="Profile intro">
          <textarea
            rows={4}
            className="db-input resize-none"
            placeholder="Example: Family-run electrical team helping homes and small businesses across Sandton with COCs, fault finding, lighting and emergency repairs."
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <span className="block text-xs text-ink-2 mt-1.5">Aim for 2-3 plain-English sentences. Customers should know what you do, where you work, and why they can trust you.</span>
        </Field>
        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button variant="outline" onClick={() => business && setForm({
            name: business.name ?? "", phone: business.phone ?? "", email: business.email ?? "",
            website: business.website ?? "", description: business.description ?? "",
          })}>Cancel</Button>
          <Button onClick={onSave} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
        </div>
      </div>
      <BusinessGalleryCard businessId={business.id} onCountChange={setGalleryCount} />
      {myBiz && (
        <SecondaryCategoriesCard
          businessId={myBiz.id}
          primaryCategorySlug={myBiz.category_slug}
        />
      )}
      <GoogleReviewsCard />
      <DbStyle />
    </>
  );
};

interface PromotionRow {
  id: string;
  title: string;
  description: string | null;
  expires_at: string | null;
  is_active: boolean;
}

const PromotionsSection = () => {
  const { business } = useMyBusiness();
  const [items, setItems] = useState<PromotionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!business?.id) { setItems([]); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("promotions")
        .select("id, title, description, expires_at, is_active")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false });
      if (!cancelled) {
        setItems((data ?? []) as PromotionRow[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [business?.id]);

  return (
    <>
      <header>
        <h1 className="font-display text-3xl font-medium tracking-tight">Promotions</h1>
        <p className="text-sm text-ink-2 mt-1">Run limited-time offers to attract new customers.</p>
      </header>
      {loading ? (
        <div className="bg-card border border-border rounded-xl p-6 text-sm text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Sparkles className="size-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-semibold">No active promotions yet</p>
          <p className="text-xs text-ink-2 mt-1 max-w-sm mx-auto">
            Limited-time offers will show up on your profile and in search results once you create one.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-primary-light text-primary px-2 py-0.5 rounded">
                    {p.is_active ? "Active" : "Ended"}
                  </span>
                  <h3 className="font-semibold">{p.title}</h3>
                </div>
                {p.description && <p className="text-sm text-ink-2 mt-1">{p.description}</p>}
                {p.expires_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Expires {new Date(p.expires_at).toLocaleDateString("en-ZA")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

interface WonJobRow {
  id: string;
  status: string;
  quote_amount: number | null;
  created_at: string;
  opportunity_id: string;
  opportunity: { title: string; city: string; budget: number | null } | null;
}

const OpportunitiesSection = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<WonJobRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("proposals")
        .select("id, status, quote_amount, created_at, opportunity_id, opportunity:opportunities(title, city, budget)")
        .eq("provider_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (!cancelled) {
        setItems((data ?? []) as unknown as WonJobRow[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  return (
    <>
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Job pipeline</h1>
        <p className="text-sm text-ink-2 mt-1">Track quotes you've sent, accepted jobs, and what needs your next action.</p>
      </header>
      {loading ? (
        <div className="bg-card border border-border rounded-xl p-6 text-sm text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Briefcase className="size-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-semibold">No quotes sent yet</p>
          <p className="text-xs text-ink-2 mt-1">Browse opportunities and send your first quote.</p>
          <Button asChild size="sm" className="mt-4"><Link to="/leads">Browse opportunities →</Link></Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {items.map((m) => (
            <div key={m.id} className="p-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <Link to={`/requests/${m.opportunity_id}`} className="font-semibold text-sm hover:text-primary truncate block">
                  {m.opportunity?.title ?? "Untitled job"}
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {m.opportunity?.city ?? "—"} · {m.quote_amount ? formatRand(Number(m.quote_amount)) : "Quote on inspection"}
                </p>
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded whitespace-nowrap",
                m.status === "accepted" ? "bg-primary-light text-primary"
                  : m.status === "rejected" ? "bg-secondary text-muted-foreground"
                  : "bg-accent/15 text-accent",
              )}>
                {m.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

interface FollowerRow {
  follower_id: string;
  created_at: string;
  profile: { display_name: string | null } | null;
}

const FollowersSection = () => {
  const { business } = useMyBusiness();
  const [items, setItems] = useState<FollowerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!business?.id) { setItems([]); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("business_follows")
        .select("follower_id, created_at, profile:profiles(display_name)")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false });
      if (!cancelled) {
        setItems((data ?? []) as unknown as FollowerRow[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [business?.id]);

  return (
    <>
      <header>
        <h1 className="font-display text-3xl font-medium tracking-tight">Followers</h1>
        <p className="text-sm text-ink-2 mt-1">
          {loading ? "Loading…" : `${items.length} ${items.length === 1 ? "person follows" : "people follow"} your business.`}
        </p>
      </header>
      {!loading && items.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Users className="size-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-semibold">No followers yet</p>
          <p className="text-xs text-ink-2 mt-1">Once customers follow you, you'll see them here.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {items.map((f) => {
            const name = f.profile?.display_name?.trim() || "Sjoh customer";
            return (
              <div key={f.follower_id} className="p-4 flex items-center gap-3">
                <div className="size-9 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold">
                  {name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{name}</span>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-xs text-ink-2 mt-3">
        Followers see your updates and promotions. Direct messaging isn't part of Sjoh — keep contact on the public profile so customers reach you on your terms.
      </p>
    </>
  );
};


const BillingSection = () => {
  const { user } = useAuth();
  const access = useProviderAccess();
  const [liveSub, setLiveSub] = useState<{
    billing_cycle: "monthly" | "annual";
    next_renewal_at: string | null;
    tier: string | null;
  } | null>(null);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("provider_balances")
        .select("billing_cycle, next_renewal_at, tier")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setLiveSub(data as typeof liveSub);
    })();
  }, [user]);

  const isPaid = liveSub?.tier === "basic" || liveSub?.tier === "verified_pro";
  const isMonthlyPaid = isPaid && liveSub?.billing_cycle === "monthly";
  const monthlyPrice = liveSub?.tier === "verified_pro" ? 250 : liveSub?.tier === "basic" ? 50 : 0;
  const yearlySaving = monthlyPrice * 12 - Math.round(monthlyPrice * 12 * 0.9);
  const currentPlanName =
    access.tier === "verified_pro" ? "Verified Pro"
    : access.tier === "basic" ? "Basic Listing"
    : access.tier === "verified_pro_trial" ? "Verified Pro · Trial"
    : access.tier === "basic_trial" ? "Basic Listing · Trial"
    : access.tier === "locked" ? "Account paused"
    : "No active plan";
  const currentPlanMeta = isPaid
    ? liveSub?.billing_cycle === "annual"
      ? `${formatRand(Math.round(monthlyPrice * 12 * 0.9))} /year · billed yearly`
      : `${formatRand(monthlyPrice)} /month`
    : access.isOnTrial
      ? `${access.trialDaysLeft} day${access.trialDaysLeft === 1 ? "" : "s"} left on trial`
      : access.isLocked
        ? "Subscribe to bring your profile back"
        : `Use ${LAUNCH_TRIAL_CODE} for 30 days free, or subscribe for R250/month`;

  const switchToAnnual = async () => {
    if (!liveSub?.tier || (liveSub.tier !== "basic" && liveSub.tier !== "verified_pro")) return;
    setSwitching(true);
    await payments.startSubscription(liveSub.tier as "basic" | "verified_pro", "annual");
    setSwitching(false);
  };

  const renewalLabel = liveSub?.next_renewal_at
    ? new Date(liveSub.next_renewal_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <>
      <header>
        <h1 className="font-display text-3xl font-medium tracking-tight">Billing</h1>
        <p className="text-sm text-ink-2 mt-1">Manage your plan and payment details.</p>
      </header>

      {/* No-commission promise — kills the "hidden costs" fear */}
      <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <span className="size-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-display font-extrabold">0%</span>
          <div className="min-w-0">
            <p className="font-display text-base font-extrabold tracking-tight">0% commission. You keep every cent you earn.</p>
            <p className="text-sm text-ink-2 mt-1">
              Your monthly fee covers <strong>unlimited quotes</strong>, your directory listing, and customer alerts.
              No per-message fees, no per-job cuts, no payment-provider surprises — clients pay you directly.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-foreground text-background rounded-xl p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-background/70">Current plan</p>
        <p className="font-display text-3xl font-semibold mt-2">{currentPlanName}</p>
        <p className="text-sm text-background/75 mt-1">
          {currentPlanMeta}
        </p>
        {renewalLabel && (
          <p className="text-xs text-background/60 mt-1">Next renewal: {renewalLabel}</p>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
            <Link to="/pricing">Change Plan</Link>
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
            <a href="mailto:hello@sjoh.co.za?subject=Cancel%20my%20Sjoh%20subscription">Cancel Plan</a>
          </Button>
        </div>
      </div>

      {!isPaid && !access.isOnTrial && (
        <TrialCodeRedeemer tone="light" successRedirect="/dashboard?section=billing&trial=1" reloadOnSuccess />
      )}

      {/* Switch-to-yearly nudge for monthly paid subscribers */}
      {isMonthlyPaid && yearlySaving > 0 && (
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-display text-base font-extrabold tracking-tight">
              Same plan, {formatRand(yearlySaving)} less. Switch to yearly?
            </p>
            <p className="text-sm text-ink-2 mt-1">
              Pay for the year and save 10%. Sorted.
            </p>
          </div>
          <Button onClick={switchToAnnual} disabled={switching} className="shrink-0">
            {switching ? "Sorting…" : "Switch to yearly"}
          </Button>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-display text-lg font-semibold mb-4">Payment method</h3>
        <p className="text-sm text-muted-foreground">
          Your subscription is managed securely by PayFast. To change your plan, use the buttons above. To cancel during launch, email us and we’ll confirm once it is stopped.
        </p>
      </div>
    </>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="block text-sm font-semibold mb-1.5">{label}</span>
    {children}
  </label>
);

const DbStyle = () => (
  <style>{`
    .db-input { width: 100%; padding: 0.625rem 0.875rem; background: hsl(var(--background));
      border: 1px solid hsl(var(--border)); border-radius: var(--radius);
      font-size: 0.875rem; font-family: inherit; color: hsl(var(--foreground));
      transition: border-color 0.15s, box-shadow 0.15s; }
    .db-input:focus { outline: none; border-color: hsl(var(--primary)); box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15); }
  `}</style>
);

const NotificationPrefsCard = () => {
  const { user } = useAuth();
  const [emailOn, setEmailOn] = useState(true);
  const [pushOn, setPushOn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"email" | "push" | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("provider_balances")
        .select("email_alerts_optin, push_alerts_optin")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setEmailOn(data.email_alerts_optin ?? true);
        setPushOn(data.push_alerts_optin ?? false);
      }
      setLoading(false);
    })();
  }, [user]);

  const toggleEmail = async () => {
    setBusy("email");
    const next = !emailOn;
    const { error } = await supabase.rpc("set_email_alerts_optin", { _enabled: next });
    if (error) {
      toast({ title: "Eish, couldn't save", description: error.message, variant: "destructive" });
    } else {
      setEmailOn(next);
      toast({ title: next ? "Email alerts on ⚡" : "Email alerts off", description: next ? "We'll holla when fresh graft lands." : "We'll keep schtum on email." });
    }
    setBusy(null);
  };

  const togglePush = async () => {
    setBusy("push");
    try {
      if (!pushOn) {
        if (!isPushConfigured()) {
          toast({ title: "Push not ready yet", description: "Sjoh! is still wiring up push notifications. Try again soon.", variant: "destructive" });
          setBusy(null);
          return;
        }
        const id = await requestPushPermission();
        if (id) {
          setPushOn(true);
          toast({ title: "Push alerts on 🔔", description: "We'll buzz you the second a job lands." });
        } else {
          toast({ title: "Permission needed", description: "Allow notifications in your browser to enable push.", variant: "destructive" });
        }
      } else {
        await disablePush();
        setPushOn(false);
        toast({ title: "Push alerts off", description: "No more buzzes. Sharp." });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      toast({ title: "Aikona, push failed", description: message, variant: "destructive" });
    }
    setBusy(null);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start gap-3 mb-5">
        <span className="size-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
          <Bell className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold">Job alerts</h2>
          <p className="text-sm text-ink-2 mt-1">
            Get notified the second new graft lands in your category &amp; city.
          </p>
        </div>
      </div>

      {/* Email */}
      <div className="flex items-center justify-between gap-3 py-3 border-t border-border">
        <div className="flex items-start gap-3 min-w-0">
          <Mail className="size-4 text-ink-2 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold">Email me when new jobs land</p>
            <p className="text-xs text-muted-foreground mt-0.5">Inbox alert with the brief + budget. Capped at 5/day.</p>
          </div>
        </div>
        <button
          onClick={toggleEmail}
          disabled={loading || busy === "email"}
          className={cn(
            "relative w-12 h-7 rounded-full transition-colors shrink-0 disabled:opacity-50",
            emailOn ? "bg-accent" : "bg-secondary",
          )}
          aria-label="Toggle email alerts"
        >
          <span className={cn(
            "absolute top-0.5 size-6 rounded-full bg-white shadow-sm transition-transform",
            emailOn ? "translate-x-5" : "translate-x-0.5",
          )} />
        </button>
      </div>

      {/* Push */}
      <div className="flex items-center justify-between gap-3 py-3 border-t border-border">
        <div className="flex items-start gap-3 min-w-0">
          <Bell className="size-4 text-ink-2 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold">Browser push notifications</p>
            <p className="text-xs text-muted-foreground mt-0.5">Instant buzz on your phone or laptop. No email noise.</p>
          </div>
        </div>
        {pushOn ? (
          <Button size="sm" variant="outline" onClick={togglePush} disabled={busy === "push"} className="shrink-0">
            {busy === "push" ? "..." : "Disable"}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={togglePush}
            disabled={busy === "push"}
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold shrink-0 gap-1.5"
          >
            <Bell className="size-3.5" strokeWidth={2.5} />
            {busy === "push" ? "..." : "Enable Job Alerts"}
          </Button>
        )}
      </div>

      {/* WhatsApp is intentionally paused until it is moved off Lovable/Twilio connector. */}
      <div className="py-3 border-t border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <MessageCircle className="size-4 text-ink-2 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">WhatsApp lead alerts</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Coming soon. For launch, email and browser alerts keep fresh jobs moving without relying on the old Lovable connector.
              </p>
            </div>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
            Coming soon
          </span>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          This keeps the launch build independent from Lovable. Customers can still contact you by WhatsApp from your public profile.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Phone, Mail, MessageCircle, MapPin, Clock, Globe, ShieldCheck, FileText } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { BUSINESS_VERIFICATION, formatRand } from "@/lib/mockData";
import { VerificationBadges } from "@/components/VerificationBadges";
import { ReportProfileButton } from "@/components/ReportProfileButton";
import { PublicBusinessGallery } from "@/components/PublicBusinessGallery";
import { SeoHead } from "@/components/SeoHead";
import { useBusinessBySlug } from "@/hooks/useBusinessBySlug";
import { useReveal } from "@/hooks/useReveal";
import { useRevealContact } from "@/hooks/useRevealContact";
import { useVerifiedHiresCount } from "@/hooks/useVerifiedHiresCount";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type TabKey = "about" | "services" | "promotions" | "reviews";
const TABS: { key: TabKey; label: string }[] = [
  { key: "about", label: "About" },
  { key: "services", label: "Services" },
  { key: "promotions", label: "Promotions" },
  { key: "reviews", label: "Reviews" },
];

interface LiveGoogleData {
  id: string;
  google_place_id?: string | null;
  google_maps_url: string | null;
  google_rating: number | null;
  google_review_count: number | null;
}

const Reveal = ({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={cn(
        "transition-all duration-700 ease-out will-change-[opacity,transform]",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BusinessProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const { business, googleRating, googleReviewCount, googleMapsUrl, loading } = useBusinessBySlug(slug);
  const [tab, setTab] = useState<TabKey>("about");
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const { count: verifiedHires } = useVerifiedHiresCount(business?.id);
  // Hooks are called unconditionally above the early returns to keep hook
  // order stable across slug changes.
  const { user } = useAuth();
  const { contact: revealed, loading: revealing, reveal } = useRevealContact(business?.id);

  // Sync follower count when business resolves or changes.
  // Doing this in an effect (not in the render body) avoids a render-phase
  // setState which logs a warning and can re-render-loop under StrictMode.
  useEffect(() => {
    if (business) setFollowers(business.followers ?? 0);
  }, [business]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="container py-24 text-center text-muted-foreground">Loading…</div>
      </SiteLayout>
    );
  }

  if (!business) {
    return (
      <SiteLayout>
        <div className="container py-24 text-center">
          <h1 className="font-display text-3xl font-medium">Sjoh, can't find that one.</h1>
          <Link to="/directory" className="text-primary hover:underline mt-4 inline-block">
            Back to directory
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const live: LiveGoogleData | null = googleRating !== null || googleMapsUrl
    ? { id: business.id, google_maps_url: googleMapsUrl, google_rating: googleRating, google_review_count: googleReviewCount }
    : null;

  const toggleFollow = () => {
    setFollowing((f) => {
      const next = !f;
      setFollowers((c) => (next ? c + 1 : c - 1));
      return next;
    });
  };

  // Bot protection: never inline phone/email in the public HTML. Visitors must
  // click "Reveal" (which is auth-gated + rate-limited server-side) before any
  // contact details are rendered. This prevents scraping while keeping it easy
  // for real humans (and Grandmas) to see.
  const phone = revealed?.phone ?? "";
  const email = revealed?.email ?? "";
  const hasContact = !!(phone || email);
  const phoneDigits = phone.replace(/\D/g, "");

  const handleReveal = async () => { await reveal(); };

  const seoTitle = `${business.name} | ${business.category} in ${business.city} | Sjoh!`;
  const seoDesc = (business.description || `${business.name} — ${business.category} in ${business.city}, ${business.province}. Find someone who can do it properly on Sjoh.`).slice(0, 158);
  const canonical = typeof window !== "undefined" ? `${window.location.origin}/business/${business.slug}` : undefined;

  // LocalBusiness schema — deliberately omits telephone/email so search engines
  // and crawlers don't surface raw contact details to scrapers.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.description ?? undefined,
    image: business.image ?? undefined,
    url: canonical,
    address: {
      "@type": "PostalAddress",
      addressLocality: business.city,
      addressRegion: business.province,
      addressCountry: "ZA",
    },
    aggregateRating: business.rating
      ? { "@type": "AggregateRating", ratingValue: business.rating, reviewCount: Array.isArray(business.reviews) ? business.reviews.length : 0 }
      : undefined,
  };

  return (
    <SiteLayout>
      <SeoHead title={seoTitle} description={seoDesc} canonical={canonical} jsonLd={jsonLd} />
      <div className="bg-[#e9ecef] pb-24">
      {/* Header / cover */}
      <div className="container pt-6">
      <div className={cn("h-[430px] sm:h-[500px] md:h-[560px] relative overflow-hidden rounded-[2.25rem] border border-white/70 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.55)]", !business.image && business.gradient)}>
        {business.image && (
          <>
            <img
              src={business.image}
              alt={`${business.name} — ${business.category}`}
              className="absolute inset-0 size-full object-cover animate-scale-in"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/28 to-black/18" />
          </>
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,178,38,0.28),transparent_30%),radial-gradient(circle_at_78%_30%,rgba(103,127,255,0.22),transparent_28%)]" />
        <div className="h-full relative">
          <Link
            to="/directory"
            className="absolute top-5 left-5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/25 px-3 py-2 text-white/90 hover:text-white text-xs sm:text-sm font-bold backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="size-4" /> <span className="hidden xs:inline">Back to directory</span><span className="xs:hidden">Back</span>
          </Link>
          {business.plan === "featured" && (
            <span className="absolute top-5 right-5 rounded-full border border-white/20 bg-sa-gold text-sa-dark text-[10px] font-black tracking-widest uppercase px-3 py-2 animate-fade-in">
              Featured
            </span>
          )}
          <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
            <Reveal>
              <div className="rounded-[2rem] border border-white/25 bg-white/18 p-5 sm:p-7 text-white shadow-pop backdrop-blur-xl">
                <div className="flex flex-col md:flex-row md:items-end gap-4 sm:gap-5">
                  <div className="relative -mb-1 size-24 sm:size-28 shrink-0">
                    <div className="absolute inset-0 rounded-[2rem] bg-[#e9ecef]" aria-hidden />
                    <div className="absolute left-2 top-2 size-20 sm:size-24 overflow-hidden rounded-[1.45rem] bg-white border-[7px] border-[#e9ecef] shadow-[0_20px_45px_-24px_rgba(0,0,0,0.7)] flex items-center justify-center font-display font-black text-3xl sm:text-4xl text-sa-dark transition-transform duration-500 hover:scale-105">
                      {business.image ? (
                        <img src={business.image} alt={`${business.name} logo`} className="size-full object-cover" />
                      ) : (
                        business.name.charAt(0)
                      )}
                    </div>
                    <Link
                      to={`/requests/new?pro=${business.slug}`}
                      aria-label={`Request a quote from ${business.name}`}
                      className="absolute -right-3 -bottom-3 grid size-11 place-items-center rounded-full border-[7px] border-[#e9ecef] bg-sa-gold text-sa-dark shadow-lg transition hover:rotate-[-12deg] hover:bg-sa-gold/90"
                    >
                      <ArrowUpRight className="size-4" strokeWidth={3} />
                    </Link>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase tracking-widest text-sa-gold">{business.category}</p>
                    <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight break-words mt-1">
                      {business.name}
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-white/78 flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1">
                      <span>{business.city}, {business.province}</span>
                      <span className="opacity-50">·</span>
                      <span>
                        <span className="font-black text-sa-gold">{business.rating.toFixed(1)}</span>{" "}
                        <span className="text-white/68">({business.reviewCount} reviews)</span>
                      </span>
                      <span className="opacity-50">·</span>
                      <span>{followers} followers</span>
                    </p>
                    <div className="mt-3">
                      <VerificationBadges
                        idVerified={BUSINESS_VERIFICATION[business.id]?.idVerified ?? business.isVerified}
                        certifiedPro={BUSINESS_VERIFICATION[business.id]?.certifiedPro ?? false}
                        certifications={BUSINESS_VERIFICATION[business.id]?.certifications ?? []}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant={following ? "soft" : "default"} onClick={toggleFollow} className="rounded-full bg-white text-sa-dark hover:bg-white/90">
                      {following ? "Following" : "Follow"}
                    </Button>
                    {hasContact ? (
                      <Button
                        asChild
                        className="rounded-full bg-sa-gold text-sa-dark hover:bg-sa-gold/90"
                      >
                        <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer">
                          WhatsApp
                        </a>
                      </Button>
                    ) : (
                      <Button onClick={handleReveal} disabled={revealing} className="rounded-full bg-sa-gold text-sa-dark hover:bg-sa-gold/90">
                        {revealing ? "Revealing..." : "Reveal contact"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
      </div>

      <div className="container mt-8 relative pb-28 lg:pb-20">
        <div className="grid lg:grid-cols-[1fr_340px] gap-6 lg:gap-10">
          {/* Main */}
          <div className="min-w-0">
            <Reveal>
              <div className="rounded-[2rem] border border-white/70 bg-white/72 p-4 sm:p-6 md:p-8 shadow-[0_24px_70px_-45px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                {verifiedHires > 0 && (
                  <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-sa-green/10 border border-sa-green/30 px-3 py-1.5 text-xs font-bold text-sa-green">
                    <ShieldCheck className="size-3.5" />
                    {verifiedHires} Verified Job{verifiedHires === 1 ? "" : "s"} Completed via Sjoh
                  </div>
                )}

                {/* Tabs */}
                <div className="border border-black/10 bg-white/65 rounded-full flex gap-1 overflow-x-auto sticky top-28 p-1 z-10 scrollbar-thin backdrop-blur-xl">
                  {TABS.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={cn(
                        "px-4 py-2.5 text-sm font-bold rounded-full transition-all whitespace-nowrap",
                        tab === t.key
                          ? "bg-sa-dark text-white shadow-sm"
                          : "text-sa-dark/55 hover:text-sa-dark hover:bg-white/70",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="mt-6 sm:mt-8 animate-fade-in" key={tab}>
                  {tab === "about" && (
                    <div className="space-y-6 sm:space-y-8">
                      <Reveal>
                        <h2 className="font-display text-lg sm:text-xl font-semibold mb-2 sm:mb-3">About</h2>
                        <p className="text-sm sm:text-base text-ink-2 leading-relaxed">{business.description}</p>
                      </Reveal>
                      <Reveal delay={60}>
                        <PublicBusinessGallery businessId={business.id} />
                      </Reveal>
                      <Reveal delay={80}>
                        <h2 className="font-display text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Services overview</h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {business.services.map((s, i) => (
                            <div
                              key={s.name}
                              style={{ animationDelay: `${i * 60}ms` }}
                              className="border border-black/10 bg-white/70 rounded-2xl p-4 transition-all duration-300 hover:border-sa-gold hover:shadow-soft hover:-translate-y-0.5 animate-fade-up"
                            >
                              <p className="font-semibold text-sm">{s.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                              <p className="mt-3 text-sm font-display font-semibold">
                                {s.priceType === "quote"
                                  ? "On quote"
                                  : `${s.priceType === "from" ? "From " : ""}${formatRand(s.priceFrom)}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </Reveal>
                    </div>
                  )}

                  {tab === "services" && (
                    <div className="space-y-3">
                      {business.services.map((s, i) => (
                        <div
                          key={s.name}
                          style={{ animationDelay: `${i * 50}ms` }}
                          className="border border-black/10 bg-white/70 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-3 sm:gap-4 transition-all duration-300 hover:border-sa-gold hover:shadow-soft hover:-translate-y-0.5 animate-fade-up"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-sm sm:text-base">{s.name}</p>
                            <p className="text-xs sm:text-sm text-ink-2 mt-1">{s.description}</p>
                          </div>
                          <p className="font-display font-semibold text-base sm:text-lg whitespace-nowrap shrink-0">
                            {s.priceType === "quote" ? "On quote" : `${s.priceType === "from" ? "From " : ""}${formatRand(s.priceFrom)}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {tab === "promotions" && (
                    business.hasPromo ? (
                      <Reveal>
                        <div className="rounded-2xl p-5 sm:p-7 bg-gradient-to-br from-accent to-accent/70 text-white shadow-pop">
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-1 rounded">Active promo</span>
                          <h3 className="font-display text-xl sm:text-2xl font-semibold mt-4">Special offer running this month</h3>
                          <p className="mt-2 text-sm sm:text-base text-white/85">Check this business's listing on the directory for the latest discount details.</p>
                        </div>
                      </Reveal>
                    ) : (
                      <p className="text-muted-foreground text-sm">No active promotions right now.</p>
                    )
                  )}

                  {tab === "reviews" && (
                    <div className="space-y-4">
                      {/* Google Reviews display paused for launch — re-add <GoogleReviewsList /> to restore. */}
                      {business.reviews.map((r, i) => (
                        <div
                          key={r.id}
                          style={{ animationDelay: `${i * 60}ms` }}
                          className="border border-black/10 bg-white/70 rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:border-sa-gold hover:shadow-soft animate-fade-up"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm">{r.reviewerName}</p>
                              {r.reviewerCompany && (
                                <p className="text-xs text-muted-foreground truncate">{r.reviewerCompany}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {r.isVerifiedHire && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 border border-accent/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                                  <ShieldCheck className="size-3" />
                                  Verified Hire
                                </span>
                              )}
                              <span className="font-semibold tabular-nums text-accent text-sm">{r.rating}.0 ★</span>
                            </div>
                          </div>
                          <p className="text-sm text-ink-2 mt-3 leading-relaxed">{r.body}</p>
                          <p className="text-xs text-muted-foreground mt-3">{r.date}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <Reveal delay={120}>
              <div className="rounded-[2rem] border border-white/70 bg-white/72 p-5 sm:p-6 shadow-[0_24px_70px_-45px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <h3 className="font-display text-lg font-semibold mb-4">Business details</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2.5">
                    <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="break-words">{business.address}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Phone className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    {phone ? (
                      <a href={`tel:${phone}`} className="hover:text-primary transition-colors break-all">{phone}</a>
                    ) : (
                      <button onClick={handleReveal} className="text-primary hover:underline text-left" disabled={revealing}>
                        {revealing ? "Revealing…" : "Tap to reveal phone"}
                      </button>
                    )}
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Mail className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    {email ? (
                      <a href={`mailto:${email}`} className="hover:text-primary transition-colors break-all">{email}</a>
                    ) : (
                      <button onClick={handleReveal} className="text-primary hover:underline text-left" disabled={revealing}>
                        {revealing ? "Revealing…" : "Tap to reveal email"}
                      </button>
                    )}
                  </li>
                  {business.website && (
                    <li className="flex items-start gap-2.5">
                      <Globe className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                      <a
                        href={business.website.startsWith("http") ? business.website : `https://${business.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors break-all"
                      >
                        {business.website.replace(/^https?:\/\//, "")}
                      </a>
                    </li>
                  )}
                  <li className="flex items-start gap-2.5">
                    <Clock className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-ink-2">{business.hours}</span>
                  </li>
                </ul>
                <div className="mt-5 pt-5 border-t border-border">
                  <p className="text-xs text-muted-foreground">Response rate</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-black/10 overflow-hidden">
                      <div
                        className="h-full bg-sa-green transition-[width] duration-1000 ease-out"
                        style={{ width: `${business.responseRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{business.responseRate}%</span>
                  </div>
                </div>
                {/* Desktop call/whatsapp/email — mobile shows sticky bar instead */}
                {hasContact ? (
                  <div className="hidden sm:grid mt-5 grid-cols-3 gap-2">
                    <Button variant="default" className="w-full transition-all hover:scale-[1.03]" asChild>
                      <a href={`tel:${phone}`}><Phone className="size-4" />Call</a>
                    </Button>
                    <Button variant="outline" className="w-full transition-all hover:scale-[1.03]" asChild>
                      <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="size-4" />WhatsApp
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full transition-all hover:scale-[1.03]" asChild>
                      <a href={`mailto:${email}`}><Mail className="size-4" />Email</a>
                    </Button>
                  </div>
                ) : (
                  <div className="hidden sm:block mt-5">
                    <Button onClick={handleReveal} disabled={revealing} className="w-full">
                      {revealing ? "Revealing…" : "Reveal contact details"}
                    </Button>
                    <p className="text-[11px] text-muted-foreground mt-2 text-center">Sign in required. We hide contact info from scrapers.</p>
                  </div>
                )}
                <div className="mt-5 pt-5 border-t border-border">
                  <Button asChild className="w-full rounded-full bg-sa-gold text-sa-dark hover:bg-sa-gold/90">
                    <Link to={user ? `/requests/new?pro=${business.slug}` : `/login?next=${encodeURIComponent(`/requests/new?pro=${business.slug}`)}`}>
                      <FileText className="size-4" /> Request a Quote from this Pro
                    </Link>
                  </Button>
                  {!user && (
                    <p className="text-[11px] text-muted-foreground mt-2 text-center">
                      Sign up to use the secure Sjoh Quoting system — your number stays hidden until you accept.
                    </p>
                  )}
                </div>
                <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                  You deal with this business directly. Sjoh takes no commission.
                </p>
                <div className="mt-3 pt-3 border-t border-border flex justify-center">
                  <ReportProfileButton businessId={business.id} businessName={business.name} />
                </div>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="rounded-[2rem] border border-white/70 bg-white/72 p-5 sm:p-6 transition-shadow hover:shadow-card backdrop-blur-xl">
                <h3 className="font-display text-lg font-semibold mb-2">Looking for similar?</h3>
                <p className="text-sm text-ink-2 mb-4">Browse more {business.category} businesses in {business.province}.</p>
                <Link
                  to={`/directory?category=${business.categorySlug}`}
                  className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1 transition-all hover:gap-2"
                >
                  View all <span aria-hidden>→</span>
                </Link>
              </div>
            </Reveal>
          </aside>
        </div>
      </div>

      {/* Mobile sticky action bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-t border-white/70 shadow-pop animate-fade-up">
        <div className="container py-2.5">
          {hasContact ? (
            <div className="grid grid-cols-3 gap-2">
              <Button variant="default" size="sm" className="w-full gap-1.5" asChild>
                <a href={`tel:${phone}`}><Phone className="size-4" />Call</a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 bg-[#25D366]/5 border-[#25D366]/40 text-[#1da851] hover:bg-[#25D366]/10 hover:text-[#1da851]"
                asChild
              >
                <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" />WhatsApp
                </a>
              </Button>
              <Button variant="outline" size="sm" className="w-full gap-1.5" asChild>
                <a href={`mailto:${email}`}><Mail className="size-4" />Email</a>
              </Button>
            </div>
          ) : (
            <Button onClick={handleReveal} disabled={revealing} size="sm" className="w-full">
              {revealing ? "Revealing…" : "Reveal contact details"}
            </Button>
          )}
        </div>
      </div>
      </div>
    </SiteLayout>
  );
};

export default BusinessProfile;

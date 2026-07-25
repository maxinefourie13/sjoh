import { Link } from "react-router-dom";

import { formatRand, type Opportunity } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { ApplyButton } from "@/components/ApplyButton";
import { UrgentBoostButton } from "@/components/UrgentBoostButton";
import { useAuth } from "@/hooks/useAuth";
import { BriefcaseBusiness, Siren, Sparkles, Paperclip, MapPin } from "lucide-react";
import { freshnessFromIso, competitionSignal } from "@/lib/leadSignals";
import { getAttachmentPreviewSrc } from "@/lib/attachmentPreview";

interface JobCardProps {
  job: Opportunity;
  className?: string;
  /** Optional: how many jobs this client has previously hired on Sjoh. */
  /** When true, render Pro-side signals (freshness + quote count). */
  isProView?: boolean;
  /** When set, show a "Near you" pip if this job's city matches. */
  proCity?: string;
  /** Optional visual variant for richer color blending backgrounds. */
  mixedColors?: boolean;
}

export const JobCard = ({ job, className, isProView, proCity, mixedColors = false }: JobCardProps) => {
  const { user } = useAuth();
  const isOwner = !!user && !!job.clientId && user.id === job.clientId;
  const isBoosted = !!job.urgentBoostPaidAt && (Date.now() - new Date(job.urgentBoostPaidAt).getTime()) < 72 * 3600 * 1000;
  const fresh = freshnessFromIso(job.createdAt, job.postedAt);
  const competition = competitionSignal(job.applicants);
  const isNearby = !!proCity && !!job.city && proCity.trim().toLowerCase() === job.city.trim().toLowerCase();
  const paletteIndex = job.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 3;
  const hasTopPills =
    isBoosted ||
    (isProView && !!fresh) ||
    (isProView && !!competition) ||
    (isProView && isNearby) ||
    job.isConciergeLead;
  const showSignalPills = hasTopPills && !mixedColors;
  const stripGradients = [
    "linear-gradient(90deg, #6f85ff 0%, #5069de 100%)",
    "linear-gradient(90deg, var(--sa-green) 0%, #0c8f58 100%)",
    "linear-gradient(90deg, #ef6fb8 0%, #d9509f 100%)",
  ] as const;
  const mixedBackground = stripGradients[paletteIndex];
  const normalCtaClass = mixedColors
    ? "border border-[#121a4a] bg-[#121a4a] text-white shadow-none hover:bg-[#1a2866]"
    : undefined;
  const urgentCtaClass = mixedColors
    ? "bg-black border border-black text-white shadow-none hover:bg-[#111]"
    : undefined;

  return (
    <div className={className}>
      <div
        className={cn(
          "group relative h-full overflow-hidden rounded-[1.35rem] border transition-all duration-300 hover:-translate-y-1",
          mixedColors
            ? "border-[#e1e5f0] bg-[#f9faff] text-[#111827] shadow-[0_18px_34px_-28px_rgba(13,24,43,0.34)] hover:shadow-[0_24px_44px_-28px_rgba(13,24,43,0.44)]"
            // Solid dark card. Previously bg-white/[0.06] (6% white) which was
            // invisible white-on-white when this variant landed on the app's
            // light page background — the reported unreadable-listings bug.
            : "text-white border-white/12 hover:border-white/28 bg-[#141726] hover:shadow-[0_22px_40px_-26px_rgba(0,0,0,0.8)] p-5",
          isBoosted && "border-sa-gold/70 ring-1 ring-sa-gold/25",
        )}
        style={undefined}
      >
        {mixedColors && (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-[42px]"
              style={{ background: mixedBackground }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-[42px] h-px bg-black/8"
            />
            <div className="relative z-[1] flex items-center justify-between px-5 py-3 text-white">
              <span className="text-[11px] font-semibold tracking-wide uppercase">#{job.id.slice(0, 8).toUpperCase()}</span>
              <span className="text-[11px] font-semibold">{job.deadline}</span>
            </div>
          </>
        )}
        <div className={cn("relative z-[1]", mixedColors && "px-5 pb-5 pt-4")}>
          {showSignalPills && (
            <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
          {isBoosted && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent-foreground bg-accent px-2 py-1 rounded-full animate-pulse">
              <Siren className="size-3" strokeWidth={2.5} /> Urgent
            </span>
          )}
          {isProView && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border",
                fresh.badgeClass,
              )}
              title="When this lead was posted"
            >
              <span aria-hidden>{fresh.dot}</span> {fresh.label}
            </span>
          )}
          {isProView && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border",
                competition.badgeClass,
              )}
              title="How many pros have already quoted"
            >
              <span aria-hidden>{competition.dot}</span> {competition.label}
            </span>
          )}
          {isProView && isNearby && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border bg-foreground text-background border-foreground">
              <MapPin className="size-3" strokeWidth={2.5} /> Near you
            </span>
          )}
          {job.isConciergeLead && (
            <span className={cn(
              "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest border px-2 py-1 rounded-full",
              mixedColors ? "text-[#1f2a44] bg-[#e9eefc] border-[#ced8f7]" : "text-primary bg-primary/10 border-primary/30",
            )}>
              <Sparkles className="size-3" strokeWidth={2.5} /> Sourced by Sjoh Concierge
            </span>
          )}
            </div>
          )}
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              "shrink-0 size-12 rounded-xl flex items-center justify-center",
              mixedColors
                ? "border border-[#d9deed] bg-[#eef2fb] text-[#43507a]"
                : "bg-sa-gold text-sa-dark shadow-[4px_4px_0_rgba(255,255,255,0.12)]",
            )}
          >
            <BriefcaseBusiness className="size-5" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <Link to={`/requests/${job.id}`} className="block">
              <h3 className={cn(
                "font-display text-base font-extrabold leading-snug transition-colors",
                mixedColors ? "text-[#101827] group-hover:text-[#1b2f73]" : "text-white group-hover:text-sa-gold",
              )}>
                {job.title}
              </h3>
            </Link>
            <p className={cn("mt-1 text-xs leading-relaxed", mixedColors ? "text-[#5f6c8a]" : "text-white/72")}>
              Posted by <span className={cn("font-medium", mixedColors ? "text-[#2a3554]" : "text-white/90")}>{job.postedBy}</span> · {job.postedAt}
            </p>

            <div className={cn("mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs", mixedColors ? "text-[#3f4c6f]" : "text-white/82")}>
              <span>{job.city}, {job.province}</span>
              <span className={cn(mixedColors ? "text-[#a3abc2]" : "text-white/45")}>·</span>
              <span>By {job.deadline}</span>
              {!isProView && <span className={cn(mixedColors ? "text-[#a3abc2]" : "text-white/45")}>·</span>}
              {!isProView && <span>{job.applicants} applied</span>}
              {job.attachments && job.attachments.length > 0 && (
                <>
                  <span className={cn(mixedColors ? "text-[#a3abc2]" : "text-white/45")}>·</span>
                  <span className={cn("inline-flex items-center gap-1 font-medium", mixedColors ? "text-[#2c3a5f]" : "text-white")}>
                    <Paperclip className="size-3" strokeWidth={2.5} />
                    {job.attachments.length} photo{job.attachments.length === 1 ? "" : "s"}
                  </span>
                </>
              )}
            </div>

            {job.attachments && job.attachments.length > 0 && (
              <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
                {job.attachments.slice(0, 4).map((a, i) => (
                  a.type.startsWith("image/") ? (
                    <a
                      key={i}
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "shrink-0 size-14 rounded-lg overflow-hidden transition-colors",
                        mixedColors ? "border border-[#d9deed] hover:border-[#9fb0e6]" : "border border-white/10 hover:border-sa-gold",
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img src={getAttachmentPreviewSrc(a)} alt={a.name} loading="lazy" className="size-full object-cover" />
                    </a>
                  ) : (
                    <a
                      key={i}
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "shrink-0 size-14 rounded-lg flex items-center justify-center",
                        mixedColors
                          ? "border border-[#d9deed] hover:border-[#9fb0e6] bg-[#eef2fb] text-[#6e7da1]"
                          : "border border-white/10 hover:border-sa-gold bg-white/10 text-white/60",
                      )}
                      onClick={(e) => e.stopPropagation()}
                      title={a.name}
                    >
                      <Paperclip className="size-4" strokeWidth={2} />
                    </a>
                  )
                ))}
                {job.attachments.length > 4 && (
                  <span className={cn(
                    "shrink-0 size-14 rounded-lg border border-dashed flex items-center justify-center text-[11px] font-semibold",
                    mixedColors ? "border-[#cfd7ed] text-[#7a88ab]" : "border-white/20 text-white/50",
                  )}>
                    +{job.attachments.length - 4}
                  </span>
                )}
              </div>
            )}

            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <div className={cn("font-display text-lg font-extrabold tabular-nums", mixedColors ? "text-[#0f1930]" : "text-white")}>
                  {formatRand(job.budget)}
                </div>
                <div className={cn("text-[10px] uppercase tracking-widest font-semibold", mixedColors ? "text-[#7a88ab]" : "text-white/65")}>
                  {job.budgetType === "fixed" ? "Fixed budget" : job.budgetType === "estimate" ? "Estimated" : "Negotiable"}
                </div>
              </div>
              {isOwner ? (
                <UrgentBoostButton
                  opportunityId={job.id}
                  opportunityTitle={job.title}
                  alreadyUrgent={isBoosted}
                  size="sm"
                  className={mixedColors ? urgentCtaClass : undefined}
                />
              ) : (
                <ApplyButton
                  jobId={job.id}
                  jobTitle={job.title}
                  jobBudget={job.budget}
                  clientName={job.postedBy}
                  isUrgent={isBoosted || job.isUrgent}
                  isConciergeLead={job.isConciergeLead}
                  externalContactUrl={job.externalContactUrl}
                  className={(isBoosted || job.isUrgent) ? urgentCtaClass : normalCtaClass}
                />
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

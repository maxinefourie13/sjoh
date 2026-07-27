import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Sparkles, ExternalLink, Siren, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProposalModal } from "@/components/ProposalModal";
import { cn } from "@/lib/utils";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  jobId: string;
  jobTitle: string;
  jobBudget?: number;
  clientName?: string;
  /** True if the job is flagged Eish! Urgent (free for clients, pinned 72h). */
  isUrgent?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
  /** If true, this is an admin-sourced concierge lead — redirect to externalContactUrl instead of opening the proposal modal. */
  isConciergeLead?: boolean;
  externalContactUrl?: string | null;
}

/**
 * Apply to a job. Server-side `submit_proposal` is the source of truth. Client-side gating
 * here just stops obviously-blocked clicks and shows the right paywall:
 *  - Not signed in → /auth
 *  - Locked tier → choose a plan
 *  - Basic tier → upgrade to Verified Pro
 *  - Trial / no plan, urgent job → upgrade to R250 + ID check
 *  - Verified Pro, urgent job, no KYC → run ID check
 *  - Otherwise → open proposal modal (server has final say).
 */
export const ApplyButton = ({
  jobId,
  jobTitle,
  jobBudget,
  clientName,
  isUrgent,
  size = "sm",
  className,
  isConciergeLead,
  externalContactUrl,
}: Props) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    loading,
    status,
    tier,
    hasVerifiedProAccess,
    foundingProposalAvailable,
    isFoundingMember,
    foundingProposalsResetAt,
  } = useProviderAccess();

  const [proposalOpen, setProposalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [paywall, setPaywall] = useState<null | "locked" | "no-plan" | "basic" | "trial-urgent">(null);

  const showFoundingPill = !hasVerifiedProAccess && foundingProposalAvailable;
  const foundingExhausted = !hasVerifiedProAccess && isFoundingMember && !foundingProposalAvailable;
  const resetLabel = foundingProposalsResetAt
    ? foundingProposalsResetAt.toLocaleDateString("en-ZA", { day: "numeric", month: "long" })
    : null;

  // Concierge lead: skip paywalls entirely, bounce to source.
  if (isConciergeLead && externalContactUrl) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <Button
          size={size}
          asChild
          className={cn("font-bold tracking-wide gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90", className)}
        >
          <a href={externalContactUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3.5" strokeWidth={2.5} />
            Contact client directly
          </a>
        </Button>
        <span className="text-[10px] text-muted-foreground text-right max-w-[160px] leading-tight">
          We sourced this lead from outside Sjoh — contact the client at the link above.
        </span>
      </div>
    );
  }

  const handleClick = () => {
    if (!user) {
      const next = `${window.location.pathname}${window.location.search}`;
      navigate(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    if (loading) return;

    if (status === "locked") return setPaywall("locked");
    if (status === "none") return setPaywall("no-plan");

    // R50 basic plan = passive listing only
    if (tier === "basic") return setPaywall("basic");

    if (isUrgent) {
      if (!hasVerifiedProAccess) return setPaywall("trial-urgent");
    }

    setProposalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col items-start gap-1.5">
        <Button
          size={size}
          onClick={handleClick}
          disabled={submitted || loading}
          className={cn(
            "font-bold tracking-wide gap-1.5",
            submitted
              ? "bg-primary-light text-primary hover:bg-primary-light"
              : isUrgent
                ? "bg-accent text-accent-foreground hover:bg-accent/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            className,
          )}
        >
          {isUrgent ? <Siren className="size-3.5" strokeWidth={2.5} /> : <Send className="size-3.5" strokeWidth={2.5} />}
          {submitted ? "Quote sent ✓" : isUrgent ? "Quote urgent job" : "Send Quote"}
        </Button>
        {showFoundingPill && !isUrgent && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-accent">
            <Sparkles className="size-3" strokeWidth={2.5} />
            Founding member · free this month
          </span>
        )}
        {foundingExhausted && resetLabel && !isUrgent && (
          <span className="text-[11px] text-muted-foreground">
            Free proposal used · resets {resetLabel}
          </span>
        )}
      </div>

      <ProposalModal
        open={proposalOpen}
        jobId={jobId}
        jobTitle={jobTitle}
        jobBudget={jobBudget}
        clientName={clientName}
        onClose={() => setProposalOpen(false)}
        onSubmitted={() => setSubmitted(true)}
      />

      <PaywallDialog
        kind={paywall}
        onClose={() => setPaywall(null)}
        onPickPlan={() => { setPaywall(null); navigate("/pricing"); }}
      />
    </>
  );
};

interface PaywallProps {
  kind: null | "locked" | "no-plan" | "basic" | "trial-urgent";
  onClose: () => void;
  onPickPlan: () => void;
}

const PaywallDialog = ({ kind, onClose, onPickPlan }: PaywallProps) => {
  if (!kind) return null;

  const copy = {
    locked: {
      icon: <Lock className="size-5 text-accent" strokeWidth={2.5} />,
      title: "Your account is paused",
      body: "Your trial or payment access needs attention. Subscribe to Verified Pro (R250/mo) to send quotes again.",
      cta: "Choose a plan",
      onCta: onPickPlan,
    },
    "no-plan": {
      icon: <Lock className="size-5 text-accent" strokeWidth={2.5} />,
      title: "Verified Pro needed",
      body: "Start a 30-day PayFast-backed Verified Pro trial to send quotes. R0 today, then R250/mo unless you cancel.",
      cta: "See plans",
      onCta: onPickPlan,
    },
    basic: {
      icon: <Sparkles className="size-5 text-primary" strokeWidth={2.5} />,
      title: "Upgrade to send quotes",
      body: "You need Verified Pro (R250/mo) to send quotes on customer requests.",
      cta: "Upgrade to Verified Pro",
      onCta: onPickPlan,
    },
    "trial-urgent": {
      icon: <Siren className="size-5 text-accent" strokeWidth={2.5} />,
      title: "Urgent jobs need Verified Pro",
      body: "Urgent customer requests are reserved for Verified Pro businesses. Upgrade to R250/mo to quote emergency jobs.",
      cta: "Upgrade to Verified Pro",
      onCta: onPickPlan,
    },
  }[kind];

  return (
    <Dialog open={!!kind} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">{copy.icon}{copy.title}</DialogTitle>
          <DialogDescription className="pt-2 leading-relaxed">{copy.body}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>Maybe later</Button>
          <Button onClick={copy.onCta} className="font-bold">{copy.cta}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

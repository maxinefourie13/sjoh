import { useState } from "react";
import { Link } from "react-router-dom";
import { X, Send, Video, Paperclip, FileDown, Lock, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { LiabilityDisclaimer } from "@/components/LiabilityDisclaimer";
import { downloadQuotation } from "@/lib/quotation";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { findProhibited, PROHIBITED_MESSAGE } from "@/lib/prohibitedKeywords";

interface Props {
  open: boolean;
  jobId: string;
  jobTitle: string;
  jobBudget?: number;
  clientName?: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

type PriceType = "fixed" | "from" | "quote";

export const ProposalModal = ({ open, jobId, jobTitle, jobBudget, clientName, onClose, onSubmitted }: Props) => {
  const { user } = useAuth();
  const { business: myBusiness } = useMyBusiness();
  const { tier } = useProviderAccess();

  const [priceType, setPriceType] = useState<PriceType>("fixed");
  const [price, setPrice] = useState<string>(jobBudget ? String(jobBudget) : "");
  const [scope, setScope] = useState("");
  const [timeline, setTimeline] = useState("Within 1 week");
  const [contactPref, setContactPref] = useState("WhatsApp");
  const [loomUrl, setLoomUrl] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isVerifiedPro = tier === "verified_pro" || tier === "verified_pro_trial";
  const priceNum = Number(price) || 0;
  const canSubmit =
    scope.trim().length >= 20 &&
    (priceType === "quote" || priceNum > 0) &&
    !submitted &&
    !submitting;

  if (!open) return null;

  const reset = () => {
    setPriceType("fixed");
    setPrice(jobBudget ? String(jobBudget) : "");
    setScope("");
    setTimeline("Within 1 week");
    setContactPref("WhatsApp");
    setLoomUrl("");
    setAttachments([]);
    setSubmitted(false);
    setSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 300);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const banned = findProhibited(scope);
    if (banned) {
      toast({ title: "Aikona!", description: PROHIBITED_MESSAGE, variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId);

    // Demo / sample lead — don't pretend we sent a real quote.
    if (!isUuid) {
      setSubmitting(false);
      toast({
        title: "This is a sample lead",
        description: "Browse live customer requests to send a real quote.",
      });
      onClose();
      return;
    }

    if (!user) {
      setSubmitting(false);
      toast({
        title: "Sign in to send a quote",
        description: "Create your free account or log in, then quote in one click.",
      });
      onClose();
      return;
    }

    if (!myBusiness) {
      setSubmitting(false);
      toast({
        title: "Finish your listing first",
        description: "We need your business profile before you can quote on jobs.",
      });
      onClose();
      return;
    }

    const { error } = await supabase.rpc("submit_proposal", {
      _opportunity_id: jobId,
      _business_id: myBusiness.id,
      _message: scope,
      _quote_amount: priceType === "quote" ? null : priceNum,
    });
    if (error) {
      console.error("[submit_proposal] failed", error);
      toast({ title: "Aikona!", description: error.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
    toast({
      title: "Quote sent!",
      description: "The customer can compare it in Sjoh. If they accept, contact details unlock and the job moves into your dashboard.",
    });
    onSubmitted?.();
  };

  const handleDownloadQuote = () => {
    if (!isVerifiedPro) return;
    const ok = downloadQuotation({
      jobId,
      jobTitle,
      clientName,
      price: priceNum,
      priceType,
      scope,
      timeline,
      validityDays: 14,
      contactPref,
      loomUrl: loomUrl || undefined,
      providerBusinessId: myBusiness?.id ?? "",
      providerBusiness: myBusiness,
    });
    if (!ok) {
      toast({ title: "Pop-up blocked", description: "Allow pop-ups to download the quotation." });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-t-2xl md:rounded-2xl shadow-pop my-0 md:my-8 max-h-[95vh] flex flex-col">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-secondary z-10"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <Send className="size-4 text-accent" strokeWidth={2.5} />
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Send your quote</span>
          </div>
          <h2 className="font-display text-xl md:text-2xl font-semibold tracking-tight pr-8">{jobTitle}</h2>
          <p className="text-xs text-muted-foreground mt-2">
            Quotes are <strong className="text-foreground">free & unlimited</strong> on Verified Pro. Contact details unlock after the customer accepts — no commission.
            {clientName && <> · For <strong>{clientName}</strong></>}
          </p>
        </div>

        {/* Body — scrolls */}
        <div className="px-6 md:px-8 py-5 space-y-5 overflow-y-auto flex-1">
          {submitted ? (
            <SuccessState
              isVerifiedPro={isVerifiedPro}
              onDownloadQuote={handleDownloadQuote}
              onClose={handleClose}
            />
          ) : (
            <>
              {/* Price */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink-2 block mb-2">
                  Your price <span className="text-accent">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {([
                    { id: "fixed", label: "Fixed price" },
                    { id: "from", label: "Starting from" },
                    { id: "quote", label: "Quote on inspection" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPriceType(opt.id)}
                      className={cn(
                        "text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                        priceType === opt.id
                          ? "bg-foreground text-background border-foreground"
                          : "bg-card text-ink-2 border-border hover:border-foreground",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {priceType !== "quote" ? (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">R</span>
                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      className="w-full pl-8 pr-3 py-2.5 bg-background border border-border rounded-lg text-base font-semibold tabular-nums outline-none focus:border-primary"
                    />
                    {jobBudget && (
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Client's budget: R {jobBudget.toLocaleString("en-ZA")}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-ink-2 bg-secondary rounded-lg px-3 py-2.5">
                    No fixed price — you'll quote after seeing the site. Recommended for plumbing, electrical, structural work.
                  </div>
                )}
              </div>

              {/* Pitch / scope */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink-2 block mb-2">
                  Scope and message <span className="text-accent">*</span>
                </label>
                <textarea
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  rows={5}
                  placeholder="What's included, when you can start, and anything the customer should know before accepting. Min 20 characters."
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary resize-none"
                />
                <p className="text-[11px] text-muted-foreground mt-1 tabular-nums">
                  {scope.length} chars {scope.length < 20 && <span className="text-accent">— need at least 20</span>}
                </p>
              </div>

              {/* Timeline + contact */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-ink-2 block mb-2">
                    Can start
                  </label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="sjoh-select w-full px-3 py-2.5 text-sm"
                  >
                    <option>Today</option>
                    <option>This week</option>
                    <option>Within 1 week</option>
                    <option>Within 2 weeks</option>
                    <option>Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-ink-2 block mb-2">
                    Best contact
                  </label>
                  <select
                    value={contactPref}
                    onChange={(e) => setContactPref(e.target.value)}
                    className="sjoh-select w-full px-3 py-2.5 text-sm"
                  >
                    <option>WhatsApp</option>
                    <option>Phone call</option>
                    <option>Email</option>
                    <option>In-app message</option>
                  </select>
                </div>
              </div>

              {/* Loom + attachments */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink-2 block mb-2">
                  <Video className="size-3 inline -mt-0.5 mr-1" />
                  Walkthrough video (optional, big winner)
                </label>
                <input
                  type="url"
                  value={loomUrl}
                  onChange={(e) => setLoomUrl(e.target.value)}
                  placeholder="Paste a Loom, YouTube, or video URL"
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Pros who include a video win <strong>3x</strong> more often. Show your face, walk through the job.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink-2 block mb-2">
                  <Paperclip className="size-3 inline -mt-0.5 mr-1" />
                  Attachments (optional)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={(e) => setAttachments(Array.from(e.target.files || []))}
                  className="block w-full text-xs file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-secondary file:text-foreground hover:file:bg-secondary/80"
                />
                {attachments.length > 0 && (
                  <p className="text-[11px] text-ink-2 mt-1.5">
                    {attachments.length} file{attachments.length > 1 ? "s" : ""}: {attachments.map(f => f.name).join(", ")}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground mt-1">
                  Photos of past work, certifications, or product specs.
                </p>
              </div>

              {/* Quotation upsell card */}
              <QuotationCard isVerifiedPro={isVerifiedPro} />
            </>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="px-6 md:px-8 py-4 border-t border-border bg-card rounded-b-none md:rounded-b-2xl">
            <LiabilityDisclaimer variant="inline" className="mb-3" />
            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={handleClose}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold gap-1.5"
                size="lg"
              >
                <Send className="size-4" strokeWidth={2.5} />
                {submitting ? "Sending…" : "Send Quote"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const QuotationCard = ({ isVerifiedPro }: { isVerifiedPro: boolean }) => {
  if (isVerifiedPro) {
    return (
      <div className="rounded-xl border border-foreground bg-foreground text-background p-4">
        <div className="flex items-start gap-3">
          <span className="size-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shrink-0">
            <FileDown className="size-4" />
          </span>
          <div className="flex-1">
            <p className="font-display text-sm font-semibold flex items-center gap-2">
              Branded PDF quotation unlocked
              <span className="text-[9px] bg-accent text-accent-foreground font-bold px-1.5 py-0.5 rounded uppercase tracking-widest">Verified Pro</span>
            </p>
            <p className="text-xs text-background/80 mt-1">
              We'll generate a branded PDF quotation from your business info + this proposal. Available right after you send.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-dashed border-accent/50 bg-accent/5 p-4">
      <div className="flex items-start gap-3">
        <span className="size-9 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center shrink-0">
          <Lock className="size-4" />
        </span>
        <div className="flex-1">
          <p className="font-display text-sm font-semibold">
            Want to send a branded PDF quotation? <Sparkles className="size-3.5 inline text-accent -mt-0.5" />
          </p>
          <p className="text-xs text-ink-2 mt-1">
            Branded quotations are part of <strong>Verified Pro</strong>. Pros who quote in PDF land 2x more jobs.
          </p>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-1 text-xs font-bold text-accent mt-2 hover:underline"
          >
            Upgrade to Verified Pro →
          </Link>
        </div>
      </div>
    </div>
  );
};

const SuccessState = ({
  isVerifiedPro, onDownloadQuote, onClose,
}: {
  isVerifiedPro: boolean;
  onDownloadQuote: () => void;
  onClose: () => void;
}) => (
  <div className="text-center py-6">
    <div className="size-16 rounded-full bg-primary-light text-primary flex items-center justify-center mx-auto mb-4">
      <Check className="size-8" strokeWidth={3} />
    </div>
    <h3 className="font-display text-2xl font-semibold tracking-tight">Quote sent!</h3>
    <p className="text-sm text-ink-2 mt-2 max-w-sm mx-auto">
      Your quote is in. The customer can compare it in Sjoh, and if they accept, contact details unlock so you can get the work booked.
    </p>

    {isVerifiedPro ? (
      <div className="mt-6 max-w-sm mx-auto">
        <Button onClick={onDownloadQuote} size="lg" className="w-full gap-2 bg-foreground text-background hover:bg-foreground/90">
          <FileDown className="size-4" />
          Download branded quotation PDF
        </Button>
        <p className="text-[11px] text-muted-foreground mt-2">
          Opens in a new tab — print or save as PDF to send to the client.
        </p>
      </div>
    ) : (
      <div className="mt-6 max-w-sm mx-auto rounded-xl border border-dashed border-accent/50 bg-accent/5 p-4 text-left">
        <p className="font-display text-sm font-semibold flex items-center gap-1.5">
          <Lock className="size-3.5 text-muted-foreground" />
          Send a branded PDF quote next time
        </p>
        <p className="text-xs text-ink-2 mt-1">
          Verified Pro automatically generates a polished PDF quote with your logo, address, and pricing — done in 1 click.
        </p>
        <Link to="/pricing" className="inline-flex items-center gap-1 text-xs font-bold text-accent mt-2 hover:underline">
          Upgrade to Verified Pro →
        </Link>
      </div>
    )}

    <Button variant="ghost" onClick={onClose} className="mt-6">Done</Button>
  </div>
);

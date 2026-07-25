import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Copy, CheckCircle2, Clock, XCircle, FileText, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { useMyDealMemos, type DealMemo, type DealMemoStatus } from "@/hooks/useDealMemos";
import { supabase } from "@/integrations/supabase/client";
import { formatRand } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const STATUS_META: Record<DealMemoStatus, { label: string; cls: string; icon: typeof Clock }> = {
  pending:   { label: "Awaiting accept", cls: "bg-secondary text-muted-foreground", icon: Clock },
  accepted:  { label: "Accepted",         cls: "bg-primary-light text-primary",      icon: CheckCircle2 },
  completed: { label: "Completed",        cls: "bg-accent/15 text-accent",           icon: CheckCircle2 },
  cancelled: { label: "Cancelled",        cls: "bg-secondary text-muted-foreground", icon: XCircle },
};

export const QuotesSection = () => {
  const { business } = useMyBusiness();
  const { memos, loading, refresh } = useMyDealMemos(business?.id);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Job log</h1>
          <p className="text-sm text-ink-2 mt-1">
            Log a job, share the link, get a Verified Hire badge when it's done.
            To send a quote or invoice document, use{" "}
            <Link to="/dashboard?section=documents" className="text-primary font-semibold hover:underline">Quotes &amp; Invoices</Link>.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} disabled={!business}>
          <Plus className="size-4" /> Create new quote
        </Button>
      </header>

      {!business && !loading && (
        <div className="bg-card border border-border rounded-xl p-6 text-sm text-ink-2">
          You need a business listing first. <Link to="/list" className="text-primary font-semibold hover:underline">List your business</Link> to start logging quotes.
        </div>
      )}

      {business && memos.length === 0 && !loading && (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <FileText className="size-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-display text-lg font-bold">No quotes yet</h3>
          <p className="text-sm text-ink-2 mt-1 max-w-md mx-auto">
            Send a customer a Sjoh quote, and once they accept and the job is done, we'll chase a Verified Review for you.
          </p>
          <Button onClick={() => setCreateOpen(true)} className="mt-5">
            <Plus className="size-4" /> Create your first quote
          </Button>
        </div>
      )}

      {memos.length > 0 && (
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {memos.map((m) => (
            <QuoteRow key={m.id} memo={m} onChange={refresh} businessName={business?.name ?? ""} />
          ))}
        </div>
      )}

      <CreateQuoteDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        businessId={business?.id ?? null}
        businessName={business?.name ?? ""}
        onCreated={refresh}
      />
    </>
  );
};

const QuoteRow = ({
  memo, onChange, businessName,
}: { memo: DealMemo; onChange: () => void; businessName: string }) => {
  const meta = STATUS_META[memo.status];
  const Icon = meta.icon;
  const [busy, setBusy] = useState(false);
  const quoteUrl = `${window.location.origin}/quote/${memo.id}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(quoteUrl);
    toast({ title: "Link copied", description: "Sharp — paste it into WhatsApp or SMS." });
  };

  const waText = encodeURIComponent(
    `Howzit! Here's your quote from ${businessName} on Sjoh:\n\n` +
    `"${memo.job_title}" — ${formatRand(memo.total_amount_zar)}\n\n` +
    `Tap to view & accept: ${quoteUrl}\n\n` +
    `Payments happen directly between us — Sjoh just logs the job for your protection.`
  );
  const waHref = memo.client_phone
    ? `https://wa.me/${memo.client_phone.replace(/\D/g, "")}?text=${waText}`
    : `https://wa.me/?text=${waText}`;

  const markComplete = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("complete_deal_memo", { _id: memo.id });
    if (error) {
      toast({ title: "Eish — couldn't update", description: error.message, variant: "destructive" });
      setBusy(false);
      return;
    }
    // Fire the chaser email (best-effort — don't block the UI on it)
    void supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "verified-review-chaser",
        recipientEmail: memo.client_email,
        idempotencyKey: `chaser-${memo.id}`,
        templateData: {
          jobTitle: memo.job_title,
          proName: businessName,
          reviewUrl: `${window.location.origin}/quote/${memo.id}/review`,
        },
      },
    }).then(({ error: sendErr }) => {
      if (!sendErr) {
        void supabase.rpc("mark_chaser_sent", { _id: memo.id });
      }
    });
    toast({
      title: "Job marked complete 🎉",
      description: "We've buzzed your client to leave a Verified Review.",
    });
    onChange();
    setBusy(false);
  };

  const cancel = async () => {
    if (!confirm("Cancel this quote? You can't undo it.")) return;
    setBusy(true);
    const { error } = await supabase.rpc("cancel_deal_memo", { _id: memo.id });
    if (error) toast({ title: "Couldn't cancel", description: error.message, variant: "destructive" });
    else { toast({ title: "Quote cancelled" }); onChange(); }
    setBusy(false);
  };

  return (
    <div className="p-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded", meta.cls)}>
            <Icon className="size-3" /> {meta.label}
          </span>
          <span className="text-xs text-muted-foreground">{new Date(memo.created_at).toLocaleDateString("en-ZA")}</span>
        </div>
        <h3 className="font-semibold mt-2 truncate">{memo.job_title}</h3>
        <p className="text-xs text-ink-2 mt-1 truncate">
          {memo.client_email} · {formatRand(memo.total_amount_zar)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        {(memo.status === "pending" || memo.status === "accepted") && (
          <>
            <Button size="sm" variant="outline" onClick={copyLink}>
              <Copy className="size-3.5" /> Copy link
            </Button>
            <Button size="sm" variant="outline" asChild className="bg-[#25D366]/5 border-[#25D366]/40 text-[#1da851] hover:bg-[#25D366]/10 hover:text-[#1da851]">
              <a href={waHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-3.5" /> WhatsApp
              </a>
            </Button>
          </>
        )}
        {memo.status === "accepted" && (
          <Button size="sm" onClick={markComplete} disabled={busy}>
            {busy ? "Saving…" : "Mark complete"}
          </Button>
        )}
        {memo.status === "pending" && (
          <Button size="sm" variant="ghost" onClick={cancel} disabled={busy}>
            Cancel
          </Button>
        )}
        {memo.status === "completed" && memo.review_chaser_sent_at && (
          <span className="text-xs text-muted-foreground italic self-center">Review requested</span>
        )}
      </div>
    </div>
  );
};

const CreateQuoteDialog = ({
  open, onClose, businessId, businessName, onCreated,
}: {
  open: boolean;
  onClose: () => void;
  businessId: string | null;
  businessName: string;
  onCreated: () => void;
}) => {
  const { user } = useAuth();
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [scope, setScope] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setClientEmail(""); setClientPhone(""); setJobTitle(""); setScope(""); setAmount("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || !user) return;
    if (!/.+@.+\..+/.test(clientEmail)) {
      toast({ title: "Check that email", description: "We need a working address to chase the review later.", variant: "destructive" });
      return;
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 0) {
      toast({ title: "Check that amount", description: "Use rands, e.g. 2500", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("deal_memos").insert({
      business_id: businessId,
      pro_user_id: user.id,
      client_email: clientEmail.trim(),
      client_phone: clientPhone.trim() || null,
      job_title: jobTitle.trim(),
      scope_of_work: scope.trim(),
      total_amount_zar: amt,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Eish — couldn't save", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Quote created ✨", description: "Copy the link and send it through." });
    reset();
    onCreated();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New quote from {businessName || "your business"}</DialogTitle>
          <DialogDescription>
            Log a job for one customer. They'll get a link, accept the scope, and once you mark it complete we'll chase a Verified Review.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ce">Client email</Label>
              <Input id="ce" type="email" required value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="thandi@example.co.za" />
            </div>
            <div>
              <Label htmlFor="cp">Client phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input id="cp" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+27 82 555 1234" />
            </div>
          </div>
          <div>
            <Label htmlFor="jt">Job title</Label>
            <Input id="jt" required maxLength={120} value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Geyser swap-out, Parkhurst" />
          </div>
          <div>
            <Label htmlFor="sw">Scope of work</Label>
            <Textarea id="sw" required rows={4} maxLength={2000} value={scope} onChange={(e) => setScope(e.target.value)} placeholder="Remove old 150L geyser, supply & install new 200L Heat Tech, COC included." />
          </div>
          <div>
            <Label htmlFor="am">Amount (ZAR)</Label>
            <Input id="am" required type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="4500" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Create quote"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

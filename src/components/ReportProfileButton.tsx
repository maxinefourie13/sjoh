import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface Props {
  businessId: string;
  businessName: string;
}

const REASONS = [
  { value: "prohibited_service", label: "Offering prohibited or illegal services" },
  { value: "scam", label: "Scam or fraud" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "misleading", label: "Misleading info or fake credentials" },
  { value: "off_platform", label: "Pushing payments off-platform suspiciously" },
  { value: "other", label: "Something else" },
];

export const ReportProfileButton = ({ businessId, businessName }: Props) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0].value);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Log in first", description: "You need an account to report a pro." });
      navigate("/login");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.rpc("report_business", {
      _business_id: businessId,
      _reason: reason,
      _details: details.trim() || null,
    });
    setSubmitting(false);

    if (error) {
      const msg = error.message?.includes("Cannot report your own")
        ? "You can't report your own business."
        : error.message?.includes("duplicate") || error.code === "23505"
        ? "You've already reported this pro."
        : error.message ?? "Couldn't submit report.";
      toast({ title: "Aikona!", description: msg, variant: "destructive" });
      return;
    }
    toast({
      title: "Report received",
      description: "Our team will review this. Thanks for keeping Sjoh. clean.",
    });
    setOpen(false);
    setDetails("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
          <Flag className="size-4" />
          Report this Profile
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {businessName}</DialogTitle>
          <DialogDescription>
            Reports stay anonymous to the pro. Three confirmed reports = automatic Founder Review.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="sjoh-select w-full px-3 py-2 text-sm"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Spill the beans — what happened?"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1 tabular-nums">{details.length}/500</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

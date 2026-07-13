import { useState } from "react";
import { Star, Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useMyBusiness } from "@/hooks/useMyBusiness";
import { useProviderAccess } from "@/hooks/useProviderAccess";

// Founding-member perk: a shareable link to collect reviews fast from
// friends, family and past clients. Only shown to founding members.
export const FoundingReviewLinkCard = () => {
  const { business, loading } = useMyBusiness();
  const access = useProviderAccess();
  const [copied, setCopied] = useState(false);

  if (loading || access.loading) return null;
  if (!access.isFoundingMember || !business) return null;

  const link = `${window.location.origin}/r/${business.slug}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast({ title: "Link copied", description: "Send it to friends, family and past clients on WhatsApp." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Couldn't copy", description: link, variant: "destructive" });
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Review ${business.name} on Sjoh`, url: link });
      } catch { /* user cancelled */ }
    } else {
      void copy();
    }
  };

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary-light/40 p-5 md:p-6">
      <div className="flex items-start gap-3">
        <span className="size-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
          <Star className="size-5 fill-current" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold tracking-tight flex items-center gap-2">
            Founding Member perk: get reviews fast
          </h3>
          <p className="text-xs text-ink-2 mt-1">
            Share this private link with friends, family and past clients so they can review you in seconds — no account needed.
            It shows on your profile as an <strong>Invited review</strong>. Founding Members only.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <div className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono truncate">
          {link}
        </div>
        <div className="flex gap-2">
          <Button onClick={copy} className="gap-1.5">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" onClick={share} className="gap-1.5">
            <Share2 className="size-4" /> Share
          </Button>
        </div>
      </div>
    </div>
  );
};

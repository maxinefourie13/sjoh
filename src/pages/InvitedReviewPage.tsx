import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Star, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SeoHead } from "@/components/SeoHead";
import { cn } from "@/lib/utils";

const InvitedReviewPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!slug) return;
    void (async () => {
      const { data, error } = await supabase.rpc("review_link_status", { _business_slug: slug });
      const row = Array.isArray(data) ? data[0] : data;
      if (!error && row?.business_name) {
        setBusinessName(row.business_name);
        setActive(Boolean(row.active));
      }
      setLoading(false);
    })();
  }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || body.trim().length < 10) {
      toast({ title: "Almost there", description: "Add your name and at least a sentence about the work.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.rpc("submit_invited_review", {
      _business_slug: slug,
      _rating: rating,
      _body: body.trim(),
      _reviewer_name: name.trim(),
      _reviewer_company: company.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Couldn't post review", description: error.message, variant: "destructive" });
      return;
    }
    setDone(true);
  };

  if (loading) {
    return <SiteLayout><div className="container py-24 text-center text-muted-foreground">Loading…</div></SiteLayout>;
  }

  if (!businessName || !active) {
    return (
      <SiteLayout>
        <SeoHead title="Review link · Sjoh" description="Leave a review on Sjoh." />
        <div className="container max-w-md py-20 text-center">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">This review link isn't active.</h1>
          <p className="text-sm text-ink-2 mt-2">
            {businessName
              ? `${businessName} isn't collecting reviews through this link right now.`
              : "We couldn't find this business."}
          </p>
          <Button asChild variant="outline" className="mt-5"><Link to="/">Go to Sjoh</Link></Button>
        </div>
      </SiteLayout>
    );
  }

  if (done) {
    return (
      <SiteLayout>
        <SeoHead title={`Thanks · ${businessName} · Sjoh`} description="Review posted." />
        <div className="container max-w-md py-20 text-center">
          <CheckCircle2 className="size-12 mx-auto text-sa-green mb-3" />
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Dankie! Review posted. 🎉</h1>
          <p className="text-sm text-ink-2 mt-2">Thanks for backing {businessName} on Sjoh.</p>
          <Button asChild className="mt-5"><Link to="/">Discover more pros on Sjoh</Link></Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <SeoHead title={`Review ${businessName} · Sjoh`} description={`Leave a review for ${businessName} on Sjoh.`} />
      <div className="container max-w-xl py-8 sm:py-12">
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Share your experience</p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            How was {businessName}?
          </h1>
          <p className="text-sm text-ink-2 mt-2">
            Worked with them before? Drop a quick review to help other customers on Sjoh.
          </p>

          <form onSubmit={submit} className="space-y-5 mt-6">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n)} className="p-1 transition-transform hover:scale-110" aria-label={`${n} stars`}>
                    <Star className={cn("size-9", n <= rating ? "fill-accent text-accent" : "text-muted-foreground")} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="rn">Your name</Label>
              <Input id="rn" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Thandi N." />
            </div>
            <div>
              <Label htmlFor="rc">Your company <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input id="rc" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company or project name" />
            </div>
            <div>
              <Label htmlFor="rb">How did it go?</Label>
              <Textarea id="rb" required rows={5} maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} placeholder="On time, clean job, no nonsense. Would use again." />
            </div>
            <Button type="submit" disabled={submitting} className="w-full h-12 text-base font-bold">
              {submitting ? "Posting…" : "Post review"}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              Posted as an invited review on {businessName}'s Sjoh profile.
            </p>
          </form>
        </div>
      </div>
    </SiteLayout>
  );
};

export default InvitedReviewPage;

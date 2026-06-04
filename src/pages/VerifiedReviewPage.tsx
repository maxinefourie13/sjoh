import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDealMemo } from "@/hooks/useDealMemos";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SeoHead } from "@/components/SeoHead";
import { cn } from "@/lib/utils";

const VerifiedReviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const { session, user, loading: authLoading } = useAuth();
  const { memo, loading } = useDealMemo(id);
  const [business, setBusiness] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const meta = (user.user_metadata?.display_name as string | undefined) ?? "";
      if (meta && !name) setName(meta);
    }
  }, [user, name]);

  useEffect(() => {
    if (!memo) return;
    void supabase
      .from("businesses")
      .select("id, name, slug")
      .eq("id", memo.business_id)
      .maybeSingle()
      .then(({ data }) => setBusiness(data as any));
  }, [memo]);

  if (loading || authLoading) {
    return <SiteLayout><div className="container py-24 text-center text-muted-foreground">Loading…</div></SiteLayout>;
  }

  if (!session) {
    return (
      <SiteLayout>
        <div className="container max-w-md py-16 text-center">
          <ShieldCheck className="size-10 mx-auto text-primary mb-3" />
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Sign in to leave your Verified Review</h1>
          <p className="text-sm text-ink-2 mt-2">Verified Reviews need a signed-in account so they count.</p>
          <Button asChild className="mt-5">
            <Link to="/login" state={{ from: `/quote/${id}/review` }}>Sign in</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  if (!memo || !business) {
    return (
      <SiteLayout>
        <div className="container py-24 text-center">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Quote not found.</h1>
        </div>
      </SiteLayout>
    );
  }

  if (memo.status !== "completed") {
    return (
      <SiteLayout>
        <div className="container max-w-md py-16 text-center">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">This job isn't marked complete yet.</h1>
          <p className="text-sm text-ink-2 mt-2">Once {business.name} marks the work done, you'll be able to leave a Verified Review here.</p>
          <Button asChild variant="outline" className="mt-5">
            <Link to={`/quote/${memo.id}`}>Back to quote</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || body.trim().length < 10) {
      toast({ title: "Almost there", description: "Add your name and at least a sentence about the job.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.rpc("submit_verified_review", {
      _deal_memo_id: memo.id,
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
    toast({ title: "Review posted 🎉", description: "Sharp — thanks for keeping Sjoh full of the real ones." });
    navigate(`/business/${business.slug}`, { replace: true });
  };

  return (
    <SiteLayout>
      <SeoHead title={`Review ${business.name} · Sjoh`} description="Leave a Verified Review on Sjoh." />
      <div className="container max-w-xl py-8 sm:py-12">
        <Link to={`/quote/${memo.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="size-4" /> Back to quote
        </Link>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-accent/15 text-accent px-2.5 py-1 rounded">
            <ShieldCheck className="size-3" /> Verified Hire
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mt-3">
            How did {business.name} do?
          </h1>
          <p className="text-sm text-ink-2 mt-2">For "{memo.job_title}".</p>

          <form onSubmit={submit} className="space-y-5 mt-6">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className="p-1 transition-transform hover:scale-110"
                    aria-label={`${n} stars`}
                  >
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
              <Input id="rc" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Customer company or project name" />
            </div>
            <div>
              <Label htmlFor="rb">Tell other customers how it went</Label>
              <Textarea id="rb" required rows={5} maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} placeholder="On time, clean job, no nonsense. Would book again." />
            </div>
            <Button type="submit" disabled={submitting} className="w-full h-12 text-base font-bold">
              {submitting ? "Posting…" : "Post Verified Review"}
            </Button>
          </form>
        </div>
      </div>
    </SiteLayout>
  );
};

export default VerifiedReviewPage;

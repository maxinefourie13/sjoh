import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";

const FN_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/handle-email-unsubscribe`;

type Status = "loading" | "ready" | "already" | "invalid" | "submitting" | "done" | "error";

const EmailUnsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<Status>("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    (async () => {
      try {
        const r = await fetch(`${FN_URL}?token=${encodeURIComponent(token)}`);
        const j = await r.json();
        if (j.alreadyUnsubscribed || j.reason === "already_unsubscribed") {
          setEmail(j.email ?? null);
          setStatus("already");
        } else if (j.valid) {
          setEmail(j.email ?? null);
          setStatus("ready");
        } else {
          setStatus("invalid");
        }
      } catch {
        setStatus("invalid");
      }
    })();
  }, [token]);

  const confirm = async () => {
    setStatus("submitting");
    try {
      const r = await fetch(FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (r.ok) setStatus("done");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <SiteLayout>
      <main className="container max-w-xl py-20">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          {status === "loading" && <p className="text-ink-2">Just now, just now...</p>}

          {status === "invalid" && (
            <>
              <h1 className="font-display text-2xl font-semibold mb-3">Sjoh — link's expired</h1>
              <p className="text-ink-2">This unsubscribe link isn't valid. It might've already been used, my china.</p>
              <Button asChild className="mt-6"><Link to="/">Back home</Link></Button>
            </>
          )}

          {status === "already" && (
            <>
              <h1 className="font-display text-2xl font-semibold mb-3">Already sorted ✓</h1>
              <p className="text-ink-2">{email ?? "You"} is already unsubscribed. We'll respect that.</p>
              <Button asChild className="mt-6"><Link to="/">Back home</Link></Button>
            </>
          )}

          {(status === "ready" || status === "submitting") && (
            <>
              <h1 className="font-display text-2xl font-semibold mb-3">Unsubscribe?</h1>
              <p className="text-ink-2 mb-2">
                We'll stop sending Sjoh! emails to{" "}
                <strong className="text-foreground">{email ?? "this address"}</strong>.
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                You'll still get critical account stuff like password resets — that's the law, my bru.
              </p>
              <Button
                onClick={confirm}
                disabled={status === "submitting"}
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold"
              >
                {status === "submitting" ? "Sorting..." : "Aikona, unsubscribe me"}
              </Button>
            </>
          )}

          {status === "done" && (
            <>
              <h1 className="font-display text-2xl font-semibold mb-3">Done — you're out 👋</h1>
              <p className="text-ink-2">No more emails to {email ?? "you"}. Sharp.</p>
              <Button asChild className="mt-6"><Link to="/">Back home</Link></Button>
            </>
          )}

          {status === "error" && (
            <>
              <h1 className="font-display text-2xl font-semibold mb-3">Eish, something broke</h1>
              <p className="text-ink-2">Try again in a bit, or hit us up on support.</p>
              <Button onClick={confirm} className="mt-6">Try again</Button>
            </>
          )}
        </div>
      </main>
    </SiteLayout>
  );
};

export default EmailUnsubscribe;

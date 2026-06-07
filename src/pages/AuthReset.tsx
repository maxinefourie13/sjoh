import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Loader2, TriangleAlert } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const getAuthError = (search: URLSearchParams, hash: URLSearchParams) =>
  search.get("error_description") ||
  hash.get("error_description") ||
  search.get("error") ||
  hash.get("error");

const AuthReset = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const finishResetLink = async () => {
      const search = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const urlError = getAuthError(search, hash);

      if (urlError) {
        if (!cancelled) setError(urlError);
        return;
      }

      try {
        const code = search.get("code");
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        await new Promise((resolve) => window.setTimeout(resolve, 250));
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!data.session) {
          throw new Error("We opened the reset link, but could not finish the secure handover. Please request a fresh reset link.");
        }

        if (!cancelled) {
          navigate("/reset-password", { replace: true });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "We could not open this password reset link.";
        if (!cancelled) setError(message);
      }
    };

    void finishResetLink();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <SiteLayout>
      <main className="min-h-[70dvh] bg-[#050505] px-4 py-16 text-white">
        <div className="mx-auto max-w-lg rounded-[2rem] border border-white/15 bg-white/[0.07] p-7 text-center shadow-2xl shadow-black/30 backdrop-blur-xl md:p-10">
          {error ? (
            <>
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-sa-red/15 text-sa-red">
                <TriangleAlert className="size-7" />
              </div>
              <h1 className="font-display mt-6 text-3xl font-extrabold">That reset link got stuck.</h1>
              <p className="mt-3 text-sm leading-6 text-white/65">{error}</p>
              <Button asChild className="mt-7 rounded-full bg-white px-6 text-sa-dark hover:bg-white/90">
                <Link to="/forgot-password">Send a fresh reset link</Link>
              </Button>
            </>
          ) : (
            <>
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-sa-green/15 text-sa-green">
                <KeyRound className="size-7" />
              </div>
              <h1 className="font-display mt-6 text-3xl font-extrabold">Opening your reset link...</h1>
              <p className="mt-3 text-sm leading-6 text-white/65">Hold tight while Sjoh verifies the link and opens the password form.</p>
              <Loader2 className="mx-auto mt-7 size-6 animate-spin text-white/70" />
            </>
          )}
        </div>
      </main>
    </SiteLayout>
  );
};

export default AuthReset;

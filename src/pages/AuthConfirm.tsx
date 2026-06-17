import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2, MailCheck, TriangleAlert } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const getSafeNextPath = (raw: string | null) =>
  raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";

const getAuthError = (search: URLSearchParams, hash: URLSearchParams) =>
  search.get("error_description") ||
  hash.get("error_description") ||
  search.get("error") ||
  hash.get("error");

const getParam = (search: URLSearchParams, hash: URLSearchParams, key: string) =>
  search.get(key) || hash.get(key);

const getLoginUrl = (nextPath: string) => {
  const params = new URLSearchParams({ confirmed: "1" });
  if (nextPath !== "/dashboard") params.set("next", nextPath);
  return `/login?${params.toString()}`;
};

const isLikelyConfirmedButNotSignedIn = (message: string) => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("code verifier") ||
    normalized.includes("flow state") ||
    normalized.includes("invalid or has expired") ||
    normalized.includes("otp") ||
    normalized.includes("expired")
  );
};

const verifyTokenHash = async (tokenHash: string, rawType: string | null) => {
  const allowedTypes = new Set(["signup", "invite", "magiclink", "recovery", "email_change", "email"]);
  const type = allowedTypes.has(rawType ?? "") ? rawType : "email";
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email",
  });
  if (error) throw error;
};

const setSessionFromHash = async (search: URLSearchParams, hash: URLSearchParams) => {
  const accessToken = getParam(search, hash, "access_token");
  const refreshToken = getParam(search, hash, "refresh_token");
  if (!accessToken || !refreshToken) return false;

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) throw error;
  return true;
};

const AuthConfirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const nextPath = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return getSafeNextPath(params.get("next"));
  }, [location.search]);

  useEffect(() => {
    let cancelled = false;

    const finishConfirmation = async () => {
      const search = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const urlError = getAuthError(search, hash);

      if (urlError) {
        if (!cancelled && isLikelyConfirmedButNotSignedIn(urlError)) {
          toast({ title: "Email confirmed", description: "Please log in once to finish opening Sjoh on this device." });
          navigate(getLoginUrl(nextPath), { replace: true });
        } else if (!cancelled) {
          setError(urlError);
        }
        return;
      }

      try {
        const code = search.get("code");
        const tokenHash = getParam(search, hash, "token_hash");
        const type = getParam(search, hash, "type");

        if (tokenHash) {
          await verifyTokenHash(tokenHash, type);
        }

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        await setSessionFromHash(search, hash);

        // Supabase can finish implicit hash handling asynchronously on mobile browsers.
        await new Promise((resolve) => window.setTimeout(resolve, 700));
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!data.session) {
          toast({ title: "Email confirmed", description: "Please log in once to finish opening Sjoh on this device." });
          navigate(getLoginUrl(nextPath), { replace: true });
          return;
        }

        if (!cancelled) {
          toast({ title: "Email confirmed", description: "You're signed in. Let's get you sorted." });
          navigate(nextPath, { replace: true });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "We could not confirm this email link.";
        if (!cancelled && isLikelyConfirmedButNotSignedIn(message)) {
          toast({ title: "Email confirmed", description: "Please log in once to finish opening Sjoh on this device." });
          navigate(getLoginUrl(nextPath), { replace: true });
        } else if (!cancelled) {
          setError(message);
        }
      }
    };

    void finishConfirmation();

    return () => {
      cancelled = true;
    };
  }, [navigate, nextPath]);

  return (
    <SiteLayout>
      <main className="min-h-[70dvh] bg-[#050505] px-4 py-16 text-white">
        <div className="mx-auto max-w-lg rounded-[2rem] border border-white/15 bg-white/[0.07] p-7 text-center shadow-2xl shadow-black/30 backdrop-blur-xl md:p-10">
          {error ? (
            <>
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-sa-red/15 text-sa-red">
                <TriangleAlert className="size-7" />
              </div>
              <h1 className="font-display mt-6 text-3xl font-extrabold">That confirmation link got stuck.</h1>
              <p className="mt-3 text-sm leading-6 text-white/65">{error}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild className="rounded-full bg-white px-6 text-sa-dark hover:bg-white/90">
                  <Link to="/login">Log in instead</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-white/25 bg-white/5 px-6 text-white hover:bg-white/10">
                  <Link to="/register">Create account again</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-sa-green/15 text-sa-green">
                <MailCheck className="size-7" />
              </div>
              <h1 className="font-display mt-6 text-3xl font-extrabold">Confirming your email...</h1>
              <p className="mt-3 text-sm leading-6 text-white/65">Hold tight while Sjoh signs you in and sends you to the right place.</p>
              <Loader2 className="mx-auto mt-7 size-6 animate-spin text-white/70" />
            </>
          )}
        </div>
      </main>
    </SiteLayout>
  );
};

export default AuthConfirm;

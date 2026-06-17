import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SiteLayout } from "@/components/SiteLayout";
import { SjohWordmark } from "@/components/SjohWordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShieldCheck, HandCoins, Handshake, Gift } from "lucide-react";
import heroGroup from "@/assets/hero-group-3.jpg";

interface AuthShellProps {
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}

const getSafeNextPath = (location: ReturnType<typeof useLocation>) => {
  const fromState = (location.state as { from?: string } | null)?.from;
  const fromQuery = new URLSearchParams(location.search).get("next");
  const target = fromState || fromQuery || "/dashboard";
  return target.startsWith("/") && !target.startsWith("//") ? target : "/dashboard";
};

const withNext = (path: string, nextPath: string) =>
  nextPath === "/dashboard" ? path : `${path}?next=${encodeURIComponent(nextPath)}`;

const getAuthConfirmUrl = (nextPath: string) =>
  `${window.location.origin}/auth/confirm?next=${encodeURIComponent(nextPath)}`;

const authInputClass =
  "h-12 border-white/15 bg-white/[0.08] text-white placeholder:text-white/35 shadow-inner shadow-black/10 focus-visible:ring-white/35";

const primaryAuthButtonClass =
  "h-12 rounded-2xl border border-white/20 bg-white text-[color:var(--sa-dark)] shadow-[0_16px_35px_rgba(255,255,255,0.12)] hover:bg-white/90";

const authLinkClass = "font-semibold text-[color:var(--sa-gold)] hover:underline";

const BrandPanel = () => (
  <aside className="relative hidden min-h-[620px] overflow-hidden rounded-[2rem] border border-white/15 bg-[#080808] p-10 text-white shadow-2xl lg:flex lg:flex-col lg:justify-between">
    <img src={heroGroup} alt="" className="absolute inset-0 size-full object-cover opacity-75" />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.82)),linear-gradient(90deg,rgba(0,0,0,0.86),rgba(0,0,0,0.15))]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(245,166,35,0.18),transparent_28%),radial-gradient(circle_at_20%_78%,rgba(232,62,140,0.14),transparent_30%),radial-gradient(circle_at_58%_62%,rgba(11,110,58,0.12),transparent_34%)]" />

    <div className="relative z-10">
      <Link to="/" aria-label="Sjoh home">
        <SjohWordmark className="text-5xl" />
      </Link>
      <div className="mt-10 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white backdrop-blur-xl">
        <span className="mr-2 text-[color:var(--sa-green)]">●</span>
        One account. Properly sorted.
      </div>
      <h2 className="font-display mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white">
        Find someone who can do it properly.
      </h2>
      <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">
        One Sjoh account lets you post jobs, compare quotes, save invoices, or build a business profile customers can trust.
      </p>
    </div>

    <ul className="relative z-10 space-y-3 text-sm">
      {[
        { Icon: HandCoins, text: "Customers get real quotes. Pros keep the full job." },
        { Icon: ShieldCheck, text: "Profiles, reviews and trust signals in one place." },
        { Icon: Handshake, text: "Contact unlocks when the quote is accepted." },
      ].map(({ Icon, text }) => (
        <li key={text} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.08] p-3 backdrop-blur-xl">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-white/15">
            <Icon className="size-4" />
          </span>
          <span className="font-semibold">{text}</span>
        </li>
      ))}
    </ul>
  </aside>
);

const AuthShell = ({ title, subtitle, footer, children }: AuthShellProps) => (
  <SiteLayout>
    <div className="relative overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_50%_0%,rgba(107,124,232,0.18),transparent_62%)]" />
      <div className="container relative py-10 md:py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-stretch max-w-6xl mx-auto">
          <div className="flex flex-col">
            <Link to="/" className="inline-block mb-8 lg:hidden" aria-label="Sjoh home">
              <SjohWordmark className="text-4xl" />
            </Link>
            <div className="rounded-[2rem] border border-white/15 bg-white/[0.07] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-8 lg:mt-auto">
              <div className="mb-8 inline-flex rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white">
                <span className="mr-2 text-[color:var(--sa-pink)]">●</span>
                Sjoh account
              </div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-white md:text-5xl">{title}</h1>
              <p className="mt-3 max-w-md text-base leading-7 text-white/70">{subtitle}</p>
            </div>
            <div className="mt-5 rounded-[1.75rem] border border-white/15 bg-white/[0.08] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl md:p-7">
              {children}
            </div>
            <div className="mt-6 text-sm text-white/60">{footer}</div>
          </div>
          <BrandPanel />
        </div>
      </div>
    </div>
  </SiteLayout>
);

const EmailOnlyNotice = () => (
  <div className="rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-xs leading-5 text-white/60">
    Google and Apple sign-in are paused for launch while Sjoh finishes moving fully off Lovable. Use email and password for now.
  </div>
);

const useRedirectIfAuthed = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!loading && session) {
      navigate(getSafeNextPath(location), { replace: true });
    }
  }, [session, loading, navigate, location]);
};

export const Login = () => {
  useRedirectIfAuthed();
  const location = useLocation();
  const navigate = useNavigate();
  const nextPath = getSafeNextPath(location);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("confirmed") === "1") {
      toast({
        title: "Email confirmed",
        description: "Log in once to finish opening Sjoh on this device.",
      });
    }
  }, [location.search]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast({ title: "Couldn't log in", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Welcome back" });
    navigate(nextPath, { replace: true });
  };

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Log in to post a job, compare quotes, save invoices, or manage your business profile."
      footer={<>Don't have an account? <Link to={withNext("/register", nextPath)} className={authLinkClass}>Create one</Link></>}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="login-email" className="text-white/85">Email</Label>
          <Input id="login-email" type="email" required placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={authInputClass} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="login-password" className="text-white/85">Password</Label>
          <Input id="login-password" type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={authInputClass} />
        </div>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-white/55 hover:text-white">Forgot password?</Link>
        </div>
        <Button className={`w-full ${primaryAuthButtonClass}`} size="lg" disabled={submitting}>
          {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Log in
        </Button>
        <EmailOnlyNotice />
      </form>
    </AuthShell>
  );
};

export const Register = () => {
  useRedirectIfAuthed();
  const location = useLocation();
  const navigate = useNavigate();
  const nextPath = getSafeNextPath(location);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [referralCode, setReferralCode] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromUrl = params.get("ref")?.trim().toUpperCase();
    if (fromUrl) {
      setReferralCode(fromUrl);
      try { localStorage.setItem("sjoh_pending_referral", fromUrl); } catch { /* ignore */ }
    } else {
      try {
        const stored = localStorage.getItem("sjoh_pending_referral");
        if (stored) setReferralCode(stored);
      } catch { /* ignore */ }
    }
  }, [location.search]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast({ title: "Please accept the terms", description: "You need to agree to the Terms before creating an account.", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthConfirmUrl(nextPath),
        data: { display_name: displayName, referral_code: referralCode || null },
      },
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Couldn't create account", description: error.message, variant: "destructive" });
      return;
    }

    if (referralCode && data.session) {
      const { error: refErr } = await supabase.rpc("claim_referral_code", { _code: referralCode });
      if (!refErr) {
        try { localStorage.removeItem("sjoh_pending_referral"); } catch { /* ignore */ }
        toast({ title: "Referral linked!", description: "When you upgrade to Verified Pro, you both get a free month." });
      }
    }

    if (data.session) {
      toast({ title: "Sharp-sharp!", description: "You're in. Let's get to work." });
      navigate(nextPath, { replace: true });
    } else {
      toast({ title: "Check your email", description: "Tap the confirmation link, then we'll take you back to where you started." });
    }
  };

  return (
    <AuthShell
      title="Create your Sjoh account."
      subtitle="Use one account to post jobs, accept quotes, save invoices, or list your business."
      footer={<>Already have an account? <Link to={withNext("/login", nextPath)} className={authLinkClass}>Log in</Link></>}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {referralCode && (
          <div className="rounded-2xl border border-white/15 bg-white/[0.06] px-3 py-2 text-xs flex items-start gap-2">
            <Gift className="size-4 text-[color:var(--sa-pink)] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">Referral applied: <span className="font-mono">{referralCode}</span></div>
              <div className="text-white/65 mt-0.5">When you upgrade to Verified Pro, you both get a free month.</div>
            </div>
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="reg-name" className="text-white/85">Your name</Label>
          <Input id="reg-name" required placeholder="First name + surname" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={authInputClass} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-email" className="text-white/85">Email</Label>
          <Input id="reg-email" type="email" required placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={authInputClass} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-password" className="text-white/85">Password</Label>
          <Input id="reg-password" type="password" required minLength={8} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className={authInputClass} />
        </div>
        <label className="flex items-start gap-2.5 text-xs cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            required
            className="mt-0.5 size-4 rounded border-white/20 bg-white/10 text-[color:var(--sa-green)] focus:ring-white/35 cursor-pointer shrink-0"
          />
          <span className="text-white/60 leading-relaxed">
            I agree to the <Link to="/terms" className={authLinkClass}>Terms of Service</Link> and POPIA privacy policy, and confirm I will not offer or request illegal services.
          </span>
        </label>
        <Button className={`w-full ${primaryAuthButtonClass}`} size="lg" disabled={submitting || !agreeTerms}>
          {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Create account
        </Button>
        <EmailOnlyNotice />
      </form>
    </AuthShell>
  );
};

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Couldn't send reset", description: error.message, variant: "destructive" });
      return;
    }
    setSent(true);
  };

  return (
    <AuthShell
      title="Forgot the password?"
      subtitle="No stress — pop in your email and we'll send a reset link."
      footer={<>Remembered it? <Link to="/login" className={authLinkClass}>Back to log in</Link></>}
    >
      {sent ? (
        <p className="text-sm text-white/75">Check your inbox at <strong className="text-white">{email}</strong> for the reset link.</p>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="forgot-email" className="text-white/85">Email</Label>
            <Input id="forgot-email" type="email" required placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={authInputClass} />
          </div>
          <Button className={`w-full ${primaryAuthButtonClass}`} size="lg" disabled={submitting}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
};

export const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      toast({ title: "Couldn't update password", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Password updated" });
    navigate("/dashboard", { replace: true });
  };

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Pick something strong — you'll only have to do this once."
      footer={<Link to="/login" className={authLinkClass}>Back to log in</Link>}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="reset-password" className="text-white/85">New password</Label>
          <Input id="reset-password" type="password" required minLength={8} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className={authInputClass} />
        </div>
        <Button className={`w-full ${primaryAuthButtonClass}`} size="lg" disabled={submitting}>
          {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Update password
        </Button>
      </form>
    </AuthShell>
  );
};

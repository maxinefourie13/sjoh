import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Store, X } from "lucide-react";

/**
 * First-visit intent picker.
 *
 * Sjoh is a new concept for many South Africans, and pros kept saying they
 * couldn't tell how to list their business. This one-time, non-blocking
 * overlay asks "What brings you to Sjoh?" and routes people straight to the
 * right flow — or lets them dismiss and browse.
 */
const SEEN_KEY = "sjoh_intent_seen";

// Only greet people on discovery/landing pages — never interrupt someone who
// is mid-signup, logging in, in the dashboard, or deep in an admin/flow route.
const SUPPRESSED_PREFIXES = [
  "/login", "/register", "/list", "/dashboard", "/admin",
  "/auth", "/requests/new", "/r/", "/invoice", "/quote",
];

export const WelcomeIntentModal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(SEEN_KEY) === "1"; } catch { /* ignore */ }
    if (seen) return;

    const suppressed = SUPPRESSED_PREFIXES.some((p) => location.pathname.startsWith(p));
    if (suppressed) return;

    // A short beat so it feels like a greeting, not a jump-scare on load.
    const t = setTimeout(() => setShow(true), 900);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const dismiss = () => {
    try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* ignore */ }
    setShow(false);
  };

  const choose = (to: string) => {
    dismiss();
    navigate(to);
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-intent-title"
    >
      {/* Backdrop — clicking it is the same as "just browsing". */}
      <button
        aria-label="Close"
        onClick={dismiss}
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px] animate-in fade-in"
      />

      <div className="relative w-full sm:max-w-lg bg-card rounded-t-3xl sm:rounded-3xl border border-border shadow-pop p-6 sm:p-8 animate-in slide-in-from-bottom-4 sm:zoom-in-95">
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-4 top-4 size-8 rounded-full grid place-items-center text-ink-2 hover:bg-secondary transition-colors"
        >
          <X className="size-4" />
        </button>

        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-sa-green">Welcome to Sjoh</p>
        <h2 id="welcome-intent-title" className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5">
          What brings you here?
        </h2>
        <p className="text-sm text-ink-2 mt-2">
          Sjoh connects South Africans with trusted local pros. Pick what fits — you can always explore first.
        </p>

        <div className="mt-6 grid gap-3">
          {/* Customer */}
          <button
            onClick={() => choose("/requests/new")}
            className="group text-left rounded-2xl border-2 border-border p-4 hover:border-sa-green hover:bg-sa-green/5 transition-all active:scale-[0.99] flex items-start gap-4"
          >
            <span className="size-12 shrink-0 rounded-xl bg-sa-green/10 text-sa-green grid place-items-center group-hover:bg-sa-green group-hover:text-white transition-colors">
              <Search className="size-6" strokeWidth={2.4} />
            </span>
            <span className="flex-1">
              <span className="block font-display font-extrabold text-base">I need something done</span>
              <span className="block text-sm text-ink-2 mt-0.5">
                Get free quotes from vetted professionals near you.
              </span>
            </span>
          </button>

          {/* Pro */}
          <button
            onClick={() => choose("/list")}
            className="group text-left rounded-2xl border-2 border-border p-4 hover:border-sa-gold hover:bg-sa-gold/5 transition-all active:scale-[0.99] flex items-start gap-4"
          >
            <span className="size-12 shrink-0 rounded-xl bg-sa-gold/15 text-sa-dark grid place-items-center group-hover:bg-sa-gold transition-colors">
              <Store className="size-6" strokeWidth={2.4} />
            </span>
            <span className="flex-1">
              <span className="block font-display font-extrabold text-base">I run a business</span>
              <span className="block text-sm text-ink-2 mt-0.5">
                List your business, get found, and send quotes &amp; invoices in-app.
              </span>
            </span>
          </button>
        </div>

        <button
          onClick={dismiss}
          className="mt-4 w-full text-center text-sm font-semibold text-ink-2 hover:text-foreground transition-colors py-1"
        >
          I'm just browsing →
        </button>
      </div>
    </div>
  );
};

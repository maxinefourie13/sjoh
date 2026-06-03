import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";

const COOKIE_KEY = "sjoh_cookie_consent";
const COOKIE_AT_KEY = "sjoh_cookie_consent_at";

type CookieChoice = "all" | "essential";

const recordChoice = (choice: CookieChoice) => {
  try {
    localStorage.setItem(COOKIE_KEY, choice);
    localStorage.setItem(COOKIE_AT_KEY, new Date().toISOString());
  } catch { /* ignore */ }
};

export const CookieConsent = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const existing = localStorage.getItem(COOKIE_KEY);
      if (!existing) {
        const t = window.setTimeout(() => setOpen(true), 600);
        return () => window.clearTimeout(t);
      }
    } catch { /* ignore */ }
  }, []);

  // Body scroll lock while open — makes it feel like a real prompt.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const handle = (choice: CookieChoice) => {
    recordChoice(choice);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      {/* Dimming overlay */}
      <div
        aria-hidden
        className="absolute inset-0 bg-black/75 backdrop-blur-[3px] animate-in fade-in duration-300"
      />

      {/* Frosted glass premium card with South African navy/dark tint */}
      <div
        className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 border border-white/15 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        style={{
          background:
            "linear-gradient(135deg, rgba(26, 26, 26, 0.65) 0%, rgba(10, 36, 99, 0.5) 100%)",
          boxShadow:
            "0 25px 60px -15px rgba(0, 0, 0, 0.45), 0 10px 30px -10px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
        }}
      >
        {/* Floating cookie chip with micro-animation */}
        <div className="absolute -top-5 left-6 sm:left-7 size-12 rounded-full bg-sa-gold text-sa-dark flex items-center justify-center shadow-lg ring-2 ring-white/15 -rotate-12 animate-soft-bob">
          <Cookie className="size-6" strokeWidth={2.25} aria-hidden />
        </div>

        <div className="pt-4">
          <h2 className="font-display text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Sjoh! Another cookie policy, eish! 🍪
          </h2>
          <p className="mt-2 text-sm sm:text-[15px] text-white/85 leading-relaxed">
            We use digital cookies to make sure the site doesn't act like a mampara.
            They help us remember your city and keep things secure—no crumbs, no mess.
            Are you down to dunk them? ☕
          </p>

          <div className="mt-5 flex flex-col sm:flex-row sm:flex-wrap gap-2.5">
            <button
              onClick={() => handle("all")}
              className="inline-flex items-center justify-center rounded-full bg-sa-gold px-5 py-2.5 text-sm font-extrabold text-sa-dark shadow-md hover:bg-sa-gold/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
            >
              All cookies
            </button>
            <button
              onClick={() => handle("essential")}
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-all duration-150"
            >
              Just the essentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;

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

  const handle = (choice: CookieChoice) => {
    recordChoice(choice);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex justify-center p-3 sm:justify-end sm:p-6"
    >
      {/* Frosted glass premium card with South African navy/dark tint */}
      <div
        className="pointer-events-auto relative w-full max-w-[24rem] rounded-3xl border border-white/15 p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 sm:max-w-md sm:p-6"
        style={{
          background:
            "linear-gradient(135deg, rgba(18, 18, 20, 0.9) 0%, rgba(10, 36, 99, 0.82) 100%)",
          boxShadow:
            "0 25px 60px -15px rgba(0, 0, 0, 0.55), 0 10px 30px -10px rgba(0, 0, 0, 0.35)",
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
        }}
      >
        {/* Floating cookie chip with micro-animation */}
        <div className="absolute -top-4 left-5 flex size-10 items-center justify-center rounded-full bg-sa-gold text-sa-dark shadow-lg ring-2 ring-white/15 -rotate-12">
          <Cookie className="size-5" strokeWidth={2.25} aria-hidden />
        </div>

        <div className="pt-3">
          <h2 className="font-display text-lg font-black tracking-tight text-white sm:text-xl">
            Sjoh! Another cookie policy, eish! 🍪
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/80">
            Cookies keep Sjoh secure, remember your preferences and help us improve the marketplace. Choose what works for you.
          </p>

          <div className="mt-4 grid gap-2.5 min-[390px]:grid-cols-2 sm:grid-cols-[auto_auto]">
            <button
              onClick={() => handle("all")}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-sa-gold px-5 py-2.5 text-sm font-extrabold text-sa-dark shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:bg-sa-gold/90 hover:shadow-lg active:translate-y-0"
            >
              All cookies
            </button>
            <button
              onClick={() => handle("essential")}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/30 px-5 py-2.5 text-sm font-bold text-white transition-all duration-150 hover:bg-white/10"
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

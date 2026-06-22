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
      <div
        className="pointer-events-auto relative w-full max-w-[22rem] rounded-3xl border border-white/15 p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 sm:max-w-sm sm:p-5"
        style={{
          background:
            "linear-gradient(135deg, rgba(18, 18, 20, 0.9) 0%, rgba(10, 36, 99, 0.82) 100%)",
          boxShadow:
            "0 25px 60px -15px rgba(0, 0, 0, 0.55), 0 10px 30px -10px rgba(0, 0, 0, 0.35)",
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
        }}
      >
        <div className="absolute -top-3 left-5 flex size-9 items-center justify-center rounded-full bg-sa-gold text-sa-dark shadow-lg ring-2 ring-white/15 -rotate-12">
          <Cookie className="size-4" strokeWidth={2.25} aria-hidden />
        </div>

        <div className="pt-2">
          <h2 className="font-display text-base font-black tracking-tight text-white sm:text-lg">
            Cookies?
          </h2>

          <div className="mt-3 grid gap-2.5 min-[390px]:grid-cols-2">
            <button
              onClick={() => handle("all")}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-sa-gold px-5 py-2 text-sm font-extrabold text-sa-dark shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:bg-sa-gold/90 hover:shadow-lg active:translate-y-0"
            >
              Accept all
            </button>
            <button
              onClick={() => handle("essential")}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/30 px-5 py-2 text-sm font-bold text-white transition-all duration-150 hover:bg-white/10"
            >
              Essentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;

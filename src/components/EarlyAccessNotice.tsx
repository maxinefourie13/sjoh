import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import boKaap from "@/assets/optimized/bo-kaap.webp";
import earlyAccessFlag from "@/assets/optimized/early-access-flag.webp";

type EarlyAccessNoticeProps = {
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaTo?: string;
  className?: string;
  fullBleed?: boolean;
  backgroundImage?: string;
};

export const EarlyAccessNotice = ({
  title = "You’re early. Very early.",
  body = "Sjoh is still onboarding South African pros, so some areas may look a little quiet while the marketplace fills up.",
  ctaLabel = "Founding pros: list your business",
  ctaTo = "/list",
  className,
  fullBleed = false,
  backgroundImage,
}: EarlyAccessNoticeProps) => {
  if (fullBleed) {
    return (
      <section
        className={cn(
          "group relative overflow-hidden border-y border-white/12 text-white",
          className,
        )}
      >
        <img
          src={backgroundImage ?? earlyAccessFlag}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-[center_78%] opacity-58 transition-transform duration-500 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,9,18,.9) 0%, rgba(5,9,18,.72) 48%, rgba(5,9,18,.52) 100%)",
          }}
        />
        <div className="container relative py-14 md:py-20">
          <div className="max-w-4xl">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-white/88">
              Early access marketplace
            </p>
            <h2 className="font-display-bold text-4xl leading-[0.98] text-white sm:text-5xl md:text-6xl">
              {title}
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/88 md:text-xl">
              {body}
            </p>
            <Link
              to={ctaTo}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-wide text-sa-dark transition hover:bg-sa-gold"
            >
              {ctaLabel}
              <ArrowRight className="size-4" strokeWidth={3} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[1.75rem] border border-white/16 bg-[#0a0f1a] p-5 text-white shadow-[0_28px_58px_-30px_rgba(0,0,0,0.98)] transition-all duration-300 hover:border-white/24 hover:shadow-[0_36px_74px_-36px_rgba(0,0,0,0.98)] md:p-6",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-75"
        style={{
          background:
            "linear-gradient(125deg, rgba(239,51,64,0.18) 0%, rgba(53,94,220,0.22) 28%, rgba(20,154,89,0.2) 55%, rgba(247,187,58,0.2) 78%, rgba(241,67,160,0.2) 100%)",
        }}
      />
      <img
        src={boKaap}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-48 transition-transform duration-500 group-hover:scale-[1.03]"
        loading="lazy"
        decoding="async"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.92)_0%,rgba(0,0,0,.68)_50%,rgba(0,0,0,.35)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-2.5"
        style={{
          background:
            "linear-gradient(90deg, var(--sa-red) 0%, var(--sa-navy) 24%, var(--sa-green) 48%, var(--sa-gold) 74%, var(--sa-pink) 100%)",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-sa-peri/25 blur-3xl transition-opacity duration-300 group-hover:opacity-90" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 right-0 size-72 rounded-full bg-sa-gold/20 blur-3xl transition-opacity duration-300 group-hover:opacity-95" />
      <div aria-hidden className="absolute bottom-0 right-0 hidden h-full w-56 opacity-80 md:block">
        <div className="absolute right-10 top-8 size-5 rotate-45 bg-sa-gold" />
        <div className="absolute right-24 top-16 size-4 rotate-45 bg-sa-pink" />
        <div className="absolute right-16 bottom-12 size-6 rotate-45 bg-sa-green" />
        <div className="absolute right-36 bottom-20 size-3 rotate-45 bg-white/70" />
      </div>
      <div className="relative grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex gap-4">
          <span className="mt-1 flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-black/45 text-sa-gold backdrop-blur-md">
            <Sparkles className="size-6" strokeWidth={2.5} />
          </span>
          <div>
            <p className="inline-flex items-center rounded-full border border-white/18 bg-black/38 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white/88 backdrop-blur-sm">Early access marketplace</p>
            <p className="mt-2 font-display-bold text-2xl leading-[1.02] text-white md:text-[3rem] md:leading-[0.97]">{title}</p>
            <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-white/90 md:text-[1.12rem]">{body}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
          <div className="rounded-2xl border border-white/24 bg-black/48 px-4 py-3 backdrop-blur-md shadow-[0_12px_30px_-18px_rgba(0,0,0,0.95)]">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/60">
              <UsersRound className="size-4 text-sa-gold" strokeWidth={2.5} />
              Founding window
            </div>
            <p className="mt-1 font-display text-2xl font-black text-white">First 500</p>
            <p className="text-xs font-semibold text-white/58">pros get early perks</p>
          </div>
          <Link
            to={ctaTo}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#f8c95e_0%,#e5ad37_100%)] px-5 py-3 text-sm font-black text-sa-dark shadow-[0_14px_28px_-16px_rgba(247,187,58,0.95)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_20px_34px_-16px_rgba(247,187,58,0.95)]"
          >
            {ctaLabel}
            <ArrowRight className="size-4" strokeWidth={3} />
          </Link>
        </div>
      </div>
    </div>
  );
};

import { Link } from "react-router-dom";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Business } from "@/lib/mockData";
import { EXAMPLE_BUSINESS_ID } from "@/lib/exampleBusiness";
import { cn } from "@/lib/utils";

interface BusinessCardProps {
  business: Business;
  className?: string;
}

export const BusinessCard = ({ business, className }: BusinessCardProps) => {
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(business.followers);

  const isExample = business.id === EXAMPLE_BUSINESS_ID;

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setFollowing((f) => {
      const next = !f;
      setFollowers((c) => (next ? c + 1 : c - 1));
      return next;
    });
  };

  // ---- Example / preview card ----------------------------------------------
  if (isExample) {
    return (
      <Link
        to="/example-listing"
        className={cn(
          "group relative block bg-card rounded-xl border-2 border-dashed border-primary/60 overflow-hidden shadow-card hover:shadow-pop hover:-translate-y-0.5 transition-all duration-300",
          className,
        )}
        aria-label="Preview an example listing"
      >
        <div className="h-28 relative overflow-hidden sample-gradient">
          <span className="absolute top-3 left-3 z-10 bg-background/95 text-foreground text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded shadow-soft">
            Sample listing
          </span>
          <div className="absolute -bottom-7 left-5 z-10 size-14 rounded-xl bg-card border-4 border-card shadow-soft flex items-center justify-center font-display font-bold text-xl text-foreground">
            {business.name.charAt(0)}
          </div>
        </div>

        <div className="pt-10 px-5 pb-5">
          <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
            {business.name}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {business.category} <span className="opacity-50">·</span> {business.city}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {business.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="mt-3 text-xs text-ink-2 leading-relaxed">
            Click to see what a client sees on your profile →
          </p>
        </div>
      </Link>
    );
  }

  // ---- Real card ------------------------------------------------------------
  return (
    <Link
      to={`/business/${business.slug}`}
      className={cn(
        "group block bg-card rounded-xl border border-border overflow-hidden shadow-card hover:shadow-pop hover:-translate-y-0.5 transition-all duration-300",
        className,
      )}
    >
      {/* Cover — photo when available, otherwise gradient */}
      <div className={cn("h-28 relative overflow-hidden", !business.image && business.gradient)}>
        {business.image && (
          <>
            <img
              src={business.image}
              alt={`${business.name} — ${business.category}`}
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
          </>
        )}
        {business.hasPromo && (
          <span className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded">
            Promo
          </span>
        )}
        {business.plan === "featured" && (
          <span className="absolute top-3 right-3 z-10 bg-foreground/85 text-background text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded">
            Featured
          </span>
        )}
        <div className="absolute -bottom-7 left-5 z-10 size-14 rounded-xl bg-card border-4 border-card shadow-soft flex items-center justify-center font-display font-bold text-xl text-foreground">
          {business.name.charAt(0)}
        </div>
      </div>

      <div className="pt-10 px-5 pb-5">
        <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
          {business.name}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {business.category} <span className="opacity-50">·</span> {business.city}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {business.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium px-2 py-0.5 rounded bg-secondary text-ink-2"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-1.5 text-sm">
            <span className="font-semibold text-accent">{business.rating.toFixed(1)}</span>
            <span className="text-muted-foreground text-xs">({business.reviewCount} reviews)</span>
          </div>
          <Button
            size="sm"
            variant={following ? "soft" : "outline"}
            onClick={toggle}
            className="h-8 text-xs"
          >
            {following ? "Following" : "Follow"}
            <span className="text-muted-foreground tabular-nums">· {followers}</span>
          </Button>
        </div>
      </div>
    </Link>
  );
};

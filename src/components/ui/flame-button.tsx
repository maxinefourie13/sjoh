import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

/**
 * FlameButton — charcoal base with a coral "flame" glow that follows the cursor.
 * Drop-in replacement for our standard <Button> for hero/marketing CTAs.
 *
 * Style note: keep this for primary marketing moments (hero, pricing, "Post a job").
 * Don't use it for every button — the glow is meant to feel special.
 */

export interface FlameButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  size?: "default" | "lg" | "xl";
}

const sizeClasses: Record<NonNullable<FlameButtonProps["size"]>, string> = {
  default: "h-11 min-h-[44px] px-6 text-sm",
  lg: "h-12 min-h-[48px] px-8 text-base",
  xl: "h-14 px-10 text-base",
};

export const FlameButton = React.forwardRef<HTMLButtonElement, FlameButtonProps>(
  ({ className, children, asChild = false, size = "default", ...props }, ref) => {
    const wrapperRef = React.useRef<HTMLSpanElement>(null);
    const [pos, setPos] = React.useState({ x: 0.5, y: 0.5, ready: false });

    const handleMove = (e: React.MouseEvent<HTMLElement>) => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
        ready: true,
      });
    };

    const handleLeave = () => {
      setPos((p) => ({ ...p, x: 0.5, y: 0.5 }));
    };

    const Comp: any = asChild ? Slot : "button";

    // Glow position as percentages so it scales with any button size.
    const xPct = `${pos.x * 100}%`;
    const yPct = `${pos.y * 100}%`;

    return (
      <span
        ref={wrapperRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className={cn("relative inline-block isolate overflow-hidden rounded-full", className)}
      >
        {/* Coral flame glow — sibling of the button so asChild/Slot only sees one child */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{ opacity: pos.ready ? 1 : 0.7 }}
        >
          {/* Inner hot core */}
          <span
            className="absolute rounded-full"
            style={{
              width: "140px",
              height: "140px",
              left: xPct,
              top: yPct,
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(50% 50% at 50% 50%, hsl(43 100% 88% / 0.95) 0%, hsl(43 100% 60% / 0.85) 28%, hsl(3 73% 53% / 0.55) 50%, hsl(3 73% 53% / 0) 92%)",
            }}
          />
          {/* Wide soft halo */}
          <span
            className="absolute rounded-full blur-md"
            style={{
              width: "240px",
              height: "120px",
              left: xPct,
              top: yPct,
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(43% 44% at 50% 50%, hsl(43 100% 92% / 0.9) 28%, hsl(43 100% 60% / 0.55) 55%, hsl(3 73% 53% / 0) 100%)",
            }}
          />
        </span>

        <Comp
          ref={ref}
          className={cn(
            "relative z-10 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full",
            "border border-white/10 bg-foreground/90 text-background font-semibold",
            "shadow-[0_8px_24px_-8px_hsl(230_22%_8%_/_0.45)]",
            "transition-[transform,box-shadow,background-color] duration-200",
            "hover:-translate-y-[1px] hover:shadow-[0_14px_36px_-10px_hsl(43_100%_55%_/_0.55)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:pointer-events-none disabled:opacity-50",
            "backdrop-blur-[1px]",
            sizeClasses[size],
          )}
          {...props}
        >
          {children}
        </Comp>
      </span>
    );
  },
);
FlameButton.displayName = "FlameButton";

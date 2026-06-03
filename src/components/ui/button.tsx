import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-[transform,box-shadow,background-color,color,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:hover:translate-y-0 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-200 hover:[&_svg]:translate-x-0.5",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_10px_24px_-16px_hsl(var(--primary)/0.7)] hover:shadow-[0_16px_30px_-16px_hsl(var(--primary)/0.75)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_10px_24px_-16px_hsl(var(--destructive)/0.7)]",
        outline: "border border-border bg-background hover:bg-secondary hover:border-primary/35 text-foreground shadow-[0_8px_20px_-18px_rgba(0,0,0,0.45)]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-[0_8px_20px_-18px_rgba(0,0,0,0.35)]",
        ghost: "hover:bg-secondary text-foreground hover:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline hover:translate-y-0",
        ink: "bg-foreground text-background hover:bg-foreground/90 shadow-[0_10px_24px_-16px_rgba(0,0,0,0.65)]",
        soft: "bg-primary-light text-primary hover:bg-primary-light/70",
        amber: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_10px_24px_-16px_hsl(var(--accent)/0.7)]",
      },
      size: {
        default: "h-11 min-h-[44px] px-5",
        sm: "h-10 min-h-[40px] px-4 text-sm",
        lg: "h-12 min-h-[48px] px-6 text-base",
        xl: "h-14 min-h-[56px] px-8 text-base",
        icon: "h-10 w-10 min-h-[40px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

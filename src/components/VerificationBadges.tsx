import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  certifiedPro?: boolean;
  certifications?: string[];
  size?: "sm" | "md";
  className?: string;
}

export const VerificationBadges = ({
  certifiedPro,
  certifications = [],
  size = "md",
  className,
}: Props) => {
  const text = size === "sm" ? "text-[10px]" : "text-xs";
  const icon = size === "sm" ? "size-3" : "size-3.5";

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {certifiedPro && (
        <span
          title="Certified Pro — trade certificate uploaded and approved"
          className={cn("inline-flex items-center gap-1 font-bold uppercase tracking-widest text-accent-foreground bg-accent px-2 py-0.5 rounded", text)}
        >
          <BadgeCheck className={icon} strokeWidth={2.5} />
          Certified Pro
        </span>
      )}
      {certifications.map((c) => (
        <span key={c} className={cn("font-semibold text-ink-2 bg-secondary px-2 py-0.5 rounded", text)}>
          {c}
        </span>
      ))}
    </div>
  );
};

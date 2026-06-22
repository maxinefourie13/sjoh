import { cn } from "@/lib/utils";
import sjohLogo from "@/assets/optimized/sjoh-logo-new.webp";

export const SjohWordmark = ({ className }: { className?: string }) => (
  <span className={cn("inline-flex items-center text-4xl leading-none", className)}>
    <img
      src={sjohLogo}
      alt="Sjoh!"
      className="block h-[1em] w-auto object-contain"
      decoding="async"
    />
  </span>
);

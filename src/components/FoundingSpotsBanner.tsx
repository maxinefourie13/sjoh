import { useFoundingSpotsRemaining } from "@/hooks/useFoundingSpots";

/** Live "X founding spots left" pill. Hides when fewer than 1 spot remains or while loading. */
export const FoundingSpotsBanner = ({ className = "" }: { className?: string }) => {
  const { remaining, loading } = useFoundingSpotsRemaining();
  if (loading || remaining === null || remaining <= 0) return null;
  return (
    <div
      className={`inline-flex items-center rounded-full bg-primary/10 border border-primary/30 px-3.5 py-1.5 text-sm font-bold text-primary ${className}`}
      role="status"
      aria-live="polite"
    >
      HURRY! Only <span className="tabular-nums">{remaining}</span> Founding Spots Left!
    </div>
  );
};

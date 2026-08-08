import { LAGGING_THRESHOLD } from "../domains";
import { cn } from "@/lib/utils";

/** A circular progress indicator with an accessible text value. */
export function ProgressRing({
  value,
  size = 64,
  label,
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  const tone =
    value >= 80 ? "text-emerald-500" : value >= LAGGING_THRESHOLD ? "text-indigo-500" : "text-amber-500";
  return (
    <div
      className="relative inline-grid place-items-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label ?? "Progress"}: ${value}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn("fill-none transition-all", tone)}
          stroke="currentColor"
        />
      </svg>
      <span className="absolute text-sm font-semibold tabular-nums">{value}%</span>
    </div>
  );
}

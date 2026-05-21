import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, TicketPercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { payments } from "@/lib/payments";
import { cn } from "@/lib/utils";

export const LAUNCH_TRIAL_CODE = "SORTED30";

interface TrialCodeRedeemerProps {
  className?: string;
  tone?: "dark" | "light";
  compact?: boolean;
  successRedirect?: string;
  reloadOnSuccess?: boolean;
}

export function TrialCodeRedeemer({
  className,
  tone = "dark",
  compact = false,
  successRedirect = "/dashboard?section=billing&trial=1",
  reloadOnSuccess = false,
}: TrialCodeRedeemerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState(LAUNCH_TRIAL_CODE);
  const [redeeming, setRedeeming] = useState(false);

  const isDark = tone === "dark";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      toast({
        title: "Create your account first",
        description: "Then SORTED30 unlocks your 30-day Verified Pro trial.",
      });
      const next = `${window.location.pathname}${window.location.search}`;
      navigate(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    setRedeeming(true);
    const result = await payments.redeemTrialCode(code);
    setRedeeming(false);

    if (result) {
      if (reloadOnSuccess) {
        window.location.href = successRedirect;
        return;
      }
      navigate(successRedirect);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        isDark
          ? "border-white/10 bg-white/[0.06] text-white"
          : "border-sa-peri/25 bg-sa-peri/10 text-sa-dark",
        compact ? "space-y-3" : "space-y-4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
            isDark ? "bg-sa-peri text-white" : "bg-sa-dark text-white",
          )}
        >
          <TicketPercent className="size-5" strokeWidth={2.5} />
        </span>
        <div className="min-w-0">
          <p className="font-display text-base font-extrabold tracking-tight">
            Use {LAUNCH_TRIAL_CODE} for 30 days free.
          </p>
          <p className={cn("mt-1 text-sm leading-relaxed", isDark ? "text-white/62" : "text-sa-dark/65")}>
            No card needed for the code. One redemption per user, then choose R250/month to keep Verified Pro.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          aria-label="Trial code"
          className={cn(
            "h-12 font-bold tracking-[0.18em]",
            isDark ? "border-white/15 bg-black/35 text-white placeholder:text-white/35" : "bg-white",
          )}
          placeholder={LAUNCH_TRIAL_CODE}
        />
        <Button type="submit" disabled={redeeming || !code.trim()} className="h-12 shrink-0 font-bold">
          {redeeming ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Unlocking
            </>
          ) : (
            "Unlock trial"
          )}
        </Button>
      </form>
    </div>
  );
}

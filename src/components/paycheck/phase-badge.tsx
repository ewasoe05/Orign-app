import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatCurrencyDetailed } from "@/lib/utils";
import type { PaycheckPhase } from "@/lib/types";

export function PhaseBadge({
  phase,
  debtLeft,
  hysaBalance,
  hysaGoal,
  nextLabel,
  className,
}: {
  phase: PaycheckPhase;
  debtLeft: number;
  hysaBalance: number;
  hysaGoal: number;
  nextLabel?: string;
  className?: string;
}) {
  const label =
    phase === "debt"
      ? `PHASE 1 · DEBT PAYOFF · ${formatCurrency(debtLeft)} left`
      : `PHASE 2 · SAVINGS · ${formatCurrencyDetailed(hysaBalance)} / ${formatCurrency(hysaGoal)}`;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Badge variant={phase === "debt" ? "warning" : "success"}>{label}</Badge>
      {nextLabel ? (
        <p className="text-caption text-text-secondary">Next: {nextLabel}</p>
      ) : null}
    </div>
  );
}

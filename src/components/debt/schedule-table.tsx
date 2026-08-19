import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { scheduleRowsFromProjection } from "@/lib/projection-bridge";
import type { UserProjectionBundle } from "@/lib/projection-bridge";

export function ScheduleTable({
  currentTotal,
  planStartDate,
  bundle,
}: {
  currentTotal: number;
  planStartDate: string;
  bundle: UserProjectionBundle;
}) {
  const rows = scheduleRowsFromProjection(bundle.projection, currentTotal, planStartDate);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle>Payoff schedule</CardTitle>
        {!bundle.feasible && <Badge variant="warning">Plan infeasible</Badge>}
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map((entry) => (
          <div
            key={entry.month}
            className={`flex items-start justify-between gap-2 rounded-lg border p-3 ${
              entry.isCurrent ? "border-emerald-800 bg-emerald-950/20" : "border-zinc-800"
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Month {entry.month}</span>
                <span className="text-xs text-zinc-500">{entry.label}</span>
                {entry.complete && <Badge variant="success">Done</Badge>}
                {entry.isCurrent && !entry.complete && <Badge variant="warning">Current</Badge>}
              </div>
              <p className="mt-1 text-xs text-zinc-400">{entry.action}</p>
            </div>
            <span className="shrink-0 text-sm font-medium text-zinc-300">
              {formatCurrency(entry.targetRemaining)}
            </span>
          </div>
        ))}
        {bundle.debtFreeLabel && (
          <p className="text-xs text-zinc-500">
            Projected debt-free: {bundle.debtFreeLabel}
            {bundle.closingLabel ? ` · Duplex cash ready: ${bundle.closingLabel}` : ""}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

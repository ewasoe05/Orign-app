import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHeaderRow } from "@/components/ui/card-header-row";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
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
      <CardHeader>
        <CardHeaderRow
          action={!bundle.feasible ? <Badge variant="warning">Plan infeasible</Badge> : undefined}
        >
          <CardTitle>Payoff schedule</CardTitle>
        </CardHeaderRow>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map((entry) => (
          <Panel
            key={entry.month}
            className={
              entry.isCurrent ? "border-accent/40 bg-success-bg/50" : undefined
            }
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-body font-medium">Month {entry.month}</span>
                  <span className="text-caption text-text-secondary">{entry.label}</span>
                  {entry.complete && <Badge variant="success">Done</Badge>}
                  {entry.isCurrent && !entry.complete && <Badge variant="warning">Current</Badge>}
                </div>
                <p className="mt-1 text-caption text-text-secondary">{entry.action}</p>
              </div>
              <span className="shrink-0 text-body font-medium text-text-primary">
                {formatCurrency(entry.targetRemaining)}
              </span>
            </div>
          </Panel>
        ))}
        {bundle.debtFreeLabel && (
          <p className="text-caption text-text-secondary">
            Projected debt-free: {bundle.debtFreeLabel}
            {bundle.closingLabel ? ` · Duplex cash ready: ${bundle.closingLabel}` : ""}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

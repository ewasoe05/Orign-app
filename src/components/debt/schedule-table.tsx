import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { PAYOFF_SCHEDULE } from "@/lib/seed";
import { getCurrentPlanMonth } from "@/lib/debt-schedule";

export function ScheduleTable({
  currentTotal,
  planStartDate,
}: {
  currentTotal: number;
  planStartDate: string;
}) {
  const currentMonth = getCurrentPlanMonth(planStartDate);

  return (
    <Card>
      <CardHeader>
        <CardTitle>10-Month Payoff Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {PAYOFF_SCHEDULE.map((entry) => {
          const complete = entry.targetRemaining === 0
            ? currentTotal === 0
            : currentTotal <= entry.targetRemaining;
          const isCurrent = entry.month === currentMonth;

          return (
            <div
              key={entry.month}
              className={`flex items-start justify-between gap-2 rounded-lg border p-3 ${
                isCurrent ? "border-emerald-800 bg-emerald-950/20" : "border-zinc-800"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Month {entry.month}</span>
                  <span className="text-xs text-zinc-500">{entry.label}</span>
                  {complete && <Badge variant="success">Done</Badge>}
                  {isCurrent && !complete && <Badge variant="warning">Current</Badge>}
                </div>
                <p className="mt-1 text-xs text-zinc-400">{entry.action}</p>
              </div>
              <span className="shrink-0 text-sm font-medium text-zinc-300">
                {formatCurrency(entry.targetRemaining)}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

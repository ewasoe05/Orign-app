import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { getPaceStatus, paceBadgeVariant } from "@/lib/pace";
import { getDebtPaceWindow } from "@/lib/projection-bridge";
import { getScheduleStatus } from "@/lib/debt-schedule";
import { STARTING_DEBT_TOTAL } from "@/lib/seed";
import type { UserProjectionBundle } from "@/lib/projection-bridge";

export function DebtHero({
  totalDebt,
  planStartDate,
  bundle,
}: {
  totalDebt: number;
  planStartDate: string;
  bundle?: UserProjectionBundle;
}) {
  const fallback = getScheduleStatus(totalDebt, planStartDate);
  const window = bundle ? getDebtPaceWindow(bundle.projection, planStartDate) : null;
  const pace = window
    ? getPaceStatus({
        monthStart: window.monthStart,
        monthEndTarget: window.monthEndTarget,
        actual: totalDebt,
        today: new Date(),
        planMonthStart: window.planMonthStart,
      })
    : fallback.pace;
  const progress = fallback.progress;
  const month = window?.month ?? fallback.month;
  const paidOff = STARTING_DEBT_TOTAL - totalDebt;

  return (
    <Card className="border-emerald-900/50 bg-gradient-to-br from-emerald-950/40 to-zinc-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Total Debt</CardTitle>
          <Badge variant={paceBadgeVariant(pace.status)}>{pace.label}</Badge>
        </div>
        <CardDescription>
          Month {month}: {pace.subline}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-4xl font-bold tracking-tight text-emerald-400 lg:text-5xl">
          {formatCurrency(totalDebt)}
        </p>
        <Progress value={progress} />
        <div className="flex justify-between text-sm text-zinc-400">
          <span>{formatCurrency(paidOff)} paid off</span>
          <span>{formatCurrency(STARTING_DEBT_TOTAL)} starting</span>
        </div>
      </CardContent>
    </Card>
  );
}

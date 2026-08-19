import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHeaderRow } from "@/components/ui/card-header-row";
import { Metric } from "@/components/ui/metric";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <Card elevated>
      <CardHeader>
        <CardHeaderRow action={<Badge variant={paceBadgeVariant(pace.status)}>{pace.label}</Badge>}>
          <CardTitle>Total Debt</CardTitle>
        </CardHeaderRow>
        <CardDescription>
          Month {month}: {pace.subline}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Metric variant="display">{formatCurrency(totalDebt)}</Metric>
        <Progress value={progress} />
        <div className="flex justify-between text-caption text-text-secondary">
          <span>{formatCurrency(paidOff)} paid off</span>
          <span>{formatCurrency(STARTING_DEBT_TOTAL)} starting</span>
        </div>
        <Link href="/debt">
          <Button variant="outline" size="touch" className="w-full">
            View details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

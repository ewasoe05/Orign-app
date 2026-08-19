import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHeaderRow } from "@/components/ui/card-header-row";
import { Metric } from "@/components/ui/metric";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatCurrencyDetailed } from "@/lib/utils";
import { getPaceStatus, paceBadgeVariant } from "@/lib/pace";
import { getSavingsPaceWindow } from "@/lib/projection-bridge";
import type { SavingsSummary } from "@/lib/types";
import type { UserProjectionBundle } from "@/lib/projection-bridge";

export function SavingsHero({
  summary,
  planStartDate,
  bundle,
}: {
  summary: SavingsSummary;
  planStartDate: string;
  bundle?: UserProjectionBundle;
}) {
  const remaining = summary.remainingToDownPayment;
  const window = bundle ? getSavingsPaceWindow(bundle.projection, planStartDate) : null;
  const pace = window
    ? getPaceStatus({
        monthStart: window.monthStart,
        monthEndTarget: window.monthEndTarget,
        actual: summary.cashOnHand,
        today: new Date(),
        planMonthStart: window.planMonthStart,
        direction: "higher",
      })
    : null;

  return (
    <Card elevated>
      <CardHeader>
        <CardHeaderRow
          action={
            pace ? <Badge variant={paceBadgeVariant(pace.status)}>{pace.label}</Badge> : undefined
          }
        >
          <CardTitle>Savings remaining</CardTitle>
        </CardHeaderRow>
        <CardDescription>
          {remaining <= 0
            ? "Down payment stacked. Close on the duplex."
            : pace
              ? pace.subline
              : `${formatCurrency(remaining)} left to the $30K down payment`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Metric variant="display">{formatCurrencyDetailed(summary.cashOnHand)}</Metric>
        <Progress value={summary.progress} />
        <div className="flex justify-between text-caption text-text-secondary">
          <span>{formatCurrency(summary.cashOnHand)} on hand</span>
          <span>{formatCurrency(summary.downPaymentTarget)} target</span>
        </div>
        <Link href="/savings">
          <Button variant="outline" size="touch" className="w-full">
            View details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

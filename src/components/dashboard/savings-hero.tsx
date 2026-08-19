import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <Link href="/savings" className="block">
      <Card className="border-emerald-900/50 bg-gradient-to-br from-emerald-950/40 to-zinc-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Savings remaining</CardTitle>
            {pace && <Badge variant={paceBadgeVariant(pace.status)}>{pace.label}</Badge>}
          </div>
          <CardDescription>
            {remaining <= 0
              ? "Down payment stacked. Close on the duplex."
              : pace
                ? pace.subline
                : `${formatCurrency(remaining)} left to the $30K down payment`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-4xl font-bold tracking-tight text-emerald-400 lg:text-5xl">
            {formatCurrencyDetailed(summary.cashOnHand)}
          </p>
          <Progress value={summary.progress} />
          <div className="flex justify-between text-sm text-zinc-400">
            <span>{formatCurrency(summary.cashOnHand)} on hand</span>
            <span>{formatCurrency(summary.downPaymentTarget)} target</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

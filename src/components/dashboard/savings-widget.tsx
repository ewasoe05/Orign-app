import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { getPaceStatus, paceBadgeVariant } from "@/lib/pace";
import { getSavingsPaceWindow } from "@/lib/projection-bridge";
import type { SavingsSummary } from "@/lib/types";
import type { UserProjectionBundle } from "@/lib/projection-bridge";

export function SavingsWidget({
  summary,
  planStartDate,
  bundle,
}: {
  summary: SavingsSummary;
  planStartDate: string;
  bundle?: UserProjectionBundle;
}) {
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Toward Down Payment</CardTitle>
          {pace && <Badge variant={paceBadgeVariant(pace.status)}>{pace.label}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold text-emerald-400">
            {formatCurrency(summary.cashOnHand)}
          </span>
          <span className="text-sm text-zinc-400">
            of {formatCurrency(summary.downPaymentTarget)}
          </span>
        </div>
        <Progress value={summary.progress} />
        {pace && <p className="text-sm text-zinc-400">{pace.subline}</p>}
        {summary.nextMilestone && (
          <p className="text-sm text-zinc-400">
            Next: {summary.nextMilestone.description} ({summary.nextMilestone.label})
          </p>
        )}
        <Link href="/savings">
          <Button variant="outline" size="sm" className="w-full">
            Open savings
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

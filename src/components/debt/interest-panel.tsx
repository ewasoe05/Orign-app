import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatCurrencyDetailed } from "@/lib/utils";
import type { UserProjectionBundle } from "@/lib/projection-bridge";
import { centsToDollars } from "@/lib/projection";

export function InterestPanel({ bundle }: { bundle: UserProjectionBundle }) {
  const paid = centsToDollars(bundle.interest.paidToDateCents);
  const remaining = centsToDollars(bundle.interest.projectedRemainingCents);
  const saved =
    bundle.interest.savedVsMinimumsCents != null
      ? centsToDollars(bundle.interest.savedVsMinimumsCents)
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interest</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-body">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Paid to date (estimated)</span>
          <span className="font-medium">{formatCurrencyDetailed(paid)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Projected remaining</span>
          <span className="font-medium">{formatCurrencyDetailed(remaining)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-text-secondary">Saved vs minimums-only</span>
          {saved != null ? (
            <span className="font-medium text-accent-muted">{formatCurrencyDetailed(saved)}</span>
          ) : (
            <Badge>Minimums-only: {bundle.interest.minimumsOnlyLabel}</Badge>
          )}
        </div>
        <p className="text-caption text-text-tertiary">
          Monthly outlay driving this plan: {formatCurrencyDetailed(centsToDollars(bundle.monthlyOutlayCents))}
        </p>
      </CardContent>
    </Card>
  );
}

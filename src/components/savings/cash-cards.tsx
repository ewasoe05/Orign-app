import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Metric } from "@/components/ui/metric";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatCurrencyDetailed } from "@/lib/utils";
import type { SavingsSummary } from "@/lib/types";

export function SavingsHeroCard({ summary }: { summary: SavingsSummary }) {
  return (
    <Card elevated>
      <CardHeader>
        <CardTitle>Cash & down payment</CardTitle>
        <CardDescription>
          Started at {formatCurrencyDetailed(summary.startingCash)} ·{" "}
          {formatCurrency(summary.remainingToDownPayment)} remaining to $30K
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Metric variant="display">{formatCurrencyDetailed(summary.cashOnHand)}</Metric>
        <p className="text-caption text-text-secondary">Cash on hand</p>
        <Progress value={summary.progress} />
        <div className="flex justify-between text-caption text-text-secondary">
          <span>{formatCurrency(summary.cashOnHand)}</span>
          <span>{formatCurrency(summary.downPaymentTarget)} target</span>
        </div>
      </CardContent>
    </Card>
  );
}

/** @deprecated Use SavingsHeroCard */
export const CashOnHandCard = SavingsHeroCard;

/** @deprecated Merged into SavingsHeroCard */
export function DownPaymentProgress({ summary }: { summary: SavingsSummary }) {
  return <SavingsHeroCard summary={summary} />;
}

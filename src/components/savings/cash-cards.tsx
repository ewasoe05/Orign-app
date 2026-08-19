import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatCurrencyDetailed } from "@/lib/utils";
import type { SavingsSummary } from "@/lib/types";

export function CashOnHandCard({ summary }: { summary: SavingsSummary }) {
  return (
    <Card className="border-emerald-900/50 bg-gradient-to-br from-emerald-950/40 to-zinc-900">
      <CardHeader>
        <CardTitle>Cash on hand</CardTitle>
        <CardDescription>Started at {formatCurrencyDetailed(summary.startingCash)}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold tracking-tight text-emerald-400">
          {formatCurrencyDetailed(summary.cashOnHand)}
        </p>
      </CardContent>
    </Card>
  );
}

export function DownPaymentProgress({ summary }: { summary: SavingsSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>$30,000 down payment</CardTitle>
        <CardDescription>
          {formatCurrency(summary.remainingToDownPayment)} remaining
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress value={summary.progress} />
        <div className="flex justify-between text-sm text-zinc-400">
          <span>{formatCurrency(summary.cashOnHand)}</span>
          <span>{formatCurrency(summary.downPaymentTarget)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

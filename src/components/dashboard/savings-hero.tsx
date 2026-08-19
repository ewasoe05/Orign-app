import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatCurrencyDetailed } from "@/lib/utils";
import type { SavingsSummary } from "@/lib/types";

export function SavingsHero({ summary }: { summary: SavingsSummary }) {
  const remaining = summary.remainingToDownPayment;

  return (
    <Link href="/savings" className="block">
      <Card className="border-emerald-900/50 bg-gradient-to-br from-emerald-950/40 to-zinc-900">
        <CardHeader>
          <CardTitle>Savings remaining</CardTitle>
          <CardDescription>
            {remaining <= 0
              ? "Down payment stacked. Close on the duplex."
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

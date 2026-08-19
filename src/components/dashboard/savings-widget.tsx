import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { SavingsSummary } from "@/lib/types";

export function SavingsWidget({ summary }: { summary: SavingsSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Toward Down Payment</CardTitle>
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

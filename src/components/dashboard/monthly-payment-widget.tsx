import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

export function MonthlyPaymentWidget({
  paidThisMonth,
  target,
}: {
  paidThisMonth: number;
  target: number;
}) {
  const progress = target > 0 ? (paidThisMonth / target) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Month&apos;s Extra Payments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold">{formatCurrency(paidThisMonth)}</span>
          <span className="text-sm text-zinc-400">of {formatCurrency(target)} target</span>
        </div>
        <Progress value={progress} />
      </CardContent>
    </Card>
  );
}

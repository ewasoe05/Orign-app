import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { getScheduleStatus } from "@/lib/debt-schedule";
import { STARTING_DEBT_TOTAL } from "@/lib/seed";

export function DebtHero({
  totalDebt,
  planStartDate,
}: {
  totalDebt: number;
  planStartDate: string;
}) {
  const { onTrack, progress, scheduleEntry } = getScheduleStatus(totalDebt, planStartDate);
  const paidOff = STARTING_DEBT_TOTAL - totalDebt;

  return (
    <Card className="border-emerald-900/50 bg-gradient-to-br from-emerald-950/40 to-zinc-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Total Debt</CardTitle>
          <Badge variant={onTrack ? "success" : "warning"}>
            {onTrack ? "On track" : "Behind schedule"}
          </Badge>
        </div>
        <CardDescription>
          Month {scheduleEntry.month}: target {formatCurrency(scheduleEntry.targetRemaining)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-4xl font-bold tracking-tight text-emerald-400 lg:text-5xl">
          {formatCurrency(totalDebt)}
        </p>
        <Progress value={progress} />
        <div className="flex justify-between text-sm text-zinc-400">
          <span>{formatCurrency(paidOff)} paid off</span>
          <span>{formatCurrency(STARTING_DEBT_TOTAL)} starting</span>
        </div>
      </CardContent>
    </Card>
  );
}

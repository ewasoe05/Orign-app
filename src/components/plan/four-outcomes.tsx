import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { FOUR_OUTCOMES } from "@/lib/seed";

export function FourOutcomes({
  totalDebt,
  cashOnHand,
  weekCommission,
  fitnessLabel,
}: {
  totalDebt: number;
  cashOnHand: number;
  weekCommission: number;
  fitnessLabel: string;
}) {
  const values = {
    debt: totalDebt <= 0 ? "Debt-free" : formatCurrency(totalDebt) + " left",
    duplex: formatCurrency(cashOnHand) + " cash",
    business: "~" + formatCurrency(weekCommission) + " this week",
    fitness: fitnessLabel,
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-300">Four outcomes</p>
        <Link href="/plan" className="text-xs text-emerald-400 hover:text-emerald-300">
          Open full plan
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {FOUR_OUTCOMES.map((outcome) => (
        <Link key={outcome.key} href="/plan">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{outcome.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-emerald-400">
                {values[outcome.key as keyof typeof values]}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {outcome.target} · {outcome.metric}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
      </div>
    </div>
  );
}

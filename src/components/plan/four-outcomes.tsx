import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading, metricCompactClass } from "@/components/ui/section-heading";
import { formatCurrency } from "@/lib/utils";
import { FOUR_OUTCOMES } from "@/content/plan";

const OUTCOME_HREFS: Record<(typeof FOUR_OUTCOMES)[number]["key"], string> = {
  debt: "/debt",
  duplex: "/savings",
  business: "/business",
  fitness: "/fitness",
};

export function FourOutcomes({
  totalDebt,
  cashOnHand,
  weekCommission,
  fitnessLabel,
  debtFreeLabel,
  closingLabel,
}: {
  totalDebt: number;
  cashOnHand: number;
  weekCommission: number;
  fitnessLabel: string;
  debtFreeLabel?: string | null;
  closingLabel?: string | null;
}) {
  const values = {
    debt: totalDebt <= 0 ? "Debt-free" : formatCurrency(totalDebt) + " left",
    duplex: formatCurrency(cashOnHand) + " cash",
    business: "~" + formatCurrency(weekCommission) + " this week",
    fitness: fitnessLabel,
  };

  const targets = {
    debt: debtFreeLabel ? `Projected ${debtFreeLabel}` : FOUR_OUTCOMES[0].target,
    duplex: closingLabel ? `Projected ${closingLabel}` : FOUR_OUTCOMES[1].target,
    business: FOUR_OUTCOMES[2].target,
    fitness: FOUR_OUTCOMES[3].target,
  };

  return (
    <div className="space-y-2">
      <SectionHeading
        title="Four outcomes"
        action={
          <Link href="/plan" className="text-xs text-emerald-400 hover:text-emerald-300">
            Open full plan
          </Link>
        }
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FOUR_OUTCOMES.map((outcome) => (
          <Link key={outcome.key} href={OUTCOME_HREFS[outcome.key]}>
            <Card className="h-full transition-colors hover:border-zinc-700">
              <CardHeader>
                <CardTitle className="text-sm">{outcome.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={metricCompactClass}>{values[outcome.key as keyof typeof values]}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {targets[outcome.key as keyof typeof targets]} · {outcome.metric}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

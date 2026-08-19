import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InteractiveCard } from "@/components/ui/interactive-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Metric } from "@/components/ui/metric";
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
    <div className="space-y-3">
      <SectionHeading
        title="Four outcomes"
        action={
          <Link
            href="/plan"
            className="text-caption text-text-secondary underline-offset-2 hover:text-text-primary hover:underline"
          >
            Open full plan
          </Link>
        }
      />
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
        {FOUR_OUTCOMES.map((outcome) => (
          <InteractiveCard
            key={outcome.key}
            href={OUTCOME_HREFS[outcome.key]}
            className="min-w-[140px] shrink-0 sm:min-w-0"
          >
            <Card className="h-full transition-ui hover:border-border-strong">
              <CardHeader className="mb-2">
                <CardTitle className="text-caption">{outcome.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <Metric variant="compact">{values[outcome.key as keyof typeof values]}</Metric>
                <p className="text-caption text-text-tertiary">
                  {targets[outcome.key as keyof typeof targets]} · {outcome.metric}
                </p>
              </CardContent>
            </Card>
          </InteractiveCard>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHeaderRow } from "@/components/ui/card-header-row";
import { Button } from "@/components/ui/button";
import { PhaseBadge } from "@/components/paycheck/phase-badge";
import { formatCurrencyDetailed } from "@/lib/utils";
import type { PaycheckPhase, PaycheckSettings } from "@/lib/types";

export function PaycheckCta({
  settings,
  phase,
  debtLeft,
  nextLabel,
}: {
  settings: PaycheckSettings;
  phase: PaycheckPhase;
  debtLeft: number;
  nextLabel: string;
}) {
  const buffer = Number(settings.unswept_buffer);

  return (
    <Card elevated>
      <CardHeader>
        <CardHeaderRow>
          <CardTitle>Paycheck</CardTitle>
        </CardHeaderRow>
      </CardHeader>
      <CardContent className="space-y-3">
        <PhaseBadge
          phase={phase}
          debtLeft={debtLeft}
          hysaBalance={Number(settings.hysa_balance)}
          hysaGoal={Number(settings.hysa_goal)}
          nextLabel={nextLabel}
        />
        {buffer > 0 ? (
          <p className="text-caption text-text-secondary">
            Unswept in checking: {formatCurrencyDetailed(buffer)}
          </p>
        ) : null}
        {!settings.confirmed ? (
          <p className="text-caption text-warning">Confirm your numbers once, then routing is one tap.</p>
        ) : (
          <p className="text-caption text-text-secondary">Type the amount. Tap the button. No other decisions.</p>
        )}
        <Link href="/paycheck">
          <Button size="touch" className="w-full">
            {settings.confirmed ? "Route a paycheck" : "Set up paycheck routing"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

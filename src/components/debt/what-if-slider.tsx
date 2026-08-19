"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildWhatIfSummary } from "@/lib/projection-bridge";
import type { DebtAccount, PlanFacts } from "@/lib/types";
import { PLAN_START_DATE } from "@/lib/seed";
import { formatCurrencyDetailed } from "@/lib/utils";

export function WhatIfSlider({
  accounts,
  planFacts,
  planStartDate = PLAN_START_DATE,
  defaultOutlay = 2395,
}: {
  accounts: DebtAccount[];
  planFacts: PlanFacts | null;
  planStartDate?: string;
  defaultOutlay?: number;
}) {
  const [outlay, setOutlay] = useState(defaultOutlay);

  const summary = useMemo(
    () => buildWhatIfSummary(accounts, planFacts, outlay, planStartDate),
    [accounts, planFacts, outlay, planStartDate],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>What-if monthly outlay</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          type="range"
          min={1000}
          max={3500}
          step={50}
          value={outlay}
          onChange={(event) => setOutlay(Number(event.target.value))}
          className="w-full accent-emerald-500"
        />
        <p className="text-sm text-zinc-300">{formatCurrencyDetailed(outlay)} / month</p>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <p>
            <span className="text-zinc-500">Debt-free:</span>{" "}
            <span className="font-medium">{summary.debtFreeLabel ?? "—"}</span>
          </p>
          <p>
            <span className="text-zinc-500">Duplex cash ready:</span>{" "}
            <span className="font-medium">{summary.closingLabel ?? "—"}</span>
          </p>
          <p>
            <span className="text-zinc-500">Total interest:</span>{" "}
            <span className="font-medium">{formatCurrencyDetailed(summary.totalInterest)}</span>
          </p>
        </div>
        {!summary.feasible && (
          <p className="text-xs text-amber-400">This outlay cannot cover minimums plus interest.</p>
        )}
      </CardContent>
    </Card>
  );
}

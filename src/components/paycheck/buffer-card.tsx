"use client";

import { useActionState } from "react";
import { sweepBufferAction } from "@/lib/actions/paycheck";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormActions, FormSubmit } from "@/components/ui/form-actions";
import { formatCurrencyDetailed } from "@/lib/utils";

export function UnsweptBufferCard({
  amount,
  confirmed,
}: {
  amount: number;
  confirmed: boolean;
}) {
  const [state, action, pending] = useActionState(sweepBufferAction, null);
  const empty = amount <= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unswept buffer</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-title font-semibold text-text-primary">{formatCurrencyDetailed(amount)}</p>
        <p className="text-caption text-text-secondary">
          Leftover sitting in checking above the per-check target. Sweep it to the plan on a fixed day
          (the 28th works).
        </p>
        <form action={action}>
          <FormActions>
            <FormSubmit loading={pending} disabled={empty || !confirmed} variant="outline">
              Mark swept → send to plan
            </FormSubmit>
          </FormActions>
        </form>
        {empty && state?.noOp ? (
          <p className="text-caption text-text-secondary">Nothing to sweep.</p>
        ) : null}
        {state?.success && !state.noOp ? (
          <p className="text-caption text-accent-muted">Swept. Receipt is above.</p>
        ) : null}
        {state?.error ? <p className="text-caption text-danger">{state.error}</p> : null}
      </CardContent>
    </Card>
  );
}

"use client";

import { useActionState } from "react";
import { logCreditScore } from "@/lib/actions/plan";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Metric } from "@/components/ui/metric";
import { FormActions, FormSubmit } from "@/components/ui/form-actions";
import { formatLocalDate } from "@/lib/utils";
import type { CreditLog } from "@/lib/types";

export function CreditTracker({ logs }: { logs: CreditLog[] }) {
  const latest = logs[0];
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return logCreditScore(formData);
    },
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>FICO</CardTitle>
        <CardDescription>580 FHA minimum. Aim 620+ before the duplex.</CardDescription>
      </CardHeader>
      <CardContent>
        {latest ? (
          <div className="flex items-center gap-3">
            <Metric variant="display">{latest.score}</Metric>
            <Badge variant={latest.score >= 620 ? "success" : latest.score >= 580 ? "warning" : "danger"}>
              {latest.score >= 620 ? "Mortgage-ready" : latest.score >= 580 ? "FHA floor" : "Repair"}
            </Badge>
          </div>
        ) : (
          <p className="text-body text-text-secondary">Pull your score this week and log it here.</p>
        )}
        {latest && latest.score < 620 && (
          <p className="text-caption text-warning">
            Below 620: keep credit repair as a Q1 track — utilization, disconnected accounts, report errors.
          </p>
        )}
        <form action={action} className="space-y-3">
          <Label htmlFor="score">Log score</Label>
          <Input id="score" name="score" type="number" min="300" max="850" required />
          <Input name="log_date" type="date" defaultValue={formatLocalDate()} />
          <Input name="notes" placeholder="Source / notes" />
          {state?.error && <p className="text-caption text-danger">{state.error}</p>}
          {state?.success && <p className="text-caption text-accent-muted">Score saved.</p>}
          <FormActions>
            <FormSubmit variant="outline" loading={pending}>
              Save FICO
            </FormSubmit>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}

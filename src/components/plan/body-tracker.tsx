"use client";

import { useActionState } from "react";
import { logBody } from "@/lib/actions/plan";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Panel } from "@/components/ui/panel";
import { FormActions, FormSubmit } from "@/components/ui/form-actions";
import { PROTEIN_TARGET_G, STARTING_WEIGHT_LBS, TARGET_WEIGHT_LBS } from "@/lib/seed";
import { formatLocalDate } from "@/lib/utils";
import type { BodyLog } from "@/lib/types";
import type { ProteinHitRate } from "@/lib/fitness-metrics";

export function BodyTracker({
  logs,
  proteinStats,
}: {
  logs: BodyLog[];
  proteinStats: ProteinHitRate;
}) {
  const latest = logs[0];
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return logBody(formData);
    },
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Body + protein</CardTitle>
        <CardDescription>
          Start {STARTING_WEIGHT_LBS} lbs skinny-fat → ~{TARGET_WEIGHT_LBS} lbs leaner. Protein{" "}
          {PROTEIN_TARGET_G}g/day — hitting it marks Eating full.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Panel>
          <div className="flex items-center justify-between text-body">
            <span className="text-text-secondary">Protein · last 7 days</span>
            <span className="font-medium text-text-primary">
              {proteinStats.hits}/{proteinStats.days} at {PROTEIN_TARGET_G}g+
            </span>
          </div>
          <div className="mt-2 flex gap-1">
            {proteinStats.dayStatuses.map((day) => (
              <div
                key={day.date}
                title={`${day.date.slice(5)}: ${day.hit ? "hit" : day.logged ? "below target" : "not logged"}`}
                className={`h-2 flex-1 rounded-full ${
                  day.hit
                    ? "bg-accent-muted"
                    : day.logged
                      ? "bg-warning/60"
                      : "bg-border-subtle"
                }`}
              />
            ))}
          </div>
        </Panel>

        {latest && (
          <p className="text-body text-text-secondary">
            Last: {latest.log_date}
            {latest.weight_lbs ? ` · ${latest.weight_lbs} lbs` : ""}
            {latest.protein_grams ? ` · ${latest.protein_grams}g protein` : ""}
          </p>
        )}
        <form action={action} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="log_date">Date</Label>
            <Input id="log_date" name="log_date" type="date" defaultValue={formatLocalDate()} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="weight_lbs">Weight (lbs)</Label>
            <Input id="weight_lbs" name="weight_lbs" type="number" step="0.1" placeholder="183" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="protein_grams">Protein (g)</Label>
            <Input id="protein_grams" name="protein_grams" type="number" placeholder="170" />
          </div>
          {state?.error && <p className="text-caption text-danger">{state.error}</p>}
          {state?.success && <p className="text-caption text-accent-muted">Logged.</p>}
          <FormActions>
            <FormSubmit loading={pending}>Log body / protein</FormSubmit>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}

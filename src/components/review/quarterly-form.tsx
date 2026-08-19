"use client";

import { useActionState } from "react";
import { submitQuarterlyReview } from "@/lib/actions/quarterly";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Panel } from "@/components/ui/panel";
import { FormActions, FormSubmit } from "@/components/ui/form-actions";
import { QUARTERLY_PLAN } from "@/content/plan";
import { formatLocalDate } from "@/lib/utils";

export function QuarterlyForm({ currentQuarter }: { currentQuarter: number }) {
  const plan = QUARTERLY_PLAN.find((q) => q.quarter === currentQuarter) ?? QUARTERLY_PLAN[0];
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return submitQuarterlyReview(formData);
    },
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quarterly checkpoint</CardTitle>
        <CardDescription>
          A plan you revise is still working. Sit with the numbers every three months.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quarter">Quarter</Label>
            <Select id="quarter" name="quarter" defaultValue={String(currentQuarter)}>
              {QUARTERLY_PLAN.map((q) => (
                <option key={q.quarter} value={q.quarter}>
                  {q.label}
                </option>
              ))}
            </Select>
          </div>
          <input type="hidden" name="review_date" value={formatLocalDate()} />

          <Panel className="text-body text-text-secondary">
            <p>
              <span className="text-text-primary">Money:</span> {plan.money}
            </p>
            <p className="mt-1">
              <span className="text-text-primary">Business:</span> {plan.business}
            </p>
            <p className="mt-1">
              <span className="text-text-primary">Body:</span> {plan.body}
            </p>
          </Panel>

          <StatusSelect name="money_status" label="Money" />
          <StatusSelect name="business_status" label="Business" />
          <StatusSelect name="body_status" label="Body" />

          <div className="space-y-2">
            <Label htmlFor="what_changed">What changed?</Label>
            <Textarea id="what_changed" name="what_changed" rows={3} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="what_to_adjust">What to adjust?</Label>
            <Textarea id="what_to_adjust" name="what_to_adjust" rows={3} required />
          </div>

          {state?.error && <p className="text-caption text-danger">{state.error}</p>}
          {state?.success && (
            <p className="text-caption text-accent-muted">Checkpoint saved. Keep running the plan.</p>
          )}
          <FormActions>
            <FormSubmit loading={pending}>Save checkpoint</FormSubmit>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}

function StatusSelect({ name, label }: { name: string; label: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Select id={name} name={name} defaultValue="on_track">
        <option value="on_track">On track</option>
        <option value="behind">Behind</option>
      </Select>
    </div>
  );
}

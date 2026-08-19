"use client";

import { useActionState } from "react";
import { submitQuarterlyReview } from "@/lib/actions/quarterly";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QUARTERLY_PLAN } from "@/lib/seed";
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

          <div className="rounded-lg border border-zinc-800 p-3 text-sm text-zinc-400">
            <p>
              <span className="text-zinc-300">Money:</span> {plan.money}
            </p>
            <p className="mt-1">
              <span className="text-zinc-300">Business:</span> {plan.business}
            </p>
            <p className="mt-1">
              <span className="text-zinc-300">Body:</span> {plan.body}
            </p>
          </div>

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

          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
          {state?.success && (
            <p className="text-sm text-emerald-400">Checkpoint saved. Keep running the plan.</p>
          )}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving..." : "Save checkpoint"}
          </Button>
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

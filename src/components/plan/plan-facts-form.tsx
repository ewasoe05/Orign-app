"use client";

import { useActionState } from "react";
import { savePlanFacts } from "@/lib/actions/plan";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormActions, FormSubmit } from "@/components/ui/form-actions";
import type { PlanFacts } from "@/lib/types";

export function PlanFactsForm({
  facts,
  debtFreeLabel,
  closingLabel,
}: {
  facts: PlanFacts | null;
  debtFreeLabel?: string | null;
  closingLabel?: string | null;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return savePlanFacts(formData);
    },
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Still need from you</CardTitle>
        <CardDescription>
          These answers tighten the math. Log FICO in the credit tracker — that is the fifth question.
          {debtFreeLabel ? (
            <>
              {" "}
              Current projection: debt-free {debtFreeLabel}
              {closingLabel ? `, duplex cash ${closingLabel}` : ""}.
            </>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expenses_include_car">Does $1,887 include the car payment?</Label>
            <Select
              id="expenses_include_car"
              name="expenses_include_car"
              defaultValue={
                facts?.expenses_include_car === true
                  ? "yes"
                  : facts?.expenses_include_car === false
                    ? "no"
                    : ""
              }
            >
              <option value="">Not sure yet</option>
              <option value="yes">Yes</option>
              <option value="no">No — schedule needs a rerun</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="clear_solutions_trade">What does Clear Solutions actually do?</Label>
            <Textarea
              id="clear_solutions_trade"
              name="clear_solutions_trade"
              defaultValue={facts?.clear_solutions_trade ?? ""}
              placeholder="Trade / services — this changes ads, pricing, and whether LSA is available"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employment_type">W-2 or 1099 at Clear Solutions?</Label>
            <Select id="employment_type" name="employment_type" defaultValue={facts?.employment_type ?? ""}>
              <option value="">Not sure yet</option>
              <option value="w2">W-2</option>
              <option value="1099">1099</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="commission_years">Years earning commission</Label>
            <Input
              id="commission_years"
              name="commission_years"
              type="number"
              step="0.5"
              min="0"
              defaultValue={facts?.commission_years ?? ""}
              placeholder="e.g. 1.5"
            />
          </div>
          {state?.error && <p className="text-caption text-danger">{state.error}</p>}
          {state?.success && <p className="text-caption text-accent-muted">Saved.</p>}
          <FormActions>
            <FormSubmit loading={pending}>Save answers</FormSubmit>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}

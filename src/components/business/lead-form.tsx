"use client";

import { useActionState } from "react";
import { logLead } from "@/lib/actions/business";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormActions, FormSubmit } from "@/components/ui/form-actions";
import { formatLocalDate } from "@/lib/utils";

export function LeadForm() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return logLead(formData);
    },
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log lead</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lead_date">Date</Label>
            <Input id="lead_date" name="lead_date" type="date" defaultValue={formatLocalDate()} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input id="source" name="source" placeholder="Google, referral, GBP..." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="service">Service</Label>
            <Input id="service" name="service" placeholder="What they asked for" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quoted_amount">Quoted $</Label>
            <Input id="quoted_amount" name="quoted_amount" type="number" step="0.01" min="0" defaultValue="0" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" defaultValue="open">
              <option value="open">Open</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="why_lost">Why lost (if lost)</Label>
            <Textarea id="why_lost" name="why_lost" rows={2} placeholder="Price, silence, timing..." />
          </div>
          {state?.error && <p className="text-caption text-danger">{state.error}</p>}
          {state?.success && <p className="text-caption text-accent-muted">Lead logged.</p>}
          <FormActions>
            <FormSubmit loading={pending}>Save lead</FormSubmit>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}

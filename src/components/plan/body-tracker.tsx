"use client";

import { useActionState } from "react";
import { logBody } from "@/lib/actions/plan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PROTEIN_TARGET_G, STARTING_WEIGHT_LBS, TARGET_WEIGHT_LBS } from "@/lib/seed";
import { formatLocalDate } from "@/lib/utils";
import type { BodyLog } from "@/lib/types";

export function BodyTracker({ logs }: { logs: BodyLog[] }) {
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
          Start {STARTING_WEIGHT_LBS} lbs skinny-fat → ~{TARGET_WEIGHT_LBS} lbs leaner. Protein {PROTEIN_TARGET_G}g/day.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {latest && (
          <p className="text-sm text-zinc-300">
            Last: {latest.log_date}
            {latest.weight_lbs ? ` · ${latest.weight_lbs} lbs` : ""}
            {latest.protein_grams ? ` · ${latest.protein_grams}g protein` : ""}
          </p>
        )}
        <form action={action} className="grid grid-cols-2 gap-2">
          <div className="col-span-2 space-y-1">
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
          {state?.error && <p className="col-span-2 text-sm text-red-400">{state.error}</p>}
          {state?.success && <p className="col-span-2 text-sm text-emerald-400">Logged.</p>}
          <Button type="submit" className="col-span-2" disabled={pending}>
            {pending ? "Saving..." : "Log body / protein"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

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
      <CardContent className="space-y-3">
        <div className="rounded-md border border-zinc-800 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Protein · last 7 days</span>
            <span className="font-medium text-zinc-200">
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
                    ? "bg-emerald-500"
                    : day.logged
                      ? "bg-amber-600/60"
                      : "bg-zinc-800"
                }`}
              />
            ))}
          </div>
        </div>

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

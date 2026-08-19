"use client";

import { useActionState, useState } from "react";
import { setManualPR } from "@/lib/actions/fitness";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatLocalDate } from "@/lib/utils";
import type { PersonalRecord } from "@/lib/types";

function ManualPRForm({ exercise }: { exercise: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await setManualPR(formData);
      if (result.success) setOpen(false);
      return result;
    },
    null,
  );

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Set max
      </Button>
    );
  }

  return (
    <form action={action} className="mt-2 grid grid-cols-2 gap-2 rounded-md border border-zinc-800 p-2">
      <input type="hidden" name="exercise" value={exercise} />
      <div className="col-span-2 space-y-1">
        <Label htmlFor={`${exercise}-date`}>Date</Label>
        <Input
          id={`${exercise}-date`}
          name="record_date"
          type="date"
          defaultValue={formatLocalDate()}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${exercise}-weight`}>Weight (lbs)</Label>
        <Input id={`${exercise}-weight`} name="weight" type="number" step="0.5" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${exercise}-reps`}>Reps</Label>
        <Input id={`${exercise}-reps`} name="reps" type="number" defaultValue={1} min={1} />
      </div>
      <div className="col-span-2 space-y-1">
        <Label htmlFor={`${exercise}-note`}>Note (optional)</Label>
        <Input id={`${exercise}-note`} name="note" placeholder="Gym PR, estimated, etc." />
      </div>
      {state?.error && <p className="col-span-2 text-xs text-red-400">{state.error}</p>}
      {state?.success && <p className="col-span-2 text-xs text-emerald-400">Saved.</p>}
      <div className="col-span-2 flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving..." : "Save PR"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function PRBoard({
  prs,
  targetProgress,
}: {
  prs: PersonalRecord[];
  targetProgress: { exercise: string; min: number; max: number; current: number; progress: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Records</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {targetProgress.map((target) => {
          const pr = prs.find(
            (p) =>
              p.exercise.toLowerCase().includes(target.exercise.toLowerCase()) ||
              target.exercise.toLowerCase().includes(p.exercise.toLowerCase()),
          );

          return (
            <div key={target.exercise} className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{target.exercise}</span>
                  {pr?.isNewThisWeek && <Badge variant="success">New PR</Badge>}
                </div>
                <span className="text-zinc-400">
                  {pr ? `${pr.weight} lbs × ${pr.reps}` : "No data"} / {target.min}–{target.max}{" "}
                  goal
                </span>
              </div>
              <Progress value={target.progress} />
              <ManualPRForm exercise={target.exercise} />
            </div>
          );
        })}

        {prs.filter(
          (pr) =>
            !targetProgress.some(
              (t) =>
                pr.exercise.toLowerCase().includes(t.exercise.toLowerCase()) ||
                t.exercise.toLowerCase().includes(pr.exercise.toLowerCase()),
            ),
        ).length > 0 && (
          <div className="border-t border-zinc-800 pt-3">
            <p className="mb-2 text-xs font-medium text-zinc-500">Other PRs</p>
            {prs
              .filter(
                (pr) =>
                  !targetProgress.some(
                    (t) =>
                      pr.exercise.toLowerCase().includes(t.exercise.toLowerCase()) ||
                      t.exercise.toLowerCase().includes(pr.exercise.toLowerCase()),
                  ),
              )
              .slice(0, 5)
              .map((pr) => (
                <p key={pr.exercise} className="text-sm text-zinc-400">
                  {pr.exercise}: {pr.weight} lbs × {pr.reps}
                  {pr.isNewThisWeek ? " · New this week" : ""}
                </p>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

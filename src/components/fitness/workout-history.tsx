"use client";

import { useActionState, useState } from "react";
import { deleteWorkout } from "@/lib/actions/fitness";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHeaderRow } from "@/components/ui/card-header-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { WorkoutForm } from "./workout-form";
import type { LastLift, WorkoutTemplateWithExercises, WorkoutWithDetails } from "@/lib/types";

export function WorkoutHistory({
  workouts,
  templates,
  lastLifts,
}: {
  workouts: WorkoutWithDetails[];
  templates: WorkoutTemplateWithExercises[];
  lastLifts: Record<string, LastLift>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingWorkout = editingId ? workouts.find((w) => w.id === editingId) : null;

  const [deleteState, deleteAction] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await deleteWorkout(String(formData.get("workout_id")));
      return result;
    },
    null,
  );

  if (editingWorkout) {
    return (
      <WorkoutForm
        templates={templates}
        lastLifts={lastLifts}
        editWorkout={editingWorkout}
        onEditComplete={() => setEditingId(null)}
      />
    );
  }

  if (workouts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-body text-text-secondary">
          No workouts logged yet. Start with today&apos;s session.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-label text-text-secondary">Workout History</h2>
      {workouts.map((workout) => (
        <Card key={workout.id}>
          <CardHeader>
            <CardHeaderRow
              action={
                <div className="flex items-center gap-1">
                  <Badge>{workout.workout_type}</Badge>
                  {workout.workout_type !== "floor" && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => setEditingId(workout.id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <form action={deleteAction}>
                        <input type="hidden" name="workout_id" value={workout.id} />
                        <Button variant="ghost" size="icon" type="submit">
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              }
            >
              <CardTitle>
                {workout.workout_date} — {workout.subtype ?? workout.workout_type}
              </CardTitle>
            </CardHeaderRow>
          </CardHeader>
          {(workout.lift_entries.length > 0 || workout.run_entries.length > 0) && (
            <CardContent className="space-y-1 text-body text-text-secondary">
              {workout.lift_entries.map((lift) => (
                <p key={lift.id}>
                  {lift.exercise}: {lift.weight} lbs × {lift.reps} × {lift.sets}
                </p>
              ))}
              {workout.run_entries.map((run) => (
                <p key={run.id}>
                  Run: {run.distance_miles ?? "?"} mi
                  {run.duration_minutes ? ` in ${run.duration_minutes} min` : ""}
                </p>
              ))}
            </CardContent>
          )}
        </Card>
      ))}
      {deleteState?.error && <p className="text-caption text-danger">{deleteState.error}</p>}
    </div>
  );
}

"use client";

import { useActionState, useEffect, useState } from "react";
import { logWorkout, updateWorkout, logFloorHabit } from "@/lib/actions/fitness";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DynamicExerciseForm,
  exercisesFromTemplate,
  exercisesToJson,
  exercisesFromWorkout,
  type ExerciseRow,
} from "./dynamic-exercise-form";
import type { LastLift, WorkoutTemplateWithExercises, WorkoutWithDetails } from "@/lib/types";

interface WorkoutFormProps {
  templates: WorkoutTemplateWithExercises[];
  lastLifts?: Record<string, LastLift>;
  prefillTemplateId?: string | null;
  prefillDate?: string;
  editWorkout?: WorkoutWithDetails | null;
  onEditComplete?: () => void;
}

export function WorkoutForm({
  templates,
  lastLifts = {},
  prefillTemplateId,
  prefillDate,
  editWorkout,
  onEditComplete,
}: WorkoutFormProps) {
  const today = prefillDate ?? new Date().toISOString().slice(0, 10);
  const isEditing = !!editWorkout;

  const [workoutType, setWorkoutType] = useState<string>(editWorkout?.workout_type ?? "lift");
  const [selectedTemplate, setSelectedTemplate] = useState(
    editWorkout?.template_id ?? prefillTemplateId ?? "",
  );
  const [exercises, setExercises] = useState<ExerciseRow[]>(
    editWorkout?.lift_entries?.length
      ? exercisesFromWorkout(editWorkout.lift_entries)
      : [],
  );
  const [subtype, setSubtype] = useState(editWorkout?.subtype ?? "");

  useEffect(() => {
    if (prefillTemplateId && !editWorkout) {
      const template = templates.find((t) => t.id === prefillTemplateId);
      if (template) {
        setSelectedTemplate(template.id);
        setWorkoutType(template.workout_type);
        setSubtype(template.name);
        setExercises(exercisesFromTemplate(template.exercises));
      }
    }
  }, [prefillTemplateId, templates, editWorkout]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setWorkoutType(template.workout_type);
      setSubtype(template.name);
      setExercises(exercisesFromTemplate(template.exercises));
    }
  };

  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      formData.set("exercises_json", exercisesToJson(exercises));
      if (selectedTemplate) formData.set("template_id", selectedTemplate);
      formData.set("subtype", subtype);

      const result = isEditing ? await updateWorkout(formData) : await logWorkout(formData);
      if (result.success && onEditComplete) onEditComplete();
      return result;
    },
    null,
  );

  return (
    <Card id="workout-form">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Workout" : "Log Workout"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {isEditing && <input type="hidden" name="workout_id" value={editWorkout!.id} />}

          <div className="space-y-2">
            <Label htmlFor="workout_date">Date</Label>
            <Input
              id="workout_date"
              name="workout_date"
              type="date"
              defaultValue={editWorkout?.workout_date ?? today}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="workout_type">Type</Label>
              <Select
                id="workout_type"
                name="workout_type"
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
                required
              >
                <option value="lift">Lift</option>
                <option value="run">Run</option>
                <option value="walk">Walk</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template_select">Template</Label>
              <Select
                id="template_select"
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
              >
                <option value="">None</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtype">Focus / Label</Label>
            <Input
              id="subtype"
              value={subtype}
              onChange={(e) => setSubtype(e.target.value)}
              placeholder="Lower A — squat focus"
            />
          </div>

          {(workoutType === "lift" || exercises.length > 0) && (
            <DynamicExerciseForm
              exercises={exercises}
              onChange={setExercises}
              lastLifts={lastLifts}
            />
          )}

          {(workoutType === "run" || workoutType === "walk") && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="distance_miles">Distance (mi)</Label>
                <Input
                  id="distance_miles"
                  name="distance_miles"
                  type="number"
                  step="0.1"
                  placeholder="3.1"
                  defaultValue={editWorkout?.run_entries?.[0]?.distance_miles ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration (min)</Label>
                <Input
                  id="duration_minutes"
                  name="duration_minutes"
                  type="number"
                  placeholder="30"
                  defaultValue={editWorkout?.run_entries?.[0]?.duration_minutes ?? ""}
                />
              </div>
            </div>
          )}

          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
          {state?.success && (
            <p className="text-sm text-emerald-400">
              {isEditing ? "Workout updated!" : "Workout logged!"}
            </p>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending ? "Saving..." : isEditing ? "Update workout" : "Log workout"}
            </Button>
            {isEditing && onEditComplete && (
              <Button type="button" variant="outline" onClick={onEditComplete}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function FloorHabitButton() {
  const [state, action, pending] = useActionState(async () => logFloorHabit(), null);

  return (
    <Card className="border-amber-900/50">
      <CardHeader>
        <CardTitle>Bad Day? Hit the Floor</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm text-zinc-400">
          10-minute walk counts. Never go to zero — that&apos;s where the spiral starts.
        </p>
        <form action={action}>
          {state?.success && <p className="mb-2 text-sm text-emerald-400">Floor habit logged!</p>}
          {state?.error && <p className="mb-2 text-sm text-red-400">{state.error}</p>}
          <Button type="submit" variant="secondary" className="w-full" disabled={pending}>
            {pending ? "Saving..." : "Hit floor today"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

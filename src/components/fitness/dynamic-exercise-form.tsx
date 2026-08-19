"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import type { LastLift, TemplateExercise } from "@/lib/types";

export interface ExerciseRow {
  name: string;
  weight: string;
  reps: string;
  sets: string;
}

interface DynamicExerciseFormProps {
  exercises: ExerciseRow[];
  onChange: (exercises: ExerciseRow[]) => void;
  lastLifts?: Record<string, LastLift>;
}

export function DynamicExerciseForm({ exercises, onChange, lastLifts }: DynamicExerciseFormProps) {
  const addRow = () => {
    onChange([...exercises, { name: "", weight: "", reps: "", sets: "3" }]);
  };

  const removeRow = (index: number) => {
    onChange(exercises.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof ExerciseRow, value: string) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3 rounded-lg border border-zinc-800 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-300">Exercises</p>
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="mr-1 h-3 w-3" /> Add
        </Button>
      </div>

      {exercises.length === 0 && (
        <p className="text-xs text-zinc-500">No exercises added. Click Add or select a template.</p>
      )}

      {exercises.map((row, index) => {
        const last = lastLifts?.[row.name];
        return (
          <div key={index} className="space-y-1 rounded-lg border border-zinc-800/50 p-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Exercise name"
                value={row.name}
                onChange={(e) => updateRow(index, "name", e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(index)}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Input
                placeholder="Weight"
                type="number"
                step="2.5"
                value={row.weight}
                onChange={(e) => updateRow(index, "weight", e.target.value)}
                className="min-w-0"
              />
              <Input
                placeholder="Reps"
                type="number"
                value={row.reps}
                onChange={(e) => updateRow(index, "reps", e.target.value)}
                className="min-w-0"
              />
              <Input
                placeholder="Sets"
                type="number"
                value={row.sets}
                onChange={(e) => updateRow(index, "sets", e.target.value)}
                className="min-w-0"
              />
            </div>
            {last && (
              <p className="text-xs text-zinc-500">
                Last: {last.weight} lbs × {last.reps} × {last.sets}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function exercisesFromTemplate(templateExercises: TemplateExercise[]): ExerciseRow[] {
  return templateExercises.map((exercise) => ({
    name: exercise.exercise_name,
    weight: "",
    reps: String(exercise.default_reps ?? ""),
    sets: String(exercise.default_sets ?? "3"),
  }));
}

export function exercisesToJson(exercises: ExerciseRow[]): string {
  return JSON.stringify(
    exercises
      .filter((e) => e.name && e.weight && e.reps)
      .map((e) => ({
        name: e.name,
        weight: parseFloat(e.weight),
        reps: parseInt(e.reps, 10),
        sets: parseInt(e.sets, 10) || 3,
      })),
  );
}

export function exercisesFromWorkout(
  lifts: { exercise: string; weight: number; reps: number; sets: number }[],
): ExerciseRow[] {
  return lifts.map((lift) => ({
    name: lift.exercise,
    weight: String(lift.weight),
    reps: String(lift.reps),
    sets: String(lift.sets),
  }));
}

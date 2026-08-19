"use client";

import { useActionState, useState } from "react";
import { saveTemplate, deleteTemplate } from "@/lib/actions/fitness";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHeaderRow } from "@/components/ui/card-header-row";
import { FormActions, FormSubmit } from "@/components/ui/form-actions";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil } from "lucide-react";
import type { WorkoutTemplateWithExercises } from "@/lib/types";

interface ExerciseDraft {
  name: string;
  sets: string;
  reps: string;
}

export function TemplateManager({ templates }: { templates: WorkoutTemplateWithExercises[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [workoutType, setWorkoutType] = useState("lift");
  const [exercises, setExercises] = useState<ExerciseDraft[]>([]);

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setName("");
    setWorkoutType("lift");
    setExercises([{ name: "", sets: "3", reps: "8" }]);
  };

  const startEdit = (template: WorkoutTemplateWithExercises) => {
    setEditing(template.id);
    setCreating(false);
    setName(template.name);
    setWorkoutType(template.workout_type);
    setExercises(
      template.exercises.map((e) => ({
        name: e.exercise_name,
        sets: String(e.default_sets ?? 3),
        reps: String(e.default_reps ?? 8),
      })),
    );
  };

  const cancel = () => {
    setEditing(null);
    setCreating(false);
  };

  const [saveState, saveAction, savePending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      formData.set(
        "exercises_json",
        JSON.stringify(
          exercises
            .filter((e) => e.name)
            .map((e) => ({
              name: e.name,
              sets: parseInt(e.sets, 10) || 3,
              reps: parseInt(e.reps, 10) || 8,
            })),
        ),
      );
      const result = await saveTemplate(formData);
      if (result.success) cancel();
      return result;
    },
    null,
  );

  const [deleteState, deleteAction] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return deleteTemplate(String(formData.get("template_id")));
    },
    null,
  );

  const isFormOpen = creating || editing;

  return (
    <Card>
      <CardHeader>
        <CardHeaderRow
          action={
            !isFormOpen ? (
              <Button variant="outline" size="sm" onClick={startCreate}>
                <Plus className="mr-1 h-3 w-3" /> New
              </Button>
            ) : undefined
          }
        >
          <CardTitle>Workout Templates</CardTitle>
        </CardHeaderRow>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isFormOpen &&
          templates.map((template) => (
            <Panel key={template.id} className="flex items-center justify-between">
              <div>
                <p className="text-body font-medium">{template.name}</p>
                <p className="text-caption text-text-tertiary">
                  {template.exercises.length} exercises · {template.workout_type}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {template.is_default && <Badge variant="success">Default</Badge>}
                <Button variant="ghost" size="icon" onClick={() => startEdit(template)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                {!template.is_default && (
                  <form action={deleteAction}>
                    <input type="hidden" name="template_id" value={template.id} />
                    <Button variant="ghost" size="icon" type="submit">
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </form>
                )}
              </div>
            </Panel>
          ))}

        {isFormOpen && (
          <Panel className="space-y-3 border-border-strong">
            <form action={saveAction} className="space-y-3">
              {editing && <input type="hidden" name="template_id" value={editing} />}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input name="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select
                    name="workout_type"
                    value={workoutType}
                    onChange={(e) => setWorkoutType(e.target.value)}
                  >
                    <option value="lift">Lift</option>
                    <option value="run">Run</option>
                    <option value="walk">Walk</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Exercises</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setExercises([...exercises, { name: "", sets: "3", reps: "8" }])}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add
                  </Button>
                </div>
                {exercises.map((exercise, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Input
                      placeholder="Exercise"
                      value={exercise.name}
                      onChange={(e) => {
                        const updated = [...exercises];
                        updated[i].name = e.target.value;
                        setExercises(updated);
                      }}
                      className="col-span-2 min-w-0"
                    />
                    <Input
                      placeholder="Sets"
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => {
                        const updated = [...exercises];
                        updated[i].sets = e.target.value;
                        setExercises(updated);
                      }}
                    />
                    <Input
                      placeholder="Reps"
                      type="number"
                      value={exercise.reps}
                      onChange={(e) => {
                        const updated = [...exercises];
                        updated[i].reps = e.target.value;
                        setExercises(updated);
                      }}
                    />
                  </div>
                ))}
              </div>

              {saveState?.error && <p className="text-caption text-danger">{saveState.error}</p>}
              {saveState?.success && <p className="text-caption text-accent-muted">Template saved!</p>}

              <FormActions
                secondary={
                  <Button type="button" variant="outline" className="w-full" onClick={cancel}>
                    Cancel
                  </Button>
                }
              >
                <FormSubmit loading={savePending}>Save template</FormSubmit>
              </FormActions>
            </form>
          </Panel>
        )}

        {deleteState?.error && <p className="text-caption text-danger">{deleteState.error}</p>}
      </CardContent>
    </Card>
  );
}

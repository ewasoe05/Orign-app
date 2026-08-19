"use client";

import { useActionState, useState } from "react";
import { saveWeeklySchedule } from "@/lib/actions/fitness";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DAY_LABELS } from "@/lib/seed";
import type { WeeklyScheduleDay, WorkoutTemplateWithExercises } from "@/lib/types";

interface ScheduleDraft {
  day_of_week: number;
  schedule_type: string;
  template_id: string | null;
  label: string;
}

export function ScheduleEditor({
  schedule,
  templates,
}: {
  schedule: WeeklyScheduleDay[];
  templates: WorkoutTemplateWithExercises[];
}) {
  const [days, setDays] = useState<ScheduleDraft[]>(() =>
    DAY_LABELS.map((label, i) => {
      const existing = schedule.find((d) => d.day_of_week === i + 1);
      return {
        day_of_week: i + 1,
        schedule_type: existing?.schedule_type ?? "rest",
        template_id: existing?.template_id ?? null,
        label: existing?.label ?? `${label} — Rest`,
      };
    }),
  );

  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      formData.set("schedule_json", JSON.stringify(days));
      return saveWeeklySchedule(formData);
    },
    null,
  );

  const updateDay = (index: number, field: keyof ScheduleDraft, value: string) => {
    const updated = [...days];
    if (field === "schedule_type") {
      updated[index].schedule_type = value;
      if (value === "rest") {
        updated[index].template_id = null;
      }
    } else if (field === "template_id") {
      updated[index].template_id = value || null;
      const template = templates.find((t) => t.id === value);
      if (template) {
        updated[index].label = template.name;
        updated[index].schedule_type = template.workout_type === "lift" ? "lift" : template.workout_type;
      }
    } else if (field === "label") {
      updated[index].label = value;
    }
    setDays(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-3">
          {days.map((day, index) => (
            <div
              key={day.day_of_week}
              className="grid grid-cols-[3rem_1fr_1fr] items-center gap-2 rounded-lg border border-zinc-800 p-2"
            >
              <span className="text-sm font-medium text-zinc-400">{DAY_LABELS[index]}</span>
              <Select
                value={day.schedule_type}
                onChange={(e) => updateDay(index, "schedule_type", e.target.value)}
              >
                <option value="rest">Rest</option>
                <option value="lift">Lift</option>
                <option value="run">Run</option>
                <option value="walk">Walk</option>
              </Select>
              {day.schedule_type === "lift" ? (
                <Select
                  value={day.template_id ?? ""}
                  onChange={(e) => updateDay(index, "template_id", e.target.value)}
                >
                  <option value="">Custom</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  value={day.label}
                  onChange={(e) => updateDay(index, "label", e.target.value)}
                  placeholder="Label"
                />
              )}
            </div>
          ))}

          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
          {state?.success && <p className="text-sm text-emerald-400">Schedule saved!</p>}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving..." : "Save schedule"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

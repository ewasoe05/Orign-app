import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WorkoutTemplateWithExercises, WeeklyScheduleDay } from "@/lib/types";

export function TodayWorkout({
  schedule,
  templates,
  templateId,
}: {
  schedule: WeeklyScheduleDay | undefined;
  templates: WorkoutTemplateWithExercises[];
  templateId: string | null;
}) {
  const template = templateId ? templates.find((t) => t.id === templateId) : null;
  const isRest = !schedule || schedule.schedule_type === "rest";

  return (
    <Card className="border-emerald-900/50 bg-gradient-to-br from-emerald-950/30 to-zinc-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Today&apos;s Workout</CardTitle>
          <Badge variant={isRest ? "default" : "success"}>
            {schedule?.schedule_type ?? "rest"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-lg font-medium">{schedule?.label ?? "Rest day"}</p>

        {template && template.exercises.length > 0 && (
          <div className="space-y-1 text-sm text-zinc-400">
            {template.exercises.map((exercise) => (
              <p key={exercise.id}>
                {exercise.exercise_name} — {exercise.default_sets}×{exercise.default_reps}
              </p>
            ))}
          </div>
        )}

        {!isRest && (
          <Link href={`/fitness?template=${templateId ?? ""}#workout-form`}>
            <Button className="w-full">Quick log today&apos;s workout</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

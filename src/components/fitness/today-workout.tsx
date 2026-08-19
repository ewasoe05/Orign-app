import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHeaderRow } from "@/components/ui/card-header-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
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
    <Card elevated>
      <CardHeader>
        <CardHeaderRow
          action={
            <Badge variant={isRest ? "default" : "success"}>
              {schedule?.schedule_type ?? "rest"}
            </Badge>
          }
        >
          <CardTitle>Today&apos;s Workout</CardTitle>
        </CardHeaderRow>
      </CardHeader>
      <CardContent>
        <p className="text-title">{schedule?.label ?? "Rest day"}</p>

        {template && template.exercises.length > 0 && (
          <Panel className="space-y-1">
            {template.exercises.map((exercise) => (
              <p key={exercise.id} className="text-caption text-text-secondary">
                {exercise.exercise_name} — {exercise.default_sets}×{exercise.default_reps}
              </p>
            ))}
          </Panel>
        )}

        {!isRest && (
          <Link href={`/fitness?template=${templateId ?? ""}#workout-form`}>
            <Button size="touch" className="w-full">
              Quick log today&apos;s workout
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

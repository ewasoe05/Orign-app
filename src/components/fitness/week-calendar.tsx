import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";
import { DAY_LABELS } from "@/lib/seed";
import type { WeeklyScheduleDay } from "@/lib/types";
import { addDaysIso, formatLocalDate, getWeekStartDate } from "@/lib/utils";

export function WeekCalendar({
  schedule,
  workoutsThisWeek,
  floorDates = [],
}: {
  schedule: WeeklyScheduleDay[];
  workoutsThisWeek: { workout_date: string; subtype: string | null; workout_type: string }[];
  floorDates?: string[];
}) {
  const today = formatLocalDate();
  const weekStart = getWeekStartDate();
  const weekDates = DAY_LABELS.map((_, i) => addDaysIso(weekStart, i));

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Week</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {weekDates.map((date, i) => {
          const dow = i + 1;
          const daySchedule = schedule.find((s) => s.day_of_week === dow);
          const workout = workoutsThisWeek.find((w) => w.workout_date === date);
          const isToday = date === today;
          const isRest = daySchedule?.schedule_type === "rest" || !daySchedule;
          const isFloor = workout?.workout_type === "floor" || floorDates.includes(date);

          let panelClass: string | undefined;
          if (isToday) panelClass = "border-accent/40 bg-success-bg/50";
          else if (workout && !isFloor) panelClass = "border-accent/30 bg-success-bg/30";
          else if (isFloor) panelClass = "border-warning/50 bg-warning/10";

          return (
            <Panel key={date} className={cn("flex items-center justify-between", panelClass)}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-body font-medium">{DAY_LABELS[i]}</span>
                  {isToday && <Badge variant="success">Today</Badge>}
                </div>
                <p className="text-caption text-text-secondary">
                  {daySchedule?.label ?? "Rest"}
                </p>
              </div>
              {workout && !isFloor ? (
                <Badge variant="success">{workout.subtype ?? workout.workout_type}</Badge>
              ) : isFloor ? (
                <Badge variant="warning">Floor</Badge>
              ) : isRest ? (
                <Badge>Rest</Badge>
              ) : (
                <Badge>Planned</Badge>
              )}
            </Panel>
          );
        })}
      </CardContent>
    </Card>
  );
}

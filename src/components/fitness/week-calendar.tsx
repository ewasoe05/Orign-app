import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

          let borderClass = "border-zinc-800";
          if (isToday) borderClass = "border-emerald-800 bg-emerald-950/20";
          else if (workout && !isFloor) borderClass = "border-emerald-900/50 bg-emerald-950/10";
          else if (isFloor) borderClass = "border-amber-900/50 bg-amber-950/10";

          return (
            <div key={date} className={`flex items-center justify-between rounded-lg border p-3 ${borderClass}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{DAY_LABELS[i]}</span>
                  {isToday && <Badge variant="success">Today</Badge>}
                </div>
                <p className="text-xs text-zinc-400">
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
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

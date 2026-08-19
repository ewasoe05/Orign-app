import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DAY_LABELS } from "@/lib/seed";
import type { WeeklyScheduleDay } from "@/lib/types";

export function WeekCalendar({
  schedule,
  workoutsThisWeek,
}: {
  schedule: WeeklyScheduleDay[];
  workoutsThisWeek: { workout_date: string; subtype: string | null; workout_type: string }[];
}) {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - diff);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

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
          const isToday = date === today.toISOString().slice(0, 10);
          const isRest = daySchedule?.schedule_type === "rest" || !daySchedule;
          const isFloor = workout?.workout_type === "floor";

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

"use client";

import { useActionState } from "react";
import { toggleHabitFloor } from "@/lib/actions/habits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HabitFloorStatus } from "@/lib/types";

function HabitFloorButton({ habit }: { habit: HabitFloorStatus }) {
  const [, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return toggleHabitFloor(formData);
    },
    null,
  );

  return (
    <form action={action}>
      <input type="hidden" name="habit_key" value={habit.key} />
      <button
        type="submit"
        disabled={pending}
        className={cn(
          "w-full rounded-lg border p-3 text-left transition-colors disabled:opacity-60",
          habit.hitToday
            ? "border-emerald-800 bg-emerald-950/40"
            : habit.neverMissTwice
              ? "border-amber-700 bg-amber-950/40"
              : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">{habit.name}</p>
          {habit.hitToday ? (
            <Badge variant="success">Hit</Badge>
          ) : habit.neverMissTwice ? (
            <Badge variant="warning">Don&apos;t miss twice</Badge>
          ) : (
            <Badge>Tap</Badge>
          )}
        </div>
        <p className="mt-1 text-xs text-zinc-400">{habit.description}</p>
        <p className="mt-2 text-xs text-zinc-500">
          {habit.streak} day streak · {habit.hitsThisWeek}/7 this week
        </p>
      </button>
    </form>
  );
}

export function HabitsStrip({ habits }: { habits: HabitFloorStatus[] }) {
  const warningCount = habits.filter((habit) => habit.neverMissTwice).length;

  return (
    <Card className={warningCount > 0 ? "border-amber-900/50" : undefined}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Habit Floors</CardTitle>
        {warningCount > 0 && <Badge variant="warning">Never miss twice</Badge>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {habits.map((habit) => (
            <HabitFloorButton key={habit.key} habit={habit} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

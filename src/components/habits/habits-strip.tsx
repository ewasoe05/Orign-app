"use client";

import { useActionState } from "react";
import { setHabitLevel } from "@/lib/actions/habits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHeaderRow } from "@/components/ui/card-header-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HabitFloorStatus, HabitLevel, HabitWeekDot } from "@/lib/types";

const DOT_CLASS: Record<HabitWeekDot["status"], string> = {
  full: "bg-emerald-500",
  floor: "border border-amber-400 bg-transparent",
  miss: "bg-zinc-900 border border-zinc-800",
  unmarked: "bg-zinc-800",
  future: "bg-zinc-900/40",
};

function LevelButton({
  habitKey,
  level,
  label,
  active,
}: {
  habitKey: string;
  level: HabitLevel;
  label: string;
  active: boolean;
}) {
  const [, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return setHabitLevel(formData);
    },
    null,
  );

  return (
    <form action={action} className="flex-1">
      <input type="hidden" name="habit_key" value={habitKey} />
      <input type="hidden" name="level" value={level} />
      <Button
        type="submit"
        size="sm"
        variant="outline"
        disabled={pending}
        className={cn(
          "h-10 w-full text-xs",
          active &&
            (level === "full"
              ? "border-emerald-700 bg-emerald-950 text-emerald-300 hover:bg-emerald-950"
              : level === "floor"
                ? "border-amber-700 bg-amber-950 text-amber-300 hover:bg-amber-950"
                : "border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-800"),
        )}
      >
        {label}
      </Button>
    </form>
  );
}

function HabitCard({ habit }: { habit: HabitFloorStatus }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        habit.neverMissTwice
          ? "border-amber-700 bg-amber-950/40"
          : habit.hitToday
            ? "border-emerald-800 bg-emerald-950/30"
            : "border-zinc-800 bg-zinc-950/40",
      )}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">{habit.name}</p>
        {habit.neverMissTwice ? (
          <Badge variant="warning">
            <span title="Don't miss twice — today matters">Miss twice risk</span>
          </Badge>
        ) : habit.todayLevel === "full" ? (
          <Badge variant="success">Full</Badge>
        ) : habit.todayLevel === "floor" ? (
          <Badge variant="warning">Floor</Badge>
        ) : habit.todayLevel === "missed" ? (
          <Badge>Miss</Badge>
        ) : null}
      </div>
      <p className="mb-2 text-xs text-zinc-400">{habit.description}</p>
      <div className="mb-2 flex justify-between">
        {habit.weekDots.map((dot) => (
          <div key={dot.date} className="flex flex-col items-center gap-1">
            <div className={cn("h-3 w-3 rounded-full", DOT_CLASS[dot.status])} />
            <span className="text-[10px] text-zinc-500">{dot.label[0]}</span>
          </div>
        ))}
      </div>
      <p className="mb-2 text-xs text-zinc-500">{habit.streak} day streak</p>
      <div className="grid grid-cols-3 gap-2">
        <LevelButton habitKey={habit.key} level="full" label="Full" active={habit.todayLevel === "full"} />
        <LevelButton habitKey={habit.key} level="floor" label="Floor" active={habit.todayLevel === "floor"} />
        <LevelButton habitKey={habit.key} level="missed" label="Miss" active={habit.todayLevel === "missed"} />
      </div>
    </div>
  );
}

export function HabitsStrip({ habits }: { habits: HabitFloorStatus[] }) {
  const warningCount = habits.filter((habit) => habit.neverMissTwice).length;

  return (
    <Card className={warningCount > 0 ? "border-amber-900/50" : undefined}>
      <CardHeader>
        <CardHeaderRow>
          <CardTitle>Habit Floors</CardTitle>
          {warningCount > 0 && <Badge variant="warning">Never miss twice</Badge>}
        </CardHeaderRow>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {habits.map((habit) => (
            <HabitCard key={habit.key} habit={habit} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

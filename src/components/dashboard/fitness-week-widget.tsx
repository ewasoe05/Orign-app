import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { FitnessDashboardSummary } from "@/lib/types";

export function FitnessWeekWidget({ summary }: { summary: FitnessDashboardSummary }) {
  const { sessions, target, hasFloor, todayLabel, todayTemplateId, weekDots, prHighlight } =
    summary;
  const hitTarget = sessions >= target;
  const hitFloor = hasFloor && sessions < target;
  const progress = target > 0 ? (sessions / target) * 100 : 0;

  const dotColors = {
    done: "bg-emerald-500",
    floor: "bg-amber-500",
    planned: "border border-zinc-600 bg-transparent",
    rest: "bg-zinc-800",
    empty: "bg-zinc-900 border border-zinc-800",
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Fitness This Week</CardTitle>
        <Badge variant={hitTarget ? "success" : hitFloor ? "warning" : "default"}>
          {sessions}/{target}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={progress} />

        <div className="flex justify-between">
          {weekDots.map((dot) => (
            <div key={dot.day} className="flex flex-col items-center gap-1">
              <div className={`h-3 w-3 rounded-full ${dotColors[dot.status]}`} />
              <span className="text-[10px] text-zinc-500">{dot.label}</span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-zinc-800 p-2">
          <p className="text-xs text-zinc-500">Today</p>
          <p className="text-sm font-medium">{todayLabel}</p>
        </div>

        {prHighlight && (
          <p className="text-sm text-emerald-400">
            PR: {prHighlight.exercise} — {prHighlight.weight} lbs × {prHighlight.reps}
          </p>
        )}

        {hitFloor && (
          <p className="text-sm text-amber-400">Floor habit hit — chain intact</p>
        )}

        <Link href={`/fitness?template=${todayTemplateId ?? ""}#workout-form`}>
          <Button variant="outline" size="sm" className="w-full">
            Log today&apos;s workout
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

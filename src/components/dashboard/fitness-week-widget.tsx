import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHeaderRow } from "@/components/ui/card-header-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Progress } from "@/components/ui/progress";
import type { FitnessDashboardSummary } from "@/lib/types";

export function FitnessWeekWidget({ summary }: { summary: FitnessDashboardSummary }) {
  const { sessions, target, hasFloor, todayLabel, todayTemplateId, weekDots, prHighlight } =
    summary;
  const hitTarget = sessions >= target;
  const hitFloor = hasFloor && sessions < target;
  const progress = target > 0 ? (sessions / target) * 100 : 0;

  const dotColors = {
    done: "bg-accent-muted",
    floor: "bg-warning",
    planned: "border border-border-strong bg-transparent",
    rest: "bg-border-subtle",
    empty: "border border-border-subtle bg-surface-inset",
  };

  return (
    <Card>
      <CardHeader>
        <CardHeaderRow
          action={
            <Badge variant={hitTarget ? "success" : hitFloor ? "warning" : "default"}>
              {sessions}/{target}
            </Badge>
          }
        >
          <CardTitle>Fitness This Week</CardTitle>
        </CardHeaderRow>
      </CardHeader>
      <CardContent>
        <Progress value={progress} />

        <div className="flex justify-between">
          {weekDots.map((dot) => (
            <div key={dot.day} className="flex flex-col items-center gap-1">
              <div className={`h-3 w-3 rounded-full ${dotColors[dot.status]}`} />
              <span className="text-caption text-text-tertiary">{dot.label}</span>
            </div>
          ))}
        </div>

        <Panel>
          <p className="text-caption text-text-secondary">Today</p>
          <p className="text-body font-medium">{todayLabel}</p>
        </Panel>

        {prHighlight && (
          <p className="text-caption text-text-secondary">
            PR: {prHighlight.exercise} — {prHighlight.weight} lbs × {prHighlight.reps}
          </p>
        )}

        {hitFloor && <p className="text-caption text-warning">Floor habit hit — chain intact</p>}

        <Link href={`/fitness?template=${todayTemplateId ?? ""}#workout-form`}>
          <Button variant="outline" size="touch" className="w-full">
            Log today&apos;s workout
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

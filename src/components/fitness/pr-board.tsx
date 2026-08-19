import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PersonalRecord } from "@/lib/types";

export function PRBoard({
  prs,
  targetProgress,
}: {
  prs: PersonalRecord[];
  targetProgress: { exercise: string; min: number; max: number; current: number; progress: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Records</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {targetProgress.map((target) => {
          const pr = prs.find(
            (p) =>
              p.exercise.toLowerCase().includes(target.exercise.toLowerCase()) ||
              target.exercise.toLowerCase().includes(p.exercise.toLowerCase()),
          );

          return (
            <div key={target.exercise} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{target.exercise}</span>
                <span className="text-zinc-400">
                  {pr ? `${pr.weight} lbs × ${pr.reps}` : "No data"} / {target.min}–{target.max} goal
                </span>
              </div>
              <Progress value={target.progress} />
            </div>
          );
        })}

        {prs.filter(
          (pr) =>
            !targetProgress.some(
              (t) =>
                pr.exercise.toLowerCase().includes(t.exercise.toLowerCase()) ||
                t.exercise.toLowerCase().includes(pr.exercise.toLowerCase()),
            ),
        ).length > 0 && (
          <div className="mt-4 border-t border-zinc-800 pt-3">
            <p className="mb-2 text-xs font-medium text-zinc-500">Other PRs</p>
            {prs
              .filter(
                (pr) =>
                  !targetProgress.some(
                    (t) =>
                      pr.exercise.toLowerCase().includes(t.exercise.toLowerCase()) ||
                      t.exercise.toLowerCase().includes(pr.exercise.toLowerCase()),
                  ),
              )
              .slice(0, 5)
              .map((pr) => (
                <p key={pr.exercise} className="text-sm text-zinc-400">
                  {pr.exercise}: {pr.weight} lbs × {pr.reps}
                </p>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

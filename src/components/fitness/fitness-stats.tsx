import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function FitnessStats({
  phase,
  sessions,
  target,
  streak,
  hasFloor,
}: {
  phase: string;
  sessions: number;
  target: number;
  streak: number;
  hasFloor: boolean;
}) {
  const progress = target > 0 ? (sessions / target) * 100 : 0;
  const hitTarget = sessions >= target;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-zinc-500">Phase</p>
          <Badge variant="success" className="mt-1">{phase}</Badge>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-zinc-500">This Week</p>
          <p className="mt-1 text-xl font-bold">
            {sessions}/{target}
          </p>
          <Progress value={progress} className="mt-2" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-zinc-500">Streak</p>
          <p className="mt-1 text-xl font-bold">{streak} wk{streak !== 1 ? "s" : ""}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-zinc-500">Status</p>
          {hitTarget ? (
            <Badge variant="success" className="mt-1">Target hit</Badge>
          ) : hasFloor ? (
            <Badge variant="warning" className="mt-1">Floor hit</Badge>
          ) : (
            <Badge className="mt-1">{target - sessions} to go</Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

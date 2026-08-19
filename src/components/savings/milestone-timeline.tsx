import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { MilestoneProjection } from "@/lib/projection-bridge";

export function MilestoneTimeline({ milestones }: { milestones: MilestoneProjection[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Duplex milestones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {milestones.map((milestone) => (
          <div
            key={milestone.description}
            className="flex items-start justify-between gap-3 rounded-lg border border-zinc-800 p-3"
          >
            <div>
              <p className="text-sm font-medium">{milestone.description}</p>
              <p className="text-xs text-zinc-500">
                {milestone.projectedDate
                  ? new Date(milestone.projectedDate).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "TBD"}
                {milestone.moved ? " · moved from plan" : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm">{formatCurrency(milestone.amount)}</p>
              <Badge variant={milestone.hit ? "success" : "default"}>
                {milestone.hit ? "Hit" : "Upcoming"}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

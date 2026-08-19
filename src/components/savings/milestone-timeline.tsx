import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { SAVINGS_MILESTONES } from "@/lib/seed";

export function MilestoneTimeline({ cashOnHand }: { cashOnHand: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Duplex milestones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {SAVINGS_MILESTONES.map((milestone) => {
          const hit = cashOnHand >= milestone.amount;
          return (
            <div
              key={milestone.date}
              className="flex items-start justify-between gap-3 rounded-lg border border-zinc-800 p-3"
            >
              <div>
                <p className="text-sm font-medium">{milestone.description}</p>
                <p className="text-xs text-zinc-500">{milestone.label}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">{formatCurrency(milestone.amount)}</p>
                <Badge variant={hit ? "success" : "default"}>{hit ? "Hit" : "Upcoming"}</Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

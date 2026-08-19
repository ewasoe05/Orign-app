import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { QUARTERLY_PLAN } from "@/content/plan";

export function OnePageTable({ currentQuarter }: { currentQuarter: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>One-page plan · Sep 2026 → Aug 2028</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {QUARTERLY_PLAN.map((q) => (
          <Panel
            key={q.quarter}
            className={q.quarter === currentQuarter ? "border-accent/40 bg-success-bg/50" : undefined}
          >
            <div className="mb-2 flex items-center gap-2">
              <p className="text-body font-medium">{q.label}</p>
              {q.quarter === currentQuarter && <Badge variant="success">Now</Badge>}
            </div>
            <p className="text-caption text-text-secondary">
              <span className="text-text-primary">Money:</span> {q.money}
            </p>
            <p className="mt-1 text-caption text-text-secondary">
              <span className="text-text-primary">Business:</span> {q.business}
            </p>
            <p className="mt-1 text-caption text-text-secondary">
              <span className="text-text-primary">Body:</span> {q.body}
            </p>
          </Panel>
        ))}
      </CardContent>
    </Card>
  );
}

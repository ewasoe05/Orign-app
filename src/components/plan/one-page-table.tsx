import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QUARTERLY_PLAN } from "@/content/plan";

export function OnePageTable({ currentQuarter }: { currentQuarter: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>One-page plan · Sep 2026 → Aug 2028</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {QUARTERLY_PLAN.map((q) => (
          <div
            key={q.quarter}
            className={`rounded-lg border p-3 ${
              q.quarter === currentQuarter
                ? "border-emerald-800 bg-emerald-950/20"
                : "border-zinc-800"
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              <p className="text-sm font-medium">{q.label}</p>
              {q.quarter === currentQuarter && <Badge variant="success">Now</Badge>}
            </div>
            <p className="text-xs text-zinc-400">
              <span className="text-zinc-300">Money:</span> {q.money}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              <span className="text-zinc-300">Business:</span> {q.business}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              <span className="text-zinc-300">Body:</span> {q.body}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

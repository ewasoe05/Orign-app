import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QUARTERLY_PLAN } from "@/lib/seed";
import type { QuarterlyReview } from "@/lib/types";

export function QuarterlyHistory({ reviews }: { reviews: QuarterlyReview[] }) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-zinc-400">
          No quarterly checkpoints yet. First one is due at the end of Q1.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-zinc-400">Past checkpoints</h2>
      {reviews.map((review) => {
        const plan = QUARTERLY_PLAN.find((q) => q.quarter === review.quarter);
        return (
          <Card key={review.id}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm">{plan?.label ?? `Q${review.quarter}`}</CardTitle>
              <span className="text-xs text-zinc-500">{review.review_date}</span>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex flex-wrap gap-2">
                <Pill label="Money" status={review.money_status} />
                <Pill label="Business" status={review.business_status} />
                <Pill label="Body" status={review.body_status} />
              </div>
              <div>
                <p className="text-zinc-500">What changed</p>
                <p className="text-zinc-300">{review.what_changed}</p>
              </div>
              <div>
                <p className="text-zinc-500">What to adjust</p>
                <p className="text-zinc-300">{review.what_to_adjust}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function Pill({ label, status }: { label: string; status: string }) {
  return (
    <Badge variant={status === "on_track" ? "success" : "warning"}>
      {label}: {status === "on_track" ? "on track" : "behind"}
    </Badge>
  );
}

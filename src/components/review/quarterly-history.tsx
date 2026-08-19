import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHeaderRow } from "@/components/ui/card-header-row";
import { Badge } from "@/components/ui/badge";
import { QUARTERLY_PLAN } from "@/content/plan";
import type { QuarterlyReview } from "@/lib/types";

export function QuarterlyHistory({ reviews }: { reviews: QuarterlyReview[] }) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-body text-text-secondary">
          No quarterly checkpoints yet. First one is due at the end of Q1.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-label text-text-secondary">Past checkpoints</h2>
      {reviews.map((review) => {
        const plan = QUARTERLY_PLAN.find((q) => q.quarter === review.quarter);
        return (
          <Card key={review.id}>
            <CardHeader>
              <CardHeaderRow
                action={
                  <span className="text-caption text-text-tertiary">{review.review_date}</span>
                }
              >
                <CardTitle>{plan?.label ?? `Q${review.quarter}`}</CardTitle>
              </CardHeaderRow>
            </CardHeader>
            <CardContent className="space-y-2 text-body">
              <div className="flex flex-wrap gap-2">
                <Pill label="Money" status={review.money_status} />
                <Pill label="Business" status={review.business_status} />
                <Pill label="Body" status={review.body_status} />
              </div>
              <div>
                <p className="text-caption text-text-secondary">What changed</p>
                <p className="text-text-secondary">{review.what_changed}</p>
              </div>
              <div>
                <p className="text-caption text-text-secondary">What to adjust</p>
                <p className="text-text-secondary">{review.what_to_adjust}</p>
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

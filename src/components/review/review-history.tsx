import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeeklyReview } from "@/lib/types";

export function ReviewHistory({ reviews }: { reviews: WeeklyReview[] }) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-body text-text-secondary">
          No reviews yet. Your first Sunday review starts the habit.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-label text-text-secondary">Past Reviews</h2>
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <CardTitle className="text-body">{review.review_date}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-body">
            <div>
              <p className="text-text-tertiary">Debt total</p>
              <p>${review.debt_total}</p>
            </div>
            <div>
              <p className="text-text-tertiary">Training</p>
              <p className="text-text-primary">{review.training_sessions}</p>
            </div>
            <div>
              <p className="text-text-tertiary">Leads / closes</p>
              <p className="text-text-primary">{review.leads_closes}</p>
            </div>
            <div>
              <p className="text-text-tertiary">Do differently</p>
              <p className="text-text-primary">{review.do_differently}</p>
            </div>
            <div>
              <p className="text-text-tertiary">How doing</p>
              <p className="text-text-primary">{review.how_doing}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

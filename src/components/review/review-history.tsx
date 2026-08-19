import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeeklyReview } from "@/lib/types";

export function ReviewHistory({ reviews }: { reviews: WeeklyReview[] }) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-zinc-400">
          No reviews yet. Your first Sunday review starts the habit.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-zinc-400">Past Reviews</h2>
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <CardTitle className="text-sm">{review.review_date}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-zinc-500">Debt total</p>
              <p>${review.debt_total}</p>
            </div>
            <div>
              <p className="text-zinc-500">Training</p>
              <p className="text-zinc-300">{review.training_sessions}</p>
            </div>
            <div>
              <p className="text-zinc-500">Leads / closes</p>
              <p className="text-zinc-300">{review.leads_closes}</p>
            </div>
            <div>
              <p className="text-zinc-500">Do differently</p>
              <p className="text-zinc-300">{review.do_differently}</p>
            </div>
            <div>
              <p className="text-zinc-500">How doing</p>
              <p className="text-zinc-300">{review.how_doing}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

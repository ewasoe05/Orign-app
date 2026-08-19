"use client";

import { useActionState } from "react";
import { submitReview } from "@/lib/actions/review";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WEEKLY_REVIEW_QUESTIONS } from "@/content/plan";

export function ReviewForm({
  defaults,
}: {
  defaults: {
    debtTotal: string;
    reviewDate: string;
    trainingSessions?: string;
    leadsCloses?: string;
  };
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return submitReview(formData);
    },
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sunday Weekly Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <input type="hidden" name="review_date" value={defaults.reviewDate} />

          {WEEKLY_REVIEW_QUESTIONS.map((q, i) => (
            <div key={q.id} className="space-y-2">
              <Label htmlFor={q.id}>
                {i + 1}. {q.label}
              </Label>
              {q.type === "input" ? (
                <Input
                  id={q.id}
                  name={q.id}
                  defaultValue={q.id === "debt_total" ? defaults.debtTotal : undefined}
                  required
                />
              ) : (
                <Textarea
                  id={q.id}
                  name={q.id}
                  rows={3}
                  required
                  defaultValue={
                    q.id === "training_sessions"
                      ? defaults.trainingSessions
                      : q.id === "leads_closes"
                        ? defaults.leadsCloses
                        : undefined
                  }
                />
              )}
            </div>
          ))}

          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
          {state?.success && (
            <p className="text-sm text-emerald-400">Review saved. See you next Sunday.</p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving..." : "Save review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

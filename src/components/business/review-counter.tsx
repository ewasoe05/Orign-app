"use client";

import { useActionState } from "react";
import { logGoogleReview } from "@/lib/actions/business";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GOOGLE_REVIEW_TARGET } from "@/lib/seed";
import { formatLocalDate } from "@/lib/utils";

export function ReviewCounter({ count }: { count: number }) {
  const progress = (count / GOOGLE_REVIEW_TARGET) * 100;
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return logGoogleReview(formData);
    },
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-2xl font-semibold">
          {count}/{GOOGLE_REVIEW_TARGET}
        </p>
        <Progress value={progress} />
        <p className="text-caption text-text-tertiary">Target 20 by December 2026.</p>
        <form action={action} className="space-y-2">
          <Label htmlFor="review_date">Log a review</Label>
          <Input id="review_date" name="review_date" type="date" defaultValue={formatLocalDate()} />
          <Input name="notes" placeholder="Customer / job (optional)" />
          {state?.error && <p className="text-caption text-danger">{state.error}</p>}
          {state?.success && <p className="text-caption text-accent-muted">Review counted.</p>}
          <Button type="submit" variant="outline" className="w-full" disabled={pending}>
            {pending ? "Saving..." : "Add review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

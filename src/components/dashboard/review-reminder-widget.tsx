"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHeaderRow } from "@/components/ui/card-header-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildReminders, hasWeeklyReviewToday, isSundayLocal } from "@/lib/reminders";
import type { RemindersContext } from "@/lib/types";

export function ReviewReminderWidget({ context }: { context: RemindersContext }) {
  const state = useMemo(() => {
    const today = new Date();
    const isSunday = isSundayLocal(today);
    const completed = hasWeeklyReviewToday(context.reviews, today);
    const sundayReminder = buildReminders({
      dismissals: context.dismissals,
      habits: context.habits,
      followUps: context.followUps,
      paidThisMonth: context.paidThisMonth,
      debtTarget: context.debtTarget,
      debtFree: context.debtFree,
      reviews: context.reviews,
      quarterlyReviewQuarters: context.quarterlyReviewQuarters,
      planStartDate: context.planStartDate,
      accounts: context.accounts,
      today,
    }).find((item) => item.key === "sunday_review");

    return { isSunday, completed, sundayReminder };
  }, [context]);

  const badge =
    state.isSunday && !state.completed ? (
      <Badge variant="warning">Due today</Badge>
    ) : state.isSunday && state.completed ? (
      <Badge variant="success">Completed</Badge>
    ) : null;

  return (
    <Card className={state.isSunday ? "border-accent/30" : undefined}>
      <CardHeader>
        <CardHeaderRow action={badge}>
          <CardTitle>Weekly Review</CardTitle>
        </CardHeaderRow>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-caption text-text-secondary">
          {state.sundayReminder?.message ?? "Your next Sunday review keeps the plan on track."}
        </p>
        <Link href="/review">
          <Button variant="outline" size="touch" className="w-full">
            {state.isSunday && !state.completed ? "Start review" : "View reviews"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

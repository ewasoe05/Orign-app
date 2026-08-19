"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { dismissReminder } from "@/lib/actions/reminders";
import { buildReminders, sortRemindersForDashboard } from "@/lib/reminders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RemindersContext } from "@/lib/types";

const urgencyVariant = {
  info: "default",
  warning: "warning",
  danger: "danger",
} as const;

export function RemindersPanel({ context }: { context: RemindersContext }) {
  const [dismissals, setDismissals] = useState(context.dismissals);
  const [pending, startTransition] = useTransition();

  const reminders = useMemo(
    () =>
      sortRemindersForDashboard(
        buildReminders({
          dismissals,
          habits: context.habits,
          followUps: context.followUps,
          paidThisMonth: context.paidThisMonth,
          debtTarget: context.debtTarget,
          debtFree: context.debtFree,
          reviews: context.reviews,
          quarterlyReviewQuarters: context.quarterlyReviewQuarters,
          planStartDate: context.planStartDate,
          accounts: context.accounts,
        }),
      ),
    [context, dismissals],
  );

  if (!reminders.length) return null;

  function handleDismiss(key: string, scope: string) {
    setDismissals((current) => [...current, { reminder_key: key, scope }]);
    startTransition(async () => {
      await dismissReminder(key, scope);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reminders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.map((reminder) => (
          <Panel
            key={`${reminder.key}:${reminder.scope}`}
            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-body font-medium text-text-primary">{reminder.title}</p>
                <Badge variant={urgencyVariant[reminder.urgency]}>
                  {reminder.urgency === "danger"
                    ? "Urgent"
                    : reminder.urgency === "warning"
                      ? "Due"
                      : "Done"}
                </Badge>
              </div>
              <p className="text-body text-text-secondary">{reminder.message}</p>
            </div>
            <div className="flex gap-2">
              {reminder.href && (
                <Link href={reminder.href}>
                  <Button variant="outline" size="sm">
                    Open
                  </Button>
                </Link>
              )}
              {reminder.dismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => handleDismiss(reminder.key, reminder.scope)}
                >
                  Dismiss
                </Button>
              )}
            </div>
          </Panel>
        ))}
      </CardContent>
    </Card>
  );
}

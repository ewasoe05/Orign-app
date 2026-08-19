"use client";

import { useActionState } from "react";
import { setHabitLevel } from "@/lib/actions/habits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { formatCurrency } from "@/lib/utils";
import type { FollowUpItem } from "@/lib/types";

function MarkSentButton() {
  const [, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return setHabitLevel(formData);
    },
    null,
  );

  return (
    <form action={action}>
      <input type="hidden" name="habit_key" value="business" />
      <input type="hidden" name="level" value="full" />
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending ? "Saving..." : "Mark sent"}
      </Button>
    </form>
  );
}

export function FollowUpQueue({ items }: { items: FollowUpItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Follow-up queue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-body text-text-secondary">No open quotes. Day 2 / 7 / 21 stays empty until you log a lead.</p>
        ) : (
          items.map((item) => (
            <Panel
              key={`${item.lead.id}-${item.followUpDay}`}
              className="flex items-start justify-between gap-2"
            >
              <div>
                <p className="text-body font-medium">{item.lead.service}</p>
                <p className="text-caption text-text-tertiary">
                  {item.lead.source} · quoted {formatCurrency(Number(item.lead.quoted_amount))}
                </p>
                <p className="mt-1 text-caption text-text-secondary">
                  Day {item.followUpDay} follow-up · due {item.dueDate}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={item.overdue ? "warning" : "default"}>
                  {item.overdue ? "Overdue" : `${item.daysUntilDue}d`}
                </Badge>
                <MarkSentButton />
              </div>
            </Panel>
          ))
        )}
      </CardContent>
    </Card>
  );
}

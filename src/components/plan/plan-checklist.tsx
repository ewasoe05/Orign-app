"use client";

import { useActionState } from "react";
import { togglePlanChecklist } from "@/lib/actions/plan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleRowSubmit } from "@/components/ui/toggle-row";
import type { PlanChecklistItem } from "@/lib/types";

export function PlanChecklist({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: PlanChecklistItem[];
}) {
  const [, action] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return togglePlanChecklist(formData);
    },
    null,
  );

  const done = items.filter((item) => item.completed).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description ? `${description} ` : ""}
          {done}/{items.length} done
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <form action={action} key={item.key}>
            <input type="hidden" name="item_key" value={item.key} />
            <ToggleRowSubmit
              selected={item.completed}
              label={item.label}
              detail={item.detail ?? undefined}
            />
          </form>
        ))}
      </CardContent>
    </Card>
  );
}

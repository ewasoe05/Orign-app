"use client";

import { useActionState } from "react";
import { togglePlanChecklist } from "@/lib/actions/plan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
            <button
              type="submit"
              className={cn(
                "w-full rounded-lg border p-3 text-left",
                item.completed
                  ? "border-emerald-800 bg-emerald-950/30"
                  : "border-zinc-800 hover:border-zinc-700",
              )}
            >
              <p className={cn("text-sm font-medium", item.completed && "text-emerald-300")}>
                {item.completed ? "Done — " : ""}
                {item.label}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{item.detail}</p>
            </button>
          </form>
        ))}
      </CardContent>
    </Card>
  );
}

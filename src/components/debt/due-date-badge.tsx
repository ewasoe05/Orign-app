"use client";

import { paymentDueLabel } from "@/lib/reminders";
import { Badge } from "@/components/ui/badge";

export function DueDateBadge({ dueDay }: { dueDay: number | null }) {
  if (dueDay == null) return null;

  const label = paymentDueLabel(dueDay, new Date());
  if (!label) return null;

  const variant = label.includes("overdue") ? "danger" : "warning";
  return <Badge variant={variant}>{label}</Badge>;
}

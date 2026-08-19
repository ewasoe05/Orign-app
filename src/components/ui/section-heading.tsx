import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function SectionHeading({
  title,
  className,
  action,
}: {
  title: string;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-2", className)}>
      <h2 className="text-label uppercase tracking-wider text-text-secondary">{title}</h2>
      {action}
    </div>
  );
}

export {
  metricCompactClass,
  metricHeroClass,
  metricWidgetClass,
} from "@/components/ui/metric";

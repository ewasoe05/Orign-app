import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  className,
  action,
}: {
  title: string;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-2", className)}>
      <p className="text-sm font-medium text-zinc-300">{title}</p>
      {action}
    </div>
  );
}

/** Primary metric in hero cards */
export const metricHeroClass = "text-4xl font-bold tracking-tight text-emerald-400 lg:text-5xl";

/** Primary metric in dashboard widgets */
export const metricWidgetClass = "text-2xl font-semibold text-emerald-400";

/** Compact metric in outcome tiles */
export const metricCompactClass = "text-lg font-semibold text-emerald-400";

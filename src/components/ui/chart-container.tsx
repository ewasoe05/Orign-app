import { CHART_HEIGHT } from "@/lib/chart-theme";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function ChartContainer({
  size = "md",
  className,
  children,
}: {
  size?: keyof typeof CHART_HEIGHT;
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn(CHART_HEIGHT[size], className)}>{children}</div>;
}

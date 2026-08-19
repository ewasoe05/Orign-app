import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

const metricVariants = cva("text-text-primary", {
  variants: {
    variant: {
      display: "text-display font-semibold tracking-tight lg:text-display-lg",
      widget: "text-title font-semibold",
      compact: "text-title font-semibold",
    },
  },
  defaultVariants: {
    variant: "widget",
  },
});

export function Metric({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & VariantProps<typeof metricVariants>) {
  return <p className={cn(metricVariants({ variant, className }))} {...props} />;
}

/** @deprecated Use Metric variant="display" */
export const metricHeroClass = "text-display font-semibold tracking-tight text-text-primary lg:text-display-lg";

/** @deprecated Use Metric variant="widget" */
export const metricWidgetClass = "text-title font-semibold text-text-primary";

/** @deprecated Use Metric variant="compact" */
export const metricCompactClass = "text-title font-semibold text-text-primary";

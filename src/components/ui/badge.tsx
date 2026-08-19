import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

const badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-caption font-medium", {
  variants: {
    variant: {
      default: "bg-surface-raised text-text-primary",
      success: "bg-success-bg text-accent-muted",
      warning: "bg-amber-900/50 text-amber-300",
      danger: "bg-red-900/50 text-red-300",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function Badge({
  className,
  variant,
  children,
}: {
  className?: string;
  children: ReactNode;
} & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant, className }))}>{children}</span>;
}

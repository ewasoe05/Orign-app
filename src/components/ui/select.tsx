import { cn } from "@/lib/utils";
import { type SelectHTMLAttributes, forwardRef } from "react";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full rounded-sm border border-border-strong bg-surface-inset px-3 py-2 text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-accent",
        className,
      )}
      {...props}
    />
  ),
);
Select.displayName = "Select";

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md border border-border-subtle bg-surface-inset p-3",
        className,
      )}
      {...props}
    />
  );
}

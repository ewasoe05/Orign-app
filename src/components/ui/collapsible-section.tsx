"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  className,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <>
      <details
        className={cn(
          "group rounded-lg border border-border-subtle bg-surface lg:hidden",
          className,
        )}
        open={defaultOpen || undefined}
      >
        <summary className="cursor-pointer list-none p-4 [&::-webkit-details-marker]:hidden">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-title text-text-primary">{title}</p>
              {description ? (
                <p className="mt-1 text-caption text-text-secondary">{description}</p>
              ) : null}
            </div>
            <span className="text-caption text-text-tertiary group-open:hidden">Show</span>
            <span className="hidden text-caption text-text-tertiary group-open:inline">Hide</span>
          </div>
        </summary>
        <div className="border-t border-border-subtle px-4 pb-4 transition-ui">{children}</div>
      </details>

      <Card className={cn("hidden lg:block", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? <p className="text-caption text-text-secondary">{description}</p> : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </>
  );
}

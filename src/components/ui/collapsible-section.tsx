"use client";

import type { ReactNode } from "react";

export function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <details
        className="group rounded-xl border border-zinc-800 bg-zinc-900/80 lg:hidden"
        open={defaultOpen}
      >
        <summary className="cursor-pointer list-none p-4 [&::-webkit-details-marker]:hidden">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-base font-semibold text-zinc-100">{title}</p>
              {description && <p className="mt-0.5 text-sm text-zinc-400">{description}</p>}
            </div>
            <span className="text-xs text-zinc-500 group-open:hidden">Show</span>
            <span className="hidden text-xs text-zinc-500 group-open:inline">Hide</span>
          </div>
        </summary>
        <div className="border-t border-zinc-800 p-4 pt-0">{children}</div>
      </details>
      <div className="hidden lg:block">{children}</div>
    </>
  );
}

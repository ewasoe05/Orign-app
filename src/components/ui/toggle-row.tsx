"use client";

import { cn } from "@/lib/utils";
import { type ReactNode, useTransition } from "react";

export function ToggleRow({
  selected,
  onToggle,
  label,
  detail,
  disabled,
}: {
  selected: boolean;
  onToggle: () => void | Promise<void>;
  label: string;
  detail?: string;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await onToggle();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || pending}
      aria-pressed={selected}
      className={cn(
        "min-h-11 w-full rounded-md border p-3 text-left transition-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-page disabled:opacity-50",
        selected
          ? "border-accent/40 bg-success-bg"
          : "border-border-subtle hover:border-border-strong hover:bg-surface-raised",
      )}
    >
      <p className={cn("text-body font-medium", selected && "text-accent-muted")}>
        {selected ? "Done — " : ""}
        {label}
      </p>
      {detail ? <p className="mt-1 text-caption text-text-secondary">{detail}</p> : null}
    </button>
  );
}

export function ToggleRowSubmit({
  selected,
  label,
  detail,
  className,
}: {
  selected: boolean;
  label: string;
  detail?: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={cn(
        "min-h-11 w-full rounded-md border p-3 text-left transition-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-page",
        selected
          ? "border-accent/40 bg-success-bg"
          : "border-border-subtle hover:border-border-strong hover:bg-surface-raised",
        className,
      )}
    >
      <p className={cn("text-body font-medium", selected && "text-accent-muted")}>
        {selected ? "Done — " : ""}
        {label}
      </p>
      {detail ? <p className="mt-1 text-caption text-text-secondary">{detail}</p> : null}
    </button>
  );
}

import { cn, formatCurrencyDetailed } from "@/lib/utils";
import type { PaycheckLine } from "@/lib/types";

const TYPE_STYLES: Record<PaycheckLine["type"], string> = {
  hold: "border-l-text-tertiary",
  fun: "border-l-warning",
  debt: "border-l-danger",
  save: "border-l-accent-muted",
};

export function PaycheckReceipt({
  lines,
  milestone,
}: {
  lines: PaycheckLine[];
  milestone?: string | null;
}) {
  if (!lines.length && !milestone) return null;

  return (
    <div className="space-y-3">
      {milestone ? (
        <p className="rounded-md border border-accent/40 bg-success-bg px-3 py-2 text-body text-accent-muted">
          {milestone}
        </p>
      ) : null}
      <ul className="space-y-2">
        {lines.map((line, index) => (
          <li
            key={`${line.type}-${line.label}-${index}`}
            className={cn(
              "flex items-start justify-between gap-3 border-l-2 bg-surface-inset px-3 py-2",
              TYPE_STYLES[line.type],
            )}
          >
            <div className="min-w-0">
              <p className="text-body text-text-primary">{line.label}</p>
              {line.subLabel ? (
                <p className="text-caption text-text-secondary">{line.subLabel}</p>
              ) : null}
            </div>
            <p className="shrink-0 text-body font-medium text-text-primary">
              {formatCurrencyDetailed(line.amount)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

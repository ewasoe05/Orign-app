import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyDetailed } from "@/lib/utils";
import type { PaycheckEntry } from "@/lib/types";

export function PaycheckHistory({ entries }: { entries: PaycheckEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>History</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-caption text-text-secondary">No paychecks routed yet.</p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="rounded-md border border-border-subtle bg-surface-inset px-3 py-2"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-body text-text-primary">
                    {entry.kind === "sweep" ? "Sweep" : "Paycheck"} · {entry.entry_date}
                  </p>
                  <p className="text-body font-medium">{formatCurrencyDetailed(Number(entry.amount))}</p>
                </div>
                <p className="mt-1 text-caption text-text-secondary">
                  Essentials {formatCurrencyDetailed(Number(entry.essentials))} · Plan{" "}
                  {formatCurrencyDetailed(Number(entry.to_plan))}
                  {Number(entry.fun_amount) > 0
                    ? ` · Fun ${formatCurrencyDetailed(Number(entry.fun_amount))}`
                    : ""}
                  {Number(entry.leftover) > 0
                    ? ` · Buffer ${formatCurrencyDetailed(Number(entry.leftover))}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

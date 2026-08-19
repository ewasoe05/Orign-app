"use client";

import { useEffect, useMemo, useState } from "react";
import { GripVertical } from "lucide-react";
import { reorderDebtAccounts } from "@/lib/actions/debt";
import { sortAccountsByPayoffOrder } from "@/lib/debt-priority";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHeaderRow } from "@/components/ui/card-header-row";
import { Metric } from "@/components/ui/metric";
import { Badge } from "@/components/ui/badge";
import { DueDateBadge } from "@/components/debt/due-date-badge";
import { formatCurrencyDetailed } from "@/lib/utils";
import type { DebtAccount } from "@/lib/types";

export function AccountPriorityEditor({ accounts }: { accounts: DebtAccount[] }) {
  const initialOrder = useMemo(
    () => sortAccountsByPayoffOrder(accounts.filter((account) => !account.is_paid_off)),
    [accounts],
  );
  const paidOff = useMemo(
    () => sortAccountsByPayoffOrder(accounts.filter((account) => account.is_paid_off)),
    [accounts],
  );

  const [ordered, setOrdered] = useState(initialOrder);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOrdered(initialOrder);
  }, [initialOrder]);

  async function persistOrder(nextOrder: DebtAccount[]) {
    setPending(true);
    setError(null);
    const result = await reorderDebtAccounts(nextOrder.map((account) => account.id));
    setPending(false);
    if (result.error) {
      setError(result.error);
      setOrdered(initialOrder);
    }
  }

  function reorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    const next = [...ordered];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setOrdered(next);
    void persistOrder(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-body font-medium text-text-primary">Payoff order</p>
        <p className="text-caption text-text-tertiary">Drag to reorder · updates projection</p>
      </div>

      {ordered.map((account, index) => (
        <Card
          key={account.id}
          draggable={!pending}
          onDragStart={() => setDragIndex(index)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (dragIndex != null) reorder(dragIndex, index);
            setDragIndex(null);
          }}
          onDragEnd={() => setDragIndex(null)}
          className={`transition-opacity ${dragIndex === index ? "opacity-50" : ""} ${
            pending ? "pointer-events-none opacity-70" : "cursor-grab active:cursor-grabbing"
          }`}
        >
          <CardHeader>
            <CardHeaderRow
              action={
                <div className="flex flex-col items-end gap-1">
                  <Badge>Priority {index + 1}</Badge>
                  <DueDateBadge dueDay={account.due_day_of_month} />
                </div>
              }
            >
              <div className="flex min-w-0 items-start gap-2">
                <GripVertical
                  className="mt-0.5 hidden h-4 w-4 shrink-0 text-text-tertiary sm:block"
                  aria-hidden
                />
                <div>
                  <CardTitle>{account.name}</CardTitle>
                  {account.interest_rate != null ? (
                    <p className="text-caption text-text-tertiary">{account.interest_rate}% APR</p>
                  ) : (
                    <p className="text-caption text-warning">
                      Set APR — projection assumes 0% until you log it
                    </p>
                  )}
                </div>
              </div>
            </CardHeaderRow>
          </CardHeader>
          <CardContent>
            <Metric variant="compact">
              {formatCurrencyDetailed(Number(account.current_balance))}
            </Metric>
            <p className="text-caption text-text-tertiary">
              Started at {formatCurrencyDetailed(Number(account.initial_balance))}
            </p>
          </CardContent>
        </Card>
      ))}

      {paidOff.map((account) => (
        <Card key={account.id} className="opacity-60">
          <CardHeader>
            <CardHeaderRow action={<Badge variant="success">Done</Badge>}>
              <div>
                <CardTitle>{account.name}</CardTitle>
                <p className="text-caption text-text-tertiary">Paid off</p>
              </div>
            </CardHeaderRow>
          </CardHeader>
          <CardContent>
            <Metric variant="compact">
              {formatCurrencyDetailed(Number(account.current_balance))}
            </Metric>
          </CardContent>
        </Card>
      ))}

      {error && <p className="text-caption text-danger">{error}</p>}
    </div>
  );
}

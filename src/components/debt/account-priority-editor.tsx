"use client";

import { useEffect, useMemo, useState } from "react";
import { GripVertical } from "lucide-react";
import { reorderDebtAccounts } from "@/lib/actions/debt";
import { sortAccountsByPayoffOrder } from "@/lib/debt-priority";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-300">Payoff order</p>
        <p className="text-xs text-zinc-500">Drag to reorder · updates projection</p>
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
          <CardHeader className="flex-row items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" aria-hidden />
              <div>
                <CardTitle className="text-sm">{account.name}</CardTitle>
                {account.interest_rate != null ? (
                  <p className="text-xs text-zinc-500">{account.interest_rate}% APR</p>
                ) : (
                  <p className="text-xs text-amber-400">
                    Set APR — projection assumes 0% until you log it
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge>Priority {index + 1}</Badge>
              <DueDateBadge dueDay={account.due_day_of_month} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">
              {formatCurrencyDetailed(Number(account.current_balance))}
            </p>
            <p className="text-xs text-zinc-500">
              Started at {formatCurrencyDetailed(Number(account.initial_balance))}
            </p>
          </CardContent>
        </Card>
      ))}

      {paidOff.map((account) => (
        <Card key={account.id} className="opacity-60">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle className="text-sm">{account.name}</CardTitle>
              <p className="text-xs text-zinc-500">Paid off</p>
            </div>
            <Badge variant="success">Done</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">
              {formatCurrencyDetailed(Number(account.current_balance))}
            </p>
          </CardContent>
        </Card>
      ))}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

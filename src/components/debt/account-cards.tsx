import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyDetailed } from "@/lib/utils";
import { sortAccountsByPayoffOrder } from "@/lib/debt-priority";
import type { DebtAccount } from "@/lib/types";

export function AccountCards({ accounts }: { accounts: DebtAccount[] }) {
  const sorted = sortAccountsByPayoffOrder(accounts);

  return (
    <div className="space-y-3">
      {sorted.map((account) => (
        <Card
          key={account.id}
          className={account.is_paid_off ? "opacity-60" : ""}
        >
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle className="text-sm">{account.name}</CardTitle>
              {account.interest_rate != null ? (
                <p className="text-xs text-zinc-500">{account.interest_rate}% APR</p>
              ) : (
                <p className="text-xs text-amber-400">Set APR — projection assumes 0% until you log it</p>
              )}
            </div>
            {account.is_paid_off ? (
              <Badge variant="success">Paid off</Badge>
            ) : (
              <Badge>Priority {account.priority}</Badge>
            )}
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
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyDetailed } from "@/lib/utils";
import type { SavingsTransaction } from "@/lib/types";

export function TransactionList({ transactions }: { transactions: SavingsTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-zinc-400">
          No deposits or withdrawals yet. Starting cash is already counted.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-zinc-400">Cash log</h2>
      {transactions.map((tx) => (
        <Card key={tx.id}>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle className="text-sm">{tx.transaction_date}</CardTitle>
              {tx.notes && <p className="text-xs text-zinc-500">{tx.notes}</p>}
            </div>
            <Badge variant={tx.kind === "deposit" ? "success" : "warning"}>
              {tx.kind === "deposit" ? "Deposit" : "Withdrawal"}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className={tx.kind === "deposit" ? "text-emerald-400" : "text-amber-300"}>
              {tx.kind === "withdrawal" ? "−" : "+"}
              {formatCurrencyDetailed(Number(tx.amount))}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHeaderRow } from "@/components/ui/card-header-row";
import { Metric } from "@/components/ui/metric";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyDetailed } from "@/lib/utils";
import type { SavingsTransaction } from "@/lib/types";

export function TransactionList({ transactions }: { transactions: SavingsTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-body text-text-secondary">
          No deposits or withdrawals yet. Starting cash is already counted.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-label text-text-secondary">Cash log</h2>
      {transactions.map((tx) => (
        <Card key={tx.id}>
          <CardHeader>
            <CardHeaderRow
              action={
                <Badge variant={tx.kind === "deposit" ? "success" : "warning"}>
                  {tx.kind === "deposit" ? "Deposit" : "Withdrawal"}
                </Badge>
              }
            >
              <div>
                <CardTitle>{tx.transaction_date}</CardTitle>
                {tx.notes && <p className="text-caption text-text-tertiary">{tx.notes}</p>}
              </div>
            </CardHeaderRow>
          </CardHeader>
          <CardContent>
            <Metric className={tx.kind === "withdrawal" ? "text-warning" : undefined}>
              {tx.kind === "withdrawal" ? "−" : "+"}
              {formatCurrencyDetailed(Number(tx.amount))}
            </Metric>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

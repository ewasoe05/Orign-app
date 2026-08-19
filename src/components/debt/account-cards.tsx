import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHeaderRow } from "@/components/ui/card-header-row";
import { Metric } from "@/components/ui/metric";
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
          <CardHeader>
            <CardHeaderRow
              action={
                account.is_paid_off ? (
                  <Badge variant="success">Paid off</Badge>
                ) : (
                  <Badge>Priority {account.priority}</Badge>
                )
              }
            >
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
    </div>
  );
}

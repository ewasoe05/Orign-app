"use client";

import { useActionState } from "react";
import { logSavingsTransaction } from "@/lib/actions/savings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatLocalDate } from "@/lib/utils";

export function TransactionForm() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return logSavingsTransaction(formData);
    },
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log cash</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kind">Type</Label>
            <Select id="kind" name="kind" defaultValue="deposit" required>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="200.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transaction_date">Date</Label>
            <Input
              id="transaction_date"
              name="transaction_date"
              type="date"
              defaultValue={formatLocalDate()}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input id="notes" name="notes" placeholder="Paycheck extra, transfer, etc." />
          </div>
          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
          {state?.success && <p className="text-sm text-emerald-400">Cash logged.</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving..." : "Log transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

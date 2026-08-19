"use client";

import { useActionState } from "react";
import { logPayment } from "@/lib/actions/debt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DebtAccount } from "@/lib/types";

export function PaymentForm({ accounts }: { accounts: DebtAccount[] }) {
  const activeAccounts = accounts.filter((a) => !a.is_paid_off);

  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return logPayment(formData);
    },
    null,
  );

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account_id">Account</Label>
            <Select id="account_id" name="account_id" required defaultValue="">
              <option value="" disabled>
                Select account
              </option>
              {activeAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} (${Number(account.current_balance).toFixed(2)})
                </option>
              ))}
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
              placeholder="2000.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment_date">Date</Label>
            <Input id="payment_date" name="payment_date" type="date" defaultValue={today} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input id="notes" name="notes" placeholder="Extra payment, minimum, etc." />
          </div>
          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
          {state?.success && <p className="text-sm text-emerald-400">Payment logged!</p>}
          <Button type="submit" className="w-full" disabled={pending || activeAccounts.length === 0}>
            {pending ? "Saving..." : "Log payment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

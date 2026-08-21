"use client";

import { useActionState } from "react";
import {
  createPaycheckDebt,
  deletePaycheckDebt,
  nudgePaycheckDebtPriority,
  savePaycheckSettings,
  updatePaycheckDebt,
} from "@/lib/actions/paycheck";
import { Button } from "@/components/ui/button";
import { FormActions, FormSubmit } from "@/components/ui/form-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DebtAccount, PaycheckSettings } from "@/lib/types";
import { formatCurrencyDetailed } from "@/lib/utils";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

function MoneyField({
  id,
  name,
  label,
  defaultValue,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue: number;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        defaultValue={Number(defaultValue).toFixed(2)}
        required
      />
    </div>
  );
}

function DebtRow({ account, index, total }: { account: DebtAccount; index: number; total: number }) {
  const [updateState, updateAction, updatePending] = useActionState(updatePaycheckDebt, null);
  const [deleteState, deleteAction, deletePending] = useActionState(deletePaycheckDebt, null);
  const [nudgeState, nudgeAction, nudgePending] = useActionState(nudgePaycheckDebtPriority, null);

  return (
    <div className="space-y-3 rounded-md border border-border-subtle bg-surface-inset p-3">
      <form action={updateAction} className="space-y-3">
        <input type="hidden" name="id" value={account.id} />
        <div className="space-y-2">
          <Label htmlFor={`debt-name-${account.id}`}>Name</Label>
          <Input id={`debt-name-${account.id}`} name="name" defaultValue={account.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`debt-balance-${account.id}`}>Balance</Label>
          <Input
            id={`debt-balance-${account.id}`}
            name="balance"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            defaultValue={Number(account.current_balance).toFixed(2)}
            required
          />
        </div>
        {updateState?.error ? <p className="text-caption text-danger">{updateState.error}</p> : null}
        <Button type="submit" size="sm" variant="secondary" loading={updatePending}>
          Save account
        </Button>
      </form>
      <div className="flex flex-wrap gap-2">
        <form action={nudgeAction}>
          <input type="hidden" name="id" value={account.id} />
          <input type="hidden" name="direction" value="up" />
          <Button
            type="submit"
            size="icon"
            variant="outline"
            loading={nudgePending}
            disabled={index === 0}
            aria-label="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </form>
        <form action={nudgeAction}>
          <input type="hidden" name="id" value={account.id} />
          <input type="hidden" name="direction" value="down" />
          <Button
            type="submit"
            size="icon"
            variant="outline"
            loading={nudgePending}
            disabled={index === total - 1}
            aria-label="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </form>
        <form action={deleteAction}>
          <input type="hidden" name="id" value={account.id} />
          <Button type="submit" size="icon" variant="destructive" loading={deletePending} aria-label="Remove account">
            <Trash2 className="h-4 w-4" />
          </Button>
        </form>
      </div>
      {deleteState?.error ? <p className="text-caption text-danger">{deleteState.error}</p> : null}
      {nudgeState?.error ? <p className="text-caption text-danger">{nudgeState.error}</p> : null}
    </div>
  );
}

export function PaycheckSettingsPanel({
  settings,
  accounts,
}: {
  settings: PaycheckSettings;
  accounts: DebtAccount[];
}) {
  const [state, action, pending] = useActionState(savePaycheckSettings, null);
  const [addState, addAction, addPending] = useActionState(createPaycheckDebt, null);
  const unconfirmed = !settings.confirmed;

  return (
    <details
      className="group rounded-lg border border-border-subtle bg-surface"
      open={unconfirmed ? true : undefined}
    >
      <summary className="cursor-pointer list-none p-4 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-title text-text-primary">Settings</p>
            <p className="mt-1 text-caption text-text-secondary">
              All the thinking happens here. The route button just applies these rules.
            </p>
          </div>
          <span className="text-caption text-text-tertiary group-open:hidden">Show</span>
          <span className="hidden text-caption text-text-tertiary group-open:inline">Hide</span>
        </div>
      </summary>
      <div className="space-y-6 border-t border-border-subtle px-4 pb-4 pt-4">
        {unconfirmed ? (
          <p className="rounded-md border border-warning/40 bg-amber-900/30 px-3 py-2 text-body text-amber-200">
            Confirm these numbers match your real accounts before routing your first paycheck.
          </p>
        ) : null}

        <form action={action} className="space-y-4">
          <MoneyField
            id="essentials_per_check"
            name="essentials_per_check"
            label="Essentials per paycheck"
            defaultValue={Number(settings.essentials_per_check)}
          />
          <MoneyField
            id="extra_target"
            name="extra_target"
            label="Amount to the plan per paycheck"
            defaultValue={Number(settings.extra_target)}
          />
          <MoneyField
            id="hysa_goal"
            name="hysa_goal"
            label="Savings goal"
            defaultValue={Number(settings.hysa_goal)}
          />
          <MoneyField
            id="hysa_balance"
            name="hysa_balance"
            label="Current savings balance"
            defaultValue={Number(settings.hysa_balance)}
          />
          <MoneyField
            id="emergency_fund_target"
            name="emergency_fund_target"
            label="Emergency fund target"
            defaultValue={Number(settings.emergency_fund_target)}
          />
          <div className="space-y-2">
            <Label htmlFor="fun_percent">Default fun percent</Label>
            <Input
              id="fun_percent"
              name="fun_percent"
              type="number"
              min={0}
              max={100}
              step={1}
              defaultValue={Number(settings.fun_percent)}
              required
            />
            <p className="text-caption text-text-secondary">
              The per-paycheck dial starts here every time. Changing this does not rewrite past receipts.
            </p>
            {Number(settings.fun_allocated_total) > 0 ? (
              <p className="text-caption text-text-secondary">
                Fun money allocated over time: {formatCurrencyDetailed(Number(settings.fun_allocated_total))}
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="milestone_mid_percent">Halfway checkpoint %</Label>
              <Input
                id="milestone_mid_percent"
                name="milestone_mid_percent"
                type="number"
                min={0}
                max={100}
                step={1}
                defaultValue={Number(settings.milestone_mid_percent)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestone_near_percent">Near-goal checkpoint %</Label>
              <Input
                id="milestone_near_percent"
                name="milestone_near_percent"
                type="number"
                min={0}
                max={100}
                step={1}
                defaultValue={Number(settings.milestone_near_percent)}
                required
              />
            </div>
          </div>
          {state?.error ? <p className="text-caption text-danger">{state.error}</p> : null}
          {state?.success ? (
            <p className="text-caption text-accent-muted">Settings saved. The next paycheck will use these numbers.</p>
          ) : null}
          <FormActions>
            <FormSubmit loading={pending}>{unconfirmed ? "Confirm numbers" : "Save settings"}</FormSubmit>
          </FormActions>
        </form>

        <div className="space-y-3">
          <p className="text-label text-text-secondary">Debt accounts</p>
          <p className="text-caption text-text-secondary">
            Payoff order is yours — up/down, not automatic avalanche or snowball. Routing always uses this list.
          </p>
          {accounts.map((account, index) => (
            <DebtRow key={account.id} account={account} index={index} total={accounts.length} />
          ))}
          <form action={addAction} className="space-y-3 rounded-md border border-dashed border-border-strong p-3">
            <p className="text-body text-text-primary">Add account</p>
            <div className="space-y-2">
              <Label htmlFor="new-debt-name">Name</Label>
              <Input id="new-debt-name" name="name" placeholder="Card name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-debt-balance">Balance</Label>
              <Input
                id="new-debt-balance"
                name="balance"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />
            </div>
            {addState?.error ? <p className="text-caption text-danger">{addState.error}</p> : null}
            <Button type="submit" size="sm" variant="secondary" loading={addPending}>
              Add account
            </Button>
          </form>
        </div>
      </div>
    </details>
  );
}

"use client";

import { useActionState, useMemo, useState } from "react";
import { routePaycheckAction } from "@/lib/actions/paycheck";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormActions, FormSubmit } from "@/components/ui/form-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clampFunPercent, previewFunSplit, type RouterSettings } from "@/lib/paycheck-router";
import { formatCurrencyDetailed, formatLocalDate } from "@/lib/utils";
import type { PaycheckSettings } from "@/lib/types";

function toRouterSettings(settings: PaycheckSettings): RouterSettings {
  return {
    essentialsPerCheck: Number(settings.essentials_per_check),
    extraTarget: Number(settings.extra_target),
    hysaGoal: Number(settings.hysa_goal),
    hysaBalance: Number(settings.hysa_balance),
    unsweptBuffer: Number(settings.unswept_buffer),
    funPercent: Number(settings.fun_percent),
    funAllocatedTotal: Number(settings.fun_allocated_total),
    emergencyFundTarget: Number(settings.emergency_fund_target),
    milestoneMidPercent: Number(settings.milestone_mid_percent),
    milestoneNearPercent: Number(settings.milestone_near_percent),
  };
}

export function PaycheckRouteForm({ settings }: { settings: PaycheckSettings }) {
  const [state, action, pending] = useActionState(routePaycheckAction, null);
  const [amount, setAmount] = useState("");
  const [funPercent, setFunPercent] = useState(clampFunPercent(Number(settings.fun_percent)));

  const parsedAmount = Number(amount);
  const preview = useMemo(() => {
    const value = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 0;
    return previewFunSplit(value, toRouterSettings(settings), funPercent);
  }, [parsedAmount, settings, funPercent]);

  const blocked = !settings.confirmed;
  const invalidAmount = amount.trim() !== "" && (!(parsedAmount > 0) || !Number.isFinite(parsedAmount));

  return (
    <Card elevated>
      <CardHeader>
        <CardTitle>Route a paycheck</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Paycheck amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              placeholder="2000.00"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              disabled={blocked}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entry_date">Date</Label>
            <Input
              id="entry_date"
              name="entry_date"
              type="date"
              defaultValue={formatLocalDate()}
              required
              disabled={blocked}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-end justify-between gap-3">
              <Label htmlFor="fun_percent_override">This paycheck</Label>
              <span className="text-caption text-text-tertiary">{funPercent}%</span>
            </div>
            <input
              id="fun_percent_override"
              name="fun_percent_override"
              type="range"
              min={0}
              max={100}
              step={1}
              value={funPercent}
              onChange={(event) => setFunPercent(clampFunPercent(Number(event.target.value)))}
              className="w-full accent-accent"
              disabled={blocked}
            />
            <div className="flex justify-between text-caption text-text-secondary">
              <span>More debt-crushing</span>
              <span>More breathing room</span>
            </div>
            <p className="text-body text-text-primary">
              {formatCurrencyDetailed(preview.funAmount)} to fun · {formatCurrencyDetailed(preview.toPlan)} to
              the plan
            </p>
          </div>
          {invalidAmount ? (
            <p className="text-caption text-danger">Enter a positive dollar amount.</p>
          ) : null}
          {blocked ? (
            <p className="text-caption text-warning">
              Confirm your numbers in Settings before routing the first paycheck.
            </p>
          ) : null}
          {state?.error ? <p className="text-caption text-danger">{state.error}</p> : null}
          {state?.success ? (
            <p className="text-caption text-accent-muted">Routed. Receipt is below.</p>
          ) : null}
          <FormActions>
            <FormSubmit loading={pending} disabled={blocked || invalidAmount}>
              Route this paycheck
            </FormSubmit>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}

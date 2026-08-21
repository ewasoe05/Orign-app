"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDebtAccounts } from "@/lib/actions/debt";
import { getCashOnHand, getSavingsSettings } from "@/lib/actions/savings";
import { upsertHabitLevel } from "@/lib/actions/habits";
import { contiguousPriorities } from "@/lib/debt-priority";
import { isMissingRelation } from "@/lib/supabase/errors";
import { dollarsToCents, centsToDollars } from "@/lib/projection";
import { formatLocalDate } from "@/lib/utils";
import {
  clampFunPercent,
  phase,
  routePaycheck,
  sweepBuffer,
  totalDebt,
  type RoutePaycheckResult,
  type RouterDebt,
  type RouterSettings,
} from "@/lib/paycheck-router";
import { seedPaycheckData } from "@/lib/paycheck-seed";
import {
  DEFAULT_FUN_PERCENT,
  DOWN_PAYMENT_TARGET,
  EMERGENCY_FUND_TARGET,
  ESSENTIALS_PER_CHECK,
  EXTRA_TARGET_PER_CHECK,
  MILESTONE_MID_PERCENT,
  MILESTONE_NEAR_PERCENT,
  SAVINGS_STARTING_CASH,
} from "@/lib/seed";
import type {
  DebtAccount,
  PaycheckEntry,
  PaycheckLine,
  PaycheckSettings,
  PaycheckPhase,
} from "@/lib/types";

export const PAYCHECK_HISTORY_LIMIT = 12;

type ActionResult = {
  error?: string;
  success?: boolean;
  noOp?: boolean;
  lines?: PaycheckLine[];
  milestone?: string | null;
};

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

function revalidatePaycheck() {
  revalidatePath("/");
  revalidatePath("/paycheck");
  revalidatePath("/debt");
  revalidatePath("/savings");
  revalidatePath("/plan");
}

function money(value: number): number {
  return centsToDollars(dollarsToCents(value));
}

function parseMoney(value: FormDataEntryValue | null, { allowZero = true } = {}): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < 0) return null;
  if (!allowZero && parsed <= 0) return null;
  return money(parsed);
}

function parseDate(value: FormDataEntryValue | null): string {
  const raw = String(value ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return formatLocalDate();
}

function parseLines(value: unknown): PaycheckLine[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const type = row.type;
    if (type !== "hold" && type !== "fun" && type !== "debt" && type !== "save") return [];
    const amount = Number(row.amount);
    if (!Number.isFinite(amount)) return [];
    return [
      {
        label: String(row.label ?? ""),
        amount,
        type,
        subLabel: typeof row.subLabel === "string" ? row.subLabel : undefined,
        accountId: typeof row.accountId === "string" ? row.accountId : undefined,
        balanceAfter: typeof row.balanceAfter === "number" ? row.balanceAfter : undefined,
      },
    ];
  });
}

function toRouterDebts(accounts: DebtAccount[]): RouterDebt[] {
  return accounts.map((account) => ({
    id: account.id,
    name: account.name,
    balance: Number(account.current_balance),
    order: account.priority,
  }));
}

function toRouterSettings(settings: PaycheckSettings): RouterSettings {
  return {
    essentialsPerCheck: Number(settings.essentials_per_check),
    extraTarget: Number(settings.extra_target),
    hysaGoal: Number(settings.hysa_goal),
    hysaBalance: Number(settings.hysa_balance),
    unsweptBuffer: Number(settings.unswept_buffer),
    funPercent: clampFunPercent(Number(settings.fun_percent)),
    funAllocatedTotal: Number(settings.fun_allocated_total),
    emergencyFundTarget: Number(settings.emergency_fund_target),
    milestoneMidPercent: Number(settings.milestone_mid_percent),
    milestoneNearPercent: Number(settings.milestone_near_percent),
  };
}

function defaultPaycheckSettings(hysaGoal: number, hysaBalance: number): PaycheckSettings {
  return {
    id: "",
    user_id: "",
    essentials_per_check: ESSENTIALS_PER_CHECK,
    extra_target: EXTRA_TARGET_PER_CHECK,
    unswept_buffer: 0,
    confirmed: false,
    fun_percent: DEFAULT_FUN_PERCENT,
    fun_allocated_total: 0,
    emergency_fund_target: EMERGENCY_FUND_TARGET,
    milestone_mid_percent: MILESTONE_MID_PERCENT,
    milestone_near_percent: MILESTONE_NEAR_PERCENT,
    created_at: new Date().toISOString(),
    hysa_goal: hysaGoal,
    hysa_balance: hysaBalance,
  };
}

async function applyPriorityAssignments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  accountIds: string[],
) {
  const assignments = contiguousPriorities(accountIds);
  for (const { id, priority } of assignments) {
    const { error } = await supabase
      .from("debt_accounts")
      .update({ priority: priority + 1000 })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) return { error: error.message };
  }
  for (const { id, priority } of assignments) {
    const { error } = await supabase
      .from("debt_accounts")
      .update({ priority })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) return { error: error.message };
  }
  return { success: true as const };
}

async function loadHydratedSettings(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  settings: PaycheckSettings;
  accounts: DebtAccount[];
  cashOnHand: number;
  downPaymentTarget: number;
}> {
  const { supabase, userId } = await getUserId();
  await seedPaycheckData(supabase, userId);

  const [rowResult, accounts, cashOnHand, savings] = await Promise.all([
    supabase.from("paycheck_settings").select("*").eq("user_id", userId).maybeSingle(),
    getDebtAccounts(),
    getCashOnHand(),
    getSavingsSettings(),
  ]);

  if (rowResult.error && !isMissingRelation(rowResult.error)) {
    throw rowResult.error;
  }

  const downPaymentTarget = Number(savings?.down_payment_target ?? DOWN_PAYMENT_TARGET);
  const settings = rowResult.data
    ? {
        ...(rowResult.data as Omit<PaycheckSettings, "hysa_goal" | "hysa_balance">),
        hysa_goal: downPaymentTarget,
        hysa_balance: cashOnHand,
      }
    : defaultPaycheckSettings(downPaymentTarget, cashOnHand);

  return { supabase, userId, settings, accounts, cashOnHand, downPaymentTarget };
}

export async function getPaycheckPageData(): Promise<{
  settings: PaycheckSettings;
  accounts: DebtAccount[];
  entries: PaycheckEntry[];
  phase: PaycheckPhase;
  debtLeft: number;
}> {
  const { supabase, userId, settings, accounts } = await loadHydratedSettings();
  const { data, error } = await supabase
    .from("paycheck_entries")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(PAYCHECK_HISTORY_LIMIT);

  if (error && !isMissingRelation(error)) throw error;

  const entries = ((data ?? []) as Array<Omit<PaycheckEntry, "lines"> & { lines: unknown }>).map(
    (entry) => ({
      ...entry,
      lines: parseLines(entry.lines),
    }),
  );

  const routerDebts = toRouterDebts(accounts);
  return {
    settings,
    accounts,
    entries,
    phase: phase(routerDebts),
    debtLeft: totalDebt(routerDebts),
  };
}

export async function getPaycheckSnapshot(): Promise<{
  settings: PaycheckSettings;
  phase: PaycheckPhase;
  debtLeft: number;
}> {
  const { settings, accounts } = await loadHydratedSettings();
  const routerDebts = toRouterDebts(accounts);
  return {
    settings,
    phase: phase(routerDebts),
    debtLeft: totalDebt(routerDebts),
  };
}

function changedDebtUpdates(original: DebtAccount[], next: RouterDebt[]) {
  const previous = new Map(original.map((account) => [account.id, account]));
  return next.flatMap((debt) => {
    const row = previous.get(debt.id);
    if (!row) return [];
    const nextCents = dollarsToCents(debt.balance);
    const prevCents = dollarsToCents(Number(row.current_balance));
    const paidOff = nextCents <= 0;
    if (prevCents === nextCents && Boolean(row.is_paid_off) === paidOff) return [];
    return [
      {
        id: debt.id,
        current_balance: debt.balance,
        is_paid_off: paidOff,
      },
    ];
  });
}

async function persistResult(
  result: RoutePaycheckResult,
  date: string,
  notes: string,
  originalAccounts: DebtAccount[],
): Promise<ActionResult> {
  if (result.noOp) {
    return { success: true, noOp: true, lines: [], milestone: null };
  }

  const { supabase } = await getUserId();
  const savingsDeposit =
    dollarsToCents(result.savingsDeposit) > 0
      ? {
          amount: result.savingsDeposit,
          transaction_date: date,
          notes,
        }
      : null;

  const { error } = await supabase.rpc("apply_paycheck_result", {
    payload: {
      entry: {
        kind: result.kind,
        entry_date: date,
        amount: result.amount,
        essentials: result.essentials,
        to_plan: result.toPlan,
        fun_amount: result.funAmount,
        fun_percent_used: result.funPercentUsed,
        leftover: result.leftover,
        milestone: result.milestone,
        lines: result.lines,
      },
      debt_updates: changedDebtUpdates(originalAccounts, result.debts),
      debt_payments: result.debtPayments
        .filter((payment) => dollarsToCents(payment.amount) > 0)
        .map((payment) => ({
          account_id: payment.accountId,
          amount: payment.amount,
          payment_date: date,
          notes,
        })),
      savings_deposit: savingsDeposit,
      settings: {
        unswept_buffer: result.settings.unsweptBuffer,
        fun_allocated_total: result.settings.funAllocatedTotal,
      },
    },
  });

  if (error) {
    if (isMissingRelation(error)) {
      return { error: "Paycheck tables are not set up yet. Apply the latest database migration." };
    }
    return { error: error.message };
  }

  await upsertHabitLevel("money", "full", date);
  revalidatePaycheck();
  return {
    success: true,
    lines: result.lines,
    milestone: result.milestone,
  };
}

export async function routePaycheckAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const amount = parseMoney(formData.get("amount"), { allowZero: false });
  if (amount == null) {
    return { error: "Enter a valid paycheck amount." };
  }

  const date = parseDate(formData.get("entry_date"));
  const overrideRaw = String(formData.get("fun_percent_override") ?? "").trim();
  const funPercentOverride = overrideRaw === "" ? null : clampFunPercent(Number(overrideRaw));

  const { settings, accounts } = await loadHydratedSettings();
  if (!settings.confirmed) {
    return { error: "Confirm your numbers in Settings before routing a paycheck." };
  }
  if (!settings.id) {
    return { error: "Paycheck settings are missing. Refresh and try again." };
  }

  const result = routePaycheck({
    amount,
    settings: toRouterSettings(settings),
    debts: toRouterDebts(accounts),
    funPercentOverride,
  });

  return persistResult(result, date, "Paycheck routing", accounts);
}

export async function sweepBufferAction(
  prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  void prev;
  void formData;
  const { settings, accounts } = await loadHydratedSettings();
  if (!settings.confirmed) {
    return { error: "Confirm your numbers in Settings before sweeping." };
  }
  if (!settings.id) {
    return { error: "Paycheck settings are missing. Refresh and try again." };
  }

  const result = sweepBuffer({
    settings: toRouterSettings(settings),
    debts: toRouterDebts(accounts),
  });

  if (result.noOp) {
    return { success: true, noOp: true };
  }

  return persistResult(result, formatLocalDate(), "Buffer sweep", accounts);
}

export async function savePaycheckSettings(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const essentials = parseMoney(formData.get("essentials_per_check"));
  const extraTarget = parseMoney(formData.get("extra_target"));
  const hysaGoal = parseMoney(formData.get("hysa_goal"));
  const hysaBalance = parseMoney(formData.get("hysa_balance"));
  const emergencyFund = parseMoney(formData.get("emergency_fund_target"));
  const funPercent = clampFunPercent(Number(formData.get("fun_percent")));
  const midPercent = clampFunPercent(Number(formData.get("milestone_mid_percent")));
  const nearPercent = clampFunPercent(Number(formData.get("milestone_near_percent")));

  if (
    essentials == null ||
    extraTarget == null ||
    hysaGoal == null ||
    hysaBalance == null ||
    emergencyFund == null
  ) {
    return { error: "Enter valid dollar amounts for every money field." };
  }

  const { supabase, userId, settings, cashOnHand } = await loadHydratedSettings();
  if (!settings.id) {
    await seedPaycheckData(supabase, userId);
  }

  const { error: settingsError } = await supabase.from("paycheck_settings").upsert(
    {
      user_id: userId,
      essentials_per_check: essentials,
      extra_target: extraTarget,
      unswept_buffer: Number(settings.unswept_buffer),
      fun_allocated_total: Number(settings.fun_allocated_total),
      confirmed: true,
      fun_percent: funPercent,
      emergency_fund_target: emergencyFund,
      milestone_mid_percent: midPercent,
      milestone_near_percent: nearPercent,
    },
    { onConflict: "user_id" },
  );

  if (settingsError) {
    return { error: settingsError.message };
  }

  const savings = await getSavingsSettings();
  const starting = Number(savings?.starting_cash ?? SAVINGS_STARTING_CASH);
  const startingCents = dollarsToCents(starting);
  const desiredCents = dollarsToCents(hysaBalance);
  const currentCents = dollarsToCents(cashOnHand);
  const nextStarting = centsToDollars(startingCents + desiredCents - currentCents);

  const { error: savingsError } = await supabase.from("savings_settings").upsert(
    {
      user_id: userId,
      starting_cash: nextStarting,
      down_payment_target: hysaGoal,
    },
    { onConflict: "user_id" },
  );

  if (savingsError) {
    return { error: savingsError.message };
  }

  revalidatePaycheck();
  return { success: true };
}

export async function createPaycheckDebt(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const balance = parseMoney(formData.get("balance"));
  if (!name) return { error: "Name is required." };
  if (balance == null) return { error: "Enter a valid balance." };

  const { supabase, userId, accounts } = await loadHydratedSettings();
  const maxPriority = accounts.reduce((max, account) => Math.max(max, account.priority), 0);

  const { error } = await supabase.from("debt_accounts").insert({
    user_id: userId,
    name,
    initial_balance: balance,
    current_balance: balance,
    interest_rate: null,
    min_payment: null,
    due_day_of_month: 15,
    priority: maxPriority + 1,
    is_paid_off: dollarsToCents(balance) <= 0,
  });

  if (error) return { error: error.message };
  revalidatePaycheck();
  return { success: true };
}

export async function updatePaycheckDebt(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const balance = parseMoney(formData.get("balance"));
  if (!id) return { error: "Missing account." };
  if (!name) return { error: "Name is required." };
  if (balance == null) return { error: "Enter a valid balance." };

  const { supabase, userId } = await getUserId();
  const { error } = await supabase
    .from("debt_accounts")
    .update({
      name,
      current_balance: balance,
      is_paid_off: dollarsToCents(balance) <= 0,
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  revalidatePaycheck();
  return { success: true };
}

export async function deletePaycheckDebt(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing account." };

  const { supabase, userId, accounts } = await loadHydratedSettings();
  const { error } = await supabase.from("debt_accounts").delete().eq("id", id).eq("user_id", userId);
  if (error) return { error: error.message };

  const remainingIds = accounts.filter((account) => account.id !== id).map((account) => account.id);
  if (remainingIds.length) {
    const reindex = await applyPriorityAssignments(supabase, userId, remainingIds);
    if (reindex.error) return reindex;
  }

  revalidatePaycheck();
  return { success: true };
}

export async function nudgePaycheckDebtPriority(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  const direction = String(formData.get("direction") ?? "");
  if (!id) return { error: "Missing account." };
  if (direction !== "up" && direction !== "down") return { error: "Invalid direction." };

  const { supabase, userId, accounts } = await loadHydratedSettings();
  const ids = accounts.map((account) => account.id);
  const index = ids.indexOf(id);
  if (index < 0) return { error: "Account not found." };

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= ids.length) {
    return { success: true };
  }

  const next = [...ids];
  [next[index], next[swapWith]] = [next[swapWith], next[index]];
  const reindex = await applyPriorityAssignments(supabase, userId, next);
  if (reindex.error) return reindex;

  revalidatePaycheck();
  return { success: true };
}

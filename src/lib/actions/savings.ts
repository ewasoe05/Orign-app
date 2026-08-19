"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SavingsSettings, SavingsSummary, SavingsTransaction } from "@/lib/types";
import { DOWN_PAYMENT_TARGET, SAVINGS_MILESTONES, SAVINGS_STARTING_CASH } from "@/lib/seed";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

function revalidateSavings() {
  revalidatePath("/");
  revalidatePath("/savings");
  revalidatePath("/review");
}

export async function getSavingsSettings(): Promise<SavingsSettings | null> {
  const { supabase, userId } = await getUserId();
  const { data, error } = await supabase
    .from("savings_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as SavingsSettings | null;
}

export async function getSavingsTransactions(): Promise<SavingsTransaction[]> {
  const { supabase, userId } = await getUserId();
  const { data, error } = await supabase
    .from("savings_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SavingsTransaction[];
}

export async function getCashOnHand(): Promise<number> {
  const [settings, transactions] = await Promise.all([
    getSavingsSettings(),
    getSavingsTransactions(),
  ]);
  const starting = Number(settings?.starting_cash ?? SAVINGS_STARTING_CASH);
  const delta = transactions.reduce((sum, tx) => {
    const amount = Number(tx.amount);
    return tx.kind === "withdrawal" ? sum - amount : sum + amount;
  }, 0);
  return starting + delta;
}

export async function getSavingsSummary(): Promise<SavingsSummary> {
  const [settings, cashOnHand] = await Promise.all([getSavingsSettings(), getCashOnHand()]);
  const startingCash = Number(settings?.starting_cash ?? SAVINGS_STARTING_CASH);
  const downPaymentTarget = Number(settings?.down_payment_target ?? DOWN_PAYMENT_TARGET);
  const remainingToDownPayment = Math.max(0, downPaymentTarget - cashOnHand);
  const progress = downPaymentTarget > 0 ? (cashOnHand / downPaymentTarget) * 100 : 0;
  const nextMilestone =
    SAVINGS_MILESTONES.find((milestone) => cashOnHand < milestone.amount) ??
    SAVINGS_MILESTONES[SAVINGS_MILESTONES.length - 1];

  return {
    cashOnHand,
    startingCash,
    downPaymentTarget,
    remainingToDownPayment,
    progress: Math.min(100, Math.max(0, progress)),
    nextMilestone: cashOnHand >= SAVINGS_MILESTONES[SAVINGS_MILESTONES.length - 1].amount
      ? null
      : { ...nextMilestone },
  };
}

export async function logSavingsTransaction(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const amount = parseFloat(String(formData.get("amount")));
  const kind = String(formData.get("kind"));
  const transactionDate = String(formData.get("transaction_date"));
  const notes = String(formData.get("notes") ?? "") || null;

  if (isNaN(amount) || amount <= 0) {
    return { error: "Enter a valid amount" };
  }
  if (kind !== "deposit" && kind !== "withdrawal") {
    return { error: "Choose deposit or withdrawal" };
  }
  if (!transactionDate) {
    return { error: "Date is required" };
  }

  const { error } = await supabase.from("savings_transactions").insert({
    user_id: userId,
    amount,
    kind,
    transaction_date: transactionDate,
    notes,
  });

  if (error) return { error: error.message };

  revalidateSavings();
  return { success: true };
}

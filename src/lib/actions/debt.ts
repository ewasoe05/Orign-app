"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DebtAccount, DebtPayment } from "@/lib/types";
import { upsertHabitLevel } from "@/lib/actions/habits";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function getDebtAccounts(): Promise<DebtAccount[]> {
  const { supabase, userId } = await getUserId();
  const { data, error } = await supabase
    .from("debt_accounts")
    .select("*")
    .eq("user_id", userId)
    .order("priority", { ascending: true })
    .order("current_balance", { ascending: true });

  if (error) throw error;
  return (data ?? []) as DebtAccount[];
}

export async function getDebtPayments(): Promise<DebtPayment[]> {
  const { supabase, userId } = await getUserId();
  const { data, error } = await supabase
    .from("debt_payments")
    .select("*")
    .eq("user_id", userId)
    .order("payment_date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DebtPayment[];
}

export async function getTotalDebt(): Promise<number> {
  const accounts = await getDebtAccounts();
  return accounts.reduce((sum, account) => sum + Number(account.current_balance), 0);
}

export async function logPayment(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const accountId = String(formData.get("account_id"));
  const amount = parseFloat(String(formData.get("amount")));
  const paymentDate = String(formData.get("payment_date"));
  const notes = String(formData.get("notes") ?? "") || null;

  if (!accountId || isNaN(amount) || amount <= 0) {
    return { error: "Invalid payment data" };
  }

  const { data: account, error: accountError } = await supabase
    .from("debt_accounts")
    .select("*")
    .eq("id", accountId)
    .eq("user_id", userId)
    .single();

  if (accountError || !account) {
    return { error: "Account not found" };
  }

  const { error: paymentError } = await supabase.from("debt_payments").insert({
    user_id: userId,
    account_id: accountId,
    amount,
    payment_date: paymentDate,
    notes,
  });

  if (paymentError) {
    return { error: paymentError.message };
  }

  const newBalance = Math.max(0, Number(account.current_balance) - amount);
  const { error: updateError } = await supabase
    .from("debt_accounts")
    .update({
      current_balance: newBalance,
      is_paid_off: newBalance === 0,
    })
    .eq("id", accountId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/");
  revalidatePath("/debt");
  revalidatePath("/savings");
  await upsertHabitLevel("money", "full", paymentDate);
  return { success: true };
}

export async function getMonthlyPayments(year: number, month: number): Promise<number> {
  const { supabase, userId } = await getUserId();
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const end = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("debt_payments")
    .select("amount")
    .eq("user_id", userId)
    .gte("payment_date", start)
    .lt("payment_date", end);

  if (error) throw error;
  return (data ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
}

export async function getUserSettings() {
  const { supabase, userId } = await getUserId();
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

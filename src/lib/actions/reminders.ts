"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDebtAccounts, getMonthlyPayments, getUserSettings } from "@/lib/actions/debt";
import { getHabitFloorStatuses } from "@/lib/actions/habits";
import { getFollowUpQueue } from "@/lib/actions/business";
import { getWeeklyReviews } from "@/lib/actions/review";
import { getQuarterlyReviews } from "@/lib/actions/quarterly";
import { getTotalDebt } from "@/lib/actions/debt";
import { MONTHLY_DEBT_TARGET, PLAN_START_DATE } from "@/lib/seed";
import { isMissingRelation } from "@/lib/supabase/errors";
import type { RemindersContext } from "@/lib/types";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function getReminderDismissals(): Promise<{ reminder_key: string; scope: string }[]> {
  const { supabase, userId } = await getUserId();
  const { data, error } = await supabase
    .from("reminder_dismissals")
    .select("reminder_key, scope")
    .eq("user_id", userId);

  if (error) {
    if (isMissingRelation(error)) return [];
    throw error;
  }

  return data ?? [];
}

export async function dismissReminder(reminderKey: string, scope: string) {
  const { supabase, userId } = await getUserId();

  const { error } = await supabase.from("reminder_dismissals").upsert(
    {
      user_id: userId,
      reminder_key: reminderKey,
      scope,
    },
    { onConflict: "user_id,reminder_key,scope" },
  );

  if (error) {
    if (isMissingRelation(error)) return { error: "Reminders not available yet" };
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/debt");
  return { success: true };
}

export async function getRemindersContext(): Promise<RemindersContext> {
  const now = new Date();
  const [
    dismissals,
    habits,
    followUps,
    paidThisMonth,
    settings,
    totalDebt,
    reviews,
    quarterlyReviews,
    accounts,
  ] = await Promise.all([
    getReminderDismissals(),
    getHabitFloorStatuses(),
    getFollowUpQueue(),
    getMonthlyPayments(now.getFullYear(), now.getMonth() + 1),
    getUserSettings(),
    getTotalDebt(),
    getWeeklyReviews(),
    getQuarterlyReviews(),
    getDebtAccounts(),
  ]);

  return {
    dismissals,
    habits,
    followUps,
    paidThisMonth,
    debtTarget: Number(settings?.monthly_debt_target ?? MONTHLY_DEBT_TARGET),
    debtFree: totalDebt <= 0,
    reviews,
    quarterlyReviewQuarters: quarterlyReviews.map((review) => review.quarter),
    planStartDate: settings?.plan_start_date ?? PLAN_START_DATE,
    accounts: accounts.map((account) => ({
      name: account.name,
      due_day_of_month: account.due_day_of_month ?? null,
      is_paid_off: account.is_paid_off,
    })),
  };
}

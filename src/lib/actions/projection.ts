"use server";

import { createClient } from "@/lib/supabase/server";
import { getDebtAccounts, getDebtPayments } from "@/lib/actions/debt";
import { getPlanFacts } from "@/lib/actions/plan";
import { getCashOnHand } from "@/lib/actions/savings";
import { PLAN_START_DATE } from "@/lib/seed";
import { buildUserProjectionBundle, type UserProjectionBundle } from "@/lib/projection-bridge";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export async function getUserProjection(): Promise<UserProjectionBundle> {
  const userId = await getUserId();
  const supabase = await createClient();

  const [accounts, payments, facts, settings, cashOnHand] = await Promise.all([
    getDebtAccounts(),
    getDebtPayments(),
    getPlanFacts(),
    supabase.from("user_settings").select("plan_start_date").eq("user_id", userId).maybeSingle(),
    getCashOnHand(),
  ]);

  return buildUserProjectionBundle({
    accounts,
    payments,
    planStartDate: settings.data?.plan_start_date ?? PLAN_START_DATE,
    planFacts: facts,
    cashOnHand,
  });
}

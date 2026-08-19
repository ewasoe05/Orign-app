"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const allowedEmail = process.env.ALLOWED_EMAIL;
  if (allowedEmail && email.toLowerCase() !== allowedEmail.toLowerCase()) {
    return { error: "Signup is restricted. Contact the owner for access." };
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await seedUserData(data.user.id);
  }

  redirect("/");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await seedUserData(data.user.id);
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function seedUserData(userId: string) {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("user_settings")
    .select("seeded")
    .eq("user_id", userId)
    .maybeSingle();

  const { DEBT_ACCOUNTS_SEED, PLAN_START_DATE, MONTHLY_DEBT_TARGET, FITNESS_WEEKLY_TARGET } =
    await import("@/lib/seed");

  if (!settings?.seeded) {
    await supabase.from("user_settings").upsert(
      {
        user_id: userId,
        plan_start_date: PLAN_START_DATE,
        monthly_debt_target: MONTHLY_DEBT_TARGET,
        fitness_target: FITNESS_WEEKLY_TARGET,
        seeded: true,
      },
      { onConflict: "user_id" },
    );

    const { count } = await supabase
      .from("debt_accounts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (!count || count === 0) {
      await supabase.from("debt_accounts").insert(
        DEBT_ACCOUNTS_SEED.map((account) => ({
          user_id: userId,
          name: account.name,
          initial_balance: account.initial_balance,
          current_balance: account.initial_balance,
          interest_rate: account.interest_rate,
          priority: account.priority,
          is_paid_off: false,
        })),
      );
    }
  }

  const { seedFitnessData } = await import("@/lib/fitness-seed");
  await seedFitnessData(supabase, userId);

  const { seedPhase2Data } = await import("@/lib/phase2-seed");
  await seedPhase2Data(supabase, userId);
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { BodyLog, CreditLog, PlanChecklistItem, PlanFacts } from "@/lib/types";
import { PLAN_CHECKLIST } from "@/lib/seed";
import { formatLocalDate } from "@/lib/utils";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

function revalidatePlan() {
  revalidatePath("/");
  revalidatePath("/plan");
  revalidatePath("/debt");
  revalidatePath("/savings");
  revalidatePath("/business");
  revalidatePath("/fitness");
}

export async function getPlanChecklist(): Promise<PlanChecklistItem[]> {
  const { supabase, userId } = await getUserId();
  const { data, error } = await supabase
    .from("plan_checklist")
    .select("item_key, completed")
    .eq("user_id", userId);

  if (error) throw error;
  const done = new Set((data ?? []).filter((row) => row.completed).map((row) => row.item_key));

  return PLAN_CHECKLIST.map((item) => ({
    key: item.key,
    section: item.section,
    label: item.label,
    detail: item.detail,
    completed: done.has(item.key),
  }));
}

export async function togglePlanChecklist(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const itemKey = String(formData.get("item_key"));
  if (!PLAN_CHECKLIST.some((item) => item.key === itemKey)) {
    return { error: "Unknown checklist item" };
  }

  const { data: existing } = await supabase
    .from("plan_checklist")
    .select("id, completed")
    .eq("user_id", userId)
    .eq("item_key", itemKey)
    .maybeSingle();

  const next = !existing?.completed;

  if (existing) {
    const { error } = await supabase
      .from("plan_checklist")
      .update({ completed: next, completed_at: next ? new Date().toISOString() : null })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("plan_checklist").insert({
      user_id: userId,
      item_key: itemKey,
      completed: true,
      completed_at: new Date().toISOString(),
    });
    if (error) return { error: error.message };
  }

  revalidatePlan();
  return { success: true };
}

export async function getCreditLogs(): Promise<CreditLog[]> {
  const { supabase, userId } = await getUserId();
  const { data, error } = await supabase
    .from("credit_logs")
    .select("*")
    .eq("user_id", userId)
    .order("log_date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CreditLog[];
}

export async function logCreditScore(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const score = parseInt(String(formData.get("score")), 10);
  const logDate = String(formData.get("log_date") || formatLocalDate());
  const notes = String(formData.get("notes") ?? "") || null;

  if (isNaN(score) || score < 300 || score > 850) {
    return { error: "Enter a FICO score between 300 and 850" };
  }

  const { error } = await supabase.from("credit_logs").insert({
    user_id: userId,
    score,
    log_date: logDate,
    notes,
  });

  if (error) return { error: error.message };

  revalidatePlan();
  return { success: true };
}

export async function getBodyLogs(): Promise<BodyLog[]> {
  const { supabase, userId } = await getUserId();
  const { data, error } = await supabase
    .from("body_logs")
    .select("*")
    .eq("user_id", userId)
    .order("log_date", { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data ?? []) as BodyLog[];
}

export async function logBody(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const logDate = String(formData.get("log_date") || formatLocalDate());
  const weight = parseFloat(String(formData.get("weight_lbs") ?? ""));
  const protein = parseInt(String(formData.get("protein_grams") ?? ""), 10);
  const notes = String(formData.get("notes") ?? "") || null;

  const { error } = await supabase.from("body_logs").insert({
    user_id: userId,
    log_date: logDate,
    weight_lbs: isNaN(weight) ? null : weight,
    protein_grams: isNaN(protein) ? null : protein,
    notes,
  });

  if (error) return { error: error.message };

  revalidatePlan();
  return { success: true };
}

export async function getPlanFacts(): Promise<PlanFacts | null> {
  const { supabase, userId } = await getUserId();
  const { data, error } = await supabase
    .from("plan_facts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as PlanFacts | null;
}

export async function savePlanFacts(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const car = String(formData.get("expenses_include_car"));
  const employmentType = String(formData.get("employment_type") ?? "") || null;
  const years = parseFloat(String(formData.get("commission_years") ?? ""));
  const trade = String(formData.get("clear_solutions_trade") ?? "").trim() || null;

  const { error } = await supabase.from("plan_facts").upsert(
    {
      user_id: userId,
      expenses_include_car: car === "" ? null : car === "yes",
      employment_type: employmentType,
      commission_years: isNaN(years) ? null : years,
      clear_solutions_trade: trade,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) return { error: error.message };

  revalidatePlan();
  return { success: true };
}

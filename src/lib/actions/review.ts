"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { WeeklyReview } from "@/lib/types";
import { getTotalDebt } from "./debt";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function getWeeklyReviews(): Promise<WeeklyReview[]> {
  const { supabase, userId } = await getUserId();
  const { data, error } = await supabase
    .from("weekly_reviews")
    .select("*")
    .eq("user_id", userId)
    .order("review_date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as WeeklyReview[];
}

export async function getReviewDue(): Promise<boolean> {
  const now = new Date();
  const isSunday = now.getDay() === 0;
  if (!isSunday) return false;

  const reviews = await getWeeklyReviews();
  const today = now.toISOString().slice(0, 10);
  return !reviews.some((r) => r.review_date === today);
}

export async function submitReview(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const reviewDate = String(formData.get("review_date"));
  const debtTotal = String(formData.get("debt_total") ?? "");
  const trainingSessions = String(formData.get("training_sessions") ?? "");
  const leadsCloses = String(formData.get("leads_closes") ?? "");
  const doDifferently = String(formData.get("do_differently") ?? "");
  const howDoing = String(formData.get("how_doing") ?? "");

  const { error } = await supabase.from("weekly_reviews").insert({
    user_id: userId,
    review_date: reviewDate,
    debt_total: debtTotal,
    training_sessions: trainingSessions,
    leads_closes: leadsCloses,
    do_differently: doDifferently,
    how_doing: howDoing,
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/review");
  return { success: true };
}

export async function getReviewDefaults() {
  const [{ getWeeklySessionCount, hasFloorThisWeek }, { getBusinessWeekStats }, { getHabitFloorStatuses }] =
    await Promise.all([
      import("./fitness"),
      import("./business"),
      import("./habits"),
    ]);

  const [totalDebt, sessions, hasFloor, weekStats, habits] = await Promise.all([
    getTotalDebt(),
    getWeeklySessionCount(),
    hasFloorThisWeek(),
    getBusinessWeekStats(),
    getHabitFloorStatuses(),
  ]);

  const habitLine = habits
    .map((habit) => `${habit.name} ${habit.hitsThisWeek}/7`)
    .join(", ");
  const floorNote = hasFloor ? " Floor walk logged." : "";

  return {
    debtTotal: totalDebt.toFixed(2),
    reviewDate: new Date().toISOString().slice(0, 10),
    trainingSessions: `${sessions} training session${sessions === 1 ? "" : "s"} this week.${floorNote} Floors: ${habitLine}.`,
    leadsCloses: `${weekStats.leads} lead${weekStats.leads === 1 ? "" : "s"} / ${weekStats.closes} close${weekStats.closes === 1 ? "" : "s"} this week. Quoted $${weekStats.quoted.toFixed(0)}, won $${weekStats.won.toFixed(0)}.`,
  };
}

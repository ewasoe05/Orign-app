"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { QuarterlyReview, TrackStatus } from "@/lib/types";
import { formatLocalDate } from "@/lib/utils";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function getQuarterlyReviews(): Promise<QuarterlyReview[]> {
  const { supabase, userId } = await getUserId();
  const { data, error } = await supabase
    .from("quarterly_reviews")
    .select("*")
    .eq("user_id", userId)
    .order("review_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as QuarterlyReview[];
}

export async function submitQuarterlyReview(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const quarter = parseInt(String(formData.get("quarter")), 10);
  const reviewDate = String(formData.get("review_date") || formatLocalDate());
  const moneyStatus = String(formData.get("money_status")) as TrackStatus;
  const businessStatus = String(formData.get("business_status")) as TrackStatus;
  const bodyStatus = String(formData.get("body_status")) as TrackStatus;
  const whatChanged = String(formData.get("what_changed") ?? "") || null;
  const whatToAdjust = String(formData.get("what_to_adjust") ?? "") || null;

  if (isNaN(quarter) || quarter < 1 || quarter > 8) {
    return { error: "Pick a quarter (Q1–Q8)" };
  }
  const valid: TrackStatus[] = ["on_track", "behind"];
  if (!valid.includes(moneyStatus) || !valid.includes(businessStatus) || !valid.includes(bodyStatus)) {
    return { error: "Mark each pillar on track or behind" };
  }
  if (!whatChanged || !whatToAdjust) {
    return { error: "What changed and what to adjust are required" };
  }

  const { error } = await supabase.from("quarterly_reviews").insert({
    user_id: userId,
    quarter,
    review_date: reviewDate,
    money_status: moneyStatus,
    business_status: businessStatus,
    body_status: bodyStatus,
    what_changed: whatChanged,
    what_to_adjust: whatToAdjust,
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/quarterly");
  revalidatePath("/review");
  return { success: true };
}

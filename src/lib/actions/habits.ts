"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { HabitFloorStatus, HabitKey } from "@/lib/types";
import { HABIT_FLOORS } from "@/lib/seed";
import { addDaysIso, formatLocalDate, getWeekStartDate } from "@/lib/utils";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

function isHabitKey(value: string): value is HabitKey {
  return HABIT_FLOORS.some((floor) => floor.key === value);
}

function calcStreak(dates: Set<string>, today: string): number {
  const start = dates.has(today) ? today : addDaysIso(today, -1);
  if (!dates.has(start)) return 0;

  let streak = 0;
  let cursor = start;
  while (dates.has(cursor)) {
    streak += 1;
    cursor = addDaysIso(cursor, -1);
  }
  return streak;
}

export async function getHabitFloorStatuses(): Promise<HabitFloorStatus[]> {
  const { supabase, userId } = await getUserId();
  const today = formatLocalDate();
  const yesterday = addDaysIso(today, -1);
  const weekStart = getWeekStartDate();

  const { data, error } = await supabase
    .from("habit_checkins")
    .select("habit_key, checkin_date")
    .eq("user_id", userId)
    .order("checkin_date", { ascending: false });

  if (error) throw error;

  const byHabit = new Map<HabitKey, Set<string>>();
  for (const floor of HABIT_FLOORS) {
    byHabit.set(floor.key, new Set());
  }
  for (const row of data ?? []) {
    if (!isHabitKey(row.habit_key)) continue;
    byHabit.get(row.habit_key)?.add(row.checkin_date);
  }

  return HABIT_FLOORS.map((floor) => {
    const dates = byHabit.get(floor.key) ?? new Set<string>();
    const hitToday = dates.has(today);
    const missedYesterday = !dates.has(yesterday);
    return {
      key: floor.key,
      name: floor.name,
      description: floor.description,
      hitToday,
      missedYesterday,
      neverMissTwice: missedYesterday && !hitToday,
      streak: calcStreak(dates, today),
      hitsThisWeek: [...dates].filter((date) => date >= weekStart).length,
    };
  });
}

export async function toggleHabitFloor(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const habitKey = String(formData.get("habit_key"));
  if (!isHabitKey(habitKey)) {
    return { error: "Unknown habit" };
  }

  const today = formatLocalDate();
  const { data: existing } = await supabase
    .from("habit_checkins")
    .select("id")
    .eq("user_id", userId)
    .eq("habit_key", habitKey)
    .eq("checkin_date", today)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("habit_checkins").delete().eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("habit_checkins").insert({
      user_id: userId,
      habit_key: habitKey,
      checkin_date: today,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/review");
  return { success: true };
}

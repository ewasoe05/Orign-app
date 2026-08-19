"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { HabitFloorStatus, HabitKey, HabitLevel, HabitWeekDot } from "@/lib/types";
import { DAY_LABELS, HABIT_FLOORS } from "@/lib/seed";
import { addDaysIso, formatLocalDate, getWeekStartDate } from "@/lib/utils";
import { isMissingRelation } from "@/lib/supabase/errors";
import { calcHabitStreak, isHabitHit, neverMissTwice } from "@/lib/habit-streak";

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

function isHabitLevel(value: string): value is HabitLevel {
  return value === "full" || value === "floor" || value === "missed";
}

function revalidateHabits() {
  revalidatePath("/");
  revalidatePath("/review");
  revalidatePath("/fitness");
  revalidatePath("/debt");
  revalidatePath("/business");
}

function emptyStatuses(): HabitFloorStatus[] {
  const today = formatLocalDate();
  const weekStart = getWeekStartDate();
  return HABIT_FLOORS.map((floor) => ({
    key: floor.key,
    name: floor.name,
    description: floor.description,
    hitToday: false,
    todayLevel: null,
    missedYesterday: false,
    neverMissTwice: false,
    streak: 0,
    hitsThisWeek: 0,
    weekDots: weekDotsFor(new Map(), today, weekStart),
  }));
}

function weekDotsFor(
  levels: Map<string, HabitLevel>,
  today: string,
  weekStart: string,
): HabitWeekDot[] {
  return DAY_LABELS.map((label, index) => {
    const date = addDaysIso(weekStart, index);
    const level = levels.get(date);
    let status: HabitWeekDot["status"] = "unmarked";
    if (date > today) status = "future";
    else if (level === "full") status = "full";
    else if (level === "floor") status = "floor";
    else if (date < today || level === "missed") status = "miss";
    return { date, label, status };
  });
}

export async function upsertHabitLevel(
  habitKey: HabitKey,
  level: HabitLevel,
  date: string = formatLocalDate(),
) {
  const { supabase, userId } = await getUserId();
  const { error } = await supabase.from("habit_checkins").upsert(
    {
      user_id: userId,
      habit_key: habitKey,
      checkin_date: date,
      level,
    },
    { onConflict: "user_id,habit_key,checkin_date" },
  );

  if (error) {
    if (isMissingRelation(error)) return { error: error.message };
    return { error: error.message };
  }

  revalidateHabits();
  return { success: true };
}

export async function getHabitFloorStatuses(): Promise<HabitFloorStatus[]> {
  const { supabase, userId } = await getUserId();
  const today = formatLocalDate();
  const yesterday = addDaysIso(today, -1);
  const weekStart = getWeekStartDate();

  const { data, error } = await supabase
    .from("habit_checkins")
    .select("habit_key, checkin_date, level")
    .eq("user_id", userId)
    .order("checkin_date", { ascending: false });

  if (error) {
    if (isMissingRelation(error)) return emptyStatuses();
    throw error;
  }

  const byHabit = new Map<HabitKey, Map<string, HabitLevel>>();
  for (const floor of HABIT_FLOORS) {
    byHabit.set(floor.key, new Map());
  }
  for (const row of data ?? []) {
    if (!isHabitKey(row.habit_key)) continue;
    const level: HabitLevel =
      row.level === "full" || row.level === "floor" || row.level === "missed"
        ? row.level
        : "floor";
    byHabit.get(row.habit_key)?.set(row.checkin_date, level);
  }

  return HABIT_FLOORS.map((floor) => {
    const levels = byHabit.get(floor.key) ?? new Map<string, HabitLevel>();
    const todayLevel = levels.get(today) ?? null;
    return {
      key: floor.key,
      name: floor.name,
      description: floor.description,
      hitToday: isHabitHit(todayLevel ?? undefined),
      todayLevel,
      missedYesterday: !isHabitHit(levels.get(yesterday)),
      neverMissTwice: neverMissTwice(levels, today),
      streak: calcHabitStreak(levels, today),
      hitsThisWeek: [...levels.entries()].filter(
        ([date, level]) => date >= weekStart && date <= today && isHabitHit(level),
      ).length,
      weekDots: weekDotsFor(levels, today, weekStart),
    };
  });
}

export async function setHabitLevel(formData: FormData) {
  const habitKey = String(formData.get("habit_key"));
  const level = String(formData.get("level"));
  if (!isHabitKey(habitKey) || !isHabitLevel(level)) {
    return { error: "Unknown habit" };
  }

  const today = formatLocalDate();
  const { supabase, userId } = await getUserId();
  const { data: existing } = await supabase
    .from("habit_checkins")
    .select("id, level")
    .eq("user_id", userId)
    .eq("habit_key", habitKey)
    .eq("checkin_date", today)
    .maybeSingle();

  if (existing && existing.level === level) {
    const { error } = await supabase.from("habit_checkins").delete().eq("id", existing.id);
    if (error) return { error: error.message };
    revalidateHabits();
    return { success: true };
  }

  return upsertHabitLevel(habitKey, level, today);
}

export async function hasTrainingFloorThisWeek(): Promise<boolean> {
  const { supabase, userId } = await getUserId();
  const weekStart = getWeekStartDate();
  const { data, error } = await supabase
    .from("habit_checkins")
    .select("id")
    .eq("user_id", userId)
    .eq("habit_key", "training")
    .eq("level", "floor")
    .gte("checkin_date", weekStart)
    .limit(1);

  if (error) {
    if (isMissingRelation(error)) return false;
    throw error;
  }
  return (data?.length ?? 0) > 0;
}

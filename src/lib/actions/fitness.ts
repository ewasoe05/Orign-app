"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  FitnessDashboardSummary,
  LastLift,
  LiftEntry,
  PersonalRecord,
  RunEntry,
  WeeklyScheduleDay,
  Workout,
  WorkoutTemplate,
  WorkoutTemplateWithExercises,
  WorkoutWithDetails,
} from "@/lib/types";
import { DAY_LABELS, FITNESS_WEEKLY_TARGET, STRENGTH_TARGETS } from "@/lib/seed";
import { addDaysIso, getWeekStartDate } from "@/lib/utils";
import { upsertHabitLevel, hasTrainingFloorThisWeek, getHabitFloorStatuses } from "@/lib/actions/habits";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

function getWeekStart(): string {
  return getWeekStartDate();
}

function getTodayDayOfWeek(): number {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
}

function parseExercises(formData: FormData) {
  const exercisesJson = String(formData.get("exercises_json") ?? "[]");
  try {
    const parsed = JSON.parse(exercisesJson) as {
      name: string;
      weight: number;
      reps: number;
      sets: number;
    }[];
    return parsed.filter((e) => e.name && e.weight > 0 && e.reps > 0);
  } catch {
    return [];
  }
}

export async function getWorkouts(limit = 30): Promise<WorkoutWithDetails[]> {
  const { supabase, userId } = await getUserId();

  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", userId)
    .order("workout_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  if (!workouts?.length) return [];

  const workoutIds = workouts.map((w) => w.id);

  const [{ data: lifts }, { data: runs }] = await Promise.all([
    supabase.from("lift_entries").select("*").in("workout_id", workoutIds).order("sort_order"),
    supabase.from("run_entries").select("*").in("workout_id", workoutIds),
  ]);

  return workouts.map((workout) => ({
    ...(workout as Workout),
    lift_entries: (lifts ?? []).filter((l) => l.workout_id === workout.id) as LiftEntry[],
    run_entries: (runs ?? []).filter((r) => r.workout_id === workout.id) as RunEntry[],
  }));
}

export async function getWorkoutById(id: string): Promise<WorkoutWithDetails | null> {
  const { supabase, userId } = await getUserId();

  const { data: workout, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !workout) return null;

  const [{ data: lifts }, { data: runs }] = await Promise.all([
    supabase.from("lift_entries").select("*").eq("workout_id", id).order("sort_order"),
    supabase.from("run_entries").select("*").eq("workout_id", id),
  ]);

  return {
    ...(workout as Workout),
    lift_entries: (lifts ?? []) as LiftEntry[],
    run_entries: (runs ?? []) as RunEntry[],
  };
}

export async function getWeeklySessionCount(): Promise<number> {
  const { supabase, userId } = await getUserId();
  const weekStart = getWeekStart();

  const { data, error } = await supabase
    .from("workouts")
    .select("id, workout_type")
    .eq("user_id", userId)
    .gte("workout_date", weekStart);

  if (error) throw error;
  return (data ?? []).filter((w) => w.workout_type !== "floor").length;
}

export async function hasFloorThisWeek(): Promise<boolean> {
  return hasTrainingFloorThisWeek();
}

export async function getWeeklySchedule(): Promise<WeeklyScheduleDay[]> {
  const { supabase, userId } = await getUserId();

  const { data, error } = await supabase
    .from("weekly_schedule")
    .select("*")
    .eq("user_id", userId)
    .order("day_of_week");

  if (error) throw error;
  return (data ?? []) as WeeklyScheduleDay[];
}

export async function getTemplates(): Promise<WorkoutTemplateWithExercises[]> {
  const { supabase, userId } = await getUserId();

  const { data: templates, error } = await supabase
    .from("workout_templates")
    .select("*")
    .eq("user_id", userId)
    .order("name");

  if (error) throw error;
  if (!templates?.length) return [];

  const templateIds = templates.map((t) => t.id);
  const { data: exercises } = await supabase
    .from("template_exercises")
    .select("*")
    .in("template_id", templateIds)
    .order("sort_order");

  return templates.map((template) => ({
    ...(template as WorkoutTemplate),
    exercises: (exercises ?? []).filter((e) => e.template_id === template.id),
  }));
}

export async function getTemplateById(id: string): Promise<WorkoutTemplateWithExercises | null> {
  const templates = await getTemplates();
  return templates.find((t) => t.id === id) ?? null;
}

export async function getLastLiftsForExercises(
  exerciseNames: string[],
): Promise<Record<string, LastLift>> {
  const { supabase, userId } = await getUserId();
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const result: Record<string, LastLift> = {};

  for (const name of exerciseNames) {
    const { data } = await supabase
      .from("lift_entries")
      .select("exercise, weight, reps, sets, created_at, workouts!inner(workout_date)")
      .eq("user_id", userId)
      .ilike("exercise", name)
      .gte("workouts.workout_date", twoWeeksAgo.toISOString().slice(0, 10))
      .order("created_at", { ascending: false })
      .limit(1);

    if (data?.[0]) {
      result[name] = {
        exercise: data[0].exercise,
        weight: Number(data[0].weight),
        reps: data[0].reps,
        sets: data[0].sets,
      };
    }
  }

  return result;
}

export async function getPersonalRecords(): Promise<PersonalRecord[]> {
  const { supabase, userId } = await getUserId();

  const { data: lifts, error } = await supabase
    .from("lift_entries")
    .select("exercise, weight, reps, workouts!inner(workout_date)")
    .eq("user_id", userId)
    .order("weight", { ascending: false });

  if (error) throw error;

  const prMap = new Map<string, PersonalRecord>();

  for (const lift of lifts ?? []) {
    const key = lift.exercise.toLowerCase();
    const existing = prMap.get(key);
    const weight = Number(lift.weight);
    const workoutDate = (lift.workouts as unknown as { workout_date: string }).workout_date;

    if (!existing || weight > existing.weight) {
      prMap.set(key, {
        exercise: lift.exercise,
        weight,
        reps: lift.reps,
        date: workoutDate,
      });
    }
  }

  return Array.from(prMap.values()).sort((a, b) => b.weight - a.weight);
}

export async function getStrengthProgress(exercise: string) {
  const { supabase, userId } = await getUserId();

  const { data, error } = await supabase
    .from("lift_entries")
    .select("weight, reps, workouts!inner(workout_date)")
    .eq("user_id", userId)
    .ilike("exercise", exercise)
    .order("workouts(workout_date)", { ascending: true });

  if (error) return [];

  return (data ?? []).map((entry) => ({
    date: (entry.workouts as unknown as { workout_date: string }).workout_date,
    weight: Number(entry.weight),
    reps: entry.reps,
  }));
}

export async function getRunProgress() {
  const { supabase, userId } = await getUserId();

  const { data, error } = await supabase
    .from("run_entries")
    .select("distance_miles, duration_minutes, workouts!inner(workout_date)")
    .eq("user_id", userId)
    .not("distance_miles", "is", null)
    .order("workouts(workout_date)", { ascending: true });

  if (error) return [];

  return (data ?? []).map((entry) => ({
    date: (entry.workouts as unknown as { workout_date: string }).workout_date,
    distance: Number(entry.distance_miles),
    duration: entry.duration_minutes,
  }));
}

export async function getWeekStreak(): Promise<number> {
  const { supabase, userId } = await getUserId();
  const target = FITNESS_WEEKLY_TARGET;

  const { data: workouts } = await supabase
    .from("workouts")
    .select("workout_date, workout_type")
    .eq("user_id", userId)
    .order("workout_date", { ascending: false });

  if (!workouts?.length) {
    return (await hasTrainingFloorThisWeek()) ? 1 : 0;
  }

  let streak = 0;
  const currentWeekFloor = await hasTrainingFloorThisWeek();
  let cursor = getWeekStartDate();

  for (let w = 0; w < 52; w++) {
    const startStr = cursor;
    const endStr = addDaysIso(cursor, 6);

    const weekWorkouts = workouts.filter(
      (wo) => wo.workout_date >= startStr && wo.workout_date <= endStr,
    );
    const sessions = weekWorkouts.filter((wo) => wo.workout_type !== "floor").length;
    const hasFloor =
      weekWorkouts.some((wo) => wo.workout_type === "floor") || (w === 0 && currentWeekFloor);

    if (sessions >= target || hasFloor) {
      streak++;
    } else {
      break;
    }

    cursor = addDaysIso(cursor, -7);
  }

  return streak;
}

export async function getFitnessDashboardSummary(): Promise<FitnessDashboardSummary> {
  const [sessions, hasFloor, workouts, schedule, prs, settings, habits] = await Promise.all([
    getWeeklySessionCount(),
    hasFloorThisWeek(),
    getWorkouts(14),
    getWeeklySchedule(),
    getPersonalRecords(),
    getUserId().then(({ supabase, userId }) =>
      supabase.from("user_settings").select("fitness_target").eq("user_id", userId).maybeSingle(),
    ),
    getHabitFloorStatuses(),
  ]);

  const target = Number(settings.data?.fitness_target ?? FITNESS_WEEKLY_TARGET);
  const todayDow = getTodayDayOfWeek();
  const todaySchedule = schedule.find((d) => d.day_of_week === todayDow);
  const weekStart = getWeekStart();

  const trainingDots = habits.find((habit) => habit.key === "training")?.weekDots ?? [];
  const weekDots = DAY_LABELS.map((label, i) => {
    const dow = i + 1;
    const daySchedule = schedule.find((d) => d.day_of_week === dow);
    const dateStr = addDaysIso(weekStart, i);
    const dayWorkouts = workouts.filter((w) => w.workout_date === dateStr);
    const habitDot = trainingDots.find((dot) => dot.date === dateStr);

    let status: "done" | "floor" | "planned" | "rest" | "empty" = "empty";
    if (dayWorkouts.some((w) => w.workout_type !== "floor")) status = "done";
    else if (habitDot?.status === "floor" || dayWorkouts.some((w) => w.workout_type === "floor")) {
      status = "floor";
    } else if (daySchedule?.schedule_type === "rest") status = "rest";
    else if (daySchedule) status = "planned";

    return { day: dow, label, status };
  });

  const prHighlight = prs[0] ?? null;

  return {
    sessions,
    target,
    hasFloor,
    lastWorkoutDate: workouts[0]?.workout_date ?? null,
    todayLabel: todaySchedule?.label ?? "Rest day",
    todayType: todaySchedule?.schedule_type ?? "rest",
    todayTemplateId: todaySchedule?.template_id ?? null,
    weekDots,
    prHighlight,
  };
}

export async function logFloorHabit() {
  return upsertHabitLevel("training", "floor");
}

export async function logWorkout(formData: FormData) {
  const { supabase, userId } = await getUserId();

  const workoutDate = String(formData.get("workout_date"));
  const workoutType = String(formData.get("workout_type"));
  const subtype = String(formData.get("subtype") ?? "") || null;
  const notes = String(formData.get("notes") ?? "") || null;
  const templateId = String(formData.get("template_id") ?? "") || null;

  const { data: workout, error } = await supabase
    .from("workouts")
    .insert({
      user_id: userId,
      workout_date: workoutDate,
      workout_type: workoutType,
      subtype,
      notes,
      template_id: templateId,
    })
    .select()
    .single();

  if (error || !workout) {
    return { error: error?.message ?? "Failed to create workout" };
  }

  const exercises = parseExercises(formData);
  if (exercises.length > 0) {
    await supabase.from("lift_entries").insert(
      exercises.map((exercise, index) => ({
        user_id: userId,
        workout_id: workout.id,
        exercise: exercise.name,
        weight: exercise.weight,
        reps: exercise.reps,
        sets: exercise.sets,
        sort_order: index,
      })),
    );
  }

  const distance = parseFloat(String(formData.get("distance_miles") ?? ""));
  const duration = parseInt(String(formData.get("duration_minutes") ?? ""), 10);

  if (workoutType === "run" || workoutType === "walk") {
    if (!isNaN(distance) || !isNaN(duration)) {
      await supabase.from("run_entries").insert({
        user_id: userId,
        workout_id: workout.id,
        distance_miles: isNaN(distance) ? null : distance,
        duration_minutes: isNaN(duration) ? null : duration,
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/fitness");
  if (workoutType !== "floor") {
    await upsertHabitLevel("training", "full", workoutDate);
  }
  return { success: true };
}

export async function updateWorkout(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const workoutId = String(formData.get("workout_id"));

  const workoutDate = String(formData.get("workout_date"));
  const workoutType = String(formData.get("workout_type"));
  const subtype = String(formData.get("subtype") ?? "") || null;
  const notes = String(formData.get("notes") ?? "") || null;

  const { error } = await supabase
    .from("workouts")
    .update({ workout_date: workoutDate, workout_type: workoutType, subtype, notes })
    .eq("id", workoutId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  await supabase.from("lift_entries").delete().eq("workout_id", workoutId);
  await supabase.from("run_entries").delete().eq("workout_id", workoutId);

  const exercises = parseExercises(formData);
  if (exercises.length > 0) {
    await supabase.from("lift_entries").insert(
      exercises.map((exercise, index) => ({
        user_id: userId,
        workout_id: workoutId,
        exercise: exercise.name,
        weight: exercise.weight,
        reps: exercise.reps,
        sets: exercise.sets,
        sort_order: index,
      })),
    );
  }

  const distance = parseFloat(String(formData.get("distance_miles") ?? ""));
  const duration = parseInt(String(formData.get("duration_minutes") ?? ""), 10);

  if (!isNaN(distance) || !isNaN(duration)) {
    await supabase.from("run_entries").insert({
      user_id: userId,
      workout_id: workoutId,
      distance_miles: isNaN(distance) ? null : distance,
      duration_minutes: isNaN(duration) ? null : duration,
    });
  }

  revalidatePath("/");
  revalidatePath("/fitness");
  if (workoutType !== "floor") {
    await upsertHabitLevel("training", "full", workoutDate);
  }
  return { success: true };
}

export async function deleteWorkout(workoutId: string) {
  const { supabase, userId } = await getUserId();

  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", workoutId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/fitness");
  return { success: true };
}

export async function saveTemplate(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const templateId = String(formData.get("template_id") ?? "") || null;
  const name = String(formData.get("name"));
  const workoutType = String(formData.get("workout_type"));
  const exercisesJson = String(formData.get("exercises_json") ?? "[]");

  let exercises: { name: string; sets: number; reps: number }[] = [];
  try {
    exercises = JSON.parse(exercisesJson);
  } catch {
    return { error: "Invalid exercise data" };
  }

  if (!name) return { error: "Template name required" };

  if (templateId) {
    await supabase
      .from("workout_templates")
      .update({ name, workout_type: workoutType })
      .eq("id", templateId)
      .eq("user_id", userId);

    await supabase.from("template_exercises").delete().eq("template_id", templateId);

    if (exercises.length > 0) {
      await supabase.from("template_exercises").insert(
        exercises.map((exercise, index) => ({
          user_id: userId,
          template_id: templateId,
          exercise_name: exercise.name,
          default_sets: exercise.sets,
          default_reps: exercise.reps,
          sort_order: index,
        })),
      );
    }
  } else {
    const { data: created, error } = await supabase
      .from("workout_templates")
      .insert({ user_id: userId, name, workout_type: workoutType, is_default: false })
      .select()
      .single();

    if (error || !created) return { error: error?.message ?? "Failed to create template" };

    if (exercises.length > 0) {
      await supabase.from("template_exercises").insert(
        exercises.map((exercise, index) => ({
          user_id: userId,
          template_id: created.id,
          exercise_name: exercise.name,
          default_sets: exercise.sets,
          default_reps: exercise.reps,
          sort_order: index,
        })),
      );
    }
  }

  revalidatePath("/fitness");
  return { success: true };
}

export async function deleteTemplate(templateId: string) {
  const { supabase, userId } = await getUserId();

  const { error } = await supabase
    .from("workout_templates")
    .delete()
    .eq("id", templateId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath("/fitness");
  return { success: true };
}

export async function saveWeeklySchedule(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const scheduleJson = String(formData.get("schedule_json") ?? "[]");

  let schedule: {
    day_of_week: number;
    schedule_type: string;
    template_id: string | null;
    label: string;
  }[] = [];

  try {
    schedule = JSON.parse(scheduleJson);
  } catch {
    return { error: "Invalid schedule data" };
  }

  for (const day of schedule) {
    await supabase.from("weekly_schedule").upsert(
      {
        user_id: userId,
        day_of_week: day.day_of_week,
        schedule_type: day.schedule_type,
        template_id: day.template_id,
        label: day.label,
      },
      { onConflict: "user_id,day_of_week" },
    );
  }

  revalidatePath("/");
  revalidatePath("/fitness");
  return { success: true };
}

export async function getFitnessPhase(planStartDate: string): Promise<string> {
  const { differenceInMonths, parseISO, startOfMonth } = await import("date-fns");
  const start = startOfMonth(parseISO(planStartDate));
  const month = Math.max(1, differenceInMonths(startOfMonth(new Date()), start) + 1);

  if (month <= 6) return "Base";
  if (month <= 12) return "Lean out";
  if (month <= 18) return "Build";
  return "Sharpen";
}

export async function getTargetProgress(prs: PersonalRecord[]) {
  return STRENGTH_TARGETS.map((target) => {
    const pr = prs.find(
      (p) =>
        p.exercise.toLowerCase().includes(target.exercise.toLowerCase()) ||
        target.exercise.toLowerCase().includes(p.exercise.toLowerCase()),
    );
    const current = pr?.weight ?? 0;
    const progress = target.min > 0 ? Math.min(100, (current / target.min) * 100) : 0;
    return { ...target, current, progress };
  });
}

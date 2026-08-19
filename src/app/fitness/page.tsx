import { AppShell } from "@/components/layout/app-shell";
import { FitnessStats } from "@/components/fitness/fitness-stats";
import { TodayWorkout } from "@/components/fitness/today-workout";
import { WeekCalendar } from "@/components/fitness/week-calendar";
import { WorkoutForm, FloorHabitButton } from "@/components/fitness/workout-form";
import { WorkoutHistory } from "@/components/fitness/workout-history";
import { TemplateManager } from "@/components/fitness/template-manager";
import { ScheduleEditor } from "@/components/fitness/schedule-editor";
import { PRBoard } from "@/components/fitness/pr-board";
import { StrengthChart } from "@/components/fitness/strength-chart";
import {
  getWorkouts,
  getFitnessPhase,
  getWeeklySchedule,
  getTemplates,
  getPersonalRecords,
  getTargetProgress,
  getWeekStreak,
  getWeeklySessionCount,
  hasFloorThisWeek,
  getStrengthProgress,
  getRunProgress,
  getLastLiftsForExercises,
} from "@/lib/actions/fitness";
import { getUserSettings } from "@/lib/actions/debt";
import { PLAN_START_DATE, FITNESS_WEEKLY_TARGET, STRENGTH_TARGETS } from "@/lib/seed";
import { BodyTracker } from "@/components/plan/body-tracker";
import { FitnessTargetsCard } from "@/components/plan/plan-reference";
import { getBodyLogs } from "@/lib/actions/plan";
import { seedUserData } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

function getTodayDayOfWeek(): number {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
}

export default async function FitnessPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await seedUserData(user.id);

  const params = await searchParams;
  const prefillTemplateId = params.template || null;

  const [
    workouts,
    settings,
    schedule,
    templates,
    prs,
    streak,
    sessions,
    floor,
    runData,
    bodyLogs,
  ] = await Promise.all([
    getWorkouts(30),
    getUserSettings(),
    getWeeklySchedule(),
    getTemplates(),
    getPersonalRecords(),
    getWeekStreak(),
    getWeeklySessionCount(),
    hasFloorThisWeek(),
    getRunProgress(),
    getBodyLogs(),
  ]);

  const planStartDate = settings?.plan_start_date ?? PLAN_START_DATE;
  const fitnessTarget = Number(settings?.fitness_target ?? FITNESS_WEEKLY_TARGET);
  const phase = await getFitnessPhase(planStartDate);
  const targetProgress = await getTargetProgress(prs);

  const todayDow = getTodayDayOfWeek();
  const todaySchedule = schedule.find((d) => d.day_of_week === todayDow);

  const weekStart = (() => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    return monday.toISOString().slice(0, 10);
  })();

  const workoutsThisWeek = workouts.filter((w) => w.workout_date >= weekStart);

  const strengthData: Record<string, { date: string; weight: number; reps: number }[]> = {};
  for (const target of STRENGTH_TARGETS) {
    strengthData[target.exercise] = await getStrengthProgress(target.exercise);
  }

  const allExerciseNames = templates.flatMap((t) => t.exercises.map((e) => e.exercise_name));
  const lastLifts = await getLastLiftsForExercises([...new Set(allExerciseNames)]);

  return (
    <AppShell>
      <div className="space-y-4">
        <FitnessStats
          phase={phase}
          sessions={sessions}
          target={fitnessTarget}
          streak={streak}
          hasFloor={floor}
        />

        <TodayWorkout
          schedule={todaySchedule}
          templates={templates}
          templateId={todaySchedule?.template_id ?? prefillTemplateId}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WeekCalendar schedule={schedule} workoutsThisWeek={workoutsThisWeek} />
          <PRBoard prs={prs} targetProgress={targetProgress} />
        </div>

        <div className="lg:col-span-2">
          <StrengthChart strengthData={strengthData} runData={runData} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WorkoutForm
            templates={templates}
            lastLifts={lastLifts}
            prefillTemplateId={prefillTemplateId ?? todaySchedule?.template_id}
          />
          <FloorHabitButton />
          <BodyTracker logs={bodyLogs} />
          <FitnessTargetsCard />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ScheduleEditor schedule={schedule} templates={templates} />
          <TemplateManager templates={templates} />
        </div>

        <WorkoutHistory workouts={workouts} templates={templates} lastLifts={lastLifts} />
      </div>
    </AppShell>
  );
}

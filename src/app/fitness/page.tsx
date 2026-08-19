import { AppShell } from "@/components/layout/app-shell";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { FitnessStats } from "@/components/fitness/fitness-stats";
import { TodayWorkout } from "@/components/fitness/today-workout";
import { WeekCalendar } from "@/components/fitness/week-calendar";
import { WorkoutForm, FloorHabitButton } from "@/components/fitness/workout-form";
import { WorkoutHistory } from "@/components/fitness/workout-history";
import { TemplateManager } from "@/components/fitness/template-manager";
import { ScheduleEditor } from "@/components/fitness/schedule-editor";
import { PRBoard } from "@/components/fitness/pr-board";
import { StrengthChart } from "@/components/fitness/strength-chart";
import { VolumeSparkline } from "@/components/fitness/volume-sparkline";
import {
  getWorkouts,
  getFitnessPhaseDetails,
  getWeeklySchedule,
  getTemplates,
  getPersonalRecords,
  getTargetProgress,
  getWeekStreak,
  getWeeklySessionCount,
  hasFloorThisWeek,
  getStrengthChartData,
  getRunProgress,
  getLastLiftsForExercises,
  getWeeklyVolume,
} from "@/lib/actions/fitness";
import { getUserSettings } from "@/lib/actions/debt";
import { PLAN_START_DATE, FITNESS_WEEKLY_TARGET, PROTEIN_TARGET_G } from "@/lib/seed";
import { BodyTracker } from "@/components/plan/body-tracker";
import { WeightChart } from "@/components/fitness/weight-chart";
import { FitnessTargetsCard } from "@/components/plan/plan-reference";
import { getBodyLogs } from "@/lib/actions/plan";
import { seedUserData } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { getWeekStartDate } from "@/lib/utils";
import { getHabitFloorStatuses } from "@/lib/actions/habits";
import { proteinHitRate } from "@/lib/fitness-metrics";
import type { StrengthChartPoint } from "@/lib/fitness-metrics";

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
    habits,
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
    getHabitFloorStatuses(),
  ]);

  const planStartDate = settings?.plan_start_date ?? PLAN_START_DATE;
  const fitnessTarget = Number(settings?.fitness_target ?? FITNESS_WEEKLY_TARGET);
  const phaseInfo = await getFitnessPhaseDetails(planStartDate);
  const targetProgress = await getTargetProgress(prs);
  const proteinStats = proteinHitRate(bodyLogs, PROTEIN_TARGET_G);
  const weeklyVolume = await getWeeklyVolume();

  const todayDow = getTodayDayOfWeek();
  const todaySchedule = schedule.find((d) => d.day_of_week === todayDow);

  const weekStart = getWeekStartDate();
  const workoutsThisWeek = workouts.filter((w) => w.workout_date >= weekStart);
  const floorDates = (
    habits.find((habit) => habit.key === "training")?.weekDots ?? []
  )
    .filter((dot) => dot.status === "floor")
    .map((dot) => dot.date);

  const strengthData: Record<string, StrengthChartPoint[]> = {};
  for (const target of targetProgress) {
    strengthData[target.exercise] = await getStrengthChartData(target.exercise);
  }

  const allExerciseNames = templates.flatMap((t) => t.exercises.map((e) => e.exercise_name));
  const lastLifts = await getLastLiftsForExercises([...new Set(allExerciseNames)]);

  return (
    <AppShell>
      <div className="space-y-4">
        <FitnessStats
          phaseInfo={phaseInfo}
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
          <WeekCalendar
            schedule={schedule}
            workoutsThisWeek={workoutsThisWeek}
            floorDates={floorDates}
          />
          <PRBoard prs={prs} targetProgress={targetProgress} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <StrengthChart strengthData={strengthData} runData={runData} />
          <VolumeSparkline weeks={weeklyVolume} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WeightChart logs={bodyLogs} />
          <BodyTracker logs={bodyLogs} proteinStats={proteinStats} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WorkoutForm
            templates={templates}
            lastLifts={lastLifts}
            prefillTemplateId={prefillTemplateId ?? todaySchedule?.template_id}
          />
          <FloorHabitButton />
          <FitnessTargetsCard />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CollapsibleSection title="Weekly schedule" description="Set lift, run, and rest days" defaultOpen={false}>
            <ScheduleEditor schedule={schedule} templates={templates} />
          </CollapsibleSection>
          <CollapsibleSection title="Workout templates" description="Save reusable lift and run templates" defaultOpen={false}>
            <TemplateManager templates={templates} />
          </CollapsibleSection>
        </div>

        <CollapsibleSection title="Workout history" description="Recent sessions and edits" defaultOpen={false}>
          <WorkoutHistory workouts={workouts} templates={templates} lastLifts={lastLifts} />
        </CollapsibleSection>
      </div>
    </AppShell>
  );
}

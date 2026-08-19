import { AppShell } from "@/components/layout/app-shell";
import { DebtHero } from "@/components/dashboard/debt-hero";
import { SavingsHero } from "@/components/dashboard/savings-hero";
import { MonthlyPaymentWidget } from "@/components/dashboard/monthly-payment-widget";
import { FitnessWeekWidget } from "@/components/dashboard/fitness-week-widget";
import { ReviewReminderWidget } from "@/components/dashboard/review-reminder-widget";
import { MilestoneWidget } from "@/components/dashboard/milestone-widget";
import { SavingsWidget } from "@/components/dashboard/savings-widget";
import { BusinessWeekWidget } from "@/components/dashboard/business-week-widget";
import { HabitsStrip } from "@/components/habits/habits-strip";
import {
  getDebtAccounts,
  getMonthlyPayments,
  getTotalDebt,
  getUserSettings,
} from "@/lib/actions/debt";
import { getFitnessDashboardSummary } from "@/lib/actions/fitness";
import { getReviewDue } from "@/lib/actions/review";
import { getSavingsSummary } from "@/lib/actions/savings";
import { getBusinessWeekStats } from "@/lib/actions/business";
import { getHabitFloorStatuses } from "@/lib/actions/habits";
import { getUserProjection } from "@/lib/actions/projection";
import { seedUserData } from "@/lib/actions/auth";
import { getNextMilestone } from "@/lib/debt-schedule";
import { FourOutcomes } from "@/components/plan/four-outcomes";
import { getFitnessPhase } from "@/lib/actions/fitness";
import { PLAN_START_DATE, MONTHLY_DEBT_TARGET } from "@/lib/seed";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await seedUserData(user.id);
  }

  const [
    totalDebt,
    accounts,
    settings,
    paidThisMonth,
    fitnessSummary,
    reviewDue,
    savingsSummary,
    businessStats,
    habits,
    projection,
  ] = await Promise.all([
    getTotalDebt(),
    getDebtAccounts(),
    getUserSettings(),
    getMonthlyPayments(new Date().getFullYear(), new Date().getMonth() + 1),
    getFitnessDashboardSummary(),
    getReviewDue(),
    getSavingsSummary(),
    getBusinessWeekStats(),
    getHabitFloorStatuses(),
    getUserProjection(),
  ]);

  const planStartDate = settings?.plan_start_date ?? PLAN_START_DATE;
  const debtTarget = Number(settings?.monthly_debt_target ?? MONTHLY_DEBT_TARGET);
  const milestone = getNextMilestone(accounts);
  const debtFree = totalDebt <= 0;
  const phase = await getFitnessPhase(planStartDate);

  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <FourOutcomes
            totalDebt={totalDebt}
            cashOnHand={savingsSummary.cashOnHand}
            weekCommission={businessStats.estimatedCommission}
            fitnessLabel={phase}
            debtFreeLabel={projection.debtFreeLabel}
            closingLabel={projection.closingLabel}
          />
        </div>
        <div className="lg:col-span-2">
          {debtFree ? (
            <SavingsHero summary={savingsSummary} />
          ) : (
            <DebtHero totalDebt={totalDebt} planStartDate={planStartDate} />
          )}
        </div>
        <div className="lg:col-span-2">
          <HabitsStrip habits={habits} />
        </div>
        {debtFree ? (
          <MilestoneWidget title={milestone.title} description={milestone.description} />
        ) : (
          <MonthlyPaymentWidget paidThisMonth={paidThisMonth} target={debtTarget} />
        )}
        <SavingsWidget summary={savingsSummary} />
        {!debtFree && <MilestoneWidget title={milestone.title} description={milestone.description} />}
        <FitnessWeekWidget summary={fitnessSummary} />
        <BusinessWeekWidget stats={businessStats} />
        <ReviewReminderWidget isDue={reviewDue} />
      </div>
    </AppShell>
  );
}

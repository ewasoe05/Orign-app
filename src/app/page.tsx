import { AppShell } from "@/components/layout/app-shell";
import { DebtHero } from "@/components/dashboard/debt-hero";
import { SavingsHero } from "@/components/dashboard/savings-hero";
import { MonthlyPaymentWidget } from "@/components/dashboard/monthly-payment-widget";
import { FitnessWeekWidget } from "@/components/dashboard/fitness-week-widget";
import { ReviewReminderWidget } from "@/components/dashboard/review-reminder-widget";
import { RemindersPanel } from "@/components/dashboard/reminders-panel";
import { DashboardSundayOrder } from "@/components/dashboard/dashboard-sunday-order";
import { MilestoneWidget } from "@/components/dashboard/milestone-widget";
import { SavingsWidget } from "@/components/dashboard/savings-widget";
import { BusinessWeekWidget } from "@/components/dashboard/business-week-widget";
import { HabitsStrip } from "@/components/habits/habits-strip";
import { PaycheckCta } from "@/components/dashboard/paycheck-cta";
import {
  getDebtAccounts,
  getMonthlyPayments,
  getTotalDebt,
  getUserSettings,
} from "@/lib/actions/debt";
import { getFitnessDashboardSummary } from "@/lib/actions/fitness";
import { getBusinessWeekStats, getFollowUpQueue } from "@/lib/actions/business";
import { getRemindersContext } from "@/lib/actions/reminders";
import { getSavingsSummary } from "@/lib/actions/savings";
import { getHabitFloorStatuses } from "@/lib/actions/habits";
import { getUserProjection } from "@/lib/actions/projection";
import { getPaycheckSnapshot } from "@/lib/actions/paycheck";
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

  if (user) await seedUserData(user.id);

  const [
    totalDebt,
    accounts,
    settings,
    paidThisMonth,
    fitnessSummary,
    remindersContext,
    savingsSummary,
    businessStats,
    followUps,
    habits,
    projection,
    paycheck,
  ] = await Promise.all([
    getTotalDebt(),
    getDebtAccounts(),
    getUserSettings(),
    getMonthlyPayments(new Date().getFullYear(), new Date().getMonth() + 1),
    getFitnessDashboardSummary(),
    getRemindersContext(),
    getSavingsSummary(),
    getBusinessWeekStats(),
    getFollowUpQueue(),
    getHabitFloorStatuses(),
    getUserProjection(),
    getPaycheckSnapshot(),
  ]);

  const planStartDate = settings?.plan_start_date ?? PLAN_START_DATE;
  const debtTarget = Number(settings?.monthly_debt_target ?? MONTHLY_DEBT_TARGET);
  const milestone = getNextMilestone(accounts);
  const debtFree = totalDebt <= 0;
  const phase = await getFitnessPhase(planStartDate);
  const nextPaycheckTarget =
    paycheck.phase === "savings"
      ? "Savings goal"
      : (accounts.find((account) => Number(account.current_balance) > 0)?.name ?? "Savings goal");

  return (
    <AppShell>
      <DashboardSundayOrder reviewWidget={<ReviewReminderWidget context={remindersContext} />}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <PaycheckCta
              settings={paycheck.settings}
              phase={paycheck.phase}
              debtLeft={paycheck.debtLeft}
              nextLabel={nextPaycheckTarget}
            />
          </div>

          <div className="lg:col-span-2">
            <RemindersPanel context={remindersContext} />
          </div>

          <div className="lg:col-span-2">
            {debtFree ? (
              <SavingsHero summary={savingsSummary} planStartDate={planStartDate} bundle={projection} />
            ) : (
              <DebtHero totalDebt={totalDebt} planStartDate={planStartDate} bundle={projection} />
            )}
          </div>

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

          {!debtFree && (
            <MonthlyPaymentWidget paidThisMonth={paidThisMonth} target={debtTarget} />
          )}
          <SavingsWidget summary={savingsSummary} planStartDate={planStartDate} bundle={projection} />
          <FitnessWeekWidget summary={fitnessSummary} />

          <div className="lg:col-span-2">
            <HabitsStrip habits={habits} />
          </div>

          {!debtFree && (
            <MilestoneWidget title={milestone.title} description={milestone.description} />
          )}
          <BusinessWeekWidget stats={businessStats} followUps={followUps} />
        </div>
      </DashboardSundayOrder>
    </AppShell>
  );
}

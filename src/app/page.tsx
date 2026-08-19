import { AppShell } from "@/components/layout/app-shell";
import { DebtHero } from "@/components/dashboard/debt-hero";
import { MonthlyPaymentWidget } from "@/components/dashboard/monthly-payment-widget";
import { FitnessWeekWidget } from "@/components/dashboard/fitness-week-widget";
import { ReviewReminderWidget } from "@/components/dashboard/review-reminder-widget";
import { MilestoneWidget } from "@/components/dashboard/milestone-widget";
import {
  getDebtAccounts,
  getMonthlyPayments,
  getTotalDebt,
  getUserSettings,
} from "@/lib/actions/debt";
import { getFitnessDashboardSummary } from "@/lib/actions/fitness";
import { getReviewDue } from "@/lib/actions/review";
import { seedUserData } from "@/lib/actions/auth";
import { getNextMilestone } from "@/lib/debt-schedule";
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
  ] = await Promise.all([
    getTotalDebt(),
    getDebtAccounts(),
    getUserSettings(),
    getMonthlyPayments(new Date().getFullYear(), new Date().getMonth() + 1),
    getFitnessDashboardSummary(),
    getReviewDue(),
  ]);

  const planStartDate = settings?.plan_start_date ?? PLAN_START_DATE;
  const debtTarget = Number(settings?.monthly_debt_target ?? MONTHLY_DEBT_TARGET);
  const milestone = getNextMilestone(accounts);

  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <DebtHero totalDebt={totalDebt} planStartDate={planStartDate} />
        </div>
        <MonthlyPaymentWidget paidThisMonth={paidThisMonth} target={debtTarget} />
        <MilestoneWidget title={milestone.title} description={milestone.description} />
        <FitnessWeekWidget summary={fitnessSummary} />
        <ReviewReminderWidget isDue={reviewDue} />
      </div>
    </AppShell>
  );
}

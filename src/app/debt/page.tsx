import { AppShell } from "@/components/layout/app-shell";
import { AccountCards } from "@/components/debt/account-cards";
import { PaymentForm } from "@/components/debt/payment-form";
import { PayoffChart } from "@/components/debt/payoff-chart";
import { ScheduleTable } from "@/components/debt/schedule-table";
import {
  getDebtAccounts,
  getDebtPayments,
  getTotalDebt,
  getUserSettings,
} from "@/lib/actions/debt";
import { buildPayoffChartData } from "@/lib/debt-schedule";
import { PLAN_START_DATE } from "@/lib/seed";
import { PlanChecklist } from "@/components/plan/plan-checklist";
import { CreditTracker } from "@/components/plan/credit-tracker";
import { PayoffRationale } from "@/components/plan/plan-reference";
import { getPlanChecklist, getCreditLogs } from "@/lib/actions/plan";
import { seedUserData } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

export default async function DebtPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await seedUserData(user.id);

  const [accounts, payments, totalDebt, settings, checklist, credit] = await Promise.all([
    getDebtAccounts(),
    getDebtPayments(),
    getTotalDebt(),
    getUserSettings(),
    getPlanChecklist(),
    getCreditLogs(),
  ]);

  const planStartDate = settings?.plan_start_date ?? PLAN_START_DATE;
  const chartData = buildPayoffChartData(
    payments.map((p) => ({ payment_date: p.payment_date, amount: Number(p.amount) })),
    planStartDate,
  );

  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <AccountCards accounts={accounts} />
          <PaymentForm accounts={accounts} />
          <PlanChecklist
            title="First two weeks"
            description="Fix credit, autopay, separate savings."
            items={checklist.filter((item) => item.section === "first_two_weeks")}
          />
        </div>
        <div className="space-y-4">
          <CreditTracker logs={credit} />
          <PayoffRationale />
          <PlanChecklist
            title="Credit repair (if needed)"
            description="Only if FICO is under 620."
            items={checklist.filter((item) => item.section === "credit_repair")}
          />
          <PayoffChart data={chartData} />
          <ScheduleTable currentTotal={totalDebt} planStartDate={planStartDate} />
        </div>
      </div>
    </AppShell>
  );
}

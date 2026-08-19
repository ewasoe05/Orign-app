import { AppShell } from "@/components/layout/app-shell";
import { AccountPriorityEditor } from "@/components/debt/account-priority-editor";
import { PaymentForm } from "@/components/debt/payment-form";
import { PayoffChart } from "@/components/debt/payoff-chart";
import { ScheduleTable } from "@/components/debt/schedule-table";
import { InterestPanel } from "@/components/debt/interest-panel";
import { WhatIfSlider } from "@/components/debt/what-if-slider";
import {
  getDebtAccounts,
  getTotalDebt,
  getUserSettings,
} from "@/lib/actions/debt";
import { getPlanChecklist, getPlanFacts } from "@/lib/actions/plan";
import { getUserProjection } from "@/lib/actions/projection";
import { PLAN_START_DATE } from "@/lib/seed";
import { ChecklistTrack } from "@/components/plan/checklist-track";
import Link from "next/link";
import { seedUserData } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { centsToDollars } from "@/lib/projection";

export default async function DebtPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await seedUserData(user.id);

  const [accounts, totalDebt, settings, checklist, facts, bundle] = await Promise.all([
    getDebtAccounts(),
    getTotalDebt(),
    getUserSettings(),
    getPlanChecklist(),
    getPlanFacts(),
    getUserProjection(),
  ]);

  const planStartDate = settings?.plan_start_date ?? PLAN_START_DATE;

  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <AccountPriorityEditor accounts={accounts} />
          <PaymentForm accounts={accounts} />
          <WhatIfSlider
            accounts={accounts}
            planFacts={facts}
            planStartDate={planStartDate}
            defaultOutlay={centsToDollars(bundle.monthlyOutlayCents)}
          />
        </div>
        <div className="space-y-4">
          <PayoffChart data={bundle.chartData} />
          <ScheduleTable currentTotal={totalDebt} planStartDate={planStartDate} bundle={bundle} />
          <InterestPanel bundle={bundle} />
          <ChecklistTrack track="first_two_weeks" items={checklist} />
          <ChecklistTrack track="credit_repair" items={checklist} />
          <p className="text-caption text-text-secondary">
            Payoff rationale and full debt strategy live on the{" "}
            <Link href="/plan" className="underline-offset-2 hover:underline">
              full plan
            </Link>
            .
          </p>
        </div>
      </div>
    </AppShell>
  );
}

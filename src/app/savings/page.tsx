import { AppShell } from "@/components/layout/app-shell";
import { CashOnHandCard, DownPaymentProgress } from "@/components/savings/cash-cards";
import { TransactionForm } from "@/components/savings/transaction-form";
import { MilestoneTimeline } from "@/components/savings/milestone-timeline";
import { TransactionList } from "@/components/savings/transaction-list";
import { ChecklistTrack } from "@/components/plan/checklist-track";
import { DuplexCashPlan } from "@/components/plan/plan-reference";
import { getSavingsSummary, getSavingsTransactions } from "@/lib/actions/savings";
import { getPlanChecklist } from "@/lib/actions/plan";
import { seedUserData } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

export default async function SavingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await seedUserData(user.id);

  const [summary, transactions, checklist] = await Promise.all([
    getSavingsSummary(),
    getSavingsTransactions(),
    getPlanChecklist(),
  ]);

  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4">
          <CashOnHandCard summary={summary} />
          <DownPaymentProgress summary={summary} />
          <DuplexCashPlan />
          <TransactionForm />
        </div>
        <div className="space-y-4">
          <MilestoneTimeline cashOnHand={summary.cashOnHand} />
          <ChecklistTrack track="mortgage" items={checklist} />
          <TransactionList transactions={transactions} />
        </div>
      </div>
    </AppShell>
  );
}

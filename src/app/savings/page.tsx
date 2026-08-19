import { AppShell } from "@/components/layout/app-shell";
import { SavingsHeroCard } from "@/components/savings/cash-cards";
import { TransactionForm } from "@/components/savings/transaction-form";
import { MilestoneTimeline } from "@/components/savings/milestone-timeline";
import { TransactionList } from "@/components/savings/transaction-list";
import { ChecklistTrack } from "@/components/plan/checklist-track";
import Link from "next/link";
import { getSavingsSummary, getSavingsTransactions } from "@/lib/actions/savings";
import { getPlanChecklist } from "@/lib/actions/plan";
import { getUserProjection } from "@/lib/actions/projection";
import { seedUserData } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

export default async function SavingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await seedUserData(user.id);

  const [summary, transactions, checklist, bundle] = await Promise.all([
    getSavingsSummary(),
    getSavingsTransactions(),
    getPlanChecklist(),
    getUserProjection(),
  ]);

  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4">
          <SavingsHeroCard summary={summary} />
          <TransactionForm />
          <p className="text-caption text-text-secondary">
            Duplex cash plan details on the{" "}
            <Link href="/plan" className="underline-offset-2 hover:underline">
              full plan
            </Link>
            .
          </p>
        </div>
        <div className="space-y-4">
          <MilestoneTimeline milestones={bundle.milestones} />
          <ChecklistTrack track="mortgage" items={checklist} />
          <TransactionList transactions={transactions} />
        </div>
      </div>
    </AppShell>
  );
}

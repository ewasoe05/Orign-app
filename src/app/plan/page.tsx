/**
 * Full Plan — narrative rollup of the two-year document.
 * Day-to-day controls live on feature pages (/debt, /savings, /business, /fitness, /review).
 * One-time inputs (FICO tracker, open questions) stay here only.
 */
import { AppShell } from "@/components/layout/app-shell";
import { FourOutcomes } from "@/components/plan/four-outcomes";
import { OnePageTable } from "@/components/plan/one-page-table";
import { ChecklistTrack } from "@/components/plan/checklist-track";
import { PlanFactsForm } from "@/components/plan/plan-facts-form";
import { CreditTracker } from "@/components/plan/credit-tracker";
import {
  StandingSnapshot,
  DuplexCashPlan,
  PayoffRationale,
  BusinessTargets,
  FloorsTable,
  WeeklyReviewReference,
  FitnessTargetsCard,
} from "@/components/plan/plan-reference";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlanChecklist, getPlanFacts, getCreditLogs } from "@/lib/actions/plan";
import { getTotalDebt, getUserSettings } from "@/lib/actions/debt";
import { getSavingsSummary } from "@/lib/actions/savings";
import { getBusinessWeekStats } from "@/lib/actions/business";
import { getFitnessPhase } from "@/lib/actions/fitness";
import { getCurrentQuarter } from "@/lib/quarterly";
import { FITNESS_PHASES, PLAN_PAGE } from "@/content/plan";
import { PLAN_START_DATE } from "@/lib/seed";
import { seedUserData } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

export default async function PlanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await seedUserData(user.id);

  const [checklist, facts, credit, totalDebt, savings, business, settings] = await Promise.all([
    getPlanChecklist(),
    getPlanFacts(),
    getCreditLogs(),
    getTotalDebt(),
    getSavingsSummary(),
    getBusinessWeekStats(),
    getUserSettings(),
  ]);

  const planStart = settings?.plan_start_date ?? PLAN_START_DATE;
  const phase = await getFitnessPhase(planStart);
  const quarter = getCurrentQuarter(planStart);

  return (
    <AppShell>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{PLAN_PAGE.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-400">
            {PLAN_PAGE.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </CardContent>
        </Card>

        <FourOutcomes
          totalDebt={totalDebt}
          cashOnHand={savings.cashOnHand}
          weekCommission={business.estimatedCommission}
          fitnessLabel={phase}
        />

        <StandingSnapshot />

        <OnePageTable currentQuarter={quarter} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PayoffRationale />
          <DuplexCashPlan />
          <BusinessTargets />
          <FloorsTable />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChecklistTrack track="first_two_weeks" items={checklist} />
          <ChecklistTrack track="mortgage" items={checklist} />
          <ChecklistTrack track="business" items={checklist} />
          <ChecklistTrack track="capacity" items={checklist} />
        </div>

        <ChecklistTrack track="credit_repair" items={checklist} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CreditTracker logs={credit} />
          <PlanFactsForm facts={facts} />
          <WeeklyReviewReference />
          <FitnessTargetsCard />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fitness phases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {FITNESS_PHASES.map((p) => (
              <div key={p.name} className="rounded-lg border border-zinc-800 p-3">
                <p className="text-sm font-medium">
                  {p.name}{" "}
                  <span className="text-zinc-500">· months {p.months}</span>
                  {p.name === phase ? " · current" : ""}
                </p>
                <p className="mt-1 text-xs text-zinc-400">{p.focus}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

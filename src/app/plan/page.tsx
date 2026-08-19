import { AppShell } from "@/components/layout/app-shell";
import { FourOutcomes } from "@/components/plan/four-outcomes";
import { OnePageTable } from "@/components/plan/one-page-table";
import { PlanChecklist } from "@/components/plan/plan-checklist";
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
import { FITNESS_PHASES, PLAN_START_DATE } from "@/lib/seed";
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

  const bySection = (section: string) => checklist.filter((item) => item.section === section);

  return (
    <AppShell>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>The 2-year plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-400">
            <p>
              Sept 2026 → Aug 2028. You pay no rent and clear ~$2,100/month. Convert that into assets
              before it disappears. Budget on $4,000 base — commission overage goes to debt, then savings.
            </p>
            <p>
              Design principle: the plan must work on your worst weeks, not just your best ones. Hit the
              floor. Never miss twice.
            </p>
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
          <PlanChecklist
            title="First two weeks"
            description="Do these before the surplus becomes lifestyle."
            items={bySection("first_two_weeks")}
          />
          <PlanChecklist
            title="Mortgage prep"
            description="Start month 15, not month 22. Watch inventory at month 12."
            items={bySection("mortgage")}
          />
          <PlanChecklist
            title="Residential business"
            description="Q1 capture → Q2 mine → Q3 paid → Q4 recurring. Then the dad conversation."
            items={bySection("business")}
          />
          <PlanChecklist
            title="Capacity"
            description="Mental health is a Q1 line item, not a side project."
            items={bySection("capacity")}
          />
        </div>

        <PlanChecklist
          title="Credit repair (if needed)"
          description="Only required if FICO is under 620. 580 is the FHA floor; 620+ is realistic."
          items={bySection("credit_repair")}
        />

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

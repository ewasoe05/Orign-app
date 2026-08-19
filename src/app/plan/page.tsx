/**
 * Full Plan — narrative rollup of the two-year document.
 * Day-to-day controls live on feature pages (/debt, /savings, /business, /fitness, /review).
 * One-time inputs (FICO tracker, open questions) stay here only.
 */
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
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
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Panel } from "@/components/ui/panel";
import { getPlanChecklist, getPlanFacts, getCreditLogs } from "@/lib/actions/plan";
import { getUserSettings } from "@/lib/actions/debt";
import { getUserProjection } from "@/lib/actions/projection";
import { getCurrentQuarter } from "@/lib/quarterly";
import { getFitnessPhase } from "@/lib/actions/fitness";
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

  const [checklist, facts, credit, settings, bundle] = await Promise.all([
    getPlanChecklist(),
    getPlanFacts(),
    getCreditLogs(),
    getUserSettings(),
    getUserProjection(),
  ]);

  const planStart = settings?.plan_start_date ?? PLAN_START_DATE;
  const phase = await getFitnessPhase(planStart);
  const quarter = getCurrentQuarter(planStart);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-title">{PLAN_PAGE.title}</h1>
            <p className="mt-1 text-caption text-text-secondary">Reference document · controls on feature pages</p>
          </div>
          <Link
            href="/"
            className="text-caption text-text-secondary underline-offset-2 hover:text-text-primary hover:underline"
          >
            Back to dashboard
          </Link>
        </div>

        <CollapsibleSection title="Overview" description={PLAN_PAGE.paragraphs[0]} defaultOpen>
          <Card>
            <CardContent className="space-y-2 pt-4 text-body text-text-secondary">
              {PLAN_PAGE.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </CardContent>
          </Card>
        </CollapsibleSection>

        <StandingSnapshot />
        <OnePageTable currentQuarter={quarter} />

        <CollapsibleSection title="Strategy reference" description="Payoff, duplex, business, habit floors">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PayoffRationale />
            <DuplexCashPlan />
            <BusinessTargets />
            <FloorsTable />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Checklists" description="One-time and ongoing tracks">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ChecklistTrack track="first_two_weeks" items={checklist} />
            <ChecklistTrack track="mortgage" items={checklist} />
            <ChecklistTrack track="business" items={checklist} />
            <ChecklistTrack track="capacity" items={checklist} />
          </div>
          <div className="mt-4">
            <ChecklistTrack track="credit_repair" items={checklist} />
          </div>
        </CollapsibleSection>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CreditTracker logs={credit} />
          <PlanFactsForm
            facts={facts}
            debtFreeLabel={bundle.debtFreeLabel}
            closingLabel={bundle.closingLabel}
          />
          <WeeklyReviewReference />
          <FitnessTargetsCard />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fitness phases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {FITNESS_PHASES.map((p) => (
              <Panel key={p.name}>
                <p className="text-body font-medium">
                  {p.name}{" "}
                  <span className="text-text-tertiary">· months {p.months}</span>
                  {p.name === phase ? " · current" : ""}
                </p>
                <p className="mt-1 text-caption text-text-secondary">{p.focus}</p>
              </Panel>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

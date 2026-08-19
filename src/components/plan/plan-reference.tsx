import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Panel } from "@/components/ui/panel";
import { formatCurrency } from "@/lib/utils";
import { STRENGTH_TARGETS } from "@/lib/seed";
import {
  BUSINESS_QUARTER_TARGETS,
  DUPLEX_CASH_BREAKDOWN,
  FITNESS_BODY_TARGETS,
  HABIT_FLOOR_TABLE,
  PAYOFF_RATIONALE,
  PAYOFF_RATIONALE_FOOTNOTE,
  POST_DEBT_MONTHLY_CAPACITY,
  STARTING_SNAPSHOT,
  WEEKLY_REVIEW_QUESTIONS,
} from "@/content/plan";

export function StandingSnapshot() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Where you stand</CardTitle>
        <CardDescription>The surplus is temporary. Convert it into assets before it disappears.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STARTING_SNAPSHOT.map((row) => (
          <Panel key={row.label}>
            <p className="text-caption text-text-secondary">{row.label}</p>
            <p className="mt-1 text-body font-medium text-text-primary">{row.value}</p>
          </Panel>
        ))}
      </CardContent>
    </Card>
  );
}

export function DuplexCashPlan() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>$30,000 duplex cash</CardTitle>
        <CardDescription>
          After the car dies, monthly capacity jumps to ~{formatCurrency(POST_DEBT_MONTHLY_CAPACITY)}.
          Do not spend down to zero at closing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {DUPLEX_CASH_BREAKDOWN.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-3 text-body">
            <p className="text-text-secondary">{row.label}</p>
            <p className="shrink-0 font-medium text-text-primary">{formatCurrency(row.amount)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function PayoffRationale() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Why this payoff order</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-body text-text-secondary">{PAYOFF_RATIONALE}</p>
        <p className="mt-2 text-body text-text-secondary">{PAYOFF_RATIONALE_FOOTNOTE}</p>
      </CardContent>
    </Card>
  );
}

export function BusinessTargets() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Residential targets</CardTitle>
        <CardDescription>Every $8,300 of new residential revenue = $1,000 commission.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {BUSINESS_QUARTER_TARGETS.map((row) => (
          <Panel key={row.label}>
            <p className="text-body font-medium">{row.label}</p>
            <p className="mt-1 text-caption text-text-secondary">{row.target}</p>
          </Panel>
        ))}
      </CardContent>
    </Card>
  );
}

export function FloorsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Habit floors</CardTitle>
        <CardDescription>
          Hitting the floor counts. Never miss twice. The plan has to work on your worst weeks.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {HABIT_FLOOR_TABLE.map((row) => (
          <Panel key={row.habit}>
            <p className="text-body font-medium">{row.habit}</p>
            <p className="mt-1 text-caption text-text-secondary">Full: {row.full}</p>
            <p className="text-caption text-text-tertiary">Floor: {row.floor}</p>
          </Panel>
        ))}
      </CardContent>
    </Card>
  );
}

export function WeeklyReviewReference() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sunday review · 20 minutes</CardTitle>
        <CardDescription>Write the answers down. That is what turns a document into a life.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {WEEKLY_REVIEW_QUESTIONS.map((question, index) => (
          <p key={question.id} className="text-body text-text-secondary">
            <span className="text-text-primary">{index + 1}.</span> {question.label}
            {"detail" in question && question.detail ? ` (${question.detail})` : ""}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}

export function FitnessTargetsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{FITNESS_BODY_TARGETS.title}</CardTitle>
        <CardDescription>{FITNESS_BODY_TARGETS.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {STRENGTH_TARGETS.map((target) => (
          <div key={target.exercise} className="flex justify-between text-body">
            <span className="text-text-secondary">{target.exercise}</span>
            <span className="text-text-primary">
              {target.min}–{target.max} lbs
            </span>
          </div>
        ))}
        <div className="flex justify-between text-body">
          <span className="text-text-secondary">Longest run</span>
          <span className="text-text-primary">{FITNESS_BODY_TARGETS.longestRun}</span>
        </div>
        <div className="flex justify-between text-body">
          <span className="text-text-secondary">Body</span>
          <span className="text-text-primary">{FITNESS_BODY_TARGETS.body}</span>
        </div>
      </CardContent>
    </Card>
  );
}

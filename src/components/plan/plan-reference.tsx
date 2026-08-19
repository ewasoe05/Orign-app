import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      <CardContent className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {STARTING_SNAPSHOT.map((row) => (
          <div key={row.label} className="rounded-lg border border-zinc-800 p-3">
            <p className="text-xs text-zinc-500">{row.label}</p>
            <p className="mt-1 text-sm font-medium text-zinc-100">{row.value}</p>
          </div>
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
          <div key={row.label} className="flex items-start justify-between gap-3 text-sm">
            <p className="text-zinc-400">{row.label}</p>
            <p className="shrink-0 font-medium text-zinc-100">{formatCurrency(row.amount)}</p>
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
        <p className="text-sm text-zinc-400">{PAYOFF_RATIONALE}</p>
        <p className="mt-2 text-sm text-zinc-400">{PAYOFF_RATIONALE_FOOTNOTE}</p>
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
          <div key={row.label} className="rounded-lg border border-zinc-800 p-3">
            <p className="text-sm font-medium">{row.label}</p>
            <p className="mt-1 text-xs text-zinc-400">{row.target}</p>
          </div>
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
          <div key={row.habit} className="rounded-lg border border-zinc-800 p-3">
            <p className="text-sm font-medium">{row.habit}</p>
            <p className="mt-1 text-xs text-zinc-400">Full: {row.full}</p>
            <p className="text-xs text-zinc-500">Floor: {row.floor}</p>
          </div>
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
          <p key={question.id} className="text-sm text-zinc-400">
            <span className="text-zinc-300">{index + 1}.</span>             {question.label}
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
          <div key={target.exercise} className="flex justify-between text-sm">
            <span className="text-zinc-400">{target.exercise}</span>
            <span className="text-zinc-100">
              {target.min}–{target.max} lbs
            </span>
          </div>
        ))}
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Longest run</span>
          <span className="text-zinc-100">{FITNESS_BODY_TARGETS.longestRun}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Body</span>
          <span className="text-zinc-100">{FITNESS_BODY_TARGETS.body}</span>
        </div>
      </CardContent>
    </Card>
  );
}

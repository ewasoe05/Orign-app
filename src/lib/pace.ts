export type PaceStatus = "ahead" | "on_track" | "behind";
export type PaceDirection = "lower" | "higher";

export type PaceInput = {
  monthStart: number;
  monthEndTarget: number;
  actual: number;
  today: Date;
  planMonthStart: Date;
  direction?: PaceDirection;
  graceDays?: number;
};

export type PaceResult = {
  status: PaceStatus;
  label: string;
  expected: number;
  actual: number;
  tolerance: number;
  dayOfMonth: number;
  daysInMonth: number;
  suppressedBehind: boolean;
  subline: string;
};

const DEFAULT_GRACE_DAYS = 5;

export function daysInCalendarMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function prorateExpected(
  monthStart: number,
  monthEndTarget: number,
  dayOfMonth: number,
  daysInMonth: number,
): number {
  const fraction = Math.min(1, Math.max(0, dayOfMonth / daysInMonth));
  return monthStart - (monthStart - monthEndTarget) * fraction;
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDollars(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Pace-aware status (Phase 4).
 * expected = monthStart − (monthStart − monthEndTarget) × (dayOfMonth / daysInMonth)
 *
 * Debt (lower is better): ahead if actual <= expected − tolerance.
 * Savings (higher is better): ahead if actual >= expected + tolerance.
 * Tolerance is 2% of the month's planned change. Behind is suppressed for the
 * first `graceDays` of the plan month so day 1 never reads Behind.
 */
export function getPaceStatus(input: PaceInput): PaceResult {
  const direction = input.direction ?? "lower";
  const graceDays = input.graceDays ?? DEFAULT_GRACE_DAYS;
  const planMonth = new Date(
    input.planMonthStart.getFullYear(),
    input.planMonthStart.getMonth(),
    1,
  );
  const days = daysInCalendarMonth(planMonth);

  let asOf = input.today;
  let dayOfMonth = input.today.getDate();

  if (input.today < planMonth) {
    asOf = planMonth;
    dayOfMonth = 1;
  } else if (
    input.today.getFullYear() !== planMonth.getFullYear() ||
    input.today.getMonth() !== planMonth.getMonth()
  ) {
    dayOfMonth = days;
    asOf = new Date(planMonth.getFullYear(), planMonth.getMonth(), days);
  }

  const expected = Math.round(
    prorateExpected(input.monthStart, input.monthEndTarget, dayOfMonth, days),
  );
  const plannedChange = Math.abs(input.monthStart - input.monthEndTarget);
  const tolerance = plannedChange * 0.02;
  const actual = input.actual;

  let raw: PaceStatus = "on_track";
  if (direction === "lower") {
    if (actual <= expected - tolerance) raw = "ahead";
    else if (actual > expected + tolerance) raw = "behind";
  } else if (actual >= expected + tolerance) {
    raw = "ahead";
  } else if (actual < expected - tolerance) {
    raw = "behind";
  }

  const suppressedBehind = raw === "behind" && dayOfMonth <= graceDays;
  const status: PaceStatus = suppressedBehind ? "on_track" : raw;
  const label = status === "ahead" ? "Ahead" : status === "behind" ? "Behind" : "On track";

  return {
    status,
    label,
    expected,
    actual,
    tolerance,
    dayOfMonth,
    daysInMonth: days,
    suppressedBehind,
    subline: `Expected ${formatDollars(expected)} by ${formatShortDate(asOf)} · actual ${formatDollars(actual)}.`,
  };
}

export function paceBadgeVariant(status: PaceStatus): "success" | "default" | "warning" {
  if (status === "ahead") return "success";
  if (status === "behind") return "warning";
  return "default";
}

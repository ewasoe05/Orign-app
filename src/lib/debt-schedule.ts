import { differenceInMonths, parseISO, startOfMonth } from "date-fns";
import { PAYOFF_SCHEDULE, PLAN_START_DATE, STARTING_DEBT_TOTAL } from "./seed";
import { getPaceStatus } from "./pace";

export function getCurrentPlanMonth(planStartDate: string = PLAN_START_DATE): number {
  const start = startOfMonth(parseISO(planStartDate));
  const now = startOfMonth(new Date());
  return Math.max(1, differenceInMonths(now, start) + 1);
}

export function getPlanMonthStart(planStartDate: string, month: number): Date {
  const [year, monthNum] = planStartDate.split("-").map(Number);
  return new Date(year, monthNum - 1 + (month - 1), 1);
}

export function getScheduleStatus(
  currentTotal: number,
  planStartDate: string = PLAN_START_DATE,
  today: Date = new Date(),
) {
  const month = getCurrentPlanMonth(planStartDate);
  const scheduleEntry =
    PAYOFF_SCHEDULE.find((entry) => entry.month === month) ??
    PAYOFF_SCHEDULE[PAYOFF_SCHEDULE.length - 1];
  const previousTarget =
    month <= 1
      ? STARTING_DEBT_TOTAL
      : (PAYOFF_SCHEDULE.find((entry) => entry.month === month - 1)?.targetRemaining ??
        STARTING_DEBT_TOTAL);

  const pace = getPaceStatus({
    monthStart: previousTarget,
    monthEndTarget: scheduleEntry.targetRemaining,
    actual: currentTotal,
    today,
    planMonthStart: getPlanMonthStart(planStartDate, month),
  });

  const progress =
    STARTING_DEBT_TOTAL > 0
      ? ((STARTING_DEBT_TOTAL - currentTotal) / STARTING_DEBT_TOTAL) * 100
      : 100;

  return {
    month,
    scheduleEntry,
    onTrack: pace.status !== "behind",
    pace,
    progress: Math.min(100, Math.max(0, progress)),
  };
}

export function getNextMilestone(
  accounts: { name: string; is_paid_off: boolean; priority: number }[],
) {
  const active = accounts
    .filter((account) => !account.is_paid_off)
    .sort((a, b) => a.priority - b.priority);

  if (active.length === 0) {
    return { title: "Debt-free!", description: "All accounts paid off." };
  }

  const samePriority = active.filter(
    (account) => account.priority === active[0].priority,
  );

  if (samePriority.length > 1) {
    return {
      title: `Pay off ${samePriority.map((a) => a.name.split(" ")[0]).join(" + ")}`,
      description: samePriority.map((a) => a.name).join(" and "),
    };
  }

  return {
    title: `Pay off ${active[0].name}`,
    description: "Next account in payoff order",
  };
}

export function buildPayoffChartData(
  payments: { payment_date: string; amount: number }[],
  planStartDate: string = PLAN_START_DATE,
) {
  const projected = PAYOFF_SCHEDULE.map((entry) => ({
    month: entry.label,
    projected: entry.targetRemaining,
    actual: null as number | null,
  }));

  let runningBalance = STARTING_DEBT_TOTAL;
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime(),
  );

  const actualByMonth = new Map<string, number>();
  for (const payment of sortedPayments) {
    runningBalance = Math.max(0, runningBalance - payment.amount);
    const monthKey = payment.payment_date.slice(0, 7);
    actualByMonth.set(monthKey, runningBalance);
  }

  const start = startOfMonth(parseISO(planStartDate));
  return projected.map((point, index) => {
    const monthDate = new Date(start);
    monthDate.setMonth(start.getMonth() + index);
    const key = monthDate.toISOString().slice(0, 7);

    let actual: number | null = null;
    for (const [monthKey, balance] of actualByMonth) {
      if (monthKey <= key) {
        actual = balance;
      }
    }

    if (index === 0 && actual === null) {
      actual = STARTING_DEBT_TOTAL;
    }

    return { ...point, actual };
  });
}

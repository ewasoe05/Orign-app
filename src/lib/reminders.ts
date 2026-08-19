import { addDaysIso, daysBetween, formatLocalDate } from "@/lib/utils";
import type { FollowUpItem, HabitFloorStatus, WeeklyReview } from "@/lib/types";

export type ReminderUrgency = "info" | "warning" | "danger";

export type ReminderItem = {
  key: string;
  scope: string;
  title: string;
  message: string;
  href?: string;
  urgency: ReminderUrgency;
  dismissible: boolean;
};

export function clampDueDay(dueDay: number, year: number, month: number): number {
  const lastDay = new Date(year, month, 0).getDate();
  return Math.min(dueDay, lastDay);
}

export function nextDueDateIso(dueDay: number, today: Date = new Date()): string {
  const todayIso = formatLocalDate(today);
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  let dueIso = formatLocalDate(new Date(year, month - 1, clampDueDay(dueDay, year, month)));

  if (dueIso < todayIso) {
    const next = new Date(year, month, 1);
    year = next.getFullYear();
    month = next.getMonth() + 1;
    dueIso = formatLocalDate(new Date(year, month - 1, clampDueDay(dueDay, year, month)));
  }

  return dueIso;
}

export function daysUntilPaymentDue(dueDay: number, today: Date = new Date()): number {
  return daysBetween(formatLocalDate(today), nextDueDateIso(dueDay, today));
}

export function paymentDueLabel(dueDay: number, today: Date = new Date()): string | null {
  const days = daysUntilPaymentDue(dueDay, today);
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  if (days <= 3) return `Due in ${days} day${days === 1 ? "" : "s"}`;
  return null;
}

export function isSundayLocal(today: Date = new Date()): boolean {
  return today.getDay() === 0;
}

export function isEveningLocal(today: Date = new Date(), hourThreshold = 17): boolean {
  return today.getHours() >= hourThreshold;
}

export function isLastFiveDaysOfMonth(today: Date = new Date()): boolean {
  const day = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return day >= daysInMonth - 4;
}

export function monthScope(today: Date = new Date()): string {
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function hasWeeklyReviewToday(reviews: WeeklyReview[], today: Date = new Date()): boolean {
  const todayIso = formatLocalDate(today);
  return reviews.some((review) => review.review_date === todayIso);
}

export function getPlanMonthNumber(planStartDate: string, today: Date = new Date()): number {
  const [year, month, day] = planStartDate.split("-").map(Number);
  const start = new Date(year, month - 1, day);
  const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
  const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return Math.max(
    1,
    (todayMonth.getFullYear() - startMonth.getFullYear()) * 12 +
      (todayMonth.getMonth() - startMonth.getMonth()) +
      1,
  );
}

export function getCurrentPlanQuarter(planStartDate: string, today: Date = new Date()): number {
  return Math.min(8, Math.max(1, Math.ceil(getPlanMonthNumber(planStartDate, today) / 3)));
}

export function isQuarterEndWindow(planStartDate: string, today: Date = new Date()): boolean {
  const planMonth = getPlanMonthNumber(planStartDate, today);
  const monthInQuarter = (planMonth - 1) % 3;
  if (monthInQuarter !== 2) return false;
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return today.getDate() >= daysInMonth - 6;
}

export function isDismissed(
  dismissals: { reminder_key: string; scope: string }[],
  key: string,
  scope: string,
): boolean {
  return dismissals.some((row) => row.reminder_key === key && row.scope === scope);
}

export function buildReminders(input: {
  today?: Date;
  dismissals: { reminder_key: string; scope: string }[];
  habits: HabitFloorStatus[];
  followUps: FollowUpItem[];
  paidThisMonth: number;
  debtTarget: number;
  debtFree: boolean;
  reviews: WeeklyReview[];
  quarterlyReviewQuarters: number[];
  planStartDate: string;
  accounts: {
    name: string;
    due_day_of_month: number | null;
    is_paid_off: boolean;
  }[];
}): ReminderItem[] {
  const today = input.today ?? new Date();
  const scope = monthScope(today);
  const reminders: ReminderItem[] = [];

  for (const account of input.accounts) {
    if (account.is_paid_off || account.due_day_of_month == null) continue;
    const label = paymentDueLabel(account.due_day_of_month, today);
    if (!label) continue;
    reminders.push({
      key: `payment_due:${account.name}`,
      scope,
      title: account.name,
      message: `Minimum payment ${label.toLowerCase()}.`,
      href: "/debt",
      urgency: label.includes("overdue") ? "danger" : "warning",
      dismissible: false,
    });
  }

  if (isEveningLocal(today)) {
    for (const habit of input.habits) {
      if (habit.hitToday) continue;
      reminders.push({
        key: `habit:${habit.key}`,
        scope: formatLocalDate(today),
        title: habit.neverMissTwice ? "Don't miss twice" : "Habit floor",
        message: habit.neverMissTwice
          ? `${habit.name} — mark today or you break the streak.`
          : `${habit.name} still unmarked today.`,
        href: "/",
        urgency: habit.neverMissTwice ? "danger" : "warning",
        dismissible: false,
      });
    }
  }

  if (isSundayLocal(today)) {
    const done = hasWeeklyReviewToday(input.reviews, today);
    reminders.push({
      key: "sunday_review",
      scope: formatLocalDate(today),
      title: "Weekly review",
      message: done
        ? "Sunday review logged — nice work."
        : "Sunday review time — 20 minutes to keep the plan alive.",
      href: "/review",
      urgency: done ? "info" : "warning",
      dismissible: false,
    });
  }

  if (
    !input.debtFree &&
    isLastFiveDaysOfMonth(today) &&
    input.paidThisMonth < input.debtTarget &&
    !isDismissed(input.dismissals, "month_end_payment", scope)
  ) {
    reminders.push({
      key: "month_end_payment",
      scope,
      title: "Month-end payment",
      message: `Only ${Math.max(0, input.debtTarget - input.paidThisMonth).toFixed(0)} left toward your $${input.debtTarget} extra-payment target this month.`,
      href: "/debt",
      urgency: "warning",
      dismissible: true,
    });
  }

  const actionableFollowUps = input.followUps.filter(
    (item) => item.overdue || item.daysUntilDue <= 0,
  );
  if (actionableFollowUps.length > 0) {
    reminders.push({
      key: "follow_up_queue",
      scope: formatLocalDate(today),
      title: "Lead follow-ups",
      message: `${actionableFollowUps.length} follow-up${actionableFollowUps.length === 1 ? "" : "s"} due today or overdue.`,
      href: "/business",
      urgency: actionableFollowUps.some((item) => item.overdue) ? "danger" : "warning",
      dismissible: false,
    });
  }

  const quarter = getCurrentPlanQuarter(input.planStartDate, today);
  if (
    isQuarterEndWindow(input.planStartDate, today) &&
    !input.quarterlyReviewQuarters.includes(quarter)
  ) {
    reminders.push({
      key: "quarterly_checkpoint",
      scope: `Q${quarter}`,
      title: `Q${quarter} checkpoint`,
      message: "Quarter is wrapping up — log money, business, and body status.",
      href: "/review",
      urgency: "warning",
      dismissible: false,
    });
  }

  return reminders;
}

export function sortRemindersForDashboard(reminders: ReminderItem[]): ReminderItem[] {
  const weight: Record<ReminderUrgency, number> = { danger: 0, warning: 1, info: 2 };
  return [...reminders].sort((a, b) => weight[a.urgency] - weight[b.urgency]);
}

export function isSundayReviewPromoted(today: Date = new Date()): boolean {
  return isSundayLocal(today);
}

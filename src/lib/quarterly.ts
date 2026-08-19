import { differenceInMonths, parseISO, startOfMonth } from "date-fns";
import { QUARTERLY_PLAN } from "@/content/plan";
import { PLAN_START_DATE } from "@/lib/seed";

export function getCurrentQuarter(planStartDate: string = PLAN_START_DATE): number {
  const start = startOfMonth(parseISO(planStartDate));
  const now = startOfMonth(new Date());
  const months = Math.max(0, differenceInMonths(now, start));
  return Math.min(8, Math.max(1, Math.floor(months / 3) + 1));
}

export function getQuarterPlan(quarter: number) {
  return QUARTERLY_PLAN.find((entry) => entry.quarter === quarter) ?? QUARTERLY_PLAN[0];
}

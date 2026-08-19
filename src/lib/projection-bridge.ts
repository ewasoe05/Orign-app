import type { DebtAccount, DebtPayment, PlanFacts } from "@/lib/types";
import { PLAN_START_DATE, SAVINGS_STARTING_CASH } from "@/lib/seed";
import {
  BUDGET,
  aprPercentToBps,
  buildActualRows,
  centsToDollars,
  dollarsToCents,
  formatMonthLabel,
  project,
  projectMinimumsOnly,
  resolveMonthlyOutlayCents,
  type Projection,
  type ProjectionAccount,
  type ProjectionInput,
} from "@/lib/projection";
import { getCurrentPlanMonth } from "@/lib/debt-schedule";

export type MilestoneProjection = {
  amount: number;
  label: string;
  description: string;
  projectedDate: string | null;
  baselineDate: string | null;
  moved: boolean;
  hit: boolean;
};

export type PayoffChartPoint = {
  month: string;
  projected: number;
  actual: number | null;
};

export type InterestSummary = {
  paidToDateCents: number;
  projectedRemainingCents: number;
  savedVsMinimumsCents: number | null;
  minimumsOnlyLabel: string;
};

export type UserProjectionBundle = {
  projection: Projection;
  monthlyOutlayCents: number;
  chartData: PayoffChartPoint[];
  milestones: MilestoneProjection[];
  interest: InterestSummary;
  debtFreeLabel: string | null;
  closingLabel: string | null;
  feasible: boolean;
};

const BASELINE_MILESTONES = [
  { amount: 6000, date: "2027-08-01", label: "Aug 2027", description: "$6K emergency fund" },
  { amount: 18600, date: "2028-01-01", label: "Jan 2028", description: "$18.6K saved" },
  { amount: 30600, date: "2028-06-01", label: "Jun 2028", description: "$30.6K down payment" },
  { amount: 35400, date: "2028-08-01", label: "Aug 2028", description: "$35.4K — close on duplex" },
] as const;

function toProjectionAccount(account: DebtAccount): ProjectionAccount {
  return {
    id: account.id,
    name: account.name,
    balanceCents: dollarsToCents(Number(account.initial_balance)),
    aprBps: aprPercentToBps(account.interest_rate),
    minPaymentCents: dollarsToCents(Number(account.min_payment ?? 25)),
    priority: account.priority,
  };
}

function toCurrentAccounts(accounts: DebtAccount[]): ProjectionAccount[] {
  return accounts
    .filter((account) => !account.is_paid_off && Number(account.current_balance) > 0)
    .map((account) => ({
      id: account.id,
      name: account.name,
      balanceCents: dollarsToCents(Number(account.current_balance)),
      aprBps: aprPercentToBps(account.interest_rate),
      minPaymentCents: dollarsToCents(Number(account.min_payment ?? 25)),
      priority: account.priority,
    }));
}

export function buildProjectionInput(options: {
  accounts: DebtAccount[];
  planStartDate: string;
  expensesIncludeCar?: boolean | null;
  monthlyOutlayCents?: number;
  useCurrentBalances?: boolean;
}): ProjectionInput {
  const source = options.useCurrentBalances
    ? toCurrentAccounts(options.accounts)
    : accountsToInitialProjection(options.accounts);
  const totalMinPaymentsCents = source.reduce((sum, account) => sum + account.minPaymentCents, 0);

  return {
    accounts: source.length > 0 ? source : accountsToInitialProjection(options.accounts),
    monthlyOutlayCents:
      options.monthlyOutlayCents ??
      resolveMonthlyOutlayCents(options.expensesIncludeCar, totalMinPaymentsCents),
    savingsRateCents: BUDGET.savingsRateCents,
    startingCashCents: BUDGET.startingCashCents,
    savingsGoalCents: BUDGET.downPaymentGoalCents,
    startMonth: options.planStartDate.slice(0, 7),
  };
}

function accountsToInitialProjection(accounts: DebtAccount[]): ProjectionAccount[] {
  return accounts.map(toProjectionAccount);
}

function groupPaymentsByMonth(payments: DebtPayment[]): Map<string, { accountId: string; amountCents: number }[]> {
  const grouped = new Map<string, { accountId: string; amountCents: number }[]>();
  for (const payment of payments) {
    const month = payment.payment_date.slice(0, 7);
    const list = grouped.get(month) ?? [];
    list.push({
      accountId: payment.account_id,
      amountCents: dollarsToCents(Number(payment.amount)),
    });
    grouped.set(month, list);
  }
  return grouped;
}

function monthLabelFromIso(isoDate: string | null): string | null {
  if (!isoDate) return null;
  return formatMonthLabel(isoDate.slice(0, 7));
}

function findCashMonth(projection: Projection, amountCents: number): string | null {
  const row = projection.rows.find((entry) => entry.cashCents >= amountCents);
  return row?.month ?? null;
}

export function buildUserProjectionBundle(options: {
  accounts: DebtAccount[];
  payments: DebtPayment[];
  planStartDate?: string;
  planFacts?: PlanFacts | null;
  monthlyOutlayCents?: number;
  cashOnHand?: number;
}): UserProjectionBundle {
  const planStartDate = options.planStartDate ?? PLAN_START_DATE;
  const input = buildProjectionInput({
    accounts: options.accounts,
    planStartDate,
    expensesIncludeCar: options.planFacts?.expenses_include_car,
    monthlyOutlayCents: options.monthlyOutlayCents,
  });

  const projection = project(input);
  const baseline = project(
    buildProjectionInput({
      accounts: options.accounts,
      planStartDate,
      expensesIncludeCar: null,
    }),
  );

  const actualRows = buildActualRows(input, groupPaymentsByMonth(options.payments));
  let lastActual: number | null = null;
  const chartData: PayoffChartPoint[] = projection.rows
    .filter((row, index) => index < 10 || row.endingBalanceCents === 0)
    .slice(0, 11)
    .map((row) => {
      const actualRow = actualRows.find((entry) => entry.month === row.month);
      if (actualRow) {
        lastActual = centsToDollars(actualRow.endingBalanceCents);
      }
      return {
        month: formatMonthLabel(row.month),
        projected: centsToDollars(row.endingBalanceCents),
        actual: lastActual,
      };
    });

  const cashOnHand = options.cashOnHand ?? SAVINGS_STARTING_CASH;
  const milestones: MilestoneProjection[] = BASELINE_MILESTONES.map((milestone) => {
    const projectedDate = findCashMonth(projection, dollarsToCents(milestone.amount));
    const baselineDate = findCashMonth(baseline, dollarsToCents(milestone.amount));
    return {
      amount: milestone.amount,
      label: milestone.label,
      description: milestone.description,
      projectedDate: projectedDate ? `${projectedDate}-01` : null,
      baselineDate: baselineDate ? `${baselineDate}-01` : null,
      moved: Boolean(projectedDate && baselineDate && projectedDate !== baselineDate),
      hit: cashOnHand >= milestone.amount,
    };
  });

  const paidToDateCents = actualRows.reduce((sum, row) => sum + row.interestCents, 0);
  const minimumsOnly = projectMinimumsOnly(input);
  const savedVsMinimumsCents =
    minimumsOnly && minimumsOnly.feasible
      ? minimumsOnly.totalInterestCents - projection.totalInterestCents
      : null;

  return {
    projection,
    monthlyOutlayCents: input.monthlyOutlayCents,
    chartData,
    milestones,
    interest: {
      paidToDateCents,
      projectedRemainingCents: Math.max(0, projection.totalInterestCents - paidToDateCents),
      savedVsMinimumsCents,
      minimumsOnlyLabel:
        minimumsOnly?.debtFreeMonth != null
          ? monthLabelFromIso(minimumsOnly.debtFreeMonth) ?? "30+ years"
          : "30+ years",
    },
    debtFreeLabel: monthLabelFromIso(projection.debtFreeMonth),
    closingLabel: monthLabelFromIso(projection.closingMonth),
    feasible: projection.feasible,
  };
}

export function buildWhatIfSummary(
  accounts: DebtAccount[],
  planFacts: PlanFacts | null | undefined,
  monthlyOutlayDollars: number,
  planStartDate: string = PLAN_START_DATE,
) {
  const bundle = buildUserProjectionBundle({
    accounts,
    payments: [],
    planStartDate,
    planFacts,
    monthlyOutlayCents: dollarsToCents(monthlyOutlayDollars),
  });

  return {
    debtFreeLabel: bundle.debtFreeLabel,
    closingLabel: bundle.closingLabel,
    totalInterest: centsToDollars(bundle.projection.totalInterestCents),
    feasible: bundle.feasible,
  };
}

export function scheduleRowsFromProjection(
  projection: Projection,
  currentTotal: number,
  planStartDate: string,
) {
  const currentMonthIndex = getCurrentPlanMonth(planStartDate);
  return projection.rows
    .filter((row) => row.startingBalanceCents > 0 || row.endingBalanceCents === 0)
    .slice(0, 10)
    .map((row, index) => ({
      month: index + 1,
      label: formatMonthLabel(row.month),
      action: row.label,
      targetRemaining: centsToDollars(row.endingBalanceCents),
      complete:
        row.endingBalanceCents === 0
          ? currentTotal === 0
          : currentTotal <= centsToDollars(row.endingBalanceCents),
      isCurrent: index + 1 === currentMonthIndex,
    }));
}

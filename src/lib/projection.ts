export type ProjectionAccount = {
  id: string;
  name: string;
  balanceCents: number;
  aprBps: number;
  minPaymentCents: number;
  priority: number;
};

export type ProjectionInput = {
  accounts: ProjectionAccount[];
  monthlyOutlayCents: number;
  savingsRateCents: number;
  startingCashCents: number;
  savingsGoalCents: number;
  startMonth: string;
  maxMonths?: number;
};

export type MonthPayment = {
  accountId: string;
  amountCents: number;
  paidOff: boolean;
};

export type MonthRow = {
  month: string;
  startingBalanceCents: number;
  interestCents: number;
  principalCents: number;
  endingBalanceCents: number;
  cashCents: number;
  payments: MonthPayment[];
  label: string;
};

export type Projection = {
  rows: MonthRow[];
  debtFreeMonth: string | null;
  downPaymentMonth: string | null;
  closingMonth: string | null;
  totalInterestCents: number;
  feasible: boolean;
};

type SimAccount = ProjectionAccount & { balanceCents: number };

export function dollarsToCents(amount: number): number {
  return Math.round(amount * 100);
}

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function aprPercentToBps(rate: number | null | undefined): number {
  if (rate == null || Number.isNaN(rate)) return 0;
  return Math.round(rate * 100);
}

export function addMonths(month: string, offset: number): string {
  const [year, monthNum] = month.split("-").map(Number);
  const date = new Date(year, monthNum - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split("-").map(Number);
  return new Date(year, monthNum - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function cloneAccounts(accounts: ProjectionAccount[]): SimAccount[] {
  return accounts.map((account) => ({ ...account, balanceCents: account.balanceCents }));
}

function activeAccounts(accounts: SimAccount[]): SimAccount[] {
  return accounts.filter((account) => account.balanceCents > 0);
}

function totalBalance(accounts: SimAccount[]): number {
  return accounts.reduce((sum, account) => sum + account.balanceCents, 0);
}

function sortForAvalanche(accounts: SimAccount[]): SimAccount[] {
  return [...accounts].sort(
    (a, b) => a.priority - b.priority || a.balanceCents - b.balanceCents || a.id.localeCompare(b.id),
  );
}

function monthlyInterestCents(balanceCents: number, aprBps: number): number {
  if (balanceCents <= 0 || aprBps <= 0) return 0;
  return Math.round((balanceCents * aprBps) / 10000 / 12);
}

function buildMonthLabel(payments: MonthPayment[], accounts: SimAccount[]): string {
  const paidOff = payments.filter((payment) => payment.paidOff);
  if (paidOff.length === 0) {
    const target = sortForAvalanche(activeAccounts(accounts))[0];
    return target ? `All to ${shortName(target.name)}` : "Debt-free";
  }

  const names = paidOff
    .map((payment) => accounts.find((account) => account.id === payment.accountId)?.name)
    .filter(Boolean)
    .map((name) => shortName(name!));

  const remaining = sortForAvalanche(activeAccounts(accounts))[0];
  if (names.length === 1 && remaining) {
    return `Kill ${names[0]}. Rest to ${shortName(remaining.name)}.`;
  }
  if (names.length > 1 && remaining) {
    return `Kill ${names.join(" + ")}. Rest to ${shortName(remaining.name)}.`;
  }
  if (names.length > 0) {
    return `Kill ${names.join(" + ")}.`;
  }
  return "Debt-free.";
}

function shortName(name: string): string {
  if (name.includes("Savor")) return "Savor";
  if (name.includes("Citizens")) return "Citizens";
  if (name.includes("Amazon")) return "Amazon";
  if (name.includes("Quicksilver")) return "Quicksilver";
  if (name.includes("Ford") || name.includes("TrueCore")) return "auto";
  return name.split(" ")[0];
}

function simulateMonth(
  accounts: SimAccount[],
  monthlyOutlayCents: number,
  payMinimums: boolean,
): { interestCents: number; payments: MonthPayment[]; feasible: boolean; principalCents: number } {
  const balanceBeforeInterest = totalBalance(accounts);
  let interestCents = 0;
  for (const account of accounts) {
    if (account.balanceCents <= 0) continue;
    const interest = monthlyInterestCents(account.balanceCents, account.aprBps);
    account.balanceCents += interest;
    interestCents += interest;
  }

  const active = activeAccounts(accounts);
  const minimumDue = payMinimums
    ? active.reduce((sum, account) => sum + account.minPaymentCents, 0)
    : 0;

  if (monthlyOutlayCents < minimumDue) {
    return { interestCents, payments: [], feasible: false, principalCents: 0 };
  }

  let remaining = monthlyOutlayCents;
  const payments: MonthPayment[] = [];

  if (payMinimums) {
    for (const account of sortForAvalanche(active)) {
      if (remaining <= 0) break;
      const pay = Math.min(account.minPaymentCents, account.balanceCents, remaining);
      if (pay <= 0) continue;
      account.balanceCents -= pay;
      remaining -= pay;
      payments.push({
        accountId: account.id,
        amountCents: pay,
        paidOff: account.balanceCents === 0,
      });
    }
  }

  while (remaining > 0) {
    const target = sortForAvalanche(activeAccounts(accounts))[0];
    if (!target) break;
    const pay = Math.min(remaining, target.balanceCents);
    if (pay <= 0) break;
    target.balanceCents -= pay;
    remaining -= pay;
    const existing = payments.find((entry) => entry.accountId === target.id);
    if (existing) {
      existing.amountCents += pay;
      existing.paidOff = target.balanceCents === 0;
    } else {
      payments.push({
        accountId: target.id,
        amountCents: pay,
        paidOff: target.balanceCents === 0,
      });
    }
  }

  const endingBalance = totalBalance(accounts);
  const principalCents = Math.max(0, balanceBeforeInterest + interestCents - endingBalance);

  const madeProgress = endingBalance < balanceBeforeInterest || endingBalance === 0;
  const isFeasible = monthlyOutlayCents >= minimumDue && (madeProgress || endingBalance === 0);

  return {
    interestCents,
    payments,
    feasible: isFeasible,
    principalCents,
  };
}

export function project(input: ProjectionInput): Projection {
  const maxMonths = input.maxMonths ?? 120;
  const accounts = cloneAccounts(input.accounts);
  let cashCents = input.startingCashCents;
  let totalInterestCents = 0;
  let debtFreeMonth: string | null = null;
  let downPaymentMonth: string | null = null;
  let closingMonth: string | null = null;
  const rows: MonthRow[] = [];
  let feasible = true;

  for (let index = 0; index < maxMonths; index += 1) {
    const month = addMonths(input.startMonth, index);
    const startingBalanceCents = totalBalance(accounts);

    if (startingBalanceCents === 0 && debtFreeMonth == null) {
      debtFreeMonth = month;
    }

    if (startingBalanceCents === 0) {
      cashCents += input.savingsRateCents;
      if (downPaymentMonth == null && cashCents >= input.savingsGoalCents) {
        downPaymentMonth = month;
      }
      if (closingMonth == null && cashCents >= BUDGET.closingGoalCents) {
        closingMonth = month;
      }

      rows.push({
        month,
        startingBalanceCents: 0,
        interestCents: 0,
        principalCents: 0,
        endingBalanceCents: 0,
        cashCents,
        payments: [],
        label: cashCents >= input.savingsGoalCents ? "Saving for duplex" : "Debt-free. Saving.",
      });

      if (closingMonth) break;
      continue;
    }

    const result = simulateMonth(accounts, input.monthlyOutlayCents, true);
    if (!result.feasible) {
      feasible = false;
      break;
    }

    totalInterestCents += result.interestCents;
    const endingBalanceCents = totalBalance(accounts);
    if (endingBalanceCents === 0 && debtFreeMonth == null) {
      debtFreeMonth = month;
    }

    rows.push({
      month,
      startingBalanceCents,
      interestCents: result.interestCents,
      principalCents: result.principalCents,
      endingBalanceCents,
      cashCents,
      payments: result.payments,
      label: buildMonthLabel(result.payments, accounts),
    });
  }

  return {
    rows,
    debtFreeMonth,
    downPaymentMonth,
    closingMonth,
    totalInterestCents,
    feasible,
  };
}

export function projectMinimumsOnly(input: ProjectionInput): Projection | null {
  const active = input.accounts.filter((account) => account.balanceCents > 0);
  const minimumDue = active.reduce((sum, account) => sum + account.minPaymentCents, 0);
  if (minimumDue <= 0) return project({ ...input, monthlyOutlayCents: 0, maxMonths: input.maxMonths ?? 360 });

  const trial = project({ ...input, monthlyOutlayCents: minimumDue, maxMonths: input.maxMonths ?? 360 });
  if (!trial.feasible || trial.debtFreeMonth == null) return null;
  return trial;
}

export type ActualPayment = {
  accountId: string;
  amountCents: number;
};

export function buildActualRows(
  input: ProjectionInput,
  paymentsByMonth: Map<string, ActualPayment[]>,
): MonthRow[] {
  const accounts = cloneAccounts(input.accounts);
  let cashCents = input.startingCashCents;
  const rows: MonthRow[] = [];
  const maxMonths = input.maxMonths ?? 120;

  for (let index = 0; index < maxMonths; index += 1) {
    const month = addMonths(input.startMonth, index);
    const startingBalanceCents = totalBalance(accounts);
    if (startingBalanceCents === 0 && rows.length > 0 && rows[rows.length - 1]?.endingBalanceCents === 0) {
      break;
    }

    let interestCents = 0;
    for (const account of accounts) {
      if (account.balanceCents <= 0) continue;
      const interest = monthlyInterestCents(account.balanceCents, account.aprBps);
      account.balanceCents += interest;
      interestCents += interest;
    }

    const monthPayments = paymentsByMonth.get(month) ?? [];
    const applied: MonthPayment[] = [];
    let principalCents = 0;

    for (const payment of monthPayments) {
      const account = accounts.find((entry) => entry.id === payment.accountId);
      if (!account || account.balanceCents <= 0) continue;
      const pay = Math.min(payment.amountCents, account.balanceCents);
      account.balanceCents -= pay;
      principalCents += Math.max(0, pay - Math.min(interestCents, pay));
      applied.push({
        accountId: account.id,
        amountCents: pay,
        paidOff: account.balanceCents === 0,
      });
    }

    const endingBalanceCents = totalBalance(accounts);
    if (endingBalanceCents === 0) {
      cashCents += input.savingsRateCents;
    }

    rows.push({
      month,
      startingBalanceCents,
      interestCents,
      principalCents,
      endingBalanceCents,
      cashCents,
      payments: applied,
      label: buildMonthLabel(applied, accounts),
    });

    if (endingBalanceCents === 0) break;
  }

  return rows;
}

export const BUDGET = {
  takeHomeCents: dollarsToCents(4000),
  expensesCents: dollarsToCents(1887),
  publishedOutlayCents: dollarsToCents(2395),
  savingsRateCents: dollarsToCents(2400),
  startingCashCents: dollarsToCents(1800),
  downPaymentGoalCents: dollarsToCents(30600),
  closingGoalCents: dollarsToCents(35400),
  emergencyFundCents: dollarsToCents(6000),
} as const;

export function resolveMonthlyOutlayCents(
  expensesIncludeCar: boolean | null | undefined,
  totalMinPaymentsCents: number,
): number {
  const surplus = BUDGET.takeHomeCents - BUDGET.expensesCents;
  if (expensesIncludeCar === true) {
    return surplus + totalMinPaymentsCents;
  }
  if (expensesIncludeCar === false) {
    return surplus;
  }
  return BUDGET.publishedOutlayCents;
}

export const PUBLISHED_PAYOFF_TARGETS = [
  19712, 17542, 15327, 13068, 10763, 8435, 6091, 3732, 1356, 0,
] as const;

export const PUBLISHED_SAVINGS_CHECKS = [
  { monthOffset: 11, amountCents: dollarsToCents(6600) },
  { monthOffset: 16, amountCents: dollarsToCents(18600) },
  { monthOffset: 21, amountCents: dollarsToCents(30600) },
  { monthOffset: 23, amountCents: dollarsToCents(35400) },
] as const;

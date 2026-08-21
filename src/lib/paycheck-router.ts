import { centsToDollars, dollarsToCents } from "@/lib/projection";
import type { PaycheckEntryKind, PaycheckLine, PaycheckPhase } from "@/lib/types";

export type RouterDebt = {
  id: string;
  name: string;
  balance: number;
  order: number;
};

export type RouterSettings = {
  essentialsPerCheck: number;
  extraTarget: number;
  hysaGoal: number;
  hysaBalance: number;
  unsweptBuffer: number;
  funPercent: number;
  funAllocatedTotal: number;
  emergencyFundTarget: number;
  milestoneMidPercent: number;
  milestoneNearPercent: number;
};

export type RoutePaycheckInput = {
  amount: number;
  settings: RouterSettings;
  debts: RouterDebt[];
  funPercentOverride?: number | null;
};

export type ApplyPlanResult = {
  debts: RouterDebt[];
  hysaBalance: number;
  lines: PaycheckLine[];
  milestone: string | null;
  savingsDeposit: number;
  debtPayments: { accountId: string; amount: number }[];
};

export type RoutePaycheckResult = {
  noOp: boolean;
  kind: PaycheckEntryKind;
  lines: PaycheckLine[];
  milestone: string | null;
  settings: RouterSettings;
  debts: RouterDebt[];
  amount: number;
  essentials: number;
  toPlan: number;
  funAmount: number;
  funPercentUsed: number;
  leftover: number;
  savingsDeposit: number;
  debtPayments: { accountId: string; amount: number }[];
};

export function clampFunPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function phase(debts: RouterDebt[]): PaycheckPhase {
  const totalCents = debts.reduce((sum, debt) => sum + dollarsToCents(debt.balance), 0);
  return totalCents > 0 ? "debt" : "savings";
}

export function milestoneFor(balance: number, settings: RouterSettings): string | null {
  const balanceCents = dollarsToCents(balance);
  const goalCents = dollarsToCents(settings.hysaGoal);
  const emergencyCents = dollarsToCents(settings.emergencyFundTarget);
  const nearPct = clampFunPercent(settings.milestoneNearPercent);
  const midPct = clampFunPercent(settings.milestoneMidPercent);

  const thresholds = [
    { at: goalCents, msg: "Goal funded — time to move to the next step." },
    {
      at: Math.round((goalCents * nearPct) / 100),
      msg: "Getting close — worth lining up next steps now.",
    },
    { at: Math.round((goalCents * midPct) / 100), msg: "Past the halfway marker." },
    {
      at: emergencyCents,
      msg: "Emergency fund complete. Everything past this is pure goal savings.",
    },
  ];

  const hit = thresholds.find((threshold) => threshold.at > 0 && balanceCents >= threshold.at);
  return hit?.msg ?? null;
}

export function previewFunSplit(
  amount: number,
  settings: RouterSettings,
  funPercent: number,
): { toPlanTotal: number; funAmount: number; toPlan: number; leftover: number; essentials: number } {
  const amountCents = Math.max(0, dollarsToCents(amount));
  const essentialsCents = Math.min(dollarsToCents(settings.essentialsPerCheck), amountCents);
  const remainingCents = amountCents - essentialsCents;
  const toPlanTotalCents = Math.min(dollarsToCents(settings.extraTarget), remainingCents);
  const leftoverCents = remainingCents - toPlanTotalCents;
  const funPct = clampFunPercent(funPercent);

  if (toPlanTotalCents <= 0) {
    return {
      essentials: centsToDollars(essentialsCents),
      toPlanTotal: 0,
      funAmount: 0,
      toPlan: 0,
      leftover: centsToDollars(leftoverCents),
    };
  }

  const funAmountCents = Math.round((toPlanTotalCents * funPct) / 100);
  return {
    essentials: centsToDollars(essentialsCents),
    toPlanTotal: centsToDollars(toPlanTotalCents),
    funAmount: centsToDollars(funAmountCents),
    toPlan: centsToDollars(toPlanTotalCents - funAmountCents),
    leftover: centsToDollars(leftoverCents),
  };
}

function cloneDebts(debts: RouterDebt[]): RouterDebt[] {
  return debts
    .map((debt) => ({
      id: debt.id,
      name: debt.name,
      balance: centsToDollars(dollarsToCents(debt.balance)),
      order: debt.order,
    }))
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

function cloneSettings(settings: RouterSettings): RouterSettings {
  return {
    essentialsPerCheck: centsToDollars(dollarsToCents(settings.essentialsPerCheck)),
    extraTarget: centsToDollars(dollarsToCents(settings.extraTarget)),
    hysaGoal: centsToDollars(dollarsToCents(settings.hysaGoal)),
    hysaBalance: centsToDollars(dollarsToCents(settings.hysaBalance)),
    unsweptBuffer: centsToDollars(dollarsToCents(settings.unsweptBuffer)),
    funPercent: clampFunPercent(settings.funPercent),
    funAllocatedTotal: centsToDollars(dollarsToCents(settings.funAllocatedTotal)),
    emergencyFundTarget: centsToDollars(dollarsToCents(settings.emergencyFundTarget)),
    milestoneMidPercent: clampFunPercent(settings.milestoneMidPercent),
    milestoneNearPercent: clampFunPercent(settings.milestoneNearPercent),
  };
}

function pushLine(lines: PaycheckLine[], line: PaycheckLine) {
  if (dollarsToCents(line.amount) <= 0) return;
  lines.push(line);
}

function allocateToPlan(poolCents: number, settings: RouterSettings, debts: RouterDebt[]): ApplyPlanResult {
  const lines: PaycheckLine[] = [];
  const debtPayments: { accountId: string; amount: number }[] = [];
  let pool = poolCents;
  let milestone: string | null = null;
  let savingsDepositCents = 0;

  if (phase(debts) === "debt") {
    for (const debt of debts) {
      if (pool <= 0) break;
      const balanceCents = dollarsToCents(debt.balance);
      if (balanceCents <= 0) continue;

      const payCents = Math.min(pool, balanceCents);
      const remainingCents = balanceCents - payCents;
      debt.balance = centsToDollars(remainingCents);
      pool -= payCents;

      const pay = centsToDollars(payCents);
      debtPayments.push({ accountId: debt.id, amount: pay });
      pushLine(lines, {
        label: remainingCents <= 0 ? `${debt.name} — PAID OFF` : debt.name,
        amount: pay,
        type: "debt",
        accountId: debt.id,
        balanceAfter: debt.balance,
        subLabel: remainingCents <= 0 ? "Paid off" : `balance now ${centsToDollars(remainingCents).toFixed(2)}`,
      });
    }

    if (pool > 0) {
      settings.hysaBalance = centsToDollars(dollarsToCents(settings.hysaBalance) + pool);
      const saveAmount = centsToDollars(pool);
      savingsDepositCents = pool;
      pushLine(lines, {
        label: "Savings (goal account)",
        amount: saveAmount,
        type: "save",
        balanceAfter: settings.hysaBalance,
        subLabel: `balance now ${settings.hysaBalance.toFixed(2)}`,
      });
      milestone = "Debt-free. Every future paycheck now routes straight to savings.";
      pool = 0;
    }
  } else {
    if (pool > 0) {
      settings.hysaBalance = centsToDollars(dollarsToCents(settings.hysaBalance) + pool);
      const saveAmount = centsToDollars(pool);
      savingsDepositCents = pool;
      pushLine(lines, {
        label: "Savings (goal account)",
        amount: saveAmount,
        type: "save",
        balanceAfter: settings.hysaBalance,
        subLabel: `balance now ${settings.hysaBalance.toFixed(2)}`,
      });
    }
    milestone = milestoneFor(settings.hysaBalance, settings);
  }

  return {
    debts,
    hysaBalance: settings.hysaBalance,
    lines,
    milestone,
    savingsDeposit: centsToDollars(savingsDepositCents),
    debtPayments,
  };
}

export function routePaycheck(input: RoutePaycheckInput): RoutePaycheckResult {
  const settings = cloneSettings(input.settings);
  const debts = cloneDebts(input.debts);
  const amountCents = Math.max(0, dollarsToCents(input.amount));
  const funPercentUsed = clampFunPercent(
    input.funPercentOverride == null ? settings.funPercent : input.funPercentOverride,
  );

  const essentialsCents = Math.min(dollarsToCents(settings.essentialsPerCheck), amountCents);
  const remainingAfterEssentials = amountCents - essentialsCents;
  const toPlanTotalCents = Math.min(dollarsToCents(settings.extraTarget), remainingAfterEssentials);
  const leftoverCents = remainingAfterEssentials - toPlanTotalCents;

  const funAmountCents =
    toPlanTotalCents <= 0 ? 0 : Math.round((toPlanTotalCents * funPercentUsed) / 100);
  const toPlanCents = toPlanTotalCents - funAmountCents;

  const lines: PaycheckLine[] = [];
  pushLine(lines, {
    label: "Essentials & bills",
    amount: centsToDollars(essentialsCents),
    type: "hold",
  });
  pushLine(lines, {
    label: "Fun money — no strings attached",
    amount: centsToDollars(funAmountCents),
    type: "fun",
  });

  const allocated = allocateToPlan(toPlanCents, settings, debts);
  lines.push(...allocated.lines);

  if (leftoverCents > 0) {
    settings.unsweptBuffer = centsToDollars(dollarsToCents(settings.unsweptBuffer) + leftoverCents);
    pushLine(lines, {
      label: "Extra in checking",
      amount: centsToDollars(leftoverCents),
      type: "hold",
    });
  }

  settings.funAllocatedTotal = centsToDollars(
    dollarsToCents(settings.funAllocatedTotal) + funAmountCents,
  );

  return {
    noOp: false,
    kind: "paycheck",
    lines,
    milestone: allocated.milestone,
    settings,
    debts,
    amount: centsToDollars(amountCents),
    essentials: centsToDollars(essentialsCents),
    toPlan: centsToDollars(toPlanCents),
    funAmount: centsToDollars(funAmountCents),
    funPercentUsed,
    leftover: centsToDollars(leftoverCents),
    savingsDeposit: allocated.savingsDeposit,
    debtPayments: allocated.debtPayments,
  };
}

export function sweepBuffer(input: { settings: RouterSettings; debts: RouterDebt[] }): RoutePaycheckResult {
  const settings = cloneSettings(input.settings);
  const debts = cloneDebts(input.debts);
  const poolCents = dollarsToCents(settings.unsweptBuffer);

  if (poolCents <= 0) {
    return {
      noOp: true,
      kind: "sweep",
      lines: [],
      milestone: null,
      settings,
      debts,
      amount: 0,
      essentials: 0,
      toPlan: 0,
      funAmount: 0,
      funPercentUsed: 0,
      leftover: 0,
      savingsDeposit: 0,
      debtPayments: [],
    };
  }

  settings.unsweptBuffer = 0;
  const allocated = allocateToPlan(poolCents, settings, debts);

  return {
    noOp: false,
    kind: "sweep",
    lines: allocated.lines,
    milestone: allocated.milestone,
    settings,
    debts,
    amount: centsToDollars(poolCents),
    essentials: 0,
    toPlan: centsToDollars(poolCents),
    funAmount: 0,
    funPercentUsed: 0,
    leftover: 0,
    savingsDeposit: allocated.savingsDeposit,
    debtPayments: allocated.debtPayments,
  };
}

export function totalDebt(debts: RouterDebt[]): number {
  return centsToDollars(debts.reduce((sum, debt) => sum + Math.max(0, dollarsToCents(debt.balance)), 0));
}

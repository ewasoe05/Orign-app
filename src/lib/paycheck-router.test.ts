import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dollarsToCents } from "./projection";
import {
  clampFunPercent,
  milestoneFor,
  phase,
  previewFunSplit,
  routePaycheck,
  sweepBuffer,
  totalDebt,
  type RouterDebt,
  type RouterSettings,
} from "./paycheck-router";

function settings(overrides: Partial<RouterSettings> = {}): RouterSettings {
  return {
    essentialsPerCheck: 943.5,
    extraTarget: 1000,
    hysaGoal: 30000,
    hysaBalance: 1800,
    unsweptBuffer: 0,
    funPercent: 0,
    funAllocatedTotal: 0,
    emergencyFundTarget: 6000,
    milestoneMidPercent: 61,
    milestoneNearPercent: 84,
    ...overrides,
  };
}

function debts(rows: Array<Partial<RouterDebt> & { id: string; name: string; balance: number }>): RouterDebt[] {
  return rows.map((row, index) => ({
    order: row.order ?? index + 1,
    ...row,
  }));
}

describe("clampFunPercent", () => {
  it("clamps to 0–100 and rounds", () => {
    assert.equal(clampFunPercent(-4), 0);
    assert.equal(clampFunPercent(140), 100);
    assert.equal(clampFunPercent(12.4), 12);
    assert.equal(clampFunPercent(12.6), 13);
    assert.equal(clampFunPercent(Number.NaN), 0);
  });
});

describe("phase", () => {
  it("is debt while any balance remains", () => {
    assert.equal(phase(debts([{ id: "a", name: "A", balance: 0.01 }])), "debt");
  });

  it("is savings when every balance is zero", () => {
    assert.equal(phase(debts([{ id: "a", name: "A", balance: 0 }])), "savings");
    assert.equal(phase([]), "savings");
  });
});

describe("routePaycheck", () => {
  it("splits essentials, plan, and leftover with fun percent 0", () => {
    const result = routePaycheck({
      amount: 2200,
      settings: settings(),
      debts: debts([{ id: "card", name: "Card", balance: 5000 }]),
    });

    assert.equal(result.essentials, 943.5);
    assert.equal(result.toPlan, 1000);
    assert.equal(result.funAmount, 0);
    assert.equal(result.leftover, 256.5);
    assert.equal(result.settings.unsweptBuffer, 256.5);
    assert.equal(result.debts[0].balance, 4000);
    assert.equal(result.funPercentUsed, 0);
    assert.equal(
      result.lines.some((line) => line.type === "fun"),
      false,
    );
    assert.deepEqual(
      result.lines.map((line) => line.type),
      ["hold", "debt", "hold"],
    );
  });

  it("floors essentials at the paycheck amount and sends nothing to plan", () => {
    const result = routePaycheck({
      amount: 200,
      settings: settings(),
      debts: debts([{ id: "card", name: "Card", balance: 5000 }]),
    });

    assert.equal(result.essentials, 200);
    assert.equal(result.toPlan, 0);
    assert.equal(result.leftover, 0);
    assert.equal(result.funAmount, 0);
    assert.equal(result.debts[0].balance, 5000);
    assert.equal(result.lines.length, 1);
    assert.equal(result.lines[0].label, "Essentials & bills");
  });

  it("pays debts in user-defined order and stops at each remaining balance", () => {
    const result = routePaycheck({
      amount: 1943.5,
      settings: settings({ extraTarget: 1000 }),
      debts: debts([
        { id: "big", name: "Big", balance: 4000, order: 2 },
        { id: "small", name: "Small", balance: 200, order: 1 },
      ]),
    });

    assert.equal(result.debtPayments[0].accountId, "small");
    assert.equal(result.debtPayments[0].amount, 200);
    assert.equal(result.debtPayments[1].accountId, "big");
    assert.equal(result.debtPayments[1].amount, 800);
    assert.equal(result.debts.find((debt) => debt.id === "small")?.balance, 0);
    assert.equal(result.debts.find((debt) => debt.id === "big")?.balance, 3200);
    assert.equal(result.lines[1].label, "Small — PAID OFF");
    assert.equal(result.lines[2].label, "Big");
  });

  it("overflows into savings in the same call when the last debt clears", () => {
    const result = routePaycheck({
      amount: 1943.5,
      settings: settings({ extraTarget: 1000, hysaBalance: 1800 }),
      debts: debts([{ id: "last", name: "Last card", balance: 250 }]),
    });

    assert.equal(result.debts[0].balance, 0);
    assert.equal(result.toPlan, 1000);
    assert.equal(result.savingsDeposit, 750);
    assert.equal(result.settings.hysaBalance, 2550);
    assert.equal(phase(result.debts), "savings");
    assert.equal(
      result.milestone,
      "Debt-free. Every future paycheck now routes straight to savings.",
    );
    assert.equal(
      result.lines.some((line) => line.type === "save" && line.amount === 750),
      true,
    );
  });

  it("routes the whole plan pool to savings once debt is gone", () => {
    const result = routePaycheck({
      amount: 1943.5,
      settings: settings({ extraTarget: 1000, hysaBalance: 1800 }),
      debts: [],
    });

    assert.equal(result.savingsDeposit, 1000);
    assert.equal(result.settings.hysaBalance, 2800);
    assert.equal(result.debtPayments.length, 0);
    assert.equal(result.lines.some((line) => line.type === "save"), true);
  });

  it("does not persist a one-time fun override onto settings.funPercent", () => {
    const result = routePaycheck({
      amount: 1943.5,
      settings: settings({ funPercent: 10 }),
      debts: debts([{ id: "card", name: "Card", balance: 5000 }]),
      funPercentOverride: 40,
    });

    assert.equal(result.funPercentUsed, 40);
    assert.equal(result.settings.funPercent, 10);
    assert.equal(result.funAmount, 400);
    assert.equal(result.toPlan, 600);
    assert.equal(result.debts[0].balance, 4400);
  });

  it("uses settings.funPercent when the dial is left untouched", () => {
    const result = routePaycheck({
      amount: 1943.5,
      settings: settings({ funPercent: 25 }),
      debts: debts([{ id: "card", name: "Card", balance: 5000 }]),
    });

    assert.equal(result.funPercentUsed, 25);
    assert.equal(result.funAmount, 250);
    assert.equal(result.toPlan, 750);
    assert.equal(result.settings.funPercent, 25);
  });

  it("omits the fun line at 0% and sends the whole extra to the plan", () => {
    const result = routePaycheck({
      amount: 1943.5,
      settings: settings({ funPercent: 0 }),
      debts: debts([{ id: "card", name: "Card", balance: 5000 }]),
    });

    assert.equal(result.funAmount, 0);
    assert.equal(result.lines.some((line) => line.type === "fun"), false);
    assert.equal(result.toPlan, 1000);
  });

  it("sends the entire extra pool to fun at 100% without touching debt", () => {
    const result = routePaycheck({
      amount: 1943.5,
      settings: settings({ funPercent: 100 }),
      debts: debts([{ id: "card", name: "Card", balance: 5000 }]),
    });

    assert.equal(result.funAmount, 1000);
    assert.equal(result.toPlan, 0);
    assert.equal(result.debts[0].balance, 5000);
    assert.equal(result.debtPayments.length, 0);
    assert.equal(result.lines.find((line) => line.type === "fun")?.amount, 1000);
  });

  it("skips fun math when extra is $0", () => {
    const result = routePaycheck({
      amount: 943.5,
      settings: settings({ funPercent: 50 }),
      debts: debts([{ id: "card", name: "Card", balance: 5000 }]),
    });

    assert.equal(result.toPlan, 0);
    assert.equal(result.funAmount, 0);
    assert.equal(result.leftover, 0);
    assert.equal(result.lines.some((line) => line.type === "fun"), false);
  });

  it("clamps an out-of-range override before using it", () => {
    const result = routePaycheck({
      amount: 1943.5,
      settings: settings({ funPercent: 10 }),
      debts: debts([{ id: "card", name: "Card", balance: 5000 }]),
      funPercentOverride: 250,
    });

    assert.equal(result.funPercentUsed, 100);
    assert.equal(result.funAmount, 1000);
    assert.equal(result.settings.funPercent, 10);
  });

  it("does not fun-split leftover overflow", () => {
    const result = routePaycheck({
      amount: 3000,
      settings: settings({ funPercent: 50, extraTarget: 1000 }),
      debts: debts([{ id: "card", name: "Card", balance: 5000 }]),
    });

    assert.equal(result.funAmount, 500);
    assert.equal(result.toPlan, 500);
    assert.equal(result.leftover, 1056.5);
    assert.equal(result.settings.unsweptBuffer, 1056.5);
  });

  it("rounds the fun split to cents without float drift", () => {
    const result = routePaycheck({
      amount: 1100,
      settings: settings({ essentialsPerCheck: 0, extraTarget: 100, funPercent: 33 }),
      debts: debts([{ id: "card", name: "Card", balance: 5000 }]),
    });

    assert.equal(dollarsToCents(result.funAmount) + dollarsToCents(result.toPlan), 10000);
    assert.equal(result.funAmount, 33);
    assert.equal(result.toPlan, 67);
  });

  it("excludes paid-off debts from later routing", () => {
    const first = routePaycheck({
      amount: 1143.5,
      settings: settings({ extraTarget: 200 }),
      debts: debts([{ id: "card", name: "Card", balance: 200 }]),
    });
    const second = routePaycheck({
      amount: 1943.5,
      settings: { ...first.settings, extraTarget: 1000 },
      debts: first.debts,
    });

    assert.equal(first.debts[0].balance, 0);
    assert.equal(second.savingsDeposit, 1000);
    assert.equal(second.debtPayments.length, 0);
  });
});

describe("sweepBuffer", () => {
  it("is a no-op when the buffer is empty", () => {
    const result = sweepBuffer({
      settings: settings({ unsweptBuffer: 0 }),
      debts: debts([{ id: "card", name: "Card", balance: 5000 }]),
    });

    assert.equal(result.noOp, true);
    assert.equal(result.lines.length, 0);
    assert.equal(result.debts[0].balance, 5000);
  });

  it("applies the same debt-then-savings routing and zeroes the buffer", () => {
    const result = sweepBuffer({
      settings: settings({ unsweptBuffer: 400, hysaBalance: 1800 }),
      debts: debts([{ id: "card", name: "Card", balance: 150 }]),
    });

    assert.equal(result.noOp, false);
    assert.equal(result.settings.unsweptBuffer, 0);
    assert.equal(result.debts[0].balance, 0);
    assert.equal(result.toPlan, 400);
    assert.equal(result.funAmount, 0);
    assert.equal(result.savingsDeposit, 250);
    assert.equal(result.settings.hysaBalance, 2050);
    assert.equal(result.kind, "sweep");
  });

  it("does not take a fun split out of the buffer", () => {
    const result = sweepBuffer({
      settings: settings({ unsweptBuffer: 100, funPercent: 80 }),
      debts: debts([{ id: "card", name: "Card", balance: 5000 }]),
    });

    assert.equal(result.funAmount, 0);
    assert.equal(result.toPlan, 100);
    assert.equal(result.debts[0].balance, 4900);
  });
});

describe("milestoneFor", () => {
  it("returns the highest crossed threshold", () => {
    const base = settings({ hysaGoal: 10000, emergencyFundTarget: 2000 });
    assert.equal(milestoneFor(1999, base), null);
    assert.equal(
      milestoneFor(2000, base),
      "Emergency fund complete. Everything past this is pure goal savings.",
    );
    assert.equal(milestoneFor(6100, base), "Past the halfway marker.");
    assert.equal(milestoneFor(8400, base), "Getting close — worth lining up next steps now.");
    assert.equal(milestoneFor(10000, base), "Goal funded — time to move to the next step.");
  });
});

describe("previewFunSplit", () => {
  it("matches routing without mutating settings", () => {
    const current = settings({ funPercent: 10 });
    const preview = previewFunSplit(1943.5, current, 40);
    const routed = routePaycheck({
      amount: 1943.5,
      settings: current,
      debts: debts([{ id: "card", name: "Card", balance: 5000 }]),
      funPercentOverride: 40,
    });

    assert.equal(preview.funAmount, routed.funAmount);
    assert.equal(preview.toPlan, routed.toPlan);
    assert.equal(preview.leftover, routed.leftover);
    assert.equal(current.funPercent, 10);
  });
});

describe("totalDebt", () => {
  it("sums remaining balances in cents", () => {
    assert.equal(totalDebt(debts([{ id: "a", name: "A", balance: 10.1 }, { id: "b", name: "B", balance: 0.2 }])), 10.3);
  });
});

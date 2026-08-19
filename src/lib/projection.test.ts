import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BUDGET,
  PUBLISHED_PAYOFF_TARGETS,
  PUBLISHED_SAVINGS_CHECKS,
  addMonths,
  dollarsToCents,
  project,
  type ProjectionAccount,
  type ProjectionInput,
} from "./projection";

const SEED_ACCOUNTS: ProjectionAccount[] = [
  {
    id: "savor",
    name: "Capital One Savor",
    balanceCents: dollarsToCents(409.93),
    aprBps: 2700,
    minPaymentCents: dollarsToCents(25),
    priority: 1,
  },
  {
    id: "citizens",
    name: "Citizens One Personal",
    balanceCents: dollarsToCents(514.16),
    aprBps: 0,
    minPaymentCents: dollarsToCents(25),
    priority: 1,
  },
  {
    id: "amazon",
    name: "Amazon Store Card",
    balanceCents: dollarsToCents(1458.81),
    aprBps: 2700,
    minPaymentCents: dollarsToCents(35),
    priority: 2,
  },
  {
    id: "quicksilver",
    name: "Capital One Quicksilver",
    balanceCents: dollarsToCents(5648.04),
    aprBps: 2700,
    minPaymentCents: dollarsToCents(113),
    priority: 3,
  },
  {
    id: "ford",
    name: "TrueCore FCU – 2020 Ford",
    balanceCents: dollarsToCents(13815.11),
    aprBps: 799,
    minPaymentCents: dollarsToCents(296),
    priority: 5,
  },
];

function baseInput(overrides: Partial<ProjectionInput> = {}): ProjectionInput {
  return {
    accounts: SEED_ACCOUNTS,
    monthlyOutlayCents: BUDGET.publishedOutlayCents,
    savingsRateCents: BUDGET.savingsRateCents,
    startingCashCents: BUDGET.startingCashCents,
    savingsGoalCents: BUDGET.downPaymentGoalCents,
    startMonth: "2026-09",
    ...overrides,
  };
}

describe("project", () => {
  it("pays off a single no-interest account in N months", () => {
    const result = project(
      baseInput({
        accounts: [
          {
            id: "only",
            name: "Only",
            balanceCents: dollarsToCents(300),
            aprBps: 0,
            minPaymentCents: dollarsToCents(25),
            priority: 1,
          },
        ],
        monthlyOutlayCents: dollarsToCents(100),
      }),
    );

    assert.equal(result.feasible, true);
    assert.equal(result.debtFreeMonth, "2026-11");
  });

  it("marks interest-only payments as infeasible", () => {
    const result = project(
      baseInput({
        accounts: [
          {
            id: "card",
            name: "Card",
            balanceCents: dollarsToCents(10000),
            aprBps: 2400,
            minPaymentCents: dollarsToCents(200),
            priority: 1,
          },
        ],
        monthlyOutlayCents: dollarsToCents(200),
      }),
    );

    assert.equal(result.feasible, false);
    assert.equal(result.debtFreeMonth, null);
  });

  it("rolls surplus to the next priority in the same month", () => {
    const result = project(
      baseInput({
        accounts: [
          {
            id: "small",
            name: "Small",
            balanceCents: dollarsToCents(50),
            aprBps: 0,
            minPaymentCents: dollarsToCents(25),
            priority: 1,
          },
          {
            id: "large",
            name: "Large",
            balanceCents: dollarsToCents(500),
            aprBps: 0,
            minPaymentCents: dollarsToCents(25),
            priority: 2,
          },
        ],
        monthlyOutlayCents: dollarsToCents(200),
      }),
    );

    assert.equal(result.feasible, true);
    assert.equal(result.debtFreeMonth, "2026-11");
    assert.ok(result.rows[0]?.payments.some((payment) => payment.accountId === "small" && payment.paidOff));
  });

  it("matches the published 10-month payoff within $30 per month", () => {
    const result = project(baseInput());
    assert.equal(result.feasible, true);
    assert.equal(result.debtFreeMonth, "2027-06");

    for (let index = 0; index < PUBLISHED_PAYOFF_TARGETS.length; index += 1) {
      const row = result.rows[index];
      assert.ok(row, `missing row ${index + 1}`);
      const delta = Math.abs(row.endingBalanceCents - dollarsToCents(PUBLISHED_PAYOFF_TARGETS[index]));
      assert.ok(delta <= 3000, `month ${index + 1} off by $${delta / 100}`);
    }
  });

  it("matches published savings milestones at $2,400/mo after debt-free", () => {
    const result = project(baseInput());
    assert.equal(result.feasible, true);

    for (const check of PUBLISHED_SAVINGS_CHECKS) {
      const month = addMonths("2026-09", check.monthOffset);
      const row = result.rows.find((entry) => entry.month === month);
      assert.ok(row, `missing savings row ${month}`);
      const delta = Math.abs(row.cashCents - check.amountCents);
      assert.ok(delta <= 100, `${month} cash off by $${delta / 100}`);
    }
  });
});

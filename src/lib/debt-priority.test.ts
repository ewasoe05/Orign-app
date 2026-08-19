import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  comparePayoffOrder,
  contiguousPriorities,
  normalizeSeedPriorities,
  sortAccountsByPayoffOrder,
} from "./debt-priority";
import { DEBT_ACCOUNTS_SEED } from "./seed";

describe("comparePayoffOrder", () => {
  it("breaks duplicate priorities by smallest balance first", () => {
    const savor = {
      id: "a",
      priority: 1,
      current_balance: 409.93,
      is_paid_off: false,
    };
    const citizens = {
      id: "b",
      priority: 1,
      current_balance: 514.16,
      is_paid_off: false,
    };

    assert.ok(comparePayoffOrder(savor, citizens) < 0);
    assert.deepEqual(sortAccountsByPayoffOrder([citizens, savor]), [savor, citizens]);
  });
});

describe("contiguousPriorities", () => {
  it("assigns 1..n without gaps", () => {
    assert.deepEqual(contiguousPriorities(["c", "a", "b"]), [
      { id: "c", priority: 1 },
      { id: "a", priority: 2 },
      { id: "b", priority: 3 },
    ]);
  });
});

describe("normalizeSeedPriorities", () => {
  it("maps seeded accounts to priorities 1 through 5", () => {
    const normalized = normalizeSeedPriorities(DEBT_ACCOUNTS_SEED);
    assert.deepEqual(
      normalized.map((account) => account.priority),
      [1, 2, 3, 4, 5],
    );
    assert.equal(normalized[0]?.name, "Capital One Savor");
    assert.equal(normalized[1]?.name, "Citizens One Personal");
  });
});

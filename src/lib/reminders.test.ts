import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildReminders,
  clampDueDay,
  daysUntilPaymentDue,
  hasWeeklyReviewToday,
  isDismissed,
  isLastFiveDaysOfMonth,
  isQuarterEndWindow,
  isSundayLocal,
  monthScope,
  nextDueDateIso,
  paymentDueLabel,
} from "./reminders";

describe("clampDueDay", () => {
  it("clamps day 31 to the last day of short months", () => {
    assert.equal(clampDueDay(31, 2026, 2), 28);
    assert.equal(clampDueDay(31, 2026, 4), 30);
  });
});

describe("daysUntilPaymentDue", () => {
  it("counts down to the clamped due date this month", () => {
    const today = new Date(2026, 7, 12); // Aug 12
    assert.equal(daysUntilPaymentDue(15, today), 3);
    assert.equal(paymentDueLabel(15, today), "Due in 3 days");
  });

  it("rolls to next month after the due date passes", () => {
    const today = new Date(2026, 7, 20);
    assert.equal(nextDueDateIso(15, today), "2026-09-15");
  });
});

describe("isSundayLocal", () => {
  it("uses local weekday, not UTC iso date", () => {
    assert.equal(isSundayLocal(new Date(2026, 7, 16)), true); // Sun Aug 16 local
    assert.equal(isSundayLocal(new Date(2026, 7, 15)), false); // Sat Aug 15 local
  });
});

describe("buildReminders", () => {
  it("suppresses month-end banner when dismissed for the month", () => {
    const today = new Date(2026, 7, 29);
    const scope = monthScope(today);
    const reminders = buildReminders({
      today,
      dismissals: [{ reminder_key: "month_end_payment", scope }],
      habits: [],
      followUps: [],
      paidThisMonth: 0,
      debtTarget: 2000,
      debtFree: false,
      reviews: [],
      quarterlyReviewQuarters: [],
      planStartDate: "2026-09-01",
      accounts: [],
    });
    assert.equal(reminders.some((item) => item.key === "month_end_payment"), false);
  });

  it("shows Sunday review only on local Sunday", () => {
    const saturday = new Date(2026, 7, 15, 20, 0, 0);
    assert.equal(
      buildReminders({
        today: saturday,
        dismissals: [],
        habits: [],
        followUps: [],
        paidThisMonth: 0,
        debtTarget: 2000,
        debtFree: false,
        reviews: [],
        quarterlyReviewQuarters: [],
        planStartDate: "2026-09-01",
        accounts: [],
      }).some((item) => item.key === "sunday_review"),
      false,
    );

    const sunday = new Date(2026, 7, 16, 20, 0, 0);
    assert.equal(
      buildReminders({
        today: sunday,
        dismissals: [],
        habits: [],
        followUps: [],
        paidThisMonth: 0,
        debtTarget: 2000,
        debtFree: false,
        reviews: [],
        quarterlyReviewQuarters: [],
        planStartDate: "2026-09-01",
        accounts: [],
      }).some((item) => item.key === "sunday_review"),
      true,
    );
  });

  it("marks weekly review complete on local Sunday when logged", () => {
    const sunday = new Date(2026, 7, 16);
    assert.equal(
      hasWeeklyReviewToday([{ review_date: "2026-08-16" } as never], sunday),
      true,
    );
  });

  it("detects quarter-end window in the third plan month", () => {
    assert.equal(isQuarterEndWindow("2026-09-01", new Date(2026, 10, 25)), true);
    assert.equal(isQuarterEndWindow("2026-09-01", new Date(2026, 9, 15)), false);
  });

  it("respects dismissal helper", () => {
    assert.equal(
      isDismissed([{ reminder_key: "month_end_payment", scope: "2026-08" }], "month_end_payment", "2026-08"),
      true,
    );
  });

  it("flags last five days of month", () => {
    assert.equal(isLastFiveDaysOfMonth(new Date(2026, 7, 29)), true);
    assert.equal(isLastFiveDaysOfMonth(new Date(2026, 7, 20)), false);
  });
});

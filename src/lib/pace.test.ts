import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPaceStatus, prorateExpected } from "./pace";

const MONTH_START = 21846;
const MONTH_END = 19712;
const PLAN_MONTH = new Date(2026, 8, 1); // Sep 1 2026

describe("prorateExpected", () => {
  it("equals month start on a zero fraction and month end on day = daysInMonth", () => {
    assert.equal(prorateExpected(MONTH_START, MONTH_END, 0, 30), MONTH_START);
    assert.equal(prorateExpected(MONTH_START, MONTH_END, 30, 30), MONTH_END);
  });
});

describe("getPaceStatus · debt", () => {
  it("reads On track on day 1 with no payments", () => {
    const pace = getPaceStatus({
      monthStart: MONTH_START,
      monthEndTarget: MONTH_END,
      actual: MONTH_START,
      today: new Date(2026, 8, 1),
      planMonthStart: PLAN_MONTH,
    });
    assert.equal(pace.status, "on_track");
    assert.equal(pace.suppressedBehind, true);
  });

  it("still reads On track through the 5-day grace window", () => {
    const pace = getPaceStatus({
      monthStart: MONTH_START,
      monthEndTarget: MONTH_END,
      actual: MONTH_START,
      today: new Date(2026, 8, 5),
      planMonthStart: PLAN_MONTH,
    });
    assert.equal(pace.status, "on_track");
    assert.equal(pace.suppressedBehind, true);
  });

  it("reads Behind on the last day with no payments", () => {
    const pace = getPaceStatus({
      monthStart: MONTH_START,
      monthEndTarget: MONTH_END,
      actual: MONTH_START,
      today: new Date(2026, 8, 30),
      planMonthStart: PLAN_MONTH,
    });
    assert.equal(pace.status, "behind");
    assert.equal(pace.expected, MONTH_END);
  });

  it("flips to Ahead as soon as actual clears the month-end target", () => {
    const pace = getPaceStatus({
      monthStart: MONTH_START,
      monthEndTarget: MONTH_END,
      actual: MONTH_END,
      today: new Date(2026, 8, 1),
      planMonthStart: PLAN_MONTH,
    });
    assert.equal(pace.status, "ahead");
  });

  it("treats dates before the plan month as day 1", () => {
    const pace = getPaceStatus({
      monthStart: MONTH_START,
      monthEndTarget: MONTH_END,
      actual: MONTH_START,
      today: new Date(2026, 7, 19),
      planMonthStart: PLAN_MONTH,
    });
    assert.equal(pace.status, "on_track");
    assert.equal(pace.dayOfMonth, 1);
  });
});

describe("getPaceStatus · savings", () => {
  it("reads On track on day 1 when cash has not moved", () => {
    const pace = getPaceStatus({
      monthStart: 1800,
      monthEndTarget: 4200,
      actual: 1800,
      today: new Date(2027, 6, 1),
      planMonthStart: new Date(2027, 6, 1),
      direction: "higher",
    });
    assert.equal(pace.status, "on_track");
  });

  it("reads Ahead when cash already meets the month-end target", () => {
    const pace = getPaceStatus({
      monthStart: 1800,
      monthEndTarget: 4200,
      actual: 4200,
      today: new Date(2027, 6, 1),
      planMonthStart: new Date(2027, 6, 1),
      direction: "higher",
    });
    assert.equal(pace.status, "ahead");
  });
});

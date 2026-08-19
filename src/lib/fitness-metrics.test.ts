import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildStrengthChartPoints,
  computeWeeklyVolume,
  epley1RM,
  findBestRecord,
  getFitnessPhaseInfo,
  matchesExercise,
  proteinHitRate,
  shouldInsertSessionPR,
} from "./fitness-metrics";

describe("epley1RM", () => {
  it("computes Epley formula", () => {
    assert.equal(epley1RM(225, 5), 262.5);
    assert.equal(epley1RM(100, 1), 103.3);
  });
});

describe("matchesExercise", () => {
  it("matches partial exercise names", () => {
    assert.equal(matchesExercise("Back Squat", "Squat"), true);
    assert.equal(matchesExercise("Bench", "Incline Bench"), true);
    assert.equal(matchesExercise("Deadlift", "Squat"), false);
  });
});

describe("findBestRecord", () => {
  it("returns highest weight for matched exercise", () => {
    const best = findBestRecord(
      [
        { exercise: "Squat", weight: 275, reps: 1, record_date: "2026-01-01", source: "manual" },
        { exercise: "Back Squat", weight: 285, reps: 3, record_date: "2026-02-01", source: "session" },
      ],
      "Squat",
    );
    assert.equal(best?.weight, 285);
  });
});

describe("buildStrengthChartPoints", () => {
  it("tracks running PR alongside e1RM", () => {
    const points = buildStrengthChartPoints([
      { date: "2026-01-01", weight: 225, reps: 5, sets: 3 },
      { date: "2026-01-08", weight: 235, reps: 3, sets: 3 },
      { date: "2026-01-15", weight: 230, reps: 5, sets: 3 },
    ]);
    assert.equal(points.length, 3);
    assert.equal(points[0].prWeight, 225);
    assert.equal(points[1].prWeight, 235);
    assert.equal(points[2].prWeight, 235);
    assert.equal(points[1].e1rm, epley1RM(235, 3));
  });
});

describe("computeWeeklyVolume", () => {
  it("sums tonnage within week boundaries", () => {
    const anchor = new Date(2026, 7, 19); // Tue Aug 19 2026
    const weeks = computeWeeklyVolume(
      [
        { date: "2026-08-18", weight: 100, reps: 5, sets: 3 },
        { date: "2026-08-11", weight: 200, reps: 5, sets: 2 },
      ],
      4,
      anchor,
    );
    assert.equal(weeks.length, 4);
    assert.equal(weeks[3].tonnage, 1500);
    assert.equal(weeks[2].tonnage, 2000);
  });
});

describe("proteinHitRate", () => {
  it("counts days at or above target in a 7-day window", () => {
    const rate = proteinHitRate(
      [
        { log_date: "2026-08-19", protein_grams: 180 },
        { log_date: "2026-08-18", protein_grams: 160 },
        { log_date: "2026-08-17", protein_grams: 170 },
      ],
      170,
      "2026-08-19",
    );
    assert.equal(rate.hits, 2);
    assert.equal(rate.days, 7);
  });
});

describe("getFitnessPhaseInfo", () => {
  it("derives Base in month 1 and next transition", () => {
    const info = getFitnessPhaseInfo("2026-09-01", new Date(2026, 8, 15));
    assert.equal(info.phase, "Base");
    assert.equal(info.planMonth, 1);
    assert.equal(info.nextPhase, "Lean out");
    assert.equal(info.monthsUntilTransition, 6);
  });

  it("lands in Sharpen after month 18", () => {
    const info = getFitnessPhaseInfo("2026-09-01", new Date(2028, 2, 1));
    assert.equal(info.phase, "Sharpen");
    assert.equal(info.nextPhase, null);
  });
});

describe("shouldInsertSessionPR", () => {
  it("inserts when weight beats stored max", () => {
    assert.equal(
      shouldInsertSessionPR("Squat", 285, [
        { exercise: "Squat", weight: 275, reps: 1, record_date: "2026-01-01", source: "manual" },
      ]),
      true,
    );
    assert.equal(
      shouldInsertSessionPR("Squat", 275, [
        { exercise: "Squat", weight: 275, reps: 1, record_date: "2026-01-01", source: "manual" },
      ]),
      false,
    );
  });
});

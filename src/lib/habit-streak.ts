import { addDaysIso } from "@/lib/utils";

export type HabitLevel = "full" | "floor" | "missed";

/**
 * Habit streak rules (Phase 1 — never miss twice):
 * - `full` or `floor` counts as showing up. That is the point of a floor.
 * - A past day with no row counts as a miss. Today with no row is unmarked, not a miss.
 * - An explicit `missed` row is a miss.
 * - A single miss does not break the streak; it is skipped when counting.
 * - Two consecutive misses break the streak.
 * - "Don't miss twice" is true only when yesterday was a miss and the day before was not.
 */
export function isHabitHit(level: HabitLevel | undefined): boolean {
  return level === "full" || level === "floor";
}

export function isHabitMiss(
  level: HabitLevel | undefined,
  date: string,
  today: string,
): boolean {
  if (date > today) return false;
  if (isHabitHit(level)) return false;
  if (date === today && level === undefined) return false;
  return true;
}

export function neverMissTwice(levels: Map<string, HabitLevel>, today: string): boolean {
  const yesterday = addDaysIso(today, -1);
  const prior = addDaysIso(today, -2);
  return (
    isHabitMiss(levels.get(yesterday), yesterday, today) &&
    !isHabitMiss(levels.get(prior), prior, today)
  );
}

export function calcHabitStreak(levels: Map<string, HabitLevel>, today: string): number {
  let streak = 0;
  let cursor = levels.has(today) ? today : addDaysIso(today, -1);

  for (let i = 0; i < 400; i++) {
    const level = levels.get(cursor);
    if (isHabitHit(level)) {
      streak += 1;
      cursor = addDaysIso(cursor, -1);
      continue;
    }
    if (isHabitMiss(level, cursor, today)) {
      const prev = addDaysIso(cursor, -1);
      if (isHabitMiss(levels.get(prev), prev, today)) break;
      cursor = prev;
      continue;
    }
    break;
  }

  return streak;
}

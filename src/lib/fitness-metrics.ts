import { FITNESS_PHASES } from "@/content/plan";
import { addDaysIso, formatLocalDate, getWeekStartDate } from "@/lib/utils";

export type LiftSet = {
  date: string;
  weight: number;
  reps: number;
  sets: number;
};

export type PersonalRecordRow = {
  exercise: string;
  weight: number;
  reps: number;
  record_date: string;
  source: "manual" | "session";
};

/** Epley estimated 1-rep max: weight × (1 + reps/30). */
export function epley1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export function matchesExercise(a: string, b: string): boolean {
  const left = a.toLowerCase();
  const right = b.toLowerCase();
  return left.includes(right) || right.includes(left);
}

export function findBestRecord(
  records: PersonalRecordRow[],
  exercise: string,
): PersonalRecordRow | null {
  let best: PersonalRecordRow | null = null;
  for (const record of records) {
    if (!matchesExercise(record.exercise, exercise)) continue;
    if (!best || record.weight > best.weight) best = record;
  }
  return best;
}

export function aggregatePersonalRecords(records: PersonalRecordRow[]): PersonalRecordRow[] {
  const bestByKey = new Map<string, PersonalRecordRow>();
  for (const record of records) {
    const key = record.exercise.toLowerCase();
    const existing = bestByKey.get(key);
    if (!existing || record.weight > existing.weight) {
      bestByKey.set(key, record);
    }
  }
  return Array.from(bestByKey.values()).sort((a, b) => b.weight - a.weight);
}

export function isNewPRThisWeek(recordDate: string, weekStart = getWeekStartDate()): boolean {
  return recordDate >= weekStart;
}

export type StrengthChartPoint = {
  date: string;
  weight: number;
  e1rm: number;
  prWeight: number;
};

/** Session-level strength chart: raw weight, e1RM, and running true PR per date. */
export function buildStrengthChartPoints(entries: LiftSet[]): StrengthChartPoint[] {
  if (!entries.length) return [];

  const byDate = new Map<string, LiftSet>();
  for (const entry of entries) {
    const existing = byDate.get(entry.date);
    if (!existing || entry.weight > existing.weight) {
      byDate.set(entry.date, entry);
    }
  }

  const sorted = [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b));
  let runningPR = 0;

  return sorted.map(([date, entry]) => {
    runningPR = Math.max(runningPR, entry.weight);
    return {
      date,
      weight: entry.weight,
      e1rm: epley1RM(entry.weight, entry.reps),
      prWeight: runningPR,
    };
  });
}

export function computeWeeklyVolume(
  entries: LiftSet[],
  weekCount = 4,
  anchorDate = new Date(),
): { weekStart: string; tonnage: number }[] {
  const currentWeekStart = getWeekStartDate(anchorDate);
  const weeks: { weekStart: string; tonnage: number }[] = [];

  for (let i = weekCount - 1; i >= 0; i--) {
    const weekStart = addDaysIso(currentWeekStart, -7 * i);
    const weekEnd = addDaysIso(weekStart, 6);
    let tonnage = 0;

    for (const entry of entries) {
      if (entry.date >= weekStart && entry.date <= weekEnd) {
        tonnage += entry.sets * entry.reps * entry.weight;
      }
    }

    weeks.push({ weekStart, tonnage: Math.round(tonnage) });
  }

  return weeks;
}

export type ProteinHitRate = {
  hits: number;
  days: number;
  rate: number;
  dayStatuses: { date: string; hit: boolean; logged: boolean }[];
};

export function proteinHitRate(
  logs: { log_date: string; protein_grams: number | null }[],
  targetGrams: number,
  endDate = formatLocalDate(),
  windowDays = 7,
): ProteinHitRate {
  const logByDate = new Map(logs.map((log) => [log.log_date, log.protein_grams]));
  const dayStatuses: ProteinHitRate["dayStatuses"] = [];
  let hits = 0;

  for (let i = windowDays - 1; i >= 0; i--) {
    const date = addDaysIso(endDate, -i);
    const protein = logByDate.get(date);
    const logged = protein != null;
    const hit = logged && protein >= targetGrams;
    if (hit) hits++;
    dayStatuses.push({ date, hit, logged });
  }

  return {
    hits,
    days: windowDays,
    rate: windowDays > 0 ? hits / windowDays : 0,
    dayStatuses,
  };
}

export type FitnessPhaseInfo = {
  phase: string;
  phaseIndex: number;
  planMonth: number;
  nextPhase: string | null;
  nextTransitionLabel: string | null;
  monthsUntilTransition: number | null;
};

const PHASE_BOUNDARIES = [
  { name: "Base", startMonth: 1, endMonth: 6 },
  { name: "Lean out", startMonth: 7, endMonth: 12 },
  { name: "Build", startMonth: 13, endMonth: 18 },
  { name: "Sharpen", startMonth: 19, endMonth: 24 },
] as const;

export function getFitnessPhaseInfo(
  planStartDate: string,
  today = new Date(),
): FitnessPhaseInfo {
  const [year, month, day] = planStartDate.split("-").map(Number);
  const start = new Date(year, month - 1, day);
  const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
  const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  let planMonth =
    (todayMonth.getFullYear() - startMonth.getFullYear()) * 12 +
    (todayMonth.getMonth() - startMonth.getMonth()) +
    1;
  planMonth = Math.max(1, planMonth);

  let phaseIndex = PHASE_BOUNDARIES.length - 1;
  for (let i = 0; i < PHASE_BOUNDARIES.length; i++) {
    if (planMonth <= PHASE_BOUNDARIES[i].endMonth) {
      phaseIndex = i;
      break;
    }
  }

  const current = PHASE_BOUNDARIES[phaseIndex];
  const next = PHASE_BOUNDARIES[phaseIndex + 1] ?? null;
  const nextPhaseMeta = next ? FITNESS_PHASES.find((p) => p.name === next.name) : null;

  return {
    phase: current.name,
    phaseIndex,
    planMonth,
    nextPhase: next?.name ?? null,
    nextTransitionLabel: nextPhaseMeta ? `Month ${next.startMonth}` : null,
    monthsUntilTransition: next ? next.startMonth - planMonth : null,
  };
}

export function shouldInsertSessionPR(
  exercise: string,
  weight: number,
  records: PersonalRecordRow[],
): boolean {
  const best = findBestRecord(records, exercise);
  return !best || weight > best.weight;
}

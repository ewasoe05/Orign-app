export const STARTING_DEBT_TOTAL = 21846.05;

export const DEBT_ACCOUNTS_SEED = [
  {
    name: "Capital One Savor",
    initial_balance: 409.93,
    interest_rate: 27,
    priority: 1,
  },
  {
    name: "Citizens One Personal",
    initial_balance: 514.16,
    interest_rate: null,
    priority: 1,
  },
  {
    name: "Amazon Store Card",
    initial_balance: 1458.81,
    interest_rate: 27,
    priority: 2,
  },
  {
    name: "Capital One Quicksilver",
    initial_balance: 5648.04,
    interest_rate: 27,
    priority: 3,
  },
  {
    name: "TrueCore FCU – 2020 Ford",
    initial_balance: 13815.11,
    interest_rate: 7.99,
    priority: 5,
  },
] as const;

export const PAYOFF_SCHEDULE = [
  { month: 1, label: "Sep 2026", action: "Kill Savor + Citizens. Rest to Amazon.", targetRemaining: 19712 },
  { month: 2, label: "Oct 2026", action: "Kill Amazon. Rest to Quicksilver.", targetRemaining: 17542 },
  { month: 3, label: "Nov 2026", action: "All to Quicksilver", targetRemaining: 15327 },
  { month: 4, label: "Dec 2026", action: "All to Quicksilver", targetRemaining: 13068 },
  { month: 5, label: "Jan 2027", action: "Kill Quicksilver. Rest to auto.", targetRemaining: 10763 },
  { month: 6, label: "Feb 2027", action: "All to auto", targetRemaining: 8435 },
  { month: 7, label: "Mar 2027", action: "All to auto", targetRemaining: 6091 },
  { month: 8, label: "Apr 2027", action: "All to auto", targetRemaining: 3732 },
  { month: 9, label: "May 2027", action: "All to auto", targetRemaining: 1356 },
  { month: 10, label: "Jun 2027", action: "Auto paid off. Debt-free.", targetRemaining: 0 },
] as const;

export const FITNESS_SCHEDULE = [
  { day: 1, label: "Mon", focus: "Lower A — squat focus", scheduleType: "lift" as const, templateName: "Lower A" },
  { day: 2, label: "Tue", focus: "Upper A — bench focus", scheduleType: "lift" as const, templateName: "Upper A" },
  { day: 3, label: "Wed", focus: "Rest", scheduleType: "rest" as const, templateName: null },
  { day: 4, label: "Thu", focus: "Lower B — deadlift focus", scheduleType: "lift" as const, templateName: "Lower B" },
  { day: 5, label: "Fri", focus: "Upper B — overhead press focus", scheduleType: "lift" as const, templateName: "Upper B" },
  { day: 6, label: "Sat", focus: "Run", scheduleType: "run" as const, templateName: null },
  { day: 7, label: "Sun", focus: "Walk / rest", scheduleType: "rest" as const, templateName: null },
] as const;

export const DEFAULT_TEMPLATES = [
  {
    name: "Lower A",
    workout_type: "lift" as const,
    exercises: [
      { name: "Squat", sets: 4, reps: 6 },
      { name: "Romanian Deadlift", sets: 3, reps: 8 },
      { name: "Leg Press", sets: 3, reps: 10 },
      { name: "Calf Raise", sets: 3, reps: 12 },
    ],
  },
  {
    name: "Upper A",
    workout_type: "lift" as const,
    exercises: [
      { name: "Bench Press", sets: 4, reps: 6 },
      { name: "Barbell Row", sets: 3, reps: 8 },
      { name: "Incline DB Press", sets: 3, reps: 10 },
      { name: "Tricep Pushdown", sets: 3, reps: 12 },
    ],
  },
  {
    name: "Lower B",
    workout_type: "lift" as const,
    exercises: [
      { name: "Deadlift", sets: 4, reps: 5 },
      { name: "Front Squat", sets: 3, reps: 8 },
      { name: "Walking Lunges", sets: 3, reps: 10 },
      { name: "Core", sets: 3, reps: 15 },
    ],
  },
  {
    name: "Upper B",
    workout_type: "lift" as const,
    exercises: [
      { name: "Overhead Press", sets: 4, reps: 6 },
      { name: "Pull-ups", sets: 3, reps: 8 },
      { name: "Lateral Raise", sets: 3, reps: 12 },
      { name: "Curls", sets: 3, reps: 12 },
    ],
  },
] as const;

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const STRENGTH_TARGETS = [
  { exercise: "Squat", min: 275, max: 315 },
  { exercise: "Bench", min: 205, max: 225 },
  { exercise: "Deadlift", min: 355, max: 405 },
  { exercise: "Overhead Press", min: 135, max: 145 },
] as const;

export const PLAN_START_DATE = "2026-09-01";
export const PLAN_END_DATE = "2028-08-01";
export const MONTHLY_DEBT_TARGET = 2000;
export const FITNESS_WEEKLY_TARGET = 4;

export const STARTING_DEBT_TOTAL = 21846.05;

export const DEBT_ACCOUNTS_SEED = [
  {
    name: "Capital One Savor",
    initial_balance: 409.93,
    interest_rate: 27,
    min_payment: 25,
    due_day_of_month: 15,
    priority: 1,
  },
  {
    name: "Citizens One Personal",
    initial_balance: 514.16,
    interest_rate: null,
    min_payment: 25,
    due_day_of_month: 15,
    priority: 2,
  },
  {
    name: "Amazon Store Card",
    initial_balance: 1458.81,
    interest_rate: 27,
    min_payment: 35,
    due_day_of_month: 15,
    priority: 3,
  },
  {
    name: "Capital One Quicksilver",
    initial_balance: 5648.04,
    interest_rate: 27,
    min_payment: 113,
    due_day_of_month: 15,
    priority: 4,
  },
  {
    name: "TrueCore FCU – 2020 Ford",
    initial_balance: 13815.11,
    interest_rate: 7.99,
    min_payment: 296,
    due_day_of_month: 15,
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

export const SAVINGS_STARTING_CASH = 1800;
export const DOWN_PAYMENT_TARGET = 30000;
export const GOOGLE_REVIEW_TARGET = 20;
export const GOOGLE_REVIEW_DEADLINE = "2026-12-31";
export const COMMISSION_REVENUE_PER_1000 = 8300;

export const SAVINGS_MILESTONES = [
  { amount: 6000, date: "2027-08-01", label: "Aug 2027", description: "$6K emergency fund" },
  { amount: 18600, date: "2028-01-01", label: "Jan 2028", description: "$18.6K saved" },
  { amount: 30600, date: "2028-06-01", label: "Jun 2028", description: "$30.6K down payment" },
  { amount: 35400, date: "2028-08-01", label: "Aug 2028", description: "$35.4K — close on duplex" },
] as const;

export const HABIT_FLOORS = [
  { key: "training", name: "Training", description: "Full: 4 sessions. Floor: walk 10 min." },
  { key: "business", name: "Business", description: "Full: prospecting day. Floor: 3 follow-up texts." },
  { key: "money", name: "Money", description: "Full: extra payment + review. Floor: autopay runs." },
  { key: "eating", name: "Eating", description: "Full: 170g protein. Floor: one protein-heavy meal." },
] as const;

export const PROTEIN_TARGET_G = 170;
export const STARTING_WEIGHT_LBS = 183;
export const TARGET_WEIGHT_LBS = 180;

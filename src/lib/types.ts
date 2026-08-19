export type WorkoutType = "lift" | "run" | "walk" | "floor";
export type ScheduleType = "lift" | "run" | "walk" | "rest";
export type TemplateWorkoutType = "lift" | "run" | "walk";

export interface DebtAccount {
  id: string;
  user_id: string;
  name: string;
  initial_balance: number;
  current_balance: number;
  interest_rate: number | null;
  priority: number;
  is_paid_off: boolean;
  created_at: string;
}

export interface DebtPayment {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  created_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  workout_date: string;
  workout_type: WorkoutType;
  subtype: string | null;
  notes: string | null;
  template_id: string | null;
  created_at: string;
}

export interface LiftEntry {
  id: string;
  user_id: string;
  workout_id: string;
  exercise: string;
  weight: number;
  reps: number;
  sets: number;
  sort_order: number;
  created_at: string;
}

export interface RunEntry {
  id: string;
  user_id: string;
  workout_id: string;
  distance_miles: number | null;
  duration_minutes: number | null;
  created_at: string;
}

export interface WeeklyReview {
  id: string;
  user_id: string;
  review_date: string;
  debt_total: string | null;
  training_sessions: string | null;
  leads_closes: string | null;
  do_differently: string | null;
  how_doing: string | null;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  plan_start_date: string;
  monthly_debt_target: number;
  fitness_target: number;
  seeded: boolean;
  created_at: string;
}

export interface WorkoutWithDetails extends Workout {
  lift_entries: LiftEntry[];
  run_entries: RunEntry[];
}

export interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  workout_type: TemplateWorkoutType;
  is_default: boolean;
  created_at: string;
}

export interface TemplateExercise {
  id: string;
  user_id: string;
  template_id: string;
  exercise_name: string;
  default_sets: number | null;
  default_reps: number | null;
  sort_order: number;
  created_at: string;
}

export interface WorkoutTemplateWithExercises extends WorkoutTemplate {
  exercises: TemplateExercise[];
}

export interface WeeklyScheduleDay {
  id: string;
  user_id: string;
  day_of_week: number;
  schedule_type: ScheduleType;
  template_id: string | null;
  label: string | null;
  created_at: string;
}

export interface PersonalRecord {
  exercise: string;
  weight: number;
  reps: number;
  date: string;
}

export interface LastLift {
  exercise: string;
  weight: number;
  reps: number;
  sets: number;
}

export interface FitnessDashboardSummary {
  sessions: number;
  target: number;
  hasFloor: boolean;
  lastWorkoutDate: string | null;
  todayLabel: string;
  todayType: ScheduleType;
  todayTemplateId: string | null;
  weekDots: { day: number; label: string; status: "done" | "floor" | "planned" | "rest" | "empty" }[];
  prHighlight: PersonalRecord | null;
}

export type SavingsKind = "deposit" | "withdrawal";
export type LeadStatus = "open" | "won" | "lost";
export type HabitKey = "training" | "business" | "money" | "eating";
export type TrackStatus = "on_track" | "behind";

export interface SavingsSettings {
  id: string;
  user_id: string;
  starting_cash: number;
  down_payment_target: number;
  created_at: string;
}

export interface SavingsTransaction {
  id: string;
  user_id: string;
  amount: number;
  kind: SavingsKind;
  transaction_date: string;
  notes: string | null;
  created_at: string;
}

export interface SavingsSummary {
  cashOnHand: number;
  startingCash: number;
  downPaymentTarget: number;
  remainingToDownPayment: number;
  progress: number;
  nextMilestone: {
    amount: number;
    date: string;
    label: string;
    description: string;
  } | null;
}

export interface Lead {
  id: string;
  user_id: string;
  lead_date: string;
  source: string;
  service: string;
  quoted_amount: number;
  status: LeadStatus;
  why_lost: string | null;
  created_at: string;
}

export interface BusinessWeekStats {
  leads: number;
  closes: number;
  quoted: number;
  won: number;
  estimatedCommission: number;
}

export interface FollowUpItem {
  lead: Lead;
  followUpDay: 2 | 7 | 21;
  dueDate: string;
  daysUntilDue: number;
  overdue: boolean;
}

export interface GoogleReview {
  id: string;
  user_id: string;
  review_date: string;
  notes: string | null;
  created_at: string;
}

export interface HabitFloorStatus {
  key: HabitKey;
  name: string;
  description: string;
  hitToday: boolean;
  missedYesterday: boolean;
  neverMissTwice: boolean;
  streak: number;
  hitsThisWeek: number;
}

export interface QuarterlyReview {
  id: string;
  user_id: string;
  quarter: number;
  review_date: string;
  money_status: TrackStatus;
  business_status: TrackStatus;
  body_status: TrackStatus;
  what_changed: string | null;
  what_to_adjust: string | null;
  created_at: string;
}

export interface PlanChecklistItem {
  key: string;
  section: string;
  label: string;
  detail: string;
  completed: boolean;
}

export interface CreditLog {
  id: string;
  user_id: string;
  score: number;
  log_date: string;
  notes: string | null;
  created_at: string;
}

export interface BodyLog {
  id: string;
  user_id: string;
  log_date: string;
  weight_lbs: number | null;
  protein_grams: number | null;
  notes: string | null;
  created_at: string;
}

export interface PlanFacts {
  id: string;
  user_id: string;
  expenses_include_car: boolean | null;
  employment_type: string | null;
  commission_years: number | null;
  clear_solutions_trade: string | null;
}

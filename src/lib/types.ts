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

-- Fitness customization: templates, weekly schedule, lift sort order

CREATE TABLE IF NOT EXISTS workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  workout_type TEXT NOT NULL CHECK (workout_type IN ('lift', 'run', 'walk')),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS template_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES workout_templates(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  default_sets INTEGER,
  default_reps INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS weekly_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('lift', 'run', 'walk', 'rest')),
  template_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, day_of_week)
);

ALTER TABLE workouts
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL;

ALTER TABLE lift_entries
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own templates" ON workout_templates
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own template exercises" ON template_exercises
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own weekly schedule" ON weekly_schedule
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_workout_templates_user ON workout_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_template_exercises_template ON template_exercises(template_id);
CREATE INDEX IF NOT EXISTS idx_weekly_schedule_user ON weekly_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_lift_entries_exercise ON lift_entries(user_id, exercise);

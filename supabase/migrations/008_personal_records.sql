-- Phase 5: manual and session personal records with history

CREATE TABLE IF NOT EXISTS personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise TEXT NOT NULL,
  weight DECIMAL(8, 2) NOT NULL,
  reps INTEGER NOT NULL DEFAULT 1,
  record_date DATE NOT NULL,
  note TEXT,
  source TEXT NOT NULL CHECK (source IN ('manual', 'session')),
  lift_entry_id UUID REFERENCES lift_entries(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own personal records" ON personal_records;
CREATE POLICY "Users manage own personal records" ON personal_records
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_personal_records_user_exercise
  ON personal_records(user_id, exercise);

CREATE UNIQUE INDEX IF NOT EXISTS idx_personal_records_lift_entry
  ON personal_records(lift_entry_id)
  WHERE lift_entry_id IS NOT NULL;

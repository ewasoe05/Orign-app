-- Phase 7: payment due dates and dismissible reminders

ALTER TABLE debt_accounts
  ADD COLUMN IF NOT EXISTS due_day_of_month INTEGER;

ALTER TABLE debt_accounts
  DROP CONSTRAINT IF EXISTS debt_accounts_due_day_check;

ALTER TABLE debt_accounts
  ADD CONSTRAINT debt_accounts_due_day_check
  CHECK (due_day_of_month IS NULL OR (due_day_of_month >= 1 AND due_day_of_month <= 31));

UPDATE debt_accounts
SET due_day_of_month = 15
WHERE due_day_of_month IS NULL;

CREATE TABLE IF NOT EXISTS reminder_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reminder_key TEXT NOT NULL,
  scope TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, reminder_key, scope)
);

ALTER TABLE reminder_dismissals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own reminder dismissals" ON reminder_dismissals;
CREATE POLICY "Users manage own reminder dismissals" ON reminder_dismissals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reminder_dismissals_user
  ON reminder_dismissals(user_id, reminder_key, scope);

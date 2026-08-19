-- Habit floors: full | floor | missed (Phase 1)
-- Existing check-ins were a binary "showed up" tap — treat them as floor.

ALTER TABLE habit_checkins
  ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'floor';

ALTER TABLE habit_checkins
  DROP CONSTRAINT IF EXISTS habit_checkins_level_check;

ALTER TABLE habit_checkins
  ADD CONSTRAINT habit_checkins_level_check
  CHECK (level IN ('full', 'floor', 'missed'));

ALTER TABLE habit_checkins
  ADD COLUMN IF NOT EXISTS note TEXT;

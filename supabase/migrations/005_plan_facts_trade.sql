-- Safe if 004 already ran without this column
ALTER TABLE plan_facts ADD COLUMN IF NOT EXISTS clear_solutions_trade TEXT;

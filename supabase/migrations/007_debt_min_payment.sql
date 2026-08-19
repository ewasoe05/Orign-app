-- Phase 3: minimum payments drive the projection engine.

ALTER TABLE debt_accounts
  ADD COLUMN IF NOT EXISTS min_payment DECIMAL(10, 2);

UPDATE debt_accounts
SET min_payment = CASE
  WHEN name ILIKE '%Savor%' THEN 25
  WHEN name ILIKE '%Citizens%' THEN 25
  WHEN name ILIKE '%Amazon%' THEN 35
  WHEN name ILIKE '%Quicksilver%' THEN 113
  WHEN name ILIKE '%Ford%' OR name ILIKE '%TrueCore%' THEN 296
  ELSE 25
END
WHERE min_payment IS NULL;

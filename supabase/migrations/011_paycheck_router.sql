-- Paycheck Router: per-check routing settings, history, and atomic apply RPC

CREATE TABLE IF NOT EXISTS paycheck_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  essentials_per_check DECIMAL(10, 2) NOT NULL DEFAULT 943.50,
  extra_target DECIMAL(10, 2) NOT NULL DEFAULT 1000.00,
  unswept_buffer DECIMAL(10, 2) NOT NULL DEFAULT 0,
  confirmed BOOLEAN NOT NULL DEFAULT false,
  fun_percent INTEGER NOT NULL DEFAULT 0,
  fun_allocated_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  emergency_fund_target DECIMAL(10, 2) NOT NULL DEFAULT 6000.00,
  milestone_mid_percent DECIMAL(5, 2) NOT NULL DEFAULT 61,
  milestone_near_percent DECIMAL(5, 2) NOT NULL DEFAULT 84,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT paycheck_settings_fun_percent_check
    CHECK (fun_percent >= 0 AND fun_percent <= 100),
  CONSTRAINT paycheck_settings_essentials_check
    CHECK (essentials_per_check >= 0),
  CONSTRAINT paycheck_settings_extra_target_check
    CHECK (extra_target >= 0),
  CONSTRAINT paycheck_settings_buffer_check
    CHECK (unswept_buffer >= 0),
  CONSTRAINT paycheck_settings_fun_total_check
    CHECK (fun_allocated_total >= 0),
  CONSTRAINT paycheck_settings_emergency_check
    CHECK (emergency_fund_target >= 0),
  CONSTRAINT paycheck_settings_mid_pct_check
    CHECK (milestone_mid_percent >= 0 AND milestone_mid_percent <= 100),
  CONSTRAINT paycheck_settings_near_pct_check
    CHECK (milestone_near_percent >= 0 AND milestone_near_percent <= 100)
);

CREATE TABLE IF NOT EXISTS paycheck_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('paycheck', 'sweep')),
  entry_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  essentials DECIMAL(10, 2) NOT NULL DEFAULT 0,
  to_plan DECIMAL(10, 2) NOT NULL DEFAULT 0,
  fun_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  fun_percent_used INTEGER NOT NULL DEFAULT 0,
  leftover DECIMAL(10, 2) NOT NULL DEFAULT 0,
  milestone TEXT,
  lines JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT paycheck_entries_fun_percent_check
    CHECK (fun_percent_used >= 0 AND fun_percent_used <= 100)
);

ALTER TABLE paycheck_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE paycheck_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own paycheck settings" ON paycheck_settings;
CREATE POLICY "Users manage own paycheck settings" ON paycheck_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own paycheck entries" ON paycheck_entries;
CREATE POLICY "Users manage own paycheck entries" ON paycheck_entries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_paycheck_settings_user ON paycheck_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_paycheck_entries_user_date
  ON paycheck_entries(user_id, entry_date DESC, created_at DESC);

-- Applies a precomputed routing result in one transaction so balances cannot
-- land half-updated. The TypeScript engine owns the rule; this only persists.
CREATE OR REPLACE FUNCTION apply_paycheck_result(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  entry jsonb;
  settings_patch jsonb;
  debt_update jsonb;
  debt_payment jsonb;
  savings jsonb;
  account_id uuid;
  rows_updated integer;
  i integer;
  debt_updates jsonb;
  debt_payments jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  entry := payload->'entry';
  settings_patch := payload->'settings';

  IF entry IS NULL OR entry = 'null'::jsonb THEN
    RAISE EXCEPTION 'Missing paycheck entry';
  END IF;

  IF settings_patch IS NULL OR settings_patch = 'null'::jsonb THEN
    RAISE EXCEPTION 'Missing paycheck settings patch';
  END IF;

  INSERT INTO paycheck_entries (
    user_id,
    kind,
    entry_date,
    amount,
    essentials,
    to_plan,
    fun_amount,
    fun_percent_used,
    leftover,
    milestone,
    lines
  ) VALUES (
    uid,
    entry->>'kind',
    (entry->>'entry_date')::date,
    (entry->>'amount')::numeric,
    (entry->>'essentials')::numeric,
    (entry->>'to_plan')::numeric,
    (entry->>'fun_amount')::numeric,
    (entry->>'fun_percent_used')::integer,
    (entry->>'leftover')::numeric,
    NULLIF(entry->>'milestone', ''),
    COALESCE(entry->'lines', '[]'::jsonb)
  );

  debt_updates := COALESCE(payload->'debt_updates', '[]'::jsonb);
  IF jsonb_typeof(debt_updates) = 'array' THEN
    FOR i IN 0 .. jsonb_array_length(debt_updates) - 1 LOOP
      debt_update := debt_updates->i;

      UPDATE debt_accounts
      SET
        current_balance = (debt_update->>'current_balance')::numeric,
        is_paid_off = (debt_update->>'is_paid_off')::boolean
      WHERE id = (debt_update->>'id')::uuid
        AND user_id = uid;

      GET DIAGNOSTICS rows_updated = ROW_COUNT;
      IF rows_updated = 0 THEN
        RAISE EXCEPTION 'Debt account not found';
      END IF;
    END LOOP;
  END IF;

  debt_payments := COALESCE(payload->'debt_payments', '[]'::jsonb);
  IF jsonb_typeof(debt_payments) = 'array' THEN
    FOR i IN 0 .. jsonb_array_length(debt_payments) - 1 LOOP
      debt_payment := debt_payments->i;
    account_id := (debt_payment->>'account_id')::uuid;

    IF NOT EXISTS (
      SELECT 1 FROM debt_accounts
      WHERE id = account_id AND user_id = uid
    ) THEN
      RAISE EXCEPTION 'Debt account not found';
    END IF;

    INSERT INTO debt_payments (user_id, account_id, amount, payment_date, notes)
    VALUES (
      uid,
      account_id,
      (debt_payment->>'amount')::numeric,
      (debt_payment->>'payment_date')::date,
      debt_payment->>'notes'
    );
    END LOOP;
  END IF;

  savings := payload->'savings_deposit';
  IF savings IS NOT NULL AND savings <> 'null'::jsonb THEN
    INSERT INTO savings_transactions (user_id, amount, kind, transaction_date, notes)
    VALUES (
      uid,
      (savings->>'amount')::numeric,
      'deposit',
      (savings->>'transaction_date')::date,
      savings->>'notes'
    );
  END IF;

  UPDATE paycheck_settings
  SET
    unswept_buffer = (settings_patch->>'unswept_buffer')::numeric,
    fun_allocated_total = (settings_patch->>'fun_allocated_total')::numeric
  WHERE user_id = uid;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  IF rows_updated = 0 THEN
    RAISE EXCEPTION 'Paycheck settings not found';
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION apply_paycheck_result(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION apply_paycheck_result(jsonb) TO authenticated;

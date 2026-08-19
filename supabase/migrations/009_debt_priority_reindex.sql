-- Phase 6: unique contiguous payoff priorities per user

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY priority ASC, current_balance ASC, id ASC
    ) AS new_priority
  FROM debt_accounts
)
UPDATE debt_accounts AS da
SET priority = ranked.new_priority
FROM ranked
WHERE da.id = ranked.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_debt_accounts_user_priority
  ON debt_accounts(user_id, priority);

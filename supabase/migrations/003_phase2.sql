-- Phase 2: savings, business leads, habit floors, quarterly checkpoints

CREATE TABLE IF NOT EXISTS savings_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  starting_cash DECIMAL(10, 2) NOT NULL DEFAULT 1800,
  down_payment_target DECIMAL(10, 2) NOT NULL DEFAULT 30000,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS savings_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('deposit', 'withdrawal')),
  transaction_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lead_date DATE NOT NULL,
  source TEXT NOT NULL,
  service TEXT NOT NULL,
  quoted_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
  why_lost TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS google_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  review_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS habit_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_key TEXT NOT NULL CHECK (habit_key IN ('training', 'business', 'money', 'eating')),
  checkin_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, habit_key, checkin_date)
);

CREATE TABLE IF NOT EXISTS quarterly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 8),
  review_date DATE NOT NULL,
  money_status TEXT NOT NULL CHECK (money_status IN ('on_track', 'behind')),
  business_status TEXT NOT NULL CHECK (business_status IN ('on_track', 'behind')),
  body_status TEXT NOT NULL CHECK (body_status IN ('on_track', 'behind')),
  what_changed TEXT,
  what_to_adjust TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE savings_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own savings settings" ON savings_settings;
CREATE POLICY "Users manage own savings settings" ON savings_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own savings transactions" ON savings_transactions;
CREATE POLICY "Users manage own savings transactions" ON savings_transactions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own leads" ON leads;
CREATE POLICY "Users manage own leads" ON leads
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own google reviews" ON google_reviews;
CREATE POLICY "Users manage own google reviews" ON google_reviews
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own habit checkins" ON habit_checkins;
CREATE POLICY "Users manage own habit checkins" ON habit_checkins
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own quarterly reviews" ON quarterly_reviews;
CREATE POLICY "Users manage own quarterly reviews" ON quarterly_reviews
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_savings_transactions_user_date
  ON savings_transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_leads_user_date ON leads(user_id, lead_date);
CREATE INDEX IF NOT EXISTS idx_leads_user_status ON leads(user_id, status);
CREATE INDEX IF NOT EXISTS idx_google_reviews_user ON google_reviews(user_id, review_date);
CREATE INDEX IF NOT EXISTS idx_habit_checkins_user_date
  ON habit_checkins(user_id, checkin_date);
CREATE INDEX IF NOT EXISTS idx_quarterly_reviews_user
  ON quarterly_reviews(user_id, quarter);

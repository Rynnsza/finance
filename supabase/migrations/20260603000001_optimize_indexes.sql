-- Optimize indexes & RLS for query performance

-- 1. Missing indexes for common query patterns

CREATE INDEX IF NOT EXISTS idx_transactions_user_category
  ON transactions(user_id, category_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_account
  ON transactions(user_id, account_id);

CREATE INDEX IF NOT EXISTS idx_recurring_user_next_date
  ON recurring_transactions(user_id, next_date);

-- 2. RLS consistency: use is_my_partner() helper instead of raw subquery
--    This is cleaner and avoids re-planning the subquery per row.

DROP POLICY IF EXISTS "users_can_select_own_accounts" ON accounts;
CREATE POLICY "users_can_select_own_accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id OR public.is_my_partner(user_id));

DROP POLICY IF EXISTS "Users can view own bills" ON bills;
CREATE POLICY "Users can view own bills"
  ON bills FOR SELECT
  USING (auth.uid() = user_id OR public.is_my_partner(user_id));

-- Performance tuning and RLS consistency based on Supabase best practices

-- 1. Optimized auth.uid() wrapper
-- Using a stable function to access JWT claims can be faster than repeated auth.uid() calls in complex RLS.
CREATE OR REPLACE FUNCTION public.auth_uid() 
RETURNS uuid 
LANGUAGE sql 
STABLE
AS $$
  SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid;
$$;

-- 2. Foreign Key Indexes (Leading Column)
-- Ensures that deletions and certain join patterns are efficient.
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_bills_paid_with_account_id ON public.bills(paid_with_account_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_category_id ON public.recurring_transactions(category_id);

-- 3. JSONB GIN Indexes
-- Speeds up queries that filter or search within JSONB columns.
CREATE INDEX IF NOT EXISTS idx_activity_logs_metadata_gin ON public.activity_logs USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_transactions_splits_gin ON public.transactions USING GIN (splits);

-- 4. Exchange Rates Optimization
-- Add index for fast lookup by target_currency (used in conversion RPC)
CREATE INDEX IF NOT EXISTS idx_exchange_rates_target_currency ON public.exchange_rates(target_currency);

-- 5. Optimized RPCs: get_transaction_summary & get_category_stats
-- Replaced per-row subqueries with a JOIN/CTE approach and added security checks.
CREATE OR REPLACE FUNCTION public.get_transaction_summary(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_target_currency TEXT DEFAULT 'IDR'
)
RETURNS TABLE (
  total_income NUMERIC,
  total_expense NUMERIC,
  balance NUMERIC
) AS $$
DECLARE
  v_target_rate NUMERIC;
BEGIN
  -- Security Check
  IF p_user_id <> auth.uid() AND NOT public.is_my_partner(p_user_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get target currency rate once
  SELECT rate INTO v_target_rate FROM public.exchange_rates WHERE target_currency = p_target_currency;
  v_target_rate := COALESCE(v_target_rate, 1);

  RETURN QUERY
  WITH converted_transactions AS (
    SELECT 
      t.type,
      CASE 
        WHEN t.currency = p_target_currency THEN t.amount
        ELSE t.amount / COALESCE(er.rate, 1) * v_target_rate
      END as converted_amount
    FROM public.transactions t
    LEFT JOIN public.exchange_rates er ON er.target_currency = t.currency
    WHERE t.user_id = p_user_id 
      AND t.date >= p_start_date
      AND t.date <= p_end_date
  )
  SELECT 
    COALESCE(SUM(converted_amount) FILTER (WHERE type = 'income'), 0),
    COALESCE(SUM(converted_amount) FILTER (WHERE type = 'expense'), 0),
    COALESCE(SUM(converted_amount) FILTER (WHERE type = 'income'), 0) - 
    COALESCE(SUM(converted_amount) FILTER (WHERE type = 'expense'), 0)
  FROM converted_transactions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_category_stats(
  p_user_id UUID,
  p_start_date DATE DEFAULT '1970-01-01',
  p_end_date DATE DEFAULT '9999-12-31'
)
RETURNS TABLE (
  category_id UUID,
  transaction_count BIGINT,
  total_amount NUMERIC
) AS $$
BEGIN
  -- Security Check
  IF p_user_id <> auth.uid() AND NOT public.is_my_partner(p_user_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT 
    t.category_id,
    COUNT(*),
    SUM(t.amount)
  FROM public.transactions t
  WHERE t.user_id = p_user_id
    AND t.date >= p_start_date
    AND t.date <= p_end_date
    AND t.category_id IS NOT NULL
  GROUP BY t.category_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. RLS Optimizations & Partner Sharing Consistency

-- Profiles: Simplify and optimize using is_my_partner
DROP POLICY IF EXISTS "Users can view own and partner's profile" ON public.profiles;
CREATE POLICY "Users can view own and partner's profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_my_partner(id));

-- Budgets: Optimize and ensure consistency
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Partner can read budgets" ON public.budgets;
CREATE POLICY "Users can view own and partner's budgets"
  ON public.budgets FOR SELECT
  USING (auth.uid() = user_id OR public.is_my_partner(user_id));

-- Transactions: Consistency fix - allow partners to SELECT (View)
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view own and partner's transactions" ON public.transactions;
CREATE POLICY "Users can view own and partner's transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id OR public.is_my_partner(user_id));

-- Categories: Allow partners to see categories
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can view own and partner's categories" ON public.categories;
CREATE POLICY "Users can view own and partner's categories"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id OR public.is_my_partner(user_id));

-- Goals: Consistency check
DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can view own and partner's goals" ON public.goals;
CREATE POLICY "Users can view own and partner's goals"
  ON public.goals FOR SELECT
  USING (auth.uid() = user_id OR public.is_my_partner(user_id));


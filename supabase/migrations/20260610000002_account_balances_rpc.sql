-- RPC to get account balances calculated server-side
-- Replaces the client-side aggregation in queryAccountBalances
-- Handles thousands of transactions efficiently

CREATE OR REPLACE FUNCTION public.get_account_balances(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  color TEXT,
  icon TEXT,
  initial_balance NUMERIC,
  currency TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  balance NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Security check: caller must be the user or their partner
  IF p_user_id <> auth.uid() AND NOT public.is_my_partner(p_user_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT
    a.id,
    a.name,
    a.type,
    a.color,
    a.icon,
    a.initial_balance,
    a.currency,
    a.user_id,
    a.created_at,
    a.updated_at,
    COALESCE(a.initial_balance, 0) + COALESCE(
      (
        SELECT SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END)
        FROM public.transactions t
        WHERE t.account_id = a.id
      ),
      0
    ) AS balance
  FROM public.accounts a
  WHERE a.user_id = p_user_id
  ORDER BY a.created_at;
END;
$$;

-- Function to get transaction statistics per category
-- Returns count and total amount per category for a user within a time range

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

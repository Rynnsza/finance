-- Function to get transaction summary for a user
-- Handles multiple currencies by converting to a target currency using exchange_rates table

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
  v_income NUMERIC := 0;
  v_expense NUMERIC := 0;
BEGIN
  -- Sum income
  SELECT COALESCE(SUM(
    CASE 
      WHEN t.currency = p_target_currency THEN t.amount
      ELSE 
        -- Conversion logic: amount / rate_from * rate_to
        -- Since exchange_rates is target_currency -> rate (base IDR)
        -- We divide by rate of from_currency to get IDR, then multiply by rate of target_currency
        t.amount / (SELECT rate FROM public.exchange_rates WHERE target_currency = t.currency) * 
        (SELECT rate FROM public.exchange_rates WHERE target_currency = p_target_currency)
    END
  ), 0)
  INTO v_income
  FROM public.transactions t
  WHERE t.user_id = p_user_id 
    AND t.type = 'income'
    AND t.date >= p_start_date
    AND t.date <= p_end_date;

  -- Sum expense
  SELECT COALESCE(SUM(
    CASE 
      WHEN t.currency = p_target_currency THEN t.amount
      ELSE 
        t.amount / (SELECT rate FROM public.exchange_rates WHERE target_currency = t.currency) * 
        (SELECT rate FROM public.exchange_rates WHERE target_currency = p_target_currency)
    END
  ), 0)
  INTO v_expense
  FROM public.transactions t
  WHERE t.user_id = p_user_id 
    AND t.type = 'expense'
    AND t.date >= p_start_date
    AND t.date <= p_end_date;

  total_income := v_income;
  total_expense := v_expense;
  balance := v_income - v_expense;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Database Indexing Optimizations

-- 1. Composite index for the most frequent query pattern: user's transactions sorted by date
-- This covers the dashboard, transaction list, and any filtering that includes user_id and date.
CREATE INDEX IF NOT EXISTS idx_transactions_user_date_desc 
  ON public.transactions(user_id, date DESC, created_at DESC);

-- 2. Enable trigram extension for efficient text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 3. GIST index for fast fuzzy searching on description
-- This speeds up ILIKE '%term%' queries used in searchTransactions.
CREATE INDEX IF NOT EXISTS idx_transactions_description_trgm 
  ON public.transactions USING GIST (description gist_trgm_ops);

-- 4. Index for recurring transactions processing
-- Speeds up the query that finds due recurring transactions.
-- Note: table was renamed from recurring → recurring_transactions in migration 20260525000000
CREATE INDEX IF NOT EXISTS idx_recurring_user_active_next_date
  ON public.recurring_transactions(user_id, active, next_date);

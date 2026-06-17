-- Multiple budgets per category: add optional name, drop unique constraint

-- 1. Add optional name column
alter table public.budgets add column if not exists name text;

-- 2. Drop the unique index that enforces one-budget-per-category-per-month
drop index if exists idx_budgets_user_category_month;

-- Note: idx_budgets_user_month and idx_budgets_category remain for query perf

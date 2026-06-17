-- Couple Collaboration: Update RLS policies on all data tables
-- Partners can SELECT each other's data (read-only), but only the owner can INSERT/UPDATE/DELETE

-- ============================================================
-- 1. TRANSACTIONS
-- ============================================================

-- Drop old policies
drop policy if exists "Users can view own transactions" on public.transactions;
drop policy if exists "Users can insert own transactions" on public.transactions;
drop policy if exists "Users can update own transactions" on public.transactions;
drop policy if exists "Users can delete own transactions" on public.transactions;

-- Select: own OR partner's
create policy "Users can view own and partner's transactions"
  on public.transactions for select
  using (
    auth.uid() = user_id
    or public.is_my_partner(user_id)
  );

-- Insert: own only
create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

-- Update: own only
create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Delete: own only
create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 2. CATEGORIES
-- ============================================================

drop policy if exists "Users can view own categories" on public.categories;
drop policy if exists "Users can insert own categories" on public.categories;
drop policy if exists "Users can update own categories" on public.categories;
drop policy if exists "Users can delete own categories" on public.categories;

create policy "Users can view own and partner's categories"
  on public.categories for select
  using (
    auth.uid() = user_id
    or public.is_my_partner(user_id)
  );

create policy "Users can insert own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on public.categories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 3. RECURRING TRANSACTIONS
-- ============================================================

drop policy if exists "Users can view own recurring transactions" on public.recurring_transactions;
drop policy if exists "Users can insert own recurring transactions" on public.recurring_transactions;
drop policy if exists "Users can update own recurring transactions" on public.recurring_transactions;
drop policy if exists "Users can delete own recurring transactions" on public.recurring_transactions;

create policy "Users can view own and partner's recurring"
  on public.recurring_transactions for select
  using (
    auth.uid() = user_id
    or public.is_my_partner(user_id)
  );

create policy "Users can insert own recurring"
  on public.recurring_transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own recurring"
  on public.recurring_transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own recurring"
  on public.recurring_transactions for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 4. TODOS
-- ============================================================

drop policy if exists "Users can view own todos" on public.todos;
drop policy if exists "Users can insert own todos" on public.todos;
drop policy if exists "Users can update own todos" on public.todos;
drop policy if exists "Users can delete own todos" on public.todos;

create policy "Users can view own and partner's todos"
  on public.todos for select
  using (
    auth.uid() = user_id
    or public.is_my_partner(user_id)
  );

create policy "Users can insert own todos"
  on public.todos for insert
  with check (auth.uid() = user_id);

create policy "Users can update own todos"
  on public.todos for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own todos"
  on public.todos for delete
  using (auth.uid() = user_id);

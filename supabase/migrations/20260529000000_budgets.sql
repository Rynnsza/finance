-- Create budgets table
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  month date not null, -- first day of the month (e.g. '2026-06-01')
  amount numeric not null check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique constraint: one budget per category per month per user
create unique index idx_budgets_user_category_month
  on public.budgets (user_id, category_id, month);

-- Index for listing budgets by user + month
create index idx_budgets_user_month
  on public.budgets (user_id, month);

-- Index for joining with categories
create index idx_budgets_category
  on public.budgets (category_id);

-- Enable RLS
alter table public.budgets enable row level security;

-- RLS: user can CRUD own budgets
create policy "Users can view own budgets"
  on public.budgets for select
  using (auth.uid() = user_id);

create policy "Users can insert own budgets"
  on public.budgets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own budgets"
  on public.budgets for update
  using (auth.uid() = user_id);

create policy "Users can delete own budgets"
  on public.budgets for delete
  using (auth.uid() = user_id);

-- RLS: partner can read
create policy "Partner can read budgets"
  on public.budgets for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and partner_id = budgets.user_id
    )
  );

-- Auto-update updated_at
create trigger on_budgets_updated
  before update on public.budgets
  for each row
  execute function public.handle_updated_at();

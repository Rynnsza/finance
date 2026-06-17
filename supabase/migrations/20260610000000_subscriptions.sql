-- Subscriptions Table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null,
  currency text not null default 'IDR',
  billing_cycle text not null check (billing_cycle in ('weekly', 'monthly', 'yearly')),
  next_billing_date date not null,
  category_id uuid references public.categories(id) on delete set null,
  account_id uuid references public.accounts(id) on delete set null,
  active boolean not null default true,
  reminder_days integer not null default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- Policies
create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own subscriptions"
  on public.subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can delete own subscriptions"
  on public.subscriptions for delete
  using (auth.uid() = user_id);

-- Updated At Trigger
create trigger on_subscriptions_updated
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- Index
create index idx_subscriptions_user_id on public.subscriptions(user_id);

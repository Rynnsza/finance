-- Finance Tracker Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/zgiirfsdfklwtwxqfyhr/sql)

-- 1. Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  currency text default 'IDR',
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text,
  color text default '#6366f1',
  type text not null check (type in ('income', 'expense')),
  created_at timestamptz default now()
);

alter table public.categories enable row level security;

create policy "Users can view own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- 3. Transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null default 0,
  currency text default 'IDR',
  description text,
  date date not null default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Index for faster queries
create index if not exists idx_transactions_user_date
  on public.transactions(user_id, date desc);

create index if not exists idx_transactions_user_type
  on public.transactions(user_id, type);

-- 4. Recurring
create table if not exists public.recurring (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null default 0,
  currency text default 'IDR',
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  next_date date not null,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.recurring enable row level security;

create policy "Users can view own recurring"
  on public.recurring for select
  using (auth.uid() = user_id);

create policy "Users can insert own recurring"
  on public.recurring for insert
  with check (auth.uid() = user_id);

create policy "Users can update own recurring"
  on public.recurring for update
  using (auth.uid() = user_id);

create policy "Users can delete own recurring"
  on public.recurring for delete
  using (auth.uid() = user_id);

create index if not exists idx_recurring_user_active
  on public.recurring(user_id, active);

-- 5. Todos
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  is_complete boolean default false,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.todos enable row level security;

create policy "Users can view own todos"
  on public.todos for select
  using (auth.uid() = user_id);

create policy "Users can insert own todos"
  on public.todos for insert
  with check (auth.uid() = user_id);

create policy "Users can update own todos"
  on public.todos for update
  using (auth.uid() = user_id);

create policy "Users can delete own todos"
  on public.todos for delete
  using (auth.uid() = user_id);

create index if not exists idx_todos_user_priority
  on public.todos(user_id, priority desc);

create index if not exists idx_todos_user_created
  on public.todos(user_id, created_at desc);

-- 14. Activity Logs
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.activity_logs enable row level security;

create policy "Users can view own activity logs"
  on public.activity_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own activity logs"
  on public.activity_logs for insert
  with check (auth.uid() = user_id);

create index if not exists idx_activity_logs_user_created
  on public.activity_logs(user_id, created_at desc);

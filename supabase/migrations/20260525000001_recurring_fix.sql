-- Ensure recurring_transactions table exists
-- Handles case where previous migration may have partially failed

-- If old 'recurring' table still exists, rename it
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'recurring'
  ) then
    alter table public.recurring rename to recurring_transactions;
  end if;
end $$;

-- Create table if neither exists
create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null default 0,
  currency text default 'IDR',
  description text,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  next_date date not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- Add description column if missing
alter table public.recurring_transactions add column if not exists description text;
alter table public.recurring_transactions add column if not exists name text;

-- Copy name to description, then drop name
update public.recurring_transactions set description = name where description is null and name is not null;
alter table public.recurring_transactions drop column if exists name;

-- RLS
alter table public.recurring_transactions enable row level security;

-- Recreate policies (drop first to avoid duplicates)
do $$
begin
  drop policy if exists "Users can view own recurring" on public.recurring_transactions;
  exception when others then null;
end $$;

do $$
begin
  drop policy if exists "Users can view own recurring transactions" on public.recurring_transactions;
  exception when others then null;
end $$;

create policy "Users can view own recurring transactions"
  on public.recurring_transactions for select
  using (auth.uid() = user_id);

do $$
begin
  drop policy if exists "Users can insert own recurring" on public.recurring_transactions;
  exception when others then null;
end $$;

do $$
begin
  drop policy if exists "Users can insert own recurring transactions" on public.recurring_transactions;
  exception when others then null;
end $$;

create policy "Users can insert own recurring transactions"
  on public.recurring_transactions for insert
  with check (auth.uid() = user_id);

do $$
begin
  drop policy if exists "Users can update own recurring" on public.recurring_transactions;
  exception when others then null;
end $$;

do $$
begin
  drop policy if exists "Users can update own recurring transactions" on public.recurring_transactions;
  exception when others then null;
end $$;

create policy "Users can update own recurring transactions"
  on public.recurring_transactions for update
  using (auth.uid() = user_id);

do $$
begin
  drop policy if exists "Users can delete own recurring" on public.recurring_transactions;
  exception when others then null;
end $$;

do $$
begin
  drop policy if exists "Users can delete own recurring transactions" on public.recurring_transactions;
  exception when others then null;
end $$;

create policy "Users can delete own recurring transactions"
  on public.recurring_transactions for delete
  using (auth.uid() = user_id);

-- Index
create index if not exists idx_recurring_transactions_user_active
  on public.recurring_transactions(user_id, active);

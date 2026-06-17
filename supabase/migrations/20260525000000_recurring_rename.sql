-- Rename recurring to recurring_transactions and add description column
alter table if exists public.recurring
  rename to recurring_transactions;

alter table public.recurring_transactions
  add column if not exists description text;

-- Copy existing name data to description if name exists and description is null
update public.recurring_transactions
  set description = name
  where description is null and name is not null;

-- Drop name column since frontend uses description
alter table public.recurring_transactions
  drop column if exists name;

-- Update RLS policies
alter table public.recurring_transactions enable row level security;

drop policy if exists "Users can view own recurring" on public.recurring_transactions;
create policy "Users can view own recurring transactions"
  on public.recurring_transactions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own recurring" on public.recurring_transactions;
create policy "Users can insert own recurring transactions"
  on public.recurring_transactions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own recurring" on public.recurring_transactions;
create policy "Users can update own recurring transactions"
  on public.recurring_transactions for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own recurring" on public.recurring_transactions;
create policy "Users can delete own recurring transactions"
  on public.recurring_transactions for delete
  using (auth.uid() = user_id);

-- Recreate index
drop index if exists idx_recurring_user_active;
create index if not exists idx_recurring_user_active
  on public.recurring_transactions(user_id, active);

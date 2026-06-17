-- Create bills table
create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric not null check (amount >= 0),
  due_date date not null,
  is_paid boolean default false,
  recurrence text not null default 'none' check (recurrence in ('none', 'weekly', 'monthly')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for listing bills by due date
create index idx_bills_user_due_date
  on public.bills (user_id, due_date);

-- Index for filtering paid/unpaid bills
create index idx_bills_user_paid
  on public.bills (user_id, is_paid);

-- Enable RLS
alter table public.bills enable row level security;

-- RLS: user can CRUD own bills
create policy "Users can view own bills"
  on public.bills for select
  using (
    auth.uid() = user_id
    or auth.uid() in (
      select partner_id from public.profiles where id = auth.uid()
    )
  );

create policy "Users can insert own bills"
  on public.bills for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bills"
  on public.bills for update
  using (auth.uid() = user_id);

create policy "Users can delete own bills"
  on public.bills for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create trigger on_bills_updated
  before update on public.bills
  for each row
  execute function public.handle_updated_at();

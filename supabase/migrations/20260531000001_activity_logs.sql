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

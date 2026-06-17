-- 5. Todos
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  is_complete boolean default false,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
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

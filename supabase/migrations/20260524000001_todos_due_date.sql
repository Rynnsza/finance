-- Add due_date to todos
alter table public.todos add column if not exists due_date date;
